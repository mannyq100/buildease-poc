/**
 * FormStepErrorBoundary Component
 * 
 * Error boundary specifically designed for project creation form steps
 * Provides graceful error handling with step-specific recovery options
 */
import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ChevronLeft } from 'lucide-react';
import { Button } from './button';
import { Card } from './card';

interface FormStepErrorBoundaryProps {
  children: ReactNode;
  stepNumber: number;
  stepTitle: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  fallback?: ReactNode;
}

interface FormStepErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class FormStepErrorBoundary extends Component<
  FormStepErrorBoundaryProps,
  FormStepErrorBoundaryState
> {
  constructor(props: FormStepErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<FormStepErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Form Step Error Boundary');
      console.error('Step:', this.props.stepNumber, '-', this.props.stepTitle);
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.groupEnd();
    }

    // In production, you might want to send this to an error reporting service
    // Example: errorReportingService.captureException(error, { extra: errorInfo });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Card className="p-8 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <div className="text-center space-y-6">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-800/50 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 font-inter">
                Something went wrong in Step {this.props.stepNumber}
              </h3>
              <p className="text-red-700 dark:text-red-300 font-opensans">
                We encountered an error while loading the {this.props.stepTitle} form. 
                Your progress has been saved automatically.
              </p>
            </div>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-red-100 dark:bg-red-800/30 p-4 rounded-lg">
                <summary className="cursor-pointer text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                  Debug Information
                </summary>
                <div className="text-xs font-mono text-red-700 dark:text-red-300 space-y-2">
                  <div>
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  <div>
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap mt-1">
                      {this.state.error.stack}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {this.props.onGoBack && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={this.props.onGoBack}
                  className="border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-800/50"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
              )}
              
              <Button
                type="button"
                onClick={this.handleRetry}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>

            {/* Help Text */}
            <p className="text-xs text-red-600 dark:text-red-400 font-opensans">
              If this problem persists, please refresh the page or contact support.
            </p>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook version of error boundary for functional components
 * Note: This is a pattern, not an actual hook since error boundaries must be class components
 */
export function useFormStepErrorBoundary() {
  return {
    ErrorBoundary: FormStepErrorBoundary,
  };
}