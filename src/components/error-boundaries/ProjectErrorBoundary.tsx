/**
 * Enhanced error boundary for ProjectDetails with recovery options
 * Provides construction worker-friendly error messages and actions
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, RefreshCcw, ArrowLeft, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { SupabaseErrorWithContext, ProjectErrorInfo } from '@/types/enhanced-project';
import { createProjectErrorInfo } from '@/lib/error-utils';

interface ProjectErrorBoundaryProps {
  error: SupabaseErrorWithContext;
  projectId: string;
  fallback?: () => JSX.Element;
}

export function ProjectErrorBoundary({ 
  error, 
  projectId, 
  fallback 
}: ProjectErrorBoundaryProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    queryClient.refetchQueries({ queryKey: ['project', projectId] });
  };
  
  const handleGoBack = () => {
    navigate('/projects', { replace: true });
  };
  
  const errorInfo = createProjectErrorInfo(error, handleRetry, handleGoBack);
  
  if (fallback) {
    return fallback();
  }
  
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-6 text-center">
          <ErrorIcon type={errorInfo.type} />
          
          <h2 className="text-xl font-semibold text-slate-900 mt-4 mb-2">
            {errorInfo.title}
          </h2>
          
          <p className="text-slate-600 mb-6 leading-relaxed">
            {errorInfo.message}
          </p>
          
          <div className="flex flex-col gap-3">
            {errorInfo.actions.primary && (
              <Button
                onClick={errorInfo.actions.primary.action}
                size="lg"
                className="w-full"
              >
                {errorInfo.actions.primary.label}
              </Button>
            )}
            
            {errorInfo.actions.secondary && (
              <Button
                onClick={errorInfo.actions.secondary.action}
                variant="outline"
                size="lg"
                className="w-full"
              >
                {errorInfo.actions.secondary.label}
              </Button>
            )}
          </div>
          
          {error.context === 'network' && (
            <NetworkStatusIndicator className="mt-4" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Error icon based on error type
 */
function ErrorIcon({ type }: { type: ProjectErrorInfo['type'] }) {
  const iconClass = "h-12 w-12 mx-auto";
  
  switch (type) {
    case 'not_found':
      return <AlertTriangle className={`${iconClass} text-orange-500`} />;
    case 'permission_denied':
      return <AlertTriangle className={`${iconClass} text-red-500`} />;
    case 'network':
      return <WifiOff className={`${iconClass} text-slate-500`} />;
    case 'loading':
      return <RefreshCcw className={`${iconClass} text-blue-500 animate-spin`} />;
    default:
      return <AlertTriangle className={`${iconClass} text-slate-500`} />;
  }
}

/**
 * Network status indicator for connection issues
 */
function NetworkStatusIndicator({ className }: { className?: string }) {
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
  
  return (
    <div className={`flex items-center justify-center gap-2 text-sm ${className}`}>
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4 text-green-500" />
          <span className="text-green-600">Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-red-500" />
          <span className="text-red-600">No Internet</span>
        </>
      )}
    </div>
  );
}

/**
 * Simple network error fallback for quick errors
 */
export function NetworkErrorFallback({ 
  onRetry, 
  onGoBack 
}: { 
  onRetry: () => void; 
  onGoBack: () => void; 
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 p-4">
      <WifiOff className="h-16 w-16 text-slate-400" />
      <div className="text-center">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Connection Problem
        </h3>
        <p className="text-slate-600 mb-4">
          Check your internet and try again.
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={onRetry} size="lg">
          <RefreshCcw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
        <Button onClick={onGoBack} variant="outline" size="lg">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    </div>
  );
}