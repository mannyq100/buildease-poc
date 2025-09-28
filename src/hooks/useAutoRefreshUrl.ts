/**
 * Simplified Auto-Refresh URL Hook
 * Refreshes media URLs when they expire
 * Optimized for 24-72 hour URL lifetimes in BuildEase
 */

import { useState, useEffect, useCallback } from 'react';
import { MediaService } from '@/services/MediaService';
import { isSignedUrlExpired } from '@/services/URLValidator';

interface UseAutoRefreshUrlOptions {
  /** Enable automatic refresh on expiry (default: true) */
  autoRefresh?: boolean;
  /** Callback when URL is refreshed */
  onRefresh?: (newUrl: string) => void;
  /** Callback when refresh fails */
  onRefreshError?: (error: Error) => void;
}

interface UseAutoRefreshUrlResult {
  /** Current valid URL */
  url: string | null;
  /** Whether URL is currently being refreshed */
  isRefreshing: boolean;
  /** Whether the current URL has expired */
  isExpired: boolean;
  /** Manually trigger URL refresh */
  refresh: () => Promise<void>;
}

/**
 * Simplified hook to refresh media URLs when they expire
 * 
 * @param mediaId - The media item ID
 * @param currentUrl - The current URL (optional)
 * @param options - Configuration options
 * @returns Auto-refresh URL state and controls
 */
export function useAutoRefreshUrl(
  mediaId: string | null | undefined,
  currentUrl?: string | null,
  options: UseAutoRefreshUrlOptions = {}
): UseAutoRefreshUrlResult {
  const {
    autoRefresh = true,
    onRefresh,
    onRefreshError
  } = options;

  const [url, setUrl] = useState<string | null>(currentUrl || null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  /**
   * Refresh the URL
   */
  const refresh = useCallback(async () => {
    if (!mediaId || isRefreshing) return;

    setIsRefreshing(true);
    
    try {
      const newUrl = await MediaService.getUrl(mediaId);
      setUrl(newUrl);
      setIsExpired(false);
      onRefresh?.(newUrl);
    } catch (error) {
      const refreshError = error instanceof Error ? error : new Error('Failed to refresh URL');
      
      // Only log non-"not found" errors to reduce console noise
      if (!refreshError.message?.includes('not found')) {
        console.warn('URL refresh failed:', refreshError.message);
      }
      
      onRefreshError?.(refreshError);
      setIsExpired(true);
    } finally {
      setIsRefreshing(false);
    }
  }, [mediaId, isRefreshing, onRefresh, onRefreshError]);

  // Update URL when current URL changes
  useEffect(() => {
    if (currentUrl && currentUrl !== url) {
      setUrl(currentUrl);
      setIsExpired(isSignedUrlExpired(currentUrl));
    }
  }, [currentUrl, url]);

  // Auto-refresh expired URLs on mount or URL change
  useEffect(() => {
    if (url && autoRefresh && isSignedUrlExpired(url)) {
      setIsExpired(true);
      refresh();
    }
  }, [url, autoRefresh, refresh]);

  return {
    url,
    isRefreshing,
    isExpired,
    refresh
  };
}

/**
 * Simple auto-refresh hook with minimal configuration
 */
export function useSimpleAutoRefresh(
  mediaId: string | null | undefined,
  currentUrl?: string | null
) {
  const { url, isExpired, refresh } = useAutoRefreshUrl(mediaId, currentUrl);
  return { url: url || currentUrl, isExpired, refresh };
}

/**
 * Simplified batch URL refresh for media grids
 */
export function useBatchAutoRefresh(
  mediaItems: Array<{ id: string; url?: string | null }> = []
) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshExpired = useCallback(async () => {
    const expiredItems = mediaItems.filter(item => 
      item.url && isSignedUrlExpired(item.url)
    );

    if (expiredItems.length === 0) return [];

    setIsRefreshing(true);
    try {
      const refreshPromises = expiredItems.map(item => 
        MediaService.getUrl(item.id).catch(() => null)
      );
      return await Promise.all(refreshPromises);
    } finally {
      setIsRefreshing(false);
    }
  }, [mediaItems]);

  const expiredCount = mediaItems.filter(item => 
    item.url && isSignedUrlExpired(item.url)
  ).length;

  return { refreshExpired, isRefreshing, expiredCount };
}