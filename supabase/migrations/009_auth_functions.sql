-- Migration: 009_auth_functions.sql
-- Purpose: Defines all functions for user authentication, authorization, and profile management.

-- =============================================================================
-- AUTH PROVIDER FUNCTIONS
-- =============================================================================

-- Function to get provider from raw_app_meta_data
CREATE OR REPLACE FUNCTION private.get_auth_provider(app_meta_data JSONB)
RETURNS TEXT AS $$
DECLARE
    provider TEXT;
BEGIN
    -- Try to get provider from app_meta_data first
    provider := app_meta_data->>'provider';
    
    -- If not found or not a valid provider, default to 'EMAIL'
    IF provider IS NULL OR provider = '' THEN
        RETURN 'EMAIL';
    END IF;
    
    -- Map common OAuth provider names to match our enum values
    -- Note: All values must be in the construction_mgr.auth_provider enum ('GOOGLE', 'FACEBOOK', 'LINKEDIN', 'AUTH0', 'EMAIL')
    CASE LOWER(provider)
        WHEN 'google' THEN RETURN 'GOOGLE';
        WHEN 'facebook' THEN RETURN 'FACEBOOK';
        WHEN 'linkedin' THEN RETURN 'LINKEDIN';
        WHEN 'linkedin_oidc' THEN RETURN 'LINKEDIN'; -- Map LinkedIn OIDC to LINKEDIN
        WHEN 'auth0' THEN RETURN 'AUTH0';
        -- Map any other providers to EMAIL as a fallback since we don't have them in our enum
        WHEN 'azure' THEN RETURN 'EMAIL';
        WHEN 'github' THEN RETURN 'EMAIL';
        WHEN 'twitter' THEN RETURN 'EMAIL';
        WHEN 'apple' THEN RETURN 'EMAIL';
        ELSE RETURN 'EMAIL';
    END CASE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'EMAIL';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Simple admin check available early in the migration order
CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM construction_mgr.be_project_member
        WHERE user_id = auth.uid() AND role = 'ADMIN'::construction_mgr.user_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- USER SYNC FUNCTIONS
-- =============================================================================

-- Function to sync new auth users to be_user table
CREATE OR REPLACE FUNCTION construction_mgr.sync_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
    provider TEXT;
    first_name TEXT;
    last_name TEXT;
    full_name TEXT;
    company_name TEXT;
    phone TEXT;
    name_parts TEXT[];
    user_meta JSONB;
    app_meta JSONB;
BEGIN
    -- Only handle INSERT operations
    IF TG_OP <> 'INSERT' THEN
        RETURN NEW;
    END IF;
    
    -- Get metadata and ensure it's valid JSONB
    BEGIN
        user_meta := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
    EXCEPTION WHEN OTHERS THEN
        -- Handle invalid JSONB
        user_meta := '{}'::jsonb;
        
        -- Log the error
        INSERT INTO construction_mgr.be_audit_log (
            action, entity_type, entity_id, details
        ) VALUES (
            'AUTH_SYNC_WARNING', 'user', NEW.id,
            jsonb_build_object(
                'error_code', SQLSTATE,
                'error_message', 'Invalid raw_user_meta_data format: ' || SQLERRM,
                'operation', 'PARSE_METADATA',
                'user_id', COALESCE(NEW.id::text, 'unknown')
            )
        );
    END;
    
    BEGIN
        app_meta := COALESCE(NEW.raw_app_meta_data, '{}'::jsonb);
    EXCEPTION WHEN OTHERS THEN
        -- Handle invalid JSONB
        app_meta := '{}'::jsonb;
        
        -- Log the error
        INSERT INTO construction_mgr.be_audit_log (
            action, entity_type, entity_id, details
        ) VALUES (
            'AUTH_SYNC_WARNING', 'user', NEW.id,
            jsonb_build_object(
                'error_code', SQLSTATE,
                'error_message', 'Invalid raw_app_meta_data format: ' || SQLERRM,
                'operation', 'PARSE_METADATA',
                'user_id', COALESCE(NEW.id::text, 'unknown')
            )
        );
    END;
    
    -- Get provider from app_meta_data
    provider := private.get_auth_provider(app_meta);
    
    -- Parse name from user metadata with enhanced provider-specific handling
    -- First, check if this is a LinkedIn provider which has nested structures
    IF LOWER(provider) = 'linkedin' THEN
        -- LinkedIn often has different formats based on API version
        first_name := COALESCE(
            user_meta->>'first_name', 
            user_meta->>'given_name',
            user_meta->'localizedFirstName'->>'value',
            user_meta->>'localizedFirstName',
            ''
        );
        
        last_name := COALESCE(
            user_meta->>'last_name', 
            user_meta->>'family_name',
            user_meta->'localizedLastName'->>'value',
            user_meta->>'localizedLastName',
            ''
        );
        
        -- Try to get company name from LinkedIn data
        company_name := COALESCE(
            user_meta->>'company_name',
            user_meta->'company'->>'name',
            user_meta->'positions'->'values'->0->'company'->>'name',
            user_meta->'positions'->'values'->0->>'companyName',
            ''
        );
        
        -- Get phone from user metadata or use the phone from the auth user
        phone := COALESCE(user_meta->>'phone', NEW.phone, '');
    ELSE
        -- Standard handling for other providers
        first_name := COALESCE(user_meta->>'first_name', user_meta->>'given_name', '');
        last_name := COALESCE(user_meta->>'last_name', user_meta->>'family_name', '');
        
        -- Get company name from user metadata
        company_name := COALESCE(user_meta->>'company_name', user_meta->>'organization', '');

        -- Get phone from user metadata or use the phone from the auth user
        phone := COALESCE(user_meta->>'phone', NEW.phone, '');
    END IF;
    
    -- Common full name handling for all providers
    full_name := COALESCE(
        user_meta->>'full_name',
        user_meta->>'name',
        user_meta->>'display_name',
        ''
    );
    
    -- If we have a full name but no first/last, try to split it
    IF full_name != '' AND (first_name = '' OR last_name = '') THEN
        name_parts := string_to_array(TRIM(full_name), ' ');
        IF array_length(name_parts, 1) >= 2 THEN
            first_name := name_parts[1];
            last_name := array_to_string(name_parts[2:], ' ');
        ELSIF array_length(name_parts, 1) = 1 THEN
            first_name := name_parts[1];
        END IF;
    END IF;
    
    -- Fallback to email username if no name provided
    IF first_name = '' AND NEW.email IS NOT NULL THEN
        first_name := split_part(NEW.email, '@', 1);
    END IF;
    
    -- Insert new user
    INSERT INTO construction_mgr.be_user (
        id, 
        email, 
        first_name, 
        last_name, 
        company_name,
        phone, 
        provider, 
        provider_identifier,
        status, 
        tier, 
        settings
    ) VALUES (
        NEW.id,
        NEW.email,
        first_name,
        last_name,
        company_name,
        phone,
        provider::construction_mgr.auth_provider,
        COALESCE(user_meta->>'provider_id', user_meta->>'sub', app_meta->>'provider_id', NEW.id::text, 'unknown'),
        'ACTIVE'::construction_mgr.user_status,
        'BASIC'::construction_mgr.user_tier,
        jsonb_build_object(
            'email_verified', CASE 
                WHEN user_meta->>'email_verified' = 'true' THEN true
                WHEN user_meta->>'email_verified' = 'false' THEN false
                ELSE NEW.email_confirmed_at IS NOT NULL
            END,
            'phone_verified', CASE 
                WHEN user_meta->>'phone_verified' = 'true' THEN true
                WHEN user_meta->>'phone_verified' = 'false' THEN false
                ELSE NEW.phone_confirmed_at IS NOT NULL
            END,
            'picture_url', COALESCE(
                user_meta->>'avatar_url',
                user_meta->>'picture',
                user_meta->'picture'->>'url',
                user_meta->'pictureUrl'->>'value',
                user_meta->>'pictureUrl',
                user_meta->'profilePicture'->'displayImage'->>'url',
                user_meta->'photos'->0->>'value',
                user_meta->'image'->>'url'
            ),
            'provider_data', user_meta,
            'app_metadata', app_meta,
            'created_at', NOW()
        )
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Log the user creation
    INSERT INTO construction_mgr.be_audit_log (
        user_id, action, entity_type, entity_id, details
    ) VALUES (
        NEW.id, 'AUTH_USER_CREATED', 'user', NEW.id,
        jsonb_build_object(
            'provider', provider,
            'email', NEW.email
        )
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail auth operation
        INSERT INTO construction_mgr.be_audit_log (
            action, entity_type, entity_id, details
        ) VALUES (
            'AUTH_SYNC_ERROR', 'user', NEW.id,
            jsonb_build_object(
                'error_code', SQLSTATE,
                'error_message', SQLERRM,
                'operation', 'INSERT',
                'email', COALESCE(NEW.email, 'unknown'),
                'user_id', COALESCE(NEW.id::text, 'unknown')
            )
        );
        RETURN NEW; -- Return normally even after error

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger for new user sync (INSERT only)
CREATE TRIGGER auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION construction_mgr.sync_new_auth_user();

-- =============================================================================
-- USER PROFILE FUNCTIONS
-- =============================================================================

-- Main user profile function used by the edge function
CREATE OR REPLACE FUNCTION construction_mgr.get_user_profile(user_uuid UUID DEFAULT auth.uid())
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    user_data RECORD;
    memberships JSON;
BEGIN
    -- Check if the requesting user has permission to access this profile
    IF user_uuid != auth.uid() AND NOT private.is_admin() THEN
        RAISE EXCEPTION 'Access denied: You can only access your own profile';
    END IF;

    -- Fetch basic user details
    SELECT 
        id,
        email,
        first_name,
        last_name,
        phone,
        company_name,
        settings,
        status,
        tier,
        created_at,
        updated_at
    INTO user_data
    FROM construction_mgr.be_user
    WHERE id = user_uuid;

    -- Check if user exists
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    -- Fetch project memberships
    SELECT COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'projectId', p.id,
                'projectName', p.name,
                'projectStatus', p.status,
                'role', pm.role,
                'permissions', (
                    SELECT jsonb_agg(elem)
                    FROM jsonb_array_elements_text(
                        construction_mgr.get_user_project_permissions(
                            p.id, 
                            user_uuid, 
                            pm.role, 
                            p.owner_id = user_uuid
                        )
                    ) as elem
                ),
                'joinedAt', pm.joined_at,
                'isOwner', (p.owner_id = user_uuid)
            )
        ),
        '[]'::JSON
    ) INTO memberships
    FROM construction_mgr.be_project_member pm
    JOIN construction_mgr.be_project p ON pm.project_id = p.id
    WHERE pm.user_id = user_uuid;


    -- Build the complete profile response
    result := (
        SELECT jsonb_build_object(
            'id', user_data.id,
            'email', user_data.email,
            'firstName', user_data.first_name,
            'lastName', user_data.last_name,
            'phone', user_data.phone,
            'companyName', user_data.company_name,
            'avatarUrl', user_data.settings->>'picture_url',
            'settings', user_data.settings,
            'status', user_data.status,
            'tier', user_data.tier,
            'createdAt', user_data.created_at,
            'updatedAt', user_data.updated_at,
            'projectMemberships', memberships,
            'metadata', jsonb_build_object(
                'totalProjects', (
                    SELECT COUNT(*) 
                    FROM construction_mgr.be_project_member 
                    WHERE user_id = user_uuid
                ),
                'ownedProjects', (
                    SELECT COUNT(*) 
                    FROM construction_mgr.be_project 
                    WHERE owner_id = user_uuid
                )
            )
        )
    )::json;

    RETURN result;
END;
$$;

-- Create a convenience function for the current user
CREATE OR REPLACE FUNCTION construction_mgr.get_current_user_profile()
RETURNS JSONB
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
    SELECT construction_mgr.get_user_profile(auth.uid())::jsonb;
$$;

-- =============================================================================
-- NOTIFICATION FUNCTIONS
-- =============================================================================

-- Function to automatically clean up expired notifications
CREATE OR REPLACE FUNCTION construction_mgr.cleanup_expired_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM construction_mgr.be_notification
    WHERE expires_at IS NOT NULL AND expires_at < CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
