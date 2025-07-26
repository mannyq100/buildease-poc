/**
 * Centralized Upload Types
 * Single source of truth for all upload-related interfaces
 */

export type UploadStatus = 'pending' | 'uploading' | 'completed' | 'failed' | 'cancelled' | 'paused';

export type UploadType = 'images' | 'documents';

export interface BaseUploadTask {
  id: string;
  fileName: string;
  fileSize: number;
  status: UploadStatus;
  progress: number;
  error?: string;
  uploadedAt?: Date;
}

export interface UploadFile extends BaseUploadTask {
  file: File;
  preview?: string;
  bucket: string;
  type: UploadType;
}

export interface UploadConfig {
  bucket: string;
  acceptedTypes: string[];
  maxSizeBytes: number;
  maxFiles: number;
  label: string;
  description: string;
}

export interface UploadResult {
  id: string;
  url: string;
  name: string;
  size: number;
  type: UploadType;
  uploadedAt: Date;
}

export interface UploadError {
  code: string;
  message: string;
  details?: string;
  recoveryAction?: string;
}

// Upload configurations
export const UPLOAD_CONFIGS: Record<UploadType, UploadConfig> = {
  images: {
    bucket: 'progress-images',
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    maxFiles: 20,
    label: 'Progress Images',
    description: 'Upload construction progress photos'
  },
  documents: {
    bucket: 'documents',
    acceptedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png'
    ],
    maxSizeBytes: 25 * 1024 * 1024, // 25MB
    maxFiles: 50,
    label: 'Documents',
    description: 'Upload project documents, plans, and files'
  }
};

// Status color mappings
export const STATUS_COLORS: Record<UploadStatus, string> = {
  pending: 'bg-gray-100 text-gray-800',
  uploading: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-600',
  paused: 'bg-yellow-100 text-yellow-800'
};

// Error codes and messages
export const UPLOAD_ERRORS = {
  FILE_TOO_LARGE: {
    code: 'FILE_TOO_LARGE',
    message: 'File size exceeds the maximum limit',
    recoveryAction: 'Please choose a smaller file or compress the current file'
  },
  INVALID_FILE_TYPE: {
    code: 'INVALID_FILE_TYPE',
    message: 'File type is not supported',
    recoveryAction: 'Please choose a file with a supported format'
  },
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    message: 'Network connection failed',
    recoveryAction: 'Check your internet connection and try again'
  },
  STORAGE_ERROR: {
    code: 'STORAGE_ERROR',
    message: 'Failed to save file to storage',
    recoveryAction: 'Please try uploading again'
  },
  PERMISSION_DENIED: {
    code: 'PERMISSION_DENIED',
    message: 'You do not have permission to upload files',
    recoveryAction: 'Contact your project administrator for access'
  }
} as const;
