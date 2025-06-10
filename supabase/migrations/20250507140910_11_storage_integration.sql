-- Storage Integration for BuildEase
-- This migration sets up storage buckets and policies for document and profile storage

-- First, drop existing trigger to prevent conflicts
DROP TRIGGER IF EXISTS on_document_created ON storage.objects;

-- Create a helper function to check project membership without RLS recursion
CREATE OR REPLACE FUNCTION private.is_storage_member(project_id TEXT, user_id UUID, required_roles TEXT[] DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
    -- This function bypasses RLS because it's SECURITY DEFINER
    -- It directly checks project membership without causing infinite recursion
    IF required_roles IS NULL THEN
        RETURN EXISTS (
            SELECT 1
            FROM construction_mgr.be_project_member
            WHERE project_id::TEXT = is_storage_member.project_id
            AND user_id = is_storage_member.user_id
        );
    ELSE
        RETURN EXISTS (
            SELECT 1
            FROM construction_mgr.be_project_member
            WHERE project_id::TEXT = is_storage_member.project_id
            AND user_id = is_storage_member.user_id
            AND role = ANY(required_roles)
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or update storage buckets with optimized settings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('documents', 'documents', false, 52428800, '{"application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}'),
  ('profiles', 'profiles', true, 10485760, '{"image/jpeg", "image/png", "image/gif", "image/webp"}')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;


-- Remove ALL existing storage policies to start fresh
DROP POLICY IF EXISTS "Public read access for profiles" ON storage.objects;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can manage their own files" ON storage.objects;
DROP POLICY IF EXISTS "Admins have full access to profiles" ON storage.objects;
DROP POLICY IF EXISTS "Project members can view project documents" ON storage.objects;
DROP POLICY IF EXISTS "Project members can insert project documents" ON storage.objects;
DROP POLICY IF EXISTS "Project owners can update project documents" ON storage.objects;
DROP POLICY IF EXISTS "Project admin members can update project documents" ON storage.objects;
DROP POLICY IF EXISTS "Project owners can delete project documents" ON storage.objects;
DROP POLICY IF EXISTS "Project admin members can delete project documents" ON storage.objects;

-- Enable RLS on storage.objects (Supabase already has this enabled by default, but included for completeness)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 1. Public read access for profiles
CREATE POLICY "Public read access for profiles"
ON storage.objects FOR SELECT
USING (bucket_id = 'profiles');

-- 2. Allow authenticated users to upload to their own directory
CREATE POLICY "Users can upload their own profile pictures"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profiles' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Allow users to update their own files
CREATE POLICY "Users can update their own profile pictures"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profiles' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Allow users to delete their own files
CREATE POLICY "Users can delete their own profile pictures"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'profiles' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Documents bucket policies
-- 1. Allow project members to view documents
CREATE POLICY "Project members can view project documents"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'documents' AND
    -- Use the helper function that bypasses RLS
    private.is_storage_member((storage.foldername(name))[1], auth.uid())
);

-- 2. Allow project members to insert documents
CREATE POLICY "Project members can insert project documents"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'documents' AND
    -- Use the helper function that bypasses RLS
    private.is_storage_member((storage.foldername(name))[1], auth.uid())
);

-- 3. Allow project owners to update documents
CREATE POLICY "Project owners can update project documents"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'documents' AND
    -- Use the helper function that bypasses RLS
    private.is_storage_member((storage.foldername(name))[1], auth.uid(), ARRAY['OWNER'])
);

-- 4. Allow project admins/contractors to update documents
CREATE POLICY "Project admin members can update project documents"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'documents' AND
    -- Use the helper function that bypasses RLS
    (private.is_storage_member((storage.foldername(name))[1], auth.uid(), ARRAY['ADMIN']) OR
     private.is_storage_member((storage.foldername(name))[1], auth.uid(), ARRAY['CONTRACTOR']))
);

-- 5. Allow project owners to delete documents
CREATE POLICY "Project owners can delete project documents"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'documents' AND
    -- Use the helper function that bypasses RLS
    private.is_storage_member((storage.foldername(name))[1], auth.uid(), ARRAY['OWNER'])
);

-- 6. Allow project admins to delete documents
CREATE POLICY "Project admin members can delete project documents"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'documents' AND
    -- Use the helper function that bypasses RLS
    private.is_storage_member((storage.foldername(name))[1], auth.uid(), ARRAY['ADMIN'])
);

-- Create function to automatically update be_document when a file is uploaded
CREATE OR REPLACE FUNCTION construction_mgr.handle_document_upload()
RETURNS TRIGGER AS $$
DECLARE
    project_id UUID;
    doc_name TEXT;
BEGIN
    -- Extract project_id from the file path
    project_id := (storage.foldername(NEW.name))[1]::UUID;
    
    -- Extract file name for the document name
    doc_name := split_part(NEW.name, '/', array_length(string_to_array(NEW.name, '/'), 1));
    
    -- Create document record using UPSERT
    INSERT INTO construction_mgr.be_document (
        name,
        document_type,
        project_id,
        file_path,
        file_size,
        mime_type,
        metadata
    ) VALUES (
        doc_name,
        'OTHER', -- Default document type
        project_id,
        NEW.name,
        (NEW.metadata->>'size')::BIGINT,
        NEW.metadata->>'mimetype',
        jsonb_build_object(
            'storage_id', NEW.id,
            'bucket_id', NEW.bucket_id,
            'created_by', auth.uid()
        )
    )
    ON CONFLICT (file_path) DO UPDATE SET
        name = EXCLUDED.name,
        file_size = EXCLUDED.file_size,
        mime_type = EXCLUDED.mime_type,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for document uploads
CREATE TRIGGER on_document_created
    AFTER INSERT ON storage.objects
    FOR EACH ROW
    WHEN (NEW.bucket_id = 'documents')
    EXECUTE FUNCTION construction_mgr.handle_document_upload();

-- Grant execute permissions on helper function
GRANT EXECUTE ON FUNCTION private.is_storage_member TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_storage_member TO anon;

-- Add comments
COMMENT ON FUNCTION private.is_storage_member IS 'Helper function to check project membership for storage policies without triggering RLS recursion';
