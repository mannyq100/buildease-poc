/**
 * AuditErrorBoundary Component
 * Specialized error boundary for audit trail components
 * Provides graceful error handling and recovery mechanisms
 */

import React, { Component, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface AuditErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface AuditErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class AuditErrorBoundary extends Component<
  AuditErrorBoundaryProps,
  AuditErrorBoundaryState
> {
  constructor(props: AuditErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<AuditErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Audit component error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call external error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Card className="border-destructive/20">
          <CardContent className="p-6 text-center space-y-4">
            <div className="flex flex-col items-center space-y-2">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <h3 className="text-lg font-semibold">Something went wrong</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                {this.state.error?.message || 'An unexpected error occurred in the audit system'}
              </p>
            </div>
            
            <div className="space-y-2">
              <Button onClick={this.handleRetry} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="text-left text-xs mt-4">
                  <summary className="cursor-pointer font-medium">Technical Details</summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                    {this.state.error?.stack}
                    {'\n\nComponent Stack:'}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap components with audit error boundary
 */
export function withAuditErrorBoundary<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  errorBoundaryProps?: Omit<AuditErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: T) => (
    <AuditErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </AuditErrorBoundary>
  );

  WrappedComponent.displayName = `withAuditErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}