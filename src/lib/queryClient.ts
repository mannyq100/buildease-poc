/**
 * React Query client configuration optimized for BuildEase mobile-first experience
 * Configured for construction site usage with unreliable connections
 */
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Mobile-optimized defaults for construction sites
      staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer
      gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer (formerly cacheTime)
      retry: 2, // Retry failed requests twice
      refetchOnWindowFocus: false, // Don't refetch when switching apps on mobile
      refetchOnReconnect: true, // Do refetch when connection restored
      refetchOnMount: true, // Always refetch on component mount
    },
    mutations: {
      retry: 1, // Retry mutations once on failure
    },
  },
});

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
  },
  materials: {
    all: ['be_material'] as const,
    detail: (id: string) => ['be_material', id] as const,
    byProject: (projectId: string) => ['be_material', 'project', projectId] as const,
  },
  documents: {
    all: ['be_document'] as const,
    detail: (id: string) => ['be_document', id] as const,
    byProject: (projectId: string) => ['be_document', 'project', projectId] as const,
  },
};
