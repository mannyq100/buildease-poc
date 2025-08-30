/**
 * Unified Project Media Hook
 * Single source of truth for fetching all project media from be_document table
 * Replaces multiple media data hooks with centralized approach
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryClient';
import type { MediaItem, MediaCategory } from './useMediaOperations';
import type { Document } from '@/types/database';

interface UseProjectMediaOptions {
  projectId: string;
  category?: MediaCategory;
  phaseId?: string;
  enabled?: boolean;
}

interface UseProjectMediaResult {
  data: MediaItem[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  
  // Categorized data for easy UI consumption
  profileImages: MediaItem[];
  inspirationImages: MediaItem[];
  progressImages: MediaItem[];
  documents: MediaItem[];
}

/**
 * Transform document record to MediaItem
 */
function transformDocumentToMediaItem(doc: Document): MediaItem {
  return {
    id: doc.id,
    projectId: doc.project_id,
    phaseId: doc.phase_id || undefined,
    category: getCategoryFromDocument(doc),
    fileName: doc.file_name,
    fileSize: doc.file_size || 0,
    fileType: doc.mime_type || 'application/octet-stream',
    filePath: doc.file_path,
    publicUrl: doc.file_path, // Will be transformed to public URL if needed
    uploadedBy: doc.uploaded_by || '',
    createdAt: doc.created_at,
    updatedAt: doc.updated_at,
    metadata: {
      documentType: doc.document_type,
      description: doc.description,
      tags: doc.tags || []
    }
  };
}

/**
 * Determine media category from document record
 */
function getCategoryFromDocument(doc: Document): MediaCategory {
  // Check tags first for explicit category
  if (doc.tags?.includes('profile_image') || doc.tags?.includes('profile')) {
    return 'profile_image';
  }
  if (doc.tags?.includes('inspiration_image') || doc.tags?.includes('inspiration')) {
    return 'inspiration_image';
  }
  if (doc.tags?.includes('progress_image') || doc.tags?.includes('progress')) {
    return 'progress_image';
  }
  
  // Check description for category hints
  if (doc.description?.toLowerCase().includes('profile')) {
    return 'profile_image';
  }
  if (doc.description?.toLowerCase().includes('inspiration')) {
    return 'inspiration_image';
  }
  if (doc.description?.toLowerCase().includes('progress')) {
    return 'progress_image';
  }
  
  // Default to document for non-image types or unknown categories
  return 'document';
}

/**
 * Unified hook for fetching all project media
 */
export function useProjectMedia({ 
  projectId, 
  category, 
  phaseId, 
  enabled = true 
}: UseProjectMediaOptions): UseProjectMediaResult {
  const queryResult = useQuery({
    queryKey: phaseId 
      ? [...queryKeys.documents.byPhase(phaseId), 'category', category] 
      : [...queryKeys.documents.byProject(projectId), 'category', category],
    queryFn: async (): Promise<MediaItem[]> => {
      let query = supabase
        .from('be_document')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      // Apply filters if provided
      if (phaseId) {
        query = query.eq('phase_id', phaseId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch project media: ${error.message}`);
      }

      // Transform documents to MediaItems
      const mediaItems = (data || []).map(transformDocumentToMediaItem);

      // Filter by category if specified
      if (category) {
        return mediaItems.filter(item => item.category === category);
      }

      return mediaItems;
    },
    enabled: enabled && !!projectId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Categorize media items for easy consumption
  const mediaItems = queryResult.data || [];
  const profileImages = mediaItems.filter(item => item.category === 'profile_image');
  const inspirationImages = mediaItems.filter(item => item.category === 'inspiration_image');
  const progressImages = mediaItems.filter(item => item.category === 'progress_image');
  const documents = mediaItems.filter(item => item.category === 'document');

  return {
    data: mediaItems,
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch,
    profileImages,
    inspirationImages,
    progressImages,
    documents
  };
}

/**
 * Hook for fetching specific category of media
 */
export function useProjectMediaByCategory(projectId: string, category: MediaCategory) {
  return useProjectMedia({ projectId, category });
}

/**
 * Hook for fetching media by phase
 */
export function useProjectMediaByPhase(projectId: string, phaseId: string) {
  return useProjectMedia({ projectId, phaseId });
}

/**
 * Hook for fetching profile images only
 */
export function useProjectProfileImages(projectId: string) {
  const result = useProjectMedia({ projectId, category: 'profile_image' });
  return {
    ...result,
    profileImage: result.profileImages[0] || null // Return single profile image
  };
}

/**
 * Hook for fetching inspiration images only
 */
export function useProjectInspirationImages(projectId: string) {
  return useProjectMedia({ projectId, category: 'inspiration_image' });
}

/**
 * Hook for fetching progress images only
 */
export function useProjectProgressImages(projectId: string) {
  return useProjectMedia({ projectId, category: 'progress_image' });
}

/**
 * Hook for fetching documents only (non-image files)
 */
export function useProjectDocumentsOnly(projectId: string) {
  return useProjectMedia({ projectId, category: 'document' });
}
