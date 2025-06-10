-- Consolidated User Profile and Permissions
-- Combines functionality from user_projects_view.sql and user_profile_edge_function.sql
-- Last updated: June 8, 2025

-- Drop existing functions if they exist to avoid conflicts
DROP FUNCTION IF EXISTS construction_mgr.get_user_project_permissions(UUID, UUID, construction_mgr.user_role, BOOLEAN);
DROP FUNCTION IF EXISTS construction_mgr.get_user_profile_with_projects(UUID);
DROP FUNCTION IF EXISTS construction_mgr.get_user_profile(UUID);

-- Core permission function used by all other functions
CREATE OR REPLACE FUNCTION construction_mgr.get_user_project_permissions(
    p_project_id UUID,
    p_user_id UUID,
    p_role construction_mgr.user_role,
    p_is_owner BOOLEAN
) RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY INVOKER
AS $$
DECLARE
    permission_names jsonb := '[]'::jsonb;
    all_permissions construction_mgr.permission_type[];
    explicit_permissions jsonb;
BEGIN
    -- CASE 1: If user is the owner, they have all permissions
    IF p_is_owner THEN
        SELECT array_agg(t.enumlabel::construction_mgr.permission_type)
        INTO all_permissions
        FROM pg_enum t
        JOIN pg_type pt ON pt.oid = t.enumtypid
        WHERE pt.typname = 'permission_type';
        
        SELECT jsonb_agg(lower(permission::text))
        INTO permission_names
        FROM unnest(all_permissions) as permission;
        
        RETURN permission_names;
    END IF;
    
    -- CASE 2: Get explicit permissions from be_project_permission table
    -- View_project is implied for all project members
    permission_names := jsonb_build_array('view_project');
    
    -- Add explicit permissions from be_project_permission table
    WITH explicit_perms AS (
        SELECT lower(permission::text) as perm_name
        FROM construction_mgr.be_project_permission
        WHERE project_id = p_project_id
          AND user_id = p_user_id
          AND active = TRUE
    )
    SELECT jsonb_agg(DISTINCT perm_name)
    INTO explicit_permissions
    FROM explicit_perms;
    
    -- Combine with existing permissions
    IF explicit_permissions IS NOT NULL THEN
        permission_names := permission_names || explicit_permissions;
    END IF;
    
    -- CASE 3: If the user has ADMIN role but no explicit permissions, give them full access
    -- except delete_project (which is owner only)
    IF p_role = 'ADMIN' AND (permission_names IS NULL OR jsonb_array_length(permission_names) <= 1) THEN
        -- Get all permission types from enum except DELETE_PROJECT
        SELECT array_agg(t.enumlabel::construction_mgr.permission_type)
        INTO all_permissions
        FROM pg_enum t
        JOIN pg_type pt ON pt.oid = t.enumtypid
        WHERE pt.typname = 'permission_type'
        AND t.enumlabel != 'DELETE_PROJECT';
        
        -- Convert to lowercase for consistency
        SELECT jsonb_agg(lower(permission::text))
        INTO permission_names
        FROM unnest(all_permissions) as permission;
    END IF;
    
    RETURN COALESCE(permission_names, '[]'::jsonb);
END;
$$;

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
    owned_projects JSON;
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
                'projectDetails', JSON_BUILD_OBJECT(
                    'description', p.description,
                    'budget', p.budget,
                    'timeline', p.timeline,
                    'location', p.details->'location',
                    'specs', p.details->'specs'
                ),
                'isOwner', (p.owner_id = user_uuid)
            )
        ),
        '[]'::JSON
    ) INTO memberships
    FROM construction_mgr.be_project_member pm
    JOIN construction_mgr.be_project p ON pm.project_id = p.id
    WHERE pm.user_id = user_uuid;

    -- Get projects owned by user but not in members table
    SELECT COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'projectId', p.id,
                'projectName', p.name,
                'projectStatus', p.status,
                'role', 'OWNER',
                'permissions', (
                    SELECT jsonb_agg(elem)
                    FROM jsonb_array_elements_text(
                        construction_mgr.get_user_project_permissions(
                            p.id, 
                            user_uuid, 
                            'OWNER'::construction_mgr.user_role, 
                            true
                        )
                    ) as elem
                ),
                'joinedAt', p.created_at,
                'projectDetails', JSON_BUILD_OBJECT(
                    'description', p.description,
                    'budget', p.budget,
                    'timeline', p.timeline,
                    'location', p.details->'location',
                    'specs', p.details->'specs'
                ),
                'isOwner', true
            )
        ),
        '[]'::JSON
    ) INTO owned_projects
    FROM construction_mgr.be_project p
    WHERE p.owner_id = user_uuid
    AND NOT EXISTS (
        SELECT 1 FROM construction_mgr.be_project_member pm 
        WHERE pm.project_id = p.id AND pm.user_id = user_uuid
    );

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
            'projects', COALESCE(
                (SELECT jsonb_agg(project) FROM (
                    SELECT * FROM jsonb_array_elements(memberships::jsonb)
                    UNION ALL
                    SELECT * FROM jsonb_array_elements(owned_projects::jsonb)
                ) AS project),
                '[]'::jsonb
            ),
            'metadata', jsonb_build_object(
                'totalProjects', (
                    SELECT COUNT(*) 
                    FROM construction_mgr.be_project_member 
                    WHERE user_id = user_uuid
                ) + (
                    SELECT COUNT(*)
                    FROM construction_mgr.be_project
                    WHERE owner_id = user_uuid
                    AND NOT EXISTS (
                        SELECT 1 FROM construction_mgr.be_project_member pm 
                        WHERE pm.project_id = be_project.id AND pm.user_id = user_uuid
                    )
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

-- Add comments for documentation
COMMENT ON FUNCTION construction_mgr.get_user_project_permissions IS 
'Gets all permissions for a user on a project based on their role, ownership status, and explicit permissions.';

COMMENT ON FUNCTION construction_mgr.get_user_profile IS 
'Fetches complete user profile including project memberships, roles, and permissions in a single call. 
Users can only access their own profile unless they are admin.';

COMMENT ON FUNCTION construction_mgr.get_current_user_profile IS 
'RPC wrapper to fetch the current authenticated user''s complete profile data.';

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION construction_mgr.get_user_profile(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION construction_mgr.get_current_user_profile() TO authenticated;
