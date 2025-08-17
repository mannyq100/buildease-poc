-- Migration: 012_rls_policies.sql
-- Purpose: Defines all Row Level Security (RLS) policies for the application.

-- =============================================================================
-- USER TABLE POLICIES
-- =============================================================================

-- Enable RLS on user table
ALTER TABLE construction_mgr.be_user ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON construction_mgr.be_user
    FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
    ON construction_mgr.be_user
    FOR UPDATE
    USING (id = auth.uid());

-- Policies for service_role to bypass RLS for auth trigger
CREATE POLICY "Allow service_role to insert users" ON construction_mgr.be_user
    FOR INSERT TO service_role
    WITH CHECK (true);

-- =============================================================================
-- AUDIT LOG TABLE POLICIES
-- =============================================================================

-- Enable RLS on audit log table
ALTER TABLE construction_mgr.be_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit logs"
    ON construction_mgr.be_audit_log
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can create audit log entries"
    ON construction_mgr.be_audit_log
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND user_id = auth.uid()
    );

CREATE POLICY "Allow service_role to insert audit logs" ON construction_mgr.be_audit_log
    FOR INSERT TO service_role
    WITH CHECK (true);

-- =============================================================================
-- PROJECT PERMISSION TABLE POLICIES
-- =============================================================================

-- Enable RLS on project permission table
ALTER TABLE construction_mgr.be_project_permission ENABLE ROW LEVEL SECURITY;

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

-- =============================================================================
-- NOTIFICATION TABLE POLICIES
-- =============================================================================

-- Enable RLS on notification table
ALTER TABLE construction_mgr.be_notification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
    ON construction_mgr.be_notification
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
    ON construction_mgr.be_notification
    FOR UPDATE
    USING (user_id = auth.uid());

-- =============================================================================
-- PROJECT TABLE POLICIES
-- =============================================================================

-- Enable RLS on project table
ALTER TABLE construction_mgr.be_project ENABLE ROW LEVEL SECURITY;

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

-- RLS policy for project budget
CREATE POLICY "Only members with VIEW_BUDGET permission can see project budget"
    ON construction_mgr.be_project
    FOR SELECT
    USING (
        owner_id = auth.uid() OR 
        private.has_permission(id, auth.uid(), 'VIEW_BUDGET')
    );

-- =============================================================================
-- PROJECT MEMBER TABLE POLICIES
-- =============================================================================

-- Enable RLS on project member table
ALTER TABLE construction_mgr.be_project_member ENABLE ROW LEVEL SECURITY;

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

-- =============================================================================
-- PHASE TABLE POLICIES
-- =============================================================================

-- Enable RLS on phase table
ALTER TABLE construction_mgr.be_phase ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view phases for projects they have access to"
    ON construction_mgr.be_phase
    FOR SELECT
    USING (
        private.has_project_access_direct(construction_mgr.be_phase.project_id, auth.uid())
    );

CREATE POLICY "Project owners can manage phases"
    ON construction_mgr.be_phase
    FOR ALL
    USING (
        private.is_project_owner_direct(construction_mgr.be_phase.project_id, auth.uid())
    )
    WITH CHECK (
        private.is_project_owner_direct(construction_mgr.be_phase.project_id, auth.uid())
    );

CREATE POLICY "Project participants with ADMIN role can manage phases"
    ON construction_mgr.be_phase
    FOR ALL
    USING (
        private.check_user_project_role_direct(
            construction_mgr.be_phase.project_id, 
            auth.uid(), 
            ARRAY['ADMIN']::construction_mgr.user_role[]
        )
    )
    WITH CHECK (
        private.check_user_project_role_direct(
            construction_mgr.be_phase.project_id,
            auth.uid(),
            ARRAY['ADMIN']::construction_mgr.user_role[]
        )
    );

CREATE POLICY "Project participants with CONTRACTOR role can update phases"
    ON construction_mgr.be_phase
    FOR UPDATE
    USING (
        private.check_user_project_role_direct(
            construction_mgr.be_phase.project_id, 
            auth.uid(), 
            ARRAY['CONTRACTOR']::construction_mgr.user_role[]
        )
    )
    WITH CHECK (
        private.check_user_project_role_direct(
            construction_mgr.be_phase.project_id,
            auth.uid(),
            ARRAY['CONTRACTOR']::construction_mgr.user_role[]
        )
    );

-- Phase budget RLS policy
CREATE POLICY "Only members with VIEW_BUDGET permission can see phase budget details"
    ON construction_mgr.be_phase
    FOR SELECT
    USING (
        private.is_project_owner_direct(construction_mgr.be_phase.project_id, auth.uid()) OR
        private.has_permission_direct(construction_mgr.be_phase.project_id, auth.uid(), 'VIEW_BUDGET')
    );

-- =============================================================================
-- TASK TABLE POLICIES
-- =============================================================================

-- Enable RLS on task table
ALTER TABLE construction_mgr.be_task ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tasks for projects they have access to"
    ON construction_mgr.be_task
    FOR SELECT
    USING (
        private.has_project_access_direct(construction_mgr.be_task.project_id, auth.uid())
    );

CREATE POLICY "Project owners can manage tasks"
    ON construction_mgr.be_task
    FOR ALL
    USING (
        private.is_project_owner_direct(construction_mgr.be_task.project_id, auth.uid())
    )
    WITH CHECK (
        private.is_project_owner_direct(construction_mgr.be_task.project_id, auth.uid())
    );

CREATE POLICY "Project participants with ADMIN role can manage tasks"
    ON construction_mgr.be_task
    FOR ALL
    USING (
        private.check_user_project_role_direct(
            construction_mgr.be_task.project_id, 
            auth.uid(), 
            ARRAY['ADMIN']::construction_mgr.user_role[]
        )
    )
    WITH CHECK (
        private.check_user_project_role_direct(
            construction_mgr.be_task.project_id,
            auth.uid(),
            ARRAY['ADMIN']::construction_mgr.user_role[]
        )
    );

CREATE POLICY "Project participants with CONTRACTOR role can manage tasks"
    ON construction_mgr.be_task
    FOR ALL
    USING (
        private.check_user_project_role_direct(
            construction_mgr.be_task.project_id, 
            auth.uid(), 
            ARRAY['CONTRACTOR']::construction_mgr.user_role[]
        )
    )
    WITH CHECK (
        private.check_user_project_role_direct(
            construction_mgr.be_task.project_id,
            auth.uid(),
            ARRAY['CONTRACTOR']::construction_mgr.user_role[]
        )
    );

CREATE POLICY "Users can update tasks assigned to them"
    ON construction_mgr.be_task
    FOR UPDATE
    USING (
        assigned_to = auth.uid()
    )
    WITH CHECK (
        assigned_to = auth.uid()
    );

-- =============================================================================
-- COMMENT TABLE POLICIES
-- =============================================================================

-- Enable RLS on comment table
ALTER TABLE construction_mgr.comment ENABLE ROW LEVEL SECURITY;

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
        AND
        -- Ensure user_id matches the authenticated user
        user_id = auth.uid()
        -- Note: Removed parent_comment_id check to prevent infinite recursion
        -- If user can comment on entity, they can reply to any comment on that entity
    );

-- Policy for users to update their own comments
CREATE POLICY "Users can update their own comments"
    ON construction_mgr.comment
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Policy for users to delete their own comments
CREATE POLICY "Users can delete their own comments"
    ON construction_mgr.comment
    FOR DELETE
    USING (user_id = auth.uid());

-- =============================================================================
-- QUALITY INSPECTION TABLE POLICIES
-- =============================================================================

-- Enable RLS on quality inspection table
ALTER TABLE construction_mgr.be_quality_inspection ENABLE ROW LEVEL SECURITY;

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

-- =============================================================================
-- PROJECT ACTIVITY TABLE POLICIES
-- =============================================================================

-- Enable RLS on project activity table
ALTER TABLE construction_mgr.be_project_activity ENABLE ROW LEVEL SECURITY;

-- Users can view activities for projects they're members of
CREATE POLICY "Users can view project activities" 
    ON construction_mgr.be_project_activity FOR SELECT
    USING (
        project_id IN (
            SELECT project_id 
            FROM construction_mgr.be_project_member 
            WHERE user_id = auth.uid()
        )
    );

-- Users can create activities for projects they're members of
CREATE POLICY "Users can create project activities" 
    ON construction_mgr.be_project_activity FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT project_id 
            FROM construction_mgr.be_project_member 
            WHERE user_id = auth.uid()
        )
    );

-- Users can update their own activities
CREATE POLICY "Users can update own activities" 
    ON construction_mgr.be_project_activity FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Service role can manage all activities
CREATE POLICY "Service role can manage project activities" 
    ON construction_mgr.be_project_activity FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- =============================================================================
-- FINANCIAL TRANSACTION TABLE POLICIES
-- =============================================================================

-- Enable RLS on financial transaction table
ALTER TABLE construction_mgr.financial_transaction ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view financial transactions for projects they have access to"
    ON construction_mgr.financial_transaction
    FOR SELECT
    USING (
        private.has_project_access_direct(project_id, auth.uid())
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

CREATE POLICY "Project members can create financial transactions"
    ON construction_mgr.financial_transaction
    FOR INSERT
    WITH CHECK (
        private.has_project_access_direct(project_id, auth.uid())
    );

CREATE POLICY "Project members can update financial transactions"
    ON construction_mgr.financial_transaction
    FOR UPDATE
    USING (
        private.has_project_access_direct(project_id, auth.uid())
    );

-- =============================================================================
-- MATERIAL TABLE POLICIES
-- =============================================================================

-- Enable RLS on material table
ALTER TABLE construction_mgr.be_material ENABLE ROW LEVEL SECURITY;

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

-- =============================================================================
-- MATERIAL TRANSACTION TABLE POLICIES
-- =============================================================================

-- Enable RLS on material transaction table
ALTER TABLE construction_mgr.material_transaction ENABLE ROW LEVEL SECURITY;

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

-- =============================================================================
-- DOCUMENT TABLE POLICIES
-- =============================================================================

-- Enable RLS on document table
ALTER TABLE construction_mgr.be_document ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view documents for accessible projects"
    ON construction_mgr.be_document
    FOR SELECT
    USING (private.has_project_access_direct(project_id, auth.uid()));

CREATE POLICY "Users can manage documents for owned projects"
    ON construction_mgr.be_document
    FOR ALL
    USING (private.is_project_owner_direct(project_id, auth.uid()));

CREATE POLICY "Project members can create documents"
    ON construction_mgr.be_document
    FOR INSERT
    WITH CHECK (private.has_project_access_direct(project_id, auth.uid()));

-- =============================================================================
-- MEDIA COLLECTION TABLE POLICIES
-- =============================================================================

-- Enable RLS on media collection table
ALTER TABLE construction_mgr.media_collection ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view collections for accessible projects"
    ON construction_mgr.media_collection
    FOR SELECT
    USING (
        project_id IN (
            SELECT p.id 
            FROM construction_mgr.be_project p 
            WHERE p.owner_id = auth.uid()
            OR EXISTS (
                SELECT 1 
                FROM construction_mgr.be_project_member pm 
                WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can create collections for accessible projects"
    ON construction_mgr.media_collection
    FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT p.id 
            FROM construction_mgr.be_project p 
            WHERE p.owner_id = auth.uid()
            OR EXISTS (
                SELECT 1 
                FROM construction_mgr.be_project_member pm 
                WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
            )
        )
        AND created_by = auth.uid()
    );

CREATE POLICY "Users can update their own collections"
    ON construction_mgr.media_collection
    FOR UPDATE
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete their own collections"
    ON construction_mgr.media_collection
    FOR DELETE
    USING (created_by = auth.uid());

-- =============================================================================
-- COLLECTION DOCUMENT TABLE POLICIES
-- =============================================================================

-- Enable RLS on collection document table
ALTER TABLE construction_mgr.collection_document ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view collection documents for accessible collections"
    ON construction_mgr.collection_document
    FOR SELECT
    USING (
        collection_id IN (
            SELECT id FROM construction_mgr.media_collection
            WHERE project_id IN (
                SELECT p.id 
                FROM construction_mgr.be_project p 
                WHERE p.owner_id = auth.uid()
                OR EXISTS (
                    SELECT 1 
                    FROM construction_mgr.be_project_member pm 
                    WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can manage collection documents for their collections"
    ON construction_mgr.collection_document
    FOR ALL
    USING (
        collection_id IN (
            SELECT id FROM construction_mgr.media_collection
            WHERE created_by = auth.uid()
        )
    )
    WITH CHECK (
        collection_id IN (
            SELECT id FROM construction_mgr.media_collection
            WHERE created_by = auth.uid()
        )
        AND added_by = auth.uid()
    );

-- =============================================================================
-- MEDIA PROCESSING QUEUE TABLE POLICIES
-- =============================================================================

-- Enable RLS on media processing queue table
ALTER TABLE construction_mgr.media_processing_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view processing for their documents"
    ON construction_mgr.media_processing_queue
    FOR SELECT
    USING (
        document_id IN (
            SELECT d.id 
            FROM construction_mgr.be_document d
            JOIN construction_mgr.be_project p ON d.project_id = p.id
            WHERE p.owner_id = auth.uid()
            OR EXISTS (
                SELECT 1 
                FROM construction_mgr.be_project_member pm 
                WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
            )
        )
    );

-- =============================================================================
-- AI PLAN JOBS TABLE POLICIES
-- =============================================================================

-- Enable RLS on AI plan jobs table
ALTER TABLE construction_mgr.ai_plan_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view AI plan jobs for projects they have access to"
    ON construction_mgr.ai_plan_jobs
    FOR SELECT
    USING (
        private.has_project_access_direct(project_id, auth.uid())
    );

CREATE POLICY "Project owners can manage AI plan jobs"
    ON construction_mgr.ai_plan_jobs
    FOR ALL
    USING (
        private.is_project_owner_direct(project_id, auth.uid())
    );

CREATE POLICY "System can create and update AI plan jobs"
    ON construction_mgr.ai_plan_jobs
    FOR ALL
    USING (true);

-- =============================================================================
-- AI GENERATED PLAN TABLE POLICIES
-- =============================================================================

-- Enable RLS on AI generated plan table
ALTER TABLE construction_mgr.ai_generated_plan ENABLE ROW LEVEL SECURITY;

-- Note: RLS for ai_generated_plan is implicitly handled by project access.
-- We can add more granular policies here if needed.

-- =============================================================================
-- STORAGE BUCKET POLICIES
-- =============================================================================

-- RLS is already enabled on storage.objects by Supabase
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES BUCKET (public read, user manages own files)
CREATE POLICY "Public read access for profiles"
ON storage.objects FOR SELECT
USING (bucket_id = 'profiles');

CREATE POLICY "Users can manage their own profile pictures"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'profiles' 
    AND private.has_storage_access('profiles', name, auth.uid())
)
WITH CHECK (
    bucket_id = 'profiles' 
    AND private.has_storage_access('profiles', name, auth.uid())
);

-- 2. PROJECT INSPIRATION BUCKET (public read, all authenticated users can contribute)  
CREATE POLICY "Public read access for inspiration images"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-inspiration');

CREATE POLICY "Authenticated users can manage inspiration images"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'project-inspiration'
    AND auth.uid() IS NOT NULL
)
WITH CHECK (
    bucket_id = 'project-inspiration'
    AND auth.uid() IS NOT NULL
);

-- 3. PROGRESS IMAGES BUCKET (public read, all authenticated users can contribute)
CREATE POLICY "Public read access for progress images"
ON storage.objects FOR SELECT
USING (bucket_id = 'progress-images');

CREATE POLICY "Authenticated users can manage progress images"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'progress-images'
    AND auth.uid() IS NOT NULL
)
WITH CHECK (
    bucket_id = 'progress-images'
    AND auth.uid() IS NOT NULL
);

-- 4. DOCUMENTS BUCKET (private, project member access)
CREATE POLICY "Project members can view documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'documents'
    AND private.has_storage_access('documents', name, auth.uid())
);

CREATE POLICY "Project members can manage documents"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'documents'
    AND private.has_storage_access('documents', name, auth.uid())
)
WITH CHECK (
    bucket_id = 'documents'
    AND private.has_storage_access('documents', name, auth.uid())
);
