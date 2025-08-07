-- Migration: 031_advanced_media_features.sql
-- Purpose: Add advanced media management features with metadata, tags, and bulk operations
-- Date: August 3, 2025

-- Add metadata and tagging features to existing document table
ALTER TABLE construction_mgr.be_document 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS caption TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT,
ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS processing_status VARCHAR(50) DEFAULT 'completed';

-- Add search and performance indexes
CREATE INDEX IF NOT EXISTS idx_document_tags ON construction_mgr.be_document USING gin (tags);
CREATE INDEX IF NOT EXISTS idx_document_metadata ON construction_mgr.be_document USING gin (metadata);
CREATE INDEX IF NOT EXISTS idx_document_mime_type ON construction_mgr.be_document (mime_type);
CREATE INDEX IF NOT EXISTS idx_document_file_size ON construction_mgr.be_document (file_size_bytes);
CREATE INDEX IF NOT EXISTS idx_document_processing_status ON construction_mgr.be_document (processing_status);

-- Create full-text search index for captions and descriptions
CREATE INDEX IF NOT EXISTS idx_document_fulltext_search 
ON construction_mgr.be_document 
USING gin (to_tsvector('english', COALESCE(caption, '') || ' ' || COALESCE(description, '')));

-- Create media collection table for organizing media into albums/collections
CREATE TABLE IF NOT EXISTS construction_mgr.media_collection (
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

-- Create junction table for documents in collections
CREATE TABLE IF NOT EXISTS construction_mgr.collection_document (
    collection_id UUID NOT NULL REFERENCES construction_mgr.media_collection(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES construction_mgr.be_document(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    added_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    added_by UUID REFERENCES construction_mgr.be_user(id),
    
    PRIMARY KEY (collection_id, document_id)
);

-- Create media processing queue table for handling uploads and transformations
CREATE TABLE IF NOT EXISTS construction_mgr.media_processing_queue (
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

-- Create indexes for media processing queue
CREATE INDEX IF NOT EXISTS idx_processing_queue_status ON construction_mgr.media_processing_queue (status);
CREATE INDEX IF NOT EXISTS idx_processing_queue_priority ON construction_mgr.media_processing_queue (priority);
CREATE INDEX IF NOT EXISTS idx_processing_queue_scheduled ON construction_mgr.media_processing_queue (scheduled_for);
CREATE INDEX IF NOT EXISTS idx_processing_queue_document ON construction_mgr.media_processing_queue (document_id);

-- Create indexes for collections
CREATE INDEX IF NOT EXISTS idx_collection_project ON construction_mgr.media_collection (project_id);
CREATE INDEX IF NOT EXISTS idx_collection_type ON construction_mgr.media_collection (collection_type);
CREATE INDEX IF NOT EXISTS idx_collection_created_by ON construction_mgr.media_collection (created_by);
CREATE INDEX IF NOT EXISTS idx_collection_document_sort ON construction_mgr.collection_document (collection_id, sort_order);

-- Add updated_at triggers for new tables
CREATE TRIGGER tr_media_collection_updated_at
    BEFORE UPDATE ON construction_mgr.media_collection
    FOR EACH ROW
    EXECUTE FUNCTION construction_mgr.update_updated_at_column();

CREATE TRIGGER tr_media_processing_updated_at
    BEFORE UPDATE ON construction_mgr.media_processing_queue
    FOR EACH ROW
    EXECUTE FUNCTION construction_mgr.update_updated_at_column();

-- Add RLS policies for media collections
ALTER TABLE construction_mgr.media_collection ENABLE ROW LEVEL SECURITY;
ALTER TABLE construction_mgr.collection_document ENABLE ROW LEVEL SECURITY;
ALTER TABLE construction_mgr.media_processing_queue ENABLE ROW LEVEL SECURITY;

-- RLS for media collections - users can access collections for projects they have access to
CREATE POLICY "Users can view collections for accessible projects"
    ON construction_mgr.media_collection
    FOR SELECT
    USING (
        project_id IN (
            SELECT p.id 
            FROM construction_mgr.be_project p 
            WHERE p.owner_id = auth.uid()
            OR EXISTS (
                SELECT 1 
                FROM construction_mgr.be_project_member pm 
                WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can create collections for accessible projects"
    ON construction_mgr.media_collection
    FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT p.id 
            FROM construction_mgr.be_project p 
            WHERE p.owner_id = auth.uid()
            OR EXISTS (
                SELECT 1 
                FROM construction_mgr.be_project_member pm 
                WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
            )
        )
        AND created_by = auth.uid()
    );

CREATE POLICY "Users can update their own collections"
    ON construction_mgr.media_collection
    FOR UPDATE
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete their own collections"
    ON construction_mgr.media_collection
    FOR DELETE
    USING (created_by = auth.uid());

-- RLS for collection documents - follow collection access rules
CREATE POLICY "Users can view collection documents for accessible collections"
    ON construction_mgr.collection_document
    FOR SELECT
    USING (
        collection_id IN (
            SELECT id FROM construction_mgr.media_collection
            WHERE project_id IN (
                SELECT p.id 
                FROM construction_mgr.be_project p 
                WHERE p.owner_id = auth.uid()
                OR EXISTS (
                    SELECT 1 
                    FROM construction_mgr.be_project_member pm 
                    WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can manage collection documents for their collections"
    ON construction_mgr.collection_document
    FOR ALL
    USING (
        collection_id IN (
            SELECT id FROM construction_mgr.media_collection
            WHERE created_by = auth.uid()
        )
    )
    WITH CHECK (
        collection_id IN (
            SELECT id FROM construction_mgr.media_collection
            WHERE created_by = auth.uid()
        )
        AND added_by = auth.uid()
    );

-- RLS for media processing queue - users can only see processing for their documents
CREATE POLICY "Users can view processing for their documents"
    ON construction_mgr.media_processing_queue
    FOR SELECT
    USING (
        document_id IN (
            SELECT d.id 
            FROM construction_mgr.be_document d
            JOIN construction_mgr.be_project p ON d.project_id = p.id
            WHERE p.owner_id = auth.uid()
            OR EXISTS (
                SELECT 1 
                FROM construction_mgr.be_project_member pm 
                WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
            )
        )
    );

-- Add helpful database functions for media management

-- Function to get media statistics for a project
CREATE OR REPLACE FUNCTION construction_mgr.get_project_media_stats(project_uuid UUID)
RETURNS TABLE (
    total_documents INTEGER,
    total_size_bytes BIGINT,
    total_size_mb NUMERIC(10,2),
    document_types JSONB,
    recent_uploads INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_documents,
        COALESCE(SUM(file_size_bytes), 0)::BIGINT as total_size_bytes,
        ROUND(COALESCE(SUM(file_size_bytes), 0)::NUMERIC / (1024.0 * 1024.0), 2) as total_size_mb,
        COALESCE(
            jsonb_object_agg(
                COALESCE(document_type::text, 'unknown'), 
                type_count
            ), 
            '{}'::jsonb
        ) as document_types,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END)::INTEGER as recent_uploads
    FROM (
        SELECT 
            document_type,
            file_size_bytes,
            created_at,
            COUNT(*) as type_count
        FROM construction_mgr.be_document 
        WHERE project_id = project_uuid
        GROUP BY document_type, file_size_bytes, created_at
    ) subq;
END;
$$;

-- Function to search media with full-text search
CREATE OR REPLACE FUNCTION construction_mgr.search_project_media(
    project_uuid UUID,
    search_term TEXT,
    media_tags TEXT[] DEFAULT NULL,
    document_types TEXT[] DEFAULT NULL,
    limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    document_type TEXT,
    file_path TEXT,
    caption TEXT,
    description TEXT,
    tags TEXT[],
    file_size_bytes BIGINT,
    mime_type TEXT,
    created_at TIMESTAMPTZ,
    relevance_score REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.name,
        d.document_type::TEXT,
        d.file_path,
        d.caption,
        d.description,
        d.tags,
        d.file_size_bytes,
        d.mime_type,
        d.created_at,
        COALESCE(
            ts_rank(
                to_tsvector('english', COALESCE(d.caption, '') || ' ' || COALESCE(d.description, '')),
                plainto_tsquery('english', search_term)
            ),
            0
        ) as relevance_score
    FROM construction_mgr.be_document d
    WHERE d.project_id = project_uuid
        AND (
            search_term IS NULL 
            OR search_term = ''
            OR to_tsvector('english', COALESCE(d.caption, '') || ' ' || COALESCE(d.description, '')) @@ plainto_tsquery('english', search_term)
            OR d.name ILIKE '%' || search_term || '%'
        )
        AND (media_tags IS NULL OR d.tags && media_tags)
        AND (document_types IS NULL OR d.document_type::TEXT = ANY(document_types))
    ORDER BY 
        CASE WHEN search_term IS NOT NULL AND search_term != '' THEN relevance_score ELSE 0 END DESC,
        d.created_at DESC
    LIMIT limit_count;
END;
$$;

-- Add table and column comments for documentation
COMMENT ON TABLE construction_mgr.media_collection IS 'Media collections for organizing project documents into albums and categories';
COMMENT ON TABLE construction_mgr.collection_document IS 'Junction table linking documents to collections with sort order';
COMMENT ON TABLE construction_mgr.media_processing_queue IS 'Queue for background media processing tasks like thumbnails and compression';

COMMENT ON COLUMN construction_mgr.be_document.metadata IS 'Flexible JSONB field for storing document-specific metadata';
COMMENT ON COLUMN construction_mgr.be_document.tags IS 'Array of tags for categorizing and searching documents';
COMMENT ON COLUMN construction_mgr.be_document.caption IS 'Short description or title for the document';
COMMENT ON COLUMN construction_mgr.be_document.description IS 'Detailed description of the document content';
COMMENT ON COLUMN construction_mgr.be_document.file_size_bytes IS 'File size in bytes for storage management';
COMMENT ON COLUMN construction_mgr.be_document.thumbnail_url IS 'URL to document thumbnail for quick preview';
COMMENT ON COLUMN construction_mgr.be_document.processing_status IS 'Status of any background processing (thumbnail generation, etc.)';

COMMENT ON FUNCTION construction_mgr.get_project_media_stats IS 'Returns comprehensive media statistics for a project';
COMMENT ON FUNCTION construction_mgr.search_project_media IS 'Full-text search function for project media with filtering and ranking';