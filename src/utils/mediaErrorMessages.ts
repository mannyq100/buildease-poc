/**
 * Enhanced Media Error Messages
 * Provides specific, actionable error messages for media operations
 */

export const MEDIA_ERROR_MESSAGES = {
  // File Upload Errors
  FILE_SIZE_EXCEEDED: (limit: number, actualSize?: number) => 
    `File is too large. Maximum size allowed is ${limit}MB${actualSize ? ` (file is ${Math.round(actualSize)}MB)` : ''}.`,
  
  FILE_SIZE_BATCH_EXCEEDED: (limit: number) =>
    `Total upload size exceeds ${limit}MB limit. Please upload fewer files or reduce file sizes.`,
  
  UNSUPPORTED_FORMAT: (allowedFormats: string[]) => 
    `File format not supported. Please use: ${allowedFormats.join(', ')}.`,
  
  UNSUPPORTED_MEDIA_TYPE: (mediaType: string) =>
    `${mediaType} files are not supported for this upload type.`,
  
  // Network Errors
  NETWORK_ERROR: 'Network connection issue. Please check your connection and try again.',
  UPLOAD_TIMEOUT: 'Upload timed out. Please check your connection and try again.',
  UPLOAD_INTERRUPTED: 'Upload was interrupted. Please try again.',
  
  // Authentication Errors
  AUTH_ERROR: 'Session expired. Please refresh the page and try again.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  PROJECT_ACCESS_DENIED: 'You do not have access to this project.',
  
  // Media Management Errors
  MEDIA_NOT_FOUND: 'Media item not found. It may have been deleted.',
  MEDIA_ALREADY_PROFILE: 'This image is already set as the project profile.',
  ONLY_PHOTOS_AS_PROFILE: 'Only photos can be set as profile images.',
  PROFILE_UPDATE_FAILED: 'Failed to update profile image. Please try again.',
  
  // URL and Access Errors
  URL_EXPIRED: 'Media link has expired. Refreshing...',
  URL_INVALID: 'Invalid media link. Please refresh the page.',
  URL_INACCESSIBLE: 'Media is temporarily unavailable. Please try again later.',
  
  // Storage Errors
  STORAGE_QUOTA_EXCEEDED: 'Storage quota exceeded. Please contact your administrator.',
  STORAGE_SERVICE_ERROR: 'Storage service is temporarily unavailable. Please try again later.',
  
  // Validation Errors
  INVALID_FILE_NAME: 'File name contains invalid characters. Please rename and try again.',
  DUPLICATE_FILE_NAME: 'A file with this name already exists. Please rename or choose replace.',
  EMPTY_FILE: 'File appears to be empty. Please select a valid file.',
  CORRUPTED_FILE: 'File appears to be corrupted. Please try a different file.',
  
  // Category and Organization Errors
  INVALID_CATEGORY: 'Invalid category selected. Please choose a valid category.',
  CATEGORY_UPDATE_FAILED: 'Failed to update category. Please try again.',
  BULK_OPERATION_PARTIAL_FAILURE: (successful: number, failed: number) =>
    `${successful} items processed successfully, ${failed} failed. Please review and retry failed items.`,
  
  // Generic Fallbacks
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again or contact support.',
  OPERATION_CANCELLED: 'Operation was cancelled.',
  
} as const;

/**
 * Media file size limits by type (in MB)
 */
export const MEDIA_SIZE_LIMITS = {
  PHOTO: 25,
  VIDEO: 100,
  DOCUMENT: 50,
  BATCH_TOTAL: 500,
} as const;

/**
 * Supported file formats by media type
 */
export const SUPPORTED_FORMATS = {
  PHOTO: ['JPG', 'JPEG', 'PNG', 'WEBP', 'HEIC'],
  VIDEO: ['MP4', 'MOV', 'AVI', 'WEBM'],
  DOCUMENT: ['PDF', 'DOC', 'DOCX', 'TXT', 'RTF'],
} as const;

/**
 * Helper function to get appropriate error message for file size validation
 */
export function getFileSizeError(
  mediaType: keyof typeof MEDIA_SIZE_LIMITS,
  fileSizeBytes: number
): string | null {
  const fileSizeMB = fileSizeBytes / (1024 * 1024);
  const limit = MEDIA_SIZE_LIMITS[mediaType];
  
  if (fileSizeMB > limit) {
    return MEDIA_ERROR_MESSAGES.FILE_SIZE_EXCEEDED(limit, fileSizeMB);
  }
  
  return null;
}

/**
 * Helper function to get appropriate error message for file format validation
 */
export function getFileFormatError(
  mediaType: keyof typeof SUPPORTED_FORMATS,
  fileName: string
): string | null {
  const extension = fileName.split('.').pop()?.toUpperCase();
  const supportedFormats = SUPPORTED_FORMATS[mediaType];
  
  if (!extension || !supportedFormats.includes(extension)) {
    return MEDIA_ERROR_MESSAGES.UNSUPPORTED_FORMAT(supportedFormats);
  }
  
  return null;
}

/**
 * Helper function to validate batch upload total size
 */
export function getBatchSizeError(files: File[]): string | null {
  const totalSizeBytes = files.reduce((sum, file) => sum + file.size, 0);
  const totalSizeMB = totalSizeBytes / (1024 * 1024);
  
  if (totalSizeMB > MEDIA_SIZE_LIMITS.BATCH_TOTAL) {
    return MEDIA_ERROR_MESSAGES.FILE_SIZE_BATCH_EXCEEDED(MEDIA_SIZE_LIMITS.BATCH_TOTAL);
  }
  
  return null;
}

/**
 * Helper function to determine media type from file extension
 */
export function getMediaTypeFromFile(fileName: string): keyof typeof MEDIA_SIZE_LIMITS | null {
  const extension = fileName.split('.').pop()?.toUpperCase();
  if (!extension) return null;
  
  if (SUPPORTED_FORMATS.PHOTO.includes(extension)) return 'PHOTO';
  if (SUPPORTED_FORMATS.VIDEO.includes(extension)) return 'VIDEO';
  if (SUPPORTED_FORMATS.DOCUMENT.includes(extension)) return 'DOCUMENT';
  
  return null;
}

/**
 * Comprehensive file validation function
 */
export function validateFile(file: File): {
  isValid: boolean;
  error?: string;
  mediaType?: keyof typeof MEDIA_SIZE_LIMITS;
} {
  // Determine media type
  const mediaType = getMediaTypeFromFile(file.name);
  if (!mediaType) {
    return {
      isValid: false,
      error: MEDIA_ERROR_MESSAGES.UNSUPPORTED_FORMAT(
        Object.values(SUPPORTED_FORMATS).flat()
      )
    };
  }
  
  // Check file size
  const sizeError = getFileSizeError(mediaType, file.size);
  if (sizeError) {
    return {
      isValid: false,
      error: sizeError,
      mediaType
    };
  }
  
  // Check for empty file
  if (file.size === 0) {
    return {
      isValid: false,
      error: MEDIA_ERROR_MESSAGES.EMPTY_FILE,
      mediaType
    };
  }
  
  return {
    isValid: true,
    mediaType
  };
}