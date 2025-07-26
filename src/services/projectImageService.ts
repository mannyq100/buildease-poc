/**
 * Service for handling all project image uploads (inspiration, progress, profile)
 */
import { uploadFile, deleteFile, FILE_TYPE_PRESETS } from '@/utils/core/storageUtils';
import type { FileUploadResult, DeleteFileResult } from '@/types/fileUpload';

type ImageType = 'inspiration' | 'progress' | 'profile';

// Get bucket configuration for different image types
const getBucketConfig = (imageType: ImageType) => {
  switch(imageType) {
    case 'inspiration':
      return { bucket: 'project-inspiration', folder: 'inspiration' };
    case 'progress':
      return { bucket: 'progress-images', folder: 'progress' };
    case 'profile':
      return { bucket: 'project-inspiration', folder: 'profile' };
    default:
      return { bucket: 'project-inspiration', folder: 'misc' };
  }
};

/**
 * Upload a project image (inspiration, progress, or profile)
 * @param file The image file to upload
 * @param userId The user ID for storage path
 * @param imageType The type of image being uploaded
 * @param onProgress Optional progress callback
 * @param projectId Optional project ID (if not provided, uses temporary UUID)
 * @returns Upload result with URL and path
 */
export async function uploadProjectImage(
  file: File, 
  userId: string,
  imageType: ImageType,
  onProgress?: (progress: number) => void,
  projectId?: string
): Promise<FileUploadResult> {
  // Generate a temporary UUID if no project ID provided
  // This ensures compliance with RLS policy UUID validation
  const generateTempUUID = () => {
    // Generate a valid UUID v4 format for temporary project ID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
  
  const effectiveProjectId = projectId || generateTempUUID();
  const config = getBucketConfig(imageType);
  
  return uploadFile(file, {
    bucket: config.bucket,
    userId,
    projectId: effectiveProjectId,
    allowedTypes: FILE_TYPE_PRESETS.images,
    maxSizeMB: 5,
    onProgress,
    cacheControl: '3600',
    upsert: false
  });
}

/**
 * Delete a project image
 * @param filePath The file path to delete
 * @param imageType The type of image being deleted
 * @returns Delete result
 */
export async function deleteProjectImage(filePath: string, imageType: ImageType): Promise<DeleteFileResult> {
  const config = getBucketConfig(imageType);
  return deleteFile(config.bucket, filePath);
}

/**
 * Extract file path from public URL
 * This is useful when deleting files as we need the path, not the URL
 * @param url The public URL of the file
 * @param imageType The type of image to determine the correct bucket
 * @returns The file path
 */
export function getFilePathFromUrl(url: string, imageType: ImageType): string {
  try {
    const config = getBucketConfig(imageType);
    // Extract the path from the URL
    // Example URL: https://xxxx.supabase.co/storage/v1/object/public/bucket-name/user-id/filename.jpg
    const urlParts = url.split(`/${config.bucket}/`);
    if (urlParts.length < 2) return '';
    
    return `${urlParts[1]}`;
  } catch (error) {
    console.error('Error extracting file path from URL:', error);
    return '';
  }
}

// Legacy functions for backward compatibility
export const uploadProjectInspirationImage = (
  file: File, 
  userId: string,
  onProgress?: (progress: number) => void,
  projectId?: string
): Promise<FileUploadResult> => {
  return uploadProjectImage(file, userId, 'inspiration', onProgress, projectId);
};

export const deleteProjectInspirationImage = (filePath: string): Promise<DeleteFileResult> => {
  return deleteProjectImage(filePath, 'inspiration');
};
