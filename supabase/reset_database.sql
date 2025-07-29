-- BuildEase Database Reset Script
-- Purpose: Delete all database objects to allow clean migration re-runs
-- WARNING: This will DELETE ALL DATA! Use only for development/testing

-- =============================================================================
-- STEP 1: DROP ALL TRIGGERS (prevents cascade issues)
-- =============================================================================

DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    -- Drop all triggers on storage.objects
    FOR trigger_record IN
        SELECT trigger_name, event_object_table, event_object_schema
        FROM information_schema.triggers
        WHERE event_object_schema = 'storage' 
        AND event_object_table = 'objects'
        AND trigger_name NOT LIKE 'pg_%'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I.%I', 
            trigger_record.trigger_name, 
            trigger_record.event_object_schema, 
            trigger_record.event_object_table);
    END LOOP;
    
    -- Drop all triggers on construction_mgr tables
    FOR trigger_record IN
        SELECT trigger_name, event_object_table
        FROM information_schema.triggers
        WHERE event_object_schema = 'construction_mgr'
        AND trigger_name NOT LIKE 'pg_%'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON construction_mgr.%I', 
            trigger_record.trigger_name, 
            trigger_record.event_object_table);
    END LOOP;
    
    -- Drop auth triggers
    FOR trigger_record IN
        SELECT trigger_name, event_object_table
        FROM information_schema.triggers
        WHERE event_object_schema = 'auth'
        AND trigger_name NOT LIKE 'pg_%'
        AND trigger_name NOT LIKE 'supabase_%'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.%I', 
            trigger_record.trigger_name, 
            trigger_record.event_object_table);
    END LOOP;
END $$;

-- =============================================================================
-- STEP 2: DROP ALL ROW LEVEL SECURITY POLICIES
-- =============================================================================

DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop RLS policies on storage.objects
    FOR policy_record IN
        SELECT policyname, tablename, schemaname
        FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            policy_record.policyname, 
            policy_record.schemaname, 
            policy_record.tablename);
    END LOOP;
    
    -- Drop RLS policies on construction_mgr tables
    FOR policy_record IN
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'construction_mgr'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON construction_mgr.%I', 
            policy_record.policyname, 
            policy_record.tablename);
    END LOOP;
END $$;

-- =============================================================================
-- STEP 3: DELETE ALL STORAGE OBJECTS AND BUCKETS
-- =============================================================================

-- Delete all objects from BuildEase storage buckets
DELETE FROM storage.objects 
WHERE bucket_id IN ('profiles', 'project-inspiration', 'progress-images', 'documents');

-- Delete storage buckets
DELETE FROM storage.buckets 
WHERE id IN ('profiles', 'project-inspiration', 'progress-images', 'documents');

-- =============================================================================
-- STEP 4: DROP ALL TABLES (in dependency order)
-- =============================================================================

-- Drop tables in reverse dependency order to avoid foreign key issues
DROP TABLE IF EXISTS construction_mgr.be_quality_inspection CASCADE;
DROP TABLE IF EXISTS construction_mgr.comment CASCADE;
DROP TABLE IF EXISTS construction_mgr.be_task CASCADE;
DROP TABLE IF EXISTS construction_mgr.be_phase CASCADE;
DROP TABLE IF EXISTS construction_mgr.be_document CASCADE;
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

-- Drop any reference tables
DROP TABLE IF EXISTS construction_mgr.document_type_reference CASCADE;

-- =============================================================================
-- STEP 5: DROP ALL VIEWS AND MATERIALIZED VIEWS
-- =============================================================================

DO $$
DECLARE
    view_record RECORD;
BEGIN
    -- Drop all views in construction_mgr schema
    FOR view_record IN
        SELECT viewname
        FROM pg_views
        WHERE schemaname = 'construction_mgr'
    LOOP
        EXECUTE format('DROP VIEW IF EXISTS construction_mgr.%I CASCADE', view_record.viewname);
    END LOOP;
    
    -- Drop all materialized views in construction_mgr schema
    FOR view_record IN
        SELECT matviewname
        FROM pg_matviews
        WHERE schemaname = 'construction_mgr'
    LOOP
        EXECUTE format('DROP MATERIALIZED VIEW IF EXISTS construction_mgr.%I CASCADE', view_record.matviewname);
    END LOOP;
END $$;

-- =============================================================================
-- STEP 6: DROP ALL FUNCTIONS
-- =============================================================================

DO $$
DECLARE
    func_record RECORD;
BEGIN
    -- Drop all functions in construction_mgr schema
    FOR func_record IN
        SELECT proname, oidvectortypes(proargtypes) as argtypes
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'construction_mgr'
    LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS construction_mgr.%I(%s) CASCADE', 
            func_record.proname, func_record.argtypes);
    END LOOP;
    
    -- Drop all functions in private schema
    FOR func_record IN
        SELECT proname, oidvectortypes(proargtypes) as argtypes
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'private'
    LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS private.%I(%s) CASCADE', 
            func_record.proname, func_record.argtypes);
    END LOOP;
END $$;

-- =============================================================================
-- STEP 7: DROP ALL ENUMS
-- =============================================================================

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

-- =============================================================================
-- STEP 8: DROP SCHEMAS (if they exist and are empty)
-- =============================================================================

-- Note: Only drop if completely empty, otherwise PostgreSQL will refuse
DROP SCHEMA IF EXISTS construction_mgr CASCADE;
DROP SCHEMA IF EXISTS private CASCADE;

-- Delete all users
DELETE FROM auth.users;
-- =============================================================================
-- STEP 9: RESET MIGRATION TRACKING (if using Supabase migrations)
-- =============================================================================

-- Clear migration history (if supabase_migrations table exists)
DELETE FROM supabase_migrations.schema_migrations 
WHERE version LIKE '00%' OR version LIKE '01%' OR version LIKE '02%';

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Verify cleanup (run these manually after the reset)
/*

-- Check remaining tables
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname IN ('construction_mgr', 'private')
ORDER BY schemaname, tablename;

-- Check remaining functions
SELECT n.nspname, p.proname 
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname IN ('construction_mgr', 'private')
ORDER BY n.nspname, p.proname;

-- Check remaining types
SELECT n.nspname, t.typname 
FROM pg_type t
JOIN pg_namespace n ON t.typnamespace = n.oid
WHERE n.nspname IN ('construction_mgr', 'private')
AND t.typtype = 'e'  -- Only enums
ORDER BY n.nspname, t.typname;

-- Check storage buckets
SELECT id, name, public 
FROM storage.buckets 
WHERE id IN ('profiles', 'project-inspiration', 'progress-images', 'documents');

-- Check storage objects
SELECT bucket_id, count(*) 
FROM storage.objects 
WHERE bucket_id IN ('profiles', 'project-inspiration', 'progress-images', 'documents')
GROUP BY bucket_id;

*/

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '🗑️  BuildEase database reset completed successfully!';
    RAISE NOTICE '✅ All tables, functions, types, and storage objects have been deleted.';
    RAISE NOTICE '🚀 You can now run your migrations from scratch.';
    RAISE NOTICE '⚠️  Remember to verify the cleanup using the verification queries.';
END $$;