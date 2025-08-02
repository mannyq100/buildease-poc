/**
 * Optimized data processing hooks for media management
 * Implements granular memoization and Set-based deduplication
 */

import { useMemo } from 'react';
import { MediaItem, MediaCategory } from '../types';
import { Project } from '@/types/project';
import { getDocumentTypeDisplayName, type DocumentType } from '@/services/documentService';

// Type definitions for external data
interface DocumentItem {
  id: string;
  name: string;
  file_path: string;
  document_type?: string;
  file_size?: number;
  created_at: string;
}

interface ProgressImageItem {
  id: string;
  name: string;
  url: string;
  createdAt: string;
}

interface UseMediaDataProps {
  project: Project;
  documents: DocumentItem[];
  progressImages: ProgressImageItem[];
}

/**
 * Hook for processing profile images with memoization
 */
export const useProfileImages = (project: Project): MediaItem[] => {
  return useMemo(() => {
    if (!project.profile_image) return [];
    
    return [{
      id: `profile-${project.profile_image}`,
      name: 'Profile Image',
      url: project.profile_image,
      type: 'image' as const,
      category: 'profile' as const,
      createdAt: project.created_at || new Date().toISOString()
    }];
  }, [project.profile_image, project.created_at]);
};

/**
 * Hook for processing inspiration images with memoization
 */
export const useInspirationImages = (project: Project): MediaItem[] => {
  return useMemo(() => {
    if (!project.inspiration_images?.length) return [];
    
    return project.inspiration_images.map((url, index) => ({
      id: `inspiration-${index}`,
      name: `Inspiration ${index + 1}`,
      url,
      type: 'image' as const,
      category: 'inspiration' as const,
      createdAt: project.created_at || new Date().toISOString()
    }));
  }, [project.inspiration_images, project.created_at]);
};

/**
 * Hook for processing progress images - DUAL SOURCE: Database Primary + Storage Fallback
 * Progress images are now stored in BOTH database (project.progress_images) AND Supabase storage
 * Database is primary source for consistency with other image types
 */
export const useProgressImages = (project: Project, storageImages: ProgressImageItem[]): MediaItem[] => {
  return useMemo(() => {
    // Primary source: database progress_images array (consistent with inspiration images)
    const databaseImages = (project.progress_images || []).map((url, index) => {
      // Extract filename from URL for consistent naming
      const fileName = url.split('/').pop() || `progress-${index + 1}`;
      return {
        id: `progress-db-${index}`,
        url,
        type: 'image' as const,
        name: fileName,
        category: 'progress' as const,
        createdAt: project.updated_at || project.created_at || new Date().toISOString()
      };
    });
    
    // Fallback source: storage images (for backwards compatibility)
    const storageOnlyImages = storageImages
      .filter(storageImage => {
        // Only include storage images that aren't already in database
        return !databaseImages.some(dbImage => dbImage.url === storageImage.url);
      })
      .map(storageImage => ({
        id: storageImage.id,
        url: storageImage.url,
        type: 'image' as const,
        name: storageImage.name,
        category: 'progress' as const,
        createdAt: storageImage.createdAt
      }));
    
    // Combine database images (primary) with storage-only images (fallback)
    return [...databaseImages, ...storageOnlyImages];
  }, [project.progress_images, project.updated_at, project.created_at, storageImages]);
};

/**
 * Hook for processing document items with memoization
 */
export const useDocumentItems = (documents: DocumentItem[]): MediaItem[] => {
  return useMemo(() => {
    return documents.map(doc => ({
      id: doc.id,
      name: doc.name,
      url: doc.file_path,
      type: 'document' as const,
      category: (doc.document_type ? getDocumentTypeDisplayName(doc.document_type as DocumentType) : 'other') as MediaCategory,
      size: doc.file_size || undefined,
      createdAt: doc.created_at
    }));
  }, [documents]);
};

/**
 * Main hook that combines all media items with optimized processing
 */
export const useAllMediaItems = ({ project, documents, progressImages }: UseMediaDataProps): MediaItem[] => {
  const profileImages = useProfileImages(project);
  const inspirationImages = useInspirationImages(project);
  const processedProgressImages = useProgressImages(project, progressImages); // Dual source: database primary + storage fallback
  const documentItems = useDocumentItems(documents);

  return useMemo(() => [
    ...profileImages,
    ...inspirationImages,
    ...processedProgressImages,
    ...documentItems
  ], [profileImages, inspirationImages, processedProgressImages, documentItems]);
};


