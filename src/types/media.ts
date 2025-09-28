/**
 * Media Types for BuildEase Construction Management
 * 
 * Clean architecture with:
 * - Type-safe category system
 * - Relative storage paths (no URL coupling)  
 * - Consistent field naming across components
 */

import type { MediaCategory } from '@/types/database';

export interface MediaItem {
  // Core fields
  id: string;
  name: string;
  description?: string;
  category: MediaCategory;
  mediaType: 'PHOTO' | 'VIDEO' | 'DOCUMENT';
  projectId?: string | null; // NULL for user profiles
  phaseId?: string;
  
  // Storage fields (relative paths only)
  storagePath: string;    // e.g., "user/123/avatar.jpg"
  bucketName: string;     // e.g., "profiles", "PHOTO", "VIDEO", "DOCUMENT"
  
  // File metadata
  fileSize: number;       // Size in bytes
  mimeType: string;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
  
  // Computed properties (generated on-demand)
  url?: string;
  thumbnailUrl?: string;
  
  // Database compatibility fields
  media_type?: 'PHOTO' | 'VIDEO' | 'DOCUMENT';
  project_id?: string | null;
  phase_id?: string;
  file_path?: string;     // Same as storagePath
  file_size_bytes?: number;
  mime_type?: string;
  created_at?: string;
  updated_at?: string;
}

export type MediaType = 'PHOTO' | 'VIDEO' | 'DOCUMENT';


/**
 * Get media category from document metadata or tags
 */
export function getCategoryFromDocument(doc: {
  category?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}): MediaCategory {
  const validCategories: MediaCategory[] = ['profile', 'inspiration', 'progress', 'progress_video', 'receipt', 'report', 'contract', 'permit', 'invoice', 'specification', 'schedule', 'drawing', 'manual', 'certificate', 'other_document'];
  
  // Direct category match
  if (doc.category && validCategories.includes(doc.category as MediaCategory)) {
    return doc.category as MediaCategory;
  }
  
  // Check tags for category  
  if (doc.tags?.includes('profile') || doc.tags?.includes('profile_image')) {
    return 'profile';
  }
  if (doc.tags?.includes('inspiration') || doc.tags?.includes('inspiration_image')) {
    return 'inspiration';
  }
  if (doc.tags?.includes('progress') || doc.tags?.includes('progress_image')) {
    return 'progress'; // Default to progress for legacy progress tags
  }
  if (doc.tags?.includes('progress_video') || doc.tags?.includes('video')) {
    return 'progress_video';
  }
  
  // Check metadata for category hints
  if (doc.metadata?.category) {
    const metaCategory = doc.metadata.category;
    if (validCategories.includes(metaCategory as MediaCategory)) {
      return metaCategory as MediaCategory;
    }
  }
  
  // Default to other_document for documents
  return 'other_document';
}

/**
 * File upload result interface
 */
export interface UploadResult {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
  success: boolean;
  error?: string;
}

/**
 * Upload options interface
 */
export interface UploadOptions {
  maxFiles?: number;
  maxFileSize?: number;
  acceptedFileTypes?: string[];
  category?: MediaCategory;
  projectId?: string;
  phaseId?: string;
  onProgress?: (progress: number) => void;
  onComplete?: (results: UploadResult[]) => void;
  onError?: (error: string) => void;
}