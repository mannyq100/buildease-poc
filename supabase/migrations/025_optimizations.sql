-- Migration: 021_optimizations.sql
-- Purpose: Defines performance optimizations, including partial indexes and materialized views.

-- Add partial indexes for specific use cases
CREATE INDEX IF NOT EXISTS idx_permission_active_project_user 
    ON construction_mgr.be_project_permission (project_id, user_id) 
    WHERE active = TRUE;

CREATE INDEX IF NOT EXISTS idx_permission_financial_active 
    ON construction_mgr.be_project_permission (project_id, user_id) 
    WHERE permission IN ('VIEW_FINANCIALS', 'VIEW_BUDGET') AND active = TRUE;

-- Create materialized view for project summaries (for reporting)
CREATE MATERIALIZED VIEW construction_mgr.project_stats_mv AS
SELECT 
    p.id AS project_id,
    p.name,
    p.status,
    p.owner_id,
    COUNT(DISTINCT pm.user_id) AS member_count,
    COUNT(DISTINCT ph.id) AS phase_count,
    COUNT(DISTINCT t.id) AS task_count,
    COUNT(DISTINCT d.id) AS document_count,
    COALESCE(SUM(ft.amount), 0) AS total_spent,
    COUNT(DISTINCT ft.id) AS transaction_count
FROM construction_mgr.be_project p
LEFT JOIN construction_mgr.be_project_member pm ON p.id = pm.project_id
LEFT JOIN construction_mgr.be_phase ph ON p.id = ph.project_id
LEFT JOIN construction_mgr.be_task t ON p.id = t.project_id
LEFT JOIN construction_mgr.be_document d ON p.id = d.project_id
LEFT JOIN construction_mgr.financial_transaction ft ON p.id = ft.project_id
GROUP BY p.id, p.name, p.status, p.owner_id;

-- Create index on materialized view
CREATE INDEX idx_project_stats_mv_owner ON construction_mgr.project_stats_mv (owner_id);
CREATE INDEX idx_project_stats_mv_status ON construction_mgr.project_stats_mv (status);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION construction_mgr.refresh_project_stats()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW construction_mgr.project_stats_mv;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant appropriate permissions
GRANT SELECT ON construction_mgr.project_stats_mv TO authenticated;
GRANT EXECUTE ON FUNCTION construction_mgr.refresh_project_stats TO service_role;
GRANT EXECUTE ON FUNCTION private.user_has_project_access_cached TO authenticated;
GRANT EXECUTE ON FUNCTION private.has_financial_permission_fast TO authenticated;
