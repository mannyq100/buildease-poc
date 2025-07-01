-- Migration: 017_document_storage_rls.sql
-- Purpose: Defines RLS policies for the document and storage domain.

-- DOCUMENT TABLE POLICIES
CREATE POLICY "Users can view documents for projects they have access to"
    ON construction_mgr.be_document
    FOR SELECT
    USING (
        private.has_project_access_direct(project_id, auth.uid())
    );

CREATE POLICY "Project owners can manage documents"
    ON construction_mgr.be_document
    FOR ALL
    USING (
        private.is_project_owner_direct(project_id, auth.uid())
    );

CREATE POLICY "Project participants with ADMIN role can manage documents"
    ON construction_mgr.be_document
    FOR ALL
    USING (
        private.check_user_project_role_direct(
            project_id, 
            auth.uid(), 
            ARRAY['ADMIN']::construction_mgr.user_role[]
        )
    );

CREATE POLICY "Project participants with any role can create documents"
    ON construction_mgr.be_document
    FOR INSERT
    WITH CHECK (
        private.has_project_access_direct(project_id, auth.uid())
    );

-- STORAGE OBJECTS POLICIES

-- 1. Public read access for profiles
DROP POLICY IF EXISTS "Public read access for profiles" ON storage.objects;
CREATE POLICY "Public read access for profiles"
ON storage.objects FOR SELECT
USING (bucket_id = 'profiles');

-- 2. Allow authenticated users to upload to their own directory
DROP POLICY IF EXISTS "Users can upload their own profile pictures" ON storage.objects;
CREATE POLICY "Users can upload their own profile pictures"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profiles' AND
  (storage.foldername(name))[1] = auth.uid()::text AND
  -- Validate file path format: {user_id}/{filename}
  array_length(storage.foldername(name), 1) = 1 AND
  (storage.foldername(name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
);

-- 3. Allow users to update their own files
DROP POLICY IF EXISTS "Users can update their own profile pictures" ON storage.objects;
CREATE POLICY "Users can update their own profile pictures"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profiles' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Allow users to delete their own files
DROP POLICY IF EXISTS "Users can delete their own profile pictures" ON storage.objects;
CREATE POLICY "Users can delete their own profile pictures"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'profiles' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Project Inspiration bucket policies
-- 1. Public read access for project inspiration images
DROP POLICY IF EXISTS "Public read access for project inspiration images" ON storage.objects;
CREATE POLICY "Public read access for project inspiration images"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-inspiration');

-- 2. Allow authenticated users to upload to their own project inspiration directory
DROP POLICY IF EXISTS "Users can upload project inspiration images" ON storage.objects;
CREATE POLICY "Users can upload project inspiration images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-inspiration' AND
  (storage.foldername(name))[1] = auth.uid()::text AND
  -- Validate file path format: {user_id}/{project_id}/{filename}
  array_length(storage.foldername(name), 1) = 2 AND
  (storage.foldername(name))[2] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
);

-- 3. Allow users to update their own project inspiration images
DROP POLICY IF EXISTS "Users can update their project inspiration images" ON storage.objects;
CREATE POLICY "Users can update their project inspiration images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project-inspiration' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Allow users to delete their own project inspiration images
DROP POLICY IF EXISTS "Users can delete their own project inspiration images" ON storage.objects;
CREATE POLICY "Users can delete their own project inspiration images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-inspiration' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Documents bucket policies
-- 1. Allow project members to view documents
DROP POLICY IF EXISTS "Project members can view project documents" ON storage.objects;
CREATE POLICY "Project members can view project documents"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'documents' AND
    -- Use the helper function that bypasses RLS
    private.is_storage_member((storage.foldername(name))[1], auth.uid())
);

-- 2. Allow project members to insert documents
DROP POLICY IF EXISTS "Project members can insert project documents" ON storage.objects;
CREATE POLICY "Project members can insert project documents"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'documents' AND
    -- Validate file path format: {project_id}/{filename}
    array_length(storage.foldername(name), 1) = 1 AND
    (storage.foldername(name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' AND
    -- Use the helper function that bypasses RLS
    private.is_storage_member((storage.foldername(name))[1], auth.uid())
);

-- 3. Allow project owners to update documents
DROP POLICY IF EXISTS "Project owners can update project documents" ON storage.objects;
CREATE POLICY "Project owners can update project documents"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'documents' AND
    -- Use the helper function that bypasses RLS
    private.is_storage_member((storage.foldername(name))[1], auth.uid(), ARRAY['OWNER'])
);

-- 4. Allow project admins/contractors to update documents
DROP POLICY IF EXISTS "Project admin members can update project documents" ON storage.objects;
CREATE POLICY "Project admin members can update project documents"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'documents' AND
    -- Use the helper function that bypasses RLS
    (private.is_storage_member((storage.foldername(name))[1], auth.uid(), ARRAY['ADMIN']) OR
     private.is_storage_member((storage.foldername(name))[1], auth.uid(), ARRAY['CONTRACTOR']))
);

-- 5. Allow project owners to delete documents
DROP POLICY IF EXISTS "Project owners can delete project documents" ON storage.objects;
CREATE POLICY "Project owners can delete project documents"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'documents' AND
    -- Use the helper function that bypasses RLS
    private.is_storage_member((storage.foldername(name))[1], auth.uid(), ARRAY['OWNER'])
);

-- 6. Allow project admins to delete documents
DROP POLICY IF EXISTS "Project admin members can delete project documents" ON storage.objects;
CREATE POLICY "Project admin members can delete project documents"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'documents' AND
    -- Use the helper function that bypasses RLS
    private.is_storage_member((storage.foldername(name))[1], auth.uid(), ARRAY['ADMIN'])
);
