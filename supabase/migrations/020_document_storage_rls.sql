-- Migration: 020_document_storage_rls_simplified.sql
-- Purpose: Simplified RLS policies for document storage

-- RLS is already enabled on storage.objects by Supabase
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- DOCUMENT TABLE POLICIES (simplified)
CREATE POLICY "Users can view documents for accessible projects"
    ON construction_mgr.be_document
    FOR SELECT
    USING (private.has_project_access_direct(project_id, auth.uid()));

CREATE POLICY "Users can manage documents for owned projects"
    ON construction_mgr.be_document
    FOR ALL
    USING (private.is_project_owner_direct(project_id, auth.uid()));

CREATE POLICY "Project members can create documents"
    ON construction_mgr.be_document
    FOR INSERT
    WITH CHECK (private.has_project_access_direct(project_id, auth.uid()));

-- STORAGE BUCKET POLICIES (unified approach)

-- 1. PROFILES BUCKET (public read, user manages own files)
CREATE POLICY "Public read access for profiles"
ON storage.objects FOR SELECT
USING (bucket_id = 'profiles');

CREATE POLICY "Users can manage their own profile pictures"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'profiles' 
    AND private.has_storage_access('profiles', name, auth.uid())
)
WITH CHECK (
    bucket_id = 'profiles' 
    AND private.has_storage_access('profiles', name, auth.uid())
);

-- 2. PROJECT INSPIRATION BUCKET (public read, all authenticated users can contribute)  
CREATE POLICY "Public read access for inspiration images"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-inspiration');

CREATE POLICY "Authenticated users can manage inspiration images"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'project-inspiration'
    AND auth.uid() IS NOT NULL
)
WITH CHECK (
    bucket_id = 'project-inspiration'
    AND auth.uid() IS NOT NULL
);

-- 3. PROGRESS IMAGES BUCKET (public read, all authenticated users can contribute)
CREATE POLICY "Public read access for progress images"
ON storage.objects FOR SELECT
USING (bucket_id = 'progress-images');

CREATE POLICY "Authenticated users can manage progress images"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'progress-images'
    AND auth.uid() IS NOT NULL
)
WITH CHECK (
    bucket_id = 'progress-images'
    AND auth.uid() IS NOT NULL
);

-- 4. DOCUMENTS BUCKET (private, project member access)
CREATE POLICY "Project members can view documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'documents'
    AND private.has_storage_access('documents', name, auth.uid())
);

CREATE POLICY "Project members can manage documents"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'documents'
    AND private.has_storage_access('documents', name, auth.uid())
)
WITH CHECK (
    bucket_id = 'documents'
    AND private.has_storage_access('documents', name, auth.uid())
);

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

GRANT EXECUTE ON FUNCTION construction_mgr.debug_storage_access TO authenticated;