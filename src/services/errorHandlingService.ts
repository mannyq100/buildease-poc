/**
 * Unified Error Handling Service
 * Consolidates duplicate error handling patterns across the BuildEase application
 * Provides consistent error messaging and handling strategies
 */

import { toast } from 'sonner';

export class ErrorHandlingService {
  /**
   * Handle authentication-related errors
   */
  static handleAuthError(action?: string) {
    const message = action 
      ? `You must be logged in to ${action}`
      : 'You must be logged in to perform this action';
    toast.error(message);
  }

  /**
   * Handle file upload errors with specific messaging
   */
  static handleUploadError(fileName?: string, errorDetails?: string) {
    let message = fileName 
      ? `Failed to upload ${fileName}` 
      : 'Failed to upload file';
    
    if (errorDetails) {
      message += `: ${errorDetails}`;
    }
    
    toast.error(message);
  }

  /**
   * Handle generic mutation errors with contextual messaging
   */
  static handleMutationError(action: string, error: any) {
    const message = error?.message || `Failed to ${action}`;
    toast.error(message);
    
    // Log detailed error for debugging
    console.error(`Mutation error (${action}):`, error);
  }

  /**
   * Handle network/API errors with retry suggestions
   */
  static handleNetworkError(error: any, canRetry: boolean = false) {
    let message = 'Network error occurred';
    
    if (error?.message) {
      message = error.message;
    } else if (error?.code === 'NETWORK_ERROR') {
      message = 'Unable to connect to server';
    }
    
    if (canRetry) {
      message += '. Please try again.';
    }
    
    toast.error(message);
  }

  /**
   * Handle validation errors with field-specific messaging
   */
  static handleValidationError(fieldErrors: Record<string, string>) {
    const errors = Object.entries(fieldErrors);
    
    if (errors.length === 1) {
      const [field, message] = errors[0];
      toast.error(`${field}: ${message}`);
    } else {
      toast.error(`Please fix the following errors: ${errors.map(([field]) => field).join(', ')}`);
    }
  }

  /**
   * Handle permission-related errors
   */
  static handlePermissionError(action?: string) {
    const message = action 
      ? `You don\'t have permission to ${action}`
      : 'You don\'t have permission to perform this action';
    toast.error(message);
  }

  /**
   * Handle file validation errors
   */
  static handleFileValidationError(fileName: string, issue: 'size' | 'type' | 'format', details?: string) {
    let message = '';
    
    switch (issue) {
      case 'size':
        message = `${fileName} is too large${details ? ` (${details})` : ''}`;
        break;
      case 'type':
        message = `${fileName} is not a valid file type${details ? ` (expected: ${details})` : ''}`;
        break;
      case 'format':
        message = `${fileName} has an invalid format${details ? `: ${details}` : ''}`;
        break;
    }
    
    toast.error(message);
  }

  /**
   * Handle generic errors with fallback messaging
   */
  static handleGenericError(error: any, fallbackMessage: string = 'An unexpected error occurred') {
    const message = error?.message || fallbackMessage;
    toast.error(message);
    console.error('Generic error:', error);
  }

  /**
   * Handle success messages consistently
   */
  static showSuccess(message: string) {
    toast.success(message);
  }

  /**
   * Handle info messages consistently
   */
  static showInfo(message: string) {
    toast.info(message);
  }

  /**
   * Handle warning messages consistently
   */
  static showWarning(message: string) {
    toast.warning(message);
  }
}

/**
 * Utility type for error handling in mutations
 */
export interface ErrorContext {
  action: string;
  entityType?: string;
  entityId?: string;
  canRetry?: boolean;
  showToast?: boolean;
}

/**
 * Standardized error handler for React Query mutations
 */
export function createMutationErrorHandler(context: ErrorContext) {
  return (error: any, variables?: any, queryContext?: any) => {
    if (!context.showToast) {
      console.error(`Mutation error (${context.action}):`, error);
      return;
    }

    // Handle specific error types
    if (error?.code === 'AUTH_ERROR' || error?.message?.includes('authentication')) {
      ErrorHandlingService.handleAuthError(context.action);
    } else if (error?.code === 'PERMISSION_ERROR' || error?.message?.includes('permission')) {
      ErrorHandlingService.handlePermissionError(context.action);
    } else if (error?.code === 'NETWORK_ERROR' || !navigator.onLine) {
      ErrorHandlingService.handleNetworkError(error, context.canRetry);
    } else {
      ErrorHandlingService.handleMutationError(context.action, error);
    }
  };
}

/**
 * Standardized error handler for file operations
 */
export function createFileErrorHandler(fileName?: string) {
  return (error: any) => {
    if (error?.code === 'FILE_TOO_LARGE') {
      ErrorHandlingService.handleFileValidationError(fileName || 'File', 'size', error.details);
    } else if (error?.code === 'INVALID_FILE_TYPE') {
      ErrorHandlingService.handleFileValidationError(fileName || 'File', 'type', error.details);
    } else if (error?.code === 'INVALID_FILE_FORMAT') {
      ErrorHandlingService.handleFileValidationError(fileName || 'File', 'format', error.details);
    } else {
      ErrorHandlingService.handleUploadError(fileName, error?.message);
    }
  };
}