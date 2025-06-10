-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_jsonschema" WITH SCHEMA extensions;

-- Supabase already has the following extensions enabled by default:
-- - postgis (for geospatial data)
-- - pg_graphql (for GraphQL API)
-- - pg_stat_statements (for query performance analysis)
-- - pg_net (for HTTP requests)
-- - pgjwt (for JWT handling)
