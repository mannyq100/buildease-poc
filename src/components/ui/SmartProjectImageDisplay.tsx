/**
 * SmartProjectImageDisplay.tsx
 * Enhanced project image display with automatic URL validation and refresh
 * Optimized for project profile images with fallback handling
 */
import { useState, useCallback, useMemo } from 'react';
import { ProjectImageDisplay } from './project-image-display';
import { useAutoRefreshUrl } from '@/hooks/useAutoRefreshUrl';
import { useProjectProfileImage, getProfileImageUrls } from '@/hooks/useProjectProfileImage';
import { isSignedUrlExpired } from '@/services/URLValidator';
import { supabase } from '@/lib/supabase';

// Utility function to convert storage path to public URL
function getPublicUrlFromPath(path: string | null | undefined): string | null {
  if (!path) return null;
  
  // Return as-is if already a full URL
  if (path.startsWith('http')) return path;
  
  // Convert storage path to public URL
  if (path.includes('/')) {
    try {
      const { data } = supabase.storage.from('profiles').getPublicUrl(path);
      return data.publicUrl;
    } catch (error) {
      console.warn('Failed to generate public URL from path:', path, error);
      return null;
    }
  }
  
  return path;
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
  
  const [knownBrokenMediaIds, setKnownBrokenMediaIds] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Query current profile image if projectId is provided (primary method)
  const { data: profileImageData, isLoading: isLoadingProfile } = useProjectProfileImage(projectId);
  
  // Memoize profile URLs to prevent unnecessary recalculations
  const profileUrls = useMemo(() => getProfileImageUrls(profileImageData), [profileImageData]);
  
  // Determine effective URLs and media ID
  const { effectiveSrc, effectiveFallbackSrc, resolvedMediaId } = useMemo(() => {
    const src_ = profileUrls.imageUrl || src;
    const fallbackSrc_ = profileUrls.thumbnailUrl || fallbackSrc;
    
    // Only use real media IDs (not synthetic ones from project_summary)
    const mediaId_ = (profileUrls.mediaId && !profileUrls.mediaId.startsWith('project-')) 
      ? profileUrls.mediaId 
      : mediaId;
    
    return {
      effectiveSrc: src_,
      effectiveFallbackSrc: fallbackSrc_,
      resolvedMediaId: mediaId_
    };
  }, [profileUrls, src, fallbackSrc, mediaId]);
  
  // Use auto-refresh hook only for real media IDs (not profile images from project_summary)
  const autoRefreshResult = useAutoRefreshUrl(
    resolvedMediaId, 
    effectiveSrc, 
    {
      autoRefresh: !!resolvedMediaId,
      onRefreshError: (error) => {
        if (error.message.includes('not found') && resolvedMediaId) {
          setKnownBrokenMediaIds(prev => new Set(prev).add(resolvedMediaId));
        }
      }
    }
  );
  
  // Determine the best URL to use
  const imageUrl = useMemo(() => {
    // Priority 1: Profile images from project_summary (public URLs)
    if (profileUrls.imageUrl) {
      return getPublicUrlFromPath(profileUrls.imageUrl);
    }
    
    // Priority 2: Auto-refreshed URL for media items
    if (resolvedMediaId && autoRefreshResult.url) {
      return autoRefreshResult.url;
    }
    
    // Priority 3: Primary URL if valid and not expired
    const primaryUrl = getPublicUrlFromPath(effectiveSrc);
    if (primaryUrl && !isSignedUrlExpired(primaryUrl)) {
      return primaryUrl;
    }
    
    // Priority 4: Fallback URL if valid and not expired
    const fallbackUrl = getPublicUrlFromPath(effectiveFallbackSrc);
    if (fallbackUrl && !isSignedUrlExpired(fallbackUrl)) {
      return fallbackUrl;
    }
    
    // Last resort: return best available URL
    return primaryUrl || fallbackUrl || effectiveSrc || effectiveFallbackSrc;
  }, [
    profileUrls.imageUrl,
    resolvedMediaId,
    autoRefreshResult.url,
    effectiveSrc,
    effectiveFallbackSrc
  ]);

  // Handle image load errors with optional refresh
  const handleImageError = useCallback(async (error: Event) => {
    // Skip refresh for known broken media or if already refreshing
    if (!resolvedMediaId || 
        knownBrokenMediaIds.has(resolvedMediaId) || 
        isRefreshing || 
        !autoRefreshResult.refresh) {
      onError?.(error);
      return;
    }
    
    // Attempt URL refresh for media items
    setIsRefreshing(true);
    try {
      await autoRefreshResult.refresh();
      return; // Success - don't call onError
    } catch {
      // Refresh failed, continue to fallback
    } finally {
      setIsRefreshing(false);
    }
    
    onError?.(error);
  }, [resolvedMediaId, isRefreshing, autoRefreshResult.refresh, onError, knownBrokenMediaIds]);

  // Determine loading state
  const isLoading = autoRefreshResult.isRefreshing || isRefreshing || isLoadingProfile;
  
  return (
    <ProjectImageDisplay
      src={isLoading && !imageUrl ? null : imageUrl}
      alt={alt}
      className={className}
      fallbackClassName={fallbackClassName}
      aspectRatio={aspectRatio}
      priority={priority}
      showLoadingState={isLoading}
      showErrorState={true}
      onLoad={onLoad}
      onError={handleImageError}
    />
  );
}