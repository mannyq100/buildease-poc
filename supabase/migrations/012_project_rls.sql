-- Migration: 009_project_rls.sql
-- Purpose: Defines RLS policies for the core project management domain.

-- PROJECT TABLE POLICIES
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

-- PROJECT MEMBER TABLE POLICIES
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

-- PHASE TABLE POLICIES
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

-- TASK TABLE POLICIES
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

-- COMMENT POLICIES
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

-- QUALITY INSPECTION TABLE POLICIES
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
