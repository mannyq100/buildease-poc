-- Migration: 018_document_enums_removed.sql
-- Purpose: Remove document type enum - validation moved to UI layer

-- Note: This file intentionally left minimal as document types 
-- are now validated in the UI layer only.

-- If you need to reference common document types in the application,
-- consider creating a simple reference table (optional):

/*
CREATE TABLE IF NOT EXISTS construction_mgr.document_type_reference (
    code TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    description TEXT,
    category TEXT, -- 'PERMIT', 'FINANCIAL', 'TECHNICAL', 'MEDIA', etc.
    is_active BOOLEAN DEFAULT true
);

-- Common document types for reference
INSERT INTO construction_mgr.document_type_reference (code, display_name, category) VALUES
('PERMIT', 'Building Permit', 'PERMIT'),
('DRAWING', 'Technical Drawing', 'TECHNICAL'),
('CONTRACT', 'Contract Document', 'FINANCIAL'),
('INVOICE', 'Invoice', 'FINANCIAL'),
('RECEIPT', 'Receipt', 'FINANCIAL'),
('REPORT', 'Report', 'TECHNICAL'),
('SPECIFICATION', 'Specification', 'TECHNICAL'),
('SCHEDULE', 'Project Schedule', 'PLANNING'),
('PHOTO', 'Photo Documentation', 'MEDIA'),
('VIDEO', 'Video Documentation', 'MEDIA'),
('MANUAL', 'Manual/Guide', 'TECHNICAL'),
('CERTIFICATE', 'Certificate', 'PERMIT'),
('OTHER', 'Other Document', 'GENERAL')
ON CONFLICT (code) DO NOTHING;
*/

-- Document types are now free-form text fields validated in the UI
-- This provides maximum flexibility while keeping the database schema simple