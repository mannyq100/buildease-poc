/**
 * Cache Service Worker Integration
 * Handles background sync and persistent caching for offline scenarios
 * Optimized for construction sites with poor connectivity
 */

export interface ServiceWorkerMessage {
  type: 'CACHE_WARM' | 'CACHE_SYNC' | 'CACHE_CLEANUP' | 'GET_STATS';
  payload?: {
    projectIds?: string[];
    cacheKey?: string;
    data?: any;
    priority?: 'high' | 'low';
  };
}

export interface BackgroundSyncData {
  projectIds: string[];
  timestamp: number;
  priority: 'high' | 'low';
}

/**
 * Service Worker Cache Manager
 * Handles communication with service worker for background operations
 */
export class ServiceWorkerCacheManager {
  private isSupported: boolean;
  private registration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.isSupported = this.checkSupport();
    this.initialize();
  }

  private checkSupport(): boolean {
    return (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'caches' in window &&
      'indexedDB' in window
    );
  }

  private async initialize(): Promise<void> {
    if (!this.isSupported) return;

    try {
      // Skip service worker registration in development to avoid MIME type errors
      if (process.env.NODE_ENV === 'production') {
        this.registration = await navigator.serviceWorker.register('/sw-cache.js', {
          scope: '/',
          updateViaCache: 'none'
        });
      } else {
        console.log('Service worker registration skipped in development mode');
        return;
      }

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', this.handleMessage.bind(this));

      console.log('Cache Service Worker registered successfully');
    } catch (error) {
      console.warn('Cache Service Worker registration failed:', error);
    }
  }

  private handleMessage(event: MessageEvent<ServiceWorkerMessage>): void {
    const { type, payload } = event.data;

    switch (type) {
      case 'CACHE_WARM':
        console.log('Background cache warming completed:', payload);
        break;
      case 'CACHE_SYNC':
        console.log('Background cache sync completed:', payload);
        break;
      case 'CACHE_CLEANUP':
        console.log('Cache cleanup completed:', payload);
        break;
      default:
        console.log('Unknown service worker message:', event.data);
    }
  }

  /**
   * Request background cache warming
   */
  async requestCacheWarm(projectIds: string[], priority: 'high' | 'low' = 'low'): Promise<void> {
    if (!this.isSupported || !this.registration) return;

    try {
      // Store sync data for service worker
      const cache = await caches.open('buildease-background-sync');
      const syncData: BackgroundSyncData = {
        projectIds,
        timestamp: Date.now(),
        priority
      };

      await cache.put(
        '/cache-warm-queue',
        new Response(JSON.stringify(syncData))
      );

      // Request background sync if available
      if ('sync' in this.registration) {
        await (this.registration as any).sync.register('cache-warm');
      } else {
        // Fallback: send message to service worker
        this.postMessage({
          type: 'CACHE_WARM',
          payload: { projectIds, priority }
        });
      }
    } catch (error) {
      console.warn('Failed to request background cache warm:', error);
    }
  }

  /**
   * Manual cache sync (for immediate execution)
   */
  async syncCache(projectIds: string[]): Promise<void> {
    if (!this.isSupported) return;

    this.postMessage({
      type: 'CACHE_SYNC',
      payload: { projectIds, priority: 'high' }
    });
  }

  /**
   * Request cache cleanup
   */
  async requestCacheCleanup(): Promise<void> {
    if (!this.isSupported) return;

    this.postMessage({
      type: 'CACHE_CLEANUP'
    });
  }

  /**
   * Get cache statistics from service worker
   */
  async getCacheStats(): Promise<any> {
    if (!this.isSupported) return null;

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data);
      };

      this.postMessage({
        type: 'GET_STATS'
      }, [messageChannel.port2]);
    });
  }

  private postMessage(message: ServiceWorkerMessage, transfer?: Transferable[]): void {
    if (!this.registration?.active) return;

    this.registration.active.postMessage(message, transfer);
  }
}

/**
 * IndexedDB Persistent Cache
 * Direct IndexedDB operations for persistent caching
 */
export class PersistentCache {
  private dbName = 'buildease-media-cache';
  private dbVersion = 2;
  private db: IDBDatabase | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (typeof window === 'undefined' || !window.indexedDB) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create or upgrade stores
        this.createStores(db);
      };
    });
  }

  private createStores(db: IDBDatabase): void {
    // Media cache store
    if (!db.objectStoreNames.contains('media-cache')) {
      const mediaStore = db.createObjectStore('media-cache', { keyPath: 'key' });
      mediaStore.createIndex('projectId', 'projectId');
      mediaStore.createIndex('timestamp', 'timestamp');
      mediaStore.createIndex('expires', 'expires');
    }

    // Media URLs store (for L3 cache)
    if (!db.objectStoreNames.contains('media-urls')) {
      const urlStore = db.createObjectStore('media-urls', { keyPath: 'mediaId' });
      urlStore.createIndex('projectId', 'projectId');
      urlStore.createIndex('expires', 'expires');
    }

    // Project stats cache (for L2 cache)
    if (!db.objectStoreNames.contains('project-stats')) {
      const statsStore = db.createObjectStore('project-stats', { keyPath: 'projectId' });
      statsStore.createIndex('timestamp', 'timestamp');
    }

    // Request deduplication store
    if (!db.objectStoreNames.contains('request-cache')) {
      const requestStore = db.createObjectStore('request-cache', { keyPath: 'key' });
      requestStore.createIndex('timestamp', 'timestamp');
    }
  }

  /**
   * Store data in persistent cache
   */
  async store(key: string, data: any, ttl?: number, metadata?: Record<string, any>): Promise<void> {
    if (!this.db) return;

    const expires = ttl ? Date.now() + ttl : Date.now() + (24 * 60 * 60 * 1000); // 24h default
    const entry = {
      key,
      data,
      timestamp: Date.now(),
      expires,
      ...metadata
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['media-cache'], 'readwrite');
      const store = transaction.objectStore('media-cache');
      const request = store.put(entry);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Retrieve data from persistent cache
   */
  async retrieve(key: string): Promise<any | null> {
    if (!this.db) return null;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['media-cache'], 'readonly');
      const store = transaction.objectStore('media-cache');
      const request = store.get(key);
      
      request.onsuccess = () => {
        const entry = request.result;
        if (!entry) {
          resolve(null);
          return;
        }

        // Check expiration
        if (Date.now() > entry.expires) {
          // Remove expired entry
          this.remove(key);
          resolve(null);
          return;
        }

        resolve(entry.data);
      };
      
      request.onerror = () => resolve(null);
    });
  }

  /**
   * Store media URL in L3 cache
   */
  async storeMediaUrl(mediaId: string, url: string, projectId: string, ttl = 4 * 60 * 60 * 1000): Promise<void> {
    if (!this.db) return;

    const entry = {
      mediaId,
      url,
      projectId,
      timestamp: Date.now(),
      expires: Date.now() + ttl
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['media-urls'], 'readwrite');
      const store = transaction.objectStore('media-urls');
      const request = store.put(entry);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Retrieve media URL from L3 cache
   */
  async getMediaUrl(mediaId: string): Promise<string | null> {
    if (!this.db) return null;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['media-urls'], 'readonly');
      const store = transaction.objectStore('media-urls');
      const request = store.get(mediaId);
      
      request.onsuccess = () => {
        const entry = request.result;
        if (!entry || Date.now() > entry.expires) {
          resolve(null);
          return;
        }

        resolve(entry.url);
      };
      
      request.onerror = () => resolve(null);
    });
  }

  /**
   * Store project stats in L2 cache
   */
  async storeProjectStats(projectId: string, stats: any, ttl = 30 * 60 * 1000): Promise<void> {
    if (!this.db) return;

    const entry = {
      projectId,
      stats,
      timestamp: Date.now(),
      expires: Date.now() + ttl
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['project-stats'], 'readwrite');
      const store = transaction.objectStore('project-stats');
      const request = store.put(entry);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get project stats from L2 cache
   */
  async getProjectStats(projectId: string): Promise<any | null> {
    if (!this.db) return null;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['project-stats'], 'readonly');
      const store = transaction.objectStore('project-stats');
      const request = store.get(projectId);
      
      request.onsuccess = () => {
        const entry = request.result;
        if (!entry || Date.now() > entry.expires) {
          resolve(null);
          return;
        }

        resolve(entry.stats);
      };
      
      request.onerror = () => resolve(null);
    });
  }

  /**
   * Remove expired entries
   */
  async cleanup(): Promise<number> {
    if (!this.db) return 0;

    const stores = ['media-cache', 'media-urls', 'project-stats', 'request-cache'];
    let cleaned = 0;

    for (const storeName of stores) {
      cleaned += await this.cleanupStore(storeName);
    }

    return cleaned;
  }

  private async cleanupStore(storeName: string): Promise<number> {
    return new Promise((resolve) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore('store');
      const request = store.getAll();
      let cleaned = 0;
      
      request.onsuccess = () => {
        const entries = request.result;
        const now = Date.now();
        
        entries.forEach(entry => {
          if (entry.expires && now > entry.expires) {
            store.delete(entry.key || entry.mediaId || entry.projectId);
            cleaned++;
          }
        });
        
        resolve(cleaned);
      };
      
      request.onerror = () => resolve(0);
    });
  }

  /**
   * Remove specific entry
   */
  async remove(key: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['media-cache'], 'readwrite');
      const store = transaction.objectStore('media-cache');
      const request = store.delete(key);
      
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    });
  }

  /**
   * Clear all cache data
   */
  async clear(): Promise<void> {
    if (!this.db) return;

    const stores = ['media-cache', 'media-urls', 'project-stats', 'request-cache'];
    const promises = stores.map(storeName => 
      new Promise<void>((resolve) => {
        const transaction = this.db!.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        
        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
      })
    );

    await Promise.all(promises);
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<any> {
    if (!this.db) return null;

    const stores = ['media-cache', 'media-urls', 'project-stats'];
    const stats: any = {
      stores: {},
      totalEntries: 0,
      expiredEntries: 0
    };

    for (const storeName of stores) {
      const storeStats = await this.getStoreStats(storeName);
      stats.stores[storeName] = storeStats;
      stats.totalEntries += storeStats.total;
      stats.expiredEntries += storeStats.expired;
    }

    return stats;
  }

  private async getStoreStats(storeName: string): Promise<any> {
    return new Promise((resolve) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const entries = request.result;
        const now = Date.now();
        const expired = entries.filter(entry => entry.expires && now > entry.expires).length;
        
        resolve({
          total: entries.length,
          expired,
          valid: entries.length - expired
        });
      };
      
      request.onerror = () => resolve({ total: 0, expired: 0, valid: 0 });
    });
  }
}

// Global instances
let globalServiceWorkerCache: ServiceWorkerCacheManager | null = null;
let globalPersistentCache: PersistentCache | null = null;

export function getServiceWorkerCache(): ServiceWorkerCacheManager {
  if (!globalServiceWorkerCache) {
    globalServiceWorkerCache = new ServiceWorkerCacheManager();
  }
  return globalServiceWorkerCache;
}

export function getPersistentCache(): PersistentCache {
  if (!globalPersistentCache) {
    globalPersistentCache = new PersistentCache();
  }
  return globalPersistentCache;
}

/**
 * Initialize persistent caching system
 */
export async function initializePersistentCache(): Promise<void> {
  // Initialize both service worker and IndexedDB caching
  getServiceWorkerCache();
  getPersistentCache();
  
  console.log('Persistent cache system initialized');
}

/**
 * React hook for persistent cache operations
 */
export function usePersistentCache() {
  const swCache = getServiceWorkerCache();
  const persistentCache = getPersistentCache();

  return {
    // Service worker operations
    requestCacheWarm: swCache.requestCacheWarm.bind(swCache),
    syncCache: swCache.syncCache.bind(swCache),
    requestCleanup: swCache.requestCacheCleanup.bind(swCache),
    
    // Direct IndexedDB operations
    store: persistentCache.store.bind(persistentCache),
    retrieve: persistentCache.retrieve.bind(persistentCache),
    storeMediaUrl: persistentCache.storeMediaUrl.bind(persistentCache),
    getMediaUrl: persistentCache.getMediaUrl.bind(persistentCache),
    storeProjectStats: persistentCache.storeProjectStats.bind(persistentCache),
    getProjectStats: persistentCache.getProjectStats.bind(persistentCache),
    cleanup: persistentCache.cleanup.bind(persistentCache),
    clear: persistentCache.clear.bind(persistentCache),
    getStats: persistentCache.getStats.bind(persistentCache)
  };
}