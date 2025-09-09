/**
 * ProjectImageDisplay.tsx
 * Enhanced reusable component for displaying project profile/inspiration images
 * with loading states, error handling, and responsive sizing options
 */
import React, { useState, useCallback } from 'react';
import { cn } from '@/utils/core/ui';
import { Building, ImageOff, Loader2 } from 'lucide-react';

interface ProjectImageDisplayProps {
  src?: string | null;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
  aspectRatio?: 'square' | '16:9' | '4:3' | 'auto';
  priority?: boolean;
  showLoadingState?: boolean;
  showErrorState?: boolean;
  onLoad?: () => void;
  onError?: (error: Event) => void;
}

export function ProjectImageDisplay({
  src,
  alt = 'Project image',
  className,
  fallbackClassName,
  aspectRatio = 'square',
  priority = false,
  showLoadingState = true,
  showErrorState = true,
  onLoad,
  onError
}: ProjectImageDisplayProps) {
  const [loadingState, setLoadingState] = useState<'loading' | 'loaded' | 'error' | 'no-src'>('loading');
  
  // Determine aspect ratio class
  const aspectRatioClass = {
    'square': 'aspect-square',
    '16:9': 'aspect-video',
    '4:3': 'aspect-4/3',
    'auto': ''
  }[aspectRatio];
  
  // Handle image load success
  const handleLoad = useCallback(() => {
    setLoadingState('loaded');
    onLoad?.();
  }, [onLoad]);
  
  // Handle image load error
  const handleError = useCallback((event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.warn('Image load error for URL:', src, event.nativeEvent);
    setLoadingState('error');
    onError?.(event.nativeEvent);
  }, [onError, src]);
  
  // Set initial state based on src
  React.useEffect(() => {
    if (!src || src.trim() === '') {
      console.log('ProjectImageDisplay: No src provided');
      setLoadingState('no-src');
    } else {
      console.log('ProjectImageDisplay: Loading image:', src);
      setLoadingState('loading');
    }
  }, [src]);
  
  // Base container classes
  const containerClasses = cn(
    "relative overflow-hidden",
    aspectRatioClass,
    className
  );
  
  // Fallback content classes
  const fallbackClasses = cn(
    "bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900",
    "flex items-center justify-center",
    "transition-colors duration-200",
    aspectRatioClass,
    fallbackClassName || className
  );
  
  // If no image source is provided, show building icon fallback
  if (loadingState === 'no-src') {
    return (
      <div className={fallbackClasses}>
        <Building className="h-8 w-8 sm:h-12 sm:w-12 text-slate-400 dark:text-slate-600" />
      </div>
    );
  }
  
  // If image failed to load, show error state
  if (loadingState === 'error' && showErrorState) {
    return (
      <div className={fallbackClasses}>
        <div className="flex flex-col items-center gap-2 text-center">
          <ImageOff className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400 dark:text-slate-600" />
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Image unavailable
          </span>
        </div>
      </div>
    );
  }
  
  return (
    <div className={containerClasses}>
      {/* Loading state overlay */}
      {loadingState === 'loading' && showLoadingState && (
        <div className={cn(
          "absolute inset-0 bg-slate-100 dark:bg-slate-800",
          "flex items-center justify-center z-10"
        )}>
          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400 animate-spin" />
        </div>
      )}
      
      {/* Actual image - only render if src is valid */}
      {src && src.trim() !== '' && (
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            loadingState === 'loaded' ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}
      
      {/* Subtle overlay for better text contrast when used as background */}
      {loadingState === 'loaded' && (
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
    </div>
  );
}
