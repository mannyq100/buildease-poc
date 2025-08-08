-- Migration: 001_core_setup.sql
-- Purpose: Foundational setup for the entire database (Supabase).
-- Contains:
-- - Schema creation (construction_mgr, private)
-- - Extension enablement (uuid-ossp, pgcrypto, pg_jsonschema)
-- - Core utility functions (update_updated_at_column)

CREATE SCHEMA IF NOT EXISTS construction_mgr;

-- Grant necessary permissions to Supabase roles for construction_mgr schema
GRANT USAGE ON SCHEMA construction_mgr TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA construction_mgr TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA construction_mgr TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA construction_mgr TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA construction_mgr
    GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA construction_mgr
    GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA construction_mgr
    GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- Create a private schema for security-related functions and tables
CREATE SCHEMA IF NOT EXISTS private;

-- Grant usage on private schema only to service_role
GRANT USAGE ON SCHEMA private TO service_role;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_jsonschema" WITH SCHEMA extensions;

-- Function to update 'updated_at' column on row updates
CREATE OR REPLACE FUNCTION construction_mgr.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
