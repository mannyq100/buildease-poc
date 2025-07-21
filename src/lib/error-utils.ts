/**
 * Enhanced error handling utilities for ProjectDetails
 * Provides type-safe error handling with user-friendly messages
 */

import type { SupabaseErrorWithContext, ProjectErrorInfo } from '@/types/enhanced-project';

/**
 * Converts various error types to standardized SupabaseErrorWithContext
 */
export function createSupabaseError(
  error: unknown,
  context: SupabaseErrorWithContext['context'] = 'network'
): SupabaseErrorWithContext {
  if (error instanceof Error) {
    const supabaseError = error as any;
    
    return {
      name: error.name,
      message: error.message,
      code: supabaseError?.code,
      details: supabaseError?.details,
      hint: supabaseError?.hint,
      context: determineErrorContext(error),
      retryable: isRetryableError(error),
      userMessage: getUserFriendlyMessage(error, context),
      stack: error.stack,
    };
  }
  
  return {
    name: 'UnknownError',
    message: 'An unexpected error occurred',
    context,
    retryable: true,
    userMessage: 'Something went wrong. Please try again.',
  };
}

/**
 * Determines the context of an error for better handling
 */
function determineErrorContext(error: Error): SupabaseErrorWithContext['context'] {
  const message = error.message.toLowerCase();
  const errorCode = (error as any)?.code;
  
  // Network errors
  if (message.includes('network') || message.includes('fetch') || errorCode === 'NETWORK_ERROR') {
    return 'network';
  }
  
  // Authentication errors
  if (message.includes('unauthorized') || message.includes('unauthenticated') || errorCode === 'PGRST301') {
    return 'auth';
  }
  
  // Permission errors
  if (message.includes('permission') || message.includes('forbidden') || errorCode === 'PGRST116') {
    return 'permission';
  }
  
  // Not found errors
  if (message.includes('not found') || errorCode === 'PGRST116') {
    return 'not_found';
  }
  
  // Validation errors
  if (message.includes('validation') || message.includes('invalid') || errorCode?.startsWith('23')) {
    return 'validation';
  }
  
  // Conflict errors
  if (message.includes('conflict') || errorCode === 'PGRST409') {
    return 'conflict';
  }
  
  return 'network';
}

/**
 * Determines if an error is retryable
 */
function isRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase();
  const errorCode = (error as any)?.code;
  
  // Network errors are usually retryable
  if (message.includes('network') || message.includes('timeout')) {
    return true;
  }
  
  // Server errors (5xx) are retryable
  if (errorCode >= 500 && errorCode < 600) {
    return true;
  }
  
  // Auth and permission errors are not retryable
  if (message.includes('unauthorized') || message.includes('forbidden')) {
    return false;
  }
  
  // Validation errors are not retryable without changes
  if (message.includes('validation') || message.includes('invalid')) {
    return false;
  }
  
  // Default to retryable for unknown errors
  return true;
}

/**
 * Gets user-friendly error messages for construction workers
 */
function getUserFriendlyMessage(
  error: Error, 
  context: SupabaseErrorWithContext['context']
): string {
  const message = error.message.toLowerCase();
  
  switch (context) {
    case 'network':
      if (message.includes('timeout')) {
        return 'Connection timed out. Check your internet and try again.';
      }
      return 'Connection problem. Please check your internet and try again.';
      
    case 'auth':
      return 'Please sign in again to continue.';
      
    case 'permission':
      return 'You don\'t have permission to access this project.';
      
    case 'not_found':
      return 'This project no longer exists or has been moved.';
      
    case 'validation':
      if (message.includes('required')) {
        return 'Please fill in all required fields.';
      }
      if (message.includes('email')) {
        return 'Please enter a valid email address.';
      }
      return 'Please check your input and try again.';
      
    case 'conflict':
      return 'This item was changed by someone else. Please refresh and try again.';
      
    default:
      return 'Something went wrong. Please try again.';
  }
}

/**
 * Creates ProjectErrorInfo for UI components
 */
export function createProjectErrorInfo(
  error: SupabaseErrorWithContext,
  onRetry?: () => void,
  onGoBack?: () => void
): ProjectErrorInfo {
  switch (error.context) {
    case 'not_found':
      return {
        type: 'not_found',
        title: 'Project Not Found',
        message: 'This project doesn\'t exist or you don\'t have access to it.',
        actions: {
          primary: onGoBack ? {
            label: 'Back to Projects',
            action: onGoBack,
          } : undefined,
          secondary: onRetry && error.retryable ? {
            label: 'Try Again',
            action: onRetry,
          } : undefined,
        },
      };
      
    case 'permission':
      return {
        type: 'permission_denied',
        title: 'Access Denied',
        message: 'You don\'t have permission to view this project.',
        actions: {
          primary: onGoBack ? {
            label: 'Back to Projects',
            action: onGoBack,
          } : undefined,
        },
      };
      
    case 'network':
      return {
        type: 'network',
        title: 'Connection Problem',
        message: 'Unable to load project data. Check your internet connection.',
        actions: {
          primary: onRetry ? {
            label: 'Try Again',
            action: onRetry,
          } : undefined,
          secondary: onGoBack ? {
            label: 'Go Back',
            action: onGoBack,
          } : undefined,
        },
      };
      
    case 'auth':
      return {
        type: 'permission_denied',
        title: 'Sign In Required',
        message: 'Please sign in to access this project.',
        actions: {
          primary: {
            label: 'Sign In',
            action: () => window.location.href = '/auth/login',
          },
        },
      };
      
    default:
      return {
        type: 'server',
        title: 'Something Went Wrong',
        message: error.userMessage,
        actions: {
          primary: onRetry && error.retryable ? {
            label: 'Try Again',
            action: onRetry,
          } : undefined,
          secondary: onGoBack ? {
            label: 'Go Back',
            action: onGoBack,
          } : undefined,
        },
      };
  }
}

/**
 * Logs errors for debugging while protecting user privacy
 */
export function logError(error: SupabaseErrorWithContext, context?: string): void {
  // Only log in development or with user consent
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 ProjectDetails Error${context ? ` (${context})` : ''}`);
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Context:', error.context);
    console.error('Retryable:', error.retryable);
    console.error('Details:', error.details);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    console.groupEnd();
  }
  
  // In production, send to error reporting service
  // TODO: Integrate with error reporting service (e.g., Sentry)
}