-- Migration: 011_media_functions.sql
-- Purpose: Defines all functions for media management and storage access.

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
    
    -- Parse file path: expected format {userId}/{projectId?}/{filename}
    path_parts := string_to_array(file_path, '/');
    
    -- For profiles: user can manage their own files, but all authenticated users can view
    IF bucket_name = 'profiles' THEN
        -- For upload/update/delete: user must own the file
        RETURN array_length(path_parts, 1) >= 1 
               AND path_parts[1] = user_id::text;
    END IF;
    
    -- For inspiration images: any authenticated user can upload/view
    IF bucket_name = 'project-inspiration' THEN
        -- Basic authenticated user check
        RETURN TRUE;
    END IF;
    
    -- For progress images: any authenticated user can view, uploader can manage
    IF bucket_name = 'progress-images' THEN
        -- Basic authenticated user check (public bucket now)
        RETURN TRUE;
    END IF;
    
    -- For documents: strict project member access only
    IF bucket_name = 'documents' THEN
        -- Require at least 2 path parts for project buckets
        IF array_length(path_parts, 1) < 2 THEN
            RETURN FALSE;
        END IF;
        
        -- First part should be user ID for upload permissions
        IF path_parts[1] != user_id::text THEN
            RETURN FALSE;
        END IF;
        
        -- Validate project access for documents
        IF array_length(path_parts, 1) >= 3 THEN
            project_id_str := path_parts[2];
            RETURN private.has_project_access_direct(project_id_str::UUID, user_id);
        END IF;
        
        RETURN FALSE;
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

-- =============================================================================
-- MEDIA SEARCH FUNCTIONS
-- =============================================================================

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

-- =============================================================================
-- MEDIA COLLECTION FUNCTIONS
-- =============================================================================

-- Function to get collection statistics
CREATE OR REPLACE FUNCTION construction_mgr.get_collection_stats(collection_uuid UUID)
RETURNS TABLE (
    collection_name TEXT,
    document_count INTEGER,
    total_size_bytes BIGINT,
    total_size_mb NUMERIC(10,2),
    created_at TIMESTAMPTZ,
    last_updated TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mc.name as collection_name,
        COUNT(cd.document_id)::INTEGER as document_count,
        COALESCE(SUM(d.file_size_bytes), 0)::BIGINT as total_size_bytes,
        ROUND(COALESCE(SUM(d.file_size_bytes), 0)::NUMERIC / (1024.0 * 1024.0), 2) as total_size_mb,
        mc.created_at,
        mc.updated_at as last_updated
    FROM construction_mgr.media_collection mc
    LEFT JOIN construction_mgr.collection_document cd ON mc.id = cd.collection_id
    LEFT JOIN construction_mgr.be_document d ON cd.document_id = d.id
    WHERE mc.id = collection_uuid
    GROUP BY mc.id, mc.name, mc.created_at, mc.updated_at;
END;
$$;

-- Function to add document to collection
CREATE OR REPLACE FUNCTION construction_mgr.add_document_to_collection(
    p_collection_id UUID,
    p_document_id UUID,
    p_user_id UUID DEFAULT auth.uid(),
    p_sort_order INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    next_sort_order INTEGER;
BEGIN
    -- Check if user has access to the collection
    IF NOT EXISTS (
        SELECT 1 FROM construction_mgr.media_collection 
        WHERE id = p_collection_id 
        AND created_by = p_user_id
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- Check if document exists and user has access
    IF NOT EXISTS (
        SELECT 1 FROM construction_mgr.be_document d
        JOIN construction_mgr.be_project p ON d.project_id = p.id
        WHERE d.id = p_document_id 
        AND (p.owner_id = p_user_id OR EXISTS (
            SELECT 1 FROM construction_mgr.be_project_member pm 
            WHERE pm.project_id = p.id AND pm.user_id = p_user_id
        ))
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- Get next sort order if not provided
    IF p_sort_order IS NULL THEN
        SELECT COALESCE(MAX(sort_order), 0) + 1
        INTO next_sort_order
        FROM construction_mgr.collection_document
        WHERE collection_id = p_collection_id;
    ELSE
        next_sort_order := p_sort_order;
    END IF;
    
    -- Add document to collection
    INSERT INTO construction_mgr.collection_document (
        collection_id, 
        document_id, 
        sort_order, 
        added_by
    ) VALUES (
        p_collection_id, 
        p_document_id, 
        next_sort_order, 
        p_user_id
    )
    ON CONFLICT (collection_id, document_id) DO UPDATE SET
        sort_order = EXCLUDED.sort_order,
        added_at = CURRENT_TIMESTAMP;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove document from collection
CREATE OR REPLACE FUNCTION construction_mgr.remove_document_from_collection(
    p_collection_id UUID,
    p_document_id UUID,
    p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if user has access to the collection
    IF NOT EXISTS (
        SELECT 1 FROM construction_mgr.media_collection 
        WHERE id = p_collection_id 
        AND created_by = p_user_id
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- Remove document from collection
    DELETE FROM construction_mgr.collection_document
    WHERE collection_id = p_collection_id 
    AND document_id = p_document_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- MEDIA PROCESSING FUNCTIONS
-- =============================================================================

-- Function to queue media processing job
CREATE OR REPLACE FUNCTION construction_mgr.queue_media_processing(
    p_document_id UUID,
    p_processing_type VARCHAR(50),
    p_priority INTEGER DEFAULT 5,
    p_processing_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    queue_id UUID;
BEGIN
    -- Insert processing job
    INSERT INTO construction_mgr.media_processing_queue (
        document_id,
        processing_type,
        priority,
        processing_data,
        scheduled_for
    ) VALUES (
        p_document_id,
        p_processing_type,
        p_priority,
        p_processing_data,
        CASE 
            WHEN p_priority <= 3 THEN CURRENT_TIMESTAMP
            ELSE CURRENT_TIMESTAMP + INTERVAL '5 minutes'
        END
    ) RETURNING id INTO queue_id;
    
    -- Update document processing status
    UPDATE construction_mgr.be_document
    SET processing_status = 'queued'
    WHERE id = p_document_id;
    
    RETURN queue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get next processing job
CREATE OR REPLACE FUNCTION construction_mgr.get_next_processing_job()
RETURNS TABLE (
    id UUID,
    document_id UUID,
    processing_type VARCHAR(50),
    processing_data JSONB,
    attempt_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mpq.id,
        mpq.document_id,
        mpq.processing_type,
        mpq.processing_data,
        mpq.attempt_count
    FROM construction_mgr.media_processing_queue mpq
    WHERE mpq.status = 'pending'
    AND mpq.scheduled_for <= CURRENT_TIMESTAMP
    AND mpq.attempt_count < mpq.max_attempts
    ORDER BY mpq.priority ASC, mpq.scheduled_for ASC
    LIMIT 1;
END;
$$;

-- Function to update processing job status
CREATE OR REPLACE FUNCTION construction_mgr.update_processing_job_status(
    p_job_id UUID,
    p_status VARCHAR(50),
    p_result_data JSONB DEFAULT '{}',
    p_error_message TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE construction_mgr.media_processing_queue
    SET 
        status = p_status,
        result_data = p_result_data,
        error_message = p_error_message,
        attempt_count = attempt_count + 1,
        started_at = CASE WHEN p_status = 'processing' THEN CURRENT_TIMESTAMP ELSE started_at END,
        completed_at = CASE WHEN p_status IN ('completed', 'failed') THEN CURRENT_TIMESTAMP ELSE completed_at END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_job_id;
    
    -- Update document processing status
    IF p_status = 'completed' THEN
        UPDATE construction_mgr.be_document
        SET processing_status = 'completed'
        WHERE id = (SELECT document_id FROM construction_mgr.media_processing_queue WHERE id = p_job_id);
    ELSIF p_status = 'failed' THEN
        UPDATE construction_mgr.be_document
        SET processing_status = 'failed'
        WHERE id = (SELECT document_id FROM construction_mgr.media_processing_queue WHERE id = p_job_id);
    END IF;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================

GRANT EXECUTE ON FUNCTION construction_mgr.debug_storage_access TO authenticated;
GRANT EXECUTE ON FUNCTION construction_mgr.get_project_media_stats TO authenticated;
GRANT EXECUTE ON FUNCTION construction_mgr.search_project_media TO authenticated;
GRANT EXECUTE ON FUNCTION construction_mgr.get_collection_stats TO authenticated;
GRANT EXECUTE ON FUNCTION construction_mgr.add_document_to_collection TO authenticated;
GRANT EXECUTE ON FUNCTION construction_mgr.remove_document_from_collection TO authenticated;
GRANT EXECUTE ON FUNCTION construction_mgr.queue_media_processing TO authenticated;
GRANT EXECUTE ON FUNCTION construction_mgr.get_next_processing_job TO service_role;
GRANT EXECUTE ON FUNCTION construction_mgr.update_processing_job_status TO service_role;
