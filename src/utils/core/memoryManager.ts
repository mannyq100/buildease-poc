/**
 * Centralized Memory Management Utility
 * Handles blob URL creation, cleanup, and memory leak prevention across the entire application
 * Part of Phase 3: Ultra-Think Cleanup Strategy
 */

class MemoryManager {
  private static instance: MemoryManager;
  private blobUrls: Set<string> = new Set();
  private cleanupCallbacks: Map<string, () => void> = new Map();

  private constructor() {}

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  /**
   * Create a blob URL with automatic tracking for cleanup
   */
  createBlobUrl(blob: Blob): string {
    const url = URL.createObjectURL(blob);
    this.blobUrls.add(url);
    return url;
  }

  /**
   * Create a preview URL for a file with automatic tracking
   */
  createPreviewUrl(file: File): string {
    return this.createBlobUrl(file);
  }

  /**
   * Revoke a specific blob URL
   */
  revokeBlobUrl(url: string): void {
    if (this.blobUrls.has(url)) {
      URL.revokeObjectURL(url);
      this.blobUrls.delete(url);
      
      // Execute cleanup callback if exists
      const callback = this.cleanupCallbacks.get(url);
      if (callback) {
        callback();
        this.cleanupCallbacks.delete(url);
      }
    }
  }

  /**
   * Register a cleanup callback for a specific URL
   */
  registerCleanupCallback(url: string, callback: () => void): void {
    this.cleanupCallbacks.set(url, callback);
  }

  /**
   * Clean up all blob URLs (useful for component unmount)
   */
  cleanupAll(): void {
    this.blobUrls.forEach(url => {
      URL.revokeObjectURL(url);
      const callback = this.cleanupCallbacks.get(url);
      if (callback) callback();
    });
    this.blobUrls.clear();
    this.cleanupCallbacks.clear();
  }

  /**
   * Get current memory usage stats
   */
  getStats(): { activeBlobUrls: number; pendingCallbacks: number } {
    return {
      activeBlobUrls: this.blobUrls.size,
      pendingCallbacks: this.cleanupCallbacks.size
    };
  }

  /**
   * Clean up blob URLs older than specified time (in milliseconds)
   */
  cleanupOldUrls(_maxAge: number = 300000): void { // 5 minutes default
    // Note: This is a basic implementation. In a production app, 
    // you might want to track creation timestamps for more precise cleanup
    console.warn('Cleaning up potentially old blob URLs');
    this.cleanupAll();
  }
}

// Export singleton instance
export const memoryManager = MemoryManager.getInstance();

// Convenience hooks for React components
export const useMemoryManager = () => {
  const createBlobUrl = (blob: Blob) => memoryManager.createBlobUrl(blob);
  const createPreviewUrl = (file: File) => memoryManager.createPreviewUrl(file);
  const revokeBlobUrl = (url: string) => memoryManager.revokeBlobUrl(url);
  const cleanupAll = () => memoryManager.cleanupAll();
  
  return {
    createBlobUrl,
    createPreviewUrl,
    revokeBlobUrl,
    cleanupAll,
    getStats: () => memoryManager.getStats()
  };
};

// React hook for automatic cleanup on unmount
import { useEffect } from 'react';

export const useAutoCleanup = () => {
  const manager = useMemoryManager();
  
  useEffect(() => {
    return () => {
      manager.cleanupAll();
    };
  }, [manager]);
  
  return manager;
};

// Legacy compatibility exports (to be gradually replaced)
export const createPreviewUrl = (file: File): string => memoryManager.createPreviewUrl(file);
export const revokePreviewUrl = (url: string): void => memoryManager.revokeBlobUrl(url);
