/**
 * Task query hooks for BuildEase construction management
 * Handles fetching task data from Supabase with mobile-first optimization
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryClient';

/**
 * Hook to fetch all tasks for a specific project
 * Returns tasks with assignee information
 */
export const useProjectTasks = (projectId: string) => {
  return useQuery({
    queryKey: queryKeys.tasks.byProject(projectId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('construction_mgr.be_task')
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
          assignee:assigned_to (
            id,
            full_name,
            email,
            avatar_url
          ),
          completedBy:completed_by (
            id,
            full_name,
            email
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching project tasks:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000, // 2 minutes - tasks change frequently
  });
};

/**
 * Hook to fetch tasks for a specific phase
 * Returns tasks ordered by creation date
 */
export const usePhaseTasks = (phaseId: string) => {
  return useQuery({
    queryKey: queryKeys.tasks.byPhase(phaseId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('construction_mgr.be_task')
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
          assignee:assigned_to (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('phase_id', phaseId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching phase tasks:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!phaseId,
    staleTime: 1 * 60 * 1000, // 1 minute - phase tasks are actively worked on
  });
};

/**
 * Hook to fetch a single task by ID
 * Returns detailed task information
 */
export const useTask = (taskId: string) => {
  return useQuery({
    queryKey: queryKeys.tasks.detail(taskId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('construction_mgr.be_task')
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
          assignee:assigned_to (
            id,
            full_name,
            email,
            avatar_url
          ),
          completedBy:completed_by (
            id,
            full_name,
            email
          ),
          phase:phase_id (
            id,
            name,
            category
          )
        `)
        .eq('id', taskId)
        .single();
      
      if (error) {
        console.error('Error fetching task:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!taskId,
    staleTime: 1 * 60 * 1000, // 1 minute - task details are actively viewed/edited
  });
};

/**
 * Hook to fetch tasks assigned to the current user across all projects
 * Useful for dashboard and personal task management
 */
export const useMyTasks = (userId: string) => {
  return useQuery({
    queryKey: ['my_tasks', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('construction_mgr.be_task')
        .select(`
          id,
          project_id,
          phase_id,
          title,
          description,
          status,
          priority,
          start_date,
          due_date,
          created_at,
          updated_at,
          project:project_id (
            id,
            name,
            status
          ),
          phase:phase_id (
            id,
            name,
            category
          )
        `)
        .eq('assigned_to', userId)
        .in('status', ['PENDING', 'IN_PROGRESS'])
        .order('due_date', { ascending: true, nullsFirst: false });
      
      if (error) {
        console.error('Error fetching my tasks:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute - personal tasks are high priority
  });
};
