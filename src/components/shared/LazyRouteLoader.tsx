/**
 * LazyRouteLoader Component
 * Provides loading states and error boundaries for code-split routes
 * Optimized for mobile construction site use with offline indicators
 */

import React, { Suspense } from 'react';
import { motion as m } from 'framer-motion';
import { Loader2, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LazyRouteLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  routeName?: string;
  showOfflineIndicator?: boolean;
}

// Enhanced loading component with BuildEase branding
const RouteLoadingFallback = ({ routeName }: { routeName?: string }) => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [loadingTime, setLoadingTime] = React.useState(0);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Track loading time for performance monitoring
    const startTime = Date.now();
    const timer = setInterval(() => {
      setLoadingTime(Date.now() - startTime);
    }, 100);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-buildease-blue-50/30 via-white to-buildease-earth-50/20 dark:from-gray-900 dark:via-buildease-blue-950/10 dark:to-buildease-earth-950/10 flex items-center justify-center p-4">
      <m.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        {/* BuildEase Logo */}
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-buildease-blue-600 to-buildease-blue-700 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">BE</span>
          </div>
          <h1 className="text-2xl font-bold text-buildease-blue-800 dark:text-buildease-blue-200">
            BuildEase
          </h1>
        </div>

        {/* Loading Animation */}
        <div className="mb-6">
          <div className="relative">
            <Loader2 className="h-8 w-8 text-buildease-blue-600 dark:text-buildease-blue-400 animate-spin mx-auto" />
            <div className="absolute inset-0 rounded-full border-2 border-buildease-blue-200/30 dark:border-buildease-blue-800/30"></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-buildease-earth-800 dark:text-buildease-earth-200 mb-2">
            {routeName ? `Loading ${routeName}...` : 'Loading...'}
          </h2>
          <p className="text-sm text-buildease-earth-600 dark:text-buildease-earth-400">
            Preparing your construction management dashboard
          </p>
        </div>

        {/* Connection Status */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {isOnline ? (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <Wifi className="h-4 w-4" />
              <span className="text-xs font-medium">Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <WifiOff className="h-4 w-4" />
              <span className="text-xs font-medium">Offline Mode</span>
            </div>
          )}
        </div>

        {/* Performance Info for Development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-yellow-50/80 dark:bg-yellow-900/20 border border-yellow-200/50 dark:border-yellow-800/50 rounded-lg">
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              Loading time: {(loadingTime / 1000).toFixed(1)}s
              {routeName && ` • Route: ${routeName}`}
            </p>
          </div>
        )}

        {/* Slow loading warning */}
        {loadingTime > 3000 && (
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/50 rounded-lg"
          >
            <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
              Taking longer than expected. This might be due to a slow connection.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Page
            </Button>
          </m.div>
        )}
      </m.div>
    </div>
  );
};

// Error boundary for route loading failures
class RouteErrorBoundary extends React.Component<
  { children: React.ReactNode; routeName?: string },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; routeName?: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Route loading error:', error, errorInfo);
    
    // In production, you would send this to your error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-buildease-blue-50/30 via-white to-buildease-earth-50/20 dark:from-gray-900 dark:via-buildease-blue-950/10 dark:to-buildease-earth-950/10 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <span className="text-red-600 dark:text-red-400 text-2xl">⚠️</span>
            </div>
            
            <h1 className="text-xl font-bold text-buildease-earth-800 dark:text-buildease-earth-200 mb-2">
              Failed to Load {this.props.routeName || 'Page'}
            </h1>
            
            <p className="text-sm text-buildease-earth-600 dark:text-buildease-earth-400 mb-6">
              There was an error loading this page. This might be due to a network issue or temporary problem.
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={() => window.location.reload()}
                className="w-full bg-buildease-blue-600 hover:bg-buildease-blue-700 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Page
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="w-full"
              >
                Go Back
              </Button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 p-4 bg-red-50/80 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 rounded-lg text-left">
                <h3 className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                  Development Error Details:
                </h3>
                <pre className="text-xs text-red-600 dark:text-red-400 overflow-auto">
                  {this.state.error.message}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const LazyRouteLoader: React.FC<LazyRouteLoaderProps> = ({
  children,
  fallback,
  routeName,
  showOfflineIndicator = true
}) => {
  return (
    <RouteErrorBoundary routeName={routeName}>
      <Suspense 
        fallback={
          fallback || (
            <RouteLoadingFallback 
              routeName={routeName} 
            />
          )
        }
      >
        {children}
      </Suspense>
    </RouteErrorBoundary>
  );
};

export default LazyRouteLoader;