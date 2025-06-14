/**
 * Storage Constants
 * 
 * Centralized storage keys and configuration to prevent conflicts
 * and maintain consistency across the application
 */

// Storage Keys - Use consistent naming pattern
export const STORAGE_KEYS = {
  // Authentication
  AUTH: {
    TOKEN: 'buildease_auth_token',
    REFRESH_TOKEN: 'buildease_refresh_token',
    USER_PROFILE: 'buildease_user_profile',
    PROFILE_CACHE: (userId: string) => `buildease_profile_cache_${userId}`,
  },
  
  // Theme & UI Preferences
  THEME: 'buildease_theme',
  
  // Form Data
  FORM: {
    PROJECT_DRAFT: 'buildease_project_draft',
    AUTO_SAVE_PREFIX: 'buildease_autosave_',
  },
  
  // Navigation & Routing
  NAVIGATION: {
    RETURN_URL: 'buildease_return_url',
    LAST_ROUTE: 'buildease_last_route',
  },
  
  // User Activity
  USER: {
    NAME: 'buildease_user_name',
    PREFERENCES: 'buildease_user_preferences',
    SESSION: 'buildease_session_data',
  },
  
  // Legacy keys (for migration)
  LEGACY: {
    AUTH_TOKEN: 'authToken',
    REFRESH_TOKEN: 'refreshToken',
    THEME: 'theme',
    USER_NAME: 'userName',
  },
} as const;

// IndexedDB Configuration
export const INDEXEDDB_CONFIG = {
  DATABASE_NAME: 'BuildEaseDB',
  VERSION: 1,
  STORES: {
    IMAGES: 'images',
    CACHE: 'cache',
    DOCUMENTS: 'documents',
  },
} as const;

// Storage Limits & Configuration
export const STORAGE_CONFIG = {
  // localStorage limits (conservative estimates)
  LOCAL_STORAGE: {
    MAX_SIZE_MB: 5, // 5MB conservative limit
    MAX_ITEM_SIZE_KB: 500, // 500KB per item
    WARNING_THRESHOLD: 0.8, // Warn at 80% usage
  },
  
  // IndexedDB limits
  INDEXED_DB: {
    MAX_SIZE_MB: 50, // 50MB for binary data
    MAX_IMAGE_SIZE_MB: 10, // 10MB per image
    MAX_IMAGES_COUNT: 100, // Max images per project
    CLEANUP_AFTER_DAYS: 30, // Clean up old data after 30 days
  },
  
  // Cache expiration times
  CACHE_EXPIRY: {
    USER_PROFILE: 5 * 60 * 1000, // 5 minutes
    SESSION_DATA: 24 * 60 * 60 * 1000, // 24 hours
    FORM_DRAFT: 7 * 24 * 60 * 60 * 1000, // 7 days
    IMAGES: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
} as const;

// Storage events for cross-tab communication
export const STORAGE_EVENTS = {
  AUTH_CHANGED: 'buildease_auth_changed',
  THEME_CHANGED: 'buildease_theme_changed',
  FORM_SAVED: 'buildease_form_saved',
  PROFILE_UPDATED: 'buildease_profile_updated',
} as const;

// Error types for storage operations
export enum StorageErrorType {
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NOT_SUPPORTED = 'NOT_SUPPORTED',
  SERIALIZATION_ERROR = 'SERIALIZATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  CORRUPTION_ERROR = 'CORRUPTION_ERROR',
}

// Storage error messages
export const STORAGE_ERROR_MESSAGES = {
  [StorageErrorType.QUOTA_EXCEEDED]: 'Storage quota exceeded. Please clear some data or use fewer images.',
  [StorageErrorType.PERMISSION_DENIED]: 'Storage access denied. Please check browser permissions.',
  [StorageErrorType.NOT_SUPPORTED]: 'Storage not supported in this browser.',
  [StorageErrorType.SERIALIZATION_ERROR]: 'Failed to save data. Data format may be invalid.',
  [StorageErrorType.NETWORK_ERROR]: 'Network error while accessing storage.',
  [StorageErrorType.CORRUPTION_ERROR]: 'Storage data appears to be corrupted.',
} as const;