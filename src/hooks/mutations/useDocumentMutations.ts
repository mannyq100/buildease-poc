/**
 * Document Mutation Hooks
 * Comprehensive document management mutations for BuildEase
 * Includes metadata updates, bulk operations, and file management
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { TABLE_NAMES } from '@/types/database';
import { toast } from 'sonner';
import type { 
  Document, 
  DocumentInsert, 
  DocumentType,
  BulkOperationResult 
} from '@/types/database';

interface UpdateDocumentMetadataParams {
  documentId: string;
  metadata: {
    caption?: string | null;
    description?: string | null;
    document_type?: DocumentType;
    tags?: string[] | null;
  };
}

interface BulkDeleteParams {
  documentIds: string[];
  projectId: string;
}

interface BulkUpdateParams {
  documentIds: string[];
  updates: Record<string, any>;
  operation: 'add_tags' | 'remove_tags' | 'move_to_collection' | 'update_type' | 'update_metadata';
}

/**
 * Update document metadata (caption, description, tags, type)
 */
export function useUpdateDocumentMetadata() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, metadata }: UpdateDocumentMetadataParams): Promise<Document> => {
      const updateData: Partial<Document> = {};

      // Only include fields that are provided
      if (metadata.caption !== undefined) {
        updateData.caption = metadata.caption;
      }
      if (metadata.description !== undefined) {
        updateData.description = metadata.description;
      }
      if (metadata.document_type !== undefined) {
        updateData.document_type = metadata.document_type;
      }
      if (metadata.tags !== undefined) {
        updateData.tags = metadata.tags;
      }

      // Always update the updated_at timestamp
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from(TABLE_NAMES.DOCUMENTS)
        .update(updateData)
        .eq('id', documentId)
        .select()
        .single();

      if (error) {
        console.error('Error updating document metadata:', error);
        throw new Error(`Failed to update document: ${error.message}`);
      }

      return data;
    },
    onSuccess: (updatedDocument) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['project-documents', updatedDocument.project_id] });
      queryClient.invalidateQueries({ queryKey: ['advanced-media-search'] });
      queryClient.invalidateQueries({ queryKey: ['document-tags', updatedDocument.project_id] });
      queryClient.invalidateQueries({ queryKey: ['media-stats', updatedDocument.project_id] });
    },
    onError: (error: Error) => {
      toast.error('Failed to update document metadata');
      console.error('Document metadata update failed:', error);
    }
  });
}

/**
 * Delete a single document
 */
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: string): Promise<void> => {
      const { error } = await supabase
        .from(TABLE_NAMES.DOCUMENTS)
        .delete()
        .eq('id', documentId);

      if (error) {
        console.error('Error deleting document:', error);
        throw new Error(`Failed to delete document: ${error.message}`);
      }
    },
    onSuccess: (_, documentId) => {
      // Invalidate all document-related queries
      queryClient.invalidateQueries({ queryKey: ['project-documents'] });
      queryClient.invalidateQueries({ queryKey: ['advanced-media-search'] });
      queryClient.invalidateQueries({ queryKey: ['media-stats'] });
      queryClient.invalidateQueries({ queryKey: ['media-collections'] });
      
      toast.success('Document deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete document');
      console.error('Document deletion failed:', error);
    }
  });
}

/**
 * Bulk delete multiple documents
 */
export function useBulkDeleteDocuments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentIds, projectId }: BulkDeleteParams): Promise<BulkOperationResult> => {
      const results: BulkOperationResult = {
        success: 0,
        failed: 0,
        errors: []
      };

      // Delete documents in chunks to avoid overwhelming the database
      const chunkSize = 10;
      for (let i = 0; i < documentIds.length; i += chunkSize) {
        const chunk = documentIds.slice(i, i + chunkSize);
        
        const { error } = await supabase
          .from(TABLE_NAMES.DOCUMENTS)
          .delete()
          .in('id', chunk);

        if (error) {
          console.error('Error in bulk delete chunk:', error);
          chunk.forEach(id => {
            results.errors.push({
              documentId: id,
              error: error.message
            });
            results.failed++;
          });
        } else {
          results.success += chunk.length;
        }
      }

      if (results.failed > 0) {
        throw new Error(`Bulk delete partially failed: ${results.failed} documents could not be deleted`);
      }

      return results;
    },
    onSuccess: (result, { projectId }) => {
      // Invalidate all document-related queries
      queryClient.invalidateQueries({ queryKey: ['project-documents', projectId] });
      queryClient.invalidateQueries({ queryKey: ['advanced-media-search'] });
      queryClient.invalidateQueries({ queryKey: ['media-stats', projectId] });
      queryClient.invalidateQueries({ queryKey: ['media-collections', projectId] });
    },
    onError: (error: Error) => {
      toast.error('Bulk delete operation failed');
      console.error('Bulk delete failed:', error);
    }
  });
}

/**
 * Bulk update multiple documents
 */
export function useBulkUpdateDocuments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentIds, updates, operation }: BulkUpdateParams): Promise<BulkOperationResult> => {
      const results: BulkOperationResult = {
        success: 0,
        failed: 0,
        errors: []
      };

      // Process updates based on operation type
      let updateData: Partial<Document> = {};

      switch (operation) {
        case 'add_tags':
          // For adding tags, we need to merge with existing tags
          for (const documentId of documentIds) {
            try {
              // First, get current tags
              const { data: currentDoc, error: fetchError } = await supabase
                .from(TABLE_NAMES.DOCUMENTS)
                .select('tags')
                .eq('id', documentId)
                .single();

              if (fetchError) {
                results.errors.push({
                  documentId,
                  error: fetchError.message
                });
                results.failed++;
                continue;
              }

              // Merge tags
              const currentTags = currentDoc.tags || [];
              const newTags = updates.tags || [];
              const mergedTags = [...new Set([...currentTags, ...newTags])];

              // Update document
              const { error: updateError } = await supabase
                .from(TABLE_NAMES.DOCUMENTS)
                .update({ 
                  tags: mergedTags,
                  updated_at: new Date().toISOString()
                })
                .eq('id', documentId);

              if (updateError) {
                results.errors.push({
                  documentId,
                  error: updateError.message
                });
                results.failed++;
              } else {
                results.success++;
              }
            } catch (error) {
              results.errors.push({
                documentId,
                error: error instanceof Error ? error.message : 'Unknown error'
              });
              results.failed++;
            }
          }
          break;

        case 'update_type':
          updateData = {
            document_type: updates.document_type,
            updated_at: new Date().toISOString()
          };
          break;

        case 'move_to_collection':
          // This would involve updating the collection_document table
          // For now, we'll update the document metadata to track collection association
          updateData = {
            metadata: { collection_id: updates.collection_id },
            updated_at: new Date().toISOString()
          };
          break;

        default:
          updateData = {
            ...updates,
            updated_at: new Date().toISOString()
          };
      }

      // For operations other than add_tags, use bulk update
      if (operation !== 'add_tags') {
        const chunkSize = 10;
        for (let i = 0; i < documentIds.length; i += chunkSize) {
          const chunk = documentIds.slice(i, i + chunkSize);
          
          const { error } = await supabase
            .from(TABLE_NAMES.DOCUMENTS)
            .update(updateData)
            .in('id', chunk);

          if (error) {
            console.error('Error in bulk update chunk:', error);
            chunk.forEach(id => {
              results.errors.push({
                documentId: id,
                error: error.message
              });
              results.failed++;
            });
          } else {
            results.success += chunk.length;
          }
        }
      }

      if (results.failed > 0 && results.success === 0) {
        throw new Error(`Bulk update failed: ${results.failed} documents could not be updated`);
      }

      return results;
    },
    onSuccess: (result, { documentIds }) => {
      // Invalidate queries for all affected projects
      const projectIds = new Set<string>();
      
      // We need to get project IDs from the documents, but for now invalidate all
      queryClient.invalidateQueries({ queryKey: ['project-documents'] });
      queryClient.invalidateQueries({ queryKey: ['advanced-media-search'] });
      queryClient.invalidateQueries({ queryKey: ['media-stats'] });
      queryClient.invalidateQueries({ queryKey: ['media-collections'] });
      queryClient.invalidateQueries({ queryKey: ['document-tags'] });
    },
    onError: (error: Error) => {
      toast.error('Bulk update operation failed');
      console.error('Bulk update failed:', error);
    }
  });
}

/**
 * Create a new document
 */
export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentData: DocumentInsert): Promise<Document> => {
      const { data, error } = await supabase
        .from(TABLE_NAMES.DOCUMENTS)
        .insert(documentData)
        .select()
        .single();

      if (error) {
        console.error('Error creating document:', error);
        throw new Error(`Failed to create document: ${error.message}`);
      }

      return data;
    },
    onSuccess: (newDocument) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['project-documents', newDocument.project_id] });
      queryClient.invalidateQueries({ queryKey: ['advanced-media-search'] });
      queryClient.invalidateQueries({ queryKey: ['media-stats', newDocument.project_id] });
      
      toast.success('Document created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create document');
      console.error('Document creation failed:', error);
    }
  });
}

/**
 * Upload and create document with file handling
 */
export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      file, 
      projectId, 
      phaseId, 
      documentType, 
      metadata = {} 
    }: {
      file: File;
      projectId: string;
      phaseId?: string;
      documentType: DocumentType;
      metadata?: Record<string, unknown>;
    }): Promise<Document> => {
      // Generate file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `projects/${projectId}/documents/${fileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      // Create document record
      const documentData: DocumentInsert = {
        name: file.name,
        document_type: documentType,
        project_id: projectId,
        phase_id: phaseId,
        file_path: filePath,
        file_size: file.size,
        file_size_bytes: file.size,
        mime_type: file.type,
        metadata: {
          original_filename: file.name,
          upload_timestamp: new Date().toISOString(),
          ...metadata
        },
        processing_status: 'pending'
      };

      const { data, error } = await supabase
        .from(TABLE_NAMES.DOCUMENTS)
        .insert(documentData)
        .select()
        .single();

      if (error) {
        console.error('Error creating document record:', error);
        // Clean up uploaded file if document creation fails
        await supabase.storage.from('project-files').remove([filePath]);
        throw new Error(`Failed to create document: ${error.message}`);
      }

      return data;
    },
    onSuccess: (newDocument) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['project-documents', newDocument.project_id] });
      queryClient.invalidateQueries({ queryKey: ['advanced-media-search'] });
      queryClient.invalidateQueries({ queryKey: ['media-stats', newDocument.project_id] });
      
      toast.success('File uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to upload file');
      console.error('File upload failed:', error);
    }
  });
}