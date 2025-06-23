/**
 * Enhanced Error Handler Hook
 * Comprehensive error handling with integration to the error boundary system
 * Provides consistent error handling across the BuildEase application
 */

import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { 
  normalizeError, 
  logError, 
  getUserErrorMessage, 
  AppError, 
  ErrorCode,
  isErrorOfType,
  createValidationError,
  createAuthError,
  createNotFoundError
} from '@/utils/core/error';

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  context?: Record<string, any>;
  fallbackMessage?: string;
}

/**
 * Hook for handling errors consistently across the application
 * Enhanced with comprehensive error categorization and reporting
 */
export function useErrorHandler() {
  /**
   * Handle general errors with comprehensive categorization
   */
  const handleError = useCallback((
    error: unknown, 
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      logError: shouldLog = true,
      context,
      fallbackMessage = 'An unexpected error occurred'
    } = options;

    const appError = normalizeError(error);
    
    // Log error if enabled
    if (shouldLog) {
      logError(appError, context);
    }

    // Show appropriate toast notification
    if (showToast) {
      const message = getUserErrorMessage(appError, fallbackMessage);
      
      switch (appError.code) {
        case ErrorCode.VALIDATION:
          toast.error('Validation Error', {
            description: message,
            duration: 5000
          });
          break;
          
        case ErrorCode.AUTH:
          toast.error('Authentication Required', {
            description: message,
            duration: 6000,
            action: {
              label: 'Sign In',
              onClick: () => window.location.href = '/auth'
            }
          });
          break;
          
        case ErrorCode.PERMISSION:
          toast.error('Access Denied', {
            description: message,
            duration: 5000
          });
          break;
          
        case ErrorCode.NOT_FOUND:
          toast.error('Not Found', {
            description: message,
            duration: 4000
          });
          break;
          
        case ErrorCode.NETWORK:
          toast.error('Connection Problem', {
            description: message,
            duration: 6000,
            action: {
              label: 'Retry',
              onClick: () => window.location.reload()
            }
          });
          break;
          
        case ErrorCode.SERVER:
          toast.error('Server Error', {
            description: message,
            duration: 7000,
            action: {
              label: 'Report Issue',
              onClick: () => console.log('Report issue functionality')
            }
          });
          break;
          
        default:
          toast.error('Error', {
            description: message,
            duration: 5000
          });
      }
    }

    return appError;
  }, []);

  /**
   * Handle validation errors specifically
   */
  const handleValidationError = useCallback((
    message: string, 
    fieldErrors?: Record<string, string>
  ) => {
    const error = createValidationError(message, fieldErrors);
    return handleError(error, { context: { type: 'validation', fieldErrors } });
  }, [handleError]);

  /**
   * Handle authentication errors
   */
  const handleAuthError = useCallback((message?: string) => {
    const error = createAuthError(message);
    return handleError(error, { context: { type: 'authentication' } });
  }, [handleError]);

  /**
   * Handle network/API errors
   */
  const handleNetworkError = useCallback((
    error: unknown, 
    operation?: string
  ) => {
    const context = { type: 'network', operation };
    return handleError(error, { context });
  }, [handleError]);

  /**
   * Handle async operation errors with retry capability
   */
  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options: ErrorHandlerOptions & { 
      retries?: number;
      retryDelay?: number;
      onRetry?: (attempt: number, error: AppError) => void;
    } = {}
  ): Promise<T> => {
    const { 
      retries = 0, 
      retryDelay = 1000,
      onRetry,
      ...errorOptions 
    } = options;

    let lastError: AppError;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await asyncFn();
      } catch (error) {
        lastError = normalizeError(error);
        
        if (attempt < retries) {
          onRetry?.(attempt + 1, lastError);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        
        // Handle final error
        handleError(lastError, {
          ...errorOptions,
          context: {
            ...errorOptions.context,
            attempts: attempt + 1,
            type: 'async_operation'
          }
        });
        
        throw lastError;
      }
    }
    
    throw lastError!;
  }, [handleError]);

  /**
   * Create a safe wrapper for async functions
   */
  const createSafeAsyncWrapper = useCallback(<T extends any[], R>(
    asyncFn: (...args: T) => Promise<R>,
    options: ErrorHandlerOptions = {}
  ) => {
    return async (...args: T): Promise<R | null> => {
      try {
        return await asyncFn(...args);
      } catch (error) {
        handleError(error, options);
        return null;
      }
    };
  }, [handleError]);

  /**
   * Error boundary integration - report errors to error boundary
   */
  const reportToBoundary = useCallback((
    error: Error,
    context?: Record<string, any>
  ) => {
    // This will be caught by error boundaries
    setTimeout(() => {
      throw error;
    }, 0);
    
    // Also handle it through our system
    handleError(error, { context });
  }, [handleError]);

  /**
   * Utility functions for error checking
   */
  const errorUtils = useMemo(() => ({
    isValidationError: (error: unknown) => isErrorOfType(error, ErrorCode.VALIDATION),
    isAuthError: (error: unknown) => isErrorOfType(error, ErrorCode.AUTH),
    isNetworkError: (error: unknown) => isErrorOfType(error, ErrorCode.NETWORK),
    isServerError: (error: unknown) => isErrorOfType(error, ErrorCode.SERVER),
    isNotFoundError: (error: unknown) => isErrorOfType(error, ErrorCode.NOT_FOUND),
    
    // Get user-friendly message
    getMessage: (error: unknown, fallback?: string) => getUserErrorMessage(error, fallback),
    
    // Normalize any error to AppError
    normalize: normalizeError
  }), []);

  return {
    // Core error handling
    handleError,
    handleValidationError,
    handleAuthError,
    handleNetworkError,
    handleAsyncError,
    
    // Utility functions
    createSafeAsyncWrapper,
    reportToBoundary,
    
    // Error checking utilities
    ...errorUtils,
    
    // Error factory functions for common scenarios
    createValidationError,
    createAuthError,
    createNotFoundError
  };
}
