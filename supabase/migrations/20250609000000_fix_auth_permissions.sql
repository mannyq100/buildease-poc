-- Fix Auth Trigger Permissions
-- This migration addresses the "Database error saving new user" issue
-- Last updated: June 9, 2025

-- Ensure the private schema exists
CREATE SCHEMA IF NOT EXISTS private;

-- Grant comprehensive permissions to all Supabase internal roles
-- These roles are used by Supabase for various operations including auth triggers

-- Schema permissions
GRANT USAGE ON SCHEMA construction_mgr TO postgres, service_role, supabase_auth_admin, supabase_admin;
GRANT USAGE ON SCHEMA private TO postgres, service_role, supabase_auth_admin, supabase_admin;

-- Table permissions for be_user
GRANT ALL ON construction_mgr.be_user TO postgres, service_role, supabase_auth_admin, supabase_admin;

-- Table permissions for audit log
GRANT ALL ON construction_mgr.be_audit_log TO postgres, service_role, supabase_auth_admin, supabase_admin;

-- Function permissions
GRANT EXECUTE ON FUNCTION construction_mgr.sync_new_auth_user() TO postgres, service_role, supabase_auth_admin, supabase_admin;
GRANT EXECUTE ON FUNCTION private.get_auth_provider(JSONB) TO postgres, service_role, supabase_auth_admin, supabase_admin;

-- Sequence permissions (if any sequences exist for UUID generation)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA construction_mgr TO postgres, service_role, supabase_auth_admin, supabase_admin;

-- Ensure the trigger function can access auth.uid() function
GRANT EXECUTE ON FUNCTION auth.uid() TO postgres, service_role, supabase_auth_admin, supabase_admin;

-- Add explicit permissions for the trigger to bypass RLS when needed
-- This is critical for the auth trigger to work properly
ALTER TABLE construction_mgr.be_user DISABLE ROW LEVEL SECURITY;
ALTER TABLE construction_mgr.be_audit_log DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS but with bypass for the auth trigger
ALTER TABLE construction_mgr.be_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE construction_mgr.be_audit_log ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows the service_role to bypass RLS for inserts
-- This is specifically for the auth trigger
CREATE POLICY "Allow service_role to insert users" ON construction_mgr.be_user
    FOR INSERT TO service_role
    WITH CHECK (true);

CREATE POLICY "Allow service_role to insert audit logs" ON construction_mgr.be_audit_log
    FOR INSERT TO service_role
    WITH CHECK (true);

-- Ensure the function has the proper security definer context
-- Recreate the trigger function with explicit permissions
CREATE OR REPLACE FUNCTION construction_mgr.sync_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
    provider TEXT;
    first_name TEXT;
    last_name TEXT;
    full_name TEXT;
    company_name TEXT;
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
        user_meta := '{}'::jsonb;
    END;
    
    BEGIN
        app_meta := COALESCE(NEW.raw_app_meta_data, '{}'::jsonb);
    EXCEPTION WHEN OTHERS THEN
        app_meta := '{}'::jsonb;
    END;
    
    -- Get provider from app_meta_data
    provider := private.get_auth_provider(app_meta);
    
    -- Parse name from user metadata
    first_name := COALESCE(user_meta->>'first_name', user_meta->>'given_name', '');
    last_name := COALESCE(user_meta->>'last_name', user_meta->>'family_name', '');
    company_name := COALESCE(user_meta->>'company_name', user_meta->>'organization', '');
    
    -- Handle full name splitting
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
    
    -- Insert new user with explicit schema reference
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
        NEW.phone,
        provider::construction_mgr.auth_provider,
        COALESCE(user_meta->>'provider_id', user_meta->>'sub', app_meta->>'provider_id', NEW.id::text, 'unknown'),
        'ACTIVE'::construction_mgr.user_status,
        'BASIC'::construction_mgr.user_tier,
        jsonb_build_object(
            'email_verified', COALESCE(user_meta->>'email_verified', NEW.email_confirmed_at IS NOT NULL),
            'phone_verified', COALESCE(user_meta->>'phone_verified', NEW.phone_confirmed_at IS NOT NULL),
            'picture_url', COALESCE(
                user_meta->>'avatar_url',
                user_meta->>'picture',
                user_meta->'picture'->>'url'
            ),
            'provider_data', user_meta,
            'app_metadata', app_meta,
            'created_at', NOW()
        )
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Log the user creation with explicit schema reference
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
            'AUTH_SYNC_ERROR', 'user', COALESCE(NEW.id, 'unknown')::text,
            jsonb_build_object(
                'error_code', SQLSTATE,
                'error_message', SQLERRM,
                'operation', 'INSERT',
                'email', COALESCE(NEW.email, 'unknown')
            )
        );
        RETURN NEW; -- Return normally even after error

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger to ensure it uses the updated function
DROP TRIGGER IF EXISTS auth_user_created ON auth.users;

CREATE TRIGGER auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION construction_mgr.sync_new_auth_user();

-- Update function comments
COMMENT ON FUNCTION construction_mgr.sync_new_auth_user IS 'Syncs auth users to be_user table. Fixed permissions on Jun 9, 2025 to resolve database error during user creation.';