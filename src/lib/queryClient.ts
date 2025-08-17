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
initializeCacheManager(queryClient);

/**
 * Query key factory for consistent cache management
 * Updated to match existing BuildEase database schema
 */
export const queryKeys = {
  projects: {
    all: ['be_project'] as const,
    detail: (id: string) => ['be_project', id] as const,
    phases: (id: string) => ['be_project', id, 'phases'] as const,
    members: (id: string) => ['be_project', id, 'members'] as const,
    // New keys for Projects page
    list: (filters: Record<string, unknown>) => ['be_project', 'list', filters] as const,
    metrics: () => ['be_project', 'metrics'] as const,
    byStatus: () => ['be_project', 'by-status'] as const,
    search: (term: string) => ['be_project', 'search', term] as const,
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
  documents: {
    all: ['be_document'] as const,
    byId: (id: string) => ['be_document', id] as const,
    byProject: (projectId: string) => ['be_document', 'project', projectId] as const,
    byPhase: (phaseId: string) => ['be_document', 'phase', phaseId] as const,
  },
};
