-- Migration: 011_media_functions.sql
-- Purpose: Defines simplified functions for unified media management and storage access.

-- =============================================================================
-- STORAGE ACCESS FUNCTIONS
-- =============================================================================

-- Safe UUID casting function
CREATE OR REPLACE FUNCTION private.safe_uuid_cast(input_text TEXT)
RETURNS UUID AS $$
BEGIN
    IF input_text IS NULL OR length(trim(input_text)) = 0 THEN
        RETURN NULL;
    END IF;
    
    -- Validate UUID format
    IF input_text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        RETURN NULL;
    END IF;
    
    RETURN input_text::UUID;
EXCEPTION
    WHEN invalid_text_representation THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Path validation function
CREATE OR REPLACE FUNCTION private.validate_storage_path(file_path TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    IF file_path IS NULL OR length(trim(file_path)) = 0 THEN
        RETURN FALSE;
    END IF;
    
    -- Reject paths with traversal sequences
    IF file_path ~ '\.\./|/\.\.|/\./|^\./' THEN
        RETURN FALSE;
    END IF;
    
    -- Reject encoded traversal attempts
    IF file_path ~ '%2e%2e|%2f%2e%2e|%252e%252e' THEN
        RETURN FALSE;
    END IF;
    
    -- Reject dangerous characters
    IF file_path ~ '\x00|[\x01-\x1f\x7f-\x9f]' THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Legacy storage access function (deprecated - use has_profile_storage_access for profiles)
CREATE OR REPLACE FUNCTION private.has_storage_access(
    bucket_name TEXT, 
    file_path TEXT, 
    user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN AS $$
DECLARE
    path_parts TEXT[];
    project_id_uuid UUID;
BEGIN
    IF user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Validate path security first
    IF NOT private.validate_storage_path(file_path) THEN
        RETURN FALSE;
    END IF;
    
    path_parts := string_to_array(file_path, '/');
    
    -- Media buckets (PHOTO, VIDEO, DOCUMENT): {project_id}/category/filename
    IF bucket_name IN ('PHOTO', 'VIDEO', 'DOCUMENT') THEN
        IF array_length(path_parts, 1) < 3 THEN
            RETURN FALSE;
        END IF;
        
        -- Safe UUID casting for project ID
        project_id_uuid := private.safe_uuid_cast(path_parts[1]);
        IF project_id_uuid IS NULL THEN
            RETURN FALSE;
        END IF;
        
        RETURN private.has_project_access_direct(project_id_uuid, user_id);
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced profile storage access function for unified profiles bucket
CREATE OR REPLACE FUNCTION private.has_profile_storage_access(
    file_path TEXT, 
    user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN AS $$
DECLARE
    path_parts TEXT[];
    entity_id_uuid UUID;
BEGIN
    IF user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Validate path security
    IF NOT private.validate_storage_path(file_path) THEN
        RETURN FALSE;
    END IF;
    
    path_parts := string_to_array(file_path, '/');
    
    -- Expected format: user/{user_id}/filename OR project/{project_id}/filename
    IF array_length(path_parts, 1) < 3 THEN
        RETURN FALSE;
    END IF;
    
    -- User profile: user/{user_id}/filename
    IF path_parts[1] = 'user' THEN
        entity_id_uuid := private.safe_uuid_cast(path_parts[2]);
        RETURN entity_id_uuid = user_id;
    END IF;
    
    -- Project profile: project/{project_id}/filename
    IF path_parts[1] = 'project' THEN
        entity_id_uuid := private.safe_uuid_cast(path_parts[2]);
        RETURN private.has_project_access_direct(entity_id_uuid, user_id);
    END IF;
    
    RETURN FALSE;
    END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================================================
-- MEDIA STATISTICS FUNCTIONS
-- =============================================================================

-- Function to get media statistics for a project
CREATE OR REPLACE FUNCTION construction_mgr.get_project_media_stats(project_uuid UUID)
RETURNS TABLE (
    total_media_items INTEGER,
    total_size_bytes BIGINT,
    total_size_mb NUMERIC(10,2),
    media_types JSONB,
    recent_uploads INTEGER,
    photos_count INTEGER,
    videos_count INTEGER,
    documents_count INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_media_items,
        COALESCE(SUM(file_size_bytes), 0)::BIGINT as total_size_bytes,
        ROUND(COALESCE(SUM(file_size_bytes), 0)::NUMERIC / (1024.0 * 1024.0), 2) as total_size_mb,
        COALESCE(
            jsonb_object_agg(
                media_type::text, 
                COUNT(*)
            ) FILTER (WHERE media_type IS NOT NULL), 
            '{}'::jsonb
        ) as media_types,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END)::INTEGER as recent_uploads,
        COUNT(CASE WHEN media_type = 'PHOTO' THEN 1 END)::INTEGER as photos_count,
        COUNT(CASE WHEN media_type = 'VIDEO' THEN 1 END)::INTEGER as videos_count,
        COUNT(CASE WHEN media_type = 'DOCUMENT' THEN 1 END)::INTEGER as documents_count
    FROM construction_mgr.be_media_items 
    WHERE project_id = project_uuid
    GROUP BY ();
END;
$$;

-- =============================================================================
-- MEDIA SEARCH FUNCTIONS
-- =============================================================================

-- Function to search media with full-text search
CREATE OR REPLACE FUNCTION construction_mgr.search_project_media(
    project_uuid UUID,
    search_term TEXT,
    media_tags TEXT[] DEFAULT NULL,
    media_types TEXT[] DEFAULT NULL,
    limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    media_type construction_mgr.media_type,
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
        m.id,
        m.name,
        m.media_type,
        m.file_path,
        m.caption,
        m.description,
        m.tags,
        m.file_size_bytes,
        m.mime_type,
        m.created_at,
        COALESCE(
            ts_rank(
                to_tsvector('english', COALESCE(m.caption, '') || ' ' || COALESCE(m.description, '')),
                plainto_tsquery('english', search_term)
            ),
            0
        ) as relevance_score
    FROM construction_mgr.be_media_items m
    WHERE m.project_id = project_uuid
        AND (
            search_term IS NULL 
            OR search_term = ''
            OR to_tsvector('english', COALESCE(m.caption, '') || ' ' || COALESCE(m.description, '')) @@ plainto_tsquery('english', search_term)
            OR m.name ILIKE '%' || search_term || '%'
        )
        AND (media_tags IS NULL OR m.tags && media_tags)
        AND (media_types IS NULL OR m.media_type::TEXT = ANY(media_types))
    ORDER BY 
        CASE WHEN search_term IS NOT NULL AND search_term != '' THEN relevance_score ELSE 0 END DESC,
        m.created_at DESC
    LIMIT limit_count;
END;
$$;

-- =============================================================================
-- SIMPLIFIED SCHEMA - Complex collection and processing functions removed
-- These can be added later if needed via separate migrations
-- =============================================================================

-- Basic function to get media count by type for a project
CREATE OR REPLACE FUNCTION construction_mgr.get_media_type_counts(project_uuid UUID)
RETURNS TABLE (
    media_type construction_mgr.media_type,
    count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.media_type,
        COUNT(*) as count
    FROM construction_mgr.be_media_items m
    WHERE m.project_id = project_uuid
    GROUP BY m.media_type
    ORDER BY count DESC;
END;
$$;

-- Function to get valid categories for a media type
CREATE OR REPLACE FUNCTION construction_mgr.get_valid_categories_for_media_type(p_media_type construction_mgr.media_type)
RETURNS TEXT[] AS $$
BEGIN
    CASE p_media_type
        WHEN 'PHOTO' THEN
            RETURN ARRAY['profile', 'inspiration', 'progress'];
        WHEN 'VIDEO' THEN
            RETURN ARRAY['progress_video'];
        WHEN 'DOCUMENT' THEN
            RETURN ARRAY['receipt', 'report', 'contract', 'permit', 'invoice', 'specification', 'schedule', 'drawing', 'manual', 'certificate', 'other_document'];
        ELSE
            RETURN ARRAY[]::TEXT[]; -- Empty array for invalid types
    END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================

-- Grant permissions for media functions (debug function removed from public access)
GRANT EXECUTE ON FUNCTION construction_mgr.get_project_media_stats TO authenticated;
GRANT EXECUTE ON FUNCTION construction_mgr.search_project_media TO authenticated;
GRANT EXECUTE ON FUNCTION construction_mgr.get_media_type_counts TO authenticated;
GRANT EXECUTE ON FUNCTION construction_mgr.get_valid_categories_for_media_type TO authenticated;
