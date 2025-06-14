/**
 * Storage Cleanup Utilities
 * 
 * Utilities for cleaning up legacy storage patterns and managing storage health
 */

import { storageManager } from './StorageManager';
import { authStorage } from './AuthStorageService';
import { STORAGE_KEYS } from './constants';

export interface CleanupReport {
  totalItemsCleaned: number;
  totalSizeFreed: number;
  legacyKeysMigrated: number;
  errors: string[];
  details: Array<{
    key: string;
    action: 'removed' | 'migrated' | 'error';
    size?: number;
    error?: string;
  }>;
}

export interface HealthCheckReport {
  storageUsage: {
    used: number;
    available: number;
    percentage: number;
    itemCount: number;
  };
  authStorageUsage: {
    totalItems: number;
    totalSize: number;
    items: Array<{ key: string; size: number }>;
  };
  issues: Array<{
    type: 'warning' | 'error';
    message: string;
    recommendation?: string;
  }>;
  recommendations: string[];
}

/**
 * Clean up legacy storage keys and migrate to unified system
 */
export async function cleanupLegacyStorage(): Promise<CleanupReport> {
  const report: CleanupReport = {
    totalItemsCleaned: 0,
    totalSizeFreed: 0,
    legacyKeysMigrated: 0,
    errors: [],
    details: []
  };

  // Legacy keys that should be migrated or removed
  const legacyMappings = [
    { legacy: 'authToken', new: STORAGE_KEYS.AUTH.TOKEN, migrate: true },
    { legacy: 'refreshToken', new: STORAGE_KEYS.AUTH.REFRESH_TOKEN, migrate: true },
    { legacy: 'theme', new: STORAGE_KEYS.THEME, migrate: true },
    { legacy: 'userName', new: STORAGE_KEYS.USER.NAME, migrate: true },
    { legacy: 'returnUrl', new: STORAGE_KEYS.NAVIGATION.RETURN_URL, migrate: true }
  ];

  // Keys that should just be removed (no migration)
  const keysToRemove = [
    'buildease-theme', // Duplicate theme storage
    'authUser',        // Old auth user data
    'session',         // Generic session key
    'temp_',           // Any temp keys
    'cache_'           // Old cache keys
  ];

  // Migrate legacy keys
  for (const { legacy, new: newKey, migrate } of legacyMappings) {
    try {
      const value = localStorage.getItem(legacy);
      if (value) {
        const size = new Blob([value]).size;
        
        if (migrate) {
          // Migrate to new storage system
          try {
            const parsedValue = JSON.parse(value);
            await storageManager.set(newKey, parsedValue);
            
            report.details.push({
              key: legacy,
              action: 'migrated',
              size
            });
            report.legacyKeysMigrated++;
          } catch (parseError) {
            // If JSON parsing fails, store as string
            await storageManager.set(newKey, value);
            report.details.push({
              key: legacy,
              action: 'migrated',
              size
            });
            report.legacyKeysMigrated++;
          }
        }
        
        // Remove legacy key
        localStorage.removeItem(legacy);
        report.totalItemsCleaned++;
        report.totalSizeFreed += size;
      }
    } catch (error) {
      const errorMsg = `Failed to migrate ${legacy}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      report.errors.push(errorMsg);
      report.details.push({
        key: legacy,
        action: 'error',
        error: errorMsg
      });
    }
  }

  // Remove keys that match removal patterns
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;

    const shouldRemove = keysToRemove.some(pattern => 
      key.startsWith(pattern) || key.includes(pattern)
    );

    if (shouldRemove) {
      try {
        const value = localStorage.getItem(key);
        const size = value ? new Blob([value]).size : 0;
        
        localStorage.removeItem(key);
        
        report.details.push({
          key,
          action: 'removed',
          size
        });
        report.totalItemsCleaned++;
        report.totalSizeFreed += size;
        
        // Adjust index since we removed an item
        i--;
      } catch (error) {
        const errorMsg = `Failed to remove ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        report.errors.push(errorMsg);
        report.details.push({
          key,
          action: 'error',
          error: errorMsg
        });
      }
    }
  }

  return report;
}

/**
 * Perform comprehensive storage health check
 */
export async function performStorageHealthCheck(): Promise<HealthCheckReport> {
  const report: HealthCheckReport = {
    storageUsage: {
      used: 0,
      available: 0,
      percentage: 0,
      itemCount: 0
    },
    authStorageUsage: {
      totalItems: 0,
      totalSize: 0,
      items: []
    },
    issues: [],
    recommendations: []
  };

  try {
    // Get overall storage usage
    report.storageUsage = await storageManager.getUsage();
    
    // Get auth-specific storage usage
    report.authStorageUsage = await authStorage.getAuthStorageUsage();

    // Check for issues
    
    // 1. Storage quota issues
    if (report.storageUsage.percentage > 90) {
      report.issues.push({
        type: 'error',
        message: `Storage usage is critically high (${report.storageUsage.percentage.toFixed(1)}%)`,
        recommendation: 'Run cleanup utilities and consider clearing old cache data'
      });
    } else if (report.storageUsage.percentage > 75) {
      report.issues.push({
        type: 'warning',
        message: `Storage usage is high (${report.storageUsage.percentage.toFixed(1)}%)`,
        recommendation: 'Consider running cleanup utilities'
      });
    }

    // 2. Check for legacy keys
    const legacyKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !key.startsWith('buildease_')) {
        legacyKeys.push(key);
      }
    }

    if (legacyKeys.length > 0) {
      report.issues.push({
        type: 'warning',
        message: `Found ${legacyKeys.length} legacy storage keys`,
        recommendation: 'Run legacy storage cleanup to migrate to unified system'
      });
    }

    // 3. Check for duplicate theme storage
    const themeKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('theme') || key.includes('Theme'))) {
        themeKeys.push(key);
      }
    }

    if (themeKeys.length > 1) {
      report.issues.push({
        type: 'warning',
        message: `Found multiple theme storage keys: ${themeKeys.join(', ')}`,
        recommendation: 'Consolidate theme storage to use unified key'
      });
    }

    // 4. Check for oversized auth data
    const oversizedItems = report.authStorageUsage.items.filter(item => item.size > 50 * 1024); // 50KB
    if (oversizedItems.length > 0) {
      report.issues.push({
        type: 'warning',
        message: `Found ${oversizedItems.length} oversized auth storage items`,
        recommendation: 'Review and optimize large auth data items'
      });
    }

    // Generate recommendations
    if (report.storageUsage.percentage > 50) {
      report.recommendations.push('Run periodic cleanup to maintain storage health');
    }

    if (legacyKeys.length > 0) {
      report.recommendations.push('Migrate legacy storage keys to unified system');
    }

    if (report.authStorageUsage.totalItems > 20) {
      report.recommendations.push('Review auth storage items for unnecessary data');
    }

    report.recommendations.push('Enable automatic cleanup in storage configuration');
    report.recommendations.push('Monitor storage usage regularly');

  } catch (error) {
    report.issues.push({
      type: 'error',
      message: `Failed to perform health check: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }

  return report;
}

/**
 * Clean up expired items from storage
 */
export async function cleanupExpiredItems(): Promise<CleanupReport> {
  const report: CleanupReport = {
    totalItemsCleaned: 0,
    totalSizeFreed: 0,
    legacyKeysMigrated: 0,
    errors: [],
    details: []
  };

  try {
    await storageManager.cleanup();
    
    // The storage manager handles the actual cleanup
    // We just report that cleanup was triggered
    report.details.push({
      key: 'storage_manager_cleanup',
      action: 'removed'
    });
    
  } catch (error) {
    const errorMsg = `Storage cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    report.errors.push(errorMsg);
    report.details.push({
      key: 'storage_manager_cleanup',
      action: 'error',
      error: errorMsg
    });
  }

  return report;
}

/**
 * Initialize storage system with cleanup and migration
 */
export async function initializeStorageSystem(): Promise<void> {
  try {
    // 1. Migrate legacy auth data
    await authStorage.migrateLegacyAuth();
    
    // 2. Run initial cleanup
    await cleanupLegacyStorage();
    
    // 3. Cleanup expired items
    await cleanupExpiredItems();
    
    console.log('Storage system initialized successfully');
  } catch (error) {
    console.error('Failed to initialize storage system:', error);
  }
}

/**
 * Schedule periodic cleanup
 */
export function schedulePeriodicCleanup(intervalMinutes: number = 60): () => void {
  const intervalId = setInterval(async () => {
    try {
      await cleanupExpiredItems();
    } catch (error) {
      console.error('Periodic cleanup failed:', error);
    }
  }, intervalMinutes * 60 * 1000);

  // Return cleanup function
  return () => clearInterval(intervalId);
}