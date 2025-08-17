/**
 * Optimized Task Hooks
 * Solves N+1 query problem by using consolidated project data
 * Sprint 2.2: N+1 Query Problem Fix implementation
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryClient';
import { useConsolidatedProjectData } from './useConsolidatedProjectData';
import { normalizeTaskData } from '@/utils/core/dataNormalization';

/**
 * Optimized hook to get all project tasks in a single query
 * Replaces multiple usePhaseTasks() calls with one efficient query
 */
export function useAllProjectTasks(projectId: string) {
  return useQuery({
    queryKey: queryKeys.tasks.byProject(projectId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('be_task')
        .select(`
          id,
          project_id,
          phase_id,
          title,
          description,
          status,
          priority,
          assigned_to,
          start_date,
          due_date,
          completed_at,
          completed_by,
          completion_notes,
          dependencies,
          tags,
          comments,
          created_at,
          updated_at,
          assignee:be_user!assigned_to (
            id,
            first_name,
            last_name,
            email
          ),
          completedBy:be_user!completed_by (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching project tasks:', error);
        throw error;
      }
      
      // Normalize all task data
      return data?.map(normalizeTaskData) || [];
    },
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Optimized hook to get tasks for a specific phase
 * Uses consolidated project data to avoid N+1 queries
 * Falls back to individual query if consolidated data not available
 */
export function useOptimizedPhaseTasks(phaseId: string, projectId?: string) {
  // Try to use consolidated data first
  const consolidatedQuery = useConsolidatedProjectData(projectId || '');
  
  // Fallback to individual query if no project ID or consolidated data fails
  const fallbackQuery = useQuery({
    queryKey: queryKeys.tasks.byPhase(phaseId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('be_task')
        .select(`
          id,
          project_id,
          phase_id,
          title,
          description,
          status,
          priority,
          assigned_to,
          start_date,
          due_date,
          completed_at,
          completed_by,
          completion_notes,
          dependencies,
          tags,
          comments,
          created_at,
          updated_at,
          assignee:be_user!assigned_to (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('phase_id', phaseId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching phase tasks:', error);
        throw error;
      }
      
      return data?.map(normalizeTaskData) || [];
    },
    enabled: !!phaseId && (!projectId || consolidatedQuery.isError),
    staleTime: 1 * 60 * 1000,
  });

  // Extract tasks from consolidated data
  const consolidatedTasks = useMemo(() => {
    if (!consolidatedQuery.data || !phaseId) return [];
    
    const phase = consolidatedQuery.data.phases.find(p => p.id === phaseId);
    return phase?.tasks || [];
  }, [consolidatedQuery.data, phaseId]);

  // Return consolidated data if available, otherwise fallback
  if (projectId && consolidatedQuery.data && !consolidatedQuery.isError) {
    return {
      data: consolidatedTasks,
      isLoading: consolidatedQuery.isLoading,
      error: consolidatedQuery.error,
      refetch: consolidatedQuery.refetch
    };
  }

  return fallbackQuery;
}

/**
 * Hook to get grouped tasks by phase for a project
 * Pre-computed task metrics to avoid repeated calculations
 */
export function useProjectTasksByPhase(projectId: string) {
  const consolidatedQuery = useConsolidatedProjectData(projectId);

  const groupedTasks = useMemo(() => {
    if (!consolidatedQuery.data) return {};

    const tasksByPhase: Record<string, Array<any & { metrics: any }>> = {};
    
    consolidatedQuery.data.phases.forEach(phase => {
      const phaseTasks = phase.tasks;
      
      // Pre-compute task metrics for performance
      const totalTasks = phaseTasks.length;
      const completedTasks = phaseTasks.filter(t => t.status === 'completed').length;
      const inProgressTasks = phaseTasks.filter(t => t.status === 'in-progress').length;
      const pendingTasks = phaseTasks.filter(t => t.status === 'pending').length;
      const overdueTasks = phaseTasks.filter(t => {
        if (!t.due_date || t.status === 'completed') return false;
        return new Date(t.due_date) < new Date();
      }).length;
      
      const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      tasksByPhase[phase.id] = phaseTasks.map(task => ({
        ...task,
        metrics: {
          totalTasks,
          completedTasks,
          inProgressTasks,
          pendingTasks,
          overdueTasks,
          progressPercentage
        }
      }));
    });

    return tasksByPhase;
  }, [consolidatedQuery.data]);

  return {
    data: groupedTasks,
    isLoading: consolidatedQuery.isLoading,
    error: consolidatedQuery.error,
    refetch: consolidatedQuery.refetch
  };
}

/**
 * Hook to get pre-computed task metrics for a specific phase
 * Optimized for dashboard and progress displays
 */
export function usePhaseTaskMetrics(phaseId: string, projectId: string) {
  const { data: tasksByPhase, ...rest } = useProjectTasksByPhase(projectId);
  
  const metrics = useMemo(() => {
    const phaseTasks = tasksByPhase[phaseId] || [];
    if (phaseTasks.length === 0) {
      return {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        pendingTasks: 0,
        overdueTasks: 0,
        progressPercentage: 0,
        tasks: []
      };
    }

    // Use pre-computed metrics from the first task (all tasks in phase have same metrics)
    const firstTaskMetrics = phaseTasks[0]?.metrics;
    
    return {
      ...firstTaskMetrics,
      tasks: phaseTasks
    };
  }, [tasksByPhase, phaseId]);

  return {
    ...rest,
    data: metrics
  };
}

/**
 * Hook for task filtering and search within a project
 * Performance optimized with memoized filtering
 */
export function useFilteredProjectTasks(
  projectId: string, 
  filters: {
    status?: string[];
    priority?: string[];
    assignee?: string;
    search?: string;
    phaseId?: string;
  } = {}
) {
  const consolidatedQuery = useConsolidatedProjectData(projectId);

  const filteredTasks = useMemo(() => {
    if (!consolidatedQuery.data) return [];

    let allTasks: any[] = [];
    
    // Collect all tasks from all phases
    consolidatedQuery.data.phases.forEach(phase => {
      const tasksWithPhase = phase.tasks.map(task => ({
        ...task,
        phase: {
          id: phase.id,
          name: phase.name,
          status: phase.status
        }
      }));
      allTasks = [...allTasks, ...tasksWithPhase];
    });

    // Apply filters
    let filtered = allTasks;

    if (filters.phaseId) {
      filtered = filtered.filter(task => task.phase_id === filters.phaseId);
    }

    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(task => filters.status!.includes(task.status));
    }

    if (filters.priority && filters.priority.length > 0) {
      filtered = filtered.filter(task => filters.priority!.includes(task.priority));
    }

    if (filters.assignee) {
      filtered = filtered.filter(task => task.assigned_to === filters.assignee);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by priority and due date
    filtered.sort((a, b) => {
      // Priority order: urgent > high > medium > low
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority; // Higher priority first
      }
      
      // Then by due date
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      
      // Tasks with due dates come first
      if (a.due_date && !b.due_date) return -1;
      if (!a.due_date && b.due_date) return 1;
      
      return 0;
    });

    return filtered;
  }, [consolidatedQuery.data, filters]);

  return {
    data: filteredTasks,
    isLoading: consolidatedQuery.isLoading,
    error: consolidatedQuery.error,
    refetch: consolidatedQuery.refetch
  };
}