/**
 * React Query client configuration optimized for BuildEase mobile-first experience
 * Configured for construction site usage with unreliable connections
 */
import { QueryClient, DefaultOptions } from '@tanstack/react-query';

// Enhanced retry logic for construction site conditions
const retryFunction = (failureCount: number, error: any) => {
  // Don't retry on authentication errors
  if (error?.status === 401 || error?.status === 403) {
    return false;
  }
  
  // Don't retry on validation errors (4xx except auth)
  if (error?.status >= 400 && error?.status < 500 && error?.status !== 401 && error?.status !== 403) {
    return false;
  }
  
  // Retry on network errors and 5xx errors
  return failureCount < 3;
};

// Exponential backoff with jitter for better performance under poor network conditions
const retryDelay = (attemptIndex: number) => {
  const baseDelay = Math.min(1000 * (2 ** attemptIndex), 30000); // Cap at 30s
  const jitter = Math.random() * 1000; // Add up to 1s jitter
  return baseDelay + jitter;
};

const defaultOptions: DefaultOptions = {
  queries: {
    // Mobile-optimized defaults for construction sites
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer (formerly cacheTime)
    retry: retryFunction, // Smart retry logic
    retryDelay, // Exponential backoff with jitter
    refetchOnWindowFocus: false, // Don't refetch when switching apps on mobile
    refetchOnReconnect: true, // Do refetch when connection restored
    refetchOnMount: true, // Always refetch on component mount
    networkMode: 'online', // Only run queries when online
    // Enhanced error handling
    throwOnError: false, // Let components handle errors gracefully
  },
  mutations: {
    retry: retryFunction, // Same smart retry for mutations
    retryDelay, // Same backoff strategy
    networkMode: 'online', // Only run mutations when online
    // Enhanced error handling for mutations
    throwOnError: false, // Let components handle errors gracefully
  },
};

export const queryClient = new QueryClient({
  defaultOptions,
});

// Initialize cache optimization
import { initializeCacheManager } from './cacheOptimization';
import { initializeSmartCacheManager } from '@/services/smartCacheManager';
initializeCacheManager(queryClient);
initializeSmartCacheManager(queryClient);

/**
 * Hierarchical Query key factory for smart cache management
 * Updated to match existing BuildEase database schema with cache hierarchy support
 */
export const queryKeys = {
  // L1 Cache: Frequently accessed, short TTL
  projects: {
    all: ['be_project'] as const,
    detail: (id: string) => ['be_project', id] as const,
    phases: (id: string) => ['be_project', id, 'phases'] as const,
    members: (id: string) => ['be_project', id, 'members'] as const,
    // New keys for Projects page
    list: (filters: Record<string, unknown>) => ['be_project', 'list', filters] as const,
    search: (term: string) => ['be_project', 'search', term] as const,
  },
  // L2 Cache: Aggregated data, medium TTL
  aggregations: {
    metrics: () => ['aggregations', 'project-metrics'] as const,
    analytics: () => ['aggregations', 'project-analytics'] as const,
    byStatus: () => ['aggregations', 'projects-by-status'] as const,
    projectStats: (projectId: string) => ['aggregations', 'project-stats', projectId] as const,
    budgetSummary: (projectId: string) => ['aggregations', 'budget-summary', projectId] as const,
    timelineSummary: (projectId: string) => ['aggregations', 'timeline-summary', projectId] as const,
    teamSummary: (projectId: string) => ['aggregations', 'team-summary', projectId] as const,
  },
  phases: {
    all: ['be_phase'] as const,
    detail: (id: string) => ['be_phase', id] as const,
    tasks: (id: string) => ['be_phase', id, 'tasks'] as const,
    byProject: (projectId: string) => ['be_phase', 'project', projectId] as const,
  },
  tasks: {
    all: ['be_task'] as const,
    detail: (id: string) => ['be_task', id] as const,
    byProject: (projectId: string) => ['be_task', 'project', projectId] as const,
    byPhase: (phaseId: string) => ['be_task', 'phase', phaseId] as const,
    byUser: (userId: string) => ['be_task', 'user', userId] as const,
  },
  materials: {
    all: ['be_material'] as const,
    detail: (id: string) => ['be_material', id] as const,
    byProject: (projectId: string) => ['be_material', 'project', projectId] as const,
    byPhase: (phaseId: string) => ['be_material', 'phase', phaseId] as const,
  },
  // L1/L3 Cache: Media items and URLs
  documents: {
    all: ['be_media_items'] as const,
    byId: (id: string) => ['be_media_items', id] as const,
    byProject: (projectId: string) => ['be_media_items', 'project', projectId] as const,
    byPhase: (phaseId: string) => ['be_media_items', 'phase', phaseId] as const,
    byCategory: (projectId: string, category: string) => ['be_media_items', 'project', projectId, 'category', category] as const,
  },
  // L3 Cache: URLs and thumbnails, long TTL
  urls: {
    mediaUrl: (mediaId: string) => ['media-urls', mediaId] as const,
    thumbnail: (mediaId: string) => ['thumbnails', mediaId] as const,
    downloadUrl: (mediaId: string) => ['download-urls', mediaId] as const,
  },
};

/**
 * Enhanced query utilities for smart caching
 */
export const queryUtils = {
  /**
   * Generate cache key with hierarchy information
   */
  generateHierarchicalKey: (base: readonly string[], hierarchy: 'l1' | 'l2' | 'l3' = 'l1') => {
    return [`cache-${hierarchy}`, ...base] as const;
  },
  
  /**
   * Check if query key belongs to specific cache level
   */
  getCacheLevel: (queryKey: readonly unknown[]): 'l1' | 'l2' | 'l3' => {
    const keyStr = queryKey.join('-');
    if (keyStr.includes('aggregations') || keyStr.includes('summary') || keyStr.includes('stats')) {
      return 'l2';
    }
    if (keyStr.includes('url') || keyStr.includes('thumbnail')) {
      return 'l3';
    }
    return 'l1';
  },
  
  /**
   * Get appropriate TTL based on cache level and network quality
   */
  getTTL: (level: 'l1' | 'l2' | 'l3', quality: 'excellent' | 'good' | 'poor' | 'offline' = 'good') => {
    const baseTTLs = {
      l1: { excellent: 2 * 60 * 1000, good: 5 * 60 * 1000, poor: 15 * 60 * 1000, offline: 60 * 60 * 1000 },
      l2: { excellent: 10 * 60 * 1000, good: 30 * 60 * 1000, poor: 60 * 60 * 1000, offline: 4 * 60 * 60 * 1000 },
      l3: { excellent: 30 * 60 * 1000, good: 60 * 60 * 1000, poor: 4 * 60 * 60 * 1000, offline: 24 * 60 * 60 * 1000 }
    };
    return baseTTLs[level][quality];
  },
  
  /**
   * Batch invalidate queries by pattern with cache level awareness
   */
  invalidateByPattern: async (pattern: string, level?: 'l1' | 'l2' | 'l3') => {
    const regex = new RegExp(pattern);
    await queryClient.invalidateQueries({
      predicate: (query) => {
        const matches = regex.test(query.queryKey.join('-'));
        if (!level) return matches;
        return matches && queryUtils.getCacheLevel(query.queryKey) === level;
      }
    });
  },
  
  /**
   * Prefetch with smart cache hierarchy
   */
  smartPrefetch: async (queryKey: readonly unknown[], queryFn: () => Promise<unknown>, priority: 'high' | 'low' = 'low') => {
    const level = queryUtils.getCacheLevel(queryKey);
    const staleTime = queryUtils.getTTL(level);
    
    return queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime: priority === 'high' ? staleTime / 2 : staleTime,
    });
  }
};

// Mobile optimization: Clean up cache periodically
if (typeof window !== 'undefined') {
  // Clean up cache every 10 minutes on mobile
  setInterval(() => {
    import('@/services/smartCacheManager').then(({ getSmartCacheManager }) => {
      try {
        const smartCache = getSmartCacheManager();
        smartCache.optimizeForMobile().catch(err => 
          console.warn('Cache optimization failed:', err)
        );
      } catch (error) {
        console.warn('Smart cache not available:', error);
      }
    });
  }, 10 * 60 * 1000); // 10 minutes
  
  // Background sync on page visibility change
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      import('@/services/smartCacheManager').then(({ getSmartCacheManager }) => {
        try {
          const smartCache = getSmartCacheManager();
          // Warm cache when app becomes visible (user returns to app)
          const activeProjects = queryClient.getQueryCache().getAll()
            .filter(query => query.queryKey.includes('be_project'))
            .map(query => query.queryKey[1])
            .filter((id, index, arr) => typeof id === 'string' && arr.indexOf(id) === index) as string[];
          
          if (activeProjects.length > 0) {
            smartCache.backgroundSync(activeProjects.slice(0, 3)).catch(err => // Limit to 3 most recent
              console.warn('Background sync failed:', err)
            );
          }
        } catch (error) {
          console.warn('Smart cache not available for background sync:', error);
        }
      });
    }
  });
};
