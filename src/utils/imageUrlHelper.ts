/**
 * Image URL Helper - Handles profile image URL validation and refresh
 * Provides fallback and URL validation for project profile images
 */

import { MediaService } from '@/services/MediaService';

export interface ImageUrlResult {
  url: string | null;
  isValid: boolean;
  needsRefresh: boolean;
}

/**
 * Validates if an image URL is accessible and not expired
 */
export async function validateImageUrl(url: string | null | undefined): Promise<boolean> {
  if (!url || url.trim() === '') {
    return false;
  }

  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.warn('Image URL validation failed:', error);
    return false;
  }
}

/**
 * Checks if a Supabase signed URL is likely expired based on the token
 */
export function isSignedUrlExpired(url: string | null | undefined): boolean {
  if (!url || !url.includes('token=')) {
    return false; // Not a signed URL or no URL
  }

  try {
    const urlObj = new URL(url);
    const token = urlObj.searchParams.get('token');
    
    if (!token) return false;

    // Try to decode the JWT token to check expiry
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    
    return now >= expiry;
  } catch (error) {
    console.warn('Error checking signed URL expiry:', error);
    return true; // Assume expired if we can't parse
  }
}

/**
 * Gets a valid image URL, refreshing if necessary
 */
export async function getValidImageUrl(
  primaryUrl: string | null | undefined,
  fallbackUrl?: string | null | undefined,
  mediaId?: string
): Promise<string | null> {
  
  // Check primary URL first
  if (primaryUrl && !isSignedUrlExpired(primaryUrl)) {
    const isValid = await validateImageUrl(primaryUrl);
    if (isValid) {
      return primaryUrl;
    }
  }

  // Check fallback URL
  if (fallbackUrl && !isSignedUrlExpired(fallbackUrl)) {
    const isValid = await validateImageUrl(fallbackUrl);
    if (isValid) {
      return fallbackUrl;
    }
  }

  // If we have a media ID, try to get a fresh URL
  if (mediaId) {
    try {
      const freshUrl = await MediaService.getUrl(mediaId);
      const isValid = await validateImageUrl(freshUrl);
      if (isValid) {
        return freshUrl;
      }
    } catch (error) {
      console.warn('Failed to get fresh media URL:', error);
    }
  }

  // All options failed
  return null;
}

/**
 * React hook for managing image URLs with automatic refresh
 */
import { useState, useEffect } from 'react';

export function useValidImageUrl(
  primaryUrl: string | null | undefined,
  fallbackUrl?: string | null | undefined,
  mediaId?: string
) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function loadValidUrl() {
      if (isCancelled) return;
      
      setIsLoading(true);
      setHasError(false);

      try {
        const validUrl = await getValidImageUrl(primaryUrl, fallbackUrl, mediaId);
        
        if (!isCancelled) {
          setImageUrl(validUrl);
          setHasError(validUrl === null);
        }
      } catch (error) {
        console.error('Error loading valid image URL:', error);
        if (!isCancelled) {
          setImageUrl(null);
          setHasError(true);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadValidUrl();

    return () => {
      isCancelled = true;
    };
  }, [primaryUrl, fallbackUrl, mediaId]);

  return {
    imageUrl,
    isLoading,
    hasError,
    refresh: () => {
      // Trigger a refresh by updating a dependency
      setIsLoading(true);
    }
  };
}