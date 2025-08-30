-- Migration: 007_document_tables.sql
-- Purpose: Defines all tables for document and media management.

-- =============================================================================
-- DOCUMENT TABLE
-- =============================================================================

-- Document table with advanced media features
CREATE TABLE construction_mgr.be_document (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    category construction_mgr.media_category NOT NULL,
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

-- Media category indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_document_category ON construction_mgr.be_document (category);
CREATE INDEX IF NOT EXISTS idx_document_project_category ON construction_mgr.be_document (project_id, category);
CREATE INDEX IF NOT EXISTS idx_document_phase_category ON construction_mgr.be_document (phase_id, category) WHERE phase_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_be_document_project_created ON construction_mgr.be_document(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_be_document_category_created ON construction_mgr.be_document(category, created_at DESC);

-- =============================================================================
-- MEDIA COLLECTION TABLE
-- =============================================================================

-- Media collection table for organizing media into albums/collections
CREATE TABLE construction_mgr.media_collection (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- =============================================================================
-- MEDIA CATEGORY FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Create function to get media by category
CREATE OR REPLACE FUNCTION construction_mgr.get_project_media_by_category(
    p_project_id UUID,
    p_category construction_mgr.media_category DEFAULT NULL,
    p_phase_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    project_id UUID,
    phase_id UUID,
    category construction_mgr.media_category,
    file_name TEXT,
    file_path TEXT,
    file_size BIGINT,
    mime_type TEXT,
    document_type TEXT,
    description TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.project_id,
        d.phase_id,
        d.category,
        d.name as file_name,
        d.file_path,
        d.file_size,
        d.mime_type,
        d.document_type,
        d.description,
        d.tags,
        d.created_at,
        d.updated_at
    FROM construction_mgr.be_document d
    WHERE d.project_id = p_project_id
    AND (p_category IS NULL OR d.category = p_category)
    AND (p_phase_id IS NULL OR d.phase_id = p_phase_id)
    ORDER BY d.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION construction_mgr.get_project_media_by_category TO authenticated;

-- Add helpful view for media queries
CREATE OR REPLACE VIEW construction_mgr.project_media AS
SELECT 
    d.id,
    d.project_id,
    d.phase_id,
    d.category,
    d.name as file_name,
    d.file_path,
    d.file_size,
    d.mime_type,
    d.document_type,
    d.description,
    d.tags,
    d.created_at,
    d.updated_at,
    p.name as project_name,
    ph.name as phase_name
FROM construction_mgr.be_document d
LEFT JOIN construction_mgr.be_project p ON d.project_id = p.id
LEFT JOIN construction_mgr.be_phase ph ON d.phase_id = ph.id
ORDER BY d.created_at DESC;

-- Grant permissions on the view
GRANT SELECT ON construction_mgr.project_media TO authenticated;

-- Add RLS policy for the view
ALTER VIEW construction_mgr.project_media SET (security_invoker = true);

-- Add helpful comments
COMMENT ON TABLE construction_mgr.be_document IS 'Unified storage for all project media: documents, images, and files';
COMMENT ON COLUMN construction_mgr.be_document.category IS 'Media category for unified storage: profile_image, inspiration_image, progress_image, or document';
COMMENT ON VIEW construction_mgr.project_media IS 'Convenient view for querying project media with related information';
COMMENT ON FUNCTION construction_mgr.get_project_media_by_category IS 'Efficiently retrieve project media filtered by category and/or phase';
