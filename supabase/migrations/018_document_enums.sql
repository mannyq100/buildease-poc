-- Migration: 015_document_enums.sql
-- Purpose: Defines ENUM types for the document domain.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type') THEN
        CREATE TYPE construction_mgr.document_type AS ENUM ('PERMIT', 'DRAWING', 'CONTRACT', 'INVOICE', 'RECEIPT', 'REPORT', 'SPECIFICATION', 'SCHEDULE', 'PHOTO', 'VIDEO', 'MANUAL', 'CERTIFICATE', 'OTHER');
    END IF;
END
$$;