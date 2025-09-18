/**
 * Simplified Media Hook - Clean, performant media operations
 * Streamlined from 780 lines to ~150 lines while maintaining core functionality
 */

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { MediaService } from '@/services/MediaService';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { toast } from 'sonner';
import type { MediaCategory } from '@/types/database';
import type { MediaItem } from '@/types/media';

// ============================================================================
// Media Hook Types and Interfaces
// ============================================================================

export interface MediaFilters {
  category?: MediaCategory | 'all';
  media_type?: 'PHOTO' | 'VIDEO' | 'DOCUMENT' | 'all';
  phase_id?: string | 'all';
  search?: string;
}

export interface MediaStats {
  total: number;
  byCategory: Record<MediaCategory, number>;
  byType: Record<'PHOTO' | 'VIDEO' | 'DOCUMENT', number>;
  totalSizeMB: number;
}

export interface UploadOptions {
  name?: string;
  description?: string;
  phase_id?: string;
  category?: MediaCategory;
  onProgress?: (completed: number, total: number) => void;
}

// ============================================================================
// UTILITIES
// ============================================================================

const calculateStats = (items: MediaItem[]): MediaStats => {
  const stats: MediaStats = {
    total: items.length,
    byCategory: { profile: 0, inspiration: 0, progress: 0, progress_video: 0, receipt: 0, report: 0, contract: 0, permit: 0, invoice: 0, blueprint: 0, other: 0 },
    byType: { PHOTO: 0, VIDEO: 0, DOCUMENT: 0 },
    totalSizeMB: 0
  };

  items.forEach(item => {
    stats.byCategory[item.category]++;
    const mediaType = item.mediaType || item.media_type;
    if (mediaType) {
      stats.byType[mediaType]++;
    }
    const fileSize = item.fileSize || item.file_size_bytes || 0;
    stats.totalSizeMB += fileSize / (1024 * 1024);
  });

  stats.totalSizeMB = Math.round(stats.totalSizeMB * 100) / 100;
  return stats;
};

const applyFilters = (items: MediaItem[], filters: MediaFilters): MediaItem[] => {
  return items.filter(item => {
    if (filters.category && filters.category !== 'all' && item.category !== filters.category) {
      return false;
    }
    const mediaType = item.mediaType || item.media_type;
    if (filters.media_type && filters.media_type !== 'all' && mediaType !== filters.media_type) {
      return false;
    }
    const phaseId = item.phaseId || item.phase_id;
    if (filters.phase_id && filters.phase_id !== 'all' && phaseId !== filters.phase_id) {
      return false;
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (item.name || '').toLowerCase().includes(searchLower) || 
             (item.description || '').toLowerCase().includes(searchLower);
    }
    return true;
  });
};

const categorizeItems = (items: MediaItem[]) => ({
  profileImages: items.filter(item => item.category === 'profile'),
  inspirationImages: items.filter(item => item.category === 'inspiration'),
  progressImages: items.filter(item => item.category === 'progress' || item.category === 'progress_video'),
  documents: items.filter(item => item.media_type === 'DOCUMENT')
});

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useMedia(projectId: string, options: { filters?: MediaFilters; enabled?: boolean } = {}) {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();
  const activityTracker = useActivityTracker({ projectId });
  const [filters, setFilters] = useState<MediaFilters>(options.filters || {});

  // Main query for project media
  const mediaQuery = useQuery({
    queryKey: queryKeys.documents.byProject(projectId),
    queryFn: () => MediaService.getProjectMedia(projectId),
    enabled: options.enabled !== false && !!projectId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false
  });

  // Processed data with filtering and categorization
  const processedData = useMemo(() => {
    const allItems = mediaQuery.data || [];
    const filteredItems = applyFilters(allItems, filters);
    const stats = calculateStats(allItems);
    const categorized = categorizeItems(allItems);

    return {
      items: filteredItems,
      allItems,
      stats,
      ...categorized
    };
  }, [mediaQuery.data, filters]);

  // Upload mutation with activity tracking
  const uploadMutation = useMutation({
    mutationFn: async ({ files, options: uploadOptions }: { files: File[]; options?: UploadOptions }) => {
      if (!user) throw new Error('User must be authenticated');
      
      const category = uploadOptions?.category || 'other';
      const context = {
        projectId,
        type: category,
        phaseId: uploadOptions?.phase_id,
        userId: user.id,
        name: uploadOptions?.name,
        description: uploadOptions?.description
      };

      const results = await MediaService.uploadBatch(files, context, uploadOptions?.onProgress);
      
      // Filter successful uploads
      const successful = results.filter(result => result.success && result.mediaItem);
      const failed = results.filter(result => !result.success);

      if (failed.length > 0) {
        toast.error(`${failed.length} file(s) failed to upload`);
      }

      return successful.map(result => result.mediaItem!);
    },
    onSuccess: async (uploadedItems, { options: uploadOptions }) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.byProject(projectId) });
      
      if (uploadOptions?.phase_id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.documents.byPhase(uploadOptions.phase_id) });
      }

      // Track activity for each successful upload
      for (const item of uploadedItems) {
        await activityTracker.trackDocumentUpload(
          item.id,
          item.name,
          item.category
        );
      }

      toast.success(`Successfully uploaded ${uploadedItems.length} file${uploadedItems.length > 1 ? 's' : ''}`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    }
  });

  // Delete mutation with optimistic update and activity tracking
  const deleteMutation = useMutation({
    mutationFn: async (mediaId: string) => {
      const mediaItem = processedData.allItems.find(item => item.id === mediaId);
      if (!mediaItem) throw new Error('Media item not found');
      
      await MediaService.delete(mediaId);
      return mediaItem;
    },
    onMutate: async (mediaId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.documents.byProject(projectId) });
      const previousData = queryClient.getQueryData(queryKeys.documents.byProject(projectId));
      
      queryClient.setQueryData(
        queryKeys.documents.byProject(projectId),
        (old: MediaItem[] = []) => old.filter(item => item.id !== mediaId)
      );
      
      return { previousData };
    },
    onSuccess: async (deletedItem) => {
      // Track delete activity
      await activityTracker.trackDocumentDelete(deletedItem.name);
      toast.success('File deleted successfully');
    },
    onError: (error, _mediaId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.documents.byProject(projectId), context.previousData);
      }
      toast.error(error instanceof Error ? error.message : 'Delete failed');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.byProject(projectId) });
    }
  });

  // Update mutation with activity tracking
  const updateMutation = useMutation({
    mutationFn: ({ mediaId, updates }: { 
      mediaId: string; 
      updates: Partial<Pick<MediaItem, 'name' | 'description' | 'category' | 'metadata'>> 
    }) => MediaService.update(mediaId, updates),
    onSuccess: async (updatedItem, { updates }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.byProject(projectId) });
      
      // Track update activity
      await activityTracker.trackActivity(
        'project_update',
        'Document updated',
        `Document "${updatedItem.name}" was updated`,
        {
          entityType: 'document',
          entityId: updatedItem.id,
          metadata: { updates }
        }
      );

      toast.success('File updated successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Update failed');
    }
  });

  // Utility functions
  const getDownloadUrl = useCallback((mediaId: string) => MediaService.getUrl(mediaId), []);
  
  const updateFilters = useCallback((newFilters: Partial<MediaFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  return {
    // Data
    items: processedData.items,
    allItems: processedData.allItems,
    stats: processedData.stats,
    isLoading: mediaQuery.isLoading,
    error: mediaQuery.error,

    // Categorized data
    profileImages: processedData.profileImages,
    inspirationImages: processedData.inspirationImages,
    progressImages: processedData.progressImages,
    documents: processedData.documents,

    // Operations
    upload: uploadMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    update: updateMutation.mutateAsync,

    // Operation states
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isUpdating: updateMutation.isPending,

    // Filters
    filters,
    setFilters: updateFilters,

    // Utilities
    getDownloadUrl,
    refetch: mediaQuery.refetch
  };
}

// ============================================================================
// SPECIALIZED HOOKS
// ============================================================================

export function useProjectDocuments(projectId: string) {
  return useQuery({
    queryKey: queryKeys.documents.byProject(projectId),
    queryFn: () => MediaService.getProjectDocuments(projectId),
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000
  });
}

export function usePhaseDocuments(phaseId: string) {
  return useQuery({
    queryKey: queryKeys.documents.byPhase(phaseId),
    queryFn: () => MediaService.getPhaseDocuments(phaseId),
    enabled: !!phaseId,
    staleTime: 2 * 60 * 1000
  });
}

export function useMediaByCategory(projectId: string, category: MediaCategory) {
  return useMedia(projectId, { filters: { category } });
}

export function useMediaByPhase(projectId: string, phase_id: string) {
  return useMedia(projectId, { filters: { phase_id } });
}

export function useProfileImage(projectId: string) {
  const result = useMediaByCategory(projectId, 'profile');
  return {
    ...result,
    profileImage: result.profileImages[0] || null
  };
}