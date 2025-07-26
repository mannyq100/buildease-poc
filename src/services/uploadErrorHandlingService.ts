/**
 * Upload Error Handling Service
 * Provides enhanced error messages, recovery actions, and user guidance for upload failures
 */

import { toast } from '@/hooks/use-toast';

export interface UploadError {
  code: string;
  message: string;
  originalError?: Error;
  context?: {
    fileName?: string;
    fileSize?: number;
    bucket?: string;
    projectId?: string;
    userId?: string;
  };
}

export interface ErrorRecoveryAction {
  label: string;
  action: () => Promise<void> | void;
  type: 'primary' | 'secondary';
  icon?: string;
}

export interface EnhancedErrorResult {
  userMessage: string;
  technicalMessage: string;
  severity: 'error' | 'warning' | 'info';
  recoveryActions: ErrorRecoveryAction[];
  shouldRetry: boolean;
  retryDelay?: number;
}

class UploadErrorHandlingService {
  /**
   * Process and enhance upload errors with user-friendly messages and recovery actions
   */
  static processUploadError(error: UploadError): EnhancedErrorResult {
    const { code, message, context } = error;

    // Map error codes to user-friendly messages and recovery actions
    switch (code) {
      case 'FILE_TOO_LARGE':
        return this.handleFileTooLargeError(context);
      
      case 'INVALID_FILE_TYPE':
        return this.handleInvalidFileTypeError(context);
      
      case 'NETWORK_ERROR':
        return this.handleNetworkError(context);
      
      case 'AUTHENTICATION_ERROR':
        return this.handleAuthenticationError(context);
      
      case 'PERMISSION_DENIED':
        return this.handlePermissionError(context);
      
      case 'STORAGE_QUOTA_EXCEEDED':
        return this.handleStorageQuotaError(context);
      
      case 'DATABASE_ERROR':
        return this.handleDatabaseError(context);
      
      case 'VALIDATION_ERROR':
        return this.handleValidationError(context);
      
      case 'SERVER_ERROR':
        return this.handleServerError(context);
      
      case 'TIMEOUT_ERROR':
        return this.handleTimeoutError(context);
      
      default:
        return this.handleGenericError(error);
    }
  }

  private static handleFileTooLargeError(context?: UploadError['context']): EnhancedErrorResult {
    const maxSize = this.getMaxSizeForContext(context?.bucket);
    const currentSize = context?.fileSize ? this.formatFileSize(context.fileSize) : 'unknown';
    
    return {
      userMessage: `File is too large (${currentSize}). Maximum allowed size is ${maxSize}.`,
      technicalMessage: `File size exceeds limit for bucket ${context?.bucket}`,
      severity: 'error',
      shouldRetry: false,
      recoveryActions: [
        {
          label: 'Compress Image',
          action: () => this.showImageCompressionGuide(),
          type: 'primary',
          icon: 'compress'
        },
        {
          label: 'Choose Different File',
          action: () => this.triggerFileSelection(),
          type: 'secondary',
          icon: 'file'
        }
      ]
    };
  }

  private static handleInvalidFileTypeError(context?: UploadError['context']): EnhancedErrorResult {
    const allowedTypes = this.getAllowedTypesForContext(context?.bucket);
    
    return {
      userMessage: `File type not supported. Please use: ${allowedTypes.join(', ')}`,
      technicalMessage: `Invalid MIME type for bucket ${context?.bucket}`,
      severity: 'error',
      shouldRetry: false,
      recoveryActions: [
        {
          label: 'Convert File',
          action: () => this.showFileConversionGuide(),
          type: 'primary',
          icon: 'convert'
        },
        {
          label: 'Choose Different File',
          action: () => this.triggerFileSelection(),
          type: 'secondary',
          icon: 'file'
        }
      ]
    };
  }

  private static handleNetworkError(context?: UploadError['context']): EnhancedErrorResult {
    return {
      userMessage: 'Upload failed due to network issues. Please check your connection and try again.',
      technicalMessage: 'Network connectivity error during upload',
      severity: 'warning',
      shouldRetry: true,
      retryDelay: 3000,
      recoveryActions: [
        {
          label: 'Retry Upload',
          action: () => this.retryUpload(context),
          type: 'primary',
          icon: 'refresh'
        },
        {
          label: 'Check Connection',
          action: () => this.showNetworkTroubleshooting(),
          type: 'secondary',
          icon: 'wifi'
        }
      ]
    };
  }

  private static handleAuthenticationError(context?: UploadError['context']): EnhancedErrorResult {
    return {
      userMessage: 'Your session has expired. Please sign in again to continue uploading.',
      technicalMessage: 'Authentication token expired or invalid',
      severity: 'error',
      shouldRetry: false,
      recoveryActions: [
        {
          label: 'Sign In Again',
          action: () => this.redirectToLogin(),
          type: 'primary',
          icon: 'login'
        },
        {
          label: 'Refresh Page',
          action: () => window.location.reload(),
          type: 'secondary',
          icon: 'refresh'
        }
      ]
    };
  }

  private static handlePermissionError(context?: UploadError['context']): EnhancedErrorResult {
    return {
      userMessage: 'You don\'t have permission to upload files to this project. Contact the project owner for access.',
      technicalMessage: `Insufficient permissions for bucket ${context?.bucket} in project ${context?.projectId}`,
      severity: 'error',
      shouldRetry: false,
      recoveryActions: [
        {
          label: 'Contact Project Owner',
          action: () => this.showContactProjectOwner(context?.projectId),
          type: 'primary',
          icon: 'user'
        },
        {
          label: 'View Project Details',
          action: () => this.navigateToProject(context?.projectId),
          type: 'secondary',
          icon: 'eye'
        }
      ]
    };
  }

  private static handleStorageQuotaError(context?: UploadError['context']): EnhancedErrorResult {
    return {
      userMessage: 'Storage quota exceeded. Please delete some files or upgrade your plan.',
      technicalMessage: 'Storage quota limit reached',
      severity: 'error',
      shouldRetry: false,
      recoveryActions: [
        {
          label: 'Manage Storage',
          action: () => this.navigateToStorageManagement(),
          type: 'primary',
          icon: 'storage'
        },
        {
          label: 'Upgrade Plan',
          action: () => this.navigateToUpgrade(),
          type: 'secondary',
          icon: 'upgrade'
        }
      ]
    };
  }

  private static handleDatabaseError(context?: UploadError['context']): EnhancedErrorResult {
    return {
      userMessage: 'There was a problem saving your file. Our team has been notified. Please try again.',
      technicalMessage: 'Database operation failed during upload',
      severity: 'error',
      shouldRetry: true,
      retryDelay: 5000,
      recoveryActions: [
        {
          label: 'Try Again',
          action: () => this.retryUpload(context),
          type: 'primary',
          icon: 'refresh'
        },
        {
          label: 'Contact Support',
          action: () => this.showSupportContact(),
          type: 'secondary',
          icon: 'help'
        }
      ]
    };
  }

  private static handleValidationError(context?: UploadError['context']): EnhancedErrorResult {
    return {
      userMessage: 'File validation failed. Please ensure your file meets the requirements and try again.',
      technicalMessage: 'File validation checks failed',
      severity: 'warning',
      shouldRetry: false,
      recoveryActions: [
        {
          label: 'View Requirements',
          action: () => this.showFileRequirements(context?.bucket),
          type: 'primary',
          icon: 'info'
        },
        {
          label: 'Choose Different File',
          action: () => this.triggerFileSelection(),
          type: 'secondary',
          icon: 'file'
        }
      ]
    };
  }

  private static handleServerError(context?: UploadError['context']): EnhancedErrorResult {
    return {
      userMessage: 'Server is temporarily unavailable. Please try again in a few moments.',
      technicalMessage: 'Internal server error during upload',
      severity: 'error',
      shouldRetry: true,
      retryDelay: 10000,
      recoveryActions: [
        {
          label: 'Try Again Later',
          action: () => this.scheduleRetry(context, 30000),
          type: 'primary',
          icon: 'clock'
        },
        {
          label: 'Check Status',
          action: () => this.checkServerStatus(),
          type: 'secondary',
          icon: 'server'
        }
      ]
    };
  }

  private static handleTimeoutError(context?: UploadError['context']): EnhancedErrorResult {
    return {
      userMessage: 'Upload timed out. This might be due to a slow connection or large file size.',
      technicalMessage: 'Upload operation timed out',
      severity: 'warning',
      shouldRetry: true,
      retryDelay: 5000,
      recoveryActions: [
        {
          label: 'Retry Upload',
          action: () => this.retryUpload(context),
          type: 'primary',
          icon: 'refresh'
        },
        {
          label: 'Compress File',
          action: () => this.showImageCompressionGuide(),
          type: 'secondary',
          icon: 'compress'
        }
      ]
    };
  }

  private static handleGenericError(error: UploadError): EnhancedErrorResult {
    return {
      userMessage: 'Upload failed due to an unexpected error. Please try again.',
      technicalMessage: error.message || 'Unknown error occurred',
      severity: 'error',
      shouldRetry: true,
      retryDelay: 3000,
      recoveryActions: [
        {
          label: 'Try Again',
          action: () => this.retryUpload(error.context),
          type: 'primary',
          icon: 'refresh'
        },
        {
          label: 'Contact Support',
          action: () => this.showSupportContact(),
          type: 'secondary',
          icon: 'help'
        }
      ]
    };
  }

  /**
   * Display enhanced error message with recovery actions
   */
  static showEnhancedError(error: UploadError): void {
    const enhanced = this.processUploadError(error);
    
    // Show toast with primary action
    toast({
      title: "Upload Failed",
      description: enhanced.userMessage,
      variant: enhanced.severity === 'error' ? 'destructive' : 'default',
      action: enhanced.recoveryActions.length > 0 ? {
        altText: enhanced.recoveryActions[0].label,
        onClick: enhanced.recoveryActions[0].action
      } : undefined
    });

    // Log technical details for debugging
    console.error('Upload Error Details:', {
      error,
      enhanced,
      timestamp: new Date().toISOString()
    });
  }

  // Helper methods for recovery actions
  private static async retryUpload(context?: UploadError['context']): Promise<void> {
    // Implementation would trigger retry logic
    console.log('Retrying upload:', context);
  }

  private static showImageCompressionGuide(): void {
    // Show modal or navigate to compression guide
    console.log('Showing image compression guide');
  }

  private static triggerFileSelection(): void {
    // Trigger file input click
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  }

  private static showFileConversionGuide(): void {
    console.log('Showing file conversion guide');
  }

  private static showNetworkTroubleshooting(): void {
    console.log('Showing network troubleshooting');
  }

  private static redirectToLogin(): void {
    window.location.href = '/login';
  }

  private static showContactProjectOwner(projectId?: string): void {
    console.log('Showing contact project owner for:', projectId);
  }

  private static navigateToProject(projectId?: string): void {
    if (projectId) {
      window.location.href = `/projects/${projectId}`;
    }
  }

  private static navigateToStorageManagement(): void {
    window.location.href = '/settings/storage';
  }

  private static navigateToUpgrade(): void {
    window.location.href = '/upgrade';
  }

  private static showSupportContact(): void {
    console.log('Showing support contact');
  }

  private static showFileRequirements(bucket?: string): void {
    console.log('Showing file requirements for bucket:', bucket);
  }

  private static scheduleRetry(context?: UploadError['context'], delay: number = 30000): void {
    setTimeout(() => this.retryUpload(context), delay);
  }

  private static checkServerStatus(): void {
    console.log('Checking server status');
  }

  // Utility methods
  private static getMaxSizeForContext(bucket?: string): string {
    switch (bucket) {
      case 'profiles': return '5MB';
      case 'project-inspiration': return '10MB';
      case 'progress-images': return '15MB';
      case 'documents': return '50MB';
      default: return '10MB';
    }
  }

  private static getAllowedTypesForContext(bucket?: string): string[] {
    switch (bucket) {
      case 'documents':
        return ['PDF', 'DOC', 'DOCX', 'XLS', 'XLSX', 'JPG', 'PNG'];
      default:
        return ['JPG', 'PNG', 'WEBP', 'GIF'];
    }
  }

  private static formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }
}

export default UploadErrorHandlingService;
