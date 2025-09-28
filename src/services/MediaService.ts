/**
 * MediaService - Clean Architecture for BuildEase Media Management
 * 
 * Key Features:
 * - Unified profiles bucket for user and project profile images
 * - Relative storage paths in database (no URL coupling)
 * - Type-safe category system aligned with database constraints
 * - Optimized for mobile-first construction site usage
 */

import { supabase } from '@/lib/supabase';
import type { MediaCategory } from '@/types/database';
import type { MediaItem } from '@/types/media';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface MediaContext {
  projectId?: string | null; // Can be null for user profile images
  type: MediaCategory;
  phaseId?: string;
  userId?: string;
  name?: string;
  description?: string;
}

export interface UploadResult {
  success: boolean;
  mediaItem?: MediaItem;
  error?: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/** File size limits by media type for better UX */
const FILE_SIZE_LIMITS = {
  PHOTO: 25, // MB - Optimized for mobile uploads
  VIDEO: 100, // MB - Construction site videos
  DOCUMENT: 50 // MB - Plans, contracts, etc.
} as const;

/** URL expiration times by media type */
const URL_EXPIRY_TIMES = {
  PHOTO: 24 * 60 * 60, // 24 hours
  VIDEO: 48 * 60 * 60, // 48 hours
  DOCUMENT: 72 * 60 * 60, // 72 hours
  DEFAULT: 24 * 60 * 60 // 24 hours
} as const;

/** Storage Configuration - Clean Architecture */
const STORAGE_CONFIG = {
  buckets: {
    profiles: 'profiles',    // Public bucket for all profile images
    photos: 'PHOTO',         // Private bucket for project photos  
    videos: 'VIDEO',         // Private bucket for videos
    documents: 'DOCUMENT'    // Private bucket for documents
  },
  
  paths: {
    userProfile: (userId: string) => `user/${userId}`,
    projectProfile: (projectId: string) => `project/${projectId}`,
    projectMedia: (projectId: string, category: string) => `${projectId}/${category}`
  }
} as const;

/** MIME type validation aligned with bucket constraints */
const SUPPORTED_TYPES = {
  PHOTO: new Set([
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/tiff'
  ]),
  VIDEO: new Set([
    'video/mp4', 'video/webm', 'video/quicktime', 'video/mov'
  ]),
  DOCUMENT: new Set([
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/msword',
    'application/vnd.ms-excel'
  ])
} as const;

/** Performance optimization: Cache user ID for 5 minutes */
let cachedUserId: string | null = null;
let userCacheExpiry = 0;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get current user ID with performance caching
 */
const getCurrentUserId = async (): Promise<string | null> => {
  const now = Date.now();
  
  if (cachedUserId && now < userCacheExpiry) {
    return cachedUserId;
  }
  
  const { data: { user } } = await supabase.auth.getUser();
  cachedUserId = user?.id || null;
  userCacheExpiry = now + 300000; // 5 minutes
  
  return cachedUserId;
};

/**
 * Generate collision-resistant file names
 */
const generateFileName = (originalName: string | undefined): string => {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  
  if (!originalName || typeof originalName !== 'string') {
    return `file_${timestamp}_${randomSuffix}`;
  }
  
  const extension = originalName.split('.').pop()?.toLowerCase() || '';
  const baseName = originalName
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 30)
    .replace(/^_+|_+$/g, '') || 'file';
  
  return extension ? `${baseName}_${timestamp}_${randomSuffix}.${extension}` : `${baseName}_${timestamp}_${randomSuffix}`;
};

/**
 * Enhanced media type detection
 */
const getMediaTypeFromFile = (file: File): 'PHOTO' | 'VIDEO' | 'DOCUMENT' => {
  const fileType = (file.type || '').toLowerCase().trim();
  
  if (fileType) {
    if (fileType.startsWith('image/')) return 'PHOTO';
    if (fileType.startsWith('video/')) return 'VIDEO';
    if (fileType.startsWith('application/') || fileType.startsWith('text/')) return 'DOCUMENT';
  }
  
  // Fallback: Use file extension
  if (file.name) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension) {
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      const videoExtensions = ['mp4', 'mov', 'webm'];
      const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'];
      
      if (imageExtensions.includes(extension)) return 'PHOTO';
      if (videoExtensions.includes(extension)) return 'VIDEO';
      if (documentExtensions.includes(extension)) return 'DOCUMENT';
    }
  }
  
  return 'DOCUMENT';
};

/**
 * Get media type from category
 */
const getMediaTypeFromCategory = (category: MediaCategory): 'PHOTO' | 'VIDEO' | 'DOCUMENT' => {
  if (category === 'progress_video') return 'VIDEO';
  if (['profile', 'inspiration', 'progress'].includes(category)) return 'PHOTO';
  return 'DOCUMENT';
};

/**
 * Get storage bucket based on category and context
 */
const getStorageBucket = (category: MediaCategory, isProfile = false): string => {
  if (category === 'profile' || isProfile) {
    return STORAGE_CONFIG.buckets.profiles;
  }
  
  const mediaType = getMediaTypeFromCategory(category);
  switch (mediaType) {
    case 'PHOTO': return STORAGE_CONFIG.buckets.photos;
    case 'VIDEO': return STORAGE_CONFIG.buckets.videos;
    case 'DOCUMENT': return STORAGE_CONFIG.buckets.documents;
    default: return STORAGE_CONFIG.buckets.documents;
  }
};

/**
 * Generate file path based on context
 */
const generateFilePath = (file: File, context: MediaContext, userId: string): string => {
  const fileName = generateFileName(file.name);
  
  // Profile images (user or project) go to profiles bucket
  if (context.type === 'profile') {
    if (context.projectId && context.projectId !== 'profile') {
      // Project profile image
      return STORAGE_CONFIG.paths.projectProfile(context.projectId) + '/' + fileName;
    } else {
      // User profile image - don't use projectId for user profiles
      return STORAGE_CONFIG.paths.userProfile(userId) + '/' + fileName;
    }
  }
  
  // All other media goes to type-specific buckets
  if (!context.projectId) {
    throw new Error('Project ID is required for non-profile media');
  }
  
  return STORAGE_CONFIG.paths.projectMedia(context.projectId, context.type) + '/' + fileName;
};

/**
 * Validate file type against supported types
 */
const isValidFileType = (file: File, mediaType: keyof typeof SUPPORTED_TYPES): boolean => {
  const normalizedType = (file.type || '').toLowerCase().trim();
  
  // If MIME type is missing, try to infer from file extension
  if (!normalizedType && file.name) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension) {
      const extensionToMimeType: Record<string, string> = {
        'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'webp': 'image/webp',
        'mp4': 'video/mp4', 'mov': 'video/quicktime', 'webm': 'video/webm',
        'pdf': 'application/pdf', 'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'txt': 'text/plain'
      };
      
      const inferredMimeType = extensionToMimeType[extension];
      if (inferredMimeType) {
        return SUPPORTED_TYPES[mediaType].has(inferredMimeType);
      }
    }
  }
  
  return SUPPORTED_TYPES[mediaType].has(normalizedType);
};

// ============================================================================
// MEDIASERVICE CLASS
// ============================================================================

export class MediaService {
  /**
   * Enhanced file validation
   */
  static validateFiles(files: File[] | FileList): { isValid: boolean; error?: string; warnings?: string[] } {
    const fileArray = Array.isArray(files) ? files : Array.from(files);
    const warnings: string[] = [];
    
    if (fileArray.length === 0) {
      return { isValid: false, error: 'No files provided' };
    }
    
    // Check total batch size
    const totalSize = fileArray.reduce((sum, file) => sum + file.size, 0);
    const totalSizeMB = totalSize / (1024 * 1024);
    
    if (totalSizeMB > 500) {
      return {
        isValid: false,
        error: `Total batch size (${totalSizeMB.toFixed(1)}MB) exceeds 500MB limit`
      };
    }
    
    for (const file of fileArray) {
      if (!file.name || file.name.trim() === '') {
        return { isValid: false, error: 'All files must have valid names' };
      }
      
      if (file.size === 0) {
        return { isValid: false, error: `File "${file.name}" is empty (0 bytes)` };
      }
      
      const mediaType = getMediaTypeFromFile(file);
      const fileSizeMB = file.size / (1024 * 1024);
      const sizeLimit = FILE_SIZE_LIMITS[mediaType];
      
      if (fileSizeMB > sizeLimit) {
        return {
          isValid: false,
          error: `File "${file.name}" (${fileSizeMB.toFixed(1)}MB) exceeds ${sizeLimit}MB limit for ${mediaType} files`
        };
      }
      
      if (fileSizeMB > sizeLimit * 0.8) {
        warnings.push(`${file.name} is large (${fileSizeMB.toFixed(1)}MB) and may upload slowly`);
      }
    }

    return { isValid: true, warnings: warnings.length > 0 ? warnings : undefined };
  }

  /**
   * Upload single file with new storage logic
   */
  static async uploadFile(file: File, context: MediaContext): Promise<MediaItem> {
    const userId = context.userId || await getCurrentUserId();
    if (!userId) {
      throw new Error('Authentication required. Please log in and try again.');
    }

    // Determine media type and bucket
    const fileBasedMediaType = getMediaTypeFromFile(file);
    const categoryBasedMediaType = getMediaTypeFromCategory(context.type);
    const mediaType = fileBasedMediaType;
    
    // Get bucket and path
    const bucketName = getStorageBucket(context.type, context.type === 'profile');
    const storagePath = generateFilePath(file, context, userId);
    
    // Validate file type
    if (!isValidFileType(file, mediaType)) {
      throw new Error(`File type "${file.type || 'unknown'}" is not supported for ${mediaType} uploads. Supported types: ${Array.from(SUPPORTED_TYPES[mediaType]).join(', ')}`);
    }
    
    // Upload validation passed, proceeding with storage upload
    
    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, file, { 
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    if (!uploadData) {
      throw new Error('Storage upload succeeded but no data returned');
    }

    // Create database record with relative storage path
    const mediaRecord = {
      name: context.name || file.name || 'Uploaded File',
      description: context.description || null,
      media_type: mediaType,
      category: context.type,
      project_id: context.projectId || null, // Use projectId if provided, null for user profiles
      phase_id: context.phaseId || null,
      file_path: storagePath, // Store relative path, not full URL
      file_size_bytes: file.size,
      mime_type: file.type || 'application/octet-stream',
      metadata: {
        originalFileName: file.name || 'unknown',
        uploadedAt: new Date().toISOString(),
        uploadedBy: userId,
        bucketName: bucketName,
        isPublic: bucketName === 'profiles'
      }
    };

    // Create database record with validated data

    const { data: mediaItem, error: dbError } = await supabase
      .from('be_media_items')
      .insert(mediaRecord)
      .select()
      .single();

    if (dbError) {
      // Cleanup on failure
      try {
        await supabase.storage.from(bucketName).remove([storagePath]);
      } catch (cleanupError) {
        console.warn('Storage cleanup failed:', cleanupError);
      }
      throw new Error(`Database record creation failed: ${dbError.message}`);
    }

    return mediaItem;
  }

  /**
   * Batch upload with progress tracking
   */
  static async uploadBatch(
    files: File[] | FileList | null | undefined, 
    context: MediaContext,
    onProgress?: (completed: number, total: number, currentFile?: string) => void
  ): Promise<UploadResult[]> {
    if (!files) {
      throw new Error('No files provided for upload');
    }
    
    const fileArray = Array.isArray(files) ? files : Array.from(files);
    
    const validation = this.validateFiles(fileArray);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    
    if (validation.warnings?.length) {
      console.warn('Upload warnings:', validation.warnings);
    }

    const results: UploadResult[] = [];
    let successCount = 0;
    
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      
      try {
        if (typeof onProgress === 'function') {
          onProgress(i, fileArray.length, file.name || 'File');
        }
        
        const mediaItem = await this.uploadFile(file, context);
        results.push({ success: true, mediaItem });
        successCount++;
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Upload failed for ${file.name || 'file'}:`, error);
        
        results.push({ 
          success: false, 
          error: `${file.name || 'File'}: ${errorMessage}` 
        });
      }
      
      if (typeof onProgress === 'function') {
        onProgress(i + 1, fileArray.length);
      }
    }
    
    console.log(`Batch upload completed: ${successCount}/${fileArray.length} files successful`);
    return results;
  }

  /**
   * Legacy upload method
   */
  static async upload(files: File[], context: MediaContext): Promise<MediaItem[]> {
    const results = await this.uploadBatch(files, context);
    
    const failures = results.filter(result => !result.success);
    if (failures.length > 0) {
      const errorMessages = failures.map(f => f.error).join('; ');
      throw new Error(`Upload batch failed: ${errorMessages}`);
    }
    
    return results
      .filter((result): result is UploadResult & { success: true; mediaItem: MediaItem } => 
        result.success && !!result.mediaItem
      )
      .map(result => result.mediaItem);
  }

  /**
   * Get media URL - generates URLs from storage paths
   */
  static async getUrl(mediaId: string, expiresIn?: number): Promise<string> {
    if (!mediaId?.trim()) {
      throw new Error('Media ID is required');
    }
    
    const { data: mediaItem, error } = await supabase
      .from('be_media_items')
      .select('file_path, category, metadata, media_type')
      .eq('id', mediaId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error(`Media item with ID '${mediaId}' not found`);
      }
      throw new Error(`Failed to fetch media item: ${error.message}`);
    }

    const metadata = (mediaItem.metadata as Record<string, unknown>) || {};
    const bucketName = (metadata.bucketName as string) || getStorageBucket(mediaItem.category);
    const storagePath = mediaItem.file_path; // Now contains relative path
    const isPublic = metadata.isPublic === true || bucketName === 'profiles';
    
    // For public buckets (profiles), generate public URL
    if (isPublic) {
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(storagePath);
      
      if (!urlData?.publicUrl) {
        throw new Error('Failed to generate public URL');
      }
      
      return urlData.publicUrl;
    }
    
    // For private buckets, generate signed URL
    const actualExpiresIn = expiresIn ?? this.getExpiryTime(mediaItem.media_type);
    const { data, error: urlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(storagePath, actualExpiresIn);
    
    if (urlError || !data?.signedUrl) {
      throw new Error(`Failed to generate signed URL: ${urlError?.message || 'No signed URL generated'}`);
    }
    
    return data.signedUrl;
  }

  /**
   * Delete media item
   */
  static async delete(mediaId: string): Promise<void> {
    if (!mediaId?.trim()) {
      throw new Error('Media ID is required for deletion');
    }
    
    const { data: mediaItem, error: fetchError } = await supabase
      .from('be_media_items')
      .select('file_path, category, metadata')
      .eq('id', mediaId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw new Error(`Media item with ID '${mediaId}' not found`);
      }
      throw new Error(`Failed to fetch media item: ${fetchError.message}`);
    }

    const metadata = (mediaItem.metadata as Record<string, unknown>) || {};
    const bucketName = (metadata.bucketName as string) || getStorageBucket(mediaItem.category);
    const storagePath = mediaItem.file_path; // Now contains relative path

    // Delete from storage (non-blocking)
    const storagePromise = supabase.storage
      .from(bucketName)
      .remove([storagePath])
      .then(({ error }) => {
        if (error) console.warn(`Storage deletion failed for ${mediaId}:`, error);
      });

    // Delete database record
    const { error: dbError } = await supabase
      .from('be_media_items')
      .delete()
      .eq('id', mediaId);

    if (dbError) {
      throw new Error(`Database deletion failed: ${dbError.message}`);
    }
    
    await storagePromise;
  }

  /**
   * Update media item
   */
  static async update(
    mediaId: string, 
    updates: Partial<Pick<MediaItem, 'name' | 'description' | 'category' | 'metadata'>>
  ): Promise<MediaItem> {
    if (!mediaId?.trim()) {
      throw new Error('Media ID is required for update');
    }
    
    if (!updates || Object.keys(updates).length === 0) {
      throw new Error('No updates provided');
    }
    
    if (updates.name !== undefined && !updates.name.trim()) {
      throw new Error('Name cannot be empty');
    }
    
    const { data: mediaItem, error } = await supabase
      .from('be_media_items')
      .update({ 
        ...updates, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', mediaId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error(`Media item with ID '${mediaId}' not found`);
      }
      throw new Error(`Update failed: ${error.message}`);
    }
    
    return mediaItem;
  }

  /**
   * Get project media
   */
  static async getProjectMedia(projectId: string, category?: MediaCategory): Promise<MediaItem[]> {
    if (!projectId?.trim()) {
      throw new Error('Project ID is required');
    }
    
    let query = supabase
      .from('be_media_items')
      .select('*')
      .eq('project_id', projectId);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(1000);
      
    if (error) {
      throw new Error(`Failed to fetch media: ${error.message}`);
    }
    
    return data || [];
  }

  /**
   * Get user profile media
   */
  static async getUserProfileMedia(userId?: string): Promise<MediaItem[]> {
    const actualUserId = userId || await getCurrentUserId();
    if (!actualUserId) {
      throw new Error('User ID is required');
    }
    
    const { data, error } = await supabase
      .from('be_media_items')
      .select('*')
      .is('project_id', null)
      .eq('category', 'profile')
      .eq('metadata->>uploadedBy', actualUserId)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw new Error(`Failed to fetch user profile media: ${error.message}`);
    }
    
    return data || [];
  }

  /**
   * Get project documents
   */
  static async getProjectDocuments(projectId: string): Promise<MediaItem[]> {
    const { data, error } = await supabase
      .from('be_media_items')
      .select('*')
      .eq('project_id', projectId)
      .eq('media_type', 'DOCUMENT')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch documents: ${error.message}`);
    return data || [];
  }

  /**
   * Get phase documents
   */
  static async getPhaseDocuments(phaseId: string): Promise<MediaItem[]> {
    const { data, error } = await supabase
      .from('be_media_items')
      .select('*')
      .eq('phase_id', phaseId)
      .eq('media_type', 'DOCUMENT')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch phase documents: ${error.message}`);
    return data || [];
  }

  /**
   * Get appropriate URL expiration time based on media type
   */
  private static getExpiryTime(mediaType?: string): number {
    switch (mediaType) {
      case 'PHOTO': return URL_EXPIRY_TIMES.PHOTO;
      case 'VIDEO': return URL_EXPIRY_TIMES.VIDEO;
      case 'DOCUMENT': return URL_EXPIRY_TIMES.DOCUMENT;
      default: return URL_EXPIRY_TIMES.DEFAULT;
    }
  }

  /**
   * Clear user cache
   */
  static clearCache(): void {
    cachedUserId = null;
    userCacheExpiry = 0;
  }

  /**
   * Get media item by ID
   */
  static async getMediaItem(mediaId: string): Promise<any | null> {
    if (!mediaId?.trim()) {
      throw new Error('Media ID is required');
    }

    const { data: mediaItem, error } = await supabase
      .from('be_media_items')
      .select('*')
      .eq('id', mediaId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch media item: ${error.message}`);
    }

    return mediaItem;
  }
}

export default MediaService;