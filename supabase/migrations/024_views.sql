-- Migration: 020_views.sql
-- Purpose: Defines all views for the application.

-- View to show project summary information for user
CREATE OR REPLACE VIEW construction_mgr.project_summary AS
SELECT
    p.id,
    p.name,
    p.description,
    p.owner_id,
    CASE p.status 
        WHEN 'IN_PROGRESS' THEN 'active'
        WHEN 'PLANNING' THEN 'planning'
        WHEN 'COMPLETED' THEN 'completed'
        WHEN 'ON_HOLD' THEN 'on-hold'
        ELSE 'planning'
    END as status,
    
    -- Visual assets
    p.profile_image,
    p.inspiration_images,
    
    -- Project details from JSONB
    COALESCE(p.details->>'client', 'Unknown Client') as client,
    CONCAT_WS(', ', 
        p.details->'location'->>'street_address',
        p.details->'location'->>'city',
        p.details->'location'->>'region_or_state'
    ) as location,
    COALESCE(p.details->>'project_type', 'Construction') as project_type,
    
    -- Timeline (raw strings)
    p.timeline->>'planned_start' AS start_date,
    p.timeline->>'planned_end' AS end_date,
    
    -- Financial data with proper casting and user-set currency
    COALESCE((p.budget->>'allocated')::numeric, 0) as budget,
    COALESCE((p.budget->>'spent')::numeric, 0) as spent,
    COALESCE(p.budget->>'currency', 'USD') as currency,
    CASE 
        WHEN COALESCE((p.budget->>'allocated')::numeric, 0) > 0 
        THEN ROUND((COALESCE((p.budget->>'spent')::numeric, 0) / (p.budget->>'allocated')::numeric * 100), 1)
        ELSE 0 
    END as spent_percentage,
    COALESCE((p.budget->>'allocated')::numeric, 0) - COALESCE((p.budget->>'spent')::numeric, 0) as remaining,
    
    -- Progress calculation (deterministic based on phases)
    COALESCE((
        SELECT ROUND(AVG(
            CASE status 
                WHEN 'COMPLETED' THEN 100
                WHEN 'IN_PROGRESS' THEN 60
                WHEN 'PLANNING' THEN 20
                ELSE 0
            END
        ), 0)
        FROM construction_mgr.be_phase
        WHERE project_id = p.id
    ), 0) as progress,
    
    -- Health status based on timeline and budget
    CASE 
        WHEN p.status = 'COMPLETED' THEN 'excellent'
        WHEN COALESCE((p.budget->>'spent')::numeric, 0) > COALESCE((p.budget->>'allocated')::numeric, 0) * 1.2 THEN 'poor'
        WHEN COALESCE((p.budget->>'spent')::numeric, 0) > COALESCE((p.budget->>'allocated')::numeric, 0) * 1.1 THEN 'fair'
        ELSE 'good'
    END as health,
    
    -- Owner name - prefer owner_info if available, fallback to user table
    CASE 
        WHEN p.details->'owner_info'->>'name' IS NOT NULL AND p.details->'owner_info'->>'name' != '' 
        THEN p.details->'owner_info'->>'name'
        ELSE COALESCE(CONCAT(u.first_name, ' ', u.last_name), 'Project Owner')
    END as owner_name,
    
    -- Counts
    COALESCE((
        SELECT COUNT(*)
        FROM construction_mgr.be_phase
        WHERE project_id = p.id
    ), 0) AS phases,
    
    COALESCE((
        SELECT COUNT(*)
        FROM construction_mgr.be_material
        WHERE project_id = p.id
    ), 0) AS materials,
    
    COALESCE((
        SELECT COUNT(*)
        FROM construction_mgr.be_document
        WHERE project_id = p.id
    ), 0) AS documents,
    
    COALESCE((
        SELECT COUNT(*)
        FROM construction_mgr.be_project_member
        WHERE project_id = p.id
    ), 0) AS members,
    
    COALESCE((
        SELECT COUNT(*)
        FROM construction_mgr.financial_transaction
        WHERE project_id = p.id
    ), 0) AS transactions,
    
    -- Audit fields
    p.created_at,
    p.updated_at
FROM
    construction_mgr.be_project p
LEFT JOIN
    construction_mgr.be_user u ON p.owner_id = u.id;

-- View to show project participants with details
CREATE OR REPLACE VIEW construction_mgr.project_members AS
SELECT
    pm.project_id,
    p.name AS project_name,
    u.id AS user_id,
    concat(u.first_name, ' ', u.last_name) AS user_name,
    u.email,
    pm.role,
    pm.joined_at
FROM
    construction_mgr.be_project_member pm
JOIN
    construction_mgr.be_project p ON pm.project_id = p.id
JOIN
    construction_mgr.be_user u ON pm.user_id = u.id;

-- View to show financial transaction summary by project
CREATE OR REPLACE VIEW construction_mgr.project_financial_summary AS
WITH project_totals AS (
  SELECT 
    p.id AS project_id,
    p.name AS project_name,
    (p.budget->>'allocated')::numeric AS total_budget,
    (p.budget->>'spent')::numeric AS total_spent,
    (p.budget->>'currency')::text AS currency,
    COUNT(ft.id) AS transaction_count
  FROM construction_mgr.be_project p
  LEFT JOIN construction_mgr.financial_transaction ft ON ft.project_id = p.id
  GROUP BY p.id, p.name, p.budget
),
category_totals AS (
  SELECT 
    project_id,
    transaction_type AS category,
    SUM(amount) AS amount
  FROM construction_mgr.financial_transaction
  GROUP BY project_id, transaction_type
)
SELECT 
  pt.*,
  COALESCE(SUM(ct.amount) FILTER (WHERE ct.category = 'MATERIAL_PURCHASE'), 0) AS material_costs,
  COALESCE(SUM(ct.amount) FILTER (WHERE ct.category = 'LABOR'), 0) AS labor_costs,
  COALESCE(SUM(ct.amount) FILTER (WHERE ct.category = 'EQUIPMENT_RENTAL'), 0) AS equipment_costs,
  COALESCE(SUM(ct.amount) FILTER (WHERE ct.category = 'PERMIT_FEE'), 0) AS permit_costs,
  COALESCE(SUM(ct.amount) FILTER (WHERE ct.category = 'DESIGN_FEE'), 0) AS design_costs,
  COALESCE(SUM(ct.amount) FILTER (WHERE ct.category = 'OTHER'), 0) AS other_costs
FROM project_totals pt
LEFT JOIN category_totals ct ON ct.project_id = pt.project_id
GROUP BY 
  pt.project_id, pt.project_name, pt.total_budget, 
  pt.total_spent, pt.currency, pt.transaction_count;

-- View to show material inventory status
CREATE OR REPLACE VIEW construction_mgr.material_inventory AS
SELECT 
  m.id,
  m.name,
  m.description,
  m.category,
  m.unit,
  m.current_quantity,
  m.min_required_quantity,
  m.unit_price,
  m.currency,
  m.project_id,
  p.name AS project_name,
  m.supplier_id,
  m.supplier_info,
  m.last_ordered,
  m.lead_time_days,
  m.created_at,
  m.updated_at,
  CASE 
    WHEN m.current_quantity IS NULL THEN 'UNTRACKED'
    WHEN m.current_quantity <= 0 THEN 'OUT_OF_STOCK'
    WHEN m.min_required_quantity IS NOT NULL AND m.current_quantity < m.min_required_quantity THEN 'LOW_STOCK'
    ELSE 'IN_STOCK'
  END AS stock_status
FROM construction_mgr.be_material m
LEFT JOIN construction_mgr.be_project p ON m.project_id = p.id;

-- View to show project phase details
CREATE OR REPLACE VIEW construction_mgr.phase_details AS
SELECT
    ph.id,
    ph.name,
    ph.description,
    ph.category,
    ph.status,
    ph.project_id,
    p.name AS project_name,
    ph.timeline->>'planned_start' AS planned_start,
    ph.timeline->>'planned_end' AS planned_end,
    ph.timeline->>'actual_start' AS actual_start,
    ph.timeline->>'actual_end' AS actual_end,
    ph.budget->>'allocated' AS budget_allocated,
    ph.budget->>'spent' AS budget_spent,
    ph.created_at,
    ph.updated_at,
    (
        SELECT COUNT(*)
        FROM construction_mgr.be_document
        WHERE phase_id = ph.id
    ) AS document_count,
    (
        SELECT COUNT(*)
        FROM construction_mgr.financial_transaction
        WHERE phase_id = ph.id
    ) AS transaction_count
FROM
    construction_mgr.be_phase ph
JOIN
    construction_mgr.be_project p ON ph.project_id = p.id;

-- Create a financial summary view with RLS applied
CREATE OR REPLACE VIEW construction_mgr.financial_summary AS
SELECT
    p.id AS project_id,
    p.name AS project_name,
    p.budget->>'allocated' AS total_budget_allocated,
    p.budget->>'spent' AS total_budget_spent,
    p.budget->>'currency' AS currency,
    (
        SELECT SUM((budget->>'allocated')::numeric)
        FROM construction_mgr.be_phase
        WHERE project_id = p.id
    ) AS phases_budget_allocated,
    (
        SELECT SUM((budget->>'spent')::numeric)
        FROM construction_mgr.be_phase
        WHERE project_id = p.id
    ) AS phases_budget_spent,
    (
        SELECT SUM(amount)
        FROM construction_mgr.financial_transaction
        WHERE project_id = p.id
    ) AS total_expenses,
    (
        SELECT SUM(amount)
        FROM construction_mgr.financial_transaction
        WHERE project_id = p.id AND payment_status = 'PAID'
    ) AS total_paid_expenses,
    (
        SELECT COUNT(*)
        FROM construction_mgr.financial_transaction
        WHERE project_id = p.id AND payment_status = 'PENDING'
    ) AS pending_expenses_count
FROM
    construction_mgr.be_project p;

-- Ensure RLS applies to views
ALTER VIEW construction_mgr.project_summary SET (security_invoker = on);
ALTER VIEW construction_mgr.project_members SET (security_invoker = on);
ALTER VIEW construction_mgr.project_financial_summary SET (security_invoker = on);
ALTER VIEW construction_mgr.phase_details SET (security_invoker = on);
ALTER VIEW construction_mgr.financial_summary SET (security_invoker = on);
