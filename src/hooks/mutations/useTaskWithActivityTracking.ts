/**
 * Enhanced Task Mutation Hooks with Integrated Activity Tracking
 * These hooks combine task operations with comprehensive activity logging
 * Designed for seamless integration into BuildEase project management workflows
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'sonner';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import type { CreateTaskData, UpdateTaskData } from './useTask';

// Minimal cache-safe task shape used for optimistic updates in this file
type TaskCache = {
  id: string;
  project_id: string;
  phase_id?: string;
  title?: string;
  status?: 'pending' | 'in-progress' | 'completed' | 'blocked' | 'cancelled';
  progress_percentage?: number | null;
  assigned_to?: string | null;
};

// Enhanced interfaces that include project context
export interface CreateTaskWithTrackingData extends CreateTaskData {
  phaseTitle?: string; // For better activity descriptions
}

export interface UpdateTaskWithTrackingData extends UpdateTaskData {
  title?: string; // Required for activity tracking
  previousStatus?: string; // To track status changes
  projectId: string; // Required for activity tracking
}

/**
 * Hook to create a task with integrated activity tracking
 */
export function useCreateTaskWithTracking(projectId: string) {
  const queryClient = useQueryClient();
  const { user: _user } = useSupabaseAuth();
  const activityTracker = useActivityTracker({ projectId });

  return useMutation({
    mutationFn: async (data: CreateTaskWithTrackingData) => {
      const { data: task, error } = await supabase
        .from('be_task')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return task;
    },
    onSuccess: async (newTask, variables) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tasks.byProject(variables.project_id) 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tasks.byPhase(variables.phase_id) 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.phases.detail(variables.phase_id) 
      });

      // CRITICAL: Invalidate consolidated project query for real-time updates
      queryClient.invalidateQueries({
        queryKey: ['project-consolidated', variables.project_id]
      });

      if (variables.assigned_to) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.tasks.byUser(variables.assigned_to) 
        });
      }

      // Track task creation activity
      try {
        await activityTracker.trackActivity(
          'task_create',
          `Task created: ${variables.title}`,
          `New task "${variables.title}" was added${variables.phaseTitle ? ` to ${variables.phaseTitle} phase` : ''}`,
          {
            entityType: 'task',
            entityId: newTask.id,
            metadata: {
              taskTitle: variables.title,
              phaseId: variables.phase_id,
              phaseTitle: variables.phaseTitle,
              priority: variables.priority || 'medium',
              assignedTo: variables.assigned_to,
              dueDate: variables.due_date,
              estimatedHours: variables.estimated_hours,
              status: variables.status || 'pending'
            },
            status: 'success'
          }
        );
      } catch (error) {
        console.error('Failed to track task creation activity:', error);
        // Don't fail the operation if activity tracking fails
      }

      toast.success('Task created successfully');
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to create task';
      console.error('Error creating task:', error);
      toast.error(message);
    }
  });
}

/**
 * Hook to update a task with integrated activity tracking
 */
export function useUpdateTaskWithTracking(projectId: string) {
  const queryClient = useQueryClient();
  const activityTracker = useActivityTracker({ projectId });

  return useMutation({
    mutationFn: async (data: UpdateTaskWithTrackingData) => {
      const { id, projectId: _projectId, previousStatus: _previousStatus, ...updateData } = data;
      
      const { data: task, error } = await supabase
        .from('be_task')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { task, updateData: data };
    },
    onSuccess: async ({ task, updateData }) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tasks.byProject(task.project_id) 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tasks.byPhase(task.phase_id) 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tasks.detail(task.id) 
      });

      // CRITICAL: Invalidate consolidated project query for real-time updates
      queryClient.invalidateQueries({
        queryKey: ['project-consolidated', task.project_id]
      });

      if (task.assigned_to) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.tasks.byUser(task.assigned_to) 
        });
      }

      // Track task update activity
      try {
        const taskTitle = updateData.title || 'Unknown Task';
        let activityTitle = `Task updated: ${taskTitle}`;
        let activityDescription = `Task "${taskTitle}" was modified`;
        let activityStatus: 'success' | 'info' | 'warning' | 'error' = 'info';

        // Special handling for status changes
        if (updateData.status && updateData.status !== updateData.previousStatus) {
          if (updateData.status === 'completed') {
            activityTitle = `Task completed: ${taskTitle}`;
            activityDescription = `Task "${taskTitle}" has been marked as completed`;
            activityStatus = 'success';
            
            // Use specific task completion tracking
            await activityTracker.trackTaskComplete(
              task.id,
              taskTitle,
              task.phase_id
            );
            toast.success('Task completed successfully');
            return; // Early return as we've already tracked this
          } else if (updateData.status === 'blocked') {
            activityTitle = `Task blocked: ${taskTitle}`;
            activityDescription = `Task "${taskTitle}" has been blocked`;
            activityStatus = 'warning';
          } else if (updateData.status === 'cancelled') {
            activityTitle = `Task cancelled: ${taskTitle}`;
            activityDescription = `Task "${taskTitle}" has been cancelled`;
            activityStatus = 'warning';
          } else {
            activityTitle = `Task status changed: ${taskTitle}`;
            activityDescription = `Task "${taskTitle}" status changed from ${updateData.previousStatus || 'unknown'} to ${updateData.status}`;
          }
        }

        await activityTracker.trackActivity(
          'task_update',
          activityTitle,
          activityDescription,
          {
            entityType: 'task',
            entityId: task.id,
            metadata: {
              taskTitle,
              phaseId: task.phase_id,
              previousStatus: updateData.previousStatus,
              newStatus: updateData.status,
              priority: updateData.priority,
              assignedTo: updateData.assigned_to,
              dueDate: updateData.due_date,
              estimatedHours: updateData.estimated_hours,
              actualHours: updateData.actual_hours,
              progress: updateData.progress_percentage,
              updatedFields: Object.keys(updateData).filter(key => 
                !['id', 'projectId', 'previousStatus'].includes(key)
              )
            },
            status: activityStatus
          }
        );
      } catch (error) {
        console.error('Failed to track task update activity:', error);
      }

      toast.success('Task updated successfully');
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to update task';
      console.error('Error updating task:', error);
      toast.error(message);
    }
  });
}

/**
 * Hook to delete a task with integrated activity tracking
 */
export function useDeleteTaskWithTracking(projectId: string) {
  const queryClient = useQueryClient();
  const activityTracker = useActivityTracker({ projectId });

  return useMutation({
    mutationFn: async ({ taskId, taskTitle }: { taskId: string; taskTitle: string }) => {
      // First get the task details for proper cleanup
      const { data: task } = await supabase
        .from('be_task')
        .select('project_id, phase_id, assigned_to, title')
        .eq('id', taskId)
        .single();

      const { error } = await supabase
        .from('be_task')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      return { taskId, taskTitle: taskTitle || task?.title || 'Unknown Task', task };
    },
    onSuccess: async ({ taskId, taskTitle, task }) => {
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

      // Track task deletion activity
      try {
        await activityTracker.trackActivity(
          'task_delete',
          `Task deleted: ${taskTitle}`,
          `Task "${taskTitle}" was removed from the project`,
          {
            entityType: 'task',
            entityId: taskId,
            metadata: {
              taskTitle,
              phaseId: task?.phase_id,
              wasAssignedTo: task?.assigned_to
            },
            status: 'warning'
          }
        );
      } catch (error) {
        console.error('Failed to track task deletion activity:', error);
      }

      toast.success('Task deleted successfully');
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to delete task';
      console.error('Error deleting task:', error);
      toast.error(message);
    }
  });
}

/**
 * Hook specifically for task status updates with enhanced activity tracking
 */
export function useUpdateTaskStatusWithTracking(projectId: string) {
  const queryClient = useQueryClient();
  const activityTracker = useActivityTracker({ projectId });

  return useMutation({
    mutationFn: async ({ 
      taskId, 
      taskTitle,
      status, 
      progress,
      previousStatus
    }: { 
      taskId: string;
      taskTitle: string;
      status: 'pending' | 'in-progress' | 'completed' | 'blocked' | 'cancelled';
      progress?: number;
      previousStatus?: string;
    }) => {
      const updateData: Partial<TaskCache> & { status: TaskCache['status'] } = { status };
      if (progress !== undefined) {
        updateData.progress_percentage = progress;
      }

      const { data: task, error } = await supabase
        .from('be_task')
        .update(updateData)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return { task, taskTitle, previousStatus, newStatus: status };
    },
    // Optimistic update
    onMutate: async ({ taskId, status, progress }) => {
      // Cancel in-flight queries for the task detail
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.detail(taskId) });

      // Snapshot current caches
      const previousTask = queryClient.getQueryData<TaskCache | undefined>(queryKeys.tasks.detail(taskId));

      // Determine phase/project from cached task if available
      const phaseId: string | undefined = previousTask?.phase_id;
      const projectId: string | undefined = previousTask?.project_id;

      // Also snapshot list caches for rollback
      const prevByPhase = phaseId ? queryClient.getQueryData<TaskCache[] | undefined>(queryKeys.tasks.byPhase(phaseId)) : undefined;
      const prevByProject = projectId ? queryClient.getQueryData<TaskCache[] | undefined>(queryKeys.tasks.byProject(projectId)) : undefined;

      // Update task detail cache
      queryClient.setQueryData(queryKeys.tasks.detail(taskId), (old: TaskCache | undefined) => {
        if (!old) return old;
        return {
          ...old,
          status,
          ...(progress !== undefined && { progress_percentage: progress })
        };
      });

      // Helper to update a list cache by replacing the matching task entry
      const updateList = (list: TaskCache[] | undefined) =>
        Array.isArray(list)
          ? list.map((t) =>
              t?.id === taskId
                ? {
                    ...t,
                    status,
                    ...(progress !== undefined && { progress_percentage: progress })
                  }
                : t
            )
          : list;

      // Update byPhase list cache optimistically
      if (phaseId) {
        queryClient.setQueryData(queryKeys.tasks.byPhase(phaseId), (old: TaskCache[] | undefined) => updateList(old));
      }

      // Update byProject list cache optimistically
      if (projectId) {
        queryClient.setQueryData(queryKeys.tasks.byProject(projectId), (old: TaskCache[] | undefined) => updateList(old));
      }

      return { previousTask, prevByPhase, prevByProject, phaseId, projectId };
    },
    onError: (error, variables, context) => {
      // Rollback detail cache
      if (context?.previousTask) {
        queryClient.setQueryData(queryKeys.tasks.detail(variables.taskId), context.previousTask);
      }
      // Rollback list caches
      if (context?.phaseId && context?.prevByPhase) {
        queryClient.setQueryData(queryKeys.tasks.byPhase(context.phaseId), context.prevByPhase);
      }
      if (context?.projectId && context?.prevByProject) {
        queryClient.setQueryData(queryKeys.tasks.byProject(context.projectId), context.prevByProject);
      }
      console.error('Error updating task status:', error);
      const message = error instanceof Error ? error.message : 'Failed to update task status';
      toast.error(message);
    },
    onSuccess: async ({ task, taskTitle, previousStatus, newStatus }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tasks.detail(task.id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tasks.byProject(task.project_id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tasks.byPhase(task.phase_id) 
      });

      // Track status change activity
      try {
        if (newStatus === 'completed') {
          // Special tracking for task completion
          await activityTracker.trackTaskComplete(
            task.id,
            taskTitle,
            task.phase_id
          );
        } else {
          // General status change tracking
          await activityTracker.trackStatusChange(
            `Task status changed: ${taskTitle}`,
            `Task "${taskTitle}" status changed from ${previousStatus || 'unknown'} to ${newStatus}`,
            newStatus === 'blocked' || newStatus === 'cancelled' ? 'warning' : 'info',
            {
              taskId: task.id,
              taskTitle,
              phaseId: task.phase_id,
              previousStatus,
              newStatus,
              progress: task.progress_percentage
            }
          );
        }
      } catch (error) {
        console.error('Failed to track task status change activity:', error);
      }

      const statusMessage = newStatus === 'completed' ? 'Task completed!' : 'Task status updated';
      toast.success(statusMessage);
    }
  });
}

/**
 * Hook for task assignment changes with activity tracking
 */
export function useAssignTaskWithTracking(projectId: string) {
  const queryClient = useQueryClient();
  const activityTracker = useActivityTracker({ projectId });

  return useMutation({
    mutationFn: async ({ 
      taskId, 
      taskTitle,
      userId,
      userName,
      previousAssignee 
    }: { 
      taskId: string;
      taskTitle: string;
      userId: string | null;
      userName?: string;
      previousAssignee?: string;
    }) => {
      const { data: task, error } = await supabase
        .from('be_task')
        .update({ assigned_to: userId })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return { task, taskTitle, userName, previousAssignee, isAssignment: !!userId };
    },
    onSuccess: async ({ task, taskTitle, userName, previousAssignee, isAssignment }) => {
      // Invalidate queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tasks.detail(task.id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tasks.byProject(task.project_id) 
      });

      if (task.assigned_to) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.tasks.byUser(task.assigned_to) 
        });
      }

      // Track assignment activity
      try {
        const activityTitle = isAssignment 
          ? `Task assigned: ${taskTitle}` 
          : `Task unassigned: ${taskTitle}`;
        
        const activityDescription = isAssignment
          ? `Task "${taskTitle}" was assigned to ${userName || 'a team member'}`
          : `Task "${taskTitle}" was unassigned${previousAssignee ? ` from ${previousAssignee}` : ''}`;

        await activityTracker.trackActivity(
          isAssignment ? 'task_assign' : 'task_unassign',
          activityTitle,
          activityDescription,
          {
            entityType: 'task',
            entityId: task.id,
            metadata: {
              taskTitle,
              phaseId: task.phase_id,
              assignedTo: task.assigned_to,
              assignedToName: userName,
              previousAssignee,
              isAssignment
            },
            status: 'info'
          }
        );
      } catch (error) {
        console.error('Failed to track task assignment activity:', error);
      }

      toast.success(isAssignment ? 'Task assigned successfully' : 'Task unassigned successfully');
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to assign task';
      console.error('Error assigning task:', error);
      toast.error(message);
    }
  });
}