/**
 * Storage Types & Interfaces
 * 
 * Type definitions for the unified storage system
 */

import { StorageErrorType } from './constants';

// Base storage interface that all strategies must implement
export interface StorageStrategy {
  // Basic CRUD operations
  set<T>(key: string, value: T, options?: StorageOptions): Promise<void>;
  get<T>(key: string, defaultValue?: T): Promise<T | null>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  
  // Utility methods
  has(key: string): Promise<boolean>;
  keys(): Promise<string[]>;
  size(): Promise<number>;
  
  // Cleanup and maintenance
  cleanup(): Promise<void>;
  getUsage(): Promise<StorageUsage>;
}

// Options for storage operations
export interface StorageOptions {
  // Expiration time in milliseconds (optional)
  expiresIn?: number;
  
  // Whether to compress the data
  compress?: boolean;
  
  // Whether to encrypt the data
  encrypt?: boolean;
  
  // Custom serialization
  serializer?: {
    serialize: (value: unknown) => string;
    deserialize: (value: string) => unknown;
  };
  
  // Fallback behavior on failure
  fallback?: boolean;
}

// Storage usage information
export interface StorageUsage {
  used: number; // Bytes used
  available: number; // Bytes available
  percentage: number; // Percentage used (0-100)
  itemCount: number; // Number of items stored
}

// Stored item with metadata
export interface StorageItem<T = unknown> {
  value: T;
  metadata: {
    key: string;
    createdAt: number;
    updatedAt: number;
    expiresAt?: number;
    size: number;
    version: string;
  };
}

// Storage error class
export class StorageError extends Error {
  constructor(
    message: string,
    public type: StorageErrorType,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

// Image storage specific types
export interface StoredImage {
  id: string;
  file: File;
  metadata: {
    name: string;
    size: number;
    type: string;
    lastModified: number;
    projectId?: string;
    tags?: string[];
    createdAt: number;
  };
  thumbnail?: Blob; // Optional compressed thumbnail
}

export interface ImageStorageOptions extends StorageOptions {
  generateThumbnail?: boolean;
  thumbnailSize?: number; // Max width/height for thumbnail
  quality?: number; // Compression quality (0-1)
  maxSize?: number; // Max file size in bytes
}

// Cache entry with TTL
export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  hits: number; // Access count
}

// Storage migration interface
export interface StorageMigration {
  version: string;
  description: string;
  migrate: (strategy: StorageStrategy) => Promise<void>;
  rollback?: (strategy: StorageStrategy) => Promise<void>;
}

// Storage configuration
export interface StorageConfig {
  strategy: 'localStorage' | 'indexedDB' | 'hybrid';
  fallbackStrategy?: 'localStorage' | 'indexedDB';
  
  // Automatic cleanup configuration
  autoCleanup: {
    enabled: boolean;
    interval: number; // Cleanup interval in milliseconds
    maxAge: number; // Max age for items in milliseconds
    maxItems: number; // Max number of items to keep
  };
  
  // Performance monitoring
  monitoring: {
    enabled: boolean;
    sampleRate: number; // 0-1, percentage of operations to monitor
    reportInterval: number; // Report interval in milliseconds
  };
  
  // Encryption settings
  encryption?: {
    enabled: boolean;
    algorithm: string;
    key?: string; // For testing only, use proper key management
  };
}