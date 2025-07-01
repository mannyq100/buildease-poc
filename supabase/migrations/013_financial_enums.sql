-- Migration: 010_financial_enums.sql
-- Purpose: Defines ENUM types for the financial domain.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        CREATE TYPE construction_mgr.transaction_type AS ENUM (
          'MATERIAL_PURCHASE',
          'LABOR',
          'EQUIPMENT_RENTAL',
          'PERMIT_FEE',
          'DESIGN_FEE',
          'OTHER'
        );
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE construction_mgr.payment_status AS ENUM ('PENDING', 'PAID', 'COMPLETED', 'APPROVED', 'FAILED', 'REFUNDED', 'CANCELLED');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
        CREATE TYPE construction_mgr.payment_method AS ENUM ('CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CHEQUE');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'currency') THEN
        CREATE TYPE construction_mgr.currency AS ENUM ('GHS', 'USD', 'EUR');
    END IF;
END
$$;