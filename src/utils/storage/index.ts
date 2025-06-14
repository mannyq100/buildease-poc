/**
 * Storage Utilities - Unified Export
 * 
 * Centralized exports for all storage-related utilities
 */

// Core storage system
export { StorageManager, storageManager } from './StorageManager';
export { IndexedDBStrategy } from './strategies/IndexedDBStrategy';
export { LocalStorageStrategy } from './strategies/LocalStorageStrategy';

// Auth storage service
export { 
  AuthStorageService, 
  authStorage,
  type UserProfile,
  type AuthTokens,
  type ProviderTokens,
  type SessionData,
  type AuthStorageInterface 
} from './AuthStorageService';

// Cleanup utilities
export {
  cleanupLegacyStorage,
  performStorageHealthCheck,
  cleanupExpiredItems,
  initializeStorageSystem,
  schedulePeriodicCleanup,
  type CleanupReport,
  type HealthCheckReport
} from './cleanupUtils';

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
export { useImageStorageV2 } from '../../hooks/useImageStorageV2';

// Legacy hook removed - use useImageStorageV2 instead