/**
 * Advanced Media Query Hooks
 * Provides comprehensive media management functionality for BuildEase
 * Includes search, collections, statistics, and bulk operations
 */

import { supabase } from '@/lib/supabase';
import { TABLE_NAMES } from '@/types/database';
import type { 
  Document, 
  MediaCollection, 
  MediaSearchFilters, 
  MediaSearchResult,
  ProjectMediaStats,
  MediaProcessingQueue
} from '@/types/database';
import { useRetryableQuery } from '@/hooks/useRetryableQuery';

interface UseAdvancedMediaSearchOptions {
  projectId: string;
  filters: MediaSearchFilters;
  limit?: number;
  enabled?: boolean;
}

interface UseMediaCollectionsOptions {
  projectId: string;
  includeDocumentCount?: boolean;
  enabled?: boolean;
}

interface UseMediaStatsOptions {
  projectId: string;
  refreshInterval?: number;
  enabled?: boolean;
}

/**
 * Hook for advanced media search with filtering and full-text search
 */
export function useAdvancedMediaSearch({
  projectId,
  filters,
  limit = 50,
  enabled = true
}: UseAdvancedMediaSearchOptions) {
  const queryKey = ['advanced-media-search', projectId, filters, limit];

  return useRetryableQuery(
    queryKey,
    async (): Promise<MediaSearchResult[]> => {
      if (!projectId) {
        return [];
      }

      // Use the database function for full-text search
      const { data, error } = await supabase.rpc('search_project_media', {
        project_uuid: projectId,
        search_term: filters.searchTerm || null,
        media_tags: filters.tags || null,
        document_types: filters.documentTypes || null,
        limit_count: limit
      });

      if (error) {
        console.error('Error searching media:', error);
        throw new Error(`Failed to search media: ${error.message}`);
      }

      // Apply additional filters that aren't handled by the database function
      let results = data || [];

      if (filters.dateFrom || filters.dateTo) {
        results = results.filter(doc => {
          const createdAt = new Date(doc.created_at);
          const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
          const toDate = filters.dateTo ? new Date(filters.dateTo) : null;
          
          if (fromDate && createdAt < fromDate) return false;
          if (toDate && createdAt > toDate) return false;
          return true;
        });
      }

      if (filters.minFileSize || filters.maxFileSize) {
        results = results.filter(doc => {
          const fileSize = doc.file_size_bytes || 0;
          if (filters.minFileSize && fileSize < filters.minFileSize) return false;
          if (filters.maxFileSize && fileSize > filters.maxFileSize) return false;
          return true;
        });
      }

      return results;
    },
    {
      enabled: enabled && !!projectId,
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes
      circuitBreakerKey: `media-search-${projectId}`,
      showRetryNotifications: false
    }
  );
}

/**
 * Hook to fetch all documents for a project with enhanced metadata
 */
export function useProjectDocuments(projectId: string, enabled = true) {
  const queryKey = ['project-documents', projectId];

  return useRetryableQuery(
    queryKey,
    async (): Promise<Document[]> => {
      if (!projectId) {
        return [];
      }

      const { data, error } = await supabase
        .from(TABLE_NAMES.DOCUMENTS)
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
          tags,
          caption,
          file_size_bytes,
          thumbnail_url,
          processing_status,
          created_at,
          updated_at
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching project documents:', error);
        throw new Error(`Failed to fetch documents: ${error.message}`);
      }

      return data || [];
    },
    {
      enabled: enabled && !!projectId,
      staleTime: 60 * 1000, // 1 minute
      gcTime: 10 * 60 * 1000, // 10 minutes
      circuitBreakerKey: `project-documents-${projectId}`
    }
  );
}

/**
 * Hook to fetch media collections for a project
 */
export function useMediaCollections({
  projectId,
  includeDocumentCount = true,
  enabled = true
}: UseMediaCollectionsOptions) {
  const queryKey = ['media-collections', projectId, { includeDocumentCount }];

  return useRetryableQuery(
    queryKey,
    async (): Promise<MediaCollection[]> => {
      if (!projectId) {
        return [];
      }

      const query = supabase
        .from(TABLE_NAMES.MEDIA_COLLECTIONS)
        .select(`
          id,
          project_id,
          name,
          description,
          cover_image_url,
          is_public,
          collection_type,
          metadata,
          created_by,
          created_at,
          updated_at
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      const { data: collections, error } = await query;

      if (error) {
        console.error('Error fetching media collections:', error);
        throw new Error(`Failed to fetch collections: ${error.message}`);
      }

      if (!collections || !includeDocumentCount) {
        return collections || [];
      }

      // Get document counts for each collection
      const collectionsWithCounts = await Promise.all(
        collections.map(async (collection) => {
          const { count, error: countError } = await supabase
            .from(TABLE_NAMES.COLLECTION_DOCUMENTS)
            .select('*', { count: 'exact', head: true })
            .eq('collection_id', collection.id);

          if (countError) {
            console.warn(`Failed to get count for collection ${collection.id}:`, countError);
            return { ...collection, document_count: 0 };
          }

          return { ...collection, document_count: count || 0 };
        })
      );

      return collectionsWithCounts;
    },
    {
      enabled: enabled && !!projectId,
      staleTime: 60 * 1000, // 1 minute
      gcTime: 10 * 60 * 1000, // 10 minutes
      circuitBreakerKey: `media-collections-${projectId}`
    }
  );
}

/**
 * Hook to fetch documents in a specific collection
 */
export function useCollectionDocuments(collectionId: string, enabled = true) {
  const queryKey = ['collection-documents', collectionId];

  return useRetryableQuery(
    queryKey,
    async (): Promise<Document[]> => {
      if (!collectionId) {
        return [];
      }

      const { data, error } = await supabase
        .from(TABLE_NAMES.COLLECTION_DOCUMENTS)
        .select(`
          sort_order,
          added_at,
          document:${TABLE_NAMES.DOCUMENTS} (
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
            tags,
            caption,
            file_size_bytes,
            thumbnail_url,
            processing_status,
            created_at,
            updated_at
          )
        `)
        .eq('collection_id', collectionId)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching collection documents:', error);
        throw new Error(`Failed to fetch collection documents: ${error.message}`);
      }

      // Extract documents from the joined data
      return (data || [])
        .map(item => item.document)
        .filter(Boolean) as Document[];
    },
    {
      enabled: enabled && !!collectionId,
      staleTime: 60 * 1000, // 1 minute
      gcTime: 10 * 60 * 1000, // 10 minutes
      circuitBreakerKey: `collection-documents-${collectionId}`
    }
  );
}

/**
 * Hook to fetch media statistics for a project
 */
export function useMediaStats({
  projectId,
  refreshInterval,
  enabled = true
}: UseMediaStatsOptions) {
  const queryKey = ['media-stats', projectId];

  return useRetryableQuery(
    queryKey,
    async (): Promise<ProjectMediaStats> => {
      if (!projectId) {
        return {
          total_documents: 0,
          total_size_bytes: 0,
          total_size_mb: 0,
          document_types: {},
          recent_uploads: 0
        };
      }

      const { data, error } = await supabase.rpc('get_project_media_stats', {
        project_uuid: projectId
      });

      if (error) {
        console.error('Error fetching media stats:', error);
        throw new Error(`Failed to fetch media stats: ${error.message}`);
      }

      return data?.[0] || {
        total_documents: 0,
        total_size_bytes: 0,
        total_size_mb: 0,
        document_types: {},
        recent_uploads: 0
      };
    },
    {
      enabled: enabled && !!projectId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      circuitBreakerKey: `media-stats-${projectId}`,
      refetchInterval: refreshInterval
    }
  );
}

/**
 * Hook to fetch media processing queue status
 */
export function useMediaProcessingQueue(projectId: string, enabled = true) {
  const queryKey = ['media-processing-queue', projectId];

  return useRetryableQuery(
    queryKey,
    async (): Promise<MediaProcessingQueue[]> => {
      if (!projectId) {
        return [];
      }

      const { data, error } = await supabase
        .from(TABLE_NAMES.MEDIA_PROCESSING_QUEUE)
        .select(`
          id,
          document_id,
          processing_type,
          status,
          priority,
          attempt_count,
          max_attempts,
          error_message,
          processing_data,
          result_data,
          scheduled_for,
          started_at,
          completed_at,
          created_at,
          updated_at,
          document:${TABLE_NAMES.DOCUMENTS} (
            id,
            name,
            file_path,
            mime_type
          )
        `)
        .in('document_id', 
          // Subquery to get all document IDs for the project
          supabase
            .from(TABLE_NAMES.DOCUMENTS)
            .select('id')
            .eq('project_id', projectId)
            .then(({ data }) => (data || []).map(d => d.id))
        )
        .order('priority', { ascending: true })
        .order('scheduled_for', { ascending: true });

      if (error) {
        console.error('Error fetching processing queue:', error);
        throw new Error(`Failed to fetch processing queue: ${error.message}`);
      }

      return data || [];
    },
    {
      enabled: enabled && !!projectId,
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes
      circuitBreakerKey: `processing-queue-${projectId}`,
      refetchInterval: 30 * 1000 // Refresh every 30 seconds to show processing progress
    }
  );
}

/**
 * Hook to get document tags across a project (for autocomplete)
 */
export function useDocumentTags(projectId: string, enabled = true) {
  const queryKey = ['document-tags', projectId];

  return useRetryableQuery(
    queryKey,
    async (): Promise<string[]> => {
      if (!projectId) {
        return [];
      }

      const { data, error } = await supabase
        .from(TABLE_NAMES.DOCUMENTS)
        .select('tags')
        .eq('project_id', projectId)
        .not('tags', 'is', null);

      if (error) {
        console.error('Error fetching document tags:', error);
        throw new Error(`Failed to fetch tags: ${error.message}`);
      }

      // Flatten and deduplicate tags
      const allTags = (data || [])
        .flatMap(doc => doc.tags || [])
        .filter(Boolean);

      return Array.from(new Set(allTags)).sort();
    },
    {
      enabled: enabled && !!projectId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      circuitBreakerKey: `document-tags-${projectId}`
    }
  );
}

/**
 * Hook to fetch recent media uploads
 */
export function useRecentMediaUploads(projectId: string, days = 7, enabled = true) {
  const queryKey = ['recent-media-uploads', projectId, days];

  return useRetryableQuery(
    queryKey,
    async (): Promise<Document[]> => {
      if (!projectId) {
        return [];
      }

      const { data, error } = await supabase
        .from(TABLE_NAMES.DOCUMENTS)
        .select(`
          id,
          name,
          document_type,
          file_path,
          file_size_bytes,
          thumbnail_url,
          created_at
        `)
        .eq('project_id', projectId)
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching recent uploads:', error);
        throw new Error(`Failed to fetch recent uploads: ${error.message}`);
      }

      return data || [];
    },
    {
      enabled: enabled && !!projectId,
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      circuitBreakerKey: `recent-uploads-${projectId}`
    }
  );
}