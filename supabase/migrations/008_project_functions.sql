-- Migration: 008_project_functions.sql
-- Purpose: Defines helper functions for the project management domain, primarily for RLS.

-- Helper function to get the real user ID (for shadow users)
CREATE OR REPLACE FUNCTION construction_mgr.get_real_user_id()
RETURNS UUID AS $$
BEGIN
    -- For now, just return auth.uid() - can be enhanced later for shadow users
    RETURN auth.uid();
END;
$$ LANGUAGE plpgsql STABLE;

-- Helper function to get the current authenticated user's UUID (enhanced for shadow users)
CREATE OR REPLACE FUNCTION construction_mgr.get_auth_user_id()
RETURNS UUID AS $$
BEGIN
    -- This will be replaced by the simplified auth_user_id() function
    -- which handles shadow users properly
    RETURN COALESCE(construction_mgr.get_real_user_id(), auth.uid());
END;
$$ LANGUAGE plpgsql STABLE;

-- ==============================================================================
-- DIRECT ACCESS FUNCTIONS (TIER 1) - Used by RLS policies to avoid recursion
-- ==============================================================================

-- Direct project ownership check (bypasses RLS)
CREATE OR REPLACE FUNCTION private.is_project_owner_direct(project_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    result BOOLEAN;
BEGIN
    -- Direct query without RLS
    SELECT EXISTS (
        SELECT 1
        FROM construction_mgr.be_project
        WHERE id = is_project_owner_direct.project_id AND owner_id = is_project_owner_direct.user_id
    ) INTO result;
    
    RETURN COALESCE(result, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Direct project membership check (bypasses RLS)
CREATE OR REPLACE FUNCTION private.is_project_member_direct(project_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    result BOOLEAN;
BEGIN
    -- Direct query without RLS
    SELECT EXISTS (
        SELECT 1
        FROM construction_mgr.be_project_member
        WHERE project_id = is_project_member_direct.project_id 
        AND user_id = is_project_member_direct.user_id
    ) INTO result;
    
    RETURN COALESCE(result, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Direct project access check (bypasses RLS)
CREATE OR REPLACE FUNCTION private.has_project_access_direct(project_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Use direct functions to avoid recursion
    RETURN private.is_project_owner_direct(project_id, user_id) OR 
           private.is_project_member_direct(project_id, user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Direct role check (bypasses RLS)
CREATE OR REPLACE FUNCTION private.check_user_project_role_direct(
    project_id UUID, 
    user_id UUID,
    required_roles construction_mgr.user_role[]
)
RETURNS BOOLEAN AS $$
DECLARE
    user_project_role construction_mgr.user_role;
BEGIN
    -- Direct query without RLS
    SELECT role INTO user_project_role
    FROM construction_mgr.be_project_member
    WHERE project_id = check_user_project_role_direct.project_id 
    AND user_id = check_user_project_role_direct.user_id;
    
    RETURN user_project_role = ANY(required_roles);
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Direct admin check (bypasses RLS)
-- Update the admin check function with proper project-specific logic
-- (This replaces the placeholder function created in migration 004)
CREATE OR REPLACE FUNCTION private.is_admin_direct(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    result BOOLEAN;
BEGIN
    -- Check if user has ADMIN role in any project
    SELECT EXISTS (
        SELECT 1
        FROM construction_mgr.be_project_member
        WHERE user_id = is_admin_direct.user_id
        AND role = 'ADMIN'::construction_mgr.user_role
    ) INTO result;
    
    RETURN COALESCE(result, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Direct permission check (bypasses RLS)
CREATE OR REPLACE FUNCTION private.has_permission_direct(
    project_id UUID,
    user_id UUID,
    required_permission construction_mgr.permission_type
)
RETURNS BOOLEAN AS $$
DECLARE
    result BOOLEAN;
BEGIN
    -- Check if user is project owner (owners have all permissions)
    IF private.is_project_owner_direct(project_id, user_id) THEN
        RETURN TRUE;
    END IF;

    -- Check if user has ADMIN role (admins have all permissions)
    SELECT EXISTS (
        SELECT 1
        FROM construction_mgr.be_project_member
        WHERE project_id = has_permission_direct.project_id
        AND user_id = has_permission_direct.user_id
        AND role = 'ADMIN'::construction_mgr.user_role
    ) INTO result;
    
    IF result THEN
        RETURN TRUE;
    END IF;

    -- Check if user has SUPER_EDIT permission (grants all permissions)
    SELECT EXISTS (
        SELECT 1
        FROM construction_mgr.be_project_permission
        WHERE project_id = has_permission_direct.project_id
        AND user_id = has_permission_direct.user_id
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
        WHERE project_id = has_permission_direct.project_id
        AND user_id = has_permission_direct.user_id
        AND permission = required_permission
        AND active = TRUE
    ) INTO result;
    
    RETURN COALESCE(result, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- APPLICATION WRAPPER FUNCTIONS (TIER 2) - Used by application code
-- ==============================================================================

-- Function to check if a user has a specific role on a project
CREATE OR REPLACE FUNCTION private.check_user_project_role(
    project_id UUID, 
    user_id UUID,
    required_roles construction_mgr.user_role[]
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN private.check_user_project_role_direct(project_id, user_id, required_roles);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if the user is the owner of a project
CREATE OR REPLACE FUNCTION private.is_project_owner(project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN private.is_project_owner_direct(project_id, auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if the user has access to a project
CREATE OR REPLACE FUNCTION private.has_project_access(project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN private.has_project_access_direct(project_id, auth.uid());
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
CREATE OR REPLACE FUNCTION private.has_financial_access(project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN private.has_permission_direct(project_id, auth.uid(), 'VIEW_FINANCIALS'::construction_mgr.permission_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has budget viewing permissions
CREATE OR REPLACE FUNCTION private.has_budget_access(project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN private.has_permission_direct(project_id, auth.uid(), 'VIEW_BUDGET'::construction_mgr.permission_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced function to check if a user has a specific permission on a project
-- Uses the new be_project_permission table for granular access control
CREATE OR REPLACE FUNCTION private.has_permission(
    project_id UUID,
    user_id UUID,
    required_permission construction_mgr.permission_type
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN private.has_permission_direct(project_id, user_id, required_permission);
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
