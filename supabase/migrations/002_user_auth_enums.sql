-- Migration: 002_user_auth_enums.sql
-- Purpose: Defines all ENUM types related to the user and authentication domains.

-- Create enum types in the construction_mgr schema
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'auth_provider') THEN
        CREATE TYPE construction_mgr.auth_provider AS ENUM ('GOOGLE', 'FACEBOOK', 'LINKEDIN', 'AUTH0', 'EMAIL');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
        CREATE TYPE construction_mgr.user_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'token_type') THEN
        CREATE TYPE construction_mgr.token_type AS ENUM ('ACCESS', 'REFRESH');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE construction_mgr.user_role AS ENUM ('OWNER', 'CONTRACTOR', 'SUPPLIER', 'WORKER', 'ADMIN', 'USER');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_tier') THEN
        CREATE TYPE construction_mgr.user_tier AS ENUM ('BASIC', 'PREMIUM', 'PROFESSIONAL');
    END IF;
END
$$;

-- Permission types for role-based access control
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'permission_type') THEN
        CREATE TYPE construction_mgr.permission_type AS ENUM (
            'VIEW_BUDGET',
            'EDIT_BUDGET',
            'VIEW_FINANCIALS',
            'EDIT_FINANCIALS',
            'MANAGE_USERS',
            'MANAGE_PHASES',
            'MANAGE_MATERIALS',
            'MANAGE_DOCUMENTS',
            'SUPER_EDIT',
            'VIEW_PROJECT',
            'EDIT_PROJECT',
            'DELETE_PROJECT',
            'VIEW_PHASES',
            'EDIT_PHASES',
            'DELETE_PHASES',
            'VIEW_MATERIALS',
            'EDIT_MATERIALS',
            'DELETE_MATERIALS',
            'VIEW_EXPENSES',
            'EDIT_EXPENSES',
            'DELETE_EXPENSES',
            'APPROVE_EXPENSES',
            'VIEW_DOCUMENTS',
            'UPLOAD_DOCUMENTS',
            'DELETE_DOCUMENTS',
            'VIEW_WORKERS',
            'MANAGE_WORKERS',
            'VIEW_CONTRACTORS',
            'MANAGE_CONTRACTORS',
            'VIEW_SUPPLIERS',
            'MANAGE_SUPPLIERS',
            'GENERATE_REPORTS'
        );
    END IF;
END
$$;