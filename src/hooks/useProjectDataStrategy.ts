/**
 * Smart data fetching strategy for ProjectDetails\n * Implements priority-based loading optimized for mobile connections\n */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useProject, useCurrentPhase, useProjectPhases } from './queries';
import { queryKeys } from '@/lib/queryClient';
import type { ProjectDataPriority } from '@/types/enhanced-project';

/**
 * Hook that implements intelligent data fetching strategy
 * - Critical data loads immediately
 * - High priority data loads after critical data
 * - Medium/low priority data loads in background
 */
export function useProjectDataStrategy(projectId: string): ProjectDataPriority {
  const queryClient = useQueryClient();
  
  // Critical data - load immediately, blocks rendering
  const project = useProject(projectId);
  
  // High priority - load after project data is available
  const currentPhase = useCurrentPhase(projectId, {
    enabled: !!project.data,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
  
  // Medium priority - load after current phase
  const phases = useProjectPhases(projectId, {
    enabled: !!currentPhase.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Background prefetching for low priority data
  useEffect(() => {
    if (project.data && currentPhase.data) {
      // Prefetch team members in background
      queryClient.prefetchQuery({
        queryKey: queryKeys.projects.members(projectId),
        queryFn: () => import('./queries/useProject').then(m => 
          m.useProjectMembers.queryFn?.(projectId)
        ),
        staleTime: 10 * 60 * 1000, // 10 minutes
      });
      
      // Prefetch materials for current phase
      if (currentPhase.data?.id) {
        queryClient.prefetchQuery({
          queryKey: queryKeys.materials.byPhase(currentPhase.data.id),
          queryFn: () => import('./queries/useMaterial').then(m => 
            m.usePhaseMaterials?.queryFn?.(currentPhase.data.id)
          ),
          staleTime: 5 * 60 * 1000, // 5 minutes
        });
      }
      
      // Prefetch documents in background
      queryClient.prefetchQuery({
        queryKey: queryKeys.documents.byProject(projectId),
        queryFn: () => import('./queries/useProjectMedia').then(m => 
          m.useProjectMedia.queryFn?.(projectId)
        ),
        staleTime: 15 * 60 * 1000, // 15 minutes
      });
    }
  }, [project.data, currentPhase.data, queryClient, projectId]);
  
  return {
    critical: {
      project: project.data,
    },
    high: {
      currentPhase: currentPhase.data,
      activeTasks: [], // TODO: Implement active tasks query
    },
    medium: {
      phases: phases.data,
      teamMembers: [], // Will be loaded from cache when needed
    },
    low: {
      materials: [],
      documents: [],
      analytics: undefined,
    },
  };
}

/**
 * Hook for getting loading states across all data priorities
 */
export function useProjectLoadingStates(projectId: string) {
  const project = useProject(projectId);
  const currentPhase = useCurrentPhase(projectId, { enabled: !!project.data });
  const phases = useProjectPhases(projectId, { enabled: !!currentPhase.data });
  
  return {
    project: project.isLoading,
    phases: phases.isLoading,
    currentPhase: currentPhase.isLoading,
    tasks: false, // TODO: Implement when tasks query is ready
    materials: false,
    team: false,
    documents: false,
  };
}

/**
 * Hook for prefetching related project data
 * Useful for warming cache when user might navigate to related pages
 */
export function usePrefetchRelatedData(_projectId: string) {
  const queryClient = useQueryClient();
  
  return {
    prefetchPhaseDetails: (phaseId: string) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.phases.detail(phaseId),
        queryFn: () => import('./queries/usePhase').then(m => 
          m.usePhase.queryFn?.(phaseId)
        ),
      });
    },
    
    prefetchTasksForPhase: (phaseId: string) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.tasks.byPhase(phaseId),
        queryFn: () => import('./queries/useTask').then(m => 
          m.usePhaseTasks.queryFn?.(phaseId)
        ),
      });
    },
    
    prefetchMaterialsForPhase: (phaseId: string) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.materials.byPhase(phaseId),
        queryFn: () => import('./queries/useMaterial').then(m => 
          m.usePhaseMaterials?.queryFn?.(phaseId)
        ),
      });
    },
  };
}