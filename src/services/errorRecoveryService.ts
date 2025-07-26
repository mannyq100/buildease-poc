/**
 * Error Recovery Service
 * Provides enhanced error handling with specific recovery actions for Create Project flow
 */

export interface ErrorRecoveryAction {
  type: 'retry' | 'navigate' | 'reload' | 'clear' | 'manual';
  label: string;
  action: () => void | Promise<void>;
  isPrimary?: boolean;
}

export interface EnhancedError {
  code: string;
  title: string;
  message: string;
  details?: string;
  recoveryActions: ErrorRecoveryAction[];
  isRetryable: boolean;
  category: 'network' | 'validation' | 'permission' | 'server' | 'storage' | 'upload';
}

export class ErrorRecoveryService {
  private static retryAttempts = new Map<string, number>();
  private static maxRetries = 3;

  /**
   * Categorizes and enhances errors with recovery actions
   */
  static enhanceError(
    error: any,
    context: 'form_submission' | 'image_upload' | 'validation' | 'storage',
    retryCallback?: () => Promise<void>,
    clearCallback?: () => void
  ): EnhancedError {
    const errorKey = `${context}_${error?.code || 'unknown'}`;
    const currentAttempts = this.retryAttempts.get(errorKey) || 0;

    // Network errors
    if (this.isNetworkError(error)) {
      return this.createNetworkError(errorKey, currentAttempts, retryCallback, clearCallback);
    }

    // Validation errors
    if (this.isValidationError(error)) {
      return this.createValidationError(error, clearCallback);
    }

    // Permission errors
    if (this.isPermissionError(error)) {
      return this.createPermissionError(error);
    }

    // Storage/Upload errors
    if (this.isStorageError(error)) {
      return this.createStorageError(error, errorKey, currentAttempts, retryCallback, clearCallback);
    }

    // Server errors
    if (this.isServerError(error)) {
      return this.createServerError(error, errorKey, currentAttempts, retryCallback);
    }

    // Generic fallback error
    return this.createGenericError(error, errorKey, currentAttempts, retryCallback, clearCallback);
  }

  private static isNetworkError(error: any): boolean {
    return (
      error?.message?.includes('fetch') ||
      error?.message?.includes('network') ||
      error?.code === 'NETWORK_ERROR' ||
      error?.name === 'NetworkError' ||
      !navigator.onLine
    );
  }

  private static isValidationError(error: any): boolean {
    return (
      error?.code?.includes('VALIDATION') ||
      error?.message?.includes('validation') ||
      error?.status === 400
    );
  }

  private static isPermissionError(error: any): boolean {
    return (
      error?.status === 401 ||
      error?.status === 403 ||
      error?.code?.includes('UNAUTHORIZED') ||
      error?.code?.includes('FORBIDDEN')
    );
  }

  private static isStorageError(error: any): boolean {
    return (
      error?.code?.includes('STORAGE') ||
      error?.message?.includes('upload') ||
      error?.message?.includes('file') ||
      error?.status === 413 // Payload too large
    );
  }

  private static isServerError(error: any): boolean {
    return (
      error?.status >= 500 ||
      error?.code?.includes('SERVER') ||
      error?.message?.includes('internal server error')
    );
  }

  private static createNetworkError(
    errorKey: string,
    attempts: number,
    retryCallback?: () => Promise<void>,
    clearCallback?: () => void
  ): EnhancedError {
    const actions: ErrorRecoveryAction[] = [];

    if (retryCallback && attempts < this.maxRetries) {
      actions.push({
        type: 'retry',
        label: `Retry (${attempts + 1}/${this.maxRetries})`,
        action: () => this.executeRetry(errorKey, retryCallback),
        isPrimary: true
      });
    }

    actions.push({
      type: 'reload',
      label: 'Refresh Page',
      action: () => window.location.reload()
    });

    if (clearCallback) {
      actions.push({
        type: 'clear',
        label: 'Clear Form',
        action: clearCallback
      });
    }

    return {
      code: 'NETWORK_ERROR',
      title: 'Connection Problem',
      message: 'Unable to connect to the server. Please check your internet connection.',
      details: 'This usually happens when your internet connection is unstable or the server is temporarily unavailable.',
      recoveryActions: actions,
      isRetryable: attempts < this.maxRetries,
      category: 'network'
    };
  }

  private static createValidationError(error: any, clearCallback?: () => void): EnhancedError {
    const actions: ErrorRecoveryAction[] = [
      {
        type: 'manual',
        label: 'Review Form',
        action: () => {
          // Scroll to first error field
          const errorField = document.querySelector('[data-error="true"]');
          errorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        },
        isPrimary: true
      }
    ];

    if (clearCallback) {
      actions.push({
        type: 'clear',
        label: 'Reset Form',
        action: clearCallback
      });
    }

    return {
      code: 'VALIDATION_ERROR',
      title: 'Form Validation Failed',
      message: error?.message || 'Please check the form fields and correct any errors.',
      details: 'Some required fields are missing or contain invalid data. Please review the highlighted fields.',
      recoveryActions: actions,
      isRetryable: false,
      category: 'validation'
    };
  }

  private static createPermissionError(error: any): EnhancedError {
    return {
      code: 'PERMISSION_ERROR',
      title: 'Access Denied',
      message: 'You don\'t have permission to perform this action.',
      details: 'Please log in again or contact support if the problem persists.',
      recoveryActions: [
        {
          type: 'navigate',
          label: 'Go to Login',
          action: () => window.location.href = '/login',
          isPrimary: true
        },
        {
          type: 'reload',
          label: 'Refresh Page',
          action: () => window.location.reload()
        }
      ],
      isRetryable: false,
      category: 'permission'
    };
  }

  private static createStorageError(
    error: any,
    errorKey: string,
    attempts: number,
    retryCallback?: () => Promise<void>,
    clearCallback?: () => void
  ): EnhancedError {
    const actions: ErrorRecoveryAction[] = [];

    if (retryCallback && attempts < this.maxRetries) {
      actions.push({
        type: 'retry',
        label: `Retry Upload (${attempts + 1}/${this.maxRetries})`,
        action: () => this.executeRetry(errorKey, retryCallback),
        isPrimary: true
      });
    }

    actions.push({
      type: 'manual',
      label: 'Choose Different Images',
      action: () => {
        // Focus on file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        fileInput?.click();
      }
    });

    if (clearCallback) {
      actions.push({
        type: 'clear',
        label: 'Remove Images',
        action: clearCallback
      });
    }

    const isFileTooLarge = error?.status === 413 || error?.message?.includes('too large');

    return {
      code: 'STORAGE_ERROR',
      title: isFileTooLarge ? 'File Too Large' : 'Upload Failed',
      message: isFileTooLarge 
        ? 'One or more images are too large. Please choose smaller images (max 10MB each).'
        : 'Failed to upload images. Please try again.',
      details: isFileTooLarge
        ? 'Try compressing your images or choosing different ones.'
        : 'This could be due to network issues or server problems.',
      recoveryActions: actions,
      isRetryable: !isFileTooLarge && attempts < this.maxRetries,
      category: 'upload'
    };
  }

  private static createServerError(
    error: any,
    errorKey: string,
    attempts: number,
    retryCallback?: () => Promise<void>
  ): EnhancedError {
    const actions: ErrorRecoveryAction[] = [];

    if (retryCallback && attempts < this.maxRetries) {
      actions.push({
        type: 'retry',
        label: `Retry (${attempts + 1}/${this.maxRetries})`,
        action: () => this.executeRetry(errorKey, retryCallback),
        isPrimary: true
      });
    }

    actions.push({
      type: 'reload',
      label: 'Refresh Page',
      action: () => window.location.reload()
    });

    return {
      code: 'SERVER_ERROR',
      title: 'Server Error',
      message: 'The server encountered an error. Please try again in a moment.',
      details: 'Our team has been notified and is working to resolve this issue.',
      recoveryActions: actions,
      isRetryable: attempts < this.maxRetries,
      category: 'server'
    };
  }

  private static createGenericError(
    error: any,
    errorKey: string,
    attempts: number,
    retryCallback?: () => Promise<void>,
    clearCallback?: () => void
  ): EnhancedError {
    const actions: ErrorRecoveryAction[] = [];

    if (retryCallback && attempts < this.maxRetries) {
      actions.push({
        type: 'retry',
        label: `Try Again (${attempts + 1}/${this.maxRetries})`,
        action: () => this.executeRetry(errorKey, retryCallback),
        isPrimary: true
      });
    }

    actions.push({
      type: 'reload',
      label: 'Refresh Page',
      action: () => window.location.reload()
    });

    if (clearCallback) {
      actions.push({
        type: 'clear',
        label: 'Start Over',
        action: clearCallback
      });
    }

    return {
      code: 'UNKNOWN_ERROR',
      title: 'Something Went Wrong',
      message: error?.message || 'An unexpected error occurred. Please try again.',
      details: 'If the problem persists, please contact support.',
      recoveryActions: actions,
      isRetryable: attempts < this.maxRetries,
      category: 'server'
    };
  }

  private static async executeRetry(errorKey: string, retryCallback: () => Promise<void>): Promise<void> {
    const currentAttempts = this.retryAttempts.get(errorKey) || 0;
    this.retryAttempts.set(errorKey, currentAttempts + 1);

    try {
      await retryCallback();
      // Reset retry count on success
      this.retryAttempts.delete(errorKey);
    } catch (error) {
      // Error will be handled by the calling code
      throw error;
    }
  }

  /**
   * Resets retry attempts for a specific error key
   */
  static resetRetryAttempts(errorKey: string): void {
    this.retryAttempts.delete(errorKey);
  }

  /**
   * Resets all retry attempts
   */
  static resetAllRetryAttempts(): void {
    this.retryAttempts.clear();
  }
}
