/**
 * Storage Manager
 * 
 * Unified storage interface that automatically selects the best strategy
 * for each type of data and handles fallbacks gracefully
 */

import { StorageStrategy, StorageOptions, StorageUsage, StorageConfig, StorageError } from './types';
import { IndexedDBStrategy } from './strategies/IndexedDBStrategy';
import { LocalStorageStrategy } from './strategies/LocalStorageStrategy';
import { STORAGE_KEYS, StorageErrorType } from './constants';

export class StorageManager {
  private indexedDB: IndexedDBStrategy;
  private localStorage: LocalStorageStrategy;
  private config: StorageConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config?: Partial<StorageConfig>) {
    this.indexedDB = new IndexedDBStrategy();
    this.localStorage = new LocalStorageStrategy();
    
    // Default configuration
    this.config = {
      strategy: 'hybrid',
      fallbackStrategy: 'localStorage',
      autoCleanup: {
        enabled: true,
        interval: 30 * 60 * 1000, // 30 minutes
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        maxItems: 1000
      },
      monitoring: {
        enabled: true,
        sampleRate: 0.1, // 10% sampling
        reportInterval: 60 * 60 * 1000 // 1 hour
      },
      ...config
    };

    // Start automatic cleanup if enabled
    if (this.config.autoCleanup.enabled) {
      this.startAutoCleanup();
    }
  }

  /**
   * Get the appropriate strategy for a given key
   */
  private getStrategy(key: string): StorageStrategy {
    // Image data should use IndexedDB for better performance
    if (this.isImageKey(key)) {
      return this.indexedDB;
    }

    // Large data should use IndexedDB
    if (this.isLargeDataKey(key)) {
      return this.indexedDB;
    }

    // Small configuration and auth data can use localStorage
    if (this.isSmallDataKey(key)) {
      return this.localStorage;
    }

    // Default to hybrid approach based on configuration
    return this.config.strategy === 'indexedDB' ? this.indexedDB : this.localStorage;
  }

  /**
   * Check if key is for image data
   */
  private isImageKey(key: string): boolean {
    const imagePatterns = ['image', 'photo', 'picture', 'avatar', 'profile_pic', 'inspiration'];
    return imagePatterns.some(pattern => key.toLowerCase().includes(pattern));
  }

  /**
   * Check if key is for large data
   */
  private isLargeDataKey(key: string): boolean {
    const largeDataPatterns = ['draft', 'cache', 'document', 'file'];
    return largeDataPatterns.some(pattern => key.toLowerCase().includes(pattern));
  }

  /**
   * Check if key is for small configuration data
   */
  private isSmallDataKey(key: string): boolean {
    const authValues = [STORAGE_KEYS.AUTH.TOKEN, STORAGE_KEYS.AUTH.REFRESH_TOKEN, STORAGE_KEYS.AUTH.USER_PROFILE];
    const userValues = [STORAGE_KEYS.USER.NAME, STORAGE_KEYS.USER.PREFERENCES, STORAGE_KEYS.USER.SESSION];
    const navigationValues = [STORAGE_KEYS.NAVIGATION.RETURN_URL, STORAGE_KEYS.NAVIGATION.LAST_ROUTE];
    
    return authValues.includes(key) ||
           userValues.includes(key) ||
           key === STORAGE_KEYS.THEME ||
           navigationValues.includes(key) ||
           key.startsWith('buildease_profile_cache_'); // Handle dynamic profile cache keys
  }

  /**
   * Set a value using the appropriate strategy
   */
  async set<T>(key: string, value: T, options: StorageOptions = {}): Promise<void> {
    const strategy = this.getStrategy(key);
    
    try {
      await strategy.set(key, value, options);
      this.logOperation('set', key, true);
    } catch (error) {
      this.logOperation('set', key, false, error);
      
      // Try fallback strategy if configured
      if (this.config.fallbackStrategy && strategy !== this.getFallbackStrategy()) {
        try {
          await this.getFallbackStrategy().set(key, value, options);
          if (process.env.NODE_ENV === 'development') {
            console.warn(`Fallback storage used for key: ${key}`);
          }
        } catch {
          throw error; // Throw original error
        }
      } else {
        throw error;
      }
    }
  }

  /**
   * Get a value using the appropriate strategy
   */
  async get<T>(key: string, defaultValue?: T): Promise<T | null> {
    const strategy = this.getStrategy(key);
    
    try {
      const result = await strategy.get(key, defaultValue);
      this.logOperation('get', key, true);
      return result;
    } catch (error) {
      this.logOperation('get', key, false, error);
      
      // Try fallback strategy if configured
      if (this.config.fallbackStrategy && strategy !== this.getFallbackStrategy()) {
        try {
          return await this.getFallbackStrategy().get(key, defaultValue);
        } catch {
          return defaultValue || null;
        }
      }
      
      return defaultValue || null;
    }
  }

  /**
   * Remove a value
   */
  async remove(key: string): Promise<void> {
    const strategy = this.getStrategy(key);
    
    try {
      await strategy.remove(key);
      this.logOperation('remove', key, true);
    } catch (error) {
      this.logOperation('remove', key, false, error);
      
      // Try fallback strategy
      if (this.config.fallbackStrategy && strategy !== this.getFallbackStrategy()) {
        try {
          await this.getFallbackStrategy().remove(key);
        } catch {
          // Ignore fallback errors for remove operations
        }
      }
      
      throw error;
    }
  }

  /**
   * Clear all data from both strategies
   */
  async clear(): Promise<void> {
    const errors: Error[] = [];
    
    try {
      await this.localStorage.clear();
    } catch (error) {
      errors.push(error instanceof Error ? error : new Error('LocalStorage clear failed'));
    }
    
    try {
      await this.indexedDB.clear();
    } catch (error) {
      errors.push(error instanceof Error ? error : new Error('IndexedDB clear failed'));
    }
    
    if (errors.length > 0) {
      throw new StorageError(
        `Failed to clear storage: ${errors.map(e => e.message).join(', ')}`,
        StorageErrorType.CORRUPTION_ERROR
      );
    }
  }

  /**
   * Check if a key exists
   */
  async has(key: string): Promise<boolean> {
    const strategy = this.getStrategy(key);
    return strategy.has(key);
  }

  /**
   * Get all keys from both strategies
   */
  async keys(): Promise<string[]> {
    const [localKeys, indexedKeys] = await Promise.all([
      this.localStorage.keys().catch(() => []),
      this.indexedDB.keys().catch(() => [])
    ]);
    
    // Remove duplicates
    return [...new Set([...localKeys, ...indexedKeys])];
  }

  /**
   * Get total item count
   */
  async size(): Promise<number> {
    const keys = await this.keys();
    return keys.length;
  }

  /**
   * Get combined storage usage
   */
  async getUsage(): Promise<StorageUsage> {
    const [localUsage, indexedUsage] = await Promise.all([
      this.localStorage.getUsage().catch(() => ({ used: 0, available: 0, percentage: 0, itemCount: 0 })),
      this.indexedDB.getUsage().catch(() => ({ used: 0, available: 0, percentage: 0, itemCount: 0 }))
    ]);

    return {
      used: localUsage.used + indexedUsage.used,
      available: localUsage.available + indexedUsage.available,
      percentage: Math.max(localUsage.percentage, indexedUsage.percentage),
      itemCount: localUsage.itemCount + indexedUsage.itemCount
    };
  }

  /**
   * Perform cleanup on both strategies
   */
  async cleanup(): Promise<void> {
    const errors: Error[] = [];
    
    try {
      await this.localStorage.cleanup();
    } catch (error) {
      errors.push(error instanceof Error ? error : new Error('LocalStorage cleanup failed'));
    }
    
    try {
      await this.indexedDB.cleanup();
    } catch (error) {
      errors.push(error instanceof Error ? error : new Error('IndexedDB cleanup failed'));
    }
    
    if (errors.length > 0 && process.env.NODE_ENV === 'development') {
      console.warn('Storage cleanup completed with errors:', errors);
    }
  }

  /**
   * Get fallback strategy
   */
  private getFallbackStrategy(): StorageStrategy {
    return this.config.fallbackStrategy === 'indexedDB' ? this.indexedDB : this.localStorage;
  }

  /**
   * Start automatic cleanup
   */
  private startAutoCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanup().catch(error => {
        if (process.env.NODE_ENV === 'development') {
          console.error('Automatic cleanup failed:', error);
        }
      });
    }, this.config.autoCleanup.interval);
  }

  /**
   * Stop automatic cleanup
   */
  stopAutoCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Log storage operations for monitoring
   */
  private logOperation(operation: string, key: string, success: boolean, error?: unknown): void {
    if (!this.config.monitoring.enabled) return;
    
    // Only log based on sample rate
    if (Math.random() > this.config.monitoring.sampleRate) return;
    
    const logData = {
      timestamp: Date.now(),
      operation,
      key,
      success,
      error: error instanceof Error ? error.message : error
    };
    
    // Only log in development environment
    if (process.env.NODE_ENV === 'development') {
      if (success) {
        console.debug('Storage operation:', logData);
      } else {
        console.warn('Storage operation failed:', logData);
      }
    }
  }

  /**
   * Destroy the storage manager and cleanup resources
   */
  destroy(): void {
    this.stopAutoCleanup();
  }
}

// Export singleton instance
export const storageManager = new StorageManager();