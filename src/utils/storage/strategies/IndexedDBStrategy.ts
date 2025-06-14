/**
 * IndexedDB Storage Strategy
 * 
 * High-performance storage for binary data like images
 * Handles large files efficiently with automatic cleanup
 */

import { StorageStrategy, StorageOptions, StorageUsage, StorageItem, StorageError } from '../types';
import { INDEXEDDB_CONFIG, STORAGE_CONFIG, StorageErrorType, STORAGE_ERROR_MESSAGES } from '../constants';

export class IndexedDBStrategy implements StorageStrategy {
  private db: IDBDatabase | null = null;
  private readonly dbName = INDEXEDDB_CONFIG.DATABASE_NAME;
  private readonly version = INDEXEDDB_CONFIG.VERSION;

  constructor() {
    this.initDB();
  }

  /**
   * Initialize IndexedDB connection
   */
  private async initDB(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(new StorageError(
          'Failed to open IndexedDB',
          StorageErrorType.NOT_SUPPORTED,
          request.error || undefined
        ));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create images store
        if (!db.objectStoreNames.contains(INDEXEDDB_CONFIG.STORES.IMAGES)) {
          const imagesStore = db.createObjectStore(INDEXEDDB_CONFIG.STORES.IMAGES, { keyPath: 'key' });
          imagesStore.createIndex('createdAt', 'metadata.createdAt');
          imagesStore.createIndex('expiresAt', 'metadata.expiresAt');
        }

        // Create cache store
        if (!db.objectStoreNames.contains(INDEXEDDB_CONFIG.STORES.CACHE)) {
          const cacheStore = db.createObjectStore(INDEXEDDB_CONFIG.STORES.CACHE, { keyPath: 'key' });
          cacheStore.createIndex('expiresAt', 'metadata.expiresAt');
        }

        // Create documents store
        if (!db.objectStoreNames.contains(INDEXEDDB_CONFIG.STORES.DOCUMENTS)) {
          db.createObjectStore(INDEXEDDB_CONFIG.STORES.DOCUMENTS, { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * Get appropriate store name based on data type
   */
  private getStoreName(key: string): string {
    if (key.includes('image') || key.includes('photo') || key.includes('picture')) {
      return INDEXEDDB_CONFIG.STORES.IMAGES;
    }
    if (key.includes('cache') || key.includes('temp')) {
      return INDEXEDDB_CONFIG.STORES.CACHE;
    }
    return INDEXEDDB_CONFIG.STORES.DOCUMENTS;
  }

  /**
   * Set a value in IndexedDB
   */
  async set<T>(key: string, value: T, options: StorageOptions = {}): Promise<void> {
    await this.initDB();
    
    if (!this.db) {
      throw new StorageError('IndexedDB not available', StorageErrorType.NOT_SUPPORTED);
    }

    const storeName = this.getStoreName(key);
    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    // Calculate expiration time
    const now = Date.now();
    const expiresAt = options.expiresIn ? now + options.expiresIn : undefined;

    // Create storage item with metadata
    const item: StorageItem<T> = {
      value,
      metadata: {
        key,
        createdAt: now,
        updatedAt: now,
        expiresAt,
        size: this.calculateSize(value),
        version: '1.0'
      }
    };

    return new Promise((resolve, reject) => {
      const request = store.put({ key, ...item });

      request.onsuccess = () => resolve();
      request.onerror = () => {
        if (request.error?.name === 'QuotaExceededError') {
          reject(new StorageError(
            STORAGE_ERROR_MESSAGES[StorageErrorType.QUOTA_EXCEEDED],
            StorageErrorType.QUOTA_EXCEEDED,
            request.error
          ));
        } else {
          reject(new StorageError(
            'Failed to store data',
            StorageErrorType.SERIALIZATION_ERROR,
            request.error || undefined
          ));
        }
      };
    });
  }

  /**
   * Get a value from IndexedDB
   */
  async get<T>(key: string, defaultValue?: T): Promise<T | null> {
    await this.initDB();
    
    if (!this.db) {
      return defaultValue || null;
    }

    const storeName = this.getStoreName(key);
    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve) => {
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        
        if (!result) {
          resolve(defaultValue || null);
          return;
        }

        // Check if item has expired
        if (result.metadata?.expiresAt && Date.now() > result.metadata.expiresAt) {
          // Item expired, remove it and return default
          this.remove(key).catch(console.error);
          resolve(defaultValue || null);
          return;
        }

        resolve(result.value as T);
      };

      request.onerror = () => {
        console.error('Error getting data from IndexedDB:', request.error);
        resolve(defaultValue || null);
      };
    });
  }

  /**
   * Remove a value from IndexedDB
   */
  async remove(key: string): Promise<void> {
    await this.initDB();
    
    if (!this.db) return;

    const storeName = this.getStoreName(key);
    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all data from IndexedDB
   */
  async clear(): Promise<void> {
    await this.initDB();
    
    if (!this.db) return;

    const stores = [
      INDEXEDDB_CONFIG.STORES.IMAGES,
      INDEXEDDB_CONFIG.STORES.CACHE,
      INDEXEDDB_CONFIG.STORES.DOCUMENTS
    ];

    const transaction = this.db.transaction(stores, 'readwrite');

    const promises = stores.map(storeName => {
      return new Promise<void>((resolve, reject) => {
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });

    await Promise.all(promises);
  }

  /**
   * Check if a key exists
   */
  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  /**
   * Get all keys
   */
  async keys(): Promise<string[]> {
    await this.initDB();
    
    if (!this.db) return [];

    const stores = [
      INDEXEDDB_CONFIG.STORES.IMAGES,
      INDEXEDDB_CONFIG.STORES.CACHE,
      INDEXEDDB_CONFIG.STORES.DOCUMENTS
    ];

    const allKeys: string[] = [];

    for (const storeName of stores) {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);

      const keys = await new Promise<string[]>((resolve) => {
        const request = store.getAllKeys();
        request.onsuccess = () => resolve(request.result as string[]);
        request.onerror = () => resolve([]);
      });

      allKeys.push(...keys);
    }

    return allKeys;
  }

  /**
   * Get storage size
   */
  async size(): Promise<number> {
    const keys = await this.keys();
    return keys.length;
  }

  /**
   * Cleanup expired items
   */
  async cleanup(): Promise<void> {
    await this.initDB();
    
    if (!this.db) return;

    const now = Date.now();
    const stores = [INDEXEDDB_CONFIG.STORES.IMAGES, INDEXEDDB_CONFIG.STORES.CACHE];

    for (const storeName of stores) {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      if (store.indexNames.contains('expiresAt')) {
        const index = store.index('expiresAt');
        const range = IDBKeyRange.upperBound(now);
        
        await new Promise<void>((resolve) => {
          const request = index.openCursor(range);
          request.onsuccess = () => {
            const cursor = request.result;
            if (cursor) {
              cursor.delete();
              cursor.continue();
            } else {
              resolve();
            }
          };
          request.onerror = () => resolve();
        });
      }
    }

    // Clean up old items if we exceed limits
    await this.cleanupOldItems();
  }

  /**
   * Clean up old items when limits are exceeded
   */
  private async cleanupOldItems(): Promise<void> {
    if (!this.db) return;

    const maxImages = STORAGE_CONFIG.INDEXED_DB.MAX_IMAGES_COUNT;
    const transaction = this.db.transaction([INDEXEDDB_CONFIG.STORES.IMAGES], 'readwrite');
    const store = transaction.objectStore(INDEXEDDB_CONFIG.STORES.IMAGES);

    // Get all items sorted by creation date
    const items = await new Promise<StorageItem[]>((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });

    if (items.length > maxImages) {
      // Sort by creation date (oldest first)
      items.sort((a, b) => a.metadata.createdAt - b.metadata.createdAt);
      
      // Remove oldest items
      const itemsToRemove = items.slice(0, items.length - maxImages);
      
      for (const item of itemsToRemove) {
        await new Promise<void>((resolve) => {
          const deleteRequest = store.delete(item.metadata.key);
          deleteRequest.onsuccess = () => resolve();
          deleteRequest.onerror = () => resolve();
        });
      }
    }
  }

  /**
   * Get storage usage information
   */
  async getUsage(): Promise<StorageUsage> {
    await this.initDB();
    
    if (!this.db) {
      return { used: 0, available: 0, percentage: 0, itemCount: 0 };
    }

    const keys = await this.keys();
    let totalSize = 0;

    // Calculate total size by getting all items (this is expensive but accurate)
    for (const key of keys) {
      const item = await this.get(key);
      if (item) {
        totalSize += this.calculateSize(item);
      }
    }

    // Estimate available space (IndexedDB doesn't provide exact quotas)
    const maxSize = STORAGE_CONFIG.INDEXED_DB.MAX_SIZE_MB * 1024 * 1024;
    const available = Math.max(0, maxSize - totalSize);
    const percentage = maxSize > 0 ? (totalSize / maxSize) * 100 : 0;

    return {
      used: totalSize,
      available,
      percentage: Math.min(100, percentage),
      itemCount: keys.length
    };
  }

  /**
   * Calculate approximate size of a value
   */
  private calculateSize(value: unknown): number {
    try {
      return new Blob([JSON.stringify(value)]).size;
    } catch {
      return 0;
    }
  }
}