-- Migration: 014_optimizations.sql
-- Purpose: Defines all indexes and performance optimizations for the application.

-- =============================================================================
-- USER TABLE INDEXES
-- =============================================================================

-- (indexes for be_user are defined in 003_user_tables.sql)

-- Index on user tier for subscription management
CREATE INDEX IF NOT EXISTS idx_user_tier ON construction_mgr.be_user(tier);

-- =============================================================================
-- PROJECT TABLE INDEXES
-- =============================================================================

-- (indexes for be_project owner/status are defined in 004_project_tables.sql)

-- Index on project slug for URL routing
CREATE INDEX IF NOT EXISTS idx_project_slug ON construction_mgr.be_project(slug);

-- Composite index on owner and status for dashboard queries
CREATE INDEX IF NOT EXISTS idx_project_owner_status ON construction_mgr.be_project(owner_id, status);

-- Index on project created_at for sorting
CREATE INDEX IF NOT EXISTS idx_project_created_at ON construction_mgr.be_project(created_at DESC);

-- =============================================================================
-- PROJECT MEMBER TABLE INDEXES
-- =============================================================================

-- Primary index on project_id and user_id (already exists as primary key)
-- CREATE INDEX IF NOT EXISTS idx_project_member_pk ON construction_mgr.be_project_member(project_id, user_id);

-- (indexes for be_project_member are defined in 004_project_tables.sql)

-- =============================================================================
-- PROJECT PERMISSION TABLE INDEXES
-- =============================================================================

-- (indexes for be_project_permission are defined in 003_user_tables.sql)

-- =============================================================================
-- PHASE TABLE INDEXES
-- =============================================================================

-- (indexes for be_phase are defined in 004_project_tables.sql)

-- Index on phase created_at for sorting
CREATE INDEX IF NOT EXISTS idx_phase_created_at ON construction_mgr.be_phase(created_at DESC);

-- =============================================================================
-- TASK TABLE INDEXES
-- =============================================================================

-- (indexes for be_task are defined in 004_project_tables.sql)

-- Overdue-like helper index without non-immutable predicates
CREATE INDEX IF NOT EXISTS idx_task_pending_by_due_date 
ON construction_mgr.be_task(status, due_date)
WHERE status NOT IN ('COMPLETED', 'CANCELLED') AND due_date IS NOT NULL;

-- =============================================================================
-- COMMENT TABLE INDEXES
-- =============================================================================

-- (indexes for comment are defined in 004_project_tables.sql)

-- Index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_comment_created_at ON construction_mgr.comment(created_at DESC);

-- Composite index on entity and created_at for entity comment timelines
CREATE INDEX IF NOT EXISTS idx_comment_entity_created ON construction_mgr.comment(entity_type, entity_id, created_at DESC);

-- =============================================================================
-- QUALITY INSPECTION TABLE INDEXES
-- =============================================================================

-- (indexes for be_quality_inspection are defined in 004_project_tables.sql)

-- Composite index on phase_id and status for phase inspection queries
CREATE INDEX IF NOT EXISTS idx_quality_inspection_phase_status ON construction_mgr.be_quality_inspection(phase_id, status);

-- =============================================================================
-- PROJECT ACTIVITY TABLE INDEXES
-- =============================================================================

-- (indexes for be_project_activity are defined in 004_project_tables.sql)

-- =============================================================================
-- FINANCIAL TRANSACTION TABLE INDEXES
-- =============================================================================

-- (indexes for financial_transaction are defined in 005_financial_tables.sql)

-- Index on payment_method for payment method analysis
CREATE INDEX IF NOT EXISTS idx_financial_transaction_payment_method ON construction_mgr.financial_transaction(payment_method);

-- Index on created_by for user transaction lookups
CREATE INDEX IF NOT EXISTS idx_financial_transaction_created_by ON construction_mgr.financial_transaction(created_by);

-- Index on approved_by for approval tracking
CREATE INDEX IF NOT EXISTS idx_financial_transaction_approved_by ON construction_mgr.financial_transaction(approved_by);

-- Index on payment_date for date-based queries
CREATE INDEX IF NOT EXISTS idx_financial_transaction_payment_date ON construction_mgr.financial_transaction(payment_date);

-- Index on amount for amount-based queries
CREATE INDEX IF NOT EXISTS idx_financial_transaction_amount ON construction_mgr.financial_transaction(amount);

-- Composite index on project_id and transaction_type for project financial analysis
CREATE INDEX IF NOT EXISTS idx_financial_transaction_project_type ON construction_mgr.financial_transaction(project_id, transaction_type);

-- Composite index on project_id and payment_status for project payment tracking
CREATE INDEX IF NOT EXISTS idx_financial_transaction_project_payment ON construction_mgr.financial_transaction(project_id, payment_status);

-- Composite index on project_id and transaction_date for project financial timelines
CREATE INDEX IF NOT EXISTS idx_financial_transaction_project_date ON construction_mgr.financial_transaction(project_id, created_at DESC);

-- =============================================================================
-- MATERIAL TABLE INDEXES
-- =============================================================================
-- (indexes for be_material are defined in 006_material_tables.sql)

-- Index on last_ordered for reorder tracking
CREATE INDEX IF NOT EXISTS idx_material_last_ordered ON construction_mgr.be_material(last_ordered);

-- Index on current_quantity for stock level queries
CREATE INDEX IF NOT EXISTS idx_material_quantity ON construction_mgr.be_material(current_quantity);

-- Index on min_required_quantity for reorder alerts
CREATE INDEX IF NOT EXISTS idx_material_min_required ON construction_mgr.be_material(min_required_quantity);

-- Composite index on project_id and category for project material organization
CREATE INDEX IF NOT EXISTS idx_material_project_category ON construction_mgr.be_material(project_id, category);

-- Index on low stock materials (current_quantity < min_required_quantity)
CREATE INDEX IF NOT EXISTS idx_material_low_stock ON construction_mgr.be_material(project_id, current_quantity) 
WHERE current_quantity IS NOT NULL AND min_required_quantity IS NOT NULL AND current_quantity < min_required_quantity;

-- =============================================================================
-- MATERIAL TRANSACTION TABLE INDEXES
-- =============================================================================

-- Index on project_id for fast project transaction lookups
CREATE INDEX IF NOT EXISTS idx_material_transaction_project ON construction_mgr.material_transaction(project_id);

-- Index on material_id for material transaction lookups
CREATE INDEX IF NOT EXISTS idx_material_transaction_material ON construction_mgr.material_transaction(material_id);

-- Index on transaction_type for transaction categorization
CREATE INDEX IF NOT EXISTS idx_material_transaction_type ON construction_mgr.material_transaction(transaction_type);

-- Index on created_by for user transaction lookups
CREATE INDEX IF NOT EXISTS idx_material_transaction_created_by ON construction_mgr.material_transaction(created_by);

-- Index on created_at for date-based queries (material transactions do not have a transaction_date field)
CREATE INDEX IF NOT EXISTS idx_material_transaction_created_at ON construction_mgr.material_transaction(created_at);

-- Composite index on project_id and transaction_type for project material analysis
CREATE INDEX IF NOT EXISTS idx_material_transaction_project_type ON construction_mgr.material_transaction(project_id, transaction_type);

-- =============================================================================
-- DOCUMENT TABLE INDEXES
-- =============================================================================

-- (indexes for be_document are defined in 007_document_tables.sql)

-- Index on created_at for document timelines
CREATE INDEX IF NOT EXISTS idx_document_created_at ON construction_mgr.be_document(created_at DESC);

-- Composite index on project_id and document_type for project document organization
CREATE INDEX IF NOT EXISTS idx_document_project_type ON construction_mgr.be_document(project_id, document_type);

-- Composite index on project_id and created_at for project document timelines
CREATE INDEX IF NOT EXISTS idx_document_project_created ON construction_mgr.be_document(project_id, created_at DESC);

-- GIN index on tags for tag-based searches
CREATE INDEX IF NOT EXISTS idx_document_tags ON construction_mgr.be_document USING GIN(tags);

-- GIN index on metadata for metadata searches
CREATE INDEX IF NOT EXISTS idx_document_metadata ON construction_mgr.be_document USING GIN(metadata);

-- =============================================================================
-- MEDIA COLLECTION TABLE INDEXES
-- =============================================================================

-- (indexes for media_collection are defined in 007_document_tables.sql)

-- Index on created_at for collection timelines
CREATE INDEX IF NOT EXISTS idx_media_collection_created_at ON construction_mgr.media_collection(created_at DESC);

-- Composite index on project_id and created_at for project collection timelines
CREATE INDEX IF NOT EXISTS idx_media_collection_project_created ON construction_mgr.media_collection(project_id, created_at DESC);

-- =============================================================================
-- COLLECTION DOCUMENT TABLE INDEXES
-- =============================================================================

-- (indexes for collection_document are defined in 007_document_tables.sql)

-- =============================================================================
-- MEDIA PROCESSING QUEUE TABLE INDEXES
-- =============================================================================

-- Index on document_id for document processing lookups
CREATE INDEX IF NOT EXISTS idx_media_processing_queue_document ON construction_mgr.media_processing_queue(document_id);

-- Index on processing_type for type-based queries
CREATE INDEX IF NOT EXISTS idx_media_processing_queue_type ON construction_mgr.media_processing_queue(processing_type);

-- Index on status for status-based queries
CREATE INDEX IF NOT EXISTS idx_media_processing_queue_status ON construction_mgr.media_processing_queue(status);

-- Index on priority for priority-based scheduling
CREATE INDEX IF NOT EXISTS idx_media_processing_queue_priority ON construction_mgr.media_processing_queue(priority);

-- Index on scheduled_for for scheduling queries
CREATE INDEX IF NOT EXISTS idx_media_processing_queue_scheduled ON construction_mgr.media_processing_queue(scheduled_for);

-- Composite index on status and scheduled_for for job scheduling
CREATE INDEX IF NOT EXISTS idx_media_processing_queue_status_scheduled ON construction_mgr.media_processing_queue(status, scheduled_for);

-- Composite index on priority and scheduled_for for priority scheduling
CREATE INDEX IF NOT EXISTS idx_media_processing_queue_priority_scheduled ON construction_mgr.media_processing_queue(priority, scheduled_for);

-- =============================================================================
-- AI PLAN JOBS TABLE INDEXES
-- =============================================================================

-- Index on project_id for fast project job lookups
CREATE INDEX IF NOT EXISTS idx_ai_plan_jobs_project ON construction_mgr.ai_plan_jobs(project_id);

-- Index on status for status-based queries
CREATE INDEX IF NOT EXISTS idx_ai_plan_jobs_status ON construction_mgr.ai_plan_jobs(status);

-- Index on job_id for external job tracking
CREATE INDEX IF NOT EXISTS idx_ai_plan_jobs_job_id ON construction_mgr.ai_plan_jobs(job_id);

-- Index on created_at for job timelines
CREATE INDEX IF NOT EXISTS idx_ai_plan_jobs_created_at ON construction_mgr.ai_plan_jobs(created_at DESC);

-- Composite index on project_id and status for project job queries
CREATE INDEX IF NOT EXISTS idx_ai_plan_jobs_project_status ON construction_mgr.ai_plan_jobs(project_id, status);

-- Ensure only one active plan per project
CREATE UNIQUE INDEX IF NOT EXISTS ux_ai_plan_active_per_project
ON construction_mgr.ai_generated_plan(project_id)
WHERE is_active = true;

-- =============================================================================
-- NOTIFICATION TABLE INDEXES
-- =============================================================================

-- Index on user_id for fast user notification lookups
CREATE INDEX IF NOT EXISTS idx_notification_user ON construction_mgr.be_notification(user_id);

-- Index on notification_type for type-based filtering
CREATE INDEX IF NOT EXISTS idx_notification_type ON construction_mgr.be_notification(notification_type);

-- Index on read boolean for read status tracking
CREATE INDEX IF NOT EXISTS idx_notification_read ON construction_mgr.be_notification(read);

-- Index on expires_at for expiration tracking
CREATE INDEX IF NOT EXISTS idx_notification_expires ON construction_mgr.be_notification(expires_at) WHERE expires_at IS NOT NULL;

-- Index on created_at for notification timelines
CREATE INDEX IF NOT EXISTS idx_notification_created_at ON construction_mgr.be_notification(created_at DESC);

-- Composite index on user_id and read for user notification queries
CREATE INDEX IF NOT EXISTS idx_notification_user_read ON construction_mgr.be_notification(user_id, read);

-- Composite index on user_id and created_at for user notification timelines
CREATE INDEX IF NOT EXISTS idx_notification_user_created ON construction_mgr.be_notification(user_id, created_at DESC);

-- =============================================================================
-- AUDIT LOG TABLE INDEXES
-- =============================================================================

-- Index on user_id for fast user audit lookups
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON construction_mgr.be_audit_log(user_id);

-- Index on action for action-based queries
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON construction_mgr.be_audit_log(action);

-- Index on created_at for audit timelines
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON construction_mgr.be_audit_log(created_at DESC);

-- Composite index on user_id and created_at for user audit timelines
CREATE INDEX IF NOT EXISTS idx_audit_log_user_created ON construction_mgr.be_audit_log(user_id, created_at DESC);

-- Composite index on table_name and created_at for table audit timelines
CREATE INDEX IF NOT EXISTS idx_audit_log_table_created ON construction_mgr.be_audit_log(entity_type, created_at DESC);

-- =============================================================================
-- FULL-TEXT SEARCH INDEXES
-- =============================================================================

-- Full-text search index on project name and description
CREATE INDEX IF NOT EXISTS idx_project_search ON construction_mgr.be_project 
USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Full-text search index on task title and description
CREATE INDEX IF NOT EXISTS idx_task_search ON construction_mgr.be_task 
USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Full-text search index on comment content
CREATE INDEX IF NOT EXISTS idx_comment_search ON construction_mgr.comment 
USING GIN(to_tsvector('english', content));

-- Full-text search index on document name and description
CREATE INDEX IF NOT EXISTS idx_document_search ON construction_mgr.be_document 
USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(caption, '')));

-- =============================================================================
-- JSONB INDEXES
-- =============================================================================

-- GIN index on project details for JSONB queries
CREATE INDEX IF NOT EXISTS idx_project_details ON construction_mgr.be_project USING GIN(details);

-- GIN index on project timeline for JSONB queries
CREATE INDEX IF NOT EXISTS idx_project_timeline ON construction_mgr.be_project USING GIN(timeline);

-- GIN index on project budget for JSONB queries
CREATE INDEX IF NOT EXISTS idx_project_budget ON construction_mgr.be_project USING GIN(budget);

-- GIN index on phase timeline for JSONB queries
CREATE INDEX IF NOT EXISTS idx_phase_timeline ON construction_mgr.be_phase USING GIN(timeline);

-- GIN index on phase budget for JSONB queries
CREATE INDEX IF NOT EXISTS idx_phase_budget ON construction_mgr.be_phase USING GIN(budget);

-- GIN index on material specs for JSONB queries
CREATE INDEX IF NOT EXISTS idx_material_specs ON construction_mgr.be_material USING GIN(specs);

-- GIN index on material supplier_info for JSONB queries
CREATE INDEX IF NOT EXISTS idx_material_supplier_info ON construction_mgr.be_material USING GIN(supplier_info);

-- GIN index on document metadata for JSONB queries
CREATE INDEX IF NOT EXISTS idx_document_metadata_jsonb ON construction_mgr.be_document USING GIN(metadata);

-- GIN index on project activity metadata for JSONB queries
CREATE INDEX IF NOT EXISTS idx_project_activity_metadata ON construction_mgr.be_project_activity USING GIN(metadata);

-- GIN index on media processing queue processing_data for JSONB queries
CREATE INDEX IF NOT EXISTS idx_media_processing_queue_data ON construction_mgr.media_processing_queue USING GIN(processing_data);

-- GIN index on media processing queue result_data for JSONB queries
CREATE INDEX IF NOT EXISTS idx_media_processing_queue_result ON construction_mgr.media_processing_queue USING GIN(result_data);

-- =============================================================================
-- PARTIAL INDEXES FOR PERFORMANCE
-- =============================================================================

-- Partial index on active project members only
CREATE INDEX IF NOT EXISTS idx_project_member_active ON construction_mgr.be_project_member(project_id, user_id) 
WHERE role IS NOT NULL;



-- Partial index on unread notifications only (uses boolean column `read`)
CREATE INDEX IF NOT EXISTS idx_notification_unread ON construction_mgr.be_notification(user_id, created_at DESC) 
WHERE read = false;

-- Partial index on pending media processing jobs only
CREATE INDEX IF NOT EXISTS idx_media_processing_pending ON construction_mgr.media_processing_queue(priority, scheduled_for) 
WHERE status = 'pending';

-- Partial index on active AI plan jobs only
CREATE INDEX IF NOT EXISTS idx_ai_plan_jobs_active ON construction_mgr.ai_plan_jobs(project_id, created_at DESC) 
WHERE status IN ('pending', 'processing');

-- =============================================================================
-- STATISTICS UPDATES
-- =============================================================================

-- Update table statistics for better query planning
ANALYZE construction_mgr.be_user;
ANALYZE construction_mgr.be_project;
ANALYZE construction_mgr.be_project_member;
ANALYZE construction_mgr.be_project_permission;
ANALYZE construction_mgr.be_phase;
ANALYZE construction_mgr.be_task;
ANALYZE construction_mgr.comment;
ANALYZE construction_mgr.be_quality_inspection;
ANALYZE construction_mgr.be_project_activity;
ANALYZE construction_mgr.financial_transaction;
ANALYZE construction_mgr.be_material;
ANALYZE construction_mgr.material_transaction;
ANALYZE construction_mgr.be_document;
ANALYZE construction_mgr.media_collection;
ANALYZE construction_mgr.collection_document;
ANALYZE construction_mgr.media_processing_queue;
ANALYZE construction_mgr.ai_plan_jobs;
ANALYZE construction_mgr.be_notification;
ANALYZE construction_mgr.be_audit_log;
