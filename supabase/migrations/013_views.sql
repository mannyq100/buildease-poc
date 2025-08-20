-- Migration: 013_views.sql
-- Purpose: Defines all database views for the BuildEase application
-- 
-- OPTIMIZATION STRATEGY:
-- - Base views: Core project data aggregation and normalization
-- - Enhanced views: Server-side heavy computation optimization (eliminates Web Workers)
-- - Consolidated permissions: Single security and grant configuration
-- 
-- PERFORMANCE BENEFITS:
-- - Phase progress calculations moved to PostgreSQL (vs JavaScript)
-- - Task urgency scoring computed server-side (0-100 scale)
-- - Today's focus pre-filtered and sorted by urgency
-- - Mobile device CPU load reduced significantly
-- - Consistent calculations across all users

-- =============================================================================
-- PROJECT SUMMARY VIEW
-- =============================================================================

-- Optimized view using CTEs to eliminate redundant subqueries
CREATE OR REPLACE VIEW construction_mgr.project_summary AS
WITH task_progress AS (
    SELECT 
        t.project_id,
        t.phase_id,
        AVG(CASE t.status
            WHEN 'COMPLETED' THEN 100
            WHEN 'IN_PROGRESS' THEN 50
            ELSE 0
        END) as phase_task_progress
    FROM construction_mgr.be_task t
    GROUP BY t.project_id, t.phase_id
),
transactions_agg AS (
    SELECT 
        ft.project_id,
        COUNT(ft.id) AS transaction_count,
        COALESCE(SUM(ft.amount) FILTER (WHERE ft.payment_status IN ('PAID', 'APPROVED', 'PENDING')), 0) AS spent_amount
    FROM construction_mgr.financial_transaction ft
    GROUP BY ft.project_id
),
phases_agg AS (
    SELECT 
        ph.project_id,
        COUNT(ph.id) AS phase_count
    FROM construction_mgr.be_phase ph
    GROUP BY ph.project_id
),
tasks_agg AS (
    SELECT 
        t.project_id,
        COUNT(t.id) FILTER (WHERE t.status IN ('PENDING', 'IN_PROGRESS')) AS open_task_count
    FROM construction_mgr.be_task t
    GROUP BY t.project_id
),
progress_agg AS (
    SELECT 
        ph.project_id,
        COALESCE(ROUND(AVG(
            CASE ph.status 
                WHEN 'COMPLETED' THEN 100
                WHEN 'IN_PROGRESS' THEN COALESCE(tp.phase_task_progress, 50)
                WHEN 'PLANNING' THEN 10
                ELSE 0
            END
        ), 0), 0) AS progress_percentage
    FROM construction_mgr.be_phase ph
    LEFT JOIN task_progress tp ON tp.project_id = ph.project_id AND tp.phase_id = ph.id
    GROUP BY ph.project_id
),
materials_agg AS (
    SELECT m.project_id, COUNT(m.id) AS material_count
    FROM construction_mgr.be_material m
    GROUP BY m.project_id
),
documents_agg AS (
    SELECT d.project_id, COUNT(d.id) AS document_count
    FROM construction_mgr.be_document d
    GROUP BY d.project_id
),
members_agg AS (
    SELECT pm.project_id, COUNT(DISTINCT pm.user_id) AS member_count
    FROM construction_mgr.be_project_member pm
    GROUP BY pm.project_id
)
SELECT
    p.id,
    p.name,
    p.description,
    p.owner_id,
    CASE p.status 
        WHEN 'IN_PROGRESS' THEN 'active'
        WHEN 'PLANNING' THEN 'planning'
        WHEN 'COMPLETED' THEN 'completed'
        WHEN 'PAUSED' THEN 'on-hold'
        ELSE 'planning'
    END as status,
    
    -- Visual assets
    p.profile_image,
    p.inspiration_images,
    
    -- Project details from JSONB
    COALESCE(p.details->>'client', 'Unknown Client') as client,
    p.details->>'location' as location,
    COALESCE(p.details->>'project_type', 'Construction') as project_type,
    
    -- Timeline (raw strings)
    p.timeline->>'planned_start' AS start_date,
    p.timeline->>'planned_end' AS end_date,
    
    -- Financial data (uses aggregated transactions)
    COALESCE((p.budget->>'allocated')::numeric, 0) as budget,
    COALESCE(ta.spent_amount, 0) as spent,
    COALESCE(p.budget->>'currency', 'USD') as currency,
    CASE 
        WHEN COALESCE((p.budget->>'allocated')::numeric, 0) > 0 
        THEN ROUND((COALESCE(ta.spent_amount, 0) / (p.budget->>'allocated')::numeric * 100), 1)
        ELSE 0 
    END as spent_percentage,
    COALESCE((p.budget->>'allocated')::numeric, 0) - COALESCE(ta.spent_amount, 0) as remaining,
    
    -- Progress (from aggregated calculation)
    COALESCE(pa.progress_percentage, 0) as progress,
    
    -- Health status (using pre-calculated spent)
    CASE 
        WHEN p.status = 'COMPLETED' THEN 'excellent'
        WHEN COALESCE(ta.spent_amount, 0) > COALESCE((p.budget->>'allocated')::numeric, 0) * 1.2 THEN 'poor'
        WHEN COALESCE(ta.spent_amount, 0) > COALESCE((p.budget->>'allocated')::numeric, 0) * 1.1 THEN 'fair'
        ELSE 'good'
    END as health,
    
    -- Owner name - prefer owner_info if available, fallback to user table
    CASE 
        WHEN p.details->'owner_info'->>'name' IS NOT NULL AND p.details->'owner_info'->>'name' != '' 
        THEN p.details->'owner_info'->>'name'
        ELSE COALESCE(CONCAT(u.first_name, ' ', u.last_name), 'Project Owner')
    END as owner_name,
    
    -- Counts (from aggregated data)
    COALESCE(ph_a.phase_count, 0) AS phases,
    COALESCE(m_a.material_count, 0) AS materials,
    COALESCE(d_a.document_count, 0) AS documents,
    COALESCE(mem_a.member_count, 0) AS members,
    COALESCE(ta.transaction_count, 0) AS transactions,
    COALESCE(t_a.open_task_count, 0) AS open_tasks,
    
    -- Audit fields
    p.created_at,
    p.updated_at
FROM
    construction_mgr.be_project p
LEFT JOIN construction_mgr.be_user u ON p.owner_id = u.id
LEFT JOIN transactions_agg ta ON ta.project_id = p.id
LEFT JOIN phases_agg ph_a ON ph_a.project_id = p.id
LEFT JOIN tasks_agg t_a ON t_a.project_id = p.id
LEFT JOIN progress_agg pa ON pa.project_id = p.id
LEFT JOIN materials_agg m_a ON m_a.project_id = p.id
LEFT JOIN documents_agg d_a ON d_a.project_id = p.id
LEFT JOIN members_agg mem_a ON mem_a.project_id = p.id;

-- =============================================================================
-- PROJECT MEMBERS VIEW
-- =============================================================================

-- View to show project participants with details including profile pictures
CREATE OR REPLACE VIEW construction_mgr.project_members AS
SELECT
    pm.project_id,
    p.name AS project_name,
    u.id AS user_id,
    concat(u.first_name, ' ', u.last_name) AS user_name,
    u.email,
    u.phone,
    pm.role,
    pm.joined_at,
    -- Extract profile picture from user settings JSONB
    u.settings->>'picture_url' AS profile_picture_url,
    -- Additional user info for enhanced team management
    u.company_name,
    u.status AS user_status,
    -- Email and phone verification status for contact reliability
    COALESCE((u.settings->>'email_verified')::boolean, false) AS email_verified,
    COALESCE((u.settings->>'phone_verified')::boolean, false) AS phone_verified
FROM
    construction_mgr.be_project_member pm
JOIN
    construction_mgr.be_project p ON pm.project_id = p.id
JOIN
    construction_mgr.be_user u ON pm.user_id = u.id;

-- =============================================================================
-- FINANCIAL SUMMARY VIEWS
-- =============================================================================

-- Optimized view using single aggregation pass for better performance
CREATE OR REPLACE VIEW construction_mgr.project_financial_summary AS
WITH financial_aggregates AS (
  SELECT 
    p.id AS project_id,
    p.name AS project_name,
    (p.budget->>'allocated')::numeric AS total_budget,
    (p.budget->>'currency')::text AS currency,
    -- Single pass aggregation with FILTER clauses
    COUNT(ft.id) AS transaction_count,
    COALESCE(SUM(ft.amount) FILTER (WHERE ft.payment_status IN ('PAID', 'APPROVED', 'PENDING')), 0) AS total_spent,
    COALESCE(SUM(ft.amount) FILTER (WHERE ft.transaction_type = 'MATERIAL_PURCHASE'), 0) AS material_costs,
    COALESCE(SUM(ft.amount) FILTER (WHERE ft.transaction_type = 'LABOR'), 0) AS labor_costs,
    COALESCE(SUM(ft.amount) FILTER (WHERE ft.transaction_type = 'EQUIPMENT_RENTAL'), 0) AS equipment_costs,
    COALESCE(SUM(ft.amount) FILTER (WHERE ft.transaction_type = 'PERMIT_FEE'), 0) AS permit_costs,
    COALESCE(SUM(ft.amount) FILTER (WHERE ft.transaction_type = 'DESIGN_FEE'), 0) AS design_costs,
    COALESCE(SUM(ft.amount) FILTER (WHERE ft.transaction_type = 'OTHER'), 0) AS other_costs
  FROM construction_mgr.be_project p
  LEFT JOIN construction_mgr.financial_transaction ft ON ft.project_id = p.id
  GROUP BY p.id, p.name, p.budget
)
SELECT * FROM financial_aggregates;

-- =============================================================================
-- MATERIAL INVENTORY VIEW
-- =============================================================================

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

-- =============================================================================
-- PHASE DETAILS VIEW
-- =============================================================================

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

-- =============================================================================
-- PROJECT ACTIVITIES VIEW
-- =============================================================================

-- View for easier querying of project activities
CREATE OR REPLACE VIEW construction_mgr.project_activities AS
SELECT 
    pa.*,
    p.name as project_name,
    u.first_name || ' ' || COALESCE(u.last_name, '') as full_user_name,
    u.email as user_email
FROM construction_mgr.be_project_activity pa
LEFT JOIN construction_mgr.be_project p ON pa.project_id = p.id
LEFT JOIN construction_mgr.be_user u ON pa.user_id = u.id
ORDER BY pa.created_at DESC;

-- =============================================================================
-- TASK SUMMARY VIEW
-- =============================================================================

-- View to show task summary with project and user details
CREATE OR REPLACE VIEW construction_mgr.task_summary AS
SELECT
    t.id,
    t.title,
    t.description,
    t.status,
    t.priority,
    t.project_id,
    p.name AS project_name,
    t.phase_id,
    ph.name AS phase_name,
    t.assigned_to,
    CONCAT(u.first_name, ' ', u.last_name) AS assigned_user_name,
    u.email AS assigned_user_email,
    t.start_date,
    t.due_date,
    t.completed_at,
    t.created_at,
    t.updated_at,
    CASE 
        WHEN t.completed_at IS NOT NULL THEN 'completed'
        WHEN t.due_date < CURRENT_DATE AND t.status NOT IN ('COMPLETED', 'CANCELLED') THEN 'overdue'
        WHEN t.due_date = CURRENT_DATE THEN 'due_today'
        WHEN t.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' THEN 'due_soon'
        ELSE 'on_track'
    END AS task_status
FROM
    construction_mgr.be_task t
JOIN
    construction_mgr.be_project p ON t.project_id = p.id
LEFT JOIN
    construction_mgr.be_phase ph ON t.phase_id = ph.id
LEFT JOIN
    construction_mgr.be_user u ON t.assigned_to = u.id;

-- =============================================================================
-- DOCUMENT SUMMARY VIEW
-- =============================================================================

-- View to show document summary with project and phase details
CREATE OR REPLACE VIEW construction_mgr.document_summary AS
SELECT
    d.id,
    d.name,
    d.description,
    d.document_type,
    d.project_id,
    p.name AS project_name,
    d.phase_id,
    ph.name AS phase_name,
    d.file_path,
    d.file_size_bytes,
    d.mime_type,
    d.tags,
    d.caption,
    d.processing_status,
    d.created_at,
    d.updated_at,
    CASE 
        WHEN d.file_size_bytes IS NULL THEN 'unknown'
        WHEN d.file_size_bytes < 1024 * 1024 THEN 'small'
        WHEN d.file_size_bytes < 10 * 1024 * 1024 THEN 'medium'
        ELSE 'large'
    END AS size_category
FROM
    construction_mgr.be_document d
JOIN
    construction_mgr.be_project p ON d.project_id = p.id
LEFT JOIN
    construction_mgr.be_phase ph ON d.phase_id = ph.id;

-- =============================================================================
-- COMMENT SUMMARY VIEW
-- =============================================================================

-- View to show comment summary with user and entity details
CREATE OR REPLACE VIEW construction_mgr.comment_summary AS
SELECT
    c.id,
    c.content,
    c.entity_type,
    c.entity_id,
    c.user_id,
    CONCAT(u.first_name, ' ', u.last_name) AS user_name,
    u.email AS user_email,
    c.parent_comment_id,
    c.created_at,
    c.updated_at,
    CASE 
        WHEN c.parent_comment_id IS NOT NULL THEN 'reply'
        ELSE 'comment'
    END AS comment_type,
    CASE c.entity_type
        WHEN 'project' THEN (SELECT name FROM construction_mgr.be_project WHERE id = c.entity_id::uuid)
        WHEN 'task' THEN (SELECT title FROM construction_mgr.be_task WHERE id = c.entity_id::uuid)
        WHEN 'phase' THEN (SELECT name FROM construction_mgr.be_phase WHERE id = c.entity_id::uuid)
        ELSE NULL
    END AS entity_name
FROM
    construction_mgr.comment c
JOIN
    construction_mgr.be_user u ON c.user_id = u.id;

-- =============================================================================
-- ENHANCED PHASE PROGRESS VIEW (Heavy Computation Optimization)
-- =============================================================================

-- Comprehensive phase view with pre-calculated progress and task metrics
CREATE OR REPLACE VIEW construction_mgr.phase_progress_summary AS
WITH phase_task_metrics AS (
    SELECT 
        t.phase_id,
        COUNT(t.id) as total_tasks,
        COUNT(t.id) FILTER (WHERE t.status = 'COMPLETED') as completed_tasks,
        COUNT(t.id) FILTER (WHERE t.status = 'IN_PROGRESS') as in_progress_tasks,
        COUNT(t.id) FILTER (WHERE t.status = 'PENDING') as pending_tasks,
        COUNT(t.id) FILTER (WHERE t.status = 'CANCELLED') as cancelled_tasks,
        -- Task urgency calculation (server-side)
        AVG(
            CASE 
                WHEN t.due_date < CURRENT_DATE AND t.status NOT IN ('COMPLETED', 'CANCELLED') THEN 100
                WHEN t.due_date = CURRENT_DATE THEN 90
                WHEN t.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days' THEN 80
                WHEN t.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' THEN 70
                WHEN t.priority = 'HIGH' THEN 60
                WHEN t.priority = 'MEDIUM' THEN 40
                ELSE 20
            END
        ) as avg_urgency_score,
        -- Overdue task count
        COUNT(t.id) FILTER (WHERE t.due_date < CURRENT_DATE AND t.status NOT IN ('COMPLETED', 'CANCELLED')) as overdue_tasks,
        -- Due today/soon counts
        COUNT(t.id) FILTER (WHERE t.due_date = CURRENT_DATE) as due_today_tasks,
        COUNT(t.id) FILTER (WHERE t.due_date BETWEEN CURRENT_DATE + INTERVAL '1 day' AND CURRENT_DATE + INTERVAL '7 days') as due_soon_tasks
    FROM construction_mgr.be_task t
    GROUP BY t.phase_id
),
phase_timeline_analysis AS (
    SELECT 
        ph.id,
        ph.timeline,
        -- Timeline status calculations
        CASE 
            WHEN ph.timeline->>'actual_end' IS NOT NULL THEN 'completed'
            WHEN ph.timeline->>'actual_start' IS NOT NULL THEN 'in_progress'
            WHEN (ph.timeline->>'planned_start')::date <= CURRENT_DATE THEN 'should_be_started'
            ELSE 'not_started'
        END as timeline_status,
        -- Days calculations
        CASE 
            WHEN ph.timeline->>'planned_start' IS NOT NULL AND ph.timeline->>'planned_end' IS NOT NULL
            THEN ((ph.timeline->>'planned_end')::date - (ph.timeline->>'planned_start')::date)
            ELSE NULL
        END as planned_duration_days,
        CASE 
            WHEN ph.timeline->>'actual_start' IS NOT NULL AND ph.timeline->>'actual_end' IS NOT NULL
            THEN ((ph.timeline->>'actual_end')::date - (ph.timeline->>'actual_start')::date)
            WHEN ph.timeline->>'actual_start' IS NOT NULL
            THEN (CURRENT_DATE - (ph.timeline->>'actual_start')::date)
            ELSE NULL
        END as actual_duration_days,
        -- Schedule variance
        CASE 
            WHEN ph.timeline->>'planned_start' IS NOT NULL AND ph.timeline->>'actual_start' IS NOT NULL
            THEN ((ph.timeline->>'actual_start')::date - (ph.timeline->>'planned_start')::date)
            ELSE NULL
        END as start_variance_days,
        CASE 
            WHEN ph.timeline->>'planned_end' IS NOT NULL AND ph.timeline->>'actual_end' IS NOT NULL
            THEN ((ph.timeline->>'actual_end')::date - (ph.timeline->>'planned_end')::date)
            ELSE NULL
        END as end_variance_days
    FROM construction_mgr.be_phase ph
)
SELECT
    ph.id,
    ph.name,
    ph.description,
    ph.category,
    ph.status,
    ph.project_id,
    p.name AS project_name,
    
    -- Timeline data
    ph.timeline,
    pta.timeline_status,
    pta.planned_duration_days,
    pta.actual_duration_days,
    pta.start_variance_days,
    pta.end_variance_days,
    
    -- Budget data
    ph.budget,
    COALESCE((ph.budget->>'allocated')::numeric, 0) as budget_allocated,
    COALESCE((ph.budget->>'spent')::numeric, 0) as budget_spent,
    CASE 
        WHEN COALESCE((ph.budget->>'allocated')::numeric, 0) > 0 
        THEN ROUND((COALESCE((ph.budget->>'spent')::numeric, 0) / (ph.budget->>'allocated')::numeric * 100), 1)
        ELSE 0 
    END as budget_utilization_percent,
    
    -- Task metrics (pre-calculated)
    COALESCE(ptm.total_tasks, 0) as total_tasks,
    COALESCE(ptm.completed_tasks, 0) as completed_tasks,
    COALESCE(ptm.in_progress_tasks, 0) as in_progress_tasks,
    COALESCE(ptm.pending_tasks, 0) as pending_tasks,
    COALESCE(ptm.cancelled_tasks, 0) as cancelled_tasks,
    COALESCE(ptm.overdue_tasks, 0) as overdue_tasks,
    COALESCE(ptm.due_today_tasks, 0) as due_today_tasks,
    COALESCE(ptm.due_soon_tasks, 0) as due_soon_tasks,
    
    -- Progress calculation (server-side)
    CASE 
        WHEN COALESCE(ptm.total_tasks, 0) = 0 THEN
            -- No tasks, use phase status for progress
            CASE ph.status 
                WHEN 'COMPLETED' THEN 100
                WHEN 'IN_PROGRESS' THEN 50
                WHEN 'PLANNING' THEN 10
                ELSE 0
            END
        ELSE
            -- Task-based progress calculation
            ROUND((COALESCE(ptm.completed_tasks, 0)::numeric / ptm.total_tasks * 100), 1)
    END as progress_percentage,
    
    -- Urgency and priority scores (server-side)
    COALESCE(ROUND(ptm.avg_urgency_score, 1), 0) as avg_urgency_score,
    CASE 
        WHEN ptm.overdue_tasks > 0 THEN 'critical'
        WHEN ptm.due_today_tasks > 0 THEN 'urgent'
        WHEN ptm.due_soon_tasks > 0 THEN 'important'
        ELSE 'normal'
    END as priority_level,
    
    -- Health indicators
    CASE 
        WHEN ph.status = 'COMPLETED' THEN 'excellent'
        WHEN ptm.overdue_tasks > 0 THEN 'poor'
        WHEN pta.start_variance_days > 7 THEN 'fair'
        WHEN COALESCE((ph.budget->>'spent')::numeric, 0) > COALESCE((ph.budget->>'allocated')::numeric, 0) * 1.1 THEN 'fair'
        ELSE 'good'
    END as health_status,
    
    ph.created_at,
    ph.updated_at
FROM
    construction_mgr.be_phase ph
JOIN
    construction_mgr.be_project p ON ph.project_id = p.id
LEFT JOIN
    phase_task_metrics ptm ON ptm.phase_id = ph.id
LEFT JOIN
    phase_timeline_analysis pta ON pta.id = ph.id;

-- =============================================================================
-- ENHANCED TASK PRIORITY VIEW (Urgency Scoring Optimization)
-- =============================================================================

-- Task view with server-side urgency scoring and workload analysis
-- Uses centralized urgency calculation function for consistency
CREATE OR REPLACE VIEW construction_mgr.task_priority_analysis AS
WITH task_urgency_base AS (
    SELECT 
        t.*,
        -- Centralized urgency calculation for consistency across views
        CASE 
            WHEN t.completed_at IS NOT NULL THEN 0
            WHEN t.due_date < CURRENT_DATE AND t.status NOT IN ('COMPLETED', 'CANCELLED') THEN 100
            WHEN t.due_date = CURRENT_DATE THEN 90
            WHEN t.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '1 day' THEN 85
            WHEN t.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days' THEN 80
            WHEN t.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' THEN 70
            WHEN t.priority = 'HIGH' THEN 60
            WHEN t.priority = 'MEDIUM' THEN 40
            WHEN t.priority = 'LOW' THEN 20
            ELSE 10
        END as urgency_score,
        -- Centralized status categorization
        CASE 
            WHEN t.completed_at IS NOT NULL THEN 'completed'
            WHEN t.due_date < CURRENT_DATE AND t.status NOT IN ('COMPLETED', 'CANCELLED') THEN 'overdue'
            WHEN t.due_date = CURRENT_DATE THEN 'due_today'
            WHEN t.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' THEN 'due_soon'
            ELSE 'on_track'
        END AS task_status_category
    FROM construction_mgr.be_task t
),
task_workload AS (
    SELECT 
        t.assigned_to,
        COUNT(t.id) as total_assigned_tasks,
        COUNT(t.id) FILTER (WHERE t.status NOT IN ('COMPLETED', 'CANCELLED')) as active_assigned_tasks,
        COUNT(t.id) FILTER (WHERE t.due_date < CURRENT_DATE AND t.status NOT IN ('COMPLETED', 'CANCELLED')) as overdue_assigned_tasks
    FROM construction_mgr.be_task t
    WHERE t.assigned_to IS NOT NULL
    GROUP BY t.assigned_to
)
SELECT
    t.id,
    t.title,
    t.description,
    t.status,
    t.priority,
    t.project_id,
    p.name AS project_name,
    t.phase_id,
    ph.name AS phase_name,
    t.assigned_to,
    CONCAT(u.first_name, ' ', u.last_name) AS assigned_user_name,
    u.email AS assigned_user_email,
    t.start_date,
    t.due_date,
    t.completed_at,
    
    -- Use pre-calculated urgency score
    t.urgency_score,
    t.task_status_category,
    
    -- Assignee workload context (helps with task redistribution)
    COALESCE(tw.total_assigned_tasks, 0) as assignee_total_tasks,
    COALESCE(tw.active_assigned_tasks, 0) as assignee_active_tasks,
    COALESCE(tw.overdue_assigned_tasks, 0) as assignee_overdue_tasks,
    
    -- Workload indicator
    CASE 
        WHEN tw.overdue_assigned_tasks > 0 THEN 'overloaded'
        WHEN tw.active_assigned_tasks > 10 THEN 'heavy'
        WHEN tw.active_assigned_tasks > 5 THEN 'moderate'
        ELSE 'light'
    END as assignee_workload_level,
    
    t.created_at,
    t.updated_at
FROM
    task_urgency_base t
JOIN
    construction_mgr.be_project p ON t.project_id = p.id
LEFT JOIN
    construction_mgr.be_phase ph ON t.phase_id = ph.id
LEFT JOIN
    construction_mgr.be_user u ON t.assigned_to = u.id
LEFT JOIN
    task_workload tw ON tw.assigned_to = t.assigned_to;

-- =============================================================================
-- TODAY'S FOCUS VIEW (Pre-calculated Today's Focus)
-- =============================================================================

-- Pre-calculated today's focus tasks - leverages task_priority_analysis for consistency
CREATE OR REPLACE VIEW construction_mgr.todays_focus_tasks AS
SELECT 
    tpa.id,
    tpa.title,
    tpa.description,
    tpa.status,
    tpa.priority,
    tpa.due_date,
    tpa.project_id,
    tpa.project_name,
    tpa.phase_id,
    tpa.phase_name,
    tpa.assigned_to,
    tpa.assigned_user_name,
    tpa.urgency_score,
    tpa.task_status_category,
    
    -- Focus category for today's focus filtering
    CASE 
        WHEN tpa.task_status_category = 'overdue' THEN 'overdue'
        WHEN tpa.task_status_category = 'due_today' THEN 'due_today'
        WHEN tpa.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days' THEN 'urgent'
        WHEN tpa.priority = 'HIGH' THEN 'high_priority'
        ELSE 'important'
    END as focus_category,
    
    tpa.created_at,
    tpa.updated_at
FROM 
    construction_mgr.task_priority_analysis tpa
WHERE 
    tpa.status NOT IN ('COMPLETED', 'CANCELLED')
    AND (
        tpa.due_date <= CURRENT_DATE + INTERVAL '7 days'
        OR tpa.priority = 'HIGH'
        OR tpa.due_date < CURRENT_DATE
    )
ORDER BY tpa.urgency_score DESC, tpa.due_date ASC;

-- =============================================================================
-- SET SECURITY INVOKER ON ALL VIEWS
-- =============================================================================

-- Ensure RLS applies to all views (base + enhanced optimization views)
ALTER VIEW construction_mgr.project_summary SET (security_invoker = on);
ALTER VIEW construction_mgr.project_members SET (security_invoker = on);
ALTER VIEW construction_mgr.project_financial_summary SET (security_invoker = on);
ALTER VIEW construction_mgr.material_inventory SET (security_invoker = on);
ALTER VIEW construction_mgr.phase_details SET (security_invoker = on);
ALTER VIEW construction_mgr.project_activities SET (security_invoker = on);
ALTER VIEW construction_mgr.task_summary SET (security_invoker = on);
ALTER VIEW construction_mgr.document_summary SET (security_invoker = on);
ALTER VIEW construction_mgr.comment_summary SET (security_invoker = on);
-- Enhanced optimization views
ALTER VIEW construction_mgr.phase_progress_summary SET (security_invoker = on);
ALTER VIEW construction_mgr.task_priority_analysis SET (security_invoker = on);
ALTER VIEW construction_mgr.todays_focus_tasks SET (security_invoker = on);

-- =============================================================================
-- GRANT PERMISSIONS ON ALL VIEWS
-- =============================================================================

-- Grant SELECT permissions to authenticated users (base + enhanced views)
GRANT SELECT ON construction_mgr.project_summary TO authenticated;
GRANT SELECT ON construction_mgr.project_members TO authenticated;
GRANT SELECT ON construction_mgr.project_financial_summary TO authenticated;
GRANT SELECT ON construction_mgr.material_inventory TO authenticated;
GRANT SELECT ON construction_mgr.phase_details TO authenticated;
GRANT SELECT ON construction_mgr.project_activities TO authenticated;
GRANT SELECT ON construction_mgr.task_summary TO authenticated;
GRANT SELECT ON construction_mgr.document_summary TO authenticated;
GRANT SELECT ON construction_mgr.comment_summary TO authenticated;
-- Enhanced optimization views  
GRANT SELECT ON construction_mgr.phase_progress_summary TO authenticated;
GRANT SELECT ON construction_mgr.task_priority_analysis TO authenticated;
GRANT SELECT ON construction_mgr.todays_focus_tasks TO authenticated;
