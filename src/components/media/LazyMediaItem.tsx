/**
 * Lazy Media Item Component - Phase 3.3
 * Optimized lazy loading with intersection observer and progressive image loading
 * Designed for construction sites with work glove-friendly interactions
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileImage, 
  FileVideo, 
  FileText, 
  Download, 
  Eye, 
  Calendar,
  AlertCircle,
  Loader2 
} from 'lucide-react';
import type { MediaItem } from '@/hooks/useMedia';

export interface LazyMediaItemProps {
  item: MediaItem;
  onClick?: () => void;
  onSelect?: (selected: boolean) => void;
  selected?: boolean;
  networkQuality: 'excellent' | 'good' | 'poor' | 'offline';
  className?: string;
  showMetadata?: boolean;
  interactionMode?: 'tap' | 'hover'; // For construction site optimization
}

interface ImageLoadState {
  loading: boolean;
  loaded: boolean;
  error: boolean;
  blurDataUrl?: string;
}

export function LazyMediaItem({
  item,
  onClick,
  onSelect,
  selected = false,
  networkQuality,
  className,
  showMetadata = true,
  interactionMode = 'tap', // Default to tap for mobile/construction use
}: LazyMediaItemProps) {
  const [isInView, setIsInView] = useState(false);
  const [imageState, setImageState] = useState<ImageLoadState>({
    loading: false,
    loaded: false,
    error: false,
  });
  const [isHovered, setIsHovered] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const element = itemRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(element);
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before the element is visible
        threshold: 0.1,
      }
    );

    observer.observe(element);
    return () => observer.unobserve(element);
  }, []);

  // Get appropriate image quality based on network
  const getImageQuality = useMemo(() => {
    switch (networkQuality) {
      case 'excellent':
        return 'high'; // Full resolution
      case 'good':
        return 'medium'; // Reduced resolution
      case 'poor':
        return 'low'; // Thumbnail only
      case 'offline':
        return 'cached'; // Only cached images
      default:
        return 'medium';
    }
  }, [networkQuality]);

  // Generate thumbnail URL based on media type and network quality
  const getThumbnailUrl = useCallback((item: MediaItem): string => {
    // For construction site optimization, we'd integrate with your media service
    // This is a placeholder implementation
    const baseUrl = item.filePath;
    
    if (item.mediaType === 'PHOTO') {
      // Add quality parameters based on network
      const qualityParam = {
        high: 'w=400&h=400&q=85',
        medium: 'w=300&h=300&q=70',
        low: 'w=150&h=150&q=50',
        cached: 'w=100&h=100&q=30'
      }[getImageQuality];
      
      return `${baseUrl}?${qualityParam}&f=webp`; // WebP format for better compression
    }
    
    return baseUrl;
  }, [getImageQuality]);

  // Handle image loading with progressive enhancement
  const handleImageLoad = useCallback(() => {
    setImageState(prev => ({ ...prev, loading: false, loaded: true, error: false }));
  }, []);

  const handleImageError = useCallback(() => {
    setImageState(prev => ({ ...prev, loading: false, loaded: false, error: true }));
  }, []);

  // Start loading when in view
  useEffect(() => {
    if (isInView && item.mediaType === 'PHOTO' && !imageState.loaded && !imageState.loading && !imageState.error) {
      setImageState(prev => ({ ...prev, loading: true }));
    }
  }, [isInView, item.mediaType, imageState]);

  // Get media type icon
  const getMediaIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'PHOTO':
        return <FileImage className="h-4 w-4" />;
      case 'VIDEO':
        return <FileVideo className="h-4 w-4" />;
      case 'DOCUMENT':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  // Handle selection change
  const handleSelectionChange = useCallback((checked: boolean) => {
    onSelect?.(checked);
  }, [onSelect]);

  // Handle click with construction site optimization (larger touch targets)
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.target === itemRef.current || e.target === imgRef.current) {
      onClick?.();
    }
  }, [onClick]);

  // Render loading placeholder
  const renderLoadingPlaceholder = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  // Render error placeholder  
  const renderErrorPlaceholder = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted text-muted-foreground">
      <AlertCircle className="h-8 w-8 mb-2" />
      <span className="text-xs text-center px-2">Failed to load</span>
    </div>
  );

  // Render media preview
  const renderMediaPreview = () => {
    if (item.mediaType === 'PHOTO') {
      if (!isInView) {
        return (
          <div className="absolute inset-0 bg-muted flex items-center justify-center">
            <FileImage className="h-8 w-8 text-muted-foreground" />
          </div>
        );
      }

      return (
        <>
          {imageState.loading && renderLoadingPlaceholder()}
          {imageState.error && renderErrorPlaceholder()}
          {isInView && (
            <img
              ref={imgRef}
              src={getThumbnailUrl(item)}
              alt={item.name}
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
                imageState.loaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
          )}
        </>
      );
    }

    if (item.mediaType === 'VIDEO') {
      return (
        <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
          <div className="bg-black/50 rounded-full p-3">
            <FileVideo className="h-8 w-8 text-white" />
          </div>
        </div>
      );
    }

    // Document preview
    return (
      <div className="absolute inset-0 bg-muted flex items-center justify-center">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  };

  return (
    <Card
      ref={itemRef}
      className={cn(
        "relative overflow-hidden transition-all duration-200 cursor-pointer group",
        "hover:shadow-lg hover:scale-[1.02]", // Subtle hover effects
        selected && "ring-2 ring-primary ring-offset-2",
        interactionMode === 'tap' && "touch-manipulation", // Optimize for touch
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Media preview area */}
      <div className="relative aspect-square">
        {renderMediaPreview()}
        
        {/* Network quality indicator */}
        {networkQuality !== 'excellent' && (
          <div className="absolute top-2 right-2">
            <Badge
              variant={networkQuality === 'poor' ? 'destructive' : 'secondary'}
              className="text-xs px-1 py-0"
            >
              {networkQuality === 'poor' ? 'Low' : networkQuality === 'good' ? 'Med' : 'Off'}
            </Badge>
          </div>
        )}

        {/* Selection checkbox - larger touch target for construction sites */}
        {onSelect && (
          <div className="absolute top-2 left-2">
            <div className="bg-background/80 rounded-md p-1">
              <Checkbox
                checked={selected}
                onCheckedChange={handleSelectionChange}
                className="h-5 w-5" // Larger checkbox for work gloves
                aria-label={`Select ${item.name}`}
              />
            </div>
          </div>
        )}

        {/* Action buttons on hover/tap - construction site friendly */}
        {(isHovered || interactionMode === 'tap') && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
            <div className="flex items-center justify-between">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 px-3 text-xs bg-background/90 hover:bg-background min-h-[44px] min-w-[44px]" // Larger touch targets
                onClick={(e) => {
                  e.stopPropagation();
                  onClick?.();
                }}
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>

              <Button
                size="sm"
                variant="secondary"
                className="h-8 px-3 text-xs bg-background/90 hover:bg-background min-h-[44px] min-w-[44px]"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle download
                }}
              >
                <Download className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Media type badge */}
        <div className="absolute bottom-2 right-2">
          <Badge variant="outline" className="bg-background/90 text-xs">
            {getMediaIcon(item.mediaType)}
            <span className="ml-1 hidden sm:inline">{item.mediaType}</span>
          </Badge>
        </div>
      </div>

      {/* Metadata section */}
      {showMetadata && (
        <div className="p-3 space-y-2">
          <div>
            <h4 className="font-medium text-sm truncate" title={item.name}>
              {item.name}
            </h4>
            {item.description && (
              <p className="text-xs text-muted-foreground truncate" title={item.description}>
                {item.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(item.createdAt)}</span>
            </div>
            <span>{formatFileSize(item.fileSize)}</span>
          </div>

          {/* Category badge */}
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {item.category.replace('_', ' ')}
            </Badge>
            
            {/* Phase indicator if available */}
            {item.phaseId && (
              <Badge variant="outline" className="text-xs">
                Phase
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Loading indicator overlay */}
      {!isInView && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
    </Card>
  );
}