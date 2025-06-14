/**
 * LocalStorage Strategy
 * 
 * Lightweight storage for small data like preferences and settings
 * Includes automatic serialization and size management
 */

import { StorageStrategy, StorageOptions, StorageUsage, StorageItem, StorageError } from '../types';
import { STORAGE_CONFIG, StorageErrorType, STORAGE_ERROR_MESSAGES } from '../constants';

export class LocalStorageStrategy implements StorageStrategy {
  private readonly maxSize = STORAGE_CONFIG.LOCAL_STORAGE.MAX_SIZE_MB * 1024 * 1024;
  private readonly maxItemSize = STORAGE_CONFIG.LOCAL_STORAGE.MAX_ITEM_SIZE_KB * 1024;

  /**
   * Check if localStorage is available
   */
  private isAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Set a value in localStorage
   */
  async set<T>(key: string, value: T, options: StorageOptions = {}): Promise<void> {
    if (!this.isAvailable()) {
      throw new StorageError(
        STORAGE_ERROR_MESSAGES[StorageErrorType.NOT_SUPPORTED],
        StorageErrorType.NOT_SUPPORTED
      );
    }

    try {
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
          size: 0, // Will be calculated after serialization
          version: '1.0'
        }
      };

      // Serialize the item
      const serialized = this.serialize(item, options);
      item.metadata.size = new Blob([serialized]).size;

      // Check item size limit
      if (item.metadata.size > this.maxItemSize) {
        throw new StorageError(
          `Item size (${Math.round(item.metadata.size / 1024)}KB) exceeds limit (${STORAGE_CONFIG.LOCAL_STORAGE.MAX_ITEM_SIZE_KB}KB)`,
          StorageErrorType.QUOTA_EXCEEDED
        );
      }

      // Check total storage usage before setting
      const usage = await this.getUsage();
      if (usage.used + item.metadata.size > this.maxSize) {
        // Try cleanup first
        await this.cleanup();
        
        // Check again after cleanup
        const newUsage = await this.getUsage();
        if (newUsage.used + item.metadata.size > this.maxSize) {
          throw new StorageError(
            STORAGE_ERROR_MESSAGES[StorageErrorType.QUOTA_EXCEEDED],
            StorageErrorType.QUOTA_EXCEEDED
          );
        }
      }

      // Store the item
      localStorage.setItem(key, this.serialize(item, options));

    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }

      // Handle quota exceeded errors
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        throw new StorageError(
          STORAGE_ERROR_MESSAGES[StorageErrorType.QUOTA_EXCEEDED],
          StorageErrorType.QUOTA_EXCEEDED,
          error
        );
      }

      throw new StorageError(
        'Failed to store data in localStorage',
        StorageErrorType.SERIALIZATION_ERROR,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Get a value from localStorage
   */
  async get<T>(key: string, defaultValue?: T): Promise<T | null> {
    if (!this.isAvailable()) {
      return defaultValue || null;
    }

    try {
      const stored = localStorage.getItem(key);
      
      if (!stored) {
        return defaultValue || null;
      }

      const item = this.deserialize<StorageItem<T>>(stored);
      
      if (!item || !item.metadata) {
        // Invalid item format, remove it
        localStorage.removeItem(key);
        return defaultValue || null;
      }

      // Check if item has expired
      if (item.metadata.expiresAt && Date.now() > item.metadata.expiresAt) {
        localStorage.removeItem(key);
        return defaultValue || null;
      }

      return item.value;

    } catch (error) {
      console.error('Error getting data from localStorage:', error);
      // Remove corrupted data
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore cleanup errors
      }
      return defaultValue || null;
    }
  }

  /**
   * Remove a value from localStorage
   */
  async remove(key: string): Promise<void> {
    if (!this.isAvailable()) return;
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  /**
   * Clear all data from localStorage
   */
  async clear(): Promise<void> {
    if (!this.isAvailable()) return;
    
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * Check if a key exists and is valid
   */
  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  /**
   * Get all keys
   */
  async keys(): Promise<string[]> {
    if (!this.isAvailable()) return [];
    
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) keys.push(key);
      }
      return keys;
    } catch (error) {
      console.error('Error getting localStorage keys:', error);
      return [];
    }
  }

  /**
   * Get number of items
   */
  async size(): Promise<number> {
    const keys = await this.keys();
    return keys.length;
  }

  /**
   * Cleanup expired and old items
   */
  async cleanup(): Promise<void> {
    if (!this.isAvailable()) return;

    const keys = await this.keys();
    const now = Date.now();
    const itemsToRemove: string[] = [];
    const validItems: Array<{ key: string; item: StorageItem; size: number }> = [];

    // First pass: identify expired items and collect valid items
    for (const key of keys) {
      try {
        const stored = localStorage.getItem(key);
        if (!stored) continue;

        const item = this.deserialize<StorageItem>(stored);
        if (!item || !item.metadata) {
          itemsToRemove.push(key);
          continue;
        }

        // Check if expired
        if (item.metadata.expiresAt && now > item.metadata.expiresAt) {
          itemsToRemove.push(key);
          continue;
        }

        validItems.push({
          key,
          item,
          size: item.metadata.size || new Blob([stored]).size
        });

      } catch (error) {
        // Remove corrupted items
        itemsToRemove.push(key);
      }
    }

    // Remove expired and corrupted items
    for (const key of itemsToRemove) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Error removing expired item ${key}:`, error);
      }
    }

    // Check if we need to remove old items due to size constraints
    const totalSize = validItems.reduce((sum, item) => sum + item.size, 0);
    const warningThreshold = this.maxSize * STORAGE_CONFIG.LOCAL_STORAGE.WARNING_THRESHOLD;

    if (totalSize > warningThreshold) {
      // Sort by creation date (oldest first)
      validItems.sort((a, b) => a.item.metadata.createdAt - b.item.metadata.createdAt);
      
      let currentSize = totalSize;
      const targetSize = this.maxSize * 0.7; // Target 70% usage after cleanup

      for (const { key, size } of validItems) {
        if (currentSize <= targetSize) break;
        
        try {
          localStorage.removeItem(key);
          currentSize -= size;
        } catch {
          console.error(`Error removing old item ${key}`);
        }
      }
    }
  }

  /**
   * Get storage usage information
   */
  async getUsage(): Promise<StorageUsage> {
    if (!this.isAvailable()) {
      return { used: 0, available: 0, percentage: 0, itemCount: 0 };
    }

    let totalSize = 0;
    const keys = await this.keys();

    // Calculate total size
    for (const key of keys) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          totalSize += new Blob([stored]).size;
        }
      } catch (error) {
        console.error(`Error calculating size for ${key}:`, error);
      }
    }

    const available = Math.max(0, this.maxSize - totalSize);
    const percentage = this.maxSize > 0 ? (totalSize / this.maxSize) * 100 : 0;

    return {
      used: totalSize,
      available,
      percentage: Math.min(100, percentage),
      itemCount: keys.length
    };
  }

  /**
   * Serialize data with optional compression/encryption
   */
  private serialize<T>(data: T, options: StorageOptions = {}): string {
    try {
      let serialized: string;

      if (options.serializer) {
        serialized = options.serializer.serialize(data);
      } else {
        serialized = JSON.stringify(data);
      }

      // Note: Compression and encryption would be implemented here
      // For now, we just return the serialized data
      return serialized;

    } catch (error) {
      throw new StorageError(
        'Failed to serialize data',
        StorageErrorType.SERIALIZATION_ERROR,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Deserialize data
   */
  private deserialize<T>(data: string, options: StorageOptions = {}): T {
    try {
      // Note: Decompression and decryption would be implemented here
      
      if (options.serializer) {
        return options.serializer.deserialize(data) as T;
      } else {
        return JSON.parse(data) as T;
      }

    } catch (error) {
      throw new StorageError(
        'Failed to deserialize data',
        StorageErrorType.SERIALIZATION_ERROR,
        error instanceof Error ? error : undefined
      );
    }
  }
}