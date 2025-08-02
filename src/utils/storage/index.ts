/**
 * Storage Utilities - Unified Export
 * 
 * Centralized exports for all storage-related utilities
 */

// Core storage system
export { StorageManager, storageManager } from './StorageManager';
export { IndexedDBStrategy } from './strategies/IndexedDBStrategy';
export { LocalStorageStrategy } from './strategies/LocalStorageStrategy';

// Auth storage handled by LightweightStorageAdapter for Supabase integration

// Storage cleanup handled by individual strategies

// Types and constants
export {
  type StorageStrategy,
  type StorageOptions,
  type StorageUsage,
  type StorageItem,
  type StorageConfig,
  type StoredImage,
  type ImageStorageOptions,
  type CacheEntry,
  type StorageMigration,
  StorageError
} from './types';

export {
  STORAGE_KEYS,
  INDEXEDDB_CONFIG,
  STORAGE_CONFIG,
  STORAGE_EVENTS,
  StorageErrorType,
  STORAGE_ERROR_MESSAGES
} from './constants';

// Enhanced hooks


// Legacy hooks removed - use SimplifiedUpload and useSimplifiedUpload instead