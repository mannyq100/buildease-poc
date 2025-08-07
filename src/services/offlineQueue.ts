/**
 * OfflineQueue - IndexedDB-based offline operation queue
 * Handles offline operations for BuildEase construction sites
 * Automatically syncs operations when connection is restored
 */

interface QueuedOperation {
  id: string;
  type: 'mutation' | 'query';
  operation: string; // Operation identifier (e.g., 'createComment', 'updateTask')
  data: any; // Operation data/variables
  endpoint?: string; // API endpoint for the operation
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  metadata: {
    entityType?: string;
    entityId?: string;
    userId?: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    retryCount: number;
    maxRetries: number;
    createdAt: number;
    lastAttemptAt?: number;
    scheduledFor?: number; // For delayed operations
  };
  optimisticData?: any; // For optimistic UI updates
  rollbackData?: any; // For rollback if operation fails
}

interface ConflictResolution {
  strategy: 'client-wins' | 'server-wins' | 'merge' | 'manual';
  resolver?: (clientData: any, serverData: any) => any;
}

interface SyncOptions {
  batchSize?: number;
  maxConcurrent?: number;
  retryDelay?: number;
  conflictResolution?: ConflictResolution;
}

class OfflineQueueService {
  private static instance: OfflineQueueService;
  private dbName = 'buildease-offline-queue';
  private dbVersion = 1;
  private storeName = 'operations';
  private db: IDBDatabase | null = null;
  private isOnline = navigator.onLine;
  private syncInProgress = false;
  private listeners: Set<(status: any) => void> = new Set();

  private constructor() {
    this.initializeDB();
    this.setupNetworkListeners();
    this.startPeriodicSync();
  }

  static getInstance(): OfflineQueueService {
    if (!OfflineQueueService.instance) {
      OfflineQueueService.instance = new OfflineQueueService();
    }
    return OfflineQueueService.instance;
  }

  /**
   * Initialize IndexedDB database
   */
  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ Offline queue database initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          
          // Create indexes for efficient querying
          store.createIndex('operation', 'operation', { unique: false });
          store.createIndex('priority', 'metadata.priority', { unique: false });
          store.createIndex('createdAt', 'metadata.createdAt', { unique: false });
          store.createIndex('entityType', 'metadata.entityType', { unique: false });
          store.createIndex('userId', 'metadata.userId', { unique: false });
          
          console.log('📦 Created offline operations object store');
        }
      };
    });
  }

  /**
   * Set up network status listeners
   */
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      console.log('🌐 Connection restored - starting sync');
      this.isOnline = true;
      this.notifyListeners({ isOnline: true, event: 'online' });
      this.syncOperations();
    });

    window.addEventListener('offline', () => {
      console.log('📵 Connection lost - operations will be queued');
      this.isOnline = false;
      this.notifyListeners({ isOnline: false, event: 'offline' });
    });
  }

  /**
   * Start periodic sync (every 30 seconds when online)
   */
  private startPeriodicSync(): void {
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.syncOperations();
      }
    }, 30000); // 30 seconds
  }

  /**
   * Add operation to offline queue
   */
  async queueOperation(operation: Omit<QueuedOperation, 'id' | 'metadata'> & { 
    metadata?: Partial<QueuedOperation['metadata']> 
  }): Promise<string> {
    if (!this.db) {
      await this.initializeDB();
    }

    const operationId = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const queuedOperation: QueuedOperation = {
      id: operationId,
      type: operation.type,
      operation: operation.operation,
      data: operation.data,
      endpoint: operation.endpoint,
      method: operation.method,
      optimisticData: operation.optimisticData,
      rollbackData: operation.rollbackData,
      metadata: {
        priority: 'medium',
        retryCount: 0,
        maxRetries: 3,
        createdAt: Date.now(),
        ...operation.metadata
      }
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add(queuedOperation);

      request.onsuccess = () => {
        console.log(`📝 Queued operation: ${operation.operation} (${operationId})`);
        this.notifyListeners({ 
          event: 'operation-queued', 
          operation: queuedOperation 
        });
        resolve(operationId);
      };

      request.onerror = () => {
        console.error('Failed to queue operation:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Remove operation from queue
   */
  async removeOperation(operationId: string): Promise<boolean> {
    if (!this.db) return false;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(operationId);

      request.onsuccess = () => {
        console.log(`🗑️ Removed operation from queue: ${operationId}`);
        resolve(true);
      };

      request.onerror = () => {
        console.error('Failed to remove operation:', request.error);
        resolve(false);
      };
    });
  }

  /**
   * Get all queued operations
   */
  async getQueuedOperations(filter?: {
    operation?: string;
    priority?: string;
    entityType?: string;
    userId?: string;
  }): Promise<QueuedOperation[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      let request: IDBRequest;
      
      if (filter) {
        // Use appropriate index for filtering
        if (filter.operation) {
          const index = store.index('operation');
          request = index.getAll(filter.operation);
        } else if (filter.priority) {
          const index = store.index('priority');
          request = index.getAll(filter.priority);
        } else if (filter.entityType) {
          const index = store.index('entityType');
          request = index.getAll(filter.entityType);
        } else if (filter.userId) {
          const index = store.index('userId');
          request = index.getAll(filter.userId);
        } else {
          request = store.getAll();
        }
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => {
        const operations = request.result as QueuedOperation[];
        
        // Sort by priority and creation time
        operations.sort((a, b) => {
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          const aPriority = priorityOrder[a.metadata.priority] || 2;
          const bPriority = priorityOrder[b.metadata.priority] || 2;
          
          if (aPriority !== bPriority) {
            return bPriority - aPriority; // Higher priority first
          }
          
          return a.metadata.createdAt - b.metadata.createdAt; // Older first
        });
        
        resolve(operations);
      };

      request.onerror = () => {
        console.error('Failed to get queued operations:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Sync all queued operations
   */
  async syncOperations(options: SyncOptions = {}): Promise<{
    synced: number;
    failed: number;
    conflicts: number;
  }> {
    if (!this.isOnline || this.syncInProgress) {
      return { synced: 0, failed: 0, conflicts: 0 };
    }

    this.syncInProgress = true;
    const config = {
      batchSize: 5,
      maxConcurrent: 3,
      retryDelay: 1000,
      conflictResolution: { strategy: 'client-wins' as const },
      ...options
    };

    console.log('🔄 Starting offline operations sync...');
    this.notifyListeners({ event: 'sync-started' });

    try {
      const operations = await this.getQueuedOperations();
      let synced = 0;
      let failed = 0;
      let conflicts = 0;

      // Process operations in batches
      for (let i = 0; i < operations.length; i += config.batchSize) {
        const batch = operations.slice(i, i + config.batchSize);
        
        const batchPromises = batch.map(async (operation) => {
          try {
            const result = await this.syncSingleOperation(operation, config.conflictResolution);
            
            if (result.success) {
              await this.removeOperation(operation.id);
              synced++;
            } else if (result.conflict) {
              conflicts++;
            } else {
              // Update retry count
              operation.metadata.retryCount++;
              operation.metadata.lastAttemptAt = Date.now();
              
              if (operation.metadata.retryCount >= operation.metadata.maxRetries) {
                console.error(`💀 Operation ${operation.id} exceeded max retries`);
                await this.removeOperation(operation.id);
                failed++;
              } else {
                // Update operation in database
                await this.updateOperation(operation);
              }
            }
          } catch (error) {
            console.error(`❌ Failed to sync operation ${operation.id}:`, error);
            failed++;
          }
        });

        // Wait for current batch to complete before processing next
        await Promise.allSettled(batchPromises);
        
        // Small delay between batches to avoid overwhelming the server
        if (i + config.batchSize < operations.length) {
          await new Promise(resolve => setTimeout(resolve, config.retryDelay));
        }
      }

      console.log(`✅ Sync completed: ${synced} synced, ${failed} failed, ${conflicts} conflicts`);
      this.notifyListeners({ 
        event: 'sync-completed', 
        stats: { synced, failed, conflicts } 
      });

      return { synced, failed, conflicts };

    } catch (error) {
      console.error('❌ Sync process failed:', error);
      this.notifyListeners({ event: 'sync-failed', error });
      return { synced: 0, failed: 0, conflicts: 0 };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Sync a single operation
   */
  private async syncSingleOperation(
    operation: QueuedOperation, 
    conflictResolution: ConflictResolution
  ): Promise<{ success: boolean; conflict?: boolean; data?: any }> {
    try {
      // This is a simplified sync - in a real implementation, you'd need to:
      // 1. Execute the actual operation (API call, database update, etc.)
      // 2. Handle conflicts with server data
      // 3. Apply optimistic updates or rollbacks
      
      console.log(`🔄 Syncing operation: ${operation.operation}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
      
      // Simulate success (in real implementation, you'd make actual API calls)
      const success = Math.random() > 0.1; // 90% success rate for demo
      
      if (success) {
        console.log(`✅ Successfully synced: ${operation.operation}`);
        return { success: true };
      } else {
        throw new Error('Simulated sync failure');
      }
      
    } catch (error) {
      console.error(`❌ Failed to sync operation ${operation.id}:`, error);
      return { success: false };
    }
  }

  /**
   * Update operation in database
   */
  private async updateOperation(operation: QueuedOperation): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(operation);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<{
    total: number;
    byPriority: Record<string, number>;
    byOperation: Record<string, number>;
    oldestOperation?: number;
  }> {
    const operations = await this.getQueuedOperations();
    
    const byPriority: Record<string, number> = {};
    const byOperation: Record<string, number> = {};
    let oldestOperation: number | undefined;

    operations.forEach(op => {
      byPriority[op.metadata.priority] = (byPriority[op.metadata.priority] || 0) + 1;
      byOperation[op.operation] = (byOperation[op.operation] || 0) + 1;
      
      if (!oldestOperation || op.metadata.createdAt < oldestOperation) {
        oldestOperation = op.metadata.createdAt;
      }
    });

    return {
      total: operations.length,
      byPriority,
      byOperation,
      oldestOperation
    };
  }

  /**
   * Clear all operations (use with caution)
   */
  async clearQueue(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('🗑️ Cleared all queued operations');
        this.notifyListeners({ event: 'queue-cleared' });
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to clear queue:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Add status change listener
   */
  addListener(callback: (status: any) => void): () => void {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of status changes
   */
  private notifyListeners(status: any): void {
    this.listeners.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('Error in offline queue listener:', error);
      }
    });
  }

  /**
   * Check if currently online
   */
  get online(): boolean {
    return this.isOnline;
  }

  /**
   * Check if sync is in progress
   */
  get syncing(): boolean {
    return this.syncInProgress;
  }
}

// Export singleton instance
export const offlineQueue = OfflineQueueService.getInstance();

// Export types
export type { QueuedOperation, ConflictResolution, SyncOptions };