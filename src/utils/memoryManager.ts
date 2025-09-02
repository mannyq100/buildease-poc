/**
 * Centralized Memory Management for Media Operations - Phase 1.3
 * Fixes blob URL cleanup issues and prevents memory leaks
 * 
 * Critical Issues Fixed:
 * - Blob URL accumulation in ProfileCard.tsx (line 111)
 * - Preview URL cleanup timing issues
 * - Component unmount cleanup missing
 */

class MemoryManager {
  private previewUrls = new Set<string>();
  private timers = new Map<string, NodeJS.Timeout>();

  /**
   * Create a preview URL for a file and track it for cleanup
   */
  createPreviewUrl(file: File): string {
    const url = URL.createObjectURL(file);
    this.previewUrls.add(url);
    
    // Auto-cleanup after 5 minutes if not manually revoked
    const timer = setTimeout(() => {
      this.revokePreviewUrl(url);
    }, 5 * 60 * 1000);
    
    this.timers.set(url, timer);
    return url;
  }

  /**
   * Revoke a specific preview URL
   */
  revokePreviewUrl(url: string): void {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
      this.previewUrls.delete(url);
      
      // Clear associated timer
      const timer = this.timers.get(url);
      if (timer) {
        clearTimeout(timer);
        this.timers.delete(url);
      }
    }
  }

  /**
   * Cleanup all tracked preview URLs
   * Should be called on component unmount or route changes
   */
  cleanup(): void {
    this.previewUrls.forEach(url => {
      URL.revokeObjectURL(url);
    });
    this.previewUrls.clear();

    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
  }

  /**
   * Get current number of tracked URLs (for debugging)
   */
  getTrackedUrlCount(): number {
    return this.previewUrls.size;
  }

  /**
   * React hook for automatic cleanup on component unmount
   */
  useAutoCleanup(): void {
    if (typeof window !== 'undefined') {
      // Cleanup on page unload
      const handleBeforeUnload = () => this.cleanup();
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        this.cleanup();
      };
    }
  }
}

// Single instance for the entire app
export const memoryManager = new MemoryManager();

/**
 * React hook for memory management
 */
export function useMemoryManagement() {
  const createPreviewUrl = (file: File) => memoryManager.createPreviewUrl(file);
  const revokePreviewUrl = (url: string) => memoryManager.revokePreviewUrl(url);
  const cleanup = () => memoryManager.cleanup();

  // Auto-cleanup on unmount
  React.useEffect(() => {
    return () => memoryManager.cleanup();
  }, []);

  return {
    createPreviewUrl,
    revokePreviewUrl,
    cleanup,
    getTrackedUrlCount: () => memoryManager.getTrackedUrlCount()
  };
}

// Import React for the hook
import React from 'react';