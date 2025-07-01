-- Migration: 016_document_storage_setup.sql
-- Purpose: Defines tables, storage buckets, and functions for the document and storage domain.

-- Document table
CREATE TABLE construction_mgr.be_document (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    document_type construction_mgr.document_type NOT NULL,
    project_id UUID NOT NULL,
    phase_id UUID,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_document_project FOREIGN KEY (project_id) REFERENCES construction_mgr.be_project(id) ON DELETE CASCADE,
    CONSTRAINT fk_document_phase FOREIGN KEY (phase_id) REFERENCES construction_mgr.be_phase(id) ON DELETE SET NULL
);
CREATE TRIGGER update_document_modtime
    BEFORE UPDATE ON construction_mgr.be_document
    FOR EACH ROW
    EXECUTE FUNCTION construction_mgr.update_updated_at_column();
-- Indexes
CREATE INDEX IF NOT EXISTS idx_document_project ON construction_mgr.be_document (project_id);
CREATE INDEX IF NOT EXISTS idx_document_phase ON construction_mgr.be_document (phase_id);
CREATE INDEX IF NOT EXISTS idx_document_type ON construction_mgr.be_document (document_type);
CREATE INDEX IF NOT EXISTS idx_document_metadata ON construction_mgr.be_document USING gin (metadata);

-- Create or update storage buckets with optimized settings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('documents', 'documents', false, 52428800, '{"application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}'),
  ('profiles', 'profiles', true, 10485760, '{"image/jpeg", "image/png", "image/gif", "image/webp"}'),
  ('project-inspiration', 'project-inspiration', true, 10485760, '{"image/jpeg", "image/png", "image/gif", "image/webp"}')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create a helper function to check project membership without RLS recursion
CREATE OR REPLACE FUNCTION private.is_storage_member(project_id TEXT, user_id UUID, required_roles TEXT[] DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
    -- Use our direct functions to avoid RLS recursion completely
    IF required_roles IS NULL THEN
        -- Check if user has any access to the project (owner or member)
        RETURN private.has_project_access_direct(project_id::UUID, user_id);
    ELSE
        -- Check if user has specific roles on the project
        RETURN private.check_user_project_role_direct(
            project_id::UUID, 
            user_id, 
            required_roles::construction_mgr.user_role[]
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
