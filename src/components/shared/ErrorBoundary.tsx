/**
 * ErrorBoundary component for React 19
 * Provides a fallback UI when errors occur in child components
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component that catches JavaScript errors anywhere in its child component tree
 * and displays a fallback UI instead of crashing the whole app
 * Optimized for React 19
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI with BuildEase styling
      return (
        <Card className="border-0 shadow-md overflow-hidden max-w-md mx-auto my-8">
          <CardHeader className="bg-gradient-to-r from-red-600 to-red-500 text-white">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6" />
              <CardTitle>Something went wrong</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <p className="text-slate-600 dark:text-slate-300">
                An error occurred in this part of the application. Try refreshing the page or contact support if the problem persists.
              </p>
              {this.state.error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md text-sm text-red-800 dark:text-red-300 font-mono overflow-auto max-h-32">
                  {this.state.error.toString()}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 dark:bg-slate-800/50 p-4 flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              Refresh Page
            </Button>
            <Button 
              variant="default" 
              onClick={() => this.setState({ hasError: false, error: null })}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Try Again
            </Button>
          </CardFooter>
        </Card>
      );
    }

    return this.props.children;
  }
}

/**
 * Functional component wrapper for ErrorBoundary
 * Makes it easier to use with React 19 function components
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
): React.FC<P> {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
