-- Migration: 006_project_enums.sql
-- Purpose: Defines ENUM types for the project management domain.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
        CREATE TYPE construction_mgr.project_status AS ENUM ('PLANNING', 'IN_PROGRESS', 'PAUSED', 'COMPLETED');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'phase_category') THEN
        CREATE TYPE construction_mgr.phase_category AS ENUM (
            'PREPARATORY',
            'EXCAVATION',
            'FOUNDATION',
            'STRUCTURE',
            'FLOOR_CONSTRUCTION',
            'ROOFING',
            'SERVICES',
            'FINISHES',
            'FIXTURES',
            'LANDSCAPING',
            'INSPECTIONS',
            'HANDOVER',
            'OTHER'
        );
    END IF;
END
$$;