/**
 * Enhanced error boundary for Projects page with recovery options
 * Provides construction worker-friendly error messages and actions
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, RefreshCcw, ArrowLeft, Wifi, WifiOff, Database, Users } from 'lucide-react';
import { TouchOptimizedButton } from '@/components/ui/TouchOptimizedButton';
import { Card, CardContent } from '@/components/ui/card';
import type { SupabaseErrorWithContext, ProjectsErrorInfo } from '@/types/enhanced-projects';
import { createProjectErrorInfo } from '@/lib/error-utils';

interface ProjectsErrorBoundaryProps {
  error: SupabaseErrorWithContext;
  component?: 'metrics' | 'filters' | 'projects-list' | 'search' | 'full-page';
  fallback?: () => JSX.Element;
  onRetry?: () => void;
}

export function ProjectsErrorBoundary({ 
  error, 
  component = 'full-page',
  fallback,
  onRetry
}: ProjectsErrorBoundaryProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Default retry behavior - invalidate all project queries
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.refetchQueries({ queryKey: ['projects'] });
    }
  };
  
  const handleGoToProjects = () => {
    navigate('/projects', { replace: true });
  };
  
  const _handleRefreshPage = () => {
    window.location.reload();
  };
  
  // Component-specific error handling
  if (component !== 'full-page') {
    return (
      <ComponentErrorFallback 
        error={error}
        component={component}
        onRetry={handleRetry}
        fallback={fallback}
      />
    );
  }
  
  // Full page error handling
  const errorInfo = createProjectErrorInfo(error, handleRetry, handleGoToProjects);
  
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
              <TouchOptimizedButton
                touchSize="lg"
                onClick={errorInfo.actions.primary.action}
                className="w-full"
                hapticFeedback
              >
                {errorInfo.actions.primary.label}
              </TouchOptimizedButton>
            )}
            
            {errorInfo.actions.secondary && (
              <TouchOptimizedButton
                touchSize="lg"
                variant="outline"
                onClick={errorInfo.actions.secondary.action}
                className="w-full"
                hapticFeedback
              >
                {errorInfo.actions.secondary.label}
              </TouchOptimizedButton>
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
 * Component-specific error fallbacks for inline errors
 */
function ComponentErrorFallback({ 
  error, 
  component, 
  onRetry, 
  fallback 
}: {
  error: SupabaseErrorWithContext;
  component: string;
  onRetry: () => void;
  fallback?: () => JSX.Element;
}) {
  if (fallback) {
    return fallback();
  }
  
  const getComponentInfo = (comp: string) => {
    switch (comp) {
      case 'metrics':
        return {
          icon: Database,
          title: 'Metrics Unavailable',
          message: 'Unable to load project metrics right now.',
        };
      case 'filters':
        return {
          icon: AlertTriangle,
          title: 'Filters Unavailable',
          message: 'Project filters couldn\'t be loaded.',
        };
      case 'projects-list':
        return {
          icon: Users,
          title: 'Projects Unavailable',
          message: 'Your project list couldn\'t be loaded.',
        };
      case 'search':
        return {
          icon: AlertTriangle,
          title: 'Search Unavailable',
          message: 'Project search is temporarily unavailable.',
        };
      default:
        return {
          icon: AlertTriangle,
          title: 'Content Unavailable',
          message: 'This section couldn\'t be loaded.',
        };
    }
  };
  
  const { icon: Icon, title, message } = getComponentInfo(component);
  
  return (
    <div className="flex flex-col items-center justify-center p-8 border border-orange-200 bg-orange-50 rounded-lg">
      <Icon className="h-8 w-8 text-orange-500 mb-3" />
      <h3 className="font-medium text-orange-900 mb-2">{title}</h3>
      <p className="text-sm text-orange-700 text-center mb-4">{message}</p>
      
      <div className="flex gap-2">
        <TouchOptimizedButton
          touchSize="sm"
          variant="outline"
          onClick={onRetry}
          className="border-orange-300 text-orange-700 hover:bg-orange-100"
        >
          <RefreshCcw className="h-3 w-3 mr-1" />
          Retry
        </TouchOptimizedButton>
        
        {error.context === 'network' && (
          <TouchOptimizedButton
            touchSize="sm"
            variant="outline"
            onClick={() => window.location.reload()}
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            Refresh Page
          </TouchOptimizedButton>
        )}
      </div>
    </div>
  );
}

/**
 * Error icon based on error type
 */
function ErrorIcon({ type }: { type: ProjectsErrorInfo['type'] }) {
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
    case 'server':
      return <Database className={`${iconClass} text-red-500`} />;
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
        <TouchOptimizedButton 
          touchSize="lg" 
          onClick={onRetry}
          hapticFeedback
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          Try Again
        </TouchOptimizedButton>
        <TouchOptimizedButton 
          touchSize="lg"
          variant="outline" 
          onClick={onGoBack}
          hapticFeedback
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </TouchOptimizedButton>
      </div>
    </div>
  );
}