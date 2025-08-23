import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'sonner';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import * as activityService from '@/services/activityService';
import { logTaskActivity, logActivityAsync } from '@/utils/activityLogging';
import { useProjectStore } from '@/stores/projectStore';

// Types for task mutations
export interface CreateTaskData {
  title: string;
  description?: string | null;
  phase_id: string;
  project_id: string;
  assigned_to?: string | null;
  due_date?: string | null;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  estimated_hours?: number;
  status?: 'pending' | 'in-progress' | 'completed' | 'blocked' | 'cancelled';
  dependencies?: string[];
  created_by: string;
}

export interface UpdateTaskData {
  id: string;
  title?: string;
  description?: string;
  assigned_to?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  estimated_hours?: number;
  actual_hours?: number;
  status?: 'pending' | 'in-progress' | 'completed' | 'blocked' | 'cancelled';
  dependencies?: string[];
}

/**
 * Hook to create a new task with activity tracking
 */
export function useCreateTask() {
  const queryClient = useQueryClient();
  const { user } = useSupabaseAuth();
  const addOptimisticUpdate = useProjectStore(state => state.addOptimisticUpdate);

  return useMutation({
    mutationFn: async (data: CreateTaskData) => {
      const { data: task, error } = await supabase
        .from('be_task')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return task;
    },
    // Optimistic update - show task immediately
    onMutate: async (newTask) => {
      const optimisticId = `temp_task_${Date.now()}`;
      const optimisticTask = {
        id: optimisticId,
        ...newTask,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: newTask.status || 'pending'
      };

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.tasks.byProject(newTask.project_id) 
      });
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.tasks.byPhase(newTask.phase_id) 
      });

      // Snapshot the previous values
      const previousProjectTasks = queryClient.getQueryData(queryKeys.tasks.byProject(newTask.project_id));
      const previousPhaseTasks = queryClient.getQueryData(queryKeys.tasks.byPhase(newTask.phase_id));

      // Optimistically update project tasks
      queryClient.setQueryData(queryKeys.tasks.byProject(newTask.project_id), (old: any) => {
        if (!old) return [optimisticTask];
        return [...old, optimisticTask];
      });

      // Optimistically update phase tasks
      queryClient.setQueryData(queryKeys.tasks.byPhase(newTask.phase_id), (old: any) => {
        if (!old) return [optimisticTask];
        return [...old, optimisticTask];
      });

      // Track optimistic update
      addOptimisticUpdate(`create_task_${optimisticId}`, {
        type: 'create',
        entity: 'task',
        data: optimisticTask,
        timestamp: Date.now()
      });

      return { 
        previousProjectTasks, 
        previousPhaseTasks, 
        optimisticId,
        optimisticTask 
      };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousProjectTasks) {
        queryClient.setQueryData(queryKeys.tasks.byProject(variables.project_id), context.previousProjectTasks);
      }
      if (context?.previousPhaseTasks) {
        queryClient.setQueryData(queryKeys.tasks.byPhase(variables.phase_id), context.previousPhaseTasks);
      }
      
      console.error('Error creating task:', error);
      toast.error(error.message || 'Failed to create task');
    },
    onSuccess: async (newTask, variables, context) => {
      // Replace optimistic task with real server data
      queryClient.setQueryData(queryKeys.tasks.byProject(variables.project_id), (old: any) => {
        if (!old) return [newTask];
        return old.map((task: any) => 
          task.id === context?.optimisticId ? newTask : task
        );
      });

      queryClient.setQueryData(queryKeys.tasks.byPhase(variables.phase_id), (old: any) => {
        if (!old) return [newTask];
        return old.map((task: any) => 
          task.id === context?.optimisticId ? newTask : task
        );
      });

      // Remove optimistic update tracking
      const removeOptimisticUpdate = useProjectStore.getState().removeOptimisticUpdate;
      removeOptimisticUpdate(`create_task_${context?.optimisticId}`);

      // Invalidate and refetch related queries for other components
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.phases.detail(variables.phase_id) 
      });

      // CRITICAL: Invalidate consolidated project query for real-time updates
      queryClient.invalidateQueries({
        queryKey: ['project-consolidated', variables.project_id]
      });

      // If assigned to someone, invalidate their tasks
      if (variables.assigned_to) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.tasks.byUser(variables.assigned_to) 
        });
      }

      // Fire-and-forget activity logging using standardized utilities
      (async () => {
        try {
          // Get phase name for better context
          let phaseContext = '';
          try {
            const { data: phaseData } = await supabase
              .from('be_phase')
              .select('name')
              .eq('id', variables.phase_id)
              .single();
            phaseContext = phaseData?.name || '';
          } catch (e) {
            console.warn('Could not fetch phase name for activity');
          }
          
          await logTaskActivity(
            variables.project_id,
            'task_create',
            newTask.id,
            variables.title,
            {
              description: variables.description,
              phaseId: variables.phase_id,
              phaseText: phaseContext ? ` in ${phaseContext}` : '',
              priority: variables.priority || 'medium',
              status: variables.status || 'pending',
              assignedTo: variables.assigned_to,
              assigneeName: variables.assigned_to,
              dueDate: variables.due_date,
              estimatedHours: variables.estimated_hours
            }
          );
        } catch (e) {
          console.error('Failed to create activity for task creation:', e);
        }
      })();

      toast.success('Task created successfully');
    }
  });
}

/**
 * Hook to update an existing task with activity tracking support
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();
  const addOptimisticUpdate = useProjectStore(state => state.addOptimisticUpdate);

  return useMutation({
    mutationFn: async (data: UpdateTaskData) => {
      const { id, ...updateData } = data;
      
      const { data: task, error } = await supabase
        .from('be_task')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return task;
    },
    // Optimistic update - show changes immediately
    onMutate: async (updateData) => {
      const taskId = updateData.id;
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.detail(taskId) });

      // Snapshot the previous value
      const previousTask = queryClient.getQueryData(queryKeys.tasks.detail(taskId));
      
      // Get current task from any cached queries to determine project/phase
      let currentTask: any = previousTask;
      if (!currentTask) {
        // Try to find task in project or phase queries
        const projectQueries = queryClient.getQueriesData({ queryKey: ['tasks', 'byProject'] });
        const phaseQueries = queryClient.getQueriesData({ queryKey: ['tasks', 'byPhase'] });
        
        for (const [, data] of [...projectQueries, ...phaseQueries]) {
          if (Array.isArray(data)) {
            const found = data.find((task: any) => task.id === taskId);
            if (found) {
              currentTask = found;
              break;
            }
          }
        }
      }

      if (currentTask) {
        const optimisticTask = { ...currentTask, ...updateData, updated_at: new Date().toISOString() };

        // Optimistically update task detail
        queryClient.setQueryData(queryKeys.tasks.detail(taskId), optimisticTask);

        // Update task in project tasks list
        if (currentTask.project_id) {
          queryClient.setQueryData(queryKeys.tasks.byProject(currentTask.project_id), (old: any) => {
            if (!old) return old;
            return old.map((task: any) => task.id === taskId ? optimisticTask : task);
          });
        }

        // Update task in phase tasks list
        if (currentTask.phase_id) {
          queryClient.setQueryData(queryKeys.tasks.byPhase(currentTask.phase_id), (old: any) => {
            if (!old) return old;
            return old.map((task: any) => task.id === taskId ? optimisticTask : task);
          });
        }

        // Track optimistic update
        addOptimisticUpdate(`update_task_${taskId}`, {
          type: 'update',
          entity: 'task',
          data: optimisticTask,
          originalData: currentTask,
          timestamp: Date.now()
        });

        return { previousTask, currentTask, optimisticTask };
      }

      return { previousTask };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousTask) {
        queryClient.setQueryData(queryKeys.tasks.detail(variables.id), context.previousTask);
      }
      if (context?.currentTask) {
        // Restore in project/phase lists
        if (context.currentTask.project_id) {
          queryClient.setQueryData(queryKeys.tasks.byProject(context.currentTask.project_id), (old: any) => {
            if (!old) return old;
            return old.map((task: any) => task.id === variables.id ? context.currentTask : task);
          });
        }
        if (context.currentTask.phase_id) {
          queryClient.setQueryData(queryKeys.tasks.byPhase(context.currentTask.phase_id), (old: any) => {
            if (!old) return old;
            return old.map((task: any) => task.id === variables.id ? context.currentTask : task);
          });
        }
      }
      
      console.error('Error updating task:', error);
      toast.error(error.message || 'Failed to update task');
    },
    onSuccess: async (updatedTask, variables, context) => {
      // Update all cached instances with real server data
      queryClient.setQueryData(queryKeys.tasks.detail(updatedTask.id), updatedTask);
      
      queryClient.setQueryData(queryKeys.tasks.byProject(updatedTask.project_id), (old: any) => {
        if (!old) return old;
        return old.map((task: any) => task.id === updatedTask.id ? updatedTask : task);
      });

      queryClient.setQueryData(queryKeys.tasks.byPhase(updatedTask.phase_id), (old: any) => {
        if (!old) return old;
        return old.map((task: any) => task.id === updatedTask.id ? updatedTask : task);
      });

      // Remove optimistic update tracking
      const removeOptimisticUpdate = useProjectStore.getState().removeOptimisticUpdate;
      removeOptimisticUpdate(`update_task_${updatedTask.id}`);

      // CRITICAL: Invalidate consolidated project query for real-time updates
      queryClient.invalidateQueries({
        queryKey: ['project-consolidated', updatedTask.project_id]
      });

      // If assigned to someone, invalidate their tasks
      if (updatedTask.assigned_to) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.tasks.byUser(updatedTask.assigned_to) 
        });
      }

      // Fire-and-forget activity logging using standardized utilities
      (async () => {
        try {
          // Determine what changed for more specific messaging
          const updatedFields = Object.keys(variables).filter(key => key !== 'id');
          const wasCompleted = variables.status === 'completed';
          const activityType = wasCompleted ? 'task_complete' : 
                              updatedFields.includes('assigned_to') ? (updatedTask.assigned_to ? 'task_assign' : 'task_unassign') :
                              updatedFields.includes('status') ? 'task_status_update' : 'task_update';

          await logTaskActivity(
            updatedTask.project_id,
            activityType,
            updatedTask.id,
            updatedTask.title,
            {
              priority: updatedTask.priority,
              status: updatedTask.status,
              assignedTo: updatedTask.assigned_to,
              assigneeName: updatedTask.assigned_to,
              dueDate: updatedTask.due_date,
              estimatedHours: updatedTask.estimated_hours,
              actualHours: updatedTask.actual_hours,
              updatedFields,
              changes: updatedFields
            }
          );
        } catch (e) {
          console.error('Failed to create activity for task update:', e);
        }
      })();

      toast.success('Task updated successfully');
    }
  });
}

/**
 * Hook to delete a task
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();
  const addOptimisticUpdate = useProjectStore(state => state.addOptimisticUpdate);

  return useMutation({
    mutationFn: async (taskId: string) => {
      // First get the task to know which project/phase to invalidate
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
      return { taskId, task };
    },
    // Optimistic update - remove task immediately
    onMutate: async (taskId) => {
      // Find the task in cached queries to get its details
      let taskToDelete: any = null;
      const projectQueries = queryClient.getQueriesData({ queryKey: ['tasks', 'byProject'] });
      const phaseQueries = queryClient.getQueriesData({ queryKey: ['tasks', 'byPhase'] });
      
      for (const [, data] of [...projectQueries, ...phaseQueries]) {
        if (Array.isArray(data)) {
          const found = data.find((task: any) => task.id === taskId);
          if (found) {
            taskToDelete = found;
            break;
          }
        }
      }

      if (!taskToDelete) {
        // Try task detail query
        taskToDelete = queryClient.getQueryData(queryKeys.tasks.detail(taskId));
      }

      if (taskToDelete) {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({ queryKey: queryKeys.tasks.detail(taskId) });
        await queryClient.cancelQueries({ queryKey: queryKeys.tasks.byProject(taskToDelete.project_id) });
        await queryClient.cancelQueries({ queryKey: queryKeys.tasks.byPhase(taskToDelete.phase_id) });

        // Snapshot the previous values
        const previousProjectTasks = queryClient.getQueryData(queryKeys.tasks.byProject(taskToDelete.project_id));
        const previousPhaseTasks = queryClient.getQueryData(queryKeys.tasks.byPhase(taskToDelete.phase_id));
        const previousTaskDetail = queryClient.getQueryData(queryKeys.tasks.detail(taskId));

        // Optimistically remove from all queries
        queryClient.setQueryData(queryKeys.tasks.byProject(taskToDelete.project_id), (old: any) => {
          if (!old) return old;
          return old.filter((task: any) => task.id !== taskId);
        });

        queryClient.setQueryData(queryKeys.tasks.byPhase(taskToDelete.phase_id), (old: any) => {
          if (!old) return old;
          return old.filter((task: any) => task.id !== taskId);
        });

        // Remove task detail
        queryClient.removeQueries({ queryKey: queryKeys.tasks.detail(taskId) });

        // Track optimistic update
        addOptimisticUpdate(`delete_task_${taskId}`, {
          type: 'delete',
          entity: 'task',
          data: taskToDelete,
          timestamp: Date.now()
        });

        return { 
          taskToDelete,
          previousProjectTasks, 
          previousPhaseTasks, 
          previousTaskDetail 
        };
      }

      return {};
    },
    onError: (error, taskId, context) => {
      // Rollback on error
      if (context?.taskToDelete) {
        if (context.previousProjectTasks) {
          queryClient.setQueryData(queryKeys.tasks.byProject(context.taskToDelete.project_id), context.previousProjectTasks);
        }
        if (context.previousPhaseTasks) {
          queryClient.setQueryData(queryKeys.tasks.byPhase(context.taskToDelete.phase_id), context.previousPhaseTasks);
        }
        if (context.previousTaskDetail) {
          queryClient.setQueryData(queryKeys.tasks.detail(taskId), context.previousTaskDetail);
        }
      }
      
      console.error('Error deleting task:', error);
      toast.error(error.message || 'Failed to delete task');
    },
    onSuccess: async ({ taskId, task }, variables, context) => {
      // Remove optimistic update tracking
      const removeOptimisticUpdate = useProjectStore.getState().removeOptimisticUpdate;
      removeOptimisticUpdate(`delete_task_${taskId}`);

      if (task) {
        // Ensure task is removed from all cached queries (should already be done optimistically)
        queryClient.setQueryData(queryKeys.tasks.byProject(task.project_id), (old: any) => {
          if (!old) return old;
          return old.filter((t: any) => t.id !== taskId);
        });

        queryClient.setQueryData(queryKeys.tasks.byPhase(task.phase_id), (old: any) => {
          if (!old) return old;
          return old.filter((t: any) => t.id !== taskId);
        });

        // Invalidate related queries for counts and other components
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

      // Ensure task detail is removed
      queryClient.removeQueries({ 
        queryKey: queryKeys.tasks.detail(taskId) 
      });

      // Fire-and-forget activity logging using standardized utilities
      if (task?.project_id) {
        const taskTitle = (task as any)?.title || 'Unknown Task';
        logActivityAsync({
          projectId: task.project_id,
          activityType: 'task_delete',
          entityType: 'task',
          entityId: taskId,
          entityName: taskTitle,
          metadata: {
            taskTitle,
            phaseId: task.phase_id,
            wasAssignedTo: task.assigned_to
          }
        });
      }

      toast.success('Task deleted successfully');
    }
  });
}

/**
 * Hook to update task status with optimistic updates and phase timeline automation
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
      // Only update status - progress_percentage field doesn't exist in schema
      const updateData: any = { status };

      const { data: task, error } = await supabase
        .from('be_task')
        .update(updateData)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;

      // Handle optimistic phase timeline updates
      if (task.phase_id && (status === 'in-progress' || status === 'completed')) {
        await handlePhaseTimelineUpdate(task.phase_id, status);
      }

      return task;
    },
    // Optimistic update
    onMutate: async ({ taskId, status, progress }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.detail(taskId) });

      // Snapshot the previous value
      const previousTask = queryClient.getQueryData(queryKeys.tasks.detail(taskId));

      // Optimistically update to the new value - only update status since progress_percentage doesn't exist
      queryClient.setQueryData(queryKeys.tasks.detail(taskId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          status
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
    },
    onSuccess: async (updatedTask, variables) => {
      // CRITICAL: Invalidate cache for real-time UI updates
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tasks.byProject(updatedTask.project_id) 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tasks.byPhase(updatedTask.phase_id) 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tasks.detail(updatedTask.id) 
      });

      // CRITICAL: Invalidate consolidated project query for real-time updates
      queryClient.invalidateQueries({
        queryKey: ['project-consolidated', updatedTask.project_id]
      });

      if (updatedTask.assigned_to) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.tasks.byUser(updatedTask.assigned_to) 
        });
      }
      
      // Fire-and-forget activity logging using standardized utilities
      (async () => {
        try {
          const wasCompleted = variables.status === 'completed';
          const activityType = wasCompleted ? 'task_complete' : 'task_status_update';
          
          await logTaskActivity(
            updatedTask.project_id,
            activityType,
            updatedTask.id,
            updatedTask.title,
            {
              status: variables.status,
              newStatus: variables.status
            }
          );
        } catch (e) {
          console.error('Failed to create activity for task status update:', e);
        }
      })();
    }
  });
}

/**
 * Helper function to handle phase timeline updates based on task status changes
 */
async function handlePhaseTimelineUpdate(
  phaseId: string, 
  taskStatus: 'in-progress' | 'completed'
) {
  try {
    // Get phase and its tasks to determine if timeline should be updated
    const [phaseResponse, tasksResponse] = await Promise.all([
      supabase
        .from('be_phase')
        .select('timeline, status')
        .eq('id', phaseId)
        .single(),
      supabase
        .from('be_task')
        .select('status')
        .eq('phase_id', phaseId)
    ]);

    if (phaseResponse.error || tasksResponse.error) {
      console.warn('Could not fetch phase/tasks for timeline update:', {
        phaseError: phaseResponse.error,
        tasksError: tasksResponse.error
      });
      return;
    }

    const phase = phaseResponse.data;
    const tasks = tasksResponse.data;
    const currentTimeline = phase.timeline || {};
    let shouldUpdatePhase = false;
    const updates: any = {};

    // Rule 1: Set actual_start when first task changes to in-progress
    if (taskStatus === 'in-progress' && !currentTimeline.actual_start) {
      const hasInProgressTasks = tasks.some(task => task.status === 'in-progress');
      if (hasInProgressTasks) {
        const now = new Date().toISOString().split('T')[0];
        updates.timeline = {
          ...currentTimeline,
          actual_start: now
        };
        shouldUpdatePhase = true;
      }
    }

    // Rule 2: Set actual_end when all tasks are completed OR phase status is completed
    if (taskStatus === 'completed' && !currentTimeline.actual_end) {
      const allTasksCompleted = tasks.length > 0 && tasks.every(task => task.status === 'completed');
      const phaseIsCompleted = phase.status === 'COMPLETED';
      
      if (allTasksCompleted || phaseIsCompleted) {
        const now = new Date().toISOString().split('T')[0];
        updates.timeline = {
          ...currentTimeline,
          ...updates.timeline, // Preserve any previous updates
          actual_end: now
        };
        shouldUpdatePhase = true;
      }
    }

    // Update phase if needed
    if (shouldUpdatePhase) {
      const { error: updateError } = await supabase
        .from('be_phase')
        .update(updates)
        .eq('id', phaseId);

      if (updateError) {
        console.error('Failed to update phase timeline:', updateError);
      }
    }

  } catch (error) {
    console.error('Error in handlePhaseTimelineUpdate:', error);
  }
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
        .from('be_task')
        .update({ assigned_to: userId })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return task;
    },
    onSuccess: async (updatedTask, variables) => {
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

      // Fire-and-forget activity logging using standardized utilities
      logActivityAsync({
        projectId: updatedTask.project_id,
        activityType: variables.userId ? 'task_assign' : 'task_unassign',
        entityType: 'task',
        entityId: updatedTask.id,
        entityName: updatedTask.title,
        metadata: {
          taskTitle: updatedTask.title,
          phaseId: updatedTask.phase_id,
          assignedTo: updatedTask.assigned_to,
          isAssignment: !!variables.userId
        }
      });

      toast.success(variables.userId ? 'Task assigned successfully' : 'Task unassigned successfully');
    },
    onError: (error: any) => {
      console.error('Error assigning task:', error);
      toast.error(error.message || 'Failed to assign task');
    }
  });
}
