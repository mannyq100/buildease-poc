/**
 * Intelligent Cache Management
 * Sprint 2.4: Cache Strategy Optimization implementation
 * Provides granular cache invalidation and strategic prefetching
 */

import { QueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryClient';

export interface CacheInvalidationOptions {
  projectId?: string;
  phaseId?: string;
  taskId?: string;
  userId?: string;
  invalidateType: 'project' | 'phase' | 'task' | 'budget' | 'team' | 'all';
  cascade?: boolean; // Whether to invalidate related data
}

/**
 * Intelligent cache invalidation that only invalidates affected data
 * Prevents over-invalidation that causes unnecessary refetches
 */
export class CacheManager {
  constructor(private queryClient: QueryClient) {}

  /**
   * Invalidate specific cache entries based on operation type
   */
  async invalidateCache(options: CacheInvalidationOptions): Promise<void> {
    const { projectId, phaseId, taskId, userId, invalidateType, cascade = true } = options;

    switch (invalidateType) {
      case 'project':
        await this.invalidateProjectCache(projectId, cascade);
        break;
      case 'phase':
        await this.invalidatePhaseCache(projectId, phaseId, cascade);
        break;
      case 'task':
        await this.invalidateTaskCache(projectId, phaseId, taskId, cascade);
        break;
      case 'budget':
        await this.invalidateBudgetCache(projectId, cascade);
        break;
      case 'team':
        await this.invalidateTeamCache(projectId, cascade);
        break;
      case 'all':
        await this.invalidateAllCache(projectId);
        break;
    }
  }

  /**
   * Invalidate project-related cache entries
   */
  private async invalidateProjectCache(projectId?: string, cascade: boolean = true): Promise<void> {
    if (!projectId) return;

    const promises: Promise<void>[] = [];

    // Always invalidate the consolidated project query (most important)
    promises.push(
      this.queryClient.invalidateQueries({
        queryKey: ['project-consolidated', projectId]
      })
    );

    // Invalidate specific project queries
    promises.push(
      this.queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(projectId)
      })
    );

    if (cascade) {
      // Invalidate related data
      promises.push(
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.projects.phases(projectId)
        })
      );
      promises.push(
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.tasks.byProject(projectId)
        })
      );
    }

    await Promise.all(promises);
  }

  /**
   * Invalidate phase-specific cache entries
   */
  private async invalidatePhaseCache(projectId?: string, phaseId?: string, cascade: boolean = true): Promise<void> {
    if (!projectId || !phaseId) return;

    const promises: Promise<void>[] = [];

    // Invalidate phase-specific queries
    promises.push(
      this.queryClient.invalidateQueries({
        queryKey: queryKeys.phases.detail(phaseId)
      })
    );

    promises.push(
      this.queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.byPhase(phaseId)
      })
    );

    if (cascade) {
      // Invalidate parent project data
      promises.push(
        this.queryClient.invalidateQueries({
          queryKey: ['project-consolidated', projectId]
        })
      );
      
      promises.push(
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.projects.phases(projectId)
        })
      );
    }

    await Promise.all(promises);
  }

  /**
   * Invalidate task-specific cache entries
   */
  private async invalidateTaskCache(
    projectId?: string, 
    phaseId?: string, 
    taskId?: string, 
    cascade: boolean = true
  ): Promise<void> {
    if (!taskId) return;

    const promises: Promise<void>[] = [];

    // Invalidate task-specific query
    promises.push(
      this.queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.detail(taskId)
      })
    );

    if (cascade && phaseId) {
      // Invalidate phase tasks
      promises.push(
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.tasks.byPhase(phaseId)
        })
      );

      // Invalidate project tasks
      if (projectId) {
        promises.push(
          this.queryClient.invalidateQueries({
            queryKey: queryKeys.tasks.byProject(projectId)
          })
        );
        
        // Invalidate consolidated project data (includes task metrics)
        promises.push(
          this.queryClient.invalidateQueries({
            queryKey: ['project-consolidated', projectId]
          })
        );
      }
    }

    await Promise.all(promises);
  }

  /**
   * Invalidate budget-specific cache entries
   */
  private async invalidateBudgetCache(projectId?: string, cascade: boolean = true): Promise<void> {
    if (!projectId) return;

    const promises: Promise<void>[] = [];

    // Invalidate budget-specific queries
    promises.push(
      this.queryClient.invalidateQueries({
        queryKey: ['budget-summary', projectId]
      })
    );

    if (cascade) {
      // Invalidate consolidated project data (includes budget calculations)
      promises.push(
        this.queryClient.invalidateQueries({
          queryKey: ['project-consolidated', projectId]
        })
      );
    }

    await Promise.all(promises);
  }

  /**
   * Invalidate team-specific cache entries
   */
  private async invalidateTeamCache(projectId?: string, cascade: boolean = true): Promise<void> {
    if (!projectId) return;

    const promises: Promise<void>[] = [];

    // Invalidate team-specific queries
    promises.push(
      this.queryClient.invalidateQueries({
        queryKey: ['team-summary', projectId]
      })
    );

    promises.push(
      this.queryClient.invalidateQueries({
        queryKey: queryKeys.projects.members(projectId)
      })
    );

    if (cascade) {
      // Invalidate consolidated project data (includes team information)
      promises.push(
        this.queryClient.invalidateQueries({
          queryKey: ['project-consolidated', projectId]
        })
      );
    }

    await Promise.all(promises);
  }

  /**
   * Nuclear option: invalidate all cache for a project
   */
  private async invalidateAllCache(projectId?: string): Promise<void> {
    if (!projectId) {
      await this.queryClient.invalidateQueries();
      return;
    }

    // Invalidate all queries related to the project
    await this.queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        return queryKey.includes(projectId) || 
               queryKey.includes('project-consolidated') ||
               queryKey.some(key => 
                 typeof key === 'string' && key.includes(projectId)
               );
      }
    });
  }

  /**
   * Strategic prefetching for improved performance
   */
  async prefetchRelatedData(projectId: string, priority: 'critical' | 'high' | 'low' = 'high'): Promise<void> {
    if (!projectId) return;

    const promises: Promise<unknown>[] = [];

    // Always prefetch consolidated project data (critical path)
    promises.push(
      this.queryClient.prefetchQuery({
        queryKey: ['project-consolidated', projectId],
        staleTime: 5 * 60 * 1000, // 5 minutes
      })
    );

    if (priority === 'critical' || priority === 'high') {
      // Prefetch project summary metrics
      promises.push(
        this.queryClient.prefetchQuery({
          queryKey: ['budget-summary', projectId],
          staleTime: 2 * 60 * 1000,
        })
      );

      promises.push(
        this.queryClient.prefetchQuery({
          queryKey: ['timeline-summary', projectId],
          staleTime: 2 * 60 * 1000,
        })
      );
    }

    if (priority === 'critical') {
      // Prefetch team summary for immediate availability
      promises.push(
        this.queryClient.prefetchQuery({
          queryKey: ['team-summary', projectId],
          staleTime: 5 * 60 * 1000,
        })
      );
    }

    await Promise.allSettled(promises);
  }

  /**
   * Warm cache with frequently accessed data
   */
  async warmCache(projectIds: string[]): Promise<void> {
    const promises = projectIds.map(projectId => 
      this.prefetchRelatedData(projectId, 'low')
    );

    await Promise.allSettled(promises);
  }

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats() {
    const cache = this.queryClient.getQueryCache();
    const queries = cache.getAll();
    
    const stats = {
      totalQueries: queries.length,
      staleQueries: queries.filter(q => q.isStale()).length,
      fetchingQueries: queries.filter(q => q.isFetching()).length,
      errorQueries: queries.filter(q => q.state.status === 'error').length,
      cacheSize: cache.getAll().reduce((total, query) => {
        const dataSize = JSON.stringify(query.state.data || {}).length;
        return total + dataSize;
      }, 0),
      queryBreakdown: queries.reduce((acc, query) => {
        const firstKey = query.queryKey[0] as string;
        acc[firstKey] = (acc[firstKey] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    return stats;
  }

  /**
   * Clear stale cache entries to free memory
   */
  async clearStaleCache(): Promise<void> {
    const cache = this.queryClient.getQueryCache();
    const staleQueries = cache.getAll().filter(q => q.isStale());
    
    await Promise.all(
      staleQueries.map(query => 
        this.queryClient.removeQueries({ queryKey: query.queryKey })
      )
    );
  }

  /**
   * Optimize cache for mobile devices with limited memory
   */
  async optimizeForMobile(): Promise<void> {
    // Reduce cache time for non-critical queries
    const cache = this.queryClient.getQueryCache();
    const queries = cache.getAll();

    // Remove large data sets that aren't frequently accessed
    const lowPriorityQueries = queries.filter(query => {
      const firstKey = query.queryKey[0] as string;
      return ['documents', 'materials', 'comments'].includes(firstKey);
    });

    await Promise.all(
      lowPriorityQueries.map(query => {
        if (query.state.dataUpdatedAt < Date.now() - 5 * 60 * 1000) { // 5 minutes old
          return this.queryClient.removeQueries({ queryKey: query.queryKey });
        }
        return Promise.resolve();
      })
    );
  }
}

/**
 * Factory function to create cache manager instance
 */
export function createCacheManager(queryClient: QueryClient): CacheManager {
  return new CacheManager(queryClient);
}

/**
 * Global cache manager instance
 */
let globalCacheManager: CacheManager | null = null;

export function initializeCacheManager(queryClient: QueryClient): void {
  globalCacheManager = createCacheManager(queryClient);
}

export function getCacheManager(): CacheManager {
  if (!globalCacheManager) {
    throw new Error('Cache manager not initialized. Call initializeCacheManager first.');
  }
  return globalCacheManager;
}