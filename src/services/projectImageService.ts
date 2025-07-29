/**
 * Unified Project Image Service
 * Handles inspiration and progress images with consistent storage + database sync
 */
import { uploadFile, deleteFile, FILE_TYPE_PRESETS } from '@/utils/core/storageUtils';
import { supabase } from '@/lib/supabase';
import type { FileUploadResult, DeleteFileResult } from '@/types/fileUpload';
import type { UploadResult } from '@/types/upload';

export type ImageType = 'inspiration' | 'progress' | 'profile';

export interface ImageUploadOptions {
  type: ImageType;
  projectId: string;
  files: File[];
  onProgress?: (progress: number) => void;
}

export interface ImageUploadResult {
  success: boolean;
  uploadedImages?: UploadResult[];
  error?: string;
}

// Image type configurations with database sync info
const IMAGE_CONFIG = {
  inspiration: {
    bucket: 'project-inspiration',
    maxFiles: 20,
    dbColumn: 'inspiration_images'
  },
  progress: {
    bucket: 'progress-images', 
    maxFiles: 20,
    dbColumn: 'progress_images'
  },
  profile: {
    bucket: 'profiles',
    maxFiles: 1,
    dbColumn: 'profile_image'
  }
} as const;

// Allowed image MIME types
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/webp',
  'image/heic',
  'image/gif'
];

// Maximum file size: 10MB
const MAX_FILE_SIZE_MB = 10;

/**
 * Validate image file type and size
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  if (!file || typeof file !== 'object') {
    return {
      isValid: false,
      error: 'Invalid file object provided'
    };
  }

  // Check file size
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > MAX_FILE_SIZE_MB) {
    return {
      isValid: false,
      error: `File size (${fileSizeMB.toFixed(1)}MB) exceeds maximum allowed size of ${MAX_FILE_SIZE_MB}MB`
    };
  }

  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `File type "${file.type}" is not supported. Allowed types: JPG, PNG, WebP, HEIC, GIF`
    };
  }

  return { isValid: true };
}

/**
 * Update project image array in database
 */
async function updateProjectImageArray(
  projectId: string,
  imageUrls: string[],
  type: ImageType
): Promise<{ success: boolean; error?: string }> {
  try {
    const config = IMAGE_CONFIG[type];
    
    // Handle profile image differently (single image, not array)
    if (type === 'profile') {
      const { error: updateError } = await supabase
        .from('be_project')
        .update({ 
          profile_image: imageUrls[0],
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (updateError) {
        throw new Error(`Failed to update profile image: ${updateError.message}`);
      }
      
      return { success: true };
    }
    
    // Handle inspiration and progress images (arrays)
    const { data: project, error: fetchError } = await supabase
      .from('be_project')
      .select(`${config.dbColumn}`)
      .eq('id', projectId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch project: ${fetchError.message}`);
    }

    // Merge new URLs with existing ones
    const currentImages = (project[config.dbColumn] as string[]) || [];
    const updatedImages = [...currentImages, ...imageUrls];

    // Update database
    const { error: updateError } = await supabase
      .from('be_project')
      .update({ 
        [config.dbColumn]: updatedImages,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);

    if (updateError) {
      throw new Error(`Failed to update project: ${updateError.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating project image array:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Database update failed'
    };
  }
}

/**
 * Upload multiple project images and sync to database
 */
export async function uploadProjectImages(options: ImageUploadOptions): Promise<ImageUploadResult> {
  const { type, projectId, files, onProgress } = options;

  if (!files || files.length === 0) {
    return {
      success: false,
      error: 'No files provided for upload'
    };
  }

  const config = IMAGE_CONFIG[type];
  
  if (files.length > config.maxFiles) {
    return {
      success: false,
      error: `Maximum ${config.maxFiles} files allowed for ${type} images`
    };
  }

  try {
    const results: FileUploadResult[] = [];

    // Upload each file to storage
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate each file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        results.push({
          success: false,
          error: validation.error
        });
        continue;
      }

      try {
        // Upload to storage
        const uploadResult = await uploadFile(file, {
          bucket: config.bucket,
          projectId,
          allowedTypes: ALLOWED_IMAGE_TYPES,
          maxSizeMB: MAX_FILE_SIZE_MB,
          onProgress: (fileProgress) => {
            if (onProgress) {
              const totalProgress = ((i + fileProgress / 100) / files.length) * 100;
              onProgress(Math.round(totalProgress));
            }
          }
        });

        results.push(uploadResult);
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Upload failed'
        });
      }
    }
    
    // Filter successful uploads
    const successfulUploads = results.filter(result => result.success && result.publicUrl);
    const failedUploads = results.filter(result => !result.success);

    if (successfulUploads.length === 0) {
      return {
        success: false,
        error: 'All uploads failed'
      };
    }

    // Step 2: Sync successful uploads to database
    const imageUrls = successfulUploads.map(result => result.publicUrl!);
    const dbResult = await updateProjectImageArray(projectId, imageUrls, type);

    if (!dbResult.success) {
      console.error('Database sync failed, but files were uploaded to storage');
      return {
        success: false,
        error: `Files uploaded but database sync failed: ${dbResult.error}`
      };
    }

    // Create response with upload results
    const uploadedImages: UploadResult[] = successfulUploads.map((result, index) => ({
      id: `${type}-${Date.now()}-${index}`,
      url: result.publicUrl!,
      name: files[index].name,
      size: files[index].size,
      type: type as any, // Cast to match UploadResult type
      uploadedAt: new Date()
    }));

    return {
      success: true,
      uploadedImages,
      ...(failedUploads.length > 0 && {
        error: `${failedUploads.length} files failed to upload`
      })
    };

  } catch (error) {
    console.error('Error in uploadProjectImages:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload process failed'
    };
  }
}

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
 * Remove image from project array in database
 */
export async function removeProjectImage(
  projectId: string,
  imageUrl: string,
  type: ImageType
): Promise<{ success: boolean; error?: string }> {
  try {
    const config = IMAGE_CONFIG[type];
    
    // Handle profile image differently (single image, not array)
    if (type === 'profile') {
      const { error: updateError } = await supabase
        .from('be_project')
        .update({ 
          profile_image: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (updateError) {
        throw new Error(`Failed to remove profile image: ${updateError.message}`);
      }
      
      return { success: true };
    }
    
    // Handle inspiration and progress images (arrays)
    const { data: project, error: fetchError } = await supabase
      .from('be_project')
      .select(`${config.dbColumn}`)
      .eq('id', projectId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch project: ${fetchError.message}`);
    }

    // Remove URL from array
    const currentImages = (project[config.dbColumn] as string[]) || [];
    const updatedImages = currentImages.filter(url => url !== imageUrl);

    // Update database
    const { error: updateError } = await supabase
      .from('be_project')
      .update({ 
        [config.dbColumn]: updatedImages,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);

    if (updateError) {
      throw new Error(`Failed to update project: ${updateError.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error removing project image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove image'
    };
  }
}

/**
 * Delete a project image from storage
 * @param filePath The file path to delete
 * @param imageType The type of image being deleted
 * @returns Delete result
 */
export async function deleteProjectImage(filePath: string, imageType: ImageType): Promise<DeleteFileResult> {
  const config = IMAGE_CONFIG[imageType];
  return deleteFile(config.bucket, filePath);
}

/**
 * Get project images from database
 */
export async function getProjectImages(
  projectId: string,
  type: ImageType
): Promise<{ images: string[]; error?: string }> {
  try {
    const config = IMAGE_CONFIG[type];
    
    // Handle profile image differently (single image, not array)
    if (type === 'profile') {
      const { data: project, error } = await supabase
        .from('be_project')
        .select('profile_image')
        .eq('id', projectId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch profile image: ${error.message}`);
      }

      return {
        images: project.profile_image ? [project.profile_image] : []
      };
    }
    
    // Handle inspiration and progress images (arrays)
    const { data: project, error } = await supabase
      .from('be_project')
      .select(`${config.dbColumn}`)
      .eq('id', projectId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch project images: ${error.message}`);
    }

    return {
      images: (project[config.dbColumn] as string[]) || []
    };
  } catch (error) {
    console.error('Error fetching project images:', error);
    return {
      images: [],
      error: error instanceof Error ? error.message : 'Failed to fetch images'
    };
  }
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
    const config = IMAGE_CONFIG[imageType];
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
