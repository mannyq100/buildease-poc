-- Create utility functions for timestamps and RLS policies

-- Function to update 'updated_at' column on row updates
CREATE OR REPLACE FUNCTION construction_mgr.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get the current authenticated user's UUID (enhanced for shadow users)
CREATE OR REPLACE FUNCTION construction_mgr.get_auth_user_id()
RETURNS UUID AS $$
BEGIN
    -- This will be replaced by the simplified auth_user_id() function
    -- which handles shadow users properly
    RETURN COALESCE(construction_mgr.get_real_user_id(), auth.uid());
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to check if a user has a specific role on a project
CREATE OR REPLACE FUNCTION private.check_user_project_role(
    project_id UUID, 
    user_id UUID,
    required_roles construction_mgr.user_role[]
)
RETURNS BOOLEAN AS $$
DECLARE
    user_project_role construction_mgr.user_role;
BEGIN
    -- Get user's role on the project
    SELECT role INTO user_project_role
    FROM construction_mgr.be_project_member
    WHERE project_id = check_user_project_role.project_id 
    AND user_id = check_user_project_role.user_id;
    
    -- Check if the user's role is in the required roles array
    RETURN user_project_role = ANY(required_roles);
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if the user is the owner of a project
CREATE OR REPLACE FUNCTION private.is_project_owner(project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM construction_mgr.be_project
        WHERE id = project_id
        AND owner_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if the user has access to a project
CREATE OR REPLACE FUNCTION private.has_project_access(project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if user is the project owner
    IF private.is_project_owner(project_id) THEN
        RETURN TRUE;
    END IF;

    -- Check if user is a project participant with any role
    RETURN EXISTS (
        SELECT 1
        FROM construction_mgr.be_project_member
        WHERE project_id = has_project_access.project_id
        AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is an administrator
CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM construction_mgr.be_project_member
        WHERE user_id = auth.uid()
        AND role = 'ADMIN'::construction_mgr.user_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has financial viewing permissions
CREATE OR REPLACE FUNCTION private.has_financial_access(project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Project owners always have access
    IF private.is_project_owner(project_id) THEN
        RETURN TRUE;
    END IF;
    
    -- Check if user has VIEW_FINANCIALS permission
    RETURN private.has_permission(project_id, auth.uid(), 'VIEW_FINANCIALS'::construction_mgr.permission_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has budget viewing permissions
CREATE OR REPLACE FUNCTION private.has_budget_access(project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Project owners always have access
    IF private.is_project_owner(project_id) THEN
        RETURN TRUE;
    END IF;
    
    -- Check if user has VIEW_BUDGET permission
    RETURN private.has_permission(project_id, auth.uid(), 'VIEW_BUDGET'::construction_mgr.permission_type);
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
    -- Check if user is the project owner (owners always have all permissions)
    IF EXISTS (
        SELECT 1
        FROM construction_mgr.be_project
        WHERE id = project_id
        AND owner_id = user_id
    ) THEN
        RETURN TRUE;
    END IF;

    -- Check if user has ADMIN role (admins have all permissions)
    IF EXISTS (
        SELECT 1
        FROM construction_mgr.be_project_member
        WHERE project_id = has_permission.project_id
        AND user_id = has_permission.user_id
        AND role = 'ADMIN'::construction_mgr.user_role
    ) THEN
        RETURN TRUE;
    END IF;

    -- Check specific permission
    RETURN EXISTS (
        SELECT 1
        FROM construction_mgr.be_project_permission
        WHERE project_id = has_permission.project_id
        AND user_id = has_permission.user_id
        AND permission = required_permission
        AND active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
