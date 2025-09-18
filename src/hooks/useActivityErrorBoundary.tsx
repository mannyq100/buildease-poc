/**
 * useActivityErrorBoundary Hook
 * Enhanced error boundary with audit trail integration
 * Tracks errors and provides recovery mechanisms with full context
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useAuditTracker } from './useAuditTracker';
import { toast } from 'sonner';

interface ErrorInfo {
  error: Error;
  errorInfo?: {
    componentStack?: string;
    errorBoundary?: string;
  };
  timestamp: string;
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, unknown>;
}

interface UseActivityErrorBoundaryOptions {
  projectId?: string;
  fallbackComponent?: React.ComponentType<{ error: ErrorInfo; retry: () => void }>;
  onError?: (error: ErrorInfo) => void;
  enableAutoRecovery?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

interface UseActivityErrorBoundaryReturn {
  hasError: boolean;
  error: ErrorInfo | null;
  errorHistory: ErrorInfo[];
  retry: () => void;
  clearError: () => void;
  reportError: (error: Error, context?: Record<string, unknown>) => void;
  withErrorBoundary: <T extends any[]>(
    fn: (...args: T) => Promise<any> | any,
    context?: Record<string, unknown>
  ) => (...args: T) => Promise<void>;
}

export function useActivityErrorBoundary({
  projectId,
  onError,
  enableAutoRecovery = false,
  maxRetries = 3,
  retryDelay = 1000
}: UseActivityErrorBoundaryOptions = {}): UseActivityErrorBoundaryReturn {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [errorHistory, setErrorHistory] = useState<ErrorInfo[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [retryTimeout, setRetryTimeout] = useState<NodeJS.Timeout | null>(null);

  const { trackActivity, isTracking } = useAuditTracker({ projectId });

  // Generate unique error ID
  const generateErrorId = () => `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Determine error severity
  const determineErrorSeverity = (error: Error): ErrorInfo['severity'] => {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    // Critical errors
    if (
      message.includes('network') && message.includes('failed') ||
      message.includes('authentication') ||
      message.includes('unauthorized') ||
      stack.includes('chunk') && stack.includes('loading failed')
    ) {
      return 'critical';
    }

    // High severity errors
    if (
      message.includes('permission') ||
      message.includes('forbidden') ||
      message.includes('database') ||
      message.includes('server') ||
      error.name === 'TypeError' && stack.includes('null')
    ) {
      return 'high';
    }

    // Medium severity errors
    if (
      message.includes('validation') ||
      message.includes('format') ||
      message.includes('parse') ||
      error.name === 'ReferenceError'
    ) {
      return 'medium';
    }

    // Default to low severity
    return 'low';
  };

  // Create error info object
  const createErrorInfo = (error: Error, context?: Record<string, unknown>): ErrorInfo => {
    const errorInfo: ErrorInfo = {
      error,
      timestamp: new Date().toISOString(),
      id: generateErrorId(),
      severity: determineErrorSeverity(error),
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        retryCount,
        projectId,
        ...context
      }
    };

    return errorInfo;
  };

  // Report error to audit system
  const reportErrorToAudit = useCallback(async (errorInfo: ErrorInfo) => {
    if (!isTracking) return;

    try {
      await trackActivity('error.application', {
        entityType: 'system',
        description: `Application error: ${errorInfo.error.message}`,
        metadata: {
          error_id: errorInfo.id,
          error_name: errorInfo.error.name,
          error_message: errorInfo.error.message,
          error_stack: errorInfo.error.stack,
          error_severity: errorInfo.severity,
          retry_count: retryCount,
          context: errorInfo.context,
          component_stack: errorInfo.errorInfo?.componentStack
        },
        severity: errorInfo.severity,
        complianceRelevant: errorInfo.severity === 'critical' || errorInfo.severity === 'high'
      });
    } catch (auditError) {
      console.error('Failed to log error to audit system:', auditError);
    }
  }, [trackActivity, isTracking, retryCount]);

  // Handle error
  const handleError = useCallback((error: Error, context?: Record<string, unknown>) => {
    const errorInfo = createErrorInfo(error, context);
    
    setError(errorInfo);
    setHasError(true);
    setErrorHistory(prev => [errorInfo, ...prev.slice(0, 9)]); // Keep last 10 errors

    // Report to audit system
    reportErrorToAudit(errorInfo);

    // Call external error handler
    onError?.(errorInfo);

    // Show user notification based on severity
    switch (errorInfo.severity) {
      case 'critical':
        toast.error('Critical error occurred', {
          description: 'Please refresh the page or contact support',
          duration: 10000
        });
        break;
      case 'high':
        toast.error('An error occurred', {
          description: error.message,
          duration: 5000
        });
        break;
      case 'medium':
        toast.warning('Something went wrong', {
          description: 'Please try again',
          duration: 3000
        });
        break;
      case 'low':
        // Don't show toast for low severity errors
        console.warn('Low severity error:', error);
        break;
    }

    // Auto-recovery for certain error types
    if (enableAutoRecovery && retryCount < maxRetries && shouldAutoRecover(errorInfo)) {
      const delay = retryDelay * Math.pow(2, retryCount); // Exponential backoff
      const timeout = setTimeout(() => {
        retry();
      }, delay);
      setRetryTimeout(timeout);
    }
  }, [reportErrorToAudit, onError, enableAutoRecovery, retryCount, maxRetries, retryDelay]);

  // Check if error should trigger auto-recovery
  const shouldAutoRecover = (errorInfo: ErrorInfo): boolean => {
    const message = errorInfo.error.message.toLowerCase();
    
    // Auto-recover from network errors, timeouts, and temporary failures
    return (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('fetch') ||
      message.includes('connection') ||
      errorInfo.error.name === 'AbortError'
    );
  };

  // Retry function
  const retry = useCallback(() => {
    if (retryTimeout) {
      clearTimeout(retryTimeout);
      setRetryTimeout(null);
    }

    setRetryCount(prev => prev + 1);
    setHasError(false);
    setError(null);

    // Track retry attempt
    if (isTracking && error) {
      trackActivity('error.retry', {
        entityType: 'system',
        description: `Retrying after error: ${error.error.message}`,
        metadata: {
          error_id: error.id,
          retry_count: retryCount + 1,
          original_error: error.error.message
        },
        severity: 'low'
      });
    }

    toast.info('Retrying...', { duration: 2000 });
  }, [retryTimeout, error, isTracking, trackActivity, retryCount]);

  // Clear error
  const clearError = useCallback(() => {
    if (retryTimeout) {
      clearTimeout(retryTimeout);
      setRetryTimeout(null);
    }

    setHasError(false);
    setError(null);
    setRetryCount(0);
  }, [retryTimeout]);

  // Manual error reporting
  const reportError = useCallback((error: Error, context?: Record<string, unknown>) => {
    handleError(error, context);
  }, [handleError]);

  // Wrapper function with error boundary
  const withErrorBoundary = useCallback(<T extends any[]>(
    fn: (...args: T) => Promise<any> | any,
    context?: Record<string, unknown>
  ) => {
    return async (...args: T): Promise<any> => {
      try {
        const result = fn(...args);
        
        // Handle async functions
        if (result && typeof result.then === 'function') {
          return await result;
        }
        
        return result;
      } catch (error) {
        handleError(error instanceof Error ? error : new Error(String(error)), {
          function_name: fn.name,
          arguments: args,
          ...context
        });
        
        // Return null on error to indicate failure
        return null;
      }
    };
  }, [handleError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [retryTimeout]);

  // Reset retry count when error changes
  useEffect(() => {
    if (!hasError) {
      setRetryCount(0);
    }
  }, [hasError]);

  return {
    hasError,
    error,
    errorHistory,
    retry,
    clearError,
    reportError,
    withErrorBoundary
  };
}

// React Error Boundary component with audit integration
export class ActivityErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    projectId?: string;
    fallback?: React.ComponentType<{ error: ErrorInfo; retry: () => void }>;
    onError?: (error: ErrorInfo) => void;
  },
  {
    hasError: boolean;
    error: ErrorInfo | null;
  }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): { hasError: boolean; error: ErrorInfo } {
    const errorInfo: ErrorInfo = {
      error,
      timestamp: new Date().toISOString(),
      id: `boundary-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      severity: 'high', // Error boundary catches are generally serious
      context: {
        boundary: 'ActivityErrorBoundary',
        url: window.location.href
      }
    };

    return {
      hasError: true,
      error: errorInfo
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const enhancedErrorInfo: ErrorInfo = {
      ...this.state.error!,
      errorInfo: {
        componentStack: errorInfo.componentStack,
        errorBoundary: 'ActivityErrorBoundary'
      }
    };

    // Update state with enhanced error info
    this.setState({ error: enhancedErrorInfo });
    this.props.onError?.(enhancedErrorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback;
      
      if (FallbackComponent) {
        return <FallbackComponent error={this.state.error} retry={this.retry} />;
      }

      // Default error UI
      return (
        <div className="flex items-center justify-center min-h-[200px] p-6">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4">
              {this.state.error.error.message}
            </p>
            <button
              onClick={this.retry}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}