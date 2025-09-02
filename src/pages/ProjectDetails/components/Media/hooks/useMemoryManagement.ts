/**
 * Memory management hooks for ProjectDocumentsSection
 * Handles blob URL cleanup and lazy loading to prevent memory leaks
 * PHASE 3: Integrated with centralized memory management system
 */

import { useRef, useCallback, useEffect, useState } from 'react';
import { useAutoCleanup } from '@/utils/core/memoryManager';

/**
 * Hook for managing blob URLs with automatic cleanup
 * INTEGRATED: Uses centralized memory management system
 */
export const useCleanupBlobUrl = () => {
  const memoryManager = useAutoCleanup();
  
  return {
    createBlobUrl: memoryManager.createBlobUrl,
    revokeBlobUrl: memoryManager.revokeBlobUrl
  };
};

/**
 * Hook for lazy image loading with loading states
 * Improves performance by showing skeleton loaders
 */
export const useLazyImage = (src: string) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setError(false);
  }, []);
  
  const handleError = useCallback(() => {
    setError(true);
    setIsLoaded(false);
  }, []);
  
  return {
    imgRef,
    isLoaded,
    error,
    isInView,
    handleLoad,
    handleError,
    shouldLoad: isInView
  };
};

/**
 * Hook for managing download operations with cleanup
 */
export const useDownloadManager = () => {
  const { createBlobUrl, revokeBlobUrl } = useCleanupBlobUrl();
  
  const downloadFile = useCallback(async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const downloadUrl = createBlobUrl(blob);
      
      // Create and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup blob URL after a short delay
      setTimeout(() => {
        revokeBlobUrl(downloadUrl);
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('Download failed:', error);
      return false;
    }
  }, [createBlobUrl, revokeBlobUrl]);
  
  return { downloadFile };
};
