/**
 * File upload types and interfaces
 */

export interface FileUploadOptions {
  bucket: string;
  userId?: string; // Optional - if not provided, will be determined automatically
  allowedTypes?: string[];
  maxSizeMB?: number;
  generateFileName?: (originalName: string) => string;
  onProgress?: (progress: number) => void;
  cacheControl?: string;
  upsert?: boolean;
}

export interface FileUploadResult {
  success: boolean;
  publicUrl?: string;
  filePath?: string;
  error?: string;
}

export interface ProgressSimulator {
  start: () => void;
  stop: () => void;
}

export interface DeleteFileResult {
  success: boolean;
  error?: string;
}