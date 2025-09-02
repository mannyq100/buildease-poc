-- BuildEase Database Reset Script
-- WARNING: This will DELETE ALL DATA! Use only for development/testing

-- Drop all RLS policies
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN
        SELECT policyname, tablename, schemaname
        FROM pg_policies
        WHERE schemaname IN ('storage', 'construction_mgr')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            policy_record.policyname, 
            policy_record.schemaname, 
            policy_record.tablename);
    END LOOP;
END $$;

-- Delete all storage objects and buckets (handle foreign key constraints)
DELETE FROM storage.objects;
DELETE FROM storage.prefixes;
DELETE FROM storage.buckets;

-- Drop all tables in dependency order
DROP TABLE IF EXISTS construction_mgr.be_quality_inspection CASCADE;
DROP TABLE IF EXISTS construction_mgr.comment CASCADE;
DROP TABLE IF EXISTS construction_mgr.be_task CASCADE;
DROP TABLE IF EXISTS construction_mgr.be_phase CASCADE;
DROP TABLE IF EXISTS construction_mgr.be_media_items CASCADE;
DROP TABLE IF EXISTS construction_mgr.be_material_transaction CASCADE;
DROP TABLE IF EXISTS construction_mgr.be_material CASCADE;
DROP TABLE IF EXISTS construction_mgr.be_financial_transaction CASCADE;
DROP TABLE IF EXISTS construction_mgr.be_ai_plan_job CASCADE;
DROP TABLE IF EXISTS construction_mgr.be_ai_plan CASCADE;
DROP TABLE IF EXISTS construction_mgr.be_notification CASCADE;
DROP TABLE IF EXISTS construction_mgr.be_project_member CASCADE;
DROP TABLE IF EXISTS construction_mgr.be_project CASCADE;
DROP TABLE IF EXISTS construction_mgr.be_project_permission CASCADE;
DROP TABLE IF EXISTS construction_mgr.be_audit_log CASCADE;
DROP TABLE IF EXISTS construction_mgr.be_user CASCADE;

-- Drop views and functions
DO $$
DECLARE
    obj_record RECORD;
BEGIN
    -- Drop views
    FOR obj_record IN
        SELECT viewname FROM pg_views WHERE schemaname = 'construction_mgr'
    LOOP
        EXECUTE format('DROP VIEW IF EXISTS construction_mgr.%I CASCADE', obj_record.viewname);
    END LOOP;
    
    -- Drop functions
    FOR obj_record IN
        SELECT proname, oidvectortypes(proargtypes) as argtypes
        FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname IN ('construction_mgr', 'private')
    LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS %I.%I(%s) CASCADE', 
            'construction_mgr', obj_record.proname, obj_record.argtypes);
    END LOOP;
END $$;

-- Drop all enums
DROP TYPE IF EXISTS construction_mgr.media_type CASCADE;
DROP TYPE IF EXISTS construction_mgr.media_category CASCADE;
DROP TYPE IF EXISTS construction_mgr.document_type CASCADE;
DROP TYPE IF EXISTS construction_mgr.project_status CASCADE;
DROP TYPE IF EXISTS construction_mgr.user_role CASCADE;
DROP TYPE IF EXISTS construction_mgr.user_status CASCADE;
DROP TYPE IF EXISTS construction_mgr.user_tier CASCADE;
DROP TYPE IF EXISTS construction_mgr.auth_provider CASCADE;
DROP TYPE IF EXISTS construction_mgr.permission_type CASCADE;
DROP TYPE IF EXISTS construction_mgr.token_type CASCADE;
DROP TYPE IF EXISTS construction_mgr.currency CASCADE;
DROP TYPE IF EXISTS construction_mgr.transaction_type CASCADE;
DROP TYPE IF EXISTS construction_mgr.payment_method CASCADE;
DROP TYPE IF EXISTS construction_mgr.transaction_status CASCADE;
DROP TYPE IF EXISTS construction_mgr.material_transaction_type CASCADE;
DROP TYPE IF EXISTS construction_mgr.ai_plan_status CASCADE;
DROP TYPE IF EXISTS construction_mgr.ai_job_status CASCADE;
DROP TYPE IF EXISTS construction_mgr.notification_type CASCADE;

-- Drop schemas
DROP SCHEMA IF EXISTS construction_mgr CASCADE;
DROP SCHEMA IF EXISTS private CASCADE;

-- Delete auth users
DELETE FROM auth.users;

-- Clear migration history
DELETE FROM supabase_migrations.schema_migrations 
WHERE version LIKE '00%' OR version LIKE '01%' OR version LIKE '02%';