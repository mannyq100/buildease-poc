/**
 * File upload utility for handling file uploads to Supabase storage
 * Supports different file types and provides progress tracking
 */
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getStorageUserId } from './storageUtils';
import type {
  FileUploadOptions,
  FileUploadResult,
  ProgressSimulator,
  DeleteFileResult
} from '@/types/fileUpload';

/**
 * Default file type validations
 */
export const FILE_TYPE_PRESETS = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  spreadsheets: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  all: ['*/*']
};

/**
 * Generate a unique filename with timestamp
 */
export const generateUniqueFileName = (originalName: string): string => {
  const fileExt = originalName.split('.').pop();
  return `${Date.now()}.${fileExt}`;
};

/**
 * Validate file type against allowed types
 */
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  if (allowedTypes.includes('*/*')) return true;
  return allowedTypes.includes(file.type);
};

/**
 * Validate file size against maximum allowed size
 */
export const validateFileSize = (file: File, maxSizeMB: number): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

/**
 * Create a blob URL for immediate preview
 */
export const createPreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Clean up blob URL
 */
export const revokePreviewUrl = (url: string): void => {
  URL.revokeObjectURL(url);
};

/**
 * Simulate upload progress for better UX
 */
export const simulateProgress = (
  onProgress: (progress: number) => void,
  intervalMs: number = 100,
  increment: number = 10,
  maxProgress: number = 90
): ProgressSimulator => {
  let interval: NodeJS.Timeout | null = null;
  let currentProgress = 0;

  const start = () => {
    interval = setInterval(() => {
      currentProgress += increment;
      if (currentProgress >= maxProgress) {
        stop();
        return;
      }
      onProgress(currentProgress);
    }, intervalMs);
  };

  const stop = () => {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  };

  return { start, stop };
};

/**
 * Upload a file to Supabase storage with progress tracking and validation
 */
export const uploadFile = async (
  file: File,
  options: FileUploadOptions
): Promise<FileUploadResult> => {
  const {
    bucket,
    userId,
    allowedTypes = FILE_TYPE_PRESETS.all,
    maxSizeMB = 5,
    generateFileName = generateUniqueFileName,
    onProgress,
    cacheControl = '3600',
    upsert = false
  } = options;

  try {
    // Validate file type
    if (!validateFileType(file, allowedTypes)) {
      const typesList = allowedTypes.join(', ');
      return {
        success: false,
        error: `Invalid file type. Allowed types: ${typesList}`
      };
    }

    // Validate file size
    if (!validateFileSize(file, maxSizeMB)) {
      return {
        success: false,
        error: `File size should be less than ${maxSizeMB}MB`
      };
    }

    // Get the correct user ID for storage (handles shadow users)
    const storageUserId = userId || await getStorageUserId();
    if (!storageUserId) {
      return {
        success: false,
        error: 'Unable to determine user ID for storage operation'
      };
    }

    // Generate file path
    const fileName = generateFileName(file.name);
    const filePath = `${storageUserId}/${fileName}`;

    // Start progress simulation if callback provided
    let progressSimulator: ProgressSimulator | null = null;
    if (onProgress) {
      onProgress(0);
      progressSimulator = simulateProgress(onProgress);
      progressSimulator.start();
    }

    // Upload file to Supabase storage
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl,
        upsert
      });

    // Stop progress simulation
    if (progressSimulator) {
      progressSimulator.stop();
    }

    if (error) {
      console.error('Error uploading file:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to upload file. Please try again.';
      
      if (error.message?.includes('Storage bucket not found')) {
        errorMessage = 'Storage bucket not found. Please contact support.';
      } else if (error.message?.includes('policy')) {
        errorMessage = 'Permission denied. Please check your account permissions.';
      } else if (error.message?.includes('size')) {
        errorMessage = 'File size exceeds the allowed limit.';
      } else if (error.message?.includes('type')) {
        errorMessage = 'File type not supported.';
      } else if (error.message) {
        errorMessage = `Upload failed: ${error.message}`;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    // Complete progress
    if (onProgress) {
      onProgress(100);
    }

    return {
      success: true,
      publicUrl,
      filePath
    };

  } catch (error) {
    console.error('Error in upload process:', error);
    return {
      success: false,
      error: 'Failed to upload file. Please try again.'
    };
  }
};

/**
 * Upload multiple files sequentially
 */
export const uploadMultipleFiles = async (
  files: File[],
  options: FileUploadOptions
): Promise<FileUploadResult[]> => {
  const results: FileUploadResult[] = [];
  
  for (const file of files) {
    const result = await uploadFile(file, options);
    results.push(result);
  }
  
  return results;
};

/**
 * Delete a file from Supabase storage
 */
export const deleteFile = async (
  bucket: string,
  filePath: string
): Promise<DeleteFileResult> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error);
      return {
        success: false,
        error: 'Failed to delete file. Please try again.'
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in delete process:', error);
    return {
      success: false,
      error: 'Failed to delete file. Please try again.'
    };
  }
};

/**
 * Get file URL from Supabase storage
 */
export const getFileUrl = (bucket: string, filePath: string): string => {
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);
  
  return publicUrl;
};

/**
 * Hook for managing file upload state
 */
export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const upload = async (file: File, options: FileUploadOptions): Promise<FileUploadResult> => {
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