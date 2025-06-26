-- Create Row Level Security (RLS) policies for all tables
-- Updated with recursion-safe direct functions to prevent infinite loops

-- ==============================================================================
-- USER TABLE POLICIES
-- ==============================================================================

CREATE POLICY "Users can view their own profile"
    ON construction_mgr.be_user
    FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
    ON construction_mgr.be_user
    FOR UPDATE
    USING (id = auth.uid());

CREATE POLICY "Admins can view all users"
    ON construction_mgr.be_user
    FOR SELECT
    USING (private.is_admin_direct(auth.uid()));

CREATE POLICY "Admins can update all users"
    ON construction_mgr.be_user
    FOR UPDATE
    USING (private.is_admin_direct(auth.uid()));

-- ==============================================================================
-- PROJECT TABLE POLICIES
-- ==============================================================================

CREATE POLICY "Users can view projects they own"
    ON construction_mgr.be_project
    FOR SELECT
    USING (owner_id = auth.uid());

CREATE POLICY "Users can view projects they participate in"
    ON construction_mgr.be_project
    FOR SELECT
    USING (
        private.has_project_access_direct(id, auth.uid())
    );

CREATE POLICY "Users can create projects"
    ON construction_mgr.be_project
    FOR INSERT
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update projects they own"
    ON construction_mgr.be_project
    FOR UPDATE
    USING (owner_id = auth.uid());

CREATE POLICY "Project participants with ADMIN role can update projects"
    ON construction_mgr.be_project
    FOR UPDATE
    USING (
        private.check_user_project_role_direct(
            id, 
            auth.uid(), 
            ARRAY['ADMIN']::construction_mgr.user_role[]
        )
    );

CREATE POLICY "Users can delete projects they own"
    ON construction_mgr.be_project
    FOR DELETE
    USING (owner_id = auth.uid());

-- ==============================================================================
-- PROJECT MEMBER TABLE POLICIES
-- ==============================================================================

CREATE POLICY "Users can view their own project memberships"
    ON construction_mgr.be_project_member
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Project owners can view their project members"
    ON construction_mgr.be_project_member
    FOR SELECT
    USING (
        private.is_project_owner_direct(project_id, auth.uid())
    );

CREATE POLICY "Project owners can manage their project members"
    ON construction_mgr.be_project_member
    FOR ALL
    USING (
        private.is_project_owner_direct(project_id, auth.uid())
    );

CREATE POLICY "Admins can manage project members"
    ON construction_mgr.be_project_member
    FOR ALL
    USING (
        private.check_user_project_role_direct(
            project_id, 
            auth.uid(), 
            ARRAY['ADMIN']::construction_mgr.user_role[]
        )
    );

-- ==============================================================================
-- MATERIAL TRANSACTION POLICIES
-- ==============================================================================

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

-- ==============================================================================
-- COMMENT POLICIES
-- ==============================================================================

CREATE POLICY "Users can view comments for entities they have access to"
    ON construction_mgr.comment
    FOR SELECT
    USING (
        CASE entity_type
            WHEN 'project' THEN 
                private.has_project_access_direct(entity_id::uuid, auth.uid())
            WHEN 'task' THEN EXISTS (
                SELECT 1 FROM construction_mgr.be_task t 
                WHERE t.id = entity_id::uuid 
                AND private.has_project_access_direct(t.project_id, auth.uid())
            )
            WHEN 'phase' THEN EXISTS (
                SELECT 1 FROM construction_mgr.be_phase p 
                WHERE p.id = entity_id::uuid 
                AND private.has_project_access_direct(p.project_id, auth.uid())
            )
            ELSE FALSE
        END
    );

CREATE POLICY "Users can create comments for entities they have access to"
    ON construction_mgr.comment
    FOR INSERT
    WITH CHECK (
        CASE entity_type
            WHEN 'project' THEN 
                private.has_project_access_direct(entity_id::uuid, auth.uid())
            WHEN 'task' THEN EXISTS (
                SELECT 1 FROM construction_mgr.be_task t 
                WHERE t.id = entity_id::uuid 
                AND private.has_project_access_direct(t.project_id, auth.uid())
            )
            WHEN 'phase' THEN EXISTS (
                SELECT 1 FROM construction_mgr.be_phase p 
                WHERE p.id = entity_id::uuid 
                AND private.has_project_access_direct(p.project_id, auth.uid())
            )
            ELSE FALSE
        END
    );

-- ==============================================================================
-- PHASE TABLE POLICIES
-- ==============================================================================

CREATE POLICY "Users can view phases for projects they have access to"
    ON construction_mgr.be_phase
    FOR SELECT
    USING (
        private.has_project_access_direct(project_id, auth.uid())
    );

CREATE POLICY "Project owners can manage phases"
    ON construction_mgr.be_phase
    FOR ALL
    USING (
        private.is_project_owner_direct(project_id, auth.uid())
    );

CREATE POLICY "Project participants with ADMIN role can manage phases"
    ON construction_mgr.be_phase
    FOR ALL
    USING (
        private.check_user_project_role_direct(
            project_id, 
            auth.uid(), 
            ARRAY['ADMIN']::construction_mgr.user_role[]
        )
    );

CREATE POLICY "Project participants with CONTRACTOR role can update phases"
    ON construction_mgr.be_phase
    FOR UPDATE
    USING (
        private.check_user_project_role_direct(
            project_id, 
            auth.uid(), 
            ARRAY['CONTRACTOR']::construction_mgr.user_role[]
        )
    );

-- Phase budget RLS policy
CREATE POLICY "Only members with VIEW_BUDGET permission can see phase budget details"
    ON construction_mgr.be_phase
    FOR SELECT
    USING (
        private.is_project_owner_direct(project_id, auth.uid()) OR
        private.has_permission_direct(project_id, auth.uid(), 'VIEW_BUDGET')
    );

-- ==============================================================================
-- MATERIAL TABLE POLICIES
-- ==============================================================================

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

-- ==============================================================================
-- FINANCIAL TRANSACTION TABLE POLICIES
-- ==============================================================================

CREATE POLICY "Users can view financial transactions for projects they have access to"
    ON construction_mgr.financial_transaction
    FOR SELECT
    USING (
        private.has_project_access_direct(project_id, auth.uid()) AND
        private.has_permission_direct(project_id, auth.uid(), 'VIEW_FINANCIALS')
    );

CREATE POLICY "Project owners can manage financial transactions"
    ON construction_mgr.financial_transaction
    FOR ALL
    USING (
        private.is_project_owner_direct(project_id, auth.uid())
    );

CREATE POLICY "Project participants with ADMIN role can manage financial transactions"
    ON construction_mgr.financial_transaction
    FOR ALL
    USING (
        private.check_user_project_role_direct(
            project_id, 
            auth.uid(), 
            ARRAY['ADMIN']::construction_mgr.user_role[]
        )
    );

CREATE POLICY "Project participants with CONTRACTOR role can create financial transactions"
    ON construction_mgr.financial_transaction
    FOR INSERT
    WITH CHECK (
        private.check_user_project_role_direct(
            project_id, 
            auth.uid(), 
            ARRAY['CONTRACTOR']::construction_mgr.user_role[]
        )
    );

CREATE POLICY "Project participants with CONTRACTOR role can update financial transactions"
    ON construction_mgr.financial_transaction
    FOR UPDATE
    USING (
        private.check_user_project_role_direct(
            project_id, 
            auth.uid(), 
            ARRAY['CONTRACTOR']::construction_mgr.user_role[]
        )
    );

-- ==============================================================================
-- DOCUMENT TABLE POLICIES
-- ==============================================================================

CREATE POLICY "Users can view documents for projects they have access to"
    ON construction_mgr.be_document
    FOR SELECT
    USING (
        private.has_project_access_direct(project_id, auth.uid())
    );

CREATE POLICY "Project owners can manage documents"
    ON construction_mgr.be_document
    FOR ALL
    USING (
        private.is_project_owner_direct(project_id, auth.uid())
    );

CREATE POLICY "Project participants with ADMIN role can manage documents"
    ON construction_mgr.be_document
    FOR ALL
    USING (
        private.check_user_project_role_direct(
            project_id, 
            auth.uid(), 
            ARRAY['ADMIN']::construction_mgr.user_role[]
        )
    );

CREATE POLICY "Project participants with any role can create documents"
    ON construction_mgr.be_document
    FOR INSERT
    WITH CHECK (
        private.has_project_access_direct(project_id, auth.uid())
    );

-- ==============================================================================
-- NOTIFICATION TABLE POLICIES
-- ==============================================================================

CREATE POLICY "Users can view their own notifications"
    ON construction_mgr.be_notification
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
    ON construction_mgr.be_notification
    FOR UPDATE
    USING (user_id = auth.uid());

-- ==============================================================================
-- AUDIT LOG TABLE POLICIES
-- ==============================================================================

CREATE POLICY "Users can view audit logs for their own projects"
    ON construction_mgr.be_audit_log
    FOR SELECT
    USING (
        -- Check if the audit log relates to a project the user owns/participates in
        CASE 
            WHEN entity_type = 'project' THEN 
                private.has_project_access_direct(entity_id::uuid, auth.uid())
            WHEN details ? 'project_id' THEN 
                private.has_project_access_direct((details->>'project_id')::uuid, auth.uid())
            ELSE 
                user_id = auth.uid()  -- Default to user's own actions
        END
    );

CREATE POLICY "Admins can view all audit logs"
    ON construction_mgr.be_audit_log
    FOR SELECT
    USING (private.is_admin_direct(auth.uid()));

CREATE POLICY "Authenticated users can create audit log entries"
    ON construction_mgr.be_audit_log
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND user_id = auth.uid()
    );

-- ==============================================================================
-- TASK TABLE POLICIES
-- ==============================================================================

CREATE POLICY "Users can view tasks for projects they have access to"
    ON construction_mgr.be_task
    FOR SELECT
    USING (
        private.has_project_access_direct(project_id, auth.uid())
    );

CREATE POLICY "Project owners can manage tasks"
    ON construction_mgr.be_task
    FOR ALL
    USING (
        private.is_project_owner_direct(project_id, auth.uid())
    );

CREATE POLICY "Project participants with ADMIN role can manage tasks"
    ON construction_mgr.be_task
    FOR ALL
    USING (
        private.check_user_project_role_direct(
            project_id, 
            auth.uid(), 
            ARRAY['ADMIN']::construction_mgr.user_role[]
        )
    );

CREATE POLICY "Project participants with CONTRACTOR role can manage tasks"
    ON construction_mgr.be_task
    FOR ALL
    USING (
        private.check_user_project_role_direct(
            project_id, 
            auth.uid(), 
            ARRAY['CONTRACTOR']::construction_mgr.user_role[]
        )
    );

CREATE POLICY "Users can update tasks assigned to them"
    ON construction_mgr.be_task
    FOR UPDATE
    USING (
        assigned_to = auth.uid()
    );

-- ==============================================================================
-- QUALITY INSPECTION TABLE POLICIES
-- ==============================================================================

CREATE POLICY "Users can view quality inspections for phases they have access to"
    ON construction_mgr.be_quality_inspection
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM construction_mgr.be_phase p
            WHERE p.id = phase_id
            AND private.has_project_access_direct(p.project_id, auth.uid())
        )
    );

CREATE POLICY "Project owners can manage quality inspections"
    ON construction_mgr.be_quality_inspection
    FOR ALL
    USING (
        phase_id IN (
            SELECT p.id
            FROM construction_mgr.be_phase p
            WHERE private.is_project_owner_direct(p.project_id, auth.uid())
        )
    );

CREATE POLICY "Project participants with ADMIN role can manage quality inspections"
    ON construction_mgr.be_quality_inspection
    FOR ALL
    USING (
        phase_id IN (
            SELECT p.id
            FROM construction_mgr.be_phase p
            WHERE private.check_user_project_role_direct(
                p.project_id,
                auth.uid(),
                ARRAY['ADMIN']::construction_mgr.user_role[]
            )
        )
    );

CREATE POLICY "Inspectors can update their own inspections"
    ON construction_mgr.be_quality_inspection
    FOR UPDATE
    USING (
        inspector_id = auth.uid()
    );

CREATE POLICY "Project participants with CONTRACTOR role can create and update inspections"
    ON construction_mgr.be_quality_inspection
    FOR ALL
    USING (
        phase_id IN (
            SELECT p.id
            FROM construction_mgr.be_phase p
            WHERE private.check_user_project_role_direct(
                p.project_id,
                auth.uid(),
                ARRAY['CONTRACTOR']::construction_mgr.user_role[]
            )
        )
    );

-- ==============================================================================
-- MIGRATION COMPLETE
-- ==============================================================================

-- Add comment to track this change
COMMENT ON SCHEMA construction_mgr IS 'RLS policies updated with recursion-safe direct functions to prevent infinite loops in policy evaluation.';