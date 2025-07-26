-- Migration: 024_orphaned_file_cleanup.sql
-- Purpose: Implement comprehensive orphaned file cleanup system

-- Function to clean up all storage files when a project is deleted
CREATE OR REPLACE FUNCTION construction_mgr.cleanup_project_storage_files()
RETURNS TRIGGER AS $$
DECLARE
    file_record RECORD;
    cleanup_count INTEGER := 0;
BEGIN
    -- Clean up all storage files associated with the deleted project
    FOR file_record IN
        SELECT bucket_id, name
        FROM storage.objects
        WHERE name LIKE '%/' || OLD.id::text || '/%'
        OR name LIKE OLD.id::text || '/%'
    LOOP
        BEGIN
            -- Delete the storage file
            DELETE FROM storage.objects 
            WHERE bucket_id = file_record.bucket_id 
            AND name = file_record.name;
            
            cleanup_count := cleanup_count + 1;
            RAISE NOTICE 'Cleaned up storage file: %/%', file_record.bucket_id, file_record.name;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Failed to delete storage file %/%: %', 
                file_record.bucket_id, file_record.name, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE 'Cleaned up % storage files for deleted project %', cleanup_count, OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up document records when storage files are deleted
CREATE OR REPLACE FUNCTION construction_mgr.cleanup_document_records()
RETURNS TRIGGER AS $$
BEGIN
    -- Only process document bucket deletions
    IF OLD.bucket_id != 'documents' THEN
        RETURN OLD;
    END IF;
    
    -- Delete corresponding document record
    DELETE FROM construction_mgr.be_document
    WHERE file_path = OLD.name;
    
    RAISE NOTICE 'Cleaned up document record for deleted file: %', OLD.name;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to find and clean up all orphaned files across all buckets
CREATE OR REPLACE FUNCTION construction_mgr.cleanup_all_orphaned_files()
RETURNS TABLE(
    bucket_name TEXT,
    cleaned_count INTEGER,
    errors TEXT[]
) AS $$
DECLARE
    bucket_record RECORD;
    orphaned_file RECORD;
    cleanup_count INTEGER;
    error_list TEXT[];
    extracted_project_id UUID;
    path_parts TEXT[];
BEGIN
    -- Process each storage bucket
    FOR bucket_record IN
        SELECT name FROM storage.buckets
        WHERE name IN ('documents', 'progress-images', 'project-inspiration', 'profiles')
    LOOP
        cleanup_count := 0;
        error_list := ARRAY[]::TEXT[];
        
        -- Find orphaned files in this bucket
        FOR orphaned_file IN
            SELECT so.name
            FROM storage.objects so
            WHERE so.bucket_id = bucket_record.name
        LOOP
            BEGIN
                -- Parse project ID from file path
                path_parts := string_to_array(orphaned_file.name, '/');
                
                -- Skip if path structure is invalid
                IF array_length(path_parts, 1) < 2 THEN
                    CONTINUE;
                END IF;
                
                -- Extract project ID (usually second part of path)
                BEGIN
                    extracted_project_id := path_parts[2]::UUID;
                EXCEPTION WHEN invalid_text_representation THEN
                    -- Skip files with invalid project ID format
                    CONTINUE;
                END;
                
                -- Check if project exists
                IF NOT EXISTS (SELECT 1 FROM construction_mgr.be_project WHERE id = extracted_project_id) THEN
                    -- Project doesn't exist, file is orphaned
                    DELETE FROM storage.objects 
                    WHERE bucket_id = bucket_record.name 
                    AND name = orphaned_file.name;
                    
                    cleanup_count := cleanup_count + 1;
                    RAISE NOTICE 'Cleaned up orphaned file: %/%', bucket_record.name, orphaned_file.name;
                END IF;
                
            EXCEPTION WHEN OTHERS THEN
                error_list := array_append(error_list, 
                    format('Failed to process %s: %s', orphaned_file.name, SQLERRM));
            END;
        END LOOP;
        
        -- Return results for this bucket
        RETURN QUERY SELECT bucket_record.name, cleanup_count, error_list;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate storage file integrity
CREATE OR REPLACE FUNCTION construction_mgr.validate_storage_integrity()
RETURNS TABLE(
    issue_type TEXT,
    bucket_name TEXT,
    file_path TEXT,
    description TEXT
) AS $$
DECLARE
    file_record RECORD;
    doc_record RECORD;
    project_record RECORD;
    extracted_project_id UUID;
    path_parts TEXT[];
BEGIN
    -- Check for storage files without corresponding database records
    FOR file_record IN
        SELECT bucket_id, name
        FROM storage.objects
        WHERE bucket_id IN ('documents', 'progress-images', 'project-inspiration')
    LOOP
        -- Parse project ID from path
        path_parts := string_to_array(file_record.name, '/');
        
        IF array_length(path_parts, 1) >= 2 THEN
            BEGIN
                extracted_project_id := path_parts[2]::UUID;
                
                -- Check if project exists
                IF NOT EXISTS (SELECT 1 FROM construction_mgr.be_project WHERE id = extracted_project_id) THEN
                    RETURN QUERY SELECT 
                        'orphaned_file'::TEXT,
                        file_record.bucket_id,
                        file_record.name,
                        'Storage file exists but project does not exist'::TEXT;
                END IF;
                
                -- For documents bucket, check if document record exists
                IF file_record.bucket_id = 'documents' THEN
                    IF NOT EXISTS (SELECT 1 FROM construction_mgr.be_document WHERE file_path = file_record.name) THEN
                        RETURN QUERY SELECT 
                            'missing_document_record'::TEXT,
                            file_record.bucket_id,
                            file_record.name,
                            'Storage file exists but document record is missing'::TEXT;
                    END IF;
                END IF;
                
            EXCEPTION WHEN invalid_text_representation THEN
                RETURN QUERY SELECT 
                    'invalid_path'::TEXT,
                    file_record.bucket_id,
                    file_record.name,
                    'File path does not contain valid project UUID'::TEXT;
            END;
        ELSE
            RETURN QUERY SELECT 
                'invalid_path_structure'::TEXT,
                file_record.bucket_id,
                file_record.name,
                'File path structure is invalid'::TEXT;
        END IF;
    END LOOP;
    
    -- Check for document records without corresponding storage files
    FOR doc_record IN
        SELECT file_path, project_id
        FROM construction_mgr.be_document
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM storage.objects 
            WHERE bucket_id = 'documents' AND name = doc_record.file_path
        ) THEN
            RETURN QUERY SELECT 
                'missing_storage_file'::TEXT,
                'documents'::TEXT,
                doc_record.file_path,
                'Document record exists but storage file is missing'::TEXT;
        END IF;
    END LOOP;
    
    -- Check for progress images in project table without storage files
    FOR project_record IN
        SELECT id, progress_images
        FROM construction_mgr.be_project
        WHERE progress_images IS NOT NULL AND jsonb_array_length(progress_images) > 0
    LOOP
        -- Check each progress image URL
        FOR file_record IN
            SELECT value::text as image_url
            FROM jsonb_array_elements_text(project_record.progress_images)
        LOOP
            -- Extract file path from URL
            -- This is a simplified check - in practice you'd parse the full URL
            IF NOT EXISTS (
                SELECT 1 FROM storage.objects 
                WHERE bucket_id = 'progress-images' 
                AND name LIKE '%' || project_record.id::text || '%'
            ) THEN
                RETURN QUERY SELECT 
                    'missing_progress_image'::TEXT,
                    'progress-images'::TEXT,
                    file_record.image_url,
                    'Progress image URL in project but storage file missing'::TEXT;
            END IF;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for automatic cleanup
CREATE TRIGGER on_project_deleted_cleanup_storage
    AFTER DELETE ON construction_mgr.be_project
    FOR EACH ROW
    EXECUTE FUNCTION construction_mgr.cleanup_project_storage_files();

CREATE TRIGGER on_storage_file_deleted_cleanup_documents
    AFTER DELETE ON storage.objects
    FOR EACH ROW
    EXECUTE FUNCTION construction_mgr.cleanup_document_records();

-- Add comments for documentation
COMMENT ON FUNCTION construction_mgr.cleanup_project_storage_files() IS 
'Automatically cleans up all storage files when a project is deleted';

COMMENT ON FUNCTION construction_mgr.cleanup_document_records() IS 
'Automatically cleans up document records when storage files are deleted';

COMMENT ON FUNCTION construction_mgr.cleanup_all_orphaned_files() IS 
'Finds and cleans up orphaned files across all storage buckets';

COMMENT ON FUNCTION construction_mgr.validate_storage_integrity() IS 
'Validates integrity between storage files and database records, reports inconsistencies';
