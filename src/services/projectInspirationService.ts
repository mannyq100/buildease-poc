/**
 * Service for handling project inspiration image uploads
 */
import { uploadFile, deleteFile, FILE_TYPE_PRESETS } from '@/utils/core/storageUtils';
import type { FileUploadResult, DeleteFileResult } from '@/types/fileUpload';

const STORAGE_BUCKET = 'project-inspiration';

/**
 * Upload a project inspiration image
 * @param file The image file to upload
 * @param userId The user ID for storage path
 * @param onProgress Optional progress callback
 * @param projectId Optional project ID (if not provided, uses temporary UUID)
 * @returns Upload result with URL and path
 */
export async function uploadProjectInspirationImage(
  file: File, 
  userId: string,
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
  
  return uploadFile(file, {
    bucket: STORAGE_BUCKET,
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
 * Delete a project inspiration image
 * @param filePath The file path to delete
 * @returns Delete result
 */
export async function deleteProjectInspirationImage(filePath: string): Promise<DeleteFileResult> {
  return deleteFile(STORAGE_BUCKET, filePath);
}

/**
 * Extract file path from public URL
 * This is useful when deleting files as we need the path, not the URL
 * @param url The public URL of the file
 * @returns The file path
 */
export function getFilePathFromUrl(url: string): string {
  try {
    // Extract the path from the URL
    // Example URL: https://xxxx.supabase.co/storage/v1/object/public/project-inspiration/user-id/filename.jpg
    const urlParts = url.split('/project-inspiration/');
    if (urlParts.length < 2) return '';
    
    return `${urlParts[1]}`;
  } catch (error) {
    console.error('Error extracting file path from URL:', error);
    return '';
  }
}
