/**
 * Centralized Upload Utilities
 * Single source of truth for upload-related helper functions
 */

import { UploadStatus, UploadError, UPLOAD_ERRORS, UPLOAD_CONFIGS, UploadType } from '@/types/upload';
import { CheckCircle, AlertCircle, Clock, Upload, Pause, X } from 'lucide-react';

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Format upload speed
 */
export function formatUploadSpeed(bytesPerSecond: number): string {
  return `${formatFileSize(bytesPerSecond)}/s`;
}

/**
 * Get status icon component
 */
export function getStatusIcon(status: UploadStatus, className: string = "h-4 w-4") {
  const iconProps = { className };
  
  switch (status) {
    case 'completed':
      return <CheckCircle {...iconProps} className={`${className} text-green-500`} />;
    case 'failed':
      return <AlertCircle {...iconProps} className={`${className} text-red-500`} />;
    case 'uploading':
      return <Upload {...iconProps} className={`${className} text-blue-500 animate-pulse`} />;
    case 'paused':
      return <Pause {...iconProps} className={`${className} text-yellow-500`} />;
    case 'cancelled':
      return <X {...iconProps} className={`${className} text-gray-500`} />;
    default:
      return <Clock {...iconProps} className={`${className} text-gray-400`} />;
  }
}

/**
 * Validate file against upload configuration
 */
export function validateFile(file: File, type: UploadType): UploadError | null {
  const config = UPLOAD_CONFIGS[type];
  
  // Size validation
  if (file.size > config.maxSizeBytes) {
    return {
      ...UPLOAD_ERRORS.FILE_TOO_LARGE,
      details: `File size: ${formatFileSize(file.size)}, Maximum: ${formatFileSize(config.maxSizeBytes)}`
    };
  }
  
  // Type validation
  const isValidType = config.acceptedTypes.some(acceptedType => {
    if (acceptedType.endsWith('/*')) {
      return file.type.startsWith(acceptedType.slice(0, -1));
    }
    return file.type === acceptedType;
  });
  
  if (!isValidType) {
    return {
      ...UPLOAD_ERRORS.INVALID_FILE_TYPE,
      details: `File type: ${file.type}, Accepted: ${config.acceptedTypes.join(', ')}`
    };
  }
  
  return null;
}

/**
 * Create blob URL for file preview
 */
export function createPreviewUrl(file: File): string | null {
  if (file.type.startsWith('image/')) {
    return URL.createObjectURL(file);
  }
  return null;
}

/**
 * Cleanup blob URL
 */
export function cleanupPreviewUrl(url: string): void {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

/**
 * Generate unique upload ID
 */
export function generateUploadId(): string {
  return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate overall progress from multiple uploads
 */
export function calculateOverallProgress(uploads: { progress: number }[]): number {
  if (uploads.length === 0) return 0;
  const totalProgress = uploads.reduce((sum, upload) => sum + upload.progress, 0);
  return Math.round(totalProgress / uploads.length);
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' && UPLOAD_ERRORS[error.code as keyof typeof UPLOAD_ERRORS]) {
    return UPLOAD_ERRORS[error.code as keyof typeof UPLOAD_ERRORS].message;
  }
  return 'An unexpected error occurred during upload';
}

/**
 * Get recovery action for error
 */
export function getRecoveryAction(error: unknown): string {
  if (error && typeof error === 'object' && 'recoveryAction' in error && typeof error.recoveryAction === 'string') {
    return error.recoveryAction;
  }
  if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' && UPLOAD_ERRORS[error.code as keyof typeof UPLOAD_ERRORS]) {
    return UPLOAD_ERRORS[error.code as keyof typeof UPLOAD_ERRORS].recoveryAction;
  }
  return 'Please try again or contact support if the problem persists';
}

/**
 * Estimate time remaining for upload
 */
export function estimateTimeRemaining(
  bytesUploaded: number,
  totalBytes: number,
  uploadSpeed: number
): number {
  if (uploadSpeed <= 0) return 0;
  const remainingBytes = totalBytes - bytesUploaded;
  return Math.ceil(remainingBytes / uploadSpeed);
}

/**
 * Format time duration in human-readable format
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

/**
 * Check if device has camera capability
 */
export async function hasCamera(): Promise<boolean> {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return false;
    }
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some(device => device.kind === 'videoinput');
  } catch {
    return false;
  }
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
