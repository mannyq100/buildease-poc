-- Migration: 020_views.sql
-- Purpose: Defines all views for the application.

-- View to show project summary information for user
CREATE OR REPLACE VIEW construction_mgr.project_summary AS
SELECT
    p.id,
    p.name,
    p.description,
    p.status,
    p.timeline->>'planned_start' AS planned_start,
    p.timeline->>'planned_end' AS planned_end,
    p.budget->>'allocated' AS budget_allocated,
    p.budget->>'spent' AS budget_spent,
    p.budget->>'currency' AS currency,
    concat(u.first_name, ' ', u.last_name)  AS owner_name,
    p.created_at,
    p.updated_at,
    (
        SELECT COUNT(*)
        FROM construction_mgr.be_phase
        WHERE project_id = p.id
    ) AS phase_count,
    (
        SELECT COUNT(*)
        FROM construction_mgr.be_document
        WHERE project_id = p.id
    ) AS document_count,
    (
        SELECT COUNT(*)
        FROM construction_mgr.financial_transaction
        WHERE project_id = p.id
    ) AS transaction_count,
    (
        SELECT COUNT(*)
        FROM construction_mgr.be_project_member
        WHERE project_id = p.id
    ) AS member_count
FROM
    construction_mgr.be_project p
JOIN
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
