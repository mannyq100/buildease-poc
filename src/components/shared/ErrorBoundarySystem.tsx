/**
 * Comprehensive Error Boundary System for BuildEase
 * Advanced error handling with context-aware fallbacks, error reporting, and recovery strategies
 * Designed for React 19 with optimized performance and user experience
 */

import React, { Component, ErrorInfo, ReactNode, createContext, useContext, useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, ArrowLeft, Bug } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { logError, normalizeError, AppError, ErrorCode } from '@/utils/core/error';

// Error Context Types
export interface ErrorContextValue {
  reportError: (error: Error, context?: Record<string, any>) => void;
  clearError: () => void;
  errorCount: number;
  lastError: AppError | null;
}

// Error Context
const ErrorContext = createContext<ErrorContextValue | null>(null);

// Hook to use error context
export function useErrorContext() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorContext must be used within an ErrorProvider');
  }
  return context;
}

// Error Provider Component
interface ErrorProviderProps {
  children: ReactNode;
  onError?: (error: AppError, context?: Record<string, any>) => void;
}

export function ErrorProvider({ children, onError }: ErrorProviderProps) {
  const [errorCount, setErrorCount] = useState(0);
  const [lastError, setLastError] = useState<AppError | null>(null);

  const reportError = useCallback((error: Error, context?: Record<string, any>) => {
    const appError = normalizeError(error);
    setLastError(appError);
    setErrorCount(prev => prev + 1);
    
    // Log error
    logError(appError, context);
    
    // Call external error handler if provided
    onError?.(appError, context);
    
    // Show toast notification for non-critical errors
    if (appError.code !== ErrorCode.UNKNOWN) {
      toast.error(`Error: ${appError.message}`);
    }
  }, [onError]);

  const clearError = useCallback(() => {
    setLastError(null);
  }, []);

  const contextValue: ErrorContextValue = {
    reportError,
    clearError,
    errorCount,
    lastError
  };

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
    </ErrorContext.Provider>
  );
}

// Error Boundary Base Props
interface BaseErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  level: 'page' | 'section' | 'component';
  name?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

// Enhanced Base Error Boundary
class BaseErrorBoundary extends Component<BaseErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: BaseErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      eventId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Enhanced error logging with context
    const errorContext = {
      level: this.props.level,
      name: this.props.name,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    logError(error, errorContext);
    
    // Call custom error handler
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: BaseErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    if (hasError && !prevProps.hasError) {
      // Reset error boundary if resetKeys have changed
      if (resetKeys && resetKeys.some((key, index) => key !== prevProps.resetKeys?.[index])) {
        this.resetErrorBoundary();
      }

      // Reset error boundary if any prop changed and resetOnPropsChange is true
      if (resetOnPropsChange && prevProps !== this.props) {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId);
    }
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return this.renderDefaultErrorFallback();
    }

    return this.props.children;
  }

  private renderDefaultErrorFallback() {
    const { level, name } = this.props;
    const { error, eventId } = this.state;

    const errorTitle = this.getErrorTitle(level);
    const errorDescription = this.getErrorDescription(level);
    const actions = this.getErrorActions(level);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-0 shadow-lg max-w-2xl mx-auto my-8">
          <CardHeader className="bg-gradient-to-r from-red-600 to-red-500 text-white">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6" />
              <div>
                <CardTitle className="text-lg">{errorTitle}</CardTitle>
                {name && (
                  <p className="text-red-100 text-sm mt-1">
                    Error in: {name}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="space-y-4">
              <p className="text-slate-600 dark:text-slate-300">
                {errorDescription}
              </p>
              
              {error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                    View technical details
                  </summary>
                  <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-md text-sm text-red-800 dark:text-red-300 font-mono overflow-auto max-h-40 border">
                    <div className="mb-2 font-sans font-medium">Error Message:</div>
                    <div className="mb-3">{error.message}</div>
                    {error.stack && (
                      <>
                        <div className="mb-2 font-sans font-medium">Stack Trace:</div>
                        <div className="whitespace-pre-wrap text-xs">{error.stack}</div>
                      </>
                    )}
                  </div>
                </details>
              )}
              
              {eventId && (
                <div className="text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 p-2 rounded font-mono">
                  Error ID: {eventId}
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="bg-slate-50 dark:bg-slate-800/50 p-4 flex justify-end gap-3">
            {actions}
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  private getErrorTitle(level: string): string {
    switch (level) {
      case 'page':
        return 'Page Error';
      case 'section':
        return 'Section Error';
      case 'component':
        return 'Component Error';
      default:
        return 'Something went wrong';
    }
  }

  private getErrorDescription(level: string): string {
    switch (level) {
      case 'page':
        return 'This page encountered an error and cannot be displayed. You can try refreshing the page or navigate to a different section.';
      case 'section':
        return 'This section of the page encountered an error. Other parts of the page should still work normally.';
      case 'component':
        return 'A component on this page encountered an error. You can try reloading this section or continue using other features.';
      default:
        return 'An error occurred. Please try again or contact support if the problem persists.';
    }
  }

  private getErrorActions(level: string): ReactNode {
    const commonActions = (
      <>
        <Button 
          variant="outline" 
          onClick={this.resetErrorBoundary}
          className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </>
    );

    if (level === 'page') {
      return (
        <>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
            className="border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Page
          </Button>
        </>
      );
    }

    return commonActions;
  }
}

// Specialized Error Boundary Components
export function PageErrorBoundary({ children, name, onError }: Omit<BaseErrorBoundaryProps, 'level'>) {
  return (
    <BaseErrorBoundary 
      level="page" 
      name={name} 
      onError={onError}
      resetOnPropsChange={true}
    >
      {children}
    </BaseErrorBoundary>
  );
}

export function SectionErrorBoundary({ children, name, onError, resetKeys }: Omit<BaseErrorBoundaryProps, 'level'>) {
  return (
    <BaseErrorBoundary 
      level="section" 
      name={name} 
      onError={onError}
      resetKeys={resetKeys}
      resetOnPropsChange={true}
    >
      {children}
    </BaseErrorBoundary>
  );
}

export function ComponentErrorBoundary({ children, name, onError, fallback }: Omit<BaseErrorBoundaryProps, 'level'>) {
  return (
    <BaseErrorBoundary 
      level="component" 
      name={name} 
      onError={onError}
      fallback={fallback}
    >
      {children}
    </BaseErrorBoundary>
  );
}

// Async Error Boundary for handling async operations
interface AsyncErrorBoundaryProps {
  children: ReactNode;
  name?: string;
}

export function AsyncErrorBoundary({ children, name }: AsyncErrorBoundaryProps) {
  const [error, setError] = useState<Error | null>(null);
  const errorContext = useErrorContext();

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = new Error(event.reason);
      setError(error);
      errorContext.reportError(error, { 
        type: 'unhandled_promise_rejection',
        name 
      });
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [name, errorContext]);

  if (error) {
    return (
      <ComponentErrorBoundary name={`${name} (Async)`}>
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <Bug className="h-4 w-4" />
            <span className="font-medium">Async Operation Failed</span>
          </div>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            {error.message}
          </p>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setError(null)}
            className="mt-2 border-yellow-300 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-700 dark:text-yellow-300 dark:hover:bg-yellow-900/30"
          >
            Retry
          </Button>
        </div>
      </ComponentErrorBoundary>
    );
  }

  return <>{children}</>;
}

// HOC for wrapping components with error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  boundaryType: 'page' | 'section' | 'component' = 'component',
  name?: string
): React.FC<P> {
  return function WithErrorBoundary(props: P) {
    switch (boundaryType) {
      case 'page':
        return (
          <PageErrorBoundary name={name || Component.name}>
            <Component {...props} />
          </PageErrorBoundary>
        );
      case 'section':
        return (
          <SectionErrorBoundary name={name || Component.name}>
            <Component {...props} />
          </SectionErrorBoundary>
        );
      case 'component':
      default:
        return (
          <ComponentErrorBoundary name={name || Component.name}>
            <Component {...props} />
          </ComponentErrorBoundary>
        );
    }
  };
}

// Error Recovery Hook
export function useErrorRecovery() {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const retry = useCallback(async (operation: () => Promise<any>, maxRetries = 3) => {
    if (retryCount >= maxRetries) {
      throw new Error(`Operation failed after ${maxRetries} retries`);
    }

    setIsRetrying(true);
    try {
      const result = await operation();
      setRetryCount(0); // Reset on success
      return result;
    } catch (error) {
      setRetryCount(prev => prev + 1);
      throw error;
    } finally {
      setIsRetrying(false);
    }
  }, [retryCount]);

  const reset = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  return {
    retry,
    reset,
    retryCount,
    isRetrying,
    canRetry: retryCount < 3
  };
}

// Export the legacy ErrorBoundary for compatibility
export { ErrorBoundary } from '../ErrorBoundary';