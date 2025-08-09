/**
 * Document Mutation Hooks
 * Comprehensive document management mutations for BuildEase
 * Includes metadata updates, bulk operations, and file management
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { TABLE_NAMES } from '@/types/database';
import * as activityService from '@/services/activityService';
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
  updates: Record<string, unknown>;
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
        updateData.caption = metadata.caption ?? undefined;
      }
      if (metadata.description !== undefined) {
        updateData.description = metadata.description ?? undefined;
      }
      if (metadata.document_type !== undefined) {
        updateData.document_type = metadata.document_type;
      }
      if (metadata.tags !== undefined) {
        updateData.tags = metadata.tags ?? undefined;
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
    onSuccess: (updatedDocument, variables) => {
      console.log('[ACTIVITY_DEBUG] Document metadata update successful - now adding activity logging', {
        documentId: updatedDocument.id,
        documentName: updatedDocument.name,
        projectId: updatedDocument.project_id,
        changes: variables.metadata,
        timestamp: new Date().toISOString()
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['project-documents', updatedDocument.project_id] });
      queryClient.invalidateQueries({ queryKey: ['advanced-media-search'] });
      queryClient.invalidateQueries({ queryKey: ['document-tags', updatedDocument.project_id] });
      queryClient.invalidateQueries({ queryKey: ['media-stats', updatedDocument.project_id] });
      
      // Fire-and-forget activity log for metadata update with comprehensive debug logging
      console.log('[ACTIVITY_DEBUG] Starting metadata update activity logging', {
        documentId: updatedDocument.id,
        documentName: updatedDocument.name,
        projectId: updatedDocument.project_id,
        changes: variables.metadata,
        timestamp: new Date().toISOString()
      });
      
      (async () => {
        try {
          console.log('[ACTIVITY_DEBUG] Fetching auth user for metadata update');
          const { data: auth, error: authError } = await supabase.auth.getUser();
          
          if (authError) {
            console.error('[ACTIVITY_DEBUG] Auth error during metadata update:', authError);
            return;
          }
          
          console.log('[ACTIVITY_DEBUG] Auth user fetched successfully for metadata update', {
            userId: auth?.user?.id,
            hasUser: !!auth?.user,
            userMetadata: auth?.user?.user_metadata
          });
          
          const userName = (auth?.user?.user_metadata?.full_name as string | undefined) ||
              (auth?.user?.user_metadata?.name as string | undefined) ||
              (auth?.user?.email as string | undefined);
              
          // Create more user-friendly summary of changes
          const changeEntries = Object.entries(variables.metadata)
            .filter(([_, value]) => value !== undefined);
          
          const changeDescriptions = changeEntries.map(([key, value]) => {
            switch (key) {
              case 'caption':
                return value ? `caption added` : `caption removed`;
              case 'description':
                return value ? `description updated` : `description removed`;
              case 'document_type':
                return `type changed to ${value}`;
              case 'tags':
                return Array.isArray(value) && value.length > 0 
                  ? `tagged with ${value.join(', ')}` 
                  : `tags removed`;
              default:
                return `${key} updated`;
            }
          });
          
          const changesDescription = changeDescriptions.length > 1
            ? changeDescriptions.slice(0, -1).join(', ') + ' and ' + changeDescriptions.slice(-1)
            : changeDescriptions[0] || 'properties updated';
              
          console.log('[ACTIVITY_DEBUG] Calling activityService.createActivity for metadata update with params:', {
            project_id: updatedDocument.project_id,
            activity_type: 'document_update',
            title: `Document details updated: ${updatedDocument.name}`,
            description: `"${updatedDocument.name}" ${changesDescription}`,
            userId: auth?.user?.id,
            userName
          });
          
          // Import activityService inline to avoid circular imports
          const activityService = await import('@/services/activityService');
          
          const result = await activityService.createActivity({
            project_id: updatedDocument.project_id,
            activity_type: 'document_update',
            title: `Document details updated: ${updatedDocument.name}`,
            description: `"${updatedDocument.name}" ${changesDescription}`,
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'document',
            entity_id: updatedDocument.id,
            metadata: {
              documentName: updatedDocument.name,
              documentType: updatedDocument.document_type,
              changes: variables.metadata,
              changesDescription
            },
            status: 'info'
          });
          
          console.log('[ACTIVITY_DEBUG] Metadata update activity result:', {
            success: !!result,
            activityId: result?.id,
            result
          });
          
        } catch (e) {
          console.error('[ACTIVITY_DEBUG] Activity log (metadata_update) failed with full error:', {
            error: e,
            errorMessage: e instanceof Error ? e.message : String(e),
            errorStack: e instanceof Error ? e.stack : undefined,
            documentId: updatedDocument.id,
            documentName: updatedDocument.name,
            projectId: updatedDocument.project_id,
            changes: variables.metadata,
            timestamp: new Date().toISOString()
          });
        }
      })();
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
      // Fetch minimal info for activity logging before deletion
      const { data: doc, error: fetchErr } = await supabase
        .from(TABLE_NAMES.DOCUMENTS)
        .select('id, project_id, name')
        .eq('id', documentId)
        .single();

      const { error } = await supabase
        .from(TABLE_NAMES.DOCUMENTS)
        .delete()
        .eq('id', documentId);

      if (error) {
        console.error('Error deleting document:', error);
        throw new Error(`Failed to delete document: ${error.message}`);
      }

      // Fire-and-forget activity log (non-blocking)
      if (doc && !fetchErr) {
        (async () => {
          try {
            const { data: auth } = await supabase.auth.getUser();
            await activityService.trackDocumentDelete(
              doc.project_id,
              doc.name,
              auth?.user?.id,
              // Attempt common name fields; fallback to email or undefined
              (auth?.user?.user_metadata?.full_name as string | undefined) ||
                (auth?.user?.user_metadata?.name as string | undefined) ||
                (auth?.user?.email as string | undefined)
            );
          } catch (e) {
            console.error('Activity log (document_delete) failed:', e);
          }
        })();
      }
    },
    onSuccess: (_, _documentId) => {
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
        // Fetch minimal info for activity logging before deletion
        const { data: docsForChunk } = await supabase
          .from(TABLE_NAMES.DOCUMENTS)
          .select('id, project_id, name')
          .in('id', chunk);

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
          // Fire-and-forget activity logs per deleted doc (non-blocking)
          if (docsForChunk && docsForChunk.length) {
            (async () => {
              try {
                const { data: auth } = await supabase.auth.getUser();
                for (const d of docsForChunk) {
                  try {
                    await activityService.trackDocumentDelete(
                      d.project_id,
                      d.name,
                      auth?.user?.id,
                      (auth?.user?.user_metadata?.full_name as string | undefined) ||
                        (auth?.user?.user_metadata?.name as string | undefined) ||
                        (auth?.user?.email as string | undefined)
                    );
                  } catch (e) {
                    console.error('Activity log (bulk document_delete) failed for doc', d.id, e);
                  }
                }
              } catch (e) {
                console.error('Activity auth/user fetch failed (bulk delete):', e);
              }
            })();
          }
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
              const newTags = Array.isArray((updates as Record<string, unknown>).tags)
                ? ((updates as { tags: string[] }).tags)
                : [];
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
            document_type: (updates as { document_type?: DocumentType }).document_type,
            updated_at: new Date().toISOString()
          };
          break;

        case 'move_to_collection':
          // This would involve updating the collection_document table
          // For now, we'll update the document metadata to track collection association
          updateData = {
            metadata: { collection_id: (updates as { collection_id?: string }).collection_id },
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
    onSuccess: (result, args) => {
      console.log('[ACTIVITY_DEBUG] Bulk document update successful - now adding activity logging', {
        operation: args.operation,
        documentsAffected: result.success,
        documentsFailed: result.failed,
        documentIds: args.documentIds,
        updates: args.updates,
        timestamp: new Date().toISOString()
      });
      
      // Invalidate queries for all affected projects
      // We need to get project IDs from the documents, but for now invalidate all
      queryClient.invalidateQueries({ queryKey: ['project-documents'] });
      queryClient.invalidateQueries({ queryKey: ['advanced-media-search'] });
      queryClient.invalidateQueries({ queryKey: ['media-stats'] });
      queryClient.invalidateQueries({ queryKey: ['media-collections'] });
      queryClient.invalidateQueries({ queryKey: ['document-tags'] });
      
      // Fire-and-forget activity log for bulk update with comprehensive debug logging
      console.log('[ACTIVITY_DEBUG] Starting bulk document update activity logging', {
        operation: args.operation,
        documentsAffected: result.success,
        documentsFailed: result.failed,
        documentIds: args.documentIds,
        timestamp: new Date().toISOString()
      });
      
      (async () => {
        try {
          console.log('[ACTIVITY_DEBUG] Fetching auth user for bulk update');
          const { data: auth, error: authError } = await supabase.auth.getUser();
          
          if (authError) {
            console.error('[ACTIVITY_DEBUG] Auth error during bulk update:', authError);
            return;
          }
          
          console.log('[ACTIVITY_DEBUG] Auth user fetched successfully for bulk update', {
            userId: auth?.user?.id,
            hasUser: !!auth?.user,
            userMetadata: auth?.user?.user_metadata
          });
          
          const userName = (auth?.user?.user_metadata?.full_name as string | undefined) ||
              (auth?.user?.user_metadata?.name as string | undefined) ||
              (auth?.user?.email as string | undefined);
              
          console.log('[ACTIVITY_DEBUG] Calling activityService.createActivity for bulk update with params:', {
            activity_type: 'document_update',
            title: `Bulk document update: ${result.success} documents updated`,
            description: `Applied ${args.operation.replace('_', ' ')} operation to ${result.success} documents`,
            userId: auth?.user?.id,
            userName
          });
          
          // Import activityService inline to avoid circular imports
          const activityService = await import('@/services/activityService');
          
          // We need to get the project_id - since we don't have it directly, we'll need to fetch it
          // from one of the documents. For now, we'll skip this specific activity logging
          // and note it in the debug logs
          console.warn('[ACTIVITY_DEBUG] Bulk update activity logging skipped - no project_id available', {
            operation: args.operation,
            documentsAffected: result.success,
            note: 'Need to modify bulk update to include project_id parameter'
          });
          
        } catch (e) {
          console.error('[ACTIVITY_DEBUG] Activity log (bulk_update) failed with full error:', {
            error: e,
            errorMessage: e instanceof Error ? e.message : String(e),
            errorStack: e instanceof Error ? e.stack : undefined,
            operation: args.operation,
            documentsAffected: result.success,
            documentIds: args.documentIds,
            timestamp: new Date().toISOString()
          });
        }
      })();
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

      // Fire-and-forget activity log for document upload via direct create
      (async () => {
        try {
          const { data: auth } = await supabase.auth.getUser();
          await activityService.trackDocumentUpload(
            newDocument.project_id,
            newDocument.id,
            newDocument.name,
            newDocument.document_type,
            auth?.user?.id,
            (auth?.user?.user_metadata?.full_name as string | undefined) ||
              (auth?.user?.user_metadata?.name as string | undefined) ||
              (auth?.user?.email as string | undefined)
          );
        } catch (e) {
          console.error('Activity log (document_upload create) failed:', e);
        }
      })();
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
      const { error: uploadError } = await supabase.storage
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

      // Fire-and-forget activity log for document upload
      (async () => {
        try {
          const { data: auth } = await supabase.auth.getUser();
          await activityService.trackDocumentUpload(
            newDocument.project_id,
            newDocument.id,
            newDocument.name,
            newDocument.document_type,
            auth?.user?.id,
            (auth?.user?.user_metadata?.full_name as string | undefined) ||
              (auth?.user?.user_metadata?.name as string | undefined) ||
              (auth?.user?.email as string | undefined)
          );
        } catch (e) {
          console.error('Activity log (document_upload) failed:', e);
        }
      })();
    },
    onError: (error: Error) => {
      toast.error('Failed to upload file');
      console.error('File upload failed:', error);
    }
  });
}