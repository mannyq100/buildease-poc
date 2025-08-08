-- Migration: 002_enums.sql
-- Purpose: All ENUM types

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'auth_provider') THEN
    CREATE TYPE construction_mgr.auth_provider AS ENUM ('GOOGLE', 'FACEBOOK', 'LINKEDIN', 'AUTH0', 'EMAIL');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
    CREATE TYPE construction_mgr.user_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'token_type') THEN
    CREATE TYPE construction_mgr.token_type AS ENUM ('ACCESS', 'REFRESH');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE construction_mgr.user_role AS ENUM ('OWNER', 'CONTRACTOR', 'SUPPLIER', 'WORKER', 'ADMIN', 'USER');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_tier') THEN
    CREATE TYPE construction_mgr.user_tier AS ENUM ('BASIC', 'PREMIUM', 'PROFESSIONAL');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'permission_type') THEN
    CREATE TYPE construction_mgr.permission_type AS ENUM (
      'VIEW_BUDGET','EDIT_BUDGET','VIEW_FINANCIALS','EDIT_FINANCIALS','MANAGE_USERS','MANAGE_PHASES','MANAGE_MATERIALS','MANAGE_DOCUMENTS','SUPER_EDIT','VIEW_PROJECT','EDIT_PROJECT','DELETE_PROJECT','VIEW_PHASES','EDIT_PHASES','DELETE_PHASES','VIEW_MATERIALS','EDIT_MATERIALS','DELETE_MATERIALS','VIEW_EXPENSES','EDIT_EXPENSES','DELETE_EXPENSES','APPROVE_EXPENSES','VIEW_DOCUMENTS','UPLOAD_DOCUMENTS','DELETE_DOCUMENTS','VIEW_WORKERS','MANAGE_WORKERS','VIEW_CONTRACTORS','MANAGE_CONTRACTORS','VIEW_SUPPLIERS','MANAGE_SUPPLIERS','GENERATE_REPORTS'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
    CREATE TYPE construction_mgr.project_status AS ENUM ('PLANNING', 'IN_PROGRESS', 'PAUSED', 'COMPLETED');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
    CREATE TYPE construction_mgr.transaction_type AS ENUM ('MATERIAL_PURCHASE','LABOR','EQUIPMENT_RENTAL','PERMIT_FEE','DESIGN_FEE','OTHER');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE construction_mgr.payment_status AS ENUM ('PENDING', 'PAID', 'COMPLETED', 'APPROVED', 'FAILED', 'REFUNDED', 'CANCELLED');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
    CREATE TYPE construction_mgr.payment_method AS ENUM ('CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CHEQUE');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'currency') THEN
    CREATE TYPE construction_mgr.currency AS ENUM ('GHS', 'USD', 'EUR');
  END IF;
END $$;
