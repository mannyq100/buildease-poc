/**
 * Media Operations Hook
 * Single source of truth for all media operations in BuildEase
 * REFACTORED: All media (documents + images) stored in be_document table
 */

import { useCallback } from 'react';
import { useCreateDocument, useDeleteDocument, useUpdateDocumentMetadata } from '@/hooks/mutations/useDocumentMutations';
import { useProjectDocuments } from '@/hooks/queries/useDocuments';
import { getDocumentTypeFromFilename } from '@/services/storageService';
import type { Project } from '@/types/project';
import type { UploadResult } from '@/types/upload';

// Utility function to validate UUID fields
const validateUUID = (value?: string): string | undefined => {
  if (!value || typeof value !== 'string' || value.trim() === '') {
    return undefined;
  }
  
  // Basic UUID format validation (optional, for extra safety)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(value.trim())) {
    console.warn('Invalid UUID format provided:', value);
    return undefined;
  }
  
  return value.trim();
};

// Media categories for centralized storage
export type MediaCategory = 'profile_image' | 'inspiration_image' | 'progress_image' | 'document';

// Unified media item interface
export interface MediaItem {
  id: string;
  projectId: string;
  phaseId?: string;
  category: MediaCategory;
  fileName: string;
  fileSize: number;
  fileType: string;
  filePath: string;
  publicUrl?: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

interface MediaOperationsOptions {
  projectId: string;
  onProjectUpdate?: (updates: Partial<Project>) => void;
}

export interface MediaOperations {
  // Unified document operations (handles both documents and images)
  documents: {
    create: ReturnType<typeof useCreateDocument>;
    delete: ReturnType<typeof useDeleteDocument>;
    updateMetadata: ReturnType<typeof useUpdateDocumentMetadata>;
    query: ReturnType<typeof useProjectDocuments>;
  };
  
  // Upload utilities for all media types
  upload: {
    uploadMedia: (results: UploadResult[], category: MediaCategory, phaseId?: string) => Promise<void>;
    uploadImages: (results: UploadResult[], type: 'inspiration' | 'progress' | 'profile') => Promise<void>;
    uploadDocuments: (results: UploadResult[], phaseId?: string) => Promise<void>;
  };
  
  // Media-specific operations (using document system)
  media: {
    delete: (documentId: string) => Promise<void>;
    setAsProfile: (documentId: string) => Promise<void>;
    updateCategory: (documentId: string, category: MediaCategory) => Promise<void>;
  };
}

/**
 * Consolidated hook for all media operations
 * REFACTORED: Uses unified be_document table for all media types
 */
export function useMediaOperations({ 
  projectId, 
  onProjectUpdate: _onProjectUpdate 
}: MediaOperationsOptions): MediaOperations {
  // Unified document mutations for all media types
  const createDocument = useCreateDocument();
  const deleteDocument = useDeleteDocument();
  const updateDocumentMetadata = useUpdateDocumentMetadata();
  const projectDocuments = useProjectDocuments(projectId);
  
  // Helper function to get MIME type from file name
  const getMimeTypeFromFileName = useCallback((fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    const mimeTypeMap: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg', 
      'png': 'image/png',
      'webp': 'image/webp',
      'heic': 'image/heic',
      'gif': 'image/gif',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'txt': 'text/plain',
      'csv': 'text/csv'
    };
    return mimeTypeMap[extension] || 'application/octet-stream';
  }, []);

  // Unified media upload handler
  const handleMediaUpload = useCallback(async (results: UploadResult[], category: MediaCategory, phaseId?: string) => {
    try {
      // Validate UUID fields - convert empty strings to undefined (which becomes null in DB)
      const validatedPhaseId = validateUUID(phaseId);
      
      const promises = results.map(result => 
        createDocument.mutateAsync({
          project_id: projectId,
          phase_id: validatedPhaseId,
          category: category, // ✅ Move category to top-level field (required NOT NULL)
          name: result.name,
          file_path: result.url,
          file_size: result.size,
          mime_type: getMimeTypeFromFileName(result.name), // Use file extension to determine MIME type
          document_type: category === 'document' ? getDocumentTypeFromFilename(result.name) : 'PHOTO',
          metadata: {
            uploadedAt: new Date().toISOString()
          }
        })
      );
      
      await Promise.all(promises);
    } catch (error) {
      console.error(`Failed to upload ${category} media:`, error);
      throw error;
    }
  }, [createDocument, projectId, getMimeTypeFromFileName]);

  // Upload handler for images - now creates document entries
  const handleImageUpload = useCallback(async (results: UploadResult[], type: 'inspiration' | 'progress' | 'profile') => {
    const categoryMap: Record<typeof type, MediaCategory> = {
      inspiration: 'inspiration_image',
      progress: 'progress_image',
      profile: 'profile_image'
    };
    
    await handleMediaUpload(results, categoryMap[type]);
  }, [handleMediaUpload]);
  
  // Upload handler for documents
  const handleDocumentUpload = useCallback(async (results: UploadResult[], phaseId?: string) => {
    await handleMediaUpload(results, 'document', phaseId);
  }, [handleMediaUpload]);
  
  // Media-specific operations using document system
  const handleMediaDelete = useCallback(async (documentId: string) => {
    await deleteDocument.mutateAsync(documentId);
  }, [deleteDocument]);
  
  const handleSetAsProfile = useCallback(async (documentId: string) => {
    // Update document type and description to mark as profile image
    await updateDocumentMetadata.mutateAsync({
      documentId,
      metadata: {
        document_type: 'PHOTO',
        description: 'Profile Image',
        tags: ['profile', 'profile_image']
      }
    });
  }, [updateDocumentMetadata]);

  const handleUpdateCategory = useCallback(async (documentId: string, category: MediaCategory) => {
    // Update tags to reflect the new category
    const categoryTags = [category];
    await updateDocumentMetadata.mutateAsync({
      documentId,
      metadata: {
        tags: categoryTags
      }
    });
  }, [updateDocumentMetadata]);

  return {
    documents: {
      create: createDocument,
      delete: deleteDocument,
      updateMetadata: updateDocumentMetadata,
      query: projectDocuments
    },
    upload: {
      uploadMedia: handleMediaUpload,
      uploadImages: handleImageUpload,
      uploadDocuments: handleDocumentUpload
    },
    media: {
      delete: handleMediaDelete,
      setAsProfile: handleSetAsProfile,
      updateCategory: handleUpdateCategory
    }
  };
}

/**
 * Hook for unified media operations
 * All media types now stored in be_document table
 */
export function useUnifiedMediaOperations(projectId: string) {
  return useMediaOperations({ projectId });
}

/**
 * Hook for document-only operations
 * Use this when you only need document management
 */
export function useDocumentOperations(projectId: string) {
  const media = useMediaOperations({ projectId });
  return media.documents;
}
