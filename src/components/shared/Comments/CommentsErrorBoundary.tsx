/**
 * CommentsErrorBoundary
 * Error boundary specifically for comment components
 * Provides graceful degradation when comment functionality fails
 */

import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface CommentsErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function CommentsErrorFallback({ error, resetErrorBoundary }: CommentsErrorFallbackProps) {
  return (
    <Card className="w-full border-destructive/20 bg-destructive/5">
      <CardContent className="p-6 text-center">
        <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-destructive mb-2">
          Comments Temporarily Unavailable
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          We're having trouble loading comments right now. Your project data is safe.
        </p>
        <div className="space-y-2">
          <Button
            onClick={resetErrorBoundary}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <details className="text-xs text-muted-foreground mt-4">
            <summary className="cursor-pointer hover:text-foreground">
              Technical Details
            </summary>
            <code className="block mt-2 p-2 bg-muted rounded text-xs">
              {error.message}
            </code>
          </details>
        </div>
      </CardContent>
    </Card>
  );
}

interface CommentsErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<CommentsErrorFallbackProps>;
}

export function CommentsErrorBoundary({ 
  children, 
  fallback: Fallback = CommentsErrorFallback 
}: CommentsErrorBoundaryProps) {
  return (
    <ErrorBoundary
      FallbackComponent={Fallback}
      onError={(error, errorInfo) => {
        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Comments Error Boundary triggered:', error, errorInfo);
        }
        
        // In production, you might want to send to error tracking service
        // Example: errorTrackingService.captureException(error, { extra: errorInfo });
      }}
      onReset={() => {
        // Optional: Additional reset logic
        console.log('Comments error boundary reset');
      }}
    >
      {children}
    </ErrorBoundary>
  );
}