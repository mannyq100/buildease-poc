/**
 * SmartProjectImageDisplay.tsx
 * Enhanced project image display with automatic URL validation and refresh
 * Handles expired signed URLs gracefully
 */
import React from 'react';
import { ProjectImageDisplay } from './project-image-display';
import { useValidImageUrl } from '@/utils/imageUrlHelper';

interface SmartProjectImageDisplayProps {
  /** Primary image URL (profile_image_url) */
  src?: string | null;
  /** Fallback image URL (profile_image_thumbnail_url) */
  fallbackSrc?: string | null;
  /** Media ID for generating fresh URLs */
  mediaId?: string;
  /** Alt text for the image */
  alt?: string;
  /** Additional CSS classes */
  className?: string;
  /** Fallback container classes */
  fallbackClassName?: string;
  /** Aspect ratio for the image */
  aspectRatio?: 'square' | '16:9' | '4:3' | 'auto';
  /** Priority loading */
  priority?: boolean;
  /** Callbacks */
  onLoad?: () => void;
  onError?: (error: Event) => void;
}

export function SmartProjectImageDisplay({
  src,
  fallbackSrc,
  mediaId,
  alt = 'Project image',
  className,
  fallbackClassName,
  aspectRatio = 'square',
  priority = false,
  onLoad,
  onError
}: SmartProjectImageDisplayProps) {
  
  // Use the smart URL validation hook
  const { imageUrl, isLoading, hasError } = useValidImageUrl(src, fallbackSrc, mediaId);

  // Handle load success
  const handleLoad = () => {
    onLoad?.();
  };

  // Handle load error - this will trigger the fallback in ProjectImageDisplay
  const handleError = (error: Event) => {
    onError?.(error);
  };

  // Show loading state while validating URLs
  if (isLoading && !imageUrl) {
    return (
      <ProjectImageDisplay
        src={null} // This will show the loader
        alt={alt}
        className={className}
        fallbackClassName={fallbackClassName}
        aspectRatio={aspectRatio}
        priority={priority}
        showLoadingState={true}
        onLoad={handleLoad}
        onError={handleError}
      />
    );
  }

  // Show the validated URL or let ProjectImageDisplay handle the fallback
  return (
    <ProjectImageDisplay
      src={imageUrl}
      alt={alt}
      className={className}
      fallbackClassName={fallbackClassName}
      aspectRatio={aspectRatio}
      priority={priority}
      showLoadingState={false} // We handle loading above
      showErrorState={true}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
}