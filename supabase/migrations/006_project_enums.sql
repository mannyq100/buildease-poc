-- Migration: 006_project_enums.sql
-- Purpose: Defines ENUM types for the project management domain.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
        CREATE TYPE construction_mgr.project_status AS ENUM ('PLANNING', 'IN_PROGRESS', 'PAUSED', 'COMPLETED');
    END IF;
END
$$;

-- Removed phase_category enum to allow flexible phase categories
-- Users can now create phases with any category name
-- The application will guide users using constructionPhasesWithTasks constants