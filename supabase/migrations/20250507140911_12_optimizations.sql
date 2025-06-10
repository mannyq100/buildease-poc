-- Database Optimizations and Performance Enhancements
-- This file contains additional optimizations not covered in the main migration files

-- Add partial indexes for specific use cases
CREATE INDEX IF NOT EXISTS idx_project_active_owner 
    ON construction_mgr.be_project (owner_id) 
    WHERE status IN ('PLANNING', 'IN_PROGRESS');

CREATE INDEX IF NOT EXISTS idx_phase_active_project 
    ON construction_mgr.be_phase (project_id) 
    WHERE status IN ('PLANNING', 'IN_PROGRESS');

CREATE INDEX IF NOT EXISTS idx_task_pending_assigned 
    ON construction_mgr.be_task (assigned_to) 
    WHERE status IN ('PENDING', 'IN_PROGRESS');

CREATE INDEX IF NOT EXISTS idx_financial_pending_project 
    ON construction_mgr.financial_transaction (project_id) 
    WHERE payment_status = 'PENDING';

CREATE INDEX IF NOT EXISTS idx_notification_unread_user 
    ON construction_mgr.be_notification (user_id) 
    WHERE is_read = FALSE;

-- Add permissions table partial indexes for active permissions
CREATE INDEX IF NOT EXISTS idx_permission_active_project_user 
    ON construction_mgr.be_project_permission (project_id, user_id) 
    WHERE active = TRUE;

CREATE INDEX IF NOT EXISTS idx_permission_financial_active 
    ON construction_mgr.be_project_permission (project_id, user_id) 
    WHERE permission IN ('VIEW_FINANCIALS', 'VIEW_BUDGET') AND active = TRUE;

-- Optimize material inventory lookups
CREATE INDEX IF NOT EXISTS idx_material_low_stock 
    ON construction_mgr.be_material (project_id) 
    WHERE current_quantity IS NOT NULL 
    AND min_required_quantity IS NOT NULL 
    AND current_quantity < min_required_quantity;

-- Add covering indexes for frequent queries
CREATE INDEX IF NOT EXISTS idx_project_member_covering 
    ON construction_mgr.be_project_member (project_id, user_id) 
    INCLUDE (role, joined_at);

CREATE INDEX IF NOT EXISTS idx_task_covering 
    ON construction_mgr.be_task (project_id, status) 
    INCLUDE (assigned_to, due_date, priority);

-- Function to get user project access efficiently (cached result)
CREATE OR REPLACE FUNCTION private.user_has_project_access_cached(
    p_project_id UUID,
    p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN AS $$
DECLARE
    cached_result BOOLEAN;
BEGIN
    -- Simple ownership check (fastest)
    IF EXISTS (
        SELECT 1 FROM construction_mgr.be_project 
        WHERE id = p_project_id AND owner_id = p_user_id
    ) THEN
        RETURN TRUE;
    END IF;
    
    -- Membership check (with index)
    RETURN EXISTS (
        SELECT 1 FROM construction_mgr.be_project_member 
        WHERE project_id = p_project_id AND user_id = p_user_id
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Optimized function for checking financial permissions
CREATE OR REPLACE FUNCTION private.has_financial_permission_fast(
    p_project_id UUID,
    p_user_id UUID DEFAULT auth.uid(),
    p_permission construction_mgr.permission_type DEFAULT 'VIEW_FINANCIALS'
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Owner check (fastest path)
    IF EXISTS (
        SELECT 1 FROM construction_mgr.be_project 
        WHERE id = p_project_id AND owner_id = p_user_id
    ) THEN
        RETURN TRUE;
    END IF;
    
    -- Admin role check (second fastest)
    IF EXISTS (
        SELECT 1 FROM construction_mgr.be_project_member 
        WHERE project_id = p_project_id 
        AND user_id = p_user_id 
        AND role = 'ADMIN'
    ) THEN
        RETURN TRUE;
    END IF;
    
    -- Specific permission check (uses partial index)
    RETURN EXISTS (
        SELECT 1 FROM construction_mgr.be_project_permission 
        WHERE project_id = p_project_id 
        AND user_id = p_user_id 
        AND permission = p_permission 
        AND active = TRUE
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Add constraints for data integrity
ALTER TABLE construction_mgr.be_material 
ADD CONSTRAINT chk_material_quantity_positive 
CHECK (current_quantity IS NULL OR current_quantity >= 0);

ALTER TABLE construction_mgr.financial_transaction 
ADD CONSTRAINT chk_financial_amount_positive 
CHECK (amount > 0);

ALTER TABLE construction_mgr.material_transaction 
ADD CONSTRAINT chk_material_transaction_quantity_not_zero 
CHECK (quantity != 0);

-- Add check constraint for valid transaction types
ALTER TABLE construction_mgr.material_transaction 
ADD CONSTRAINT chk_material_transaction_type 
CHECK (transaction_type IN ('PURCHASE', 'USAGE', 'ADJUSTMENT', 'RETURN'));

-- Add comments for better documentation (skipped for now to avoid migration issues)
-- COMMENT ON INDEX idx_project_active_owner IS 'Partial index for active projects by owner - improves dashboard queries';
-- COMMENT ON INDEX idx_permission_financial_active IS 'Partial index for financial permission checks - improves RLS performance';
COMMENT ON FUNCTION private.user_has_project_access_cached IS 'Optimized function for project access checks with minimal overhead';
COMMENT ON FUNCTION private.has_financial_permission_fast IS 'Fast financial permission check optimized for RLS policies';

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