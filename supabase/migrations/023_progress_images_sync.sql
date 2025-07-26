-- Migration: 023_progress_images_sync.sql
-- Purpose: Synchronize progress images between storage bucket and database JSONB field

-- Function to handle progress images upload and sync with project table
CREATE OR REPLACE FUNCTION construction_mgr.handle_progress_image_upload()
RETURNS TRIGGER AS $$
DECLARE
    extracted_project_id UUID;
    path_parts TEXT[];
    image_url TEXT;
    current_images JSONB;
    updated_images JSONB;
BEGIN
    -- Validate that this is actually a progress image upload
    IF NEW.bucket_id != 'progress-images' THEN
        RETURN NEW;
    END IF;
    
    -- Parse the file path safely
    path_parts := string_to_array(NEW.name, '/');
    
    -- Validate path structure: should be {userId}/{projectId}/{filename}
    IF array_length(path_parts, 1) < 3 THEN
        RAISE WARNING 'Invalid progress image path structure: %', NEW.name;
        RETURN NEW;
    END IF;
    
    -- Extract project_id from the file path
    BEGIN
        extracted_project_id := path_parts[2]::UUID;
    EXCEPTION WHEN invalid_text_representation THEN
        RAISE WARNING 'Invalid project_id UUID in progress image path: %', path_parts[2];
        RETURN NEW;
    END;
    
    -- Validate that the project exists
    IF NOT EXISTS (SELECT 1 FROM construction_mgr.be_project WHERE id = extracted_project_id) THEN
        RAISE WARNING 'Project % does not exist for progress image upload', extracted_project_id;
        RETURN NEW;
    END IF;
    
    -- Construct the public URL for the image
    image_url := format('https://%s/storage/v1/object/public/%s/%s', 
        current_setting('app.supabase_url', true), 
        NEW.bucket_id, 
        NEW.name);
    
    -- Get current progress_images array from project
    SELECT COALESCE(progress_images, '[]'::jsonb) INTO current_images
    FROM construction_mgr.be_project 
    WHERE id = extracted_project_id;
    
    -- Add new image URL to the array if not already present
    IF NOT (current_images ? image_url) THEN
        updated_images := current_images || jsonb_build_array(image_url);
        
        -- Update the project with the new progress images array
        UPDATE construction_mgr.be_project 
        SET progress_images = updated_images,
            updated_at = NOW()
        WHERE id = extracted_project_id;
        
        RAISE NOTICE 'Added progress image % to project %', image_url, extracted_project_id;
    END IF;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the storage upload
    RAISE WARNING 'Error in handle_progress_image_upload: % - %', SQLSTATE, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle progress images deletion and sync with project table
CREATE OR REPLACE FUNCTION construction_mgr.handle_progress_image_delete()
RETURNS TRIGGER AS $$
DECLARE
    extracted_project_id UUID;
    path_parts TEXT[];
    image_url TEXT;
    current_images JSONB;
    updated_images JSONB;
BEGIN
    -- Validate that this is actually a progress image deletion
    IF OLD.bucket_id != 'progress-images' THEN
        RETURN OLD;
    END IF;
    
    -- Parse the file path safely
    path_parts := string_to_array(OLD.name, '/');
    
    -- Extract project_id from the file path
    BEGIN
        extracted_project_id := path_parts[2]::UUID;
    EXCEPTION WHEN invalid_text_representation THEN
        RAISE WARNING 'Invalid project_id UUID in progress image deletion path: %', path_parts[2];
        RETURN OLD;
    END;
    
    -- Construct the public URL for the image
    image_url := format('https://%s/storage/v1/object/public/%s/%s', 
        current_setting('app.supabase_url', true), 
        OLD.bucket_id, 
        OLD.name);
    
    -- Get current progress_images array from project
    SELECT COALESCE(progress_images, '[]'::jsonb) INTO current_images
    FROM construction_mgr.be_project 
    WHERE id = extracted_project_id;
    
    -- Remove the image URL from the array
    SELECT jsonb_agg(value) INTO updated_images
    FROM jsonb_array_elements_text(current_images) AS value
    WHERE value != image_url;
    
    -- Handle case where all images were removed
    IF updated_images IS NULL THEN
        updated_images := '[]'::jsonb;
    END IF;
    
    -- Update the project with the updated progress images array
    UPDATE construction_mgr.be_project 
    SET progress_images = updated_images,
        updated_at = NOW()
    WHERE id = extracted_project_id;
    
    RAISE NOTICE 'Removed progress image % from project %', image_url, extracted_project_id;
    
    RETURN OLD;
EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the storage deletion
    RAISE WARNING 'Error in handle_progress_image_delete: % - %', SQLSTATE, SQLERRM;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for progress images synchronization
CREATE TRIGGER on_progress_image_created
    AFTER INSERT ON storage.objects
    FOR EACH ROW
    WHEN (NEW.bucket_id = 'progress-images')
    EXECUTE FUNCTION construction_mgr.handle_progress_image_upload();

CREATE TRIGGER on_progress_image_deleted
    AFTER DELETE ON storage.objects
    FOR EACH ROW
    WHEN (OLD.bucket_id = 'progress-images')
    EXECUTE FUNCTION construction_mgr.handle_progress_image_delete();

-- Function to clean up orphaned progress images (images in storage but not in project table)
CREATE OR REPLACE FUNCTION construction_mgr.cleanup_orphaned_progress_images()
RETURNS TABLE(cleaned_count INTEGER, errors TEXT[]) AS $$
DECLARE
    orphaned_file RECORD;
    cleanup_count INTEGER := 0;
    error_list TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Find progress images in storage that don't exist in any project's progress_images array
    FOR orphaned_file IN
        SELECT so.name, so.bucket_id
        FROM storage.objects so
        WHERE so.bucket_id = 'progress-images'
        AND NOT EXISTS (
            SELECT 1 
            FROM construction_mgr.be_project p
            WHERE p.progress_images ? format('https://%s/storage/v1/object/public/%s/%s', 
                current_setting('app.supabase_url', true), 
                so.bucket_id, 
                so.name)
        )
    LOOP
        BEGIN
            -- Delete the orphaned file
            DELETE FROM storage.objects 
            WHERE bucket_id = orphaned_file.bucket_id 
            AND name = orphaned_file.name;
            
            cleanup_count := cleanup_count + 1;
            RAISE NOTICE 'Cleaned up orphaned progress image: %', orphaned_file.name;
            
        EXCEPTION WHEN OTHERS THEN
            error_list := array_append(error_list, 
                format('Failed to delete %s: %s', orphaned_file.name, SQLERRM));
        END;
    END LOOP;
    
    RETURN QUERY SELECT cleanup_count, error_list;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to sync existing progress images from storage to project table
CREATE OR REPLACE FUNCTION construction_mgr.sync_existing_progress_images()
RETURNS TABLE(synced_projects INTEGER, synced_images INTEGER, errors TEXT[]) AS $$
DECLARE
    project_record RECORD;
    storage_file RECORD;
    project_count INTEGER := 0;
    image_count INTEGER := 0;
    error_list TEXT[] := ARRAY[]::TEXT[];
    current_images JSONB;
    updated_images JSONB;
    image_url TEXT;
BEGIN
    -- For each project, find progress images in storage and sync to database
    FOR project_record IN
        SELECT id FROM construction_mgr.be_project
    LOOP
        BEGIN
            -- Get current progress_images from project
            SELECT COALESCE(progress_images, '[]'::jsonb) INTO current_images
            FROM construction_mgr.be_project 
            WHERE id = project_record.id;
            
            updated_images := current_images;
            
            -- Find all progress images for this project in storage
            FOR storage_file IN
                SELECT name, bucket_id
                FROM storage.objects
                WHERE bucket_id = 'progress-images'
                AND name LIKE '%/' || project_record.id::text || '/%'
            LOOP
                -- Construct image URL
                image_url := format('https://%s/storage/v1/object/public/%s/%s', 
                    current_setting('app.supabase_url', true), 
                    storage_file.bucket_id, 
                    storage_file.name);
                
                -- Add to array if not already present
                IF NOT (updated_images ? image_url) THEN
                    updated_images := updated_images || jsonb_build_array(image_url);
                    image_count := image_count + 1;
                END IF;
            END LOOP;
            
            -- Update project if images were added
            IF updated_images != current_images THEN
                UPDATE construction_mgr.be_project 
                SET progress_images = updated_images,
                    updated_at = NOW()
                WHERE id = project_record.id;
                
                project_count := project_count + 1;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            error_list := array_append(error_list, 
                format('Failed to sync project %s: %s', project_record.id, SQLERRM));
        END;
    END LOOP;
    
    RETURN QUERY SELECT project_count, image_count, error_list;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON FUNCTION construction_mgr.handle_progress_image_upload() IS 
'Automatically syncs progress image uploads to the project progress_images JSONB field';

COMMENT ON FUNCTION construction_mgr.handle_progress_image_delete() IS 
'Automatically removes deleted progress images from the project progress_images JSONB field';

COMMENT ON FUNCTION construction_mgr.cleanup_orphaned_progress_images() IS 
'Cleans up progress images in storage that are not referenced in any project';

COMMENT ON FUNCTION construction_mgr.sync_existing_progress_images() IS 
'One-time sync function to update project tables with existing progress images from storage';
