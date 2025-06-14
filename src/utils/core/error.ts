/**
 * Error handling utilities for consistent error management
 */

/**
 * Standard error structure for application errors
 */
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
  stack?: string;
}

/**
 * Error codes for different types of errors
 */
export enum ErrorCode {
  VALIDATION = 'VALIDATION_ERROR',
  NETWORK = 'NETWORK_ERROR',
  AUTH = 'AUTHENTICATION_ERROR',
  PERMISSION = 'PERMISSION_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  SERVER = 'SERVER_ERROR',
  CLIENT = 'CLIENT_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR'
}

/**
 * Create a standardized application error object
 * @param code - Error code
 * @param message - Human-readable error message
 * @param details - Additional error details (optional)
 * @returns Standardized AppError object
 */
export function createError(code: string, message: string, details?: unknown): AppError {
  return {
    code,
    message,
    details,
    stack: new Error().stack
  };
}

/**
 * Convert an unknown error to a standardized AppError
 * @param error - The error to convert
 * @returns Standardized AppError
 */
export function normalizeError(error: unknown): AppError {
  // If already an AppError, return it
  if (typeof error === 'object' && error !== null && 'code' in error && 'message' in error) {
    return error as AppError;
  }
  
  // If it's an Error instance
  if (error instanceof Error) {
    return {
      code: ErrorCode.UNKNOWN,
      message: error.message,
      stack: error.stack
    };
  }
  
  // If it's an HTTP error with a status code
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const errorWithStatus = error as { status: number; message?: string };
    const status = errorWithStatus.status;
    let code = ErrorCode.UNKNOWN;
    
    // Map HTTP status to error codes
    if (status >= 400 && status < 500) {
      if (status === 401) code = ErrorCode.AUTH;
      else if (status === 403) code = ErrorCode.PERMISSION;
      else if (status === 404) code = ErrorCode.NOT_FOUND;
      else if (status === 422) code = ErrorCode.VALIDATION;
      else code = ErrorCode.CLIENT;
    } else if (status >= 500) {
      code = ErrorCode.SERVER;
    }
    
    return {
      code,
      message: errorWithStatus.message || `HTTP Error ${status}`,
      details: error
    };
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return {
      code: ErrorCode.UNKNOWN,
      message: error
    };
  }
  
  // Fall back for truly unknown errors
  return {
    code: ErrorCode.UNKNOWN,
    message: 'An unknown error occurred',
    details: error
  };
}

/**
 * Get a user-friendly error message from any error
 * @param error - The error to format
 * @param fallback - Fallback message if none can be extracted
 * @returns User-friendly error message
 */
export function getUserErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const appError = normalizeError(error);
  
  // Return the error message or fallback to a generic message
  return appError.message || fallback;
}

/**
 * Log an error with consistent formatting
 * @param error - Error to log
 * @param context - Additional context information
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
  const appError = normalizeError(error);
  
  console.error('Application Error:', {
    code: appError.code,
    message: appError.message,
    details: appError.details,
    stack: appError.stack,
    context
  });
}

/**
 * Check if an error is a specific type based on its code
 * @param error - Error to check
 * @param code - Error code to check for
 * @returns True if the error matches the specified code
 */
export function isErrorOfType(error: unknown, code: string): boolean {
  const appError = normalizeError(error);
  return appError.code === code;
}

/**
 * Create common validation error
 * @param message - Error message
 * @param details - Field-specific validation details
 * @returns Validation error
 */
export function createValidationError(message: string, details?: Record<string, string>): AppError {
  return createError(ErrorCode.VALIDATION, message, details);
}

/**
 * Create common authentication error
 * @param message - Error message
 * @returns Auth error
 */
export function createAuthError(message = 'Authentication required'): AppError {
  return createError(ErrorCode.AUTH, message);
}

/**
 * Create common not found error
 * @param resource - Name of resource that wasn't found
 * @returns Not found error
 */
export function createNotFoundError(resource: string): AppError {
  return createError(ErrorCode.NOT_FOUND, `${resource} not found`);
}
