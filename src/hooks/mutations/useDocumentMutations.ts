/**
 * Document Mutation Hooks
 * Comprehensive document management mutations for BuildEase
 * Includes metadata updates, bulk operations, and file management
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryClient';
import { TABLE_NAMES } from '@/types/database';
import * as activityService from '@/services/activityService';
import { toast } from 'sonner';
import { useProjectStore } from '@/stores/projectStore';
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
  const addOptimisticUpdate = useProjectStore(state => state.addOptimisticUpdate);

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
    // Optimistic update - show metadata changes immediately
    onMutate: async ({ documentId, metadata }) => {
      // Find the document in cached queries
      const queryCache = queryClient.getQueryCache();
      let documentToUpdate: Document | null = null;
      let projectId: string | null = null;

      // Search through document queries to find the document
      for (const query of queryCache.getAll()) {
        if (query.queryKey[0] === 'be_document' && query.queryKey[1] === 'project' && Array.isArray(query.state.data)) {
          const documents = query.state.data as Document[];
          const found = documents.find(doc => doc.id === documentId);
          if (found) {
            documentToUpdate = found;
            projectId = found.project_id;
            break;
          }
        }
      }

      if (documentToUpdate && projectId) {
        const queryKey = queryKeys.documents.byProject(projectId);
        
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({ queryKey });
        
        // Snapshot the previous value
        const previousDocuments = queryClient.getQueryData<Document[]>(queryKey) || [];
        
        // Create optimistically updated document
        const updatedDocument = { 
          ...documentToUpdate, 
          caption: metadata.caption ?? documentToUpdate.caption,
          description: metadata.description ?? documentToUpdate.description,
          document_type: metadata.document_type ?? documentToUpdate.document_type,
          tags: metadata.tags ?? documentToUpdate.tags,
          updated_at: new Date().toISOString() 
        };

        // Optimistically update the document
        queryClient.setQueryData<Document[]>(queryKey, (old = []) => 
          old.map(doc => doc.id === documentId ? updatedDocument : doc)
        );

        // Track optimistic update
        addOptimisticUpdate(`update_document_${documentId}`, {
          id: `update_document_${documentId}`,
          type: 'update',
          entity: 'document',
          data: updatedDocument,
          originalData: documentToUpdate,
          timestamp: Date.now()
        });

        return { previousDocuments, documentToUpdate, projectId };
      }

      return { previousDocuments: undefined, documentToUpdate: null, projectId: null };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousDocuments && context?.projectId) {
        const queryKey = queryKeys.documents.byProject(context.projectId);
        queryClient.setQueryData(queryKey, context.previousDocuments);
      }
      
      console.error('Error updating document metadata:', error);
      toast.error('Failed to update document metadata');
    },
    onSuccess: (updatedDocument, variables, context) => {
      console.log('[ACTIVITY_DEBUG] Document metadata update successful - now adding activity logging', {
        documentId: updatedDocument.id,
        documentName: updatedDocument.name,
        projectId: updatedDocument.project_id,
        changes: variables.metadata,
        timestamp: new Date().toISOString()
      });

      // Update cached document with real server data
      if (context?.projectId) {
        const queryKey = queryKeys.documents.byProject(context.projectId);
        queryClient.setQueryData<Document[]>(queryKey, (old = []) => 
          old.map(doc => doc.id === updatedDocument.id ? updatedDocument : doc)
        );
      }

      // Remove optimistic update tracking
      const removeOptimisticUpdate = useProjectStore.getState().removeOptimisticUpdate;
      removeOptimisticUpdate(`update_document_${updatedDocument.id}`);
      
      // Invalidate related queries for other components
      queryClient.invalidateQueries({ queryKey: ['advanced-media-search'] });
      queryClient.invalidateQueries({ queryKey: ['document-tags', updatedDocument.project_id] });
      queryClient.invalidateQueries({ queryKey: ['media-stats', updatedDocument.project_id] });

      // CRITICAL: Invalidate consolidated project query for real-time updates
      queryClient.invalidateQueries({
        queryKey: ['project-consolidated', updatedDocument.project_id]
      });
      
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
            activity_type: 'document_upload', // Using existing type for document operations
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
    }
  });
}

/**
 * Delete a single document
 */
export function useDeleteDocument() {
  const queryClient = useQueryClient();
  const addOptimisticUpdate = useProjectStore(state => state.addOptimisticUpdate);

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

      // Update be_project table timestamp after successful deletion
      if (doc && !fetchErr) {
        const { error: projectUpdateError } = await supabase
          .from('be_project')
          .update({ 
            updated_at: new Date().toISOString()
          })
          .eq('id', doc.project_id);

        if (projectUpdateError) {
          console.warn('Failed to update project timestamp after document deletion:', projectUpdateError);
          // Don't throw here as the document was deleted successfully
        }
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
    // Optimistic update - remove document immediately
    onMutate: async (documentId) => {
      // Find the document in cached queries
      const queryCache = queryClient.getQueryCache();
      let documentToDelete: Document | null = null;
      let projectId: string | null = null;

      // Search through document queries to find the document
      for (const query of queryCache.getAll()) {
        if (query.queryKey[0] === 'be_document' && query.queryKey[1] === 'project' && Array.isArray(query.state.data)) {
          const documents = query.state.data as Document[];
          const found = documents.find(doc => doc.id === documentId);
          if (found) {
            documentToDelete = found;
            projectId = found.project_id;
            break;
          }
        }
      }

      if (documentToDelete && projectId) {
        const queryKey = queryKeys.documents.byProject(projectId);
        
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({ queryKey });
        
        // Snapshot the previous value
        const previousDocuments = queryClient.getQueryData<Document[]>(queryKey) || [];
        
        // Optimistically remove the document
        queryClient.setQueryData<Document[]>(queryKey, (old = []) => 
          old.filter(doc => doc.id !== documentId)
        );

        // Track optimistic update
        addOptimisticUpdate(`delete_document_${documentId}`, {
          id: `delete_document_${documentId}`,
          type: 'delete',
          entity: 'document',
          data: documentToDelete,
          timestamp: Date.now()
        });

        return { previousDocuments, documentToDelete, projectId };
      }

      return { previousDocuments: undefined, documentToDelete: null, projectId: null };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousDocuments && context?.projectId) {
        const queryKey = queryKeys.documents.byProject(context.projectId);
        queryClient.setQueryData(queryKey, context.previousDocuments);
      }
      
      console.error('Document deletion failed:', error);
      toast.error('Failed to delete document');
    },
    onSuccess: (_, documentId, context) => {
      // Remove optimistic update tracking
      const removeOptimisticUpdate = useProjectStore.getState().removeOptimisticUpdate;
      removeOptimisticUpdate(`delete_document_${documentId}`);

      // Ensure document is removed from cache (should already be done optimistically)
      if (context?.projectId) {
        const queryKey = queryKeys.documents.byProject(context.projectId);
        queryClient.setQueryData<Document[]>(queryKey, (old = []) => 
          old.filter(doc => doc.id !== documentId)
        );

        // CRITICAL: Invalidate project queries for real-time updates
        queryClient.invalidateQueries({
          queryKey: ['project', context.projectId]
        });
        queryClient.invalidateQueries({
          queryKey: ['project-consolidated', context.projectId]
        });
      }

      // Invalidate other document-related queries for search and stats
      queryClient.invalidateQueries({ queryKey: ['advanced-media-search'] });
      queryClient.invalidateQueries({ queryKey: ['media-stats'] });
      queryClient.invalidateQueries({ queryKey: ['media-collections'] });
      
      toast.success('Document deleted successfully');
    }
  });
}

/**
 * Bulk delete multiple documents
 */
export function useBulkDeleteDocuments() {
  const queryClient = useQueryClient();
  const addOptimisticUpdate = useProjectStore(state => state.addOptimisticUpdate);

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
    // Optimistic update - remove documents immediately
    onMutate: async ({ documentIds, projectId }) => {
      const queryKey = queryKeys.documents.byProject(projectId);
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot the previous value
      const previousDocuments = queryClient.getQueryData<Document[]>(queryKey) || [];
      
      // Get documents that will be deleted (for rollback)
      const documentsToDelete = previousDocuments.filter(doc => documentIds.includes(doc.id));
      
      // Optimistically remove the documents
      queryClient.setQueryData<Document[]>(queryKey, (old = []) => 
        old.filter(doc => !documentIds.includes(doc.id))
      );

      // Track optimistic update
      const bulkDeleteId = `bulk_delete_documents_${Date.now()}`;
      addOptimisticUpdate(bulkDeleteId, {
        id: bulkDeleteId,
        type: 'delete',
        entity: 'document',
        data: documentsToDelete,
        timestamp: Date.now()
      });

      return { previousDocuments, documentsToDelete };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousDocuments) {
        const queryKey = queryKeys.documents.byProject(variables.projectId);
        queryClient.setQueryData(queryKey, context.previousDocuments);
      }
      
      console.error('Bulk document deletion failed:', error);
      toast.error('Failed to delete documents');
    },
    onSuccess: (result, { projectId }, context) => {
      // Remove optimistic update tracking
      const removeOptimisticUpdate = useProjectStore.getState().removeOptimisticUpdate;
      // Find the optimistic update by searching for bulk_delete entries
      const optimisticUpdates = useProjectStore.getState().optimisticUpdates;
      Object.keys(optimisticUpdates).forEach(key => {
        if (key.startsWith('bulk_delete_documents_')) {
          removeOptimisticUpdate(key);
        }
      });

      // CRITICAL: Invalidate consolidated project query for real-time updates
      queryClient.invalidateQueries({
        queryKey: ['project-consolidated', projectId]
      });
      
      // Invalidate all document-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.byProject(projectId) });
      queryClient.invalidateQueries({ queryKey: ['advanced-media-search'] });
      queryClient.invalidateQueries({ queryKey: ['media-stats', projectId] });
      queryClient.invalidateQueries({ queryKey: ['media-collections', projectId] });
      
      toast.success(`Successfully deleted ${result.success} documents`);
    }
  });
}

/**
 * Bulk update multiple documents
 */
export function useBulkUpdateDocuments() {
  const queryClient = useQueryClient();
  const addOptimisticUpdate = useProjectStore(state => state.addOptimisticUpdate);

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
    // Optimistic update - show changes immediately
    onMutate: async ({ documentIds, updates, operation }) => {
      // Find all documents in cached queries that need updating
      const queryCache = queryClient.getQueryCache();
      const affectedQueries = new Map<string, { query: any, documents: Document[], projectId: string }>();
      
      // Search through all document queries to find affected documents
      for (const query of queryCache.getAll()) {
        if (query.queryKey[0] === 'be_document' && query.queryKey[1] === 'project' && Array.isArray(query.state.data)) {
          const documents = query.state.data as Document[];
          const affectedDocs = documents.filter(doc => documentIds.includes(doc.id));
          
          if (affectedDocs.length > 0 && query.queryKey[2]) {
            affectedQueries.set(query.queryKey[2] as string, {
              query,
              documents: documents,
              projectId: query.queryKey[2] as string
            });
          }
        }
      }
      
      const previousStates = new Map<string, Document[]>();
      const optimisticDocuments: Document[] = [];
      
      // Apply optimistic updates to each affected query
      for (const [projectId, { documents }] of affectedQueries) {
        const queryKey = queryKeys.documents.byProject(projectId);
        
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({ queryKey });
        
        // Snapshot the previous value
        previousStates.set(projectId, [...documents]);
        
        // Create optimistically updated documents
        const updatedDocuments = documents.map(doc => {
          if (!documentIds.includes(doc.id)) return doc;
          
          let updatedDoc = { ...doc };
          
          switch (operation) {
            case 'add_tags':
              const newTags = Array.isArray((updates as { tags?: string[] }).tags)
                ? (updates as { tags: string[] }).tags
                : [];
              const currentTags = doc.tags || [];
              updatedDoc.tags = [...new Set([...currentTags, ...newTags])];
              break;
              
            case 'update_type':
              updatedDoc.document_type = (updates as { document_type?: DocumentType }).document_type || doc.document_type;
              break;
              
            case 'move_to_collection':
              updatedDoc.metadata = {
                ...doc.metadata,
                collection_id: (updates as { collection_id?: string }).collection_id
              };
              break;
              
            default:
              updatedDoc = { ...doc, ...updates };
          }
          
          updatedDoc.updated_at = new Date().toISOString();
          optimisticDocuments.push(updatedDoc);
          return updatedDoc;
        });
        
        // Apply optimistic updates
        queryClient.setQueryData<Document[]>(queryKey, updatedDocuments);
      }
      
      // Track optimistic update
      const updateId = `bulk_update_documents_${Date.now()}`;
      addOptimisticUpdate(updateId, {
        id: updateId,
        type: 'update',
        entity: 'document',
        data: optimisticDocuments,
        timestamp: Date.now()
      });

      return { previousStates, affectedQueries: Array.from(affectedQueries.keys()), updateId };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousStates && context?.affectedQueries) {
        for (const projectId of context.affectedQueries) {
          const previousDocs = context.previousStates.get(projectId);
          if (previousDocs) {
            const queryKey = queryKeys.documents.byProject(projectId);
            queryClient.setQueryData(queryKey, previousDocs);
          }
        }
      }
      
      console.error('Bulk document update failed:', error);
      toast.error('Failed to update documents');
    },
    onSuccess: (result, args, context) => {
      // Remove optimistic update tracking
      if (context?.updateId) {
        const removeOptimisticUpdate = useProjectStore.getState().removeOptimisticUpdate;
        removeOptimisticUpdate(context.updateId);
      }
      
      console.log('[ACTIVITY_DEBUG] Bulk document update successful - now adding activity logging', {
        operation: args.operation,
        documentsAffected: result.success,
        documentsFailed: result.failed,
        documentIds: args.documentIds,
        updates: args.updates,
        timestamp: new Date().toISOString()
      });

      // Invalidate consolidated project queries for all affected projects
      if (context?.affectedQueries) {
        for (const projectId of context.affectedQueries) {
          queryClient.invalidateQueries({
            queryKey: ['project-consolidated', projectId]
          });
        }
      }
      
      // Invalidate queries for all affected projects
      // We need to get project IDs from the documents, but for now invalidate all
      queryClient.invalidateQueries({ queryKey: ['be_document'] });
      queryClient.invalidateQueries({ queryKey: ['advanced-media-search'] });
      queryClient.invalidateQueries({ queryKey: ['media-stats'] });
      queryClient.invalidateQueries({ queryKey: ['media-collections'] });
      queryClient.invalidateQueries({ queryKey: ['document-tags'] });
      
      toast.success(`Successfully updated ${result.success} documents`);
      
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
          
          // Get project_id from the first affected project in context
          let projectId: string | null = null;
          if (context?.affectedQueries && context.affectedQueries.length > 0) {
            projectId = context.affectedQueries[0];
          }
          
          if (projectId) {
            const activityResult = await activityService.createActivity({
              project_id: projectId,
              activity_type: 'document_upload', // Using existing type for document operations
              title: `Bulk document update: ${result.success} documents updated`,
              description: `Applied ${args.operation.replace('_', ' ')} operation to ${result.success} documents`,
              user_id: auth?.user?.id,
              user_name: userName,
              entity_type: 'document',
              metadata: {
                operation: args.operation,
                documentsAffected: result.success,
                documentsFailed: result.failed,
                documentCount: args.documentIds.length,
                updates: args.updates
              },
              status: result.failed > 0 ? 'warning' : 'success'
            });
            
            console.log('[ACTIVITY_DEBUG] Bulk update activity result:', {
              success: !!activityResult,
              activityId: activityResult?.id,
              projectId,
              operation: args.operation
            });
          } else {
            console.warn('[ACTIVITY_DEBUG] Bulk update activity logging skipped - no project_id available', {
              operation: args.operation,
              documentsAffected: result.success,
              contextKeys: Object.keys(context || {})
            });
          }
          
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
    }
  });
}

/**
 * Create a new document
 */
export function useCreateDocument() {
  const queryClient = useQueryClient();
  const addOptimisticUpdate = useProjectStore(state => state.addOptimisticUpdate);

  return useMutation({
    mutationFn: async (documentData: DocumentInsert): Promise<Document> => {
      // First attempt to create the document
      let { data, error } = await supabase
        .from(TABLE_NAMES.DOCUMENTS)
        .insert(documentData)
        .select()
        .single();

      // If we get a duplicate file_path constraint violation, retry with a unique path
      if (error?.code === '23505' && error.message.includes('be_document_file_path_key')) {
        console.log('Duplicate file_path detected, retrying with unique path...');
        
        // Generate a unique file_path by appending a UUID
        const originalPath = documentData.file_path;
        const uuid = crypto.randomUUID();
        const uniquePath = `${originalPath}?v=${uuid}`;
        
        const retryData = {
          ...documentData,
          file_path: uniquePath,
          metadata: {
            ...(documentData.metadata || {}),
            original_file_path: originalPath,
            duplicate_resolution: 'uuid_suffix'
          }
        };

        // Retry the insert with unique file_path
        const retryResult = await supabase
          .from(TABLE_NAMES.DOCUMENTS)
          .insert(retryData)
          .select()
          .single();

        data = retryResult.data;
        error = retryResult.error;
      }

      if (error) {
        console.error('Error creating document:', error);
        throw new Error(`Failed to create document: ${error.message}`);
      }

      // Update be_project table to increment document count and update timestamp
      const { error: projectUpdateError } = await supabase
        .from('be_project')
        .update({ 
          updated_at: new Date().toISOString()
        })
        .eq('id', data.project_id);

      if (projectUpdateError) {
        console.warn('Failed to update project timestamp:', projectUpdateError);
        // Don't throw here as the document was created successfully
        // The timestamp will be updated on next project modification
      }

      return data;
    },
    // Optimistic update - show document immediately
    onMutate: async (documentData: DocumentInsert) => {
      const queryKey = queryKeys.documents.byProject(documentData.project_id);
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot the previous value
      const previousDocuments = queryClient.getQueryData<Document[]>(queryKey);
      
      if (previousDocuments) {
        // Create optimistic document
        const optimisticDocument: Document = {
          id: `temp_${Date.now()}_${Math.random()}`, // Temporary ID
          name: documentData.name,
          document_type: documentData.document_type,
          project_id: documentData.project_id,
          file_path: documentData.file_path || '',
          file_size: documentData.file_size || 0,
          file_size_bytes: documentData.file_size_bytes || 0,
          mime_type: documentData.mime_type || 'application/octet-stream',
          processing_status: 'processing', // Show as processing
          metadata: documentData.metadata || {},
          phase_id: documentData.phase_id || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Optimistically update the documents list
        queryClient.setQueryData<Document[]>(queryKey, [...previousDocuments, optimisticDocument]);

        // Track optimistic update
        const createId = `create_document_${optimisticDocument.id}`;
        addOptimisticUpdate(createId, {
          id: createId,
          type: 'create',
          entity: 'document',
          data: optimisticDocument,
          originalData: previousDocuments,
          timestamp: Date.now()
        });

        return { previousDocuments, createId, optimisticDocument };
      }

      return { previousDocuments: undefined, createId: undefined, optimisticDocument: undefined };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousDocuments) {
        const queryKey = queryKeys.documents.byProject(variables.project_id);
        queryClient.setQueryData(queryKey, context.previousDocuments);
      }
      
      console.error('Document creation failed:', error);
      toast.error('Failed to create document');
    },
    onSuccess: (newDocument, variables, context) => {
      // Remove optimistic update tracking
      if (context?.createId) {
        const removeOptimisticUpdate = useProjectStore.getState().removeOptimisticUpdate;
        removeOptimisticUpdate(context.createId);
      }

      // Replace optimistic document with real server data
      const queryKey = queryKeys.documents.byProject(newDocument.project_id);
      queryClient.setQueryData<Document[]>(queryKey, (old = []) => 
        old.map(doc => doc.id === context?.optimisticDocument?.id ? newDocument : doc)
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.byProject(newDocument.project_id) });
      queryClient.invalidateQueries({ queryKey: ['advanced-media-search'] });
      queryClient.invalidateQueries({ queryKey: ['media-stats', newDocument.project_id] });
      
      // Invalidate project data to refresh document count and updated_at timestamp
      queryClient.invalidateQueries({ queryKey: ['project', newDocument.project_id] });
      queryClient.invalidateQueries({ queryKey: ['project-consolidated', newDocument.project_id] });
      
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
    }
  });
}

/**
 * Upload and create document with file handling
 */
export function useUploadDocument() {
  const queryClient = useQueryClient();
  const addOptimisticUpdate = useProjectStore(state => state.addOptimisticUpdate);

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
    // Optimistic update - show upload progress immediately
    onMutate: async ({ file, projectId, phaseId, documentType, metadata = {} }) => {
      const queryKey = queryKeys.documents.byProject(projectId);
      const optimisticId = `temp_upload_${Date.now()}`;
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot the previous value
      const previousDocuments = queryClient.getQueryData<Document[]>(queryKey) || [];
      
      // Create optimistic document
      const optimisticDocument: Partial<Document> = {
        id: optimisticId,
        name: file.name,
        document_type: documentType,
        project_id: projectId,
        phase_id: phaseId,
        file_size: file.size,
        file_size_bytes: file.size,
        mime_type: file.type,
        processing_status: 'uploading' as any, // Show as uploading
        metadata: {
          original_filename: file.name,
          upload_timestamp: new Date().toISOString(),
          ...metadata
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Optimistically add the document
      queryClient.setQueryData<Document[]>(queryKey, (old = []) => [
        optimisticDocument as Document,
        ...old
      ]);

      // Track optimistic update
      addOptimisticUpdate(`upload_document_${optimisticId}`, {
        id: `upload_document_${optimisticId}`,
        type: 'create',
        entity: 'document',
        data: optimisticDocument,
        timestamp: Date.now()
      });
      
      return { previousDocuments, optimisticDocument, optimisticId };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousDocuments) {
        const queryKey = queryKeys.documents.byProject(variables.projectId);
        queryClient.setQueryData(queryKey, context.previousDocuments);
      }
      
      console.error('File upload failed:', error);
      toast.error('Failed to upload file');
    },
    onSuccess: (newDocument, variables, context) => {
      // Replace optimistic document with real server data
      const queryKey = queryKeys.documents.byProject(newDocument.project_id);
      queryClient.setQueryData<Document[]>(queryKey, (old = []) => 
        old.map(doc => doc.id === context?.optimisticId ? newDocument : doc)
      );

      // Remove optimistic update tracking
      const removeOptimisticUpdate = useProjectStore.getState().removeOptimisticUpdate;
      removeOptimisticUpdate(`upload_document_${context?.optimisticId}`);

      // CRITICAL: Invalidate consolidated project query for real-time updates
      queryClient.invalidateQueries({
        queryKey: ['project-consolidated', newDocument.project_id]
      });
      
      // Invalidate related queries
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
    }
  });
}