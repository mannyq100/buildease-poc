/**
 * Error Boundary for Real-time Collaboration Components
 * Provides graceful error handling for WebSocket and real-time features
 */

import React from 'react';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  maxRetries?: number;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  retryCount: number;
  maxRetries: number;
}

export class CollaborationErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      errorInfo
    });

    // Log error for monitoring
    console.error('Collaboration Error Boundary caught an error:', error, errorInfo);
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    // Reset error state if resetKeys changed
    if (hasError && resetOnPropsChange && resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      );
      
      if (hasResetKeyChanged) {
        this.resetError();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  resetError = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: this.state.retryCount + 1
    });
  };

  retryAfterDelay = (delay: number = 2000) => {
    this.resetTimeoutId = window.setTimeout(() => {
      this.resetError();
    }, delay);
  };

  render() {
    const { hasError, error, retryCount } = this.state;
    const { children, fallback: Fallback, maxRetries = 3 } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (Fallback) {
        return (
          <Fallback
            error={error}
            resetError={this.resetError}
            retryCount={retryCount}
            maxRetries={maxRetries}
          />
        );
      }

      // Default fallback UI
      return (
        <DefaultErrorFallback
          error={error}
          resetError={this.resetError}
          retryCount={retryCount}
          maxRetries={maxRetries}
        />
      );
    }

    return children;
  }
}

/**
 * Default Error Fallback Component
 */
function DefaultErrorFallback({
  error,
  resetError,
  retryCount,
  maxRetries
}: ErrorFallbackProps) {
  const isNetworkError = error.message.includes('network') || 
                         error.message.includes('fetch') ||
                         error.message.includes('connection');
  
  const isWebSocketError = error.message.includes('websocket') ||
                          error.message.includes('realtime') ||
                          error.message.includes('collaboration');

  const canRetry = retryCount < maxRetries;

  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-destructive">
          {isNetworkError ? (
            <WifiOff className="h-5 w-5" />
          ) : (
            <AlertTriangle className="h-5 w-5" />
          )}
          {isWebSocketError ? 'Real-time Connection Error' : 'Something went wrong'}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            {isNetworkError ? (
              'Lost connection to real-time services. Please check your internet connection.'
            ) : isWebSocketError ? (
              'Unable to connect to real-time collaboration features. Some features may not work properly.'
            ) : (
              'An unexpected error occurred while loading this component.'
            )}
          </AlertDescription>
        </Alert>

        {process.env.NODE_ENV === 'development' && (
          <details className="text-sm">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
              Error Details (Development)
            </summary>
            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
              {error.message}
            </pre>
          </details>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {retryCount > 0 && `Retry attempt ${retryCount}/${maxRetries}`}
          </div>
          
          <div className="flex gap-2">
            {canRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetError}
                className="gap-2"
              >
                <RefreshCw className="h-3 w-3" />
                Try Again
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="gap-2"
            >
              <Wifi className="h-3 w-3" />
              Refresh Page
            </Button>
          </div>
        </div>

        {!canRetry && (
          <Alert>
            <AlertDescription>
              Max retry attempts reached. Please refresh the page or contact support if the problem persists.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Higher-order component for wrapping components with error boundary
 */
export function withCollaborationErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  return function WrappedComponent(props: P) {
    return (
      <CollaborationErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </CollaborationErrorBoundary>
    );
  };
}

/**
 * Lightweight Error Boundary Hook
 * For functional components that need error handling
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
    console.error('Error caught by useErrorHandler:', error);
  }, []);

  // Reset error when component unmounts
  React.useEffect(() => {
    return () => {
      setError(null);
    };
  }, []);

  return {
    error,
    resetError,
    handleError,
    hasError: error !== null
  };
}

/**
 * Network Status Error Boundary
 * Specifically for handling network-related errors in real-time features
 */
export function NetworkErrorFallback({
  error,
  resetError,
  retryCount,
  maxRetries
}: ErrorFallbackProps) {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-retry when coming back online
  React.useEffect(() => {
    if (isOnline && retryCount < maxRetries) {
      const timer = setTimeout(resetError, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, resetError, retryCount, maxRetries]);

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-600" />
            )}
          </div>
          
          <div className="flex-1">
            <p className="font-medium text-sm">
              {isOnline ? 'Connection restored' : 'Connection lost'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isOnline
                ? 'Attempting to reconnect to real-time features...'
                : 'Real-time features are temporarily unavailable'
              }
            </p>
          </div>

          {isOnline && retryCount < maxRetries && (
            <Button size="sm" variant="outline" onClick={resetError}>
              Reconnect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}