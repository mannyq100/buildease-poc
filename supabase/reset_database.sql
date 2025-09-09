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

-- Delete all storage objects and buckets safely
DO $$
BEGIN
    -- Delete storage objects first
    DELETE FROM storage.objects WHERE bucket_id IN ('user_profiles', 'PHOTO', 'VIDEO', 'DOCUMENT');
    -- Delete custom buckets (but keep system ones)
    DELETE FROM storage.buckets WHERE id IN ('user_profiles', 'PHOTO', 'VIDEO', 'DOCUMENT');
EXCEPTION WHEN OTHERS THEN
    -- Ignore errors if storage tables don't exist or are empty
    NULL;
END $$;

-- Drop all tables in proper dependency order
DROP TABLE IF EXISTS construction_mgr.be_quality_inspection CASCADE;
DROP TABLE IF EXISTS construction_mgr.comment CASCADE;
DROP TABLE IF EXISTS construction_mgr.be_task CASCADE;
DROP TABLE IF EXISTS construction_mgr.be_phase CASCADE;
DROP TABLE IF EXISTS construction_mgr.be_media_items CASCADE;
DROP TABLE IF EXISTS construction_mgr.material_transaction CASCADE;
DROP TABLE IF EXISTS construction_mgr.be_material CASCADE;
DROP TABLE IF EXISTS construction_mgr.financial_transaction CASCADE;
DROP TABLE IF EXISTS construction_mgr.ai_generated_plan CASCADE;
DROP TABLE IF EXISTS construction_mgr.ai_plan_jobs CASCADE;
DROP TABLE IF EXISTS construction_mgr.be_project_activity CASCADE;
DROP TABLE IF EXISTS construction_mgr.be_project_member CASCADE;
DROP TABLE IF EXISTS construction_mgr.be_project_permission CASCADE;
DROP TABLE IF EXISTS construction_mgr.be_project CASCADE;
DROP TABLE IF EXISTS construction_mgr.be_notification CASCADE;
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
    
    -- Drop triggers
    FOR obj_record IN
        SELECT n.nspname as schema_name, c.relname as table_name, t.tgname as trigger_name
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname IN ('construction_mgr', 'auth')
          AND t.tgname NOT LIKE 'RI_ConstraintTrigger%'
          AND NOT t.tgisinternal
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I.%I CASCADE', 
            obj_record.trigger_name, obj_record.schema_name, obj_record.table_name);
    END LOOP;
    
    -- Drop functions from both schemas
    FOR obj_record IN
        SELECT n.nspname as schema_name, proname, oidvectortypes(proargtypes) as argtypes
        FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname IN ('construction_mgr', 'private')
    LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS %I.%I(%s) CASCADE', 
            obj_record.schema_name, obj_record.proname, obj_record.argtypes);
    END LOOP;
END $$;

-- Drop all enums (only those that actually exist)
DROP TYPE IF EXISTS construction_mgr.media_category CASCADE;
DROP TYPE IF EXISTS construction_mgr.media_type CASCADE;
DROP TYPE IF EXISTS construction_mgr.payment_method CASCADE;
DROP TYPE IF EXISTS construction_mgr.payment_status CASCADE;
DROP TYPE IF EXISTS construction_mgr.transaction_type CASCADE;
DROP TYPE IF EXISTS construction_mgr.project_status CASCADE;
DROP TYPE IF EXISTS construction_mgr.permission_type CASCADE;
DROP TYPE IF EXISTS construction_mgr.user_tier CASCADE;
DROP TYPE IF EXISTS construction_mgr.user_role CASCADE;
DROP TYPE IF EXISTS construction_mgr.token_type CASCADE;
DROP TYPE IF EXISTS construction_mgr.user_status CASCADE;
DROP TYPE IF EXISTS construction_mgr.auth_provider CASCADE;

-- Drop schemas
DROP SCHEMA IF EXISTS construction_mgr CASCADE;
DROP SCHEMA IF EXISTS private CASCADE;

-- Delete auth users safely
DO $$
BEGIN
    DELETE FROM auth.users WHERE email != 'system@buildease.com';
EXCEPTION WHEN OTHERS THEN
    -- Ignore errors if auth users don't exist
    NULL;
END $$;

-- Clear migration history safely
DO $$
BEGIN
    DELETE FROM supabase_migrations.schema_migrations 
    WHERE version LIKE '00%' OR version LIKE '01%' OR version LIKE '02%';
EXCEPTION WHEN OTHERS THEN
    -- Ignore errors if migration table doesn't exist
    NULL;
END $$;