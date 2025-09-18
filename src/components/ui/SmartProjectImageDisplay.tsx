/**
 * SmartProjectImageDisplay.tsx
 * Enhanced project image display with automatic URL validation and refresh
 * Handles expired signed URLs gracefully
 */
import React, { useState, useEffect, useCallback } from 'react';
import { ProjectImageDisplay } from './project-image-display';
import { useAutoRefreshUrl } from '@/hooks/useAutoRefreshUrl';
import { useProjectProfileImage, getProfileImageUrls } from '@/hooks/useProjectProfileImage';
import { isSignedUrlExpired } from '@/services/URLValidator';

// Utility function to extract mediaId from Supabase signed URL
function extractMediaIdFromUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  
  try {
    // Supabase signed URLs typically have format: /storage/v1/object/sign/BUCKET/mediaId/path...
    // Extract the UUID part after the bucket name
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    // Find the bucket index and get the next part (should be mediaId)
    const bucketIndex = pathParts.findIndex(part => ['PHOTO', 'VIDEO', 'DOCUMENT'].includes(part));
    if (bucketIndex >= 0 && pathParts[bucketIndex + 1]) {
      const possibleMediaId = pathParts[bucketIndex + 1];
      // Validate it looks like a UUID
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(possibleMediaId)) {
        return possibleMediaId;
      }
    }
  } catch (error) {
    console.warn('Failed to extract mediaId from URL:', url, error);
  }
  
  return undefined;
}

// Utility function to extract projectId from URL path (for future profile image lookup)
function extractProjectIdFromUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    // Look for a UUID in the path that might be a project ID
    // This is less reliable but could be useful for debugging
    for (const part of pathParts) {
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(part)) {
        // Skip the mediaId we already found
        const mediaId = extractMediaIdFromUrl(url);
        if (part !== mediaId) {
          return part;
        }
      }
    }
  } catch (error) {
    console.warn('Failed to extract projectId from URL:', url, error);
  }
  
  return undefined;
}

interface SmartProjectImageDisplayProps {
  /** Primary image URL (profile_image_url) */
  src?: string | null;
  /** Fallback image URL (profile_image_thumbnail_url) */
  fallbackSrc?: string | null;
  /** Media ID for generating fresh URLs */
  mediaId?: string;
  /** Project ID for fetching current profile image directly */
  projectId?: string;
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
  projectId,
  alt = 'Project image',
  className,
  fallbackClassName,
  aspectRatio = 'square',
  priority = false,
  onLoad,
  onError
}: SmartProjectImageDisplayProps) {
  
  const [manualRefreshCount, setManualRefreshCount] = useState(0);
  const [knownBrokenMediaIds, setKnownBrokenMediaIds] = useState<Set<string>>(new Set());
  
  // Query current profile image if projectId is provided (primary method)
  const { data: profileImageData, isLoading: isLoadingProfile } = useProjectProfileImage(projectId);
  const profileUrls = getProfileImageUrls(profileImageData);
  
  // Determine the best source URLs to use
  const effectiveSrc = profileUrls.imageUrl || src;
  const effectiveFallbackSrc = profileUrls.thumbnailUrl || fallbackSrc;
  const effectiveMediaId = profileUrls.mediaId || mediaId || extractMediaIdFromUrl(effectiveSrc) || extractMediaIdFromUrl(effectiveFallbackSrc);
  
  // Extract mediaId from URL if not provided explicitly (fallback)
  const resolvedMediaId = effectiveMediaId;
  
  // Use auto-refresh hook if we have a mediaId for dynamic URL refresh
  const autoRefreshResult = useAutoRefreshUrl(
    resolvedMediaId, 
    effectiveSrc, 
    {
      autoRefresh: true,
      onRefresh: (newUrl) => {
        console.log(`🔄 Profile image URL refreshed for media ${resolvedMediaId}: ${newUrl}`);
      },
      onRefreshError: (error) => {
        // Reduce console noise for common media not found errors
        if (error.message.includes('not found')) {
          console.warn(`Media ${resolvedMediaId} no longer exists, will use fallback image. The project's profile_image_url may need to be updated to point to a current media item.`);
          // Mark this mediaId as broken to avoid future refresh attempts
          if (resolvedMediaId) {
            setKnownBrokenMediaIds(prev => new Set(prev).add(resolvedMediaId));
          }
        } else {
          console.error(`❌ Failed to refresh URL for media ${resolvedMediaId}:`, error);
        }
      }
    }
  );
  
  // Determine the best URL to use
  const getBestUrl = useCallback(() => {
    // If we have mediaId and auto-refresh is working, use that URL
    if (resolvedMediaId && autoRefreshResult.url) {
      return autoRefreshResult.url;
    }
    
    // Check if primary URL is expired
    if (effectiveSrc && !isSignedUrlExpired(effectiveSrc)) {
      return effectiveSrc;
    }
    
    // Check if fallback URL is expired
    if (effectiveFallbackSrc && !isSignedUrlExpired(effectiveFallbackSrc)) {
      return effectiveFallbackSrc;
    }
    
    // Return whatever we have, even if expired (ProjectImageDisplay will handle fallback)
    return effectiveSrc || effectiveFallbackSrc;
  }, [effectiveSrc, effectiveFallbackSrc, resolvedMediaId, autoRefreshResult.url]);
  
  const [imageUrl, setImageUrl] = useState<string | null>(getBestUrl());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update URL when sources change or auto-refresh provides new URL
  useEffect(() => {
    const bestUrl = getBestUrl();
    setImageUrl(bestUrl);
  }, [getBestUrl]);

  // Handle load error with URL refresh attempt
  const handleImageError = useCallback(async (error: Event) => {
    console.warn('Image load error, checking if URL needs refresh:', { src: imageUrl, mediaId: resolvedMediaId });
    
    // Don't try to refresh URLs for media items we know are broken
    if (resolvedMediaId && knownBrokenMediaIds.has(resolvedMediaId)) {
      console.warn(`Skipping refresh for known broken media ${resolvedMediaId}`);
      onError?.(error);
      return;
    }
    
    // If we have mediaId and haven't tried refreshing yet, attempt refresh
    if (resolvedMediaId && !isRefreshing && autoRefreshResult.refresh) {
      setIsRefreshing(true);
      try {
        await autoRefreshResult.refresh();
        setManualRefreshCount(prev => prev + 1);
        console.log(`🔄 URL refresh successful for media ${resolvedMediaId}`);
        return; // Don't call onError if refresh was successful
      } catch (refreshError) {
        console.warn(`Failed to refresh URL for media ${resolvedMediaId}:`, refreshError.message);
        // Continue to fallback handling - don't prevent image fallback
      } finally {
        setIsRefreshing(false);
      }
    }
    
    // Call original error handler for fallback display
    onError?.(error);
  }, [imageUrl, resolvedMediaId, isRefreshing, autoRefreshResult.refresh, onError, knownBrokenMediaIds]);

  // Handle load success
  const handleLoad = useCallback(() => {
    onLoad?.();
  }, [onLoad]);

  // Show loading state while refreshing URLs or loading profile data
  if ((autoRefreshResult.isRefreshing || isRefreshing || isLoadingProfile) && !imageUrl) {
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
        onError={handleImageError}
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
      showLoadingState={autoRefreshResult.isRefreshing || isRefreshing || isLoadingProfile}
      showErrorState={true}
      onLoad={handleLoad}
      onError={handleImageError}
    />
  );
}