/**
 * Infinite scroll hook for Projects with React 19 performance optimizations
 * Optimized for construction sites with potentially slow connections
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useRef, useEffect } from 'react';
import { useIntersection } from '@/hooks/useIntersection';
import type { ProjectsFilters, UIProject } from '@/types/enhanced-projects';

interface ProjectsPage {
  projects: UIProject[];
  nextCursor: string | null;
  hasMore: boolean;
  totalCount: number;
}

interface UseInfiniteProjectsOptions {
  filters: ProjectsFilters;
  pageSize?: number;
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

/**
 * Mock API function for infinite projects
 * In production, this would call your Supabase API with pagination
 */
async function fetchProjectsPage({
  pageParam = null,
  filters,
  pageSize = 12
}: {
  pageParam?: string | null;
  filters: ProjectsFilters;
  pageSize?: number;
}): Promise<ProjectsPage> {
  // Simulate API delay based on connection quality
  const delay = navigator.onLine ? 200 : 500;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Mock pagination logic
  const startIndex = pageParam ? parseInt(pageParam, 10) : 0;
  const endIndex = startIndex + pageSize;
  
  // Mock data generation (in production, this comes from Supabase)
  const allProjects = Array.from({ length: 150 }, (_, index) => ({
    id: `project-${index + 1}`,
    name: `Construction Project ${index + 1}`,
    client: `Client ${Math.floor(index / 10) + 1}`,
    location: `Site ${index + 1}`,
    status: ['planning', 'active', 'completed', 'on-hold'][index % 4] as UIProject['status'],
    progress: Math.floor(Math.random() * 100),
    budget: Math.floor(Math.random() * 1000000) + 50000,
    startDate: new Date(2024, 0, 1 + index).toISOString(),
    endDate: new Date(2024, 11, 31 - index).toISOString(),
    createdAt: new Date(2024, 0, 1 + index).toISOString(),
    updatedAt: new Date().toISOString(),
    description: `Description for project ${index + 1}`,
    type: ['Residential', 'Commercial', 'Industrial'][index % 3]
  }));
  
  // Apply filters
  let filteredProjects = allProjects;
  
  if (filters.status && filters.status !== 'all') {
    filteredProjects = filteredProjects.filter(p => p.status === filters.status);
  }
  
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredProjects = filteredProjects.filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      p.client?.toLowerCase().includes(searchLower) ||
      p.location?.toLowerCase().includes(searchLower)
    );
  }
  
  if (filters.type) {
    filteredProjects = filteredProjects.filter(p => p.type === filters.type);
  }
  
  if (filters.client) {
    filteredProjects = filteredProjects.filter(p => 
      p.client?.toLowerCase().includes(filters.client!.toLowerCase())
    );
  }
  
  // Apply sorting
  filteredProjects.sort((a, b) => {
    const direction = filters.sortOrder === 'desc' ? -1 : 1;
    
    switch (filters.sortBy) {
      case 'name':
        return direction * a.name.localeCompare(b.name);
      case 'updated_at':
        return direction * (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
      case 'budget':
        return direction * (a.budget - b.budget);
      case 'progress':
        return direction * (a.progress - b.progress);
      default:
        return 0;
    }
  });
  
  const pageProjects = filteredProjects.slice(startIndex, endIndex);
  const hasMore = endIndex < filteredProjects.length;
  const nextCursor = hasMore ? endIndex.toString() : null;
  
  return {
    projects: pageProjects,
    nextCursor,
    hasMore,
    totalCount: filteredProjects.length
  };
}

/**
 * Hook for infinite scrolling projects with performance optimizations
 */
export function useInfiniteProjects({
  filters,
  pageSize = 12,
  enabled = true,
  staleTime = 5 * 60 * 1000, // 5 minutes
  gcTime = 10 * 60 * 1000 // 10 minutes
}: UseInfiniteProjectsOptions) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useInfiniteQuery({
    queryKey: ['projects', 'infinite', filters, pageSize],
    queryFn: ({ pageParam }) => fetchProjectsPage({ pageParam, filters, pageSize }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
    enabled,
    staleTime,
    gcTime,
    // Performance optimizations
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: (failureCount, error) => {
      // Reduce retries on poor connections
      const maxRetries = navigator.onLine ? 3 : 1;
      return failureCount < maxRetries;
    }
  });
  
  // Memoize flattened projects for performance
  const projects = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.projects);
  }, [data?.pages]);
  
  // Total count from first page
  const totalCount = data?.pages[0]?.totalCount ?? 0;
  
  // Intersection observer for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersection(loadMoreRef, {
    threshold: 0.1,
    rootMargin: '100px'
  });
  
  // Auto-load next page when scrolling near bottom
  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage && !isLoading) {
      fetchNextPage();
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, isLoading, fetchNextPage]);
  
  // Manual load more function
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
  
  // Performance metrics
  const loadedCount = projects.length;
  const hasMore = hasNextPage;
  const loadingProgress = totalCount > 0 ? (loadedCount / totalCount) * 100 : 0;
  
  return {
    // Data
    projects,
    totalCount,
    loadedCount,
    hasMore,
    loadingProgress,
    
    // Loading states
    isLoading,
    isFetchingNextPage,
    isFetching,
    
    // Error handling
    isError,
    error,
    
    // Actions
    loadMore,
    refetch,
    
    // Refs for intersection observer
    loadMoreRef,
    
    // Performance metrics
    metrics: {
      pagesLoaded: data?.pages.length ?? 0,
      averagePageSize: loadedCount / Math.max(data?.pages.length ?? 1, 1),
      cacheStatus: {
        staleTime,
        gcTime,
        isStale: data ? Date.now() - (data as any).dataUpdatedAt > staleTime : false
      }
    }
  };
}

/**
 * Hook for intersection observer utility
 */
function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
) {
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(callback, options);
    observer.observe(element);
    
    return () => observer.disconnect();
  }, [elementRef, callback, options]);
}