-- Migration: 012_financial_rls.sql
-- Purpose: Defines RLS policies for the financial domain.

-- FINANCIAL TRANSACTION TABLE POLICIES
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

-- RLS policy for project budget
CREATE POLICY "Only members with VIEW_BUDGET permission can see project budget"
    ON construction_mgr.be_project
    FOR SELECT
    USING (
        owner_id = auth.uid() OR 
        private.has_permission(id, auth.uid(), 'VIEW_BUDGET')
    );
