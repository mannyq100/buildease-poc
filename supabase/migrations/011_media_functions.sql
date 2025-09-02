-- Migration: 011_media_functions.sql
-- Purpose: Defines simplified functions for unified media management and storage access.

-- =============================================================================
-- STORAGE ACCESS FUNCTIONS
-- =============================================================================

-- Simplified helper function for storage access
CREATE OR REPLACE FUNCTION private.has_storage_access(
    bucket_name TEXT, 
    file_path TEXT, 
    user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN AS $$
DECLARE
    path_parts TEXT[];
    project_id_str TEXT;
BEGIN
    -- Handle null user
    IF user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Parse file path based on new unified media schema
    path_parts := string_to_array(file_path, '/');
    
    -- For user_profiles: user_profiles/{user_id}/filename
    IF bucket_name = 'user_profiles' THEN
        -- Expected format: user_profiles/{user_id}/filename
        RETURN array_length(path_parts, 1) >= 2 
               AND path_parts[1] = 'user_profiles'
               AND path_parts[2] = user_id::text;
    END IF;
    
    -- For PHOTO bucket: PHOTO/{project_id}/{category}/filename
    IF bucket_name = 'PHOTO' THEN
        -- Expected format: PHOTO/{project_id}/{category}/filename
        IF array_length(path_parts, 1) < 4 THEN
            RETURN FALSE;
        END IF;
        
        -- First part should be PHOTO, second part is project_id
        IF path_parts[1] != 'PHOTO' THEN
            RETURN FALSE;
        END IF;
        
        project_id_str := path_parts[2];
        RETURN private.has_project_access_direct(project_id_str::UUID, user_id);
    END IF;
    
    -- For VIDEO bucket: VIDEO/{project_id}/{category}/filename
    IF bucket_name = 'VIDEO' THEN
        -- Expected format: VIDEO/{project_id}/{category}/filename
        IF array_length(path_parts, 1) < 4 THEN
            RETURN FALSE;
        END IF;
        
        -- First part should be VIDEO, second part is project_id
        IF path_parts[1] != 'VIDEO' THEN
            RETURN FALSE;
        END IF;
        
        project_id_str := path_parts[2];
        RETURN private.has_project_access_direct(project_id_str::UUID, user_id);
    END IF;
    
    -- For DOCUMENT bucket: DOCUMENT/{project_id}/{category}/filename
    IF bucket_name = 'DOCUMENT' THEN
        -- Expected format: DOCUMENT/{project_id}/{category}/filename
        IF array_length(path_parts, 1) < 4 THEN
            RETURN FALSE;
        END IF;
        
        -- First part should be DOCUMENT, second part is project_id
        IF path_parts[1] != 'DOCUMENT' THEN
            RETURN FALSE;
        END IF;
        
        project_id_str := path_parts[2];
        RETURN private.has_project_access_direct(project_id_str::UUID, user_id);
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup function for debugging (optional)
CREATE OR REPLACE FUNCTION construction_mgr.debug_storage_access(
    p_bucket_id TEXT,
    p_file_path TEXT,
    p_user_id UUID DEFAULT auth.uid()
)
RETURNS TABLE (
    has_access BOOLEAN,
    path_structure TEXT[],
    bucket_exists BOOLEAN,
    error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        private.has_storage_access(p_bucket_id, p_file_path, p_user_id) as has_access,
        string_to_array(p_file_path, '/') as path_structure,
        EXISTS(SELECT 1 FROM storage.buckets WHERE id = p_bucket_id) as bucket_exists,
        CASE 
            WHEN p_user_id IS NULL THEN 'User not authenticated'
            WHEN NOT EXISTS(SELECT 1 FROM storage.buckets WHERE id = p_bucket_id) THEN 'Bucket does not exist'
            ELSE 'OK'
        END as error_message;
END;
$$;

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
                COALESCE(media_type::text, 'unknown'), 
                type_count
            ), 
            '{}'::jsonb
        ) as media_types,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END)::INTEGER as recent_uploads,
        COUNT(CASE WHEN media_type = 'PHOTO' THEN 1 END)::INTEGER as photos_count,
        COUNT(CASE WHEN media_type = 'VIDEO' THEN 1 END)::INTEGER as videos_count,
        COUNT(CASE WHEN media_type = 'DOCUMENT' THEN 1 END)::INTEGER as documents_count
    FROM (
        SELECT 
            media_type,
            file_size_bytes,
            created_at,
            COUNT(*) as type_count
        FROM construction_mgr.be_media_items 
        WHERE project_id = project_uuid
        GROUP BY media_type, file_size_bytes, created_at
    ) subq;
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
            RETURN ARRAY['profile_image', 'inspiration_image', 'progress_image'];
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

-- Grant permissions for simplified media functions
GRANT EXECUTE ON FUNCTION construction_mgr.debug_storage_access TO authenticated;
GRANT EXECUTE ON FUNCTION construction_mgr.get_project_media_stats TO authenticated;
GRANT EXECUTE ON FUNCTION construction_mgr.search_project_media TO authenticated;
GRANT EXECUTE ON FUNCTION construction_mgr.get_media_type_counts TO authenticated;
GRANT EXECUTE ON FUNCTION construction_mgr.get_valid_categories_for_media_type TO authenticated;
