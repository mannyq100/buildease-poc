-- Create indexes for improved performance with RLS policies

-- User table indexes
CREATE INDEX IF NOT EXISTS idx_user_email ON construction_mgr.be_user (email);
CREATE INDEX IF NOT EXISTS idx_user_provider ON construction_mgr.be_user (provider, provider_identifier);
CREATE INDEX IF NOT EXISTS idx_user_status ON construction_mgr.be_user (status);
-- JSONB indexes for settings searches
CREATE INDEX IF NOT EXISTS idx_user_settings ON construction_mgr.be_user USING gin (settings);

-- Project table indexes
CREATE INDEX IF NOT EXISTS idx_project_owner ON construction_mgr.be_project (owner_id);
CREATE INDEX IF NOT EXISTS idx_project_status ON construction_mgr.be_project (status);
CREATE INDEX IF NOT EXISTS idx_project_details ON construction_mgr.be_project USING gin (details);
CREATE INDEX IF NOT EXISTS idx_project_timeline ON construction_mgr.be_project USING gin (timeline);
CREATE INDEX IF NOT EXISTS idx_project_budget ON construction_mgr.be_project USING gin (budget);
CREATE INDEX IF NOT EXISTS idx_project_search ON construction_mgr.be_project 
    USING gin (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '')));

-- Project Member table indexes (renamed from project_user) - optimized for RLS performance
CREATE INDEX IF NOT EXISTS idx_project_member_user ON construction_mgr.be_project_member (user_id);
CREATE INDEX IF NOT EXISTS idx_project_member_project ON construction_mgr.be_project_member (project_id);
CREATE INDEX IF NOT EXISTS idx_project_member_role ON construction_mgr.be_project_member (role);
-- Composite indexes for RLS policy performance
CREATE INDEX IF NOT EXISTS idx_project_member_project_user ON construction_mgr.be_project_member (project_id, user_id);
CREATE INDEX IF NOT EXISTS idx_project_member_user_role ON construction_mgr.be_project_member (user_id, role);

-- Phase table indexes
CREATE INDEX IF NOT EXISTS idx_phase_project ON construction_mgr.be_phase (project_id);
CREATE INDEX IF NOT EXISTS idx_phase_status ON construction_mgr.be_phase (status);
CREATE INDEX IF NOT EXISTS idx_phase_category ON construction_mgr.be_phase (category);
-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_phase_project_status ON construction_mgr.be_phase (project_id, status);
CREATE INDEX IF NOT EXISTS idx_phase_project_category ON construction_mgr.be_phase (project_id, category);
-- JSONB indexes for phase data
CREATE INDEX IF NOT EXISTS idx_phase_details ON construction_mgr.be_phase USING gin (details);
CREATE INDEX IF NOT EXISTS idx_phase_timeline ON construction_mgr.be_phase USING gin (timeline);
CREATE INDEX IF NOT EXISTS idx_phase_budget ON construction_mgr.be_phase USING gin (budget);

-- Material table indexes
CREATE INDEX IF NOT EXISTS idx_material_project ON construction_mgr.be_material (project_id);
CREATE INDEX IF NOT EXISTS idx_material_category ON construction_mgr.be_material (category);
-- JSONB indexes for material data
CREATE INDEX IF NOT EXISTS idx_material_specs ON construction_mgr.be_material USING gin (specs);
CREATE INDEX IF NOT EXISTS idx_material_supplier_info ON construction_mgr.be_material USING gin (supplier_info);

-- Financial Transaction table indexes
CREATE INDEX IF NOT EXISTS idx_financial_transaction_project ON construction_mgr.financial_transaction (project_id);
CREATE INDEX IF NOT EXISTS idx_financial_transaction_phase ON construction_mgr.financial_transaction (phase_id);
CREATE INDEX IF NOT EXISTS idx_financial_transaction_status ON construction_mgr.financial_transaction (payment_status);
CREATE INDEX IF NOT EXISTS idx_financial_transaction_type ON construction_mgr.financial_transaction (transaction_type);
-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_financial_transaction_project_status ON construction_mgr.financial_transaction (project_id, payment_status);
CREATE INDEX IF NOT EXISTS idx_financial_transaction_project_type ON construction_mgr.financial_transaction (project_id, transaction_type);
CREATE INDEX IF NOT EXISTS idx_financial_transaction_phase_status ON construction_mgr.financial_transaction (phase_id, payment_status);

-- Storage-related indexes
-- These indexes are created by the storage admin role
-- Note: Storage indexes are managed by Supabase internally
-- Custom storage indexes should be created through the Supabase dashboard or with elevated privileges

-- To create storage indexes, you need to:
-- 1. Connect as a superuser to your Supabase database
-- 2. Run the CREATE INDEX statements with the storage admin role:
--
-- DO $$
-- BEGIN
--     IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_storage_admin') THEN
--         EXECUTE format('SET ROLE supabase_storage_admin');
--         
--         -- Create indexes
--         CREATE INDEX IF NOT EXISTS idx_storage_objects_bucket_id_name 
--             ON storage.objects (bucket_id, name);
--             
--         CREATE INDEX IF NOT EXISTS idx_storage_objects_name_pattern_ops 
--             ON storage.objects (name text_pattern_ops);
--             
--         CREATE INDEX IF NOT EXISTS idx_storage_objects_owner 
--             ON storage.objects (owner_id);
--             
--         -- Index for faster folder-based lookups
--         CREATE INDEX IF NOT EXISTS idx_storage_objects_parent_path 
--             ON storage.objects (bucket_id, (storage.foldername(name)));
--             
--         -- Index for metadata searches
--         CREATE INDEX IF NOT EXISTS idx_storage_objects_metadata 
--             ON storage.objects USING gin (metadata);
--     END IF;
-- END $$;

-- Note: The above code is commented out because it requires superuser privileges.
-- You should create these indexes through the Supabase dashboard or using a migration
-- with the appropriate elevated privileges.
-- JSONB indexes for financial transaction data
CREATE INDEX IF NOT EXISTS idx_financial_transaction_details ON construction_mgr.financial_transaction USING gin (details);

-- Document table indexes
CREATE INDEX IF NOT EXISTS idx_document_project ON construction_mgr.be_document (project_id);
CREATE INDEX IF NOT EXISTS idx_document_phase ON construction_mgr.be_document (phase_id);
CREATE INDEX IF NOT EXISTS idx_document_type ON construction_mgr.be_document (document_type);
-- JSONB indexes for document metadata
CREATE INDEX IF NOT EXISTS idx_document_metadata ON construction_mgr.be_document USING gin (metadata);

-- Notification table indexes
CREATE INDEX IF NOT EXISTS idx_notification_user ON construction_mgr.be_notification (user_id);
CREATE INDEX IF NOT EXISTS idx_notification_read ON construction_mgr.be_notification (is_read);
-- JSONB indexes for notification data
CREATE INDEX IF NOT EXISTS idx_notification_data ON construction_mgr.be_notification USING gin (data);

-- Audit Log table indexes
CREATE INDEX IF NOT EXISTS idx_audit_user ON construction_mgr.be_audit_log (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON construction_mgr.be_audit_log (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON construction_mgr.be_audit_log (action);
CREATE INDEX IF NOT EXISTS idx_audit_details ON construction_mgr.be_audit_log USING gin (details);

-- Project Permission indexes for RLS performance
CREATE INDEX IF NOT EXISTS idx_project_permission_user_project ON construction_mgr.be_project_permission (user_id, project_id);
CREATE INDEX IF NOT EXISTS idx_permission_financial ON construction_mgr.be_project_permission 
    (project_id, user_id) 
    WHERE permission IN ('VIEW_FINANCIALS', 'VIEW_BUDGET') AND active = TRUE;

-- Task table indexes
CREATE INDEX IF NOT EXISTS idx_task_project ON construction_mgr.be_task (project_id);
CREATE INDEX IF NOT EXISTS idx_task_phase ON construction_mgr.be_task (phase_id);
CREATE INDEX IF NOT EXISTS idx_task_status ON construction_mgr.be_task (status);
CREATE INDEX IF NOT EXISTS idx_task_assigned ON construction_mgr.be_task (assigned_to);
CREATE INDEX IF NOT EXISTS idx_task_dates ON construction_mgr.be_task (start_date, due_date);
CREATE INDEX IF NOT EXISTS idx_task_tags ON construction_mgr.be_task USING gin (tags);
-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_task_project_status ON construction_mgr.be_task (project_id, status);
CREATE INDEX IF NOT EXISTS idx_task_assigned_status ON construction_mgr.be_task (assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_task_phase_status ON construction_mgr.be_task (phase_id, status);
-- JSONB indexes for task data
CREATE INDEX IF NOT EXISTS idx_task_dependencies ON construction_mgr.be_task USING gin (dependencies);
CREATE INDEX IF NOT EXISTS idx_task_comments ON construction_mgr.be_task USING gin (comments);

-- Quality Inspection table indexes
CREATE INDEX IF NOT EXISTS idx_inspection_phase ON construction_mgr.be_quality_inspection (phase_id);
CREATE INDEX IF NOT EXISTS idx_inspection_task ON construction_mgr.be_quality_inspection (task_id);
CREATE INDEX IF NOT EXISTS idx_inspection_inspector ON construction_mgr.be_quality_inspection (inspector_id);
CREATE INDEX IF NOT EXISTS idx_inspection_date ON construction_mgr.be_quality_inspection (inspection_date);
CREATE INDEX IF NOT EXISTS idx_inspection_status ON construction_mgr.be_quality_inspection (status);
-- JSONB indexes for inspection data
CREATE INDEX IF NOT EXISTS idx_inspection_checklist ON construction_mgr.be_quality_inspection USING gin (checklist_items);
CREATE INDEX IF NOT EXISTS idx_inspection_results ON construction_mgr.be_quality_inspection USING gin (results);
CREATE INDEX IF NOT EXISTS idx_inspection_attachments ON construction_mgr.be_quality_inspection USING gin (attachments);

-- Additional foreign key indexes for performance
CREATE INDEX IF NOT EXISTS idx_material_supplier ON construction_mgr.be_material (supplier_id);
CREATE INDEX IF NOT EXISTS idx_financial_approved_by ON construction_mgr.financial_transaction (approved_by);
CREATE INDEX IF NOT EXISTS idx_financial_created_by ON construction_mgr.financial_transaction (created_by);
CREATE INDEX IF NOT EXISTS idx_task_created_by ON construction_mgr.be_task (created_by);
CREATE INDEX IF NOT EXISTS idx_task_completed_by ON construction_mgr.be_task (completed_by);
CREATE INDEX IF NOT EXISTS idx_permission_granted_by ON construction_mgr.be_project_permission (granted_by);

-- Comment table indexes
CREATE INDEX IF NOT EXISTS idx_comment_user_id ON construction_mgr.comment (user_id);
CREATE INDEX IF NOT EXISTS idx_comment_entity ON construction_mgr.comment (entity_type, entity_id);
