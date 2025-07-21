/**
 * Document query hooks for BuildEase construction management
 * Handles fetching document and file data from Supabase
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryClient';

/**
 * Hook to fetch all documents for a specific project
 * Returns documents with metadata and uploader information
 */
export const useProjectDocuments = (projectId: string) => {
  return useQuery({
    queryKey: queryKeys.documents.byProject(projectId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('construction_mgr.be_document')
        .select(`
          id,
          name,
          description,
          document_type,
          project_id,
          phase_id,
          file_path,
          file_size,
          mime_type,
          metadata,
          created_at,
          updated_at,
          phase:phase_id (
            id,
            name,
            category
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching project documents:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!projectId,
    staleTime: 3 * 60 * 1000, // 3 minutes - documents change moderately
  });
};

/**
 * Hook to fetch documents for a specific phase
 * Returns phase-specific documents
 */
export const usePhaseDocuments = (phaseId: string) => {
  return useQuery({
    queryKey: [...queryKeys.documents.all, 'phase', phaseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('construction_mgr.be_document')
        .select(`
          id,
          name,
          description,
          document_type,
          project_id,
          phase_id,
          file_path,
          file_size,
          mime_type,
          metadata,
          created_at,
          updated_at
        `)
        .eq('phase_id', phaseId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching phase documents:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!phaseId,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

/**
 * Hook to fetch a single document by ID
 * Returns detailed document information
 */
export const useDocument = (documentId: string) => {
  return useQuery({
    queryKey: queryKeys.documents.detail(documentId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('construction_mgr.be_document')
        .select(`
          id,
          name,
          description,
          document_type,
          project_id,
          phase_id,
          file_path,
          file_size,
          mime_type,
          metadata,
          created_at,
          updated_at,
          project:project_id (
            id,
            name
          ),
          phase:phase_id (
            id,
            name,
            category
          )
        `)
        .eq('id', documentId)
        .single();
      
      if (error) {
        console.error('Error fetching document:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!documentId,
    staleTime: 5 * 60 * 1000, // 5 minutes - document details are relatively stable
  });
};

/**
 * Hook to get document download URL from Supabase Storage
 * Returns signed URL for secure document access
 */
export const useDocumentUrl = (filePath: string) => {
  return useQuery({
    queryKey: ['document-url', filePath],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from('project-documents')
        .createSignedUrl(filePath, 3600); // 1 hour expiry
      
      if (error) {
        console.error('Error creating signed URL:', error);
        throw error;
      }
      
      return data.signedUrl;
    },
    enabled: !!filePath,
    staleTime: 30 * 60 * 1000, // 30 minutes - URLs are valid for 1 hour
  });
};

/**
 * Hook to fetch documents by type for a project
 * Useful for filtering documents by category
 */
export const useProjectDocumentsByType = (projectId: string, documentType: string) => {
  return useQuery({
    queryKey: [...queryKeys.documents.byProject(projectId), 'type', documentType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('construction_mgr.be_document')
        .select(`
          id,
          name,
          description,
          document_type,
          project_id,
          phase_id,
          file_path,
          file_size,
          mime_type,
          metadata,
          created_at,
          updated_at,
          phase:phase_id (
            id,
            name,
            category
          )
        `)
        .eq('project_id', projectId)
        .eq('document_type', documentType)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching documents by type:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!projectId && !!documentType,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};
