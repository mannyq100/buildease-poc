import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'sonner';

// Types for task mutations
export interface CreateTaskData {
  name: string;
  description?: string;
  phase_id: string;
  project_id: string;
  assigned_to?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  estimated_hours?: number;
  status?: 'pending' | 'in-progress' | 'completed' | 'blocked' | 'cancelled';
  dependencies?: string[];
}

export interface UpdateTaskData {
  id: string;
  name?: string;
  description?: string;
  assigned_to?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  estimated_hours?: number;
  actual_hours?: number;
  status?: 'pending' | 'in-progress' | 'completed' | 'blocked' | 'cancelled';
  progress_percentage?: number;
  dependencies?: string[];
}

/**
 * Hook to create a new task
 */
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTaskData) => {
      const { data: task, error } = await supabase
        .from('construction_mgr.be_task')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return task;
    },
    onSuccess: (newTask, variables) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tasks.byProject(variables.project_id) 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tasks.byPhase(variables.phase_id) 
      });
      
      // Invalidate phase query to update task count
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.phases.detail(variables.phase_id) 
      });

      // If assigned to someone, invalidate their tasks
      if (variables.assigned_to) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.tasks.byUser(variables.assigned_to) 
        });
      }

      toast.success('Task created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating task:', error);
      toast.error(error.message || 'Failed to create task');
    }
  });
}

/**
 * Hook to update an existing task
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateTaskData) => {
      const { id, ...updateData } = data;
      
      const { data: task, error } = await supabase
        .from('construction_mgr.be_task')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return task;
    },
    onSuccess: (updatedTask) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tasks.byProject(updatedTask.project_id) 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tasks.byPhase(updatedTask.phase_id) 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tasks.detail(updatedTask.id) 
      });

      // If assigned to someone, invalidate their tasks
      if (updatedTask.assigned_to) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.tasks.byUser(updatedTask.assigned_to) 
        });
      }

      toast.success('Task updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating task:', error);
      toast.error(error.message || 'Failed to update task');
    }
  });
}

/**
 * Hook to delete a task
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      // First get the task to know which project/phase to invalidate
      const { data: task } = await supabase
        .from('construction_mgr.be_task')
        .select('project_id, phase_id, assigned_to')
        .eq('id', taskId)
        .single();

      const { error } = await supabase
        .from('construction_mgr.be_task')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      return { taskId, task };
    },
    onSuccess: ({ taskId, task }) => {
      if (task) {
        // Invalidate and refetch related queries
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.tasks.byProject(task.project_id) 
        });
        
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.tasks.byPhase(task.phase_id) 
        });
        
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.phases.detail(task.phase_id) 
        });

        // If assigned to someone, invalidate their tasks
        if (task.assigned_to) {
          queryClient.invalidateQueries({ 
            queryKey: queryKeys.tasks.byUser(task.assigned_to) 
          });
        }
      }

      // Remove the specific task from cache
      queryClient.removeQueries({ 
        queryKey: queryKeys.tasks.detail(taskId) 
      });

      toast.success('Task deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting task:', error);
      toast.error(error.message || 'Failed to delete task');
    }
  });
}

/**
 * Hook to update task status with optimistic updates
 */
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      taskId, 
      status, 
      progress 
    }: { 
      taskId: string; 
      status: 'pending' | 'in-progress' | 'completed' | 'blocked' | 'cancelled';
      progress?: number;
    }) => {
      const updateData: any = { status };
      if (progress !== undefined) {
        updateData.progress_percentage = progress;
      }

      const { data: task, error } = await supabase
        .from('construction_mgr.be_task')
        .update(updateData)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return task;
    },
    // Optimistic update
    onMutate: async ({ taskId, status, progress }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.detail(taskId) });

      // Snapshot the previous value
      const previousTask = queryClient.getQueryData(queryKeys.tasks.detail(taskId));

      // Optimistically update to the new value
      queryClient.setQueryData(queryKeys.tasks.detail(taskId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          status,
          ...(progress !== undefined && { progress_percentage: progress })
        };
      });

      return { previousTask };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousTask) {
        queryClient.setQueryData(queryKeys.tasks.detail(variables.taskId), context.previousTask);
      }
      console.error('Error updating task status:', error);
      toast.error(error.message || 'Failed to update task status');
    },
    onSettled: (updatedTask) => {
      // Always refetch after error or success
      if (updatedTask) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.tasks.detail(updatedTask.id) 
        });
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.tasks.byProject(updatedTask.project_id) 
        });
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.tasks.byPhase(updatedTask.phase_id) 
        });
      }
    }
  });
}

/**
 * Hook to assign task to user
 */
export function useAssignTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      taskId, 
      userId 
    }: { 
      taskId: string; 
      userId: string | null;
    }) => {
      const { data: task, error } = await supabase
        .from('construction_mgr.be_task')
        .update({ assigned_to: userId })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return task;
    },
    onSuccess: (updatedTask, variables) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tasks.detail(variables.taskId) 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tasks.byProject(updatedTask.project_id) 
      });

      // Invalidate both old and new assignee's tasks
      if (variables.userId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.tasks.byUser(variables.userId) 
        });
      }

      toast.success(variables.userId ? 'Task assigned successfully' : 'Task unassigned successfully');
    },
    onError: (error: any) => {
      console.error('Error assigning task:', error);
      toast.error(error.message || 'Failed to assign task');
    }
  });
}
