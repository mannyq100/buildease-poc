-- Migration: 007_document_tables.sql
-- Purpose: Defines all tables for document and media management.

-- =============================================================================
-- DOCUMENT TABLE
-- =============================================================================

-- Document table with advanced media features
CREATE TABLE construction_mgr.be_document (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    document_type TEXT NOT NULL, -- Simple text field, validation in UI
    project_id UUID NOT NULL,
    phase_id UUID,
    file_path TEXT NOT NULL UNIQUE,
    file_size BIGINT,
    mime_type VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    caption TEXT,
    description_detail TEXT,
    file_size_bytes BIGINT,
    thumbnail_url TEXT,
    processing_status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_document_project FOREIGN KEY (project_id) 
        REFERENCES construction_mgr.be_project(id) ON DELETE CASCADE,
    CONSTRAINT fk_document_phase FOREIGN KEY (phase_id) 
        REFERENCES construction_mgr.be_phase(id) ON DELETE SET NULL
);

-- Update trigger
CREATE TRIGGER update_document_modtime
    BEFORE UPDATE ON construction_mgr.be_document
    FOR EACH ROW
    EXECUTE FUNCTION construction_mgr.update_updated_at_column();

-- Indexes
CREATE INDEX idx_document_project ON construction_mgr.be_document (project_id);
CREATE INDEX idx_document_phase ON construction_mgr.be_document (phase_id);
CREATE INDEX idx_document_type ON construction_mgr.be_document (document_type);
CREATE INDEX IF NOT EXISTS idx_document_tags ON construction_mgr.be_document USING gin (tags);
CREATE INDEX IF NOT EXISTS idx_document_metadata ON construction_mgr.be_document USING gin (metadata);
CREATE INDEX IF NOT EXISTS idx_document_mime_type ON construction_mgr.be_document (mime_type);
CREATE INDEX IF NOT EXISTS idx_document_file_size ON construction_mgr.be_document (file_size_bytes);
CREATE INDEX IF NOT EXISTS idx_document_processing_status ON construction_mgr.be_document (processing_status);
CREATE INDEX IF NOT EXISTS idx_document_fulltext_search 
ON construction_mgr.be_document 
USING gin (to_tsvector('english', COALESCE(caption, '') || ' ' || COALESCE(description_detail, '')));

-- =============================================================================
-- MEDIA COLLECTION TABLE
-- =============================================================================

-- Media collection table for organizing media into albums/collections
CREATE TABLE construction_mgr.media_collection (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES construction_mgr.be_project(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    is_public BOOLEAN DEFAULT false,
    collection_type VARCHAR(50) DEFAULT 'album', -- 'album', 'progress', 'inspection', 'before_after'
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES construction_mgr.be_user(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_collection_name_length CHECK (char_length(name) <= 100),
    CONSTRAINT chk_collection_type CHECK (collection_type IN ('album', 'progress', 'inspection', 'before_after', 'custom'))
);

-- =============================================================================
-- COLLECTION DOCUMENT JUNCTION TABLE
-- =============================================================================

-- Junction table for documents in collections
CREATE TABLE construction_mgr.collection_document (
    collection_id UUID NOT NULL REFERENCES construction_mgr.media_collection(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES construction_mgr.be_document(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    added_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    added_by UUID REFERENCES construction_mgr.be_user(id),
    
    PRIMARY KEY (collection_id, document_id)
);

-- =============================================================================
-- MEDIA PROCESSING QUEUE TABLE
-- =============================================================================

-- Media processing queue table for handling uploads and transformations
CREATE TABLE construction_mgr.media_processing_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES construction_mgr.be_document(id) ON DELETE CASCADE,
    processing_type VARCHAR(50) NOT NULL, -- 'thumbnail', 'compress', 'watermark', 'ocr'
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    priority INTEGER DEFAULT 5, -- 1 (highest) to 10 (lowest)
    attempt_count INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    error_message TEXT,
    processing_data JSONB DEFAULT '{}', -- Configuration for the processing task
    result_data JSONB DEFAULT '{}', -- Results from processing
    scheduled_for TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_processing_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    CONSTRAINT chk_processing_type CHECK (processing_type IN ('thumbnail', 'compress', 'watermark', 'ocr', 'virus_scan')),
    CONSTRAINT chk_priority_range CHECK (priority >= 1 AND priority <= 10),
    CONSTRAINT chk_max_attempts_positive CHECK (max_attempts > 0)
);

-- =============================================================================
-- INDEXES FOR MEDIA TABLES
-- =============================================================================

-- Indexes for media collections
CREATE INDEX IF NOT EXISTS idx_collection_project ON construction_mgr.media_collection (project_id);
CREATE INDEX IF NOT EXISTS idx_collection_type ON construction_mgr.media_collection (collection_type);
CREATE INDEX IF NOT EXISTS idx_collection_created_by ON construction_mgr.media_collection (created_by);
CREATE INDEX IF NOT EXISTS idx_collection_document_sort ON construction_mgr.collection_document (collection_id, sort_order);

-- Indexes for media processing queue
CREATE INDEX IF NOT EXISTS idx_processing_queue_status ON construction_mgr.media_processing_queue (status);
CREATE INDEX IF NOT EXISTS idx_processing_queue_priority ON construction_mgr.media_processing_queue (priority);
CREATE INDEX IF NOT EXISTS idx_processing_queue_scheduled ON construction_mgr.media_processing_queue (scheduled_for);
CREATE INDEX IF NOT EXISTS idx_processing_queue_document ON construction_mgr.media_processing_queue (document_id);

-- =============================================================================
-- TRIGGERS FOR MEDIA TABLES
-- =============================================================================

-- Add updated_at triggers for new tables
CREATE TRIGGER tr_media_collection_updated_at
    BEFORE UPDATE ON construction_mgr.media_collection
    FOR EACH ROW
    EXECUTE FUNCTION construction_mgr.update_updated_at_column();

CREATE TRIGGER tr_media_processing_updated_at
    BEFORE UPDATE ON construction_mgr.media_processing_queue
    FOR EACH ROW
    EXECUTE FUNCTION construction_mgr.update_updated_at_column();

-- =============================================================================
-- STORAGE BUCKETS SETUP
-- =============================================================================

-- Storage buckets with consistent configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  -- Profile pictures (public, 10MB) - accessible to all authenticated users
  ('profiles', 'profiles', true, 10485760, 
   ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  
  -- Project inspiration images (public, 10MB) - accessible to all authenticated users
  ('project-inspiration', 'project-inspiration', true, 10485760,
   ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
   
  -- Progress images (public, 10MB) - accessible to all authenticated users for collaboration
  ('progress-images', 'progress-images', true, 10485760,
   ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
   
  -- Documents (private, 50MB) - only accessible to project members
  ('documents', 'documents', false, 52428800,
   ARRAY['application/pdf', 'application/msword', 
         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
         'application/vnd.ms-excel',
         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
         'text/plain', 'image/jpeg', 'image/png'])

ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
