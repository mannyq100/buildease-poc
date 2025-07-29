-- Migration: 019_document_storage_setup_simplified.sql
-- Purpose: Simplified document storage with UI-enforced document types

-- Simplified Document table (no enum constraint)
CREATE TABLE construction_mgr.be_document (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    document_type TEXT NOT NULL, -- Simple text field, validation in UI
    project_id UUID NOT NULL,
    phase_id UUID,
    file_path TEXT NOT NULL UNIQUE,
    file_size BIGINT,
    mime_type VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_document_project FOREIGN KEY (project_id) 
        REFERENCES construction_mgr.be_project(id) ON DELETE CASCADE,
    CONSTRAINT fk_document_phase FOREIGN KEY (phase_id) 
        REFERENCES construction_mgr.be_phase(id) ON DELETE SET NULL
);

-- Update trigger
CREATE TRIGGER update_document_modtime
    BEFORE UPDATE ON construction_mgr.be_document
    FOR EACH ROW
    EXECUTE FUNCTION construction_mgr.update_updated_at_column();

-- Essential indexes only
CREATE INDEX idx_document_project ON construction_mgr.be_document (project_id);
CREATE INDEX idx_document_phase ON construction_mgr.be_document (phase_id);
CREATE INDEX idx_document_type ON construction_mgr.be_document (document_type);

-- Storage buckets with consistent configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  -- Profile pictures (public, 10MB) - accessible to all authenticated users
  ('profiles', 'profiles', true, 10485760, 
   ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  
  -- Project inspiration images (public, 10MB) - accessible to all authenticated users
  ('project-inspiration', 'project-inspiration', true, 10485760,
   ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
   
  -- Progress images (public, 10MB) - accessible to all authenticated users for collaboration
  ('progress-images', 'progress-images', true, 10485760,
   ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
   
  -- Documents (private, 50MB) - only accessible to project members
  ('documents', 'documents', false, 52428800,
   ARRAY['application/pdf', 'application/msword', 
         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
         'application/vnd.ms-excel',
         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
         'text/plain', 'image/jpeg', 'image/png'])

ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

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

-- Document upload trigger removed - database records will be created via application code