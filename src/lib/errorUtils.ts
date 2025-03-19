/**
 * Error handling utilities for consistent error handling across the application
 */
import { AppError } from '@/types/common'
import { useToast } from '@/components/ui/use-toast'

/**
 * Creates a formatted AppError object from various error types
 * 
 * @param error The original error (could be any type)
 * @returns A standardized AppError object
 */
export function formatError(error: unknown): AppError {
  if (typeof error === 'string') {
    return {
      message: error,
      timestamp: new Date().toISOString()
    }
  }
  
  if (error instanceof Error) {
    return {
      message: error.message,
      details: error.stack,
      timestamp: new Date().toISOString()
    }
  }
  
  // Handle API errors that have a specific format
  if (error && typeof error === 'object' && 'message' in error) {
    return {
      message: String(error.message),
      code: 'code' in error ? String(error.code) : undefined,
      details: 'details' in error ? String(error.details) : undefined,
      timestamp: new Date().toISOString()
    }
  }
  
  // Fallback for unknown error types
  return {
    message: 'An unknown error occurred',
    timestamp: new Date().toISOString()
  }
}

/**
 * Custom hook for handling errors consistently across the application
 * 
 * @returns Object with error handling functions
 */
export function useErrorHandler() {
  const { toast } = useToast()
  
  /**
   * Handle an error with a toast notification
   * 
   * @param error The error to handle
   * @param title Optional custom title for the toast
   */
  const handleError = (error: unknown, title = 'Error') => {
    const formattedError = formatError(error)
    
    toast({
      title,
      description: formattedError.message,
      variant: 'destructive',
      duration: 5000,
    })
    
    // Optionally log the error to a monitoring service or console
    console.error('[App Error]:', formattedError)
    
    return formattedError
  }
  
  /**
   * Handle an API error with appropriate user feedback
   * 
   * @param error The API error to handle
   * @param fallbackMessage Message to show if error doesn't have a message
   */
  const handleApiError = (error: unknown, fallbackMessage = 'Failed to complete the request') => {
    const formattedError = formatError(error)
    const message = formattedError.message || fallbackMessage
    
    toast({
      title: 'API Error',
      description: message,
      variant: 'destructive',
      duration: 5000,
    })
    
    // Log detailed error for debugging
    console.error('[API Error]:', formattedError)
    
    return formattedError
  }
  
  /**
   * Show a validation error message to the user
   * 
   * @param message The validation error message
   */
  const handleValidationError = (message: string) => {
    toast({
      title: 'Validation Error',
      description: message,
      variant: 'destructive',
      duration: 5000,
    })
    
    return {
      message,
      timestamp: new Date().toISOString()
    }
  }
  
  return {
    handleError,
    handleApiError,
    handleValidationError,
    formatError
  }
} 