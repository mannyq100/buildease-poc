-- Migration: 007_media_tables.sql
-- Purpose: Defines unified media storage for documents, images, and all project files.

-- =============================================================================
-- MAIN MEDIA TABLE
-- =============================================================================

-- Unified media table for all project files (documents, images, videos, etc.)
CREATE TABLE construction_mgr.be_media_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    media_type construction_mgr.media_type NOT NULL,
    project_id UUID NOT NULL,
    phase_id UUID,
    file_path TEXT NOT NULL UNIQUE,
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    caption TEXT,
    thumbnail_url TEXT,
    processing_status VARCHAR(50) DEFAULT 'completed',
    category construction_mgr.media_category NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_media_project FOREIGN KEY (project_id) 
        REFERENCES construction_mgr.be_project(id) ON DELETE CASCADE,
    CONSTRAINT fk_media_phase FOREIGN KEY (phase_id) 
        REFERENCES construction_mgr.be_phase(id) ON DELETE SET NULL,
    
    -- Constraint to ensure valid media_type and category combinations
    CONSTRAINT chk_media_type_category_valid CHECK (
        (media_type = 'PHOTO' AND category IN ('profile', 'inspiration', 'progress')) OR
        (media_type = 'VIDEO' AND category IN ('progress_video')) OR  
        (media_type = 'DOCUMENT' AND category IN ('receipt', 'report', 'contract', 'permit', 'invoice', 'blueprint', 'other'))
    )
);

-- Update trigger
CREATE TRIGGER update_media_modtime
    BEFORE UPDATE ON construction_mgr.be_media_items
    FOR EACH ROW
    EXECUTE FUNCTION construction_mgr.update_updated_at_column();

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Primary indexes for common queries
CREATE INDEX idx_media_project ON construction_mgr.be_media_items (project_id);
CREATE INDEX idx_media_phase ON construction_mgr.be_media_items (phase_id);
CREATE INDEX idx_media_type ON construction_mgr.be_media_items (media_type);
CREATE INDEX idx_media_category ON construction_mgr.be_media_items (category);

-- Composite indexes for complex queries
CREATE INDEX idx_media_project_category ON construction_mgr.be_media_items (project_id, category);
CREATE INDEX idx_media_project_type ON construction_mgr.be_media_items (project_id, media_type);
CREATE INDEX idx_media_project_created ON construction_mgr.be_media_items (project_id, created_at DESC);
CREATE INDEX idx_media_category_created ON construction_mgr.be_media_items (category, created_at DESC);

-- Additional indexes
CREATE INDEX idx_media_tags ON construction_mgr.be_media_items USING gin (tags);
CREATE INDEX idx_media_metadata ON construction_mgr.be_media_items USING gin (metadata);

-- =============================================================================
-- STORAGE BUCKETS SETUP
-- =============================================================================

-- Storage buckets with comprehensive MIME type support
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('user_profiles', 'user_profiles', true, 10485760, 
   ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif', 'image/avif', 'image/bmp']),
  
  ('PHOTO', 'PHOTO', false, 52428800,
   ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif', 'image/avif', 'image/bmp', 'image/tiff', 'image/tif']),
   
  ('VIDEO', 'VIDEO', false, 209715200,
   ARRAY['video/mp4', 'video/mpeg', 'video/quicktime', 'video/mov', 'video/x-msvideo', 'video/avi', 'video/webm', 'video/ogg', 'video/3gpp', 'video/3gp']),
   
  ('DOCUMENT', 'DOCUMENT', false, 104857600,
   ARRAY['application/pdf', 'application/msword', 'application/doc', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/xls', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-powerpoint', 'application/ppt', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain', 'text/csv', 'application/zip', 'application/x-zip-compressed', 'application/rtf', 'application/json', 'image/svg+xml'])

ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =============================================================================
-- MEDIA QUERY FUNCTIONS
-- =============================================================================

-- Function to get project media by category and type
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
    file_size_bytes BIGINT,
    mime_type TEXT,
    media_type TEXT,
    description TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.project_id,
        m.phase_id,
        m.category,
        m.name as file_name,
        m.file_path,
        m.file_size_bytes,
        m.mime_type,
        m.media_type,
        m.description,
        m.tags,
        m.created_at,
        m.updated_at
    FROM construction_mgr.be_media_items m
    WHERE m.project_id = p_project_id
    AND (p_category IS NULL OR m.category = p_category)
    AND (p_phase_id IS NULL OR m.phase_id = p_phase_id)
    ORDER BY m.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION construction_mgr.get_project_media_by_category TO authenticated;


-- Project media view
CREATE VIEW construction_mgr.project_media AS
SELECT 
    m.id, m.project_id, m.phase_id, m.category, m.name as file_name,
    m.file_path, m.file_size_bytes, m.mime_type, m.media_type,
    m.description, m.created_at, m.updated_at,
    p.name as project_name, ph.name as phase_name
FROM construction_mgr.be_media_items m
LEFT JOIN construction_mgr.be_project p ON m.project_id = p.id
LEFT JOIN construction_mgr.be_phase ph ON m.phase_id = ph.id;

GRANT SELECT ON construction_mgr.project_media TO authenticated;

