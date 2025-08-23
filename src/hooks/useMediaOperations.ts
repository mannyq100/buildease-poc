/**
 * Media Operations Hook
 * Single source of truth for all media operations in BuildEase
 * Combines upload, image management, and document operations
 */

import { useCallback } from 'react';
import { useUploadImages, useDeleteImage, useSetProfileImage } from '@/hooks/mutations/useImageMutations';
import { useCreateDocument, useDeleteDocument, useUpdateDocumentMetadata } from '@/hooks/mutations/useDocumentMutations';
import { useProjectStorageImages } from '@/hooks/useProjectStorageImages';
import { useProjectDocuments } from '@/hooks/queries/useDocuments';
import type { Project } from '@/types/project';

interface MediaOperationsOptions {
  projectId: string;
  onProjectUpdate?: (updates: Partial<Project>) => void;
}

export interface MediaOperations {
  // Image operations
  images: {
    upload: ReturnType<typeof useUploadImages>;
    delete: ReturnType<typeof useDeleteImage>;
    setProfile: ReturnType<typeof useSetProfileImage>;
    query: ReturnType<typeof useProjectStorageImages>;
  };
  
  // Document operations
  documents: {
    create: ReturnType<typeof useCreateDocument>;
    delete: ReturnType<typeof useDeleteDocument>;
    updateMetadata: ReturnType<typeof useUpdateDocumentMetadata>;
    query: ReturnType<typeof useProjectDocuments>;
  };
  
  // Upload utilities
  upload: {
    uploadImages: (results: UploadResult[], type: 'inspiration' | 'progress') => Promise<void>;
    uploadDocuments: (results: UploadResult[]) => Promise<void>;
  };
}

/**
 * Consolidated hook for all media operations
 * Provides a single interface for upload, image, and document management
 */
export function useMediaOperations({ 
  projectId, 
  onProjectUpdate: _onProjectUpdate 
}: MediaOperationsOptions): MediaOperations {
  
  // Image mutations
  const uploadImages = useUploadImages();
  const deleteImage = useDeleteImage();
  const setProfileImage = useSetProfileImage();
  const projectImages = useProjectStorageImages(projectId, 'progress-images', 'progress');
  
  // Document mutations
  const createDocument = useCreateDocument();
  const deleteDocument = useDeleteDocument();
  const updateDocumentMetadata = useUpdateDocumentMetadata();
  const projectDocuments = useProjectDocuments(projectId);
  
  // Upload handler for images
  const handleImageUpload = useCallback(async (results: UploadResult[], type: 'inspiration' | 'progress') => {
    try {
      uploadImages.mutate({
        projectId,
        results,
        imageType: type
      });
    } catch (error) {
      console.error(`Failed to upload ${type} images:`, error);
      throw error;
    }
  }, [uploadImages, projectId]);
  
  // Upload handler for documents
  const handleDocumentUpload = useCallback(async (results: UploadResult[]) => {
    try {
      for (const result of results) {
        await createDocument.mutateAsync({
          project_id: projectId,
          name: result.name,
          file_path: result.url,
          file_size: result.size,
          document_type: 'OTHER',
          metadata: {}
        });
      }
    } catch (error) {
      console.error('Failed to upload documents:', error);
      throw error;
    }
  }, [createDocument, projectId]);
  
  return {
    images: {
      upload: uploadImages,
      delete: deleteImage,
      setProfile: setProfileImage,
      query: projectImages
    },
    documents: {
      create: createDocument,
      delete: deleteDocument,
      updateMetadata: updateDocumentMetadata,
      query: projectDocuments
    },
    upload: {
      uploadImages: handleImageUpload,
      uploadDocuments: handleDocumentUpload
    }
  };
}

/**
 * Simplified hook for basic media operations
 * Use this when you only need basic upload functionality
 */
export function useBasicMediaOperations(projectId: string, uploadType: 'documents') {
  const media = useMediaOperations({ projectId });
  return media.utils.createUploadHook(uploadType);
}

/**
 * Hook for image-only operations
 * Use this when you only need image management
 */
export function useImageOperations(projectId: string) {
  const media = useMediaOperations({ projectId });
  return media.images;
}

/**
 * Hook for document-only operations
 * Use this when you only need document management
 */
export function useDocumentOperations(projectId: string) {
  const media = useMediaOperations({ projectId });
  return media.documents;
}
