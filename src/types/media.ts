/**
 * Unified Media Type Definitions - Phase 1.2
 * Single source of truth for all media-related types
 * Consolidates duplicate interfaces from multiple files
 */

export interface MediaItem {
  id: string;
  name: string;
  description?: string;
  media_type: 'PHOTO' | 'VIDEO' | 'DOCUMENT';
  category: 'profile' | 'inspiration' | 'progress' | 'progress_video' | 'receipt' | 'report' | 'contract' | 'permit' | 'invoice' | 'blueprint' | 'other';
  project_id: string;
  phase_id?: string;
  file_path: string;
  file_size_bytes: number;
  mime_type: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type MediaCategory = 'profile' | 'inspiration' | 'progress' | 'progress_video' | 'receipt' | 'report' | 'contract' | 'permit' | 'invoice' | 'blueprint' | 'other';

export type MediaType = 'PHOTO' | 'VIDEO' | 'DOCUMENT';

/**
 * Transform database Document record to unified MediaItem
 * Maps be_media_items table structure to consistent interface
 */
export function transformDbDocumentToMediaItem(doc: {
  id: string;
  name: string;
  description?: string;
  media_type: string;
  category: string;
  project_id: string;
  phase_id?: string;
  file_path: string;
  file_size_bytes?: number;
  mime_type?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}): MediaItem {
  return {
    id: doc.id,
    name: doc.name,
    description: doc.description,
    media_type: doc.media_type as MediaType,
    category: doc.category as MediaCategory,
    project_id: doc.project_id,
    phase_id: doc.phase_id,
    file_path: doc.file_path,
    file_size_bytes: doc.file_size_bytes || 0,
    mime_type: doc.mime_type || 'application/octet-stream',
    metadata: doc.metadata || {},
    created_at: doc.created_at,
    updated_at: doc.updated_at,
  };
}

/**
 * Get media category from document metadata or tags
 */
export function getCategoryFromDocument(doc: {
  category?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}): MediaCategory {
  const validCategories: MediaCategory[] = ['profile', 'inspiration', 'progress', 'progress_video', 'receipt', 'report', 'contract', 'permit', 'invoice', 'blueprint', 'other'];
  
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
  
  // Default to other for documents
  return 'other';
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