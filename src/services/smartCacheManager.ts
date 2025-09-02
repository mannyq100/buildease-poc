/**
 * Smart Cache Manager - Phase 3.2
 * Implements intelligent caching with request deduplication and network-aware policies
 * Optimized for construction sites with unreliable connectivity
 */

import { QueryClient } from '@tanstack/react-query';
import { useConnectionQuality } from '@/hooks/useOnlineStatus';
import { getPersistentCache, usePersistentCache } from './cacheServiceWorker';

// Types
export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
  dependencies?: string[];
}

export interface RequestDeduplicationEntry {
  promise: Promise<any>;
  timestamp: number;
  key: string;
}

export interface CacheHierarchyConfig {
  l1: { ttl: number; maxSize: number }; // Recent media items
  l2: { ttl: number; maxSize: number }; // Project-level aggregations  
  l3: { ttl: number; maxSize: number }; // Media URLs and thumbnails
}

export interface NetworkAwareCachePolicy {
  excellent: { ttl: number; refetchInterval?: number };
  good: { ttl: number; refetchInterval?: number };
  poor: { ttl: number; refetchInterval?: number };
  offline: { ttl: number; refetchInterval?: number };
}

// Smart Cache Manager Implementation
export class SmartCacheManager {
  private queryClient: QueryClient;
  private pendingRequests = new Map<string, RequestDeduplicationEntry>();
  private memoryCache = new Map<string, CacheEntry>();
  private networkPolicy: NetworkAwareCachePolicy;
  private hierarchy: CacheHierarchyConfig;
  private persistentCache: ReturnType<typeof getPersistentCache>;
  private connectionQuality: 'excellent' | 'good' | 'poor' | 'offline' = 'good';

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
    this.persistentCache = getPersistentCache();
    
    // Network-aware cache policies optimized for construction sites
    this.networkPolicy = {
      excellent: { ttl: 2 * 60 * 1000, refetchInterval: 30000 }, // 2 min, 30s - Fast refresh
      good: { ttl: 5 * 60 * 1000, refetchInterval: 60000 }, // 5 min, 1 min - Standard
      poor: { ttl: 15 * 60 * 1000, refetchInterval: 300000 }, // 15 min, 5 min - Conservative
      offline: { ttl: 60 * 60 * 1000 } // 1 hour, no refetch - Max persistence
    };
    
    // Hierarchical cache configuration
    this.hierarchy = {
      l1: { ttl: 5 * 60 * 1000, maxSize: 100 }, // Recent media - 5 min
      l2: { ttl: 30 * 60 * 1000, maxSize: 50 }, // Project aggregations - 30 min
      l3: { ttl: 60 * 60 * 1000, maxSize: 200 } // URLs/thumbnails - 1 hour
    };

    this.initializeNetworkAwareness();
  }

  /**
   * Initialize network awareness and connection quality monitoring
   */
  private initializeNetworkAwareness(): void {
    if (typeof window === 'undefined') return;

    // Monitor connection quality changes
    const updateNetworkPolicy = () => {
      try {
        import('@/hooks/useOnlineStatus').then(({ useConnectionQuality }) => {
          // This would need to be called from a React context
          // For now, we'll use a basic approach
        });
      } catch (error) {
        console.warn('Network quality monitoring not available:', error);
      }
    };

    // Listen to online/offline events
    window.addEventListener('online', () => {
      this.connectionQuality = 'good';
      this.optimizeCacheForConnection();
    });

    window.addEventListener('offline', () => {
      this.connectionQuality = 'offline';
      this.optimizeCacheForConnection();
    });

    // Monitor connection speed changes (basic implementation)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        const updateConnection = () => {
          const effectiveType = connection.effectiveType;
          switch (effectiveType) {
            case '4g':
              this.connectionQuality = 'excellent';
              break;
            case '3g':
              this.connectionQuality = 'good';
              break;
            case '2g':
            case 'slow-2g':
              this.connectionQuality = 'poor';
              break;
            default:
              this.connectionQuality = 'good';
          }
          this.optimizeCacheForConnection();
        };

        connection.addEventListener('change', updateConnection);
        updateConnection(); // Initial check
      }
    }
  }

  /**
   * Request deduplication - prevent identical simultaneous requests
   */
  async deduplicateRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // Check if there's already a pending request for this key
    const existingRequest = this.pendingRequests.get(key);
    if (existingRequest) {
      const timeSinceRequest = Date.now() - existingRequest.timestamp;
      // If request is less than 5 seconds old, return the existing promise
      if (timeSinceRequest < 5000) {
        return existingRequest.promise as Promise<T>;
      } else {
        // Remove stale request
        this.pendingRequests.delete(key);
      }
    }

    // Create new request and cache it
    const promise = requestFn();
    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now(),
      key
    });

    // Clean up after request completes
    promise.finally(() => {
      this.pendingRequests.delete(key);
    });

    return promise;
  }

  /**
   * Get cached result from memory or persistent storage with network awareness
   */
  async getCachedResult<T>(key: string): Promise<T | null> {
    // Try memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && this.isValid(memoryEntry)) {
      return memoryEntry.data;
    }

    // Try persistent IndexedDB cache
    try {
      const persistentData = await this.persistentCache.retrieve(key);
      if (persistentData) {
        // Promote to memory cache if connection is good
        if (this.connectionQuality !== 'poor') {
          const entry: CacheEntry<T> = {
            data: persistentData,
            timestamp: Date.now(),
            ttl: this.getNetworkAwareTTL('l1'),
            key,
          };
          this.memoryCache.set(key, entry);
        }
        return persistentData;
      }
    } catch (error) {
      console.warn('Failed to retrieve from persistent cache:', error);
    }

    return null;
  }

  /**
   * Store data in hierarchical cache with network-aware TTL
   */
  async setCacheEntry<T>(
    key: string, 
    data: T, 
    level: 'l1' | 'l2' | 'l3' = 'l1',
    dependencies?: string[]
  ): Promise<void> {
    const networkAwareTTL = this.getNetworkAwareTTL(level);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: networkAwareTTL,
      key,
      dependencies
    };

    // Store in memory (always)
    this.memoryCache.set(key, entry);

    // Store in persistent cache based on level and network conditions
    try {
      if (level === 'l3') {
        // Special handling for media URLs
        if (key.includes('media-url-') || key.includes('thumbnail-')) {
          const mediaId = key.split('-').pop() || '';
          const projectId = dependencies?.[0]?.replace('project-', '') || '';
          await this.persistentCache.storeMediaUrl(mediaId, data as string, projectId, networkAwareTTL);
        } else {
          await this.persistentCache.store(key, data, networkAwareTTL, { level, dependencies });
        }
      } else if (level === 'l2' && key.includes('project-stats-')) {
        // Special handling for project stats
        const projectId = key.replace('project-stats-', '');
        await this.persistentCache.storeProjectStats(projectId, data, networkAwareTTL);
      } else {
        // General cache storage
        await this.persistentCache.store(key, data, networkAwareTTL, { level, dependencies });
      }
    } catch (error) {
      console.warn('Failed to store in persistent cache:', error);
    }

    // Enforce cache size limits
    this.enforceCacheLimits(level);
  }

  /**
   * Invalidate cache entries by pattern
   */
  async invalidatePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];

    // Invalidate memory cache
    for (const [key] of this.memoryCache) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.memoryCache.delete(key));

    // Note: Persistent cache pattern invalidation is handled at the service level

    // Invalidate React Query cache
    await this.queryClient.invalidateQueries({
      predicate: (query) => regex.test(query.queryKey.join('-'))
    });
  }

  /**
   * Selective cache invalidation based on dependencies
   */
  async invalidateDependencies(dependency: string): Promise<void> {
    const dependentKeys: string[] = [];

    // Find dependent entries
    for (const [key, entry] of this.memoryCache) {
      if (entry.dependencies?.includes(dependency)) {
        dependentKeys.push(key);
      }
    }

    // Invalidate dependent entries
    for (const key of dependentKeys) {
      this.memoryCache.delete(key);
      
      // Note: Persistent cache cleanup is handled at the service level
    }

    // Invalidate related React Query cache
    await this.queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey.join('-');
        return dependentKeys.some(key => queryKey.includes(key));
      }
    });
  }

  /**
   * Network-aware cache configuration with construction site optimizations
   */
  getNetworkAwareConfig(quality: 'excellent' | 'good' | 'poor' | 'offline') {
    const policy = this.networkPolicy[quality];
    const config = {
      staleTime: policy.ttl,
      gcTime: policy.ttl * 2, // Keep data twice as long as stale time
      refetchInterval: policy.refetchInterval,
      refetchOnWindowFocus: quality === 'excellent',
      refetchOnReconnect: true,
      retry: this.getRetryCount(quality),
      retryDelay: this.getRetryDelay(quality),
      // Network mode based on quality
      networkMode: quality === 'offline' ? 'offlineFirst' : 'online',
      // Enable/disable real-time features based on connection
      meta: {
        enableRealtime: quality === 'excellent' || quality === 'good',
        enableBackgroundSync: quality !== 'offline',
        enableThumbnails: quality !== 'poor',
        batchSize: this.getBatchSize(quality)
      }
    } as const;

    return config;
  }

  /**
   * Get network-aware TTL based on level and current connection quality
   */
  private getNetworkAwareTTL(level: 'l1' | 'l2' | 'l3'): number {
    const baseTTL = this.hierarchy[level].ttl;
    const multiplier = this.getTTLMultiplier(this.connectionQuality);
    return baseTTL * multiplier;
  }

  /**
   * Get TTL multiplier based on connection quality
   */
  private getTTLMultiplier(quality: 'excellent' | 'good' | 'poor' | 'offline'): number {
    switch (quality) {
      case 'excellent': return 0.5; // Shorter TTL for fast refresh
      case 'good': return 1.0; // Standard TTL
      case 'poor': return 3.0; // Longer TTL to reduce requests
      case 'offline': return 10.0; // Very long TTL for offline
      default: return 1.0;
    }
  }

  /**
   * Get retry count based on connection quality
   */
  private getRetryCount(quality: 'excellent' | 'good' | 'poor' | 'offline'): number {
    switch (quality) {
      case 'excellent': return 3;
      case 'good': return 2;
      case 'poor': return 1;
      case 'offline': return 0;
      default: return 2;
    }
  }

  /**
   * Get retry delay based on connection quality
   */
  private getRetryDelay(quality: 'excellent' | 'good' | 'poor' | 'offline'): number {
    switch (quality) {
      case 'excellent': return 1000; // 1 second
      case 'good': return 2000; // 2 seconds
      case 'poor': return 10000; // 10 seconds
      case 'offline': return 60000; // 1 minute (if somehow retrying)
      default: return 2000;
    }
  }

  /**
   * Get batch size for uploads based on connection quality
   */
  private getBatchSize(quality: 'excellent' | 'good' | 'poor' | 'offline'): number {
    switch (quality) {
      case 'excellent': return 5; // Larger batches
      case 'good': return 3; // Standard batches
      case 'poor': return 1; // Single file uploads
      case 'offline': return 0; // No uploads
      default: return 3;
    }
  }

  /**
   * Optimize cache based on current connection quality
   */
  private async optimizeCacheForConnection(): Promise<void> {
    switch (this.connectionQuality) {
      case 'excellent':
        // Enable aggressive prefetching
        break;
      case 'good':
        // Standard operation
        break;
      case 'poor':
        // Disable non-essential features, extend TTLs
        await this.optimizeForMobile();
        break;
      case 'offline':
        // Rely entirely on cache, disable fetching
        console.log('Operating in offline mode, relying on cache');
        break;
    }
  }

  /**
   * Cache warming - preload frequently accessed data
   */
  async warmCache(projectId: string, priorities: ('media' | 'stats' | 'thumbnails')[] = ['media', 'stats']): Promise<void> {
    const warmingPromises: Promise<any>[] = [];

    for (const priority of priorities) {
      switch (priority) {
        case 'media':
          warmingPromises.push(this.prefetchProjectMedia(projectId));
          break;
        case 'stats':
          warmingPromises.push(this.prefetchProjectStats(projectId));
          break;
        case 'thumbnails':
          warmingPromises.push(this.prefetchThumbnails(projectId));
          break;
      }
    }

    await Promise.allSettled(warmingPromises);
  }

  /**
   * Background sync for offline preparation
   */
  async backgroundSync(projectIds: string[]): Promise<void> {
    if (typeof window === 'undefined' || !navigator.serviceWorker) {
      return; // Skip in non-browser environments or without service worker
    }

    try {
      // Register background sync if service worker is available
      const registration = await navigator.serviceWorker.ready;
      if ('sync' in registration) {
        // Queue project IDs for background sync
        const cache = await caches.open('buildease-background-sync');
        await cache.put(
          '/sync-queue',
          new Response(JSON.stringify({ projectIds, timestamp: Date.now() }))
        );
        
        // Register sync event
        (registration as any).sync.register('cache-warm');
      }
    } catch (error) {
      console.warn('Background sync not available:', error);
    }
  }

  /**
   * Cache cleanup and optimization for mobile
   */
  async optimizeForMobile(): Promise<void> {
    const now = Date.now();
    const memoryUsage = this.getMemoryUsage();
    
    // If memory usage is high, clean up aggressively
    if (memoryUsage > 50 * 1024 * 1024) { // 50MB
      await this.clearExpiredEntries();
      await this.clearLeastRecentlyUsed(0.3); // Clear 30% of cache
    } else {
      await this.clearExpiredEntries();
    }

    // Optimize persistent cache
    await this.optimizePersistentCache();
  }

  // Private helper methods
  private isValid(entry: CacheEntry): boolean {
    return (Date.now() - entry.timestamp) < entry.ttl;
  }

  private enforceCacheLimits(level: 'l1' | 'l2' | 'l3'): void {
    const config = this.hierarchy[level];
    const entriesForLevel = Array.from(this.memoryCache.entries())
      .filter(([key]) => this.getCacheLevel(key) === level)
      .sort(([, a], [, b]) => b.timestamp - a.timestamp);

    if (entriesForLevel.length > config.maxSize) {
      const toRemove = entriesForLevel.slice(config.maxSize);
      toRemove.forEach(([key]) => this.memoryCache.delete(key));
    }
  }

  private getCacheLevel(key: string): 'l1' | 'l2' | 'l3' {
    if (key.includes('media-item') || key.includes('recent')) return 'l1';
    if (key.includes('project-stats') || key.includes('aggregation')) return 'l2';
    if (key.includes('url') || key.includes('thumbnail')) return 'l3';
    return 'l1'; // Default
  }

  private getMemoryUsage(): number {
    let size = 0;
    for (const [, entry] of this.memoryCache) {
      size += JSON.stringify(entry).length * 2; // Rough estimation
    }
    return size;
  }

  private async clearExpiredEntries(): Promise<void> {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.memoryCache) {
      if (!this.isValid(entry)) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.memoryCache.delete(key));

    // Note: Persistent cache cleanup is handled at the service level
  }

  private async clearLeastRecentlyUsed(percentage: number): Promise<void> {
    const entries = Array.from(this.memoryCache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);
    
    const toRemove = Math.floor(entries.length * percentage);
    const keysToRemove = entries.slice(0, toRemove).map(([key]) => key);
    
    keysToRemove.forEach(key => this.memoryCache.delete(key));
  }

  private async optimizePersistentCache(): Promise<void> {
    try {
      // Use persistent cache service for cleanup
      await this.persistentCache.cleanup();
    } catch (error) {
      console.warn('Failed to optimize persistent cache:', error);
    }
  }

  private async prefetchProjectMedia(projectId: string): Promise<void> {
    const key = `project-media-${projectId}`;
    try {
      await this.queryClient.prefetchQuery({
        queryKey: ['be_media_items', 'project', projectId],
        staleTime: 5 * 60 * 1000
      });
    } catch (error) {
      console.warn('Failed to prefetch project media:', error);
    }
  }

  private async prefetchProjectStats(projectId: string): Promise<void> {
    const key = `project-stats-${projectId}`;
    try {
      await this.queryClient.prefetchQuery({
        queryKey: ['project-stats', projectId],
        staleTime: 10 * 60 * 1000
      });
    } catch (error) {
      console.warn('Failed to prefetch project stats:', error);
    }
  }

  private async prefetchThumbnails(projectId: string): Promise<void> {
    // This would prefetch thumbnail URLs for media items
    // Implementation depends on how thumbnails are handled in the media service
    try {
      const mediaItems = this.queryClient.getQueryData(['be_media_items', 'project', projectId]) as any[];
      if (mediaItems) {
        const thumbnailPromises = mediaItems
          .filter(item => item.mediaType === 'PHOTO')
          .slice(0, 10) // Limit to first 10 for performance
          .map(item => this.setCacheEntry(`thumbnail-${item.id}`, item.filePath, 'l3'));
        
        await Promise.allSettled(thumbnailPromises);
      }
    } catch (error) {
      console.warn('Failed to prefetch thumbnails:', error);
    }
  }

  /**
   * Get comprehensive cache statistics for monitoring
   */
  getCacheStats() {
    const memoryStats = {
      memoryEntries: this.memoryCache.size,
      pendingRequests: this.pendingRequests.size,
      memoryUsage: this.getMemoryUsage(),
      connectionQuality: this.connectionQuality,
      networkPolicy: this.networkPolicy[this.connectionQuality],
      breakdown: {
        l1: 0,
        l2: 0,
        l3: 0
      }
    };

    for (const [key] of this.memoryCache) {
      const level = this.getCacheLevel(key);
      memoryStats.breakdown[level]++;
    }

    return memoryStats;
  }

  /**
   * Get comprehensive stats including persistent cache
   */
  async getFullStats() {
    const memoryStats = this.getCacheStats();
    
    try {
      const persistentStats = await this.persistentCache.getStats();
      return {
        ...memoryStats,
        persistent: persistentStats
      };
    } catch (error) {
      console.warn('Failed to get persistent cache stats:', error);
      return memoryStats;
    }
  }
}

// Factory function and global instance management
let globalSmartCacheManager: SmartCacheManager | null = null;

export function createSmartCacheManager(queryClient: QueryClient): SmartCacheManager {
  return new SmartCacheManager(queryClient);
}

export function initializeSmartCacheManager(queryClient: QueryClient): void {
  globalSmartCacheManager = createSmartCacheManager(queryClient);
}

export function getSmartCacheManager(): SmartCacheManager {
  if (!globalSmartCacheManager) {
    throw new Error('Smart cache manager not initialized. Call initializeSmartCacheManager first.');
  }
  return globalSmartCacheManager;
}

/**
 * React hook for accessing smart cache manager with full feature set
 */
export function useSmartCache() {
  const { quality } = useConnectionQuality();
  const cacheManager = getSmartCacheManager();
  const persistentCache = usePersistentCache();
  
  return {
    // Core cache manager
    manager: cacheManager,
    networkConfig: cacheManager.getNetworkAwareConfig(quality),
    quality,
    
    // Smart caching operations
    deduplicateRequest: cacheManager.deduplicateRequest.bind(cacheManager),
    getCachedResult: cacheManager.getCachedResult.bind(cacheManager),
    setCacheEntry: cacheManager.setCacheEntry.bind(cacheManager),
    invalidatePattern: cacheManager.invalidatePattern.bind(cacheManager),
    invalidateDependencies: cacheManager.invalidateDependencies.bind(cacheManager),
    
    // Cache management
    warmCache: cacheManager.warmCache.bind(cacheManager),
    backgroundSync: cacheManager.backgroundSync.bind(cacheManager),
    optimizeForMobile: cacheManager.optimizeForMobile.bind(cacheManager),
    
    // Persistent cache operations
    persistent: {
      store: persistentCache.store,
      retrieve: persistentCache.retrieve,
      storeMediaUrl: persistentCache.storeMediaUrl,
      getMediaUrl: persistentCache.getMediaUrl,
      storeProjectStats: persistentCache.storeProjectStats,
      getProjectStats: persistentCache.getProjectStats,
      cleanup: persistentCache.cleanup,
      clear: persistentCache.clear
    },
    
    // Statistics and monitoring
    getCacheStats: cacheManager.getCacheStats.bind(cacheManager),
    getFullStats: cacheManager.getFullStats.bind(cacheManager),
    getPersistentStats: persistentCache.getStats
  };
}