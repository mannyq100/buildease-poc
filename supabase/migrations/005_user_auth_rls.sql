-- Migration: 005_user_auth_rls.sql
-- Purpose: Defines RLS policies for user authentication and authorization tables.

-- USER TABLE POLICIES
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

-- AUDIT LOG TABLE POLICIES
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



-- Policies for service_role to bypass RLS for auth trigger
CREATE POLICY "Allow service_role to insert users" ON construction_mgr.be_user
    FOR INSERT TO service_role
    WITH CHECK (true);

CREATE POLICY "Allow service_role to insert audit logs" ON construction_mgr.be_audit_log
    FOR INSERT TO service_role
    WITH CHECK (true);
