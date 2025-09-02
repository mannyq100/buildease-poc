/**
 * File Utility Functions
 * Helper functions for file operations, formatting, and validation
 */

import { memoryManager } from '@/utils/core/memoryManager';

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Check if file is an image
 */
export function isImageFile(filename: string | File): boolean {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
  
  if (filename instanceof File) {
    return filename.type.startsWith('image/');
  }
  
  const ext = getFileExtension(filename);
  return imageExtensions.includes(ext);
}

/**
 * Check if file is a video
 */
export function isVideoFile(filename: string | File): boolean {
  const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
  
  if (filename instanceof File) {
    return filename.type.startsWith('video/');
  }
  
  const ext = getFileExtension(filename);
  return videoExtensions.includes(ext);
}

/**
 * Check if file is a document
 */
export function isDocumentFile(filename: string | File): boolean {
  const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];
  
  if (filename instanceof File) {
    return filename.type.includes('document') || 
           filename.type.includes('pdf') || 
           filename.type.includes('text');
  }
  
  const ext = getFileExtension(filename);
  return documentExtensions.includes(ext);
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSizeInMB: number = 100): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}

/**
 * Validate file type
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  const fileExtension = getFileExtension(file.name);
  return allowedTypes.includes(fileExtension) || allowedTypes.includes(file.type);
}

/**
 * Generate a safe filename
 */
export function generateSafeFilename(originalName: string): string {
  const ext = getFileExtension(originalName);
  const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
  
  // Remove unsafe characters and replace with underscores
  const safeName = nameWithoutExt
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  const timestamp = Date.now();
  return `${safeName}_${timestamp}.${ext}`;
}

/**
 * Get MIME type from file extension
 */
export function getMimeTypeFromExtension(extension: string): string {
  const mimeTypes: Record<string, string> = {
    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'bmp': 'image/bmp',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    
    // Videos
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'wmv': 'video/x-ms-wmv',
    'flv': 'video/x-flv',
    'webm': 'video/webm',
    'mkv': 'video/x-matroska',
    
    // Documents
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'txt': 'text/plain',
    'rtf': 'application/rtf',
    'odt': 'application/vnd.oasis.opendocument.text',
    
    // Spreadsheets
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ods': 'application/vnd.oasis.opendocument.spreadsheet',
    
    // Presentations
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'odp': 'application/vnd.oasis.opendocument.presentation',
    
    // Archives
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    'tar': 'application/x-tar',
    'gz': 'application/gzip',
    
    // Other
    'json': 'application/json',
    'xml': 'application/xml',
    'csv': 'text/csv'
  };
  
  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
}

/**
 * Create a preview URL for a file using centralized memory manager
 */
export function createFilePreviewUrl(file: File): string | null {
  if (isImageFile(file) || isVideoFile(file)) {
    return memoryManager.createPreviewUrl(file);
  }
  return null;
}

/**
 * Cleanup object URL using centralized memory manager
 */
export function cleanupObjectUrl(url: string): void {
  if (url.startsWith('blob:')) {
    memoryManager.revokeBlobUrl(url);
  }
}

/**
 * Get file icon based on type
 */
export function getFileIcon(filename: string | File): string {
  const ext = filename instanceof File ? getFileExtension(filename.name) : getFileExtension(filename);
  
  // Return appropriate icon class or emoji
  if (isImageFile(filename)) return '🖼️';
  if (isVideoFile(filename)) return '🎥';
  
  switch (ext) {
    case 'pdf': return '📄';
    case 'doc':
    case 'docx': return '📝';
    case 'xls':
    case 'xlsx': return '📊';
    case 'ppt':
    case 'pptx': return '📽️';
    case 'zip':
    case 'rar':
    case '7z': return '🗜️';
    case 'txt': return '📄';
    default: return '📄';
  }
}

/**
 * Calculate file upload progress
 */
export function calculateUploadProgress(loaded: number, total: number): number {
  return Math.round((loaded / total) * 100);
}

/**
 * Estimate upload time remaining
 */
export function estimateUploadTime(loaded: number, total: number, startTime: number): string {
  const elapsed = Date.now() - startTime;
  const rate = loaded / elapsed; // bytes per millisecond
  const remaining = total - loaded;
  const estimatedMs = remaining / rate;
  
  if (estimatedMs < 1000) return 'Less than a second';
  if (estimatedMs < 60000) return `${Math.round(estimatedMs / 1000)} seconds`;
  if (estimatedMs < 3600000) return `${Math.round(estimatedMs / 60000)} minutes`;
  
  return `${Math.round(estimatedMs / 3600000)} hours`;
}

/**
 * Check if browser supports drag and drop
 */
export function supportsDragAndDrop(): boolean {
  const div = document.createElement('div');
  return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) &&
         'FormData' in window &&
         'FileReader' in window;
}

/**
 * Read file as data URL
 */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Read file as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

/**
 * Compress image file
 */
export function compressImage(file: File, maxWidth: number = 1920, maxHeight: number = 1080, quality: number = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        file.type,
        quality
      );
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    
    // Create blob URL with proper cleanup
    const blobUrl = memoryManager.createPreviewUrl(file);
    img.src = blobUrl;
    
    // Register cleanup callback to clean up when image loading is done
    memoryManager.registerCleanupCallback(blobUrl, () => {
      // Additional cleanup if needed
    });
  });
}