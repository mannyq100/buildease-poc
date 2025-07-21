/**
 * Optimistic updates for Projects using React 19 concurrent features
 * Provides instant UI feedback for construction worker actions
 */

import { useOptimistic, useTransition } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  useUpdateProjectStatusCRUD,
  useDeleteProjectCRUD,
  useDuplicateProject
} from './index';
import type { UIProject } from '@/types/enhanced-projects';
import type { ProjectStatus } from '@/types/project';

export interface OptimisticAction {
  type: 'UPDATE_STATUS' | 'DELETE' | 'DUPLICATE' | 'CREATE';
  projectId?: string;
  payload?: any;
}

/**
 * Hook for optimistic project status updates
 */
export function useOptimisticProjectStatus(projects: UIProject[]) {
  const [isPending, startTransition] = useTransition();
  const updateStatusMutation = useUpdateProjectStatusCRUD();
  
  const [optimisticProjects, addOptimisticUpdate] = useOptimistic(
    projects,
    (state: UIProject[], action: { projectId: string; status: ProjectStatus }) => {
      return state.map(project => 
        project.id === action.projectId 
          ? { ...project, status: action.status }
          : project
      );
    }
  );
  
  const updateProjectStatus = (projectId: string, status: ProjectStatus) => {
    startTransition(() => {
      addOptimisticUpdate({ projectId, status });
    });
    
    // Perform actual mutation
    updateStatusMutation.mutate(
      { projectId, status },
      {
        onError: () => {
          // Revert optimistic update on error
          // The query will be invalidated and refetch real data
        }
      }
    );
  };
  
  return {
    projects: optimisticProjects,
    updateProjectStatus,
    isPending: isPending || updateStatusMutation.isPending,
    error: updateStatusMutation.error
  };
}

/**
 * Hook for optimistic project deletion
 */
export function useOptimisticProjectDeletion(projects: UIProject[]) {
  const [isPending, startTransition] = useTransition();
  const deleteProjectMutation = useDeleteProjectCRUD();
  
  const [optimisticProjects, addOptimisticDelete] = useOptimistic(
    projects,
    (state: UIProject[], action: { projectId: string }) => {
      return state.filter(project => project.id !== action.projectId);
    }
  );
  
  const deleteProject = (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    
    startTransition(() => {
      addOptimisticDelete({ projectId });
    });
    
    // Perform actual deletion
    deleteProjectMutation.mutate(projectId, {
      onError: () => {
        // Revert optimistic update on error
        // The query will be invalidated and refetch real data
      }
    });
  };
  
  return {
    projects: optimisticProjects,
    deleteProject,
    isPending: isPending || deleteProjectMutation.isPending,
    error: deleteProjectMutation.error
  };
}

/**
 * Hook for optimistic project duplication
 */
export function useOptimisticProjectDuplication(projects: UIProject[]) {
  const [isPending, startTransition] = useTransition();
  const duplicateProjectMutation = useDuplicateProject();
  
  const [optimisticProjects, addOptimisticDuplicate] = useOptimistic(
    projects,
    (state: UIProject[], action: { originalProject: UIProject; newName: string }) => {
      const duplicatedProject: UIProject = {
        ...action.originalProject,
        id: `temp-${Date.now()}`, // Temporary ID
        name: action.newName,
        status: 'planning',
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return [duplicatedProject, ...state];
    }
  );
  
  const duplicateProject = (projectId: string, newName: string) => {
    const originalProject = projects.find(p => p.id === projectId);
    if (!originalProject) return;
    
    startTransition(() => {
      addOptimisticDuplicate({ originalProject, newName });
    });
    
    // Perform actual duplication
    duplicateProjectMutation.mutate(
      { projectId, newName },
      {
        onError: () => {
          // Revert optimistic update on error
          // The query will be invalidated and refetch real data
        }
      }
    );
  };
  
  return {
    projects: optimisticProjects,
    duplicateProject,
    isPending: isPending || duplicateProjectMutation.isPending,
    error: duplicateProjectMutation.error
  };
}

/**
 * Combined hook for all optimistic project operations
 */
export function useOptimisticProjects(projects: UIProject[]) {
  const queryClient = useQueryClient();
  
  // Status updates
  const {
    projects: statusOptimizedProjects,
    updateProjectStatus,
    isPending: statusPending,
    error: statusError
  } = useOptimisticProjectStatus(projects);
  
  // Deletions
  const {
    projects: deleteOptimizedProjects,
    deleteProject,
    isPending: deletePending,
    error: deleteError
  } = useOptimisticProjectDeletion(statusOptimizedProjects);
  
  // Duplications
  const {
    projects: finalOptimizedProjects,
    duplicateProject,
    isPending: duplicatePending,
    error: duplicateError
  } = useOptimisticProjectDuplication(deleteOptimizedProjects);
  
  // Global error handling
  const hasError = statusError || deleteError || duplicateError;
  const isPending = statusPending || deletePending || duplicatePending;
  
  // Refresh data on error
  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    queryClient.refetchQueries({ queryKey: ['projects'] });
  };
  
  return {
    projects: finalOptimizedProjects,
    actions: {
      updateProjectStatus,
      deleteProject,
      duplicateProject,
    },
    state: {
      isPending,
      hasError,
      errors: {
        status: statusError,
        delete: deleteError,
        duplicate: duplicateError,
      }
    },
    retry: handleRetry
  };
}