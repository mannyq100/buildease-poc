/**
 * LoadingBoundary Component
 * Provides Suspense boundaries and error handling for plan components
 * Includes elegant loading states and error recovery
 */

import React, { Suspense, ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

// Loading Skeleton Components
export const PlanLoadingSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="space-y-6"
  >
    {/* Header Skeleton */}
    <Card className="overflow-hidden border-gray-200 dark:border-gray-800">
      <div className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-64 animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse" />
          </div>
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-24 animate-pulse" />
        </div>
      </div>
      
      <CardContent className="p-0">
        <div className="grid grid-cols-4 divide-x divide-gray-100 dark:divide-gray-800">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 space-y-3">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mx-auto" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Phases Skeleton */}
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="border-gray-200 dark:border-gray-800 animate-pulse">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-2">
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-48" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
            <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  </motion.div>
);

export const ViewLoadingSkeleton = ({ viewType }: { viewType?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-4"
  >
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <Loader2 className="h-10 w-10 text-[#2B6CB0] animate-spin mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">
          Loading {viewType || 'view'}...
        </p>
      </div>
    </div>
  </motion.div>
);

export const ComponentLoadingSkeleton = ({ height = 'h-32' }: { height?: string }) => (
  <div className={`${height} bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse flex items-center justify-center`}>
    <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
  </div>
);

// Error Fallback Components
interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  title?: string;
  description?: string;
}

export const PlanErrorFallback = ({ 
  error, 
  resetErrorBoundary, 
  title = "Something went wrong",
  description = "We encountered an error while loading your plan. Please try again."
}: ErrorFallbackProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="p-8"
  >
    <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
      <CardContent className="p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
          {title}
        </h3>
        <p className="text-red-700 dark:text-red-300 mb-4">
          {description}
        </p>
        {process.env.NODE_ENV === 'development' && (
          <details className="text-left mb-4">
            <summary className="cursor-pointer text-sm text-red-600 dark:text-red-400 mb-2">
              Error Details (Development)
            </summary>
            <pre className="text-xs text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900/20 p-2 rounded overflow-auto max-h-32">
              {error.message}
            </pre>
          </details>
        )}
        <div className="flex gap-2 justify-center">
          <Button
            onClick={resetErrorBoundary}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/20"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Reload Page
          </Button>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export const ViewErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="p-6 text-center"
  >
    <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-3" />
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
      Failed to load view
    </h3>
    <p className="text-gray-600 dark:text-gray-400 mb-4">
      There was an error loading this view. Please try refreshing.
    </p>
    <Button
      onClick={resetErrorBoundary}
      variant="outline"
      size="sm"
    >
      <RefreshCw className="h-4 w-4 mr-2" />
      Retry
    </Button>
  </motion.div>
);

// Boundary Components
interface LoadingBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export const PlanLoadingBoundary = ({ 
  children, 
  fallback = <PlanLoadingSkeleton />,
  errorFallback,
  onError
}: LoadingBoundaryProps) => (
  <ErrorBoundary
    FallbackComponent={errorFallback ? () => <>{errorFallback}</> : PlanErrorFallback}
    onError={onError}
    onReset={() => window.location.reload()}
  >
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

export const ViewLoadingBoundary = ({ 
  children, 
  viewType,
  fallback,
  onError
}: LoadingBoundaryProps & { viewType?: string }) => (
  <ErrorBoundary
    FallbackComponent={ViewErrorFallback}
    onError={onError}
  >
    <Suspense fallback={fallback || <ViewLoadingSkeleton viewType={viewType} />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

export const ComponentLoadingBoundary = ({ 
  children, 
  height,
  onError
}: LoadingBoundaryProps & { height?: string }) => (
  <ErrorBoundary
    FallbackComponent={({ resetErrorBoundary }) => (
      <div className="p-4 text-center">
        <AlertTriangle className="h-6 w-6 text-amber-500 mx-auto mb-2" />
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Failed to load component
        </p>
        <Button onClick={resetErrorBoundary} variant="outline" size="sm">
          Retry
        </Button>
      </div>
    )}
    onError={onError}
  >
    <Suspense fallback={<ComponentLoadingSkeleton height={height} />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

// Hook for managing loading states
export function useLoadingState(initialState = false) {
  const [isLoading, setIsLoading] = React.useState(initialState);
  const [error, setError] = React.useState<Error | null>(null);

  const startLoading = React.useCallback(() => {
    setIsLoading(true);
    setError(null);
  }, []);

  const stopLoading = React.useCallback(() => {
    setIsLoading(false);
  }, []);

  const setLoadingError = React.useCallback((error: Error) => {
    setError(error);
    setIsLoading(false);
  }, []);

  const reset = React.useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setError: setLoadingError,
    reset
  };
}