-- Migration: 014_material_rls.sql
-- Purpose: Defines RLS policies for the material and inventory domain.

-- MATERIAL TABLE POLICIES
CREATE POLICY "Users can view materials for projects they have access to"
    ON construction_mgr.be_material
    FOR SELECT
    USING (
        private.has_project_access_direct(project_id, auth.uid())
    );

CREATE POLICY "Project owners can manage materials"
    ON construction_mgr.be_material
    FOR ALL
    USING (
        private.is_project_owner_direct(project_id, auth.uid())
    );

CREATE POLICY "Project participants with ADMIN role can manage materials"
    ON construction_mgr.be_material
    FOR ALL
    USING (
        private.check_user_project_role_direct(
            project_id, 
            auth.uid(), 
            ARRAY['ADMIN']::construction_mgr.user_role[]
        )
    );

CREATE POLICY "Project participants with SUPPLIER role can update materials"
    ON construction_mgr.be_material
    FOR UPDATE
    USING (
        private.check_user_project_role_direct(
            project_id, 
            auth.uid(), 
            ARRAY['SUPPLIER']::construction_mgr.user_role[]
        )
    );

-- MATERIAL TRANSACTION POLICIES
CREATE POLICY "Users can view material transactions for projects they have access to"
    ON construction_mgr.material_transaction
    FOR SELECT
    USING (
        private.has_project_access_direct(project_id, auth.uid())
    );

CREATE POLICY "Project members can create material transactions"
    ON construction_mgr.material_transaction
    FOR INSERT
    WITH CHECK (
        private.has_project_access_direct(project_id, auth.uid())
    );
