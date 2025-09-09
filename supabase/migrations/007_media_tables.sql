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
        (media_type = 'DOCUMENT' AND category IN ('receipt', 'report', 'contract', 'permit', 'invoice', 'specification', 'schedule', 'drawing', 'manual', 'certificate', 'other_document'))
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

-- Storage buckets for BuildEase media types
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('user_profiles', 'user_profiles', true, 10485760, 
   ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  
  ('PHOTO', 'PHOTO', false, 52428800,
   ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/tiff']),
   
  ('VIDEO', 'VIDEO', false, 209715200,
   ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/mov']),
   
  ('DOCUMENT', 'DOCUMENT', false, 104857600,
   ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain',
         'application/msword', 'application/vnd.ms-excel'])

ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

