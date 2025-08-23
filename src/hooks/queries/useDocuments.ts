/**
 * React Query hooks for document management
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';
import { uploadProjectDocuments, deleteFile, type DocumentType } from '@/services/storageService';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { toast } from 'sonner';

// Document interface matching database schema
export interface Document {
  id: string;
  name: string;
  description?: string;
  document_type: DocumentType;
  project_id: string;
  phase_id?: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch documents for a specific project
 */
export function useProjectDocuments(projectId: string) {
  return useQuery({
    queryKey: queryKeys.documents.byProject(projectId),
    queryFn: async (): Promise<Document[]> => {
      const { data, error } = await supabase
        .from('be_document')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching project documents:', error);
        throw new Error(`Failed to fetch documents: ${error.message}`);
      }

      return data || [];
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch documents for a specific phase
 */
export function usePhaseDocuments(phaseId: string) {
  return useQuery({
    queryKey: queryKeys.documents.byPhase(phaseId),
    queryFn: async (): Promise<Document[]> => {
      const { data, error } = await supabase
        .from('be_document')
        .select('*')
        .eq('phase_id', phaseId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching phase documents:', error);
        throw new Error(`Failed to fetch phase documents: ${error.message}`);
      }

      return data || [];
    },
    enabled: !!phaseId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Get a single document by ID
 */
export function useDocument(documentId: string) {
  return useQuery({
    queryKey: queryKeys.documents.byId(documentId),
    queryFn: async (): Promise<Document | null> => {
      const { data, error } = await supabase
        .from('be_document')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('Error fetching document:', error);
        throw new Error(`Failed to fetch document: ${error.message}`);
      }

      return data;
    },
    enabled: !!documentId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Upload a new document
 */
export function useUploadDocument(projectId?: string) {
  const queryClient = useQueryClient();
  const { user } = useSupabaseAuth();
  const activityTracker = projectId ? useActivityTracker({ projectId }) : null;

  return useMutation({
    mutationFn: async ({
      file,
      projectId,
      phaseId,
      documentType,
      name,
      description,
      onProgress
    }: {
      file: File;
      projectId: string;
      phaseId?: string;
      documentType?: DocumentType;
      name?: string;
      description?: string;
      onProgress?: (progress: number) => void;
    }) => {
      if (!user) {
        throw new Error('User must be authenticated to upload documents');
      }

      // Upload file to storage
      const uploadResults = await uploadProjectDocuments(
        [file],
        projectId,
        {
          userId: user.id,
          documentType,
          createDatabaseRecords: true
        }
      );
      
      const uploadResult = uploadResults[0];
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      // Update document record with custom name and description if provided
      if (name || description || phaseId) {
        const { error: updateError } = await supabase
          .from('be_document')
          .update({
            ...(name && { name }),
            ...(description && { description }),
            ...(phaseId && { phase_id: phaseId }),
            ...(documentType && { document_type: documentType })
          })
          .eq('id', uploadResult.documentId);

        if (updateError) {
          console.error('Error updating document metadata:', updateError);
          // Don't throw here as the file upload succeeded
        }
      }

      return uploadResult;
    },
    onSuccess: async (uploadResult, variables) => {
      // Invalidate document queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.documents.byProject(variables.projectId) 
      });
      
      if (variables.phaseId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.documents.byPhase(variables.phaseId) 
        });
      }

      // Track document upload activity
      if (activityTracker) {
        await activityTracker.trackDocumentUpload(
          uploadResult.documentId || 'unknown',
          variables.name || variables.file.name,
          variables.documentType || 'OTHER'
        );
      }

      toast.success('Document uploaded successfully');
    },
    onError: (error) => {
      console.error('Document upload failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload document');
    },
  });
}

/**
 * Update document metadata
 */
export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      documentId,
      updates
    }: {
      documentId: string;
      updates: Partial<Pick<Document, 'name' | 'description' | 'document_type' | 'phase_id'>>;
    }) => {
      const { data, error } = await supabase
        .from('be_document')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId)
        .select()
        .single();

      if (error) {
        console.error('Error updating document:', error);
        throw new Error(`Failed to update document: ${error.message}`);
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.documents.byProject(data.project_id) 
      });
      
      if (data.phase_id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.documents.byPhase(data.phase_id) 
        });
      }

      queryClient.invalidateQueries({ 
        queryKey: queryKeys.documents.byId(data.id) 
      });

      toast.success('Document updated successfully');
    },
    onError: (error) => {
      console.error('Document update failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update document');
    },
  });
}

/**
 * Delete a document
 */
export function useDeleteDocument(projectId?: string) {
  const queryClient = useQueryClient();
  const { user } = useSupabaseAuth();
  const activityTracker = projectId ? useActivityTracker({ projectId }) : null;

  return useMutation({
    mutationFn: async (documentId: string) => {
      // First get the document to access file path and project info
      const { data: document, error: fetchError } = await supabase
        .from('be_document')
        .select('file_path, project_id, phase_id, name')
        .eq('id', documentId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to find document: ${fetchError.message}`);
      }

      // Delete file from storage
      await deleteFile('documents', document.file_path);

      // Delete database record
      const { error: deleteError } = await supabase
        .from('be_document')
        .delete()
        .eq('id', documentId);

      if (deleteError) {
        throw new Error(`Failed to delete document record: ${deleteError.message}`);
      }

      return { 
        documentId, 
        projectId: document.project_id, 
        phaseId: document.phase_id,
        documentName: document.name
      };
    },
    onSuccess: async (result) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.documents.byProject(result.projectId) 
      });
      
      if (result.phaseId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.documents.byPhase(result.phaseId) 
        });
      }

      queryClient.removeQueries({ 
        queryKey: queryKeys.documents.byId(result.documentId) 
      });

      // Track document deletion activity
      if (activityTracker) {
        await activityTracker.trackDocumentDelete(
          result.documentName
        );
      }

      toast.success('Document deleted successfully');
    },
    onError: (error) => {
      console.error('Document deletion failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete document');
    },
  });
}