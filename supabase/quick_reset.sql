-- Quick Reset Script for BuildEase Development
-- Purpose: Fast reset for rapid development iterations
-- Use this when you just need to clear data but keep the structure

-- =============================================================================
-- QUICK DATA CLEANUP (preserves structure)
-- =============================================================================

-- Delete all storage objects
DELETE FROM storage.objects 
WHERE bucket_id IN ('profiles', 'project-inspiration', 'progress-images', 'documents');

-- Clear all data from tables (in dependency order)
TRUNCATE TABLE IF EXISTS construction_mgr.be_quality_inspection CASCADE;
TRUNCATE TABLE IF EXISTS construction_mgr.comment CASCADE;
TRUNCATE TABLE IF EXISTS construction_mgr.be_task CASCADE;
TRUNCATE TABLE IF EXISTS construction_mgr.be_phase CASCADE;
TRUNCATE TABLE IF EXISTS construction_mgr.be_document CASCADE;
TRUNCATE TABLE IF EXISTS construction_mgr.be_material_transaction CASCADE;
TRUNCATE TABLE IF EXISTS construction_mgr.be_material CASCADE;
TRUNCATE TABLE IF EXISTS construction_mgr.be_financial_transaction CASCADE;
TRUNCATE TABLE IF EXISTS construction_mgr.be_ai_plan_job CASCADE;
TRUNCATE TABLE IF EXISTS construction_mgr.be_ai_plan CASCADE;
TRUNCATE TABLE IF EXISTS construction_mgr.be_notification CASCADE;
TRUNCATE TABLE IF EXISTS construction_mgr.be_project_member CASCADE;
TRUNCATE TABLE IF EXISTS construction_mgr.be_project CASCADE;
TRUNCATE TABLE IF EXISTS construction_mgr.be_project_permission CASCADE;
TRUNCATE TABLE IF EXISTS construction_mgr.be_audit_log CASCADE;

-- Note: We don't truncate be_user as it's tied to auth.users

-- Reset sequences (if any auto-increment columns exist)
-- This ensures IDs start from 1 again
DO $$
DECLARE
    seq_record RECORD;
BEGIN
    FOR seq_record IN
        SELECT schemaname, sequencename
        FROM pg_sequences
        WHERE schemaname = 'construction_mgr'
    LOOP
        EXECUTE format('ALTER SEQUENCE %I.%I RESTART WITH 1', 
            seq_record.schemaname, seq_record.sequencename);
    END LOOP;
END $$;

-- Clear migration tracking for development
DELETE FROM supabase_migrations.schema_migrations 
WHERE version LIKE '00%' OR version LIKE '01%' OR version LIKE '02%';

DO $$
BEGIN
    RAISE NOTICE '🧹 Quick reset completed!';
    RAISE NOTICE '✨ All data cleared, structure preserved.';
    RAISE NOTICE '🚀 Ready for new test data.';
END $$;