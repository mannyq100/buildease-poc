-- Migration: 019_ai_plan_rls.sql
-- Purpose: Defines RLS policies for the AI and plan generation domain.

-- AI PLAN JOBS TABLE POLICIES
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

-- AI GENERATED PLAN TABLE POLICIES
-- Note: RLS for ai_generated_plan is implicitly handled by project access.
-- We can add more granular policies here if needed.
