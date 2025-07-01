-- Migration: 009_project_permission_rls.sql
-- Purpose: Defines RLS policies for project permissions, dependent on project tables.

-- PROJECT PERMISSION TABLE POLICIES
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

CREATE POLICY "Users can view their own permissions"
    ON construction_mgr.be_project_permission
    FOR SELECT
    USING (user_id = auth.uid());
