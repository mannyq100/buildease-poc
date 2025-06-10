-- Create a new schema for all BuildEase database objects
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