/**
 * File upload types and interfaces
 */

export interface FileUploadOptions {
  bucket: string;
  userId?: string; // Optional - if not provided, will be determined automatically
  projectId?: string; // Optional - for project-specific uploads (required for project-inspiration bucket)
  allowedTypes?: string[];
  maxSizeMB?: number;
  generateFileName?: (originalName: string) => string;
  onProgress?: (progress: number) => void;
  cacheControl?: string;
  upsert?: boolean;
  metadata?: Record<string, string>; // Optional metadata for the file
}

export interface FileUploadResult {
  success: boolean;
  publicUrl?: string;
  filePath?: string;
  error?: string;
}

export interface DeleteFileResult {
  success: boolean;
  error?: string;
}