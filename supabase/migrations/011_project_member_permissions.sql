-- Migration: 009_project_member_permissions.sql
-- Purpose: Defines functions and triggers for managing project member permissions.

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
