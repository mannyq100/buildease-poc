-- Create Row Level Security (RLS) policies for all tables

-- User table policies
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
    USING (private.is_admin());

CREATE POLICY "Admins can update all users"
    ON construction_mgr.be_user
    FOR UPDATE
    USING (private.is_admin());

-- Project table policies
CREATE POLICY "Users can view projects they own"
    ON construction_mgr.be_project
    FOR SELECT
    USING (owner_id = auth.uid());

CREATE POLICY "Users can view projects they participate in"
    ON construction_mgr.be_project
    FOR SELECT
    USING (
        id IN (
            SELECT project_id
            FROM construction_mgr.be_project_member
            WHERE user_id = auth.uid()
        )
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
        private.check_user_project_role(
            id, 
            auth.uid(), 
            ARRAY['ADMIN']::construction_mgr.user_role[]
        )
    );

CREATE POLICY "Users can delete projects they own"
    ON construction_mgr.be_project
    FOR DELETE
    USING (owner_id = auth.uid());

-- Project Member table policies
CREATE POLICY "Users can view project members for their projects"
    ON construction_mgr.be_project_member
    FOR SELECT
    USING (
        private.has_project_access(project_id)
    );

CREATE POLICY "Project owners can manage project members"
    ON construction_mgr.be_project_member
    FOR ALL
    USING (
        project_id IN (
            SELECT id 
            FROM construction_mgr.be_project 
            WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage project members"
    ON construction_mgr.be_project_member
    FOR ALL
    USING (
        private.check_user_project_role(
            project_id, 
            auth.uid(), 
            ARRAY['ADMIN']::construction_mgr.user_role[]
        )
    );

-- Material Transaction policies
CREATE POLICY "Users can view material transactions for projects they have access to"
    ON construction_mgr.material_transaction
    FOR SELECT
    USING (private.has_project_access(project_id));

CREATE POLICY "Project members can create material transactions"
    ON construction_mgr.material_transaction
    FOR INSERT
    WITH CHECK (private.has_project_access(project_id));

-- Comment policies
CREATE POLICY "Users can view comments for entities they have access to"
    ON construction_mgr.comment
    FOR SELECT
    USING (
        (entity_type = 'project' AND private.has_project_access(entity_id::uuid)) OR
        (entity_type = 'task' AND private.has_project_access(
            (SELECT project_id FROM construction_mgr.be_task WHERE id = entity_id::uuid)
        )) OR
        (entity_type = 'phase' AND private.has_project_access(
            (SELECT project_id FROM construction_mgr.be_phase WHERE id = entity_id::uuid)
        ))
    );

CREATE POLICY "Users can create comments for entities they have access to"
    ON construction_mgr.comment
    FOR INSERT
    WITH CHECK (
        (entity_type = 'project' AND private.has_project_access(entity_id::uuid)) OR
        (entity_type = 'task' AND private.has_project_access(
            (SELECT project_id FROM construction_mgr.be_task WHERE id = entity_id::uuid)
        )) OR
        (entity_type = 'phase' AND private.has_project_access(
            (SELECT project_id FROM construction_mgr.be_phase WHERE id = entity_id::uuid)
        ))
    );

-- Phase table policies
CREATE POLICY "Users can view phases for projects they have access to"
    ON construction_mgr.be_phase
    FOR SELECT
    USING (
        private.has_project_access(project_id)
    );

CREATE POLICY "Project owners can manage phases"
    ON construction_mgr.be_phase
    FOR ALL
    USING (
        project_id IN (
            SELECT id 
            FROM construction_mgr.be_project 
            WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Project participants with ADMIN role can manage phases"
    ON construction_mgr.be_phase
    FOR ALL
    USING (
        private.check_user_project_role(
            project_id, 
            auth.uid(), 
            ARRAY['ADMIN']::construction_mgr.user_role[]
        )
    );

CREATE POLICY "Project participants with CONTRACTOR role can update phases"
    ON construction_mgr.be_phase
    FOR UPDATE
    USING (
        private.check_user_project_role(
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
        auth.uid() = (SELECT owner_id FROM construction_mgr.be_project WHERE id = project_id) OR
        private.has_permission(project_id, auth.uid(), 'VIEW_BUDGET')
    );

-- Material table policies
CREATE POLICY "Users can view materials for projects they have access to"
    ON construction_mgr.be_material
    FOR SELECT
    USING (
        private.has_project_access(project_id)
    );

CREATE POLICY "Project owners can manage materials"
    ON construction_mgr.be_material
    FOR ALL
    USING (
        project_id IN (
            SELECT id 
            FROM construction_mgr.be_project 
            WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Project participants with ADMIN role can manage materials"
    ON construction_mgr.be_material
    FOR ALL
    USING (
        private.check_user_project_role(
            project_id, 
            auth.uid(), 
            ARRAY['ADMIN']::construction_mgr.user_role[]
        )
    );

CREATE POLICY "Project participants with SUPPLIER role can update materials"
    ON construction_mgr.be_material
    FOR UPDATE
    USING (
        private.check_user_project_role(
            project_id, 
            auth.uid(), 
            ARRAY['SUPPLIER']::construction_mgr.user_role[]
        )
    );

-- Financial Transaction table policies
CREATE POLICY "Users can view financial transactions for projects they have access to"
    ON construction_mgr.financial_transaction
    FOR SELECT
    USING (
        private.has_project_access(project_id) AND
        private.has_permission(project_id, auth.uid(), 'VIEW_FINANCIALS')
    );

CREATE POLICY "Project owners can manage financial transactions"
    ON construction_mgr.financial_transaction
    FOR ALL
    USING (
        project_id IN (
            SELECT id 
            FROM construction_mgr.be_project 
            WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Project participants with ADMIN role can manage financial transactions"
    ON construction_mgr.financial_transaction
    FOR ALL
    USING (
        private.check_user_project_role(
            project_id, 
            auth.uid(), 
            ARRAY['ADMIN']::construction_mgr.user_role[]
        )
    );

CREATE POLICY "Project participants with CONTRACTOR role can create financial transactions"
    ON construction_mgr.financial_transaction
    FOR INSERT
    WITH CHECK (
        private.check_user_project_role(
            project_id, 
            auth.uid(), 
            ARRAY['CONTRACTOR']::construction_mgr.user_role[]
        )
    );

CREATE POLICY "Project participants with CONTRACTOR role can update financial transactions"
    ON construction_mgr.financial_transaction
    FOR UPDATE
    USING (
        private.check_user_project_role(
            project_id, 
            auth.uid(), 
            ARRAY['CONTRACTOR']::construction_mgr.user_role[]
        )
    );

-- Document table policies
CREATE POLICY "Users can view documents for projects they have access to"
    ON construction_mgr.be_document
    FOR SELECT
    USING (
        private.has_project_access(project_id)
    );

CREATE POLICY "Project owners can manage documents"
    ON construction_mgr.be_document
    FOR ALL
    USING (
        project_id IN (
            SELECT id 
            FROM construction_mgr.be_project 
            WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Project participants with ADMIN role can manage documents"
    ON construction_mgr.be_document
    FOR ALL
    USING (
        private.check_user_project_role(
            project_id, 
            auth.uid(), 
            ARRAY['ADMIN']::construction_mgr.user_role[]
        )
    );

CREATE POLICY "Project participants with any role can create documents"
    ON construction_mgr.be_document
    FOR INSERT
    WITH CHECK (
        private.has_project_access(project_id)
    );

-- Notification table policies
CREATE POLICY "Users can view their own notifications"
    ON construction_mgr.be_notification
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
    ON construction_mgr.be_notification
    FOR UPDATE
    USING (user_id = auth.uid());

-- Audit Log table policies
CREATE POLICY "Users can view audit logs for their own projects"
    ON construction_mgr.be_audit_log
    FOR SELECT
    USING (
        details->>'project_id' IN (
            SELECT id::text 
            FROM construction_mgr.be_project 
            WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all audit logs"
    ON construction_mgr.be_audit_log
    FOR SELECT
    USING (private.is_admin());

-- Task table policies
CREATE POLICY "Users can view tasks for projects they have access to"
    ON construction_mgr.be_task
    FOR SELECT
    USING (
        private.has_project_access(project_id)
    );

CREATE POLICY "Project owners can manage tasks"
    ON construction_mgr.be_task
    FOR ALL
    USING (
        project_id IN (
            SELECT id 
            FROM construction_mgr.be_project 
            WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Project participants with ADMIN role can manage tasks"
    ON construction_mgr.be_task
    FOR ALL
    USING (
        private.check_user_project_role(
            project_id, 
            auth.uid(), 
            ARRAY['ADMIN']::construction_mgr.user_role[]
        )
    );

CREATE POLICY "Project participants with CONTRACTOR role can manage tasks"
    ON construction_mgr.be_task
    FOR ALL
    USING (
        private.check_user_project_role(
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

-- Quality Inspection table policies
CREATE POLICY "Users can view quality inspections for phases they have access to"
    ON construction_mgr.be_quality_inspection
    FOR SELECT
    USING (
        phase_id IN (
            SELECT id
            FROM construction_mgr.be_phase
            WHERE private.has_project_access(project_id)
        )
    );

CREATE POLICY "Project owners can manage quality inspections"
    ON construction_mgr.be_quality_inspection
    FOR ALL
    USING (
        phase_id IN (
            SELECT p.id
            FROM construction_mgr.be_phase p
            JOIN construction_mgr.be_project pr ON p.project_id = pr.id
            WHERE pr.owner_id = auth.uid()
        )
    );

CREATE POLICY "Project participants with ADMIN role can manage quality inspections"
    ON construction_mgr.be_quality_inspection
    FOR ALL
    USING (
        phase_id IN (
            SELECT p.id
            FROM construction_mgr.be_phase p
            JOIN construction_mgr.be_project pr ON p.project_id = pr.id
            WHERE private.check_user_project_role(
                pr.id,
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
            JOIN construction_mgr.be_project pr ON p.project_id = pr.id
            WHERE private.check_user_project_role(
                pr.id,
                auth.uid(),
                ARRAY['CONTRACTOR']::construction_mgr.user_role[]
            )
        )
    );

-- Note: Consolidated financial policies moved to dedicated permissions file
-- This policy is superseded by the more comprehensive budget access controls
