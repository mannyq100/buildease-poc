/**
 * Lazy Loading Setup for Media Components - Phase 3.4
 * Strategic code splitting for construction site performance optimization
 */

import React, { lazy, ComponentType, Suspense } from 'react';
import { cn } from '@/lib/utils';

// Construction site appropriate loading states
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  message?: string;
}

export function ConstructionLoadingSpinner({ 
  size = 'md', 
  className,
  message = 'Loading...'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={cn('flex flex-col items-center justify-center p-4', className)}>
      <div className={cn(
        'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
        sizeClasses[size]
      )} />
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

// Media grid loading state optimized for construction sites
export function MediaGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="aspect-square bg-muted animate-pulse rounded-lg"
        />
      ))}
    </div>
  );
}

// Virtual grid loading optimized for heavy data loads
export function VirtualGridSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="h-6 bg-muted animate-pulse rounded w-32" />
        <div className="h-8 bg-muted animate-pulse rounded w-24" />
      </div>
      <div className="border rounded-lg p-4">
        <MediaGridSkeleton />
      </div>
    </div>
  );
}

// Error boundaries for failed lazy loading
export interface MediaErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: any) => void;
}

export function MediaErrorFallback({ 
  error, 
  retry 
}: { 
  error: Error; 
  retry: () => void 
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-background">
      <div className="mb-4">
        <svg
          className="h-12 w-12 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold mb-2">Failed to load media components</h3>
      <p className="text-sm text-muted-foreground mb-4">
        This might be due to poor network connection. 
        {error.message && ` Error: ${error.message}`}
      </p>
      <button
        onClick={retry}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}

// Lazy loaded components with appropriate loading states
export const LazyVirtualMediaGrid = lazy(() => 
  import('./VirtualMediaGrid').then(module => ({
    default: module.VirtualMediaGrid
  }))
);

export const LazyMediaGrid = lazy(() => 
  import('../../pages/ProjectDetails/components/Media/components/MediaGrid').then(module => ({
    default: module.MediaGrid
  }))
);

export const LazyMediaItem = lazy(() => 
  import('./LazyMediaItem').then(module => ({
    default: module.LazyMediaItem
  }))
);

export const LazyMediaUpload = lazy(() => 
  import('../MediaUpload').then(module => ({
    default: module.default
  }))
);

// HOC for wrapping lazy components with construction site optimized loading
export function withMediaSuspense<T extends object>(
  Component: ComponentType<T>,
  loadingMessage?: string,
  errorFallback?: ComponentType<{ error: Error; retry: () => void }>
) {
  const WrappedComponent = (props: T) => (
    <Suspense 
      fallback={
        <ConstructionLoadingSpinner 
          size="lg"
          message={loadingMessage || 'Loading media components...'}
          className="min-h-[200px]"
        />
      }
    >
      <Component {...props} />
    </Suspense>
  );

  WrappedComponent.displayName = `withMediaSuspense(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Pre-configured lazy components for construction site usage
export const VirtualMediaGridLazy = withMediaSuspense(
  LazyVirtualMediaGrid,
  'Loading virtual media grid...'
);

export const MediaGridLazy = withMediaSuspense(
  LazyMediaGrid,
  'Loading media gallery...'
);

export const MediaUploadLazy = withMediaSuspense(
  LazyMediaUpload,
  'Loading upload interface...'
);

// Preloading strategies based on user interaction patterns
export const preloadMediaComponents = {
  // Preload virtual grid when user navigates to media sections
  virtualGrid: () => import('./VirtualMediaGrid'),
  
  // Preload upload components when user hovers over upload buttons
  uploadForm: () => import('../MediaUpload'),
  
  // Preload media grid when project details page loads
  mediaGrid: () => import('../../pages/ProjectDetails/components/Media/components/MediaGrid'),
  
  // Preload all media components for construction site offline preparation
  all: () => Promise.all([
    import('./VirtualMediaGrid'),
    import('../MediaUpload'),
    import('./LazyMediaItem'),
  ])
};

// Connection-aware preloading for construction sites
export function preloadBasedOnConnection() {
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const connection = (navigator as any).connection;
    
    // Only preload on good connections
    if (connection && connection.effectiveType && 
        ['4g', 'fast-3g'].includes(connection.effectiveType)) {
      preloadMediaComponents.all();
    }
  }
}

// Initialize preloading on good network conditions
if (typeof window !== 'undefined') {
  // Delay preloading to not interfere with critical resources
  setTimeout(preloadBasedOnConnection, 2000);
}