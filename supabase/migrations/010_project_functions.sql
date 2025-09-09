-- Migration: 010_project_functions.sql
-- Purpose: Defines all helper functions for the project management domain.

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Note: Redundant user ID helper functions removed. Use auth.uid() directly.

-- =============================================================================
-- DIRECT ACCESS FUNCTIONS (TIER 1) - Used by RLS policies to avoid recursion
-- =============================================================================

-- Direct project ownership check (bypasses RLS)
CREATE OR REPLACE FUNCTION private.is_project_owner_direct(p_project_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    result BOOLEAN;
BEGIN
    -- Direct query without RLS
    SELECT EXISTS (
        SELECT 1
        FROM construction_mgr.be_project
        WHERE id = p_project_id AND owner_id = p_user_id
    ) INTO result;
    
    RETURN COALESCE(result, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Direct project membership check (bypasses RLS)
CREATE OR REPLACE FUNCTION private.is_project_member_direct(p_project_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    result BOOLEAN;
BEGIN
    -- Direct query without RLS
    SELECT EXISTS (
        SELECT 1
        FROM construction_mgr.be_project_member
        WHERE project_id = p_project_id 
        AND user_id = p_user_id
    ) INTO result;
    
    RETURN COALESCE(result, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Direct project access check (bypasses RLS)
CREATE OR REPLACE FUNCTION private.has_project_access_direct(p_project_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Use direct functions to avoid recursion
    RETURN private.is_project_owner_direct(p_project_id, p_user_id) OR 
           private.is_project_member_direct(p_project_id, p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Direct role check (bypasses RLS)
CREATE OR REPLACE FUNCTION private.check_user_project_role_direct(
    p_project_id UUID, 
    p_user_id UUID,
    p_required_roles construction_mgr.user_role[]
)
RETURNS BOOLEAN AS $$
DECLARE
    user_project_role construction_mgr.user_role;
BEGIN
    -- Direct query without RLS
    SELECT role INTO user_project_role
    FROM construction_mgr.be_project_member
    WHERE project_id = p_project_id 
    AND user_id = p_user_id;
    
    RETURN user_project_role = ANY(p_required_roles);
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Direct admin check (bypasses RLS)
CREATE OR REPLACE FUNCTION private.is_admin_direct(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    result BOOLEAN;
BEGIN
    -- Check if user has ADMIN role in any project
    SELECT EXISTS (
        SELECT 1
        FROM construction_mgr.be_project_member
        WHERE user_id = p_user_id
        AND role = 'ADMIN'::construction_mgr.user_role
    ) INTO result;
    
    RETURN COALESCE(result, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Direct permission check (bypasses RLS)
CREATE OR REPLACE FUNCTION private.has_permission_direct(
    p_project_id UUID,
    p_user_id UUID,
    p_required_permission construction_mgr.permission_type
)
RETURNS BOOLEAN AS $$
DECLARE
    result BOOLEAN;
BEGIN
    -- Check if user is project owner (owners have all permissions)
    IF private.is_project_owner_direct(p_project_id, p_user_id) THEN
        RETURN TRUE;
    END IF;

    -- Check if user has ADMIN role (admins have all permissions)
    SELECT EXISTS (
        SELECT 1
        FROM construction_mgr.be_project_member
        WHERE project_id = p_project_id
        AND user_id = p_user_id
        AND role = 'ADMIN'::construction_mgr.user_role
    ) INTO result;
    
    IF result THEN
        RETURN TRUE;
    END IF;

    -- Check if user has SUPER_EDIT permission (grants all permissions)
    SELECT EXISTS (
        SELECT 1
        FROM construction_mgr.be_project_permission
        WHERE project_id = p_project_id
        AND user_id = p_user_id
        AND permission = 'SUPER_EDIT'::construction_mgr.permission_type
        AND active = TRUE
    ) INTO result;
    
    IF result THEN
        RETURN TRUE;
    END IF;

    -- Check specific permission
    SELECT EXISTS (
        SELECT 1
        FROM construction_mgr.be_project_permission
        WHERE project_id = p_project_id
        AND user_id = p_user_id
        AND permission = p_required_permission
        AND active = TRUE
    ) INTO result;
    
    RETURN COALESCE(result, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- APPLICATION WRAPPER FUNCTIONS (TIER 2) - Used by application code
-- =============================================================================

-- Function to check if a user has a specific role on a project
CREATE OR REPLACE FUNCTION private.check_user_project_role(
    p_project_id UUID, 
    p_user_id UUID,
    p_required_roles construction_mgr.user_role[]
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN private.check_user_project_role_direct(p_project_id, p_user_id, p_required_roles);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if the user is the owner of a project
CREATE OR REPLACE FUNCTION private.is_project_owner(p_project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN private.is_project_owner_direct(p_project_id, auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if the user has access to a project
CREATE OR REPLACE FUNCTION private.has_project_access(p_project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN private.has_project_access_direct(p_project_id, auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is an administrator
CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN private.is_admin_direct(auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has financial viewing permissions
CREATE OR REPLACE FUNCTION private.has_financial_access(p_project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN private.has_permission_direct(p_project_id, auth.uid(), 'VIEW_FINANCIALS'::construction_mgr.permission_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has budget viewing permissions
CREATE OR REPLACE FUNCTION private.has_budget_access(p_project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN private.has_permission_direct(p_project_id, auth.uid(), 'VIEW_BUDGET'::construction_mgr.permission_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced function to check if a user has a specific permission on a project
-- Uses the new be_project_permission table for granular access control
CREATE OR REPLACE FUNCTION private.has_permission(
    p_project_id UUID,
    p_user_id UUID,
    p_required_permission construction_mgr.permission_type
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN private.has_permission_direct(p_project_id, p_user_id, p_required_permission);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user project access efficiently (cached result)
CREATE OR REPLACE FUNCTION private.user_has_project_access_cached(
    p_project_id UUID,
    p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN AS $$
DECLARE
    cached_result BOOLEAN;
BEGIN
    -- Simple ownership check (fastest)
    IF EXISTS (
        SELECT 1 FROM construction_mgr.be_project 
        WHERE id = p_project_id AND owner_id = p_user_id
    ) THEN
        RETURN TRUE;
    END IF;
    
    -- Membership check (with index)
    RETURN EXISTS (
        SELECT 1 FROM construction_mgr.be_project_member 
        WHERE project_id = p_project_id AND user_id = p_user_id
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Optimized function for checking financial permissions
CREATE OR REPLACE FUNCTION private.has_financial_permission_fast(
    p_project_id UUID,
    p_user_id UUID DEFAULT auth.uid(),
    p_permission construction_mgr.permission_type DEFAULT 'VIEW_FINANCIALS'
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Owner check (fastest path)
    IF EXISTS (
        SELECT 1 FROM construction_mgr.be_project 
        WHERE id = p_project_id AND owner_id = p_user_id
    ) THEN
        RETURN TRUE;
    END IF;
    
    -- Admin role check (second fastest)
    IF EXISTS (
        SELECT 1 FROM construction_mgr.be_project_member 
        WHERE project_id = p_project_id 
        AND user_id = p_user_id 
        AND role = 'ADMIN'
    ) THEN
        RETURN TRUE;
    END IF;
    
    -- Specific permission check (uses partial index)
    RETURN EXISTS (
        SELECT 1 FROM construction_mgr.be_project_permission 
        WHERE project_id = p_project_id 
        AND user_id = p_user_id 
        AND permission = p_permission 
        AND active = TRUE
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- =============================================================================
-- PROJECT PERMISSION MANAGEMENT FUNCTIONS
-- =============================================================================

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
BEGIN
    
    -- Add explicit permissions from be_project_permission table
    WITH explicit_perms AS (
        SELECT lower(permission::text) as perm_name
        FROM construction_mgr.be_project_permission
        WHERE project_id = p_project_id
          AND user_id = p_user_id
          AND active = TRUE
    )
    SELECT jsonb_agg(DISTINCT perm_name)
    INTO permission_names
    FROM explicit_perms;
    
    RETURN COALESCE(permission_names, '[]'::jsonb);
END;
$$;

-- Function to generate default permissions for a role
CREATE OR REPLACE FUNCTION construction_mgr.generate_default_permissions(
    p_project_id UUID,
    p_user_id UUID,
    p_role construction_mgr.user_role,
    p_granted_by UUID
)
RETURNS VOID AS $$
BEGIN
    -- Clear existing permissions
    DELETE FROM construction_mgr.be_project_permission
    WHERE project_id = p_project_id AND user_id = p_user_id;
    
    -- Grant common permissions for all roles
    INSERT INTO construction_mgr.be_project_permission (project_id, user_id, permission, granted_by)
    VALUES (p_project_id, p_user_id, 'VIEW_PROJECT', p_granted_by);
    
    -- Grant role-specific permissions
    IF p_role = 'OWNER' THEN
        -- Owners get SUPER_EDIT permission (covers all actions)
        INSERT INTO construction_mgr.be_project_permission (project_id, user_id, permission, granted_by)
        VALUES (p_project_id, p_user_id, 'SUPER_EDIT', p_granted_by);
    
    ELSIF p_role = 'ADMIN' THEN
        -- Admins get SUPER_EDIT permission (covers all actions)
        INSERT INTO construction_mgr.be_project_permission (project_id, user_id, permission, granted_by)
        VALUES (p_project_id, p_user_id, 'SUPER_EDIT', p_granted_by);
    
    ELSIF p_role = 'CONTRACTOR' THEN
        -- Contractors get project viewing and management permissions
        INSERT INTO construction_mgr.be_project_permission (project_id, user_id, permission, granted_by)
        VALUES 
            (p_project_id, p_user_id, 'VIEW_PHASES', p_granted_by),
            (p_project_id, p_user_id, 'EDIT_PHASES', p_granted_by),
            (p_project_id, p_user_id, 'VIEW_MATERIALS', p_granted_by),
            (p_project_id, p_user_id, 'VIEW_EXPENSES', p_granted_by),
            (p_project_id, p_user_id, 'EDIT_EXPENSES', p_granted_by),
            (p_project_id, p_user_id, 'VIEW_DOCUMENTS', p_granted_by),
            (p_project_id, p_user_id, 'UPLOAD_DOCUMENTS', p_granted_by),
            (p_project_id, p_user_id, 'VIEW_WORKERS', p_granted_by),
            (p_project_id, p_user_id, 'MANAGE_WORKERS', p_granted_by),
            (p_project_id, p_user_id, 'VIEW_FINANCIALS', p_granted_by),  -- Contractors can see financials by default
            (p_project_id, p_user_id, 'VIEW_BUDGET', p_granted_by);      -- Contractors can see budget by default
    
    ELSIF p_role = 'WORKER' THEN
        -- Workers get basic viewing permissions
        INSERT INTO construction_mgr.be_project_permission (project_id, user_id, permission, granted_by)
        VALUES 
            (p_project_id, p_user_id, 'VIEW_PHASES', p_granted_by),
            (p_project_id, p_user_id, 'VIEW_MATERIALS', p_granted_by),
            (p_project_id, p_user_id, 'VIEW_DOCUMENTS', p_granted_by),
            (p_project_id, p_user_id, 'UPLOAD_DOCUMENTS', p_granted_by);
        -- Note: Workers do NOT get VIEW_FINANCIALS or VIEW_BUDGET by default
    
    ELSIF p_role = 'SUPPLIER' THEN
        -- Suppliers get material management permissions
        INSERT INTO construction_mgr.be_project_permission (project_id, user_id, permission, granted_by)
        VALUES 
            (p_project_id, p_user_id, 'VIEW_MATERIALS', p_granted_by),
            (p_project_id, p_user_id, 'EDIT_MATERIALS', p_granted_by),
            (p_project_id, p_user_id, 'VIEW_DOCUMENTS', p_granted_by),
            (p_project_id, p_user_id, 'UPLOAD_DOCUMENTS', p_granted_by),
            (p_project_id, p_user_id, 'VIEW_FINANCIALS', p_granted_by);  -- Suppliers can see financials related to materials
        -- Note: Suppliers do NOT get VIEW_BUDGET by default
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically generate default permissions when a user is added to a project
CREATE OR REPLACE FUNCTION construction_mgr.handle_project_member_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Call the function to generate default permissions
    PERFORM construction_mgr.generate_default_permissions(
        NEW.project_id,
        NEW.user_id,
        NEW.role,
        (SELECT owner_id FROM construction_mgr.be_project WHERE id = NEW.project_id)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger on be_project_member to generate default permissions
DROP TRIGGER IF EXISTS on_project_member_created ON construction_mgr.be_project_member;
CREATE TRIGGER on_project_member_created
    AFTER INSERT ON construction_mgr.be_project_member
    FOR EACH ROW EXECUTE FUNCTION construction_mgr.handle_project_member_insert();

-- =============================================================================
-- PROJECT ACTIVITY FUNCTIONS
-- =============================================================================

-- Helper function for project activity insertion
CREATE OR REPLACE FUNCTION construction_mgr.create_project_activity(
    p_project_id UUID,
    p_activity_type VARCHAR(100),
    p_title VARCHAR(255),
    p_description TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_user_name VARCHAR(255) DEFAULT NULL,
    p_entity_type VARCHAR(50) DEFAULT NULL,
    p_entity_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}',
    p_status VARCHAR(20) DEFAULT 'info'
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO construction_mgr.be_project_activity (
        project_id,
        activity_type,
        title,
        description,
        user_id,
        user_name,
        entity_type,
        entity_id,
        metadata,
        status
    ) VALUES (
        p_project_id,
        p_activity_type,
        p_title,
        p_description,
        p_user_id,
        p_user_name,
        p_entity_type,
        p_entity_id,
        p_metadata,
        p_status
    ) RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql;
