/**
 * Unified Storage Service
 * Single source of truth for all storage operations in BuildEase
 * Consolidates storageUtils.ts, documentService.ts, and image utilities
 */

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { FileUploadOptions, FileUploadResult, DeleteFileResult } from '@/types/fileUpload';

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

export type DocumentType = 
  | 'PERMIT' 
  | 'DRAWING' 
  | 'CONTRACT' 
  | 'INVOICE' 
  | 'RECEIPT' 
  | 'REPORT' 
  | 'SPECIFICATION' 
  | 'SCHEDULE' 
  | 'PHOTO' 
  | 'VIDEO' 
  | 'MANUAL' 
  | 'CERTIFICATE' 
  | 'OTHER';

export type StorageBucket = 
  | 'profiles' 
  | 'project-inspiration' 
  | 'progress-images' 
  | 'project-files'
  | 'documents';

export interface UnifiedUploadOptions extends Omit<FileUploadOptions, 'bucket'> {
  bucket: StorageBucket;
  documentType?: DocumentType;
  createDatabaseRecord?: boolean;
  phaseId?: string;
  name?: string;
  description?: string;
}

export interface UnifiedUploadResult extends FileUploadResult {
  documentId?: string;
  document?: any;
}

// File type presets
export const FILE_TYPE_PRESETS = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
  all: ['*/*']
} as const;

// Bucket configurations
const BUCKET_CONFIGS = {
  'profiles': {
    allowedTypes: FILE_TYPE_PRESETS.images,
    maxSizeMB: 5,
    requiresProject: false,
    pathStructure: '{userId}/{filename}'
  },
  'project-inspiration': {
    allowedTypes: FILE_TYPE_PRESETS.images,
    maxSizeMB: 10,
    requiresProject: true,
    pathStructure: '{userId}/{projectId}/{filename}'
  },
  'progress-images': {
    allowedTypes: FILE_TYPE_PRESETS.images,
    maxSizeMB: 10,
    requiresProject: true,
    pathStructure: '{userId}/{projectId}/{filename}'
  },
  'project-files': {
    allowedTypes: FILE_TYPE_PRESETS.all,
    maxSizeMB: 100,
    requiresProject: true,
    pathStructure: '{userId}/{projectId}/{filename}'
  },
  'documents': {
    allowedTypes: FILE_TYPE_PRESETS.documents,
    maxSizeMB: 50,
    requiresProject: true,
    pathStructure: '{userId}/{projectId}/{filename}'
  }
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get authenticated user ID for storage operations
 */
export const getStorageUserId = async (): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch (error) {
    console.error('Error getting storage user ID:', error);
    return null;
  }
};

/**
 * Generate unique filename with timestamp and random suffix
 */
export const generateUniqueFileName = (originalName: string): string => {
  if (!originalName || typeof originalName !== 'string') {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `file_${timestamp}_${randomSuffix}`;
  }
  
  const fileExt = originalName.split('.').pop() || '';
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '').trim();
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  
  // Sanitize filename - remove special characters
  const sanitizedName = nameWithoutExt.replace(/[<>:"/\\|?*]/g, '').substring(0, 100);
  
  return fileExt ? `${sanitizedName}_${timestamp}_${randomSuffix}.${fileExt}` : `${sanitizedName}_${timestamp}_${randomSuffix}`;
};

/**
 * Generate file path based on bucket requirements
 */
export const generateFilePath = (
  bucket: StorageBucket,
  userId: string,
  fileName: string,
  projectId?: string
): string => {
  const config = BUCKET_CONFIGS[bucket];
  
  if (config.requiresProject && !projectId) {
    throw new Error(`Project ID required for ${bucket} bucket`);
  }
  
  switch (config.pathStructure) {
    case '{userId}/{filename}':
      return `${userId}/${fileName}`;
    case '{userId}/{projectId}/{filename}':
      return `${userId}/${projectId}/${fileName}`;
    default:
      return `${userId}/${fileName}`;
  }
};

/**
 * Validate file type and size
 */
export const validateFile = (
  file: File,
  bucket: StorageBucket
): { isValid: boolean; error?: string } => {
  const config = BUCKET_CONFIGS[bucket];
  
  // Basic file validation
  if (!file || typeof file !== 'object' || typeof file.size !== 'number') {
    return { isValid: false, error: 'Invalid file object' };
  }
  
  // Size validation
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > config.maxSizeMB) {
    return {
      isValid: false,
      error: `File size (${fileSizeMB.toFixed(1)}MB) exceeds maximum allowed size of ${config.maxSizeMB}MB`
    };
  }
  
  // Type validation
  if (!config.allowedTypes.includes('*/*') && !config.allowedTypes.includes(file.type)) {
    // Also check file extension as fallback
    const extension = file.name.toLowerCase().split('.').pop();
    const validExtensions = config.allowedTypes.includes('image/jpeg') 
      ? ['jpg', 'jpeg', 'png', 'gif', 'webp']
      : ['pdf', 'doc', 'docx', 'xls', 'xlsx'];
    
    if (!extension || !validExtensions.includes(extension)) {
      return {
        isValid: false,
        error: `File type "${file.type}" not supported for ${bucket} bucket. Allowed: ${config.allowedTypes.join(', ')}`
      };
    }
  }
  
  return { isValid: true };
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/**
 * Create blob URL for preview with memory management
 */
export const createPreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Clean up blob URL
 */
export const revokePreviewUrl = (url: string): void => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

// ============================================================================
// DOCUMENT TYPE UTILITIES
// ============================================================================

/**
 * Get document type from filename
 */
export const getDocumentTypeFromFilename = (filename: string): DocumentType => {
  const extension = filename.toLowerCase().split('.').pop();
  const lowerName = filename.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      if (lowerName.includes('permit')) return 'PERMIT';
      if (lowerName.includes('contract')) return 'CONTRACT';
      if (lowerName.includes('invoice')) return 'INVOICE';
      if (lowerName.includes('receipt')) return 'RECEIPT';
      if (lowerName.includes('report')) return 'REPORT';
      if (lowerName.includes('spec')) return 'SPECIFICATION';
      if (lowerName.includes('schedule')) return 'SCHEDULE';
      if (lowerName.includes('manual')) return 'MANUAL';
      if (lowerName.includes('cert')) return 'CERTIFICATE';
      return 'OTHER';
    case 'doc':
    case 'docx':
      if (lowerName.includes('contract')) return 'CONTRACT';
      if (lowerName.includes('spec')) return 'SPECIFICATION';
      return 'OTHER';
    case 'xls':
    case 'xlsx':
      if (lowerName.includes('schedule')) return 'SCHEDULE';
      return 'OTHER';
    default:
      return 'OTHER';
  }
};

/**
 * Get document type display name
 */
export const getDocumentTypeDisplayName = (documentType: DocumentType): string => {
  const displayNames: Record<DocumentType, string> = {
    'PERMIT': 'Permit',
    'DRAWING': 'Drawing',
    'CONTRACT': 'Contract',
    'INVOICE': 'Invoice',
    'RECEIPT': 'Receipt',
    'REPORT': 'Report',
    'SPECIFICATION': 'Specification',
    'SCHEDULE': 'Schedule',
    'PHOTO': 'Photo',
    'VIDEO': 'Video',
    'MANUAL': 'Manual',
    'CERTIFICATE': 'Certificate',
    'OTHER': 'Other'
  };
  return displayNames[documentType] || 'Document';
};

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

/**
 * Check if file path exists in database
 */
const checkFilePathExists = async (filePath: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('be_document')
      .select('id')
      .eq('file_path', filePath)
      .single();
    
    return !!data && !error;
  } catch {
    return false;
  }
};

/**
 * Generate unique file path that doesn't conflict with database
 */
const generateUniqueFilePathForDocument = async (
  userId: string, 
  projectId: string, 
  originalName: string
): Promise<string> => {
  let attempts = 0;
  const maxAttempts = 5;
  
  while (attempts < maxAttempts) {
    const fileName = generateUniqueFileName(originalName);
    const filePath = `${userId}/${projectId}/${fileName}`;
    
    const exists = await checkFilePathExists(filePath);
    if (!exists) {
      return filePath;
    }
    
    attempts++;
    await new Promise(resolve => setTimeout(resolve, 100 * attempts));
  }
  
  // Fallback with additional entropy
  const fallbackFileName = generateUniqueFileName(`${originalName}_${crypto.randomUUID().split('-')[0]}`);
  return `${userId}/${projectId}/${fallbackFileName}`;
};

/**
 * Create document database record with conflict resolution
 */
const createDocumentRecord = async (options: {
  name: string;
  description?: string;
  documentType: DocumentType;
  projectId: string;
  phaseId?: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  metadata?: Record<string, any>;
  userId?: string;
  originalFileName?: string;
}): Promise<{ success: boolean; document?: any; error?: string }> => {
  try {
    let finalFilePath = options.filePath;
    
    // Check for conflicts and resolve
    if (options.userId && options.originalFileName) {
      const pathExists = await checkFilePathExists(finalFilePath);
      if (pathExists) {
        finalFilePath = await generateUniqueFilePathForDocument(
          options.userId,
          options.projectId,
          options.originalFileName
        );
      }
    }
    
    const { data: document, error } = await supabase
      .from('be_document')
      .insert({
        name: options.name,
        description: options.description || null,
        document_type: options.documentType,
        project_id: options.projectId,
        phase_id: options.phaseId || null,
        file_path: finalFilePath,
        file_size: options.fileSize,
        mime_type: options.mimeType,
        metadata: options.metadata || {}
      })
      .select()
      .single();
    
    if (error) {
      // Retry with UUID if still getting conflicts
      if (error.code === '23505' && error.message.includes('be_document_file_path_key')) {
        const uuidFileName = `${options.name}_${crypto.randomUUID()}.${options.originalFileName?.split('.').pop() || 'pdf'}`;
        const retryPath = `${options.userId}/${options.projectId}/${uuidFileName}`;
        
        const { data: retryDocument, error: retryError } = await supabase
          .from('be_document')
          .insert({
            name: options.name,
            description: options.description || null,
            document_type: options.documentType,
            project_id: options.projectId,
            phase_id: options.phaseId || null,
            file_path: retryPath,
            file_size: options.fileSize,
            mime_type: options.mimeType,
            metadata: options.metadata || {}
          })
          .select()
          .single();
        
        if (retryError) {
          return { success: false, error: retryError.message };
        }
        
        return { success: true, document: retryDocument };
      }
      
      return { success: false, error: error.message };
    }
    
    return { success: true, document };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create document record' 
    };
  }
};

// ============================================================================
// CORE STORAGE OPERATIONS
// ============================================================================

/**
 * Upload file to storage
 */
export const uploadFile = async (
  file: File,
  options: UnifiedUploadOptions
): Promise<UnifiedUploadResult> => {
  try {
    // Validate file
    const validation = validateFile(file, options.bucket);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }
    
    // Get user ID
    const userId = options.userId || await getStorageUserId();
    if (!userId) {
      return { success: false, error: 'Unable to determine user ID' };
    }
    
    // Generate file path
    const fileName = options.generateFileName ? 
      options.generateFileName(file.name) : 
      generateUniqueFileName(file.name);
    const filePath = generateFilePath(options.bucket, userId, fileName, options.projectId);
    
    // Report progress
    options.onProgress?.(0);
    
    // Upload to Supabase Storage
    const uploadOptions: any = {
      cacheControl: options.cacheControl || '3600',
      upsert: options.upsert || false
    };
    
    if (options.metadata && Object.keys(options.metadata).length > 0) {
      const safeMetadata = Object.fromEntries(
        Object.entries(options.metadata).filter(([key]) => 
          !['project_id', 'user_id', 'bucket_id', 'owner_id', 'owner'].includes(key.toLowerCase())
        )
      );
      if (Object.keys(safeMetadata).length > 0) {
        uploadOptions.metadata = safeMetadata;
      }
    }
    
    const { error } = await supabase.storage
      .from(options.bucket)
      .upload(filePath, file, uploadOptions);
    
    if (error) {
      console.error('Storage upload error:', error);
      return { success: false, error: `Upload failed: ${error.message}` };
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(options.bucket)
      .getPublicUrl(filePath);
    
    // Complete progress
    options.onProgress?.(100);
    
    let result: UnifiedUploadResult = {
      success: true,
      publicUrl,
      filePath
    };
    
    // Create database record if requested
    if (options.createDatabaseRecord && options.bucket === 'documents') {
      const documentType = options.documentType || getDocumentTypeFromFilename(file.name);
      const documentResult = await createDocumentRecord({
        name: options.name || file.name,
        description: options.description,
        documentType,
        projectId: options.projectId!,
        phaseId: options.phaseId,
        filePath: publicUrl,
        fileSize: file.size,
        mimeType: file.type,
        userId,
        originalFileName: file.name,
        metadata: {
          originalFileName: file.name,
          uploadedAt: new Date().toISOString(),
          ...options.metadata
        }
      });
      
      if (!documentResult.success) {
        console.error('Database record creation failed:', documentResult.error);
        // Upload succeeded but database failed - return partial success
        result.error = `File uploaded but database sync failed: ${documentResult.error}`;
      } else {
        result.documentId = documentResult.document?.id;
        result.document = documentResult.document;
      }
    }
    
    return result;
    
  } catch (error) {
    console.error('Upload process error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
};

/**
 * Delete file from storage
 */
export const deleteFile = async (
  bucket: StorageBucket,
  filePath: string
): Promise<DeleteFileResult> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);
    
    if (error) {
      console.error('Storage delete error:', error);
      return { success: false, error: `Delete failed: ${error.message}` };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Delete process error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed'
    };
  }
};

/**
 * Get file URL from storage
 */
export const getFileUrl = (bucket: StorageBucket, filePath: string): string => {
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);
  
  return publicUrl;
};

/**
 * Upload multiple files sequentially
 */
export const uploadMultipleFiles = async (
  files: File[],
  options: UnifiedUploadOptions
): Promise<UnifiedUploadResult[]> => {
  const results: UnifiedUploadResult[] = [];
  
  for (const file of files) {
    const result = await uploadFile(file, options);
    results.push(result);
  }
  
  return results;
};

// ============================================================================
// SPECIALIZED UPLOAD FUNCTIONS
// ============================================================================

/**
 * Upload profile picture
 */
export const uploadProfilePicture = async (
  file: File,
  userId?: string
): Promise<UnifiedUploadResult> => {
  return uploadFile(file, {
    bucket: 'profiles',
    userId,
    allowedTypes: FILE_TYPE_PRESETS.images,
    maxSizeMB: 5,
    upsert: true
  });
};

/**
 * Upload project inspiration images
 */
export const uploadInspirationImages = async (
  files: File[],
  projectId: string,
  userId?: string
): Promise<UnifiedUploadResult[]> => {
  return uploadMultipleFiles(files, {
    bucket: 'project-inspiration',
    projectId,
    userId,
    allowedTypes: FILE_TYPE_PRESETS.images,
    maxSizeMB: 10
  });
};

/**
 * Upload progress images
 */
export const uploadProgressImages = async (
  files: File[],
  projectId: string,
  userId?: string
): Promise<UnifiedUploadResult[]> => {
  return uploadMultipleFiles(files, {
    bucket: 'progress-images',
    projectId,
    userId,
    allowedTypes: FILE_TYPE_PRESETS.images,
    maxSizeMB: 10
  });
};

/**
 * Upload project documents with database records
 */
export const uploadProjectDocuments = async (
  files: File[],
  projectId: string,
  options?: {
    userId?: string;
    phaseId?: string;
    documentType?: DocumentType;
    createDatabaseRecords?: boolean;
  }
): Promise<UnifiedUploadResult[]> => {
  return uploadMultipleFiles(files, {
    bucket: 'documents',
    projectId,
    userId: options?.userId,
    phaseId: options?.phaseId,
    documentType: options?.documentType,
    createDatabaseRecord: options?.createDatabaseRecords,
    allowedTypes: FILE_TYPE_PRESETS.documents,
    maxSizeMB: 50
  });
};

// ============================================================================
// REACT HOOKS
// ============================================================================

/**
 * Hook for managing file upload state
 */
export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const upload = async (file: File, options: UnifiedUploadOptions): Promise<UnifiedUploadResult> => {
    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    const result = await uploadFile(file, {
      ...options,
      onProgress: (progress) => {
        setUploadProgress(progress);
        options.onProgress?.(progress);
      }
    });

    setIsUploading(false);
    
    if (!result.success && result.error) {
      setUploadError(result.error);
    }

    return result;
  };

  const reset = () => {
    setIsUploading(false);
    setUploadProgress(0);
    setUploadError(null);
  };

  return {
    upload,
    reset,
    isUploading,
    uploadProgress,
    uploadError
  };
};

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

// FILE_TYPE_PRESETS and BUCKET_CONFIGS are already exported above, so we don't need to export them again

// Default export
export default {
  // Core operations
  uploadFile,
  deleteFile,
  getFileUrl,
  uploadMultipleFiles,
  
  // Specialized uploads
  uploadProfilePicture,
  uploadInspirationImages,
  uploadProgressImages,
  uploadProjectDocuments,
  
  // Utilities
  validateFile,
  generateUniqueFileName,
  generateFilePath,
  formatFileSize,
  createPreviewUrl,
  revokePreviewUrl,
  getStorageUserId,
  
  // Document utilities
  getDocumentTypeFromFilename,
  getDocumentTypeDisplayName,
  
  // Hook
  useFileUpload
};