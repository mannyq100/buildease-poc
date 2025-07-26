-- Migration: 025_enhanced_security_policies.sql
-- Purpose: Enhance security and access control with granular permissions and consistent validation

-- Function to validate project membership for storage access
CREATE OR REPLACE FUNCTION construction_mgr.user_has_project_access(
    user_id UUID,
    project_id UUID,
    required_role TEXT DEFAULT 'member'
) RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Check if user is project owner
    IF EXISTS (
        SELECT 1 FROM construction_mgr.be_project 
        WHERE id = project_id AND created_by = user_id
    ) THEN
        RETURN TRUE;
    END IF;
    
    -- Check team membership and role
    SELECT role INTO user_role
    FROM construction_mgr.be_team_member tm
    JOIN construction_mgr.be_team t ON tm.team_id = t.id
    WHERE t.project_id = project_id 
    AND tm.user_id = user_id
    AND tm.status = 'active';
    
    -- Role hierarchy: owner > admin > contractor > member
    CASE required_role
        WHEN 'owner' THEN
            RETURN user_role = 'owner';
        WHEN 'admin' THEN
            RETURN user_role IN ('owner', 'admin');
        WHEN 'contractor' THEN
            RETURN user_role IN ('owner', 'admin', 'contractor');
        WHEN 'member' THEN
            RETURN user_role IN ('owner', 'admin', 'contractor', 'member');
        ELSE
            RETURN FALSE;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate and extract project ID from storage path
CREATE OR REPLACE FUNCTION construction_mgr.extract_project_id_from_path(
    file_path TEXT,
    bucket_name TEXT
) RETURNS UUID AS $$
DECLARE
    path_parts TEXT[];
    project_id UUID;
BEGIN
    -- Parse file path
    path_parts := string_to_array(file_path, '/');
    
    -- Validate path structure based on bucket
    CASE bucket_name
        WHEN 'documents', 'progress-images', 'project-inspiration' THEN
            -- Expected format: {user_id}/{project_id}/{filename}
            IF array_length(path_parts, 1) < 3 THEN
                RAISE EXCEPTION 'Invalid path structure for bucket %: %', bucket_name, file_path;
            END IF;
            
            -- Extract and validate project ID
            BEGIN
                project_id := path_parts[2]::UUID;
            EXCEPTION WHEN invalid_text_representation THEN
                RAISE EXCEPTION 'Invalid project UUID in path: %', path_parts[2];
            END;
            
        WHEN 'profiles' THEN
            -- Expected format: {user_id}/{filename} - no project validation needed
            RETURN NULL;
            
        ELSE
            RAISE EXCEPTION 'Unknown bucket: %', bucket_name;
    END CASE;
    
    -- Validate project exists
    IF NOT EXISTS (SELECT 1 FROM construction_mgr.be_project WHERE id = project_id) THEN
        RAISE EXCEPTION 'Project % does not exist', project_id;
    END IF;
    
    RETURN project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced storage policies with granular permissions

-- Documents bucket policies (Enhanced)
DROP POLICY IF EXISTS "Project members can view project documents" ON storage.objects;
CREATE POLICY "Enhanced project members can view documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'documents' AND
    construction_mgr.user_has_project_access(
        auth.uid(),
        construction_mgr.extract_project_id_from_path(name, bucket_id),
        'member'
    )
);

DROP POLICY IF EXISTS "Project members can insert project documents" ON storage.objects;
CREATE POLICY "Enhanced project members can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'documents' AND
    -- Validate user owns the upload path
    (storage.foldername(name))[1] = auth.uid()::text AND
    -- Validate path structure
    array_length(storage.foldername(name), 1) = 2 AND
    (storage.foldername(name))[2] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' AND
    -- Validate project access
    construction_mgr.user_has_project_access(
        auth.uid(),
        construction_mgr.extract_project_id_from_path(name, bucket_id),
        'member'
    )
);

DROP POLICY IF EXISTS "Project owners can update project documents" ON storage.objects;
DROP POLICY IF EXISTS "Project admin members can update project documents" ON storage.objects;
CREATE POLICY "Enhanced project admins can update documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'documents' AND
    construction_mgr.user_has_project_access(
        auth.uid(),
        construction_mgr.extract_project_id_from_path(name, bucket_id),
        'admin'
    )
);

DROP POLICY IF EXISTS "Project members can delete project documents" ON storage.objects;
CREATE POLICY "Enhanced project admins can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'documents' AND
    construction_mgr.user_has_project_access(
        auth.uid(),
        construction_mgr.extract_project_id_from_path(name, bucket_id),
        'admin'
    )
);

-- Progress Images bucket policies (Enhanced)
DROP POLICY IF EXISTS "Users can view progress images" ON storage.objects;
CREATE POLICY "Enhanced project members can view progress images"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'progress-images' AND
    construction_mgr.user_has_project_access(
        auth.uid(),
        construction_mgr.extract_project_id_from_path(name, bucket_id),
        'member'
    )
);

DROP POLICY IF EXISTS "Users can upload progress images" ON storage.objects;
CREATE POLICY "Enhanced project members can upload progress images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'progress-images' AND
    -- Validate user owns the upload path
    (storage.foldername(name))[1] = auth.uid()::text AND
    -- Validate path structure
    array_length(storage.foldername(name), 1) = 2 AND
    (storage.foldername(name))[2] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' AND
    -- Validate project access
    construction_mgr.user_has_project_access(
        auth.uid(),
        construction_mgr.extract_project_id_from_path(name, bucket_id),
        'member'
    )
);

DROP POLICY IF EXISTS "Users can update progress images" ON storage.objects;
CREATE POLICY "Enhanced project members can update progress images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'progress-images' AND
    construction_mgr.user_has_project_access(
        auth.uid(),
        construction_mgr.extract_project_id_from_path(name, bucket_id),
        'member'
    )
);

DROP POLICY IF EXISTS "Users can delete progress images" ON storage.objects;
CREATE POLICY "Enhanced project members can delete progress images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'progress-images' AND
    construction_mgr.user_has_project_access(
        auth.uid(),
        construction_mgr.extract_project_id_from_path(name, bucket_id),
        'member'
    )
);

-- Project Inspiration bucket policies (Enhanced)
DROP POLICY IF EXISTS "Public read access for project inspiration images" ON storage.objects;
CREATE POLICY "Enhanced public read access for inspiration images"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-inspiration');

DROP POLICY IF EXISTS "Users can upload project inspiration images" ON storage.objects;
CREATE POLICY "Enhanced project owners can upload inspiration images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'project-inspiration' AND
    -- Validate user owns the upload path
    (storage.foldername(name))[1] = auth.uid()::text AND
    -- Validate path structure
    array_length(storage.foldername(name), 1) = 2 AND
    (storage.foldername(name))[2] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' AND
    -- Validate project access (only owners/admins can upload inspiration)
    construction_mgr.user_has_project_access(
        auth.uid(),
        construction_mgr.extract_project_id_from_path(name, bucket_id),
        'admin'
    )
);

DROP POLICY IF EXISTS "Users can update their project inspiration images" ON storage.objects;
CREATE POLICY "Enhanced project owners can update inspiration images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'project-inspiration' AND
    construction_mgr.user_has_project_access(
        auth.uid(),
        construction_mgr.extract_project_id_from_path(name, bucket_id),
        'admin'
    )
);

DROP POLICY IF EXISTS "Users can delete their project inspiration images" ON storage.objects;
CREATE POLICY "Enhanced project owners can delete inspiration images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'project-inspiration' AND
    construction_mgr.user_has_project_access(
        auth.uid(),
        construction_mgr.extract_project_id_from_path(name, bucket_id),
        'admin'
    )
);

-- Profile bucket policies (Enhanced)
DROP POLICY IF EXISTS "Users can view their own profile images" ON storage.objects;
CREATE POLICY "Enhanced users can view their own profiles"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'profiles' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can upload their own profile images" ON storage.objects;
CREATE POLICY "Enhanced users can upload their own profiles"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'profiles' AND
    (storage.foldername(name))[1] = auth.uid()::text AND
    array_length(storage.foldername(name), 1) = 1
);

DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
CREATE POLICY "Enhanced users can update their own profiles"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'profiles' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;
CREATE POLICY "Enhanced users can delete their own profiles"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'profiles' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Add security audit function
CREATE OR REPLACE FUNCTION construction_mgr.audit_storage_security()
RETURNS TABLE(
    audit_type TEXT,
    bucket_name TEXT,
    file_path TEXT,
    user_id UUID,
    project_id UUID,
    issue_description TEXT
) AS $$
DECLARE
    file_record RECORD;
    extracted_project_id UUID;
    file_user_id UUID;
    path_parts TEXT[];
BEGIN
    -- Audit all storage files for security compliance
    FOR file_record IN
        SELECT bucket_id, name, owner
        FROM storage.objects
    LOOP
        BEGIN
            -- Parse file path
            path_parts := string_to_array(file_record.name, '/');
            
            -- Extract user ID from path
            BEGIN
                file_user_id := path_parts[1]::UUID;
            EXCEPTION WHEN invalid_text_representation THEN
                RETURN QUERY SELECT 
                    'invalid_user_id'::TEXT,
                    file_record.bucket_id,
                    file_record.name,
                    NULL::UUID,
                    NULL::UUID,
                    'File path does not start with valid user UUID'::TEXT;
                CONTINUE;
            END;
            
            -- Check if user exists
            IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = file_user_id) THEN
                RETURN QUERY SELECT 
                    'orphaned_user_file'::TEXT,
                    file_record.bucket_id,
                    file_record.name,
                    file_user_id,
                    NULL::UUID,
                    'File belongs to non-existent user'::TEXT;
            END IF;
            
            -- For project-related buckets, validate project access
            IF file_record.bucket_id IN ('documents', 'progress-images', 'project-inspiration') THEN
                BEGIN
                    extracted_project_id := construction_mgr.extract_project_id_from_path(
                        file_record.name, 
                        file_record.bucket_id
                    );
                    
                    -- Check if user still has access to project
                    IF NOT construction_mgr.user_has_project_access(file_user_id, extracted_project_id, 'member') THEN
                        RETURN QUERY SELECT 
                            'unauthorized_access'::TEXT,
                            file_record.bucket_id,
                            file_record.name,
                            file_user_id,
                            extracted_project_id,
                            'User no longer has access to project'::TEXT;
                    END IF;
                    
                EXCEPTION WHEN OTHERS THEN
                    RETURN QUERY SELECT 
                        'path_validation_error'::TEXT,
                        file_record.bucket_id,
                        file_record.name,
                        file_user_id,
                        NULL::UUID,
                        SQLERRM::TEXT;
                END;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            RETURN QUERY SELECT 
                'audit_error'::TEXT,
                file_record.bucket_id,
                file_record.name,
                NULL::UUID,
                NULL::UUID,
                SQLERRM::TEXT;
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON FUNCTION construction_mgr.user_has_project_access(UUID, UUID, TEXT) IS 
'Validates if a user has the required access level to a project based on ownership and team membership';

COMMENT ON FUNCTION construction_mgr.extract_project_id_from_path(TEXT, TEXT) IS 
'Safely extracts and validates project ID from storage file paths';

COMMENT ON FUNCTION construction_mgr.audit_storage_security() IS 
'Audits storage files for security compliance and unauthorized access';
