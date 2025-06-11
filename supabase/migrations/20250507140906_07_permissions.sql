-- Update permission types enum with the new financial permissions
ALTER TYPE construction_mgr.permission_type ADD VALUE IF NOT EXISTS 'VIEW_PROJECT';
ALTER TYPE construction_mgr.permission_type ADD VALUE IF NOT EXISTS 'EDIT_PROJECT';
ALTER TYPE construction_mgr.permission_type ADD VALUE IF NOT EXISTS 'DELETE_PROJECT';
ALTER TYPE construction_mgr.permission_type ADD VALUE IF NOT EXISTS 'VIEW_PHASES';
ALTER TYPE construction_mgr.permission_type ADD VALUE IF NOT EXISTS 'EDIT_PHASES';
ALTER TYPE construction_mgr.permission_type ADD VALUE IF NOT EXISTS 'DELETE_PHASES';
ALTER TYPE construction_mgr.permission_type ADD VALUE IF NOT EXISTS 'VIEW_MATERIALS';
ALTER TYPE construction_mgr.permission_type ADD VALUE IF NOT EXISTS 'EDIT_MATERIALS';
ALTER TYPE construction_mgr.permission_type ADD VALUE IF NOT EXISTS 'DELETE_MATERIALS';
ALTER TYPE construction_mgr.permission_type ADD VALUE IF NOT EXISTS 'VIEW_EXPENSES';
ALTER TYPE construction_mgr.permission_type ADD VALUE IF NOT EXISTS 'EDIT_EXPENSES';
ALTER TYPE construction_mgr.permission_type ADD VALUE IF NOT EXISTS 'DELETE_EXPENSES';
ALTER TYPE construction_mgr.permission_type ADD VALUE IF NOT EXISTS 'APPROVE_EXPENSES';
ALTER TYPE construction_mgr.permission_type ADD VALUE IF NOT EXISTS 'VIEW_DOCUMENTS';
ALTER TYPE construction_mgr.permission_type ADD VALUE IF NOT EXISTS 'UPLOAD_DOCUMENTS';
ALTER TYPE construction_mgr.permission_type ADD VALUE IF NOT EXISTS 'DELETE_DOCUMENTS';
ALTER TYPE construction_mgr.permission_type ADD VALUE IF NOT EXISTS 'VIEW_WORKERS';
ALTER TYPE construction_mgr.permission_type ADD VALUE IF NOT EXISTS 'MANAGE_WORKERS';
ALTER TYPE construction_mgr.permission_type ADD VALUE IF NOT EXISTS 'VIEW_CONTRACTORS';
ALTER TYPE construction_mgr.permission_type ADD VALUE IF NOT EXISTS 'MANAGE_CONTRACTORS';
ALTER TYPE construction_mgr.permission_type ADD VALUE IF NOT EXISTS 'VIEW_SUPPLIERS';
ALTER TYPE construction_mgr.permission_type ADD VALUE IF NOT EXISTS 'MANAGE_SUPPLIERS';
ALTER TYPE construction_mgr.permission_type ADD VALUE IF NOT EXISTS 'GENERATE_REPORTS';
-- Note: VIEW_FINANCIALS, VIEW_BUDGET, and MANAGE_USERS already exist in 03_enums.sql

-- Note: Project permissions table moved to 05_tables.sql to fix dependency order

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_permission_project ON construction_mgr.be_project_permission(project_id);
CREATE INDEX IF NOT EXISTS idx_permission_user ON construction_mgr.be_project_permission(user_id);
CREATE INDEX IF NOT EXISTS idx_permission_type ON construction_mgr.be_project_permission(permission);
CREATE INDEX IF NOT EXISTS idx_permission_active ON construction_mgr.be_project_permission(active);

-- Create RLS policies for project permissions

-- Project owners can view all permissions for their projects
CREATE POLICY "Project owners can view all permissions"
    ON construction_mgr.be_project_permission
    FOR SELECT
    USING (
        project_id IN (
            SELECT id 
            FROM construction_mgr.be_project 
            WHERE owner_id = auth.uid()
        )
    );

-- Project owners can manage permissions for their projects
CREATE POLICY "Project owners can manage permissions"
    ON construction_mgr.be_project_permission
    FOR ALL
    USING (
        project_id IN (
            SELECT id 
            FROM construction_mgr.be_project 
            WHERE owner_id = auth.uid()
        )
    );

-- Users with ADMIN role can manage permissions
CREATE POLICY "Admins can manage permissions"
    ON construction_mgr.be_project_permission
    FOR ALL
    USING (
        private.check_user_project_role(
            project_id, 
            auth.uid(), 
            ARRAY['ADMIN']::construction_mgr.user_role[]
        )
    );

-- Users can view their own permissions
CREATE POLICY "Users can view their own permissions"
    ON construction_mgr.be_project_permission
    FOR SELECT
    USING (user_id = auth.uid());

-- Update the existing private.has_permission function to use the new permission table
-- This replaces the duplicate function defined in 04_functions.sql

-- Create function to generate default permissions for a role
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
    IF p_role = 'ADMIN' THEN
        -- Admins get all permissions
        INSERT INTO construction_mgr.be_project_permission (project_id, user_id, permission, granted_by)
        SELECT p_project_id, p_user_id, enum_range, p_granted_by
        FROM (SELECT unnest(enum_range(NULL::construction_mgr.permission_type)) AS enum_range) AS permissions
        WHERE enum_range != 'VIEW_PROJECT'; -- Already inserted above
    
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

-- Grant permissions on new tables
GRANT SELECT, INSERT, UPDATE, DELETE 
  ON construction_mgr.financial_transaction, 
     construction_mgr.material_transaction,
     construction_mgr.comment
  TO authenticated;

-- Grant usage on types
GRANT USAGE ON TYPE construction_mgr.transaction_type TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION 
  construction_mgr.update_material_quantity()
  TO authenticated;

-- Grant select on views (moved to after views are created)
-- GRANT SELECT ON 
--   construction_mgr.project_financial_summary,
--   construction_mgr.material_inventory
--   TO authenticated;

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

-- Add RLS policies for financial data
-- RLS policy for project budget
CREATE POLICY "Only members with VIEW_BUDGET permission can see project budget"
    ON construction_mgr.be_project
    FOR SELECT
    USING (
        owner_id = auth.uid() OR 
        private.has_permission(id, auth.uid(), 'VIEW_BUDGET')
    );

-- Financial transaction RLS policy moved to 06_rls_policies.sql to avoid conflicts
-- and updated to use recursion-safe direct functions

-- Phase budget RLS policy moved to 06_rls_policies.sql to avoid conflicts
-- and updated to use recursion-safe direct functions
