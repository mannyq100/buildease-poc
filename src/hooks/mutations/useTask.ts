import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryClient';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useStandardMutation, useProjectMutation } from '@/hooks/useStandardMutation';

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
  const { user } = useSupabaseAuth();

  return useProjectMutation<any, CreateTaskData>({
    mutationFn: async (data: CreateTaskData) => {
      const { data: task, error } = await supabase
        .from('be_task')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return task;
    },
    
    queryKeysToInvalidate: [
      queryKeys.phases.detail(''), // Will be filled with actual phase_id
      ['project-consolidated', ''] // Will be filled with actual project_id
    ],
    
    successMessage: 'Task created successfully',
    
    // Optimistic update for immediate UI feedback
    optimisticUpdate: {
      queryKey: queryKeys.tasks.byProject(''), // Will be dynamically set
      updateFn: (old: any, variables: CreateTaskData) => {
        const optimisticTask = {
          id: `temp_task_${Date.now()}`,
          ...variables,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: variables.status || 'pending'
        };
        
        if (!old) return [optimisticTask];
        return [...old, optimisticTask];
      }
    },
    
    // Activity logging
    activityLog: {
      activityType: 'task_create',
      entityType: 'task',
      getEntityName: (variables: CreateTaskData) => variables.title,
      getEntityId: (variables: CreateTaskData, result?: any) => result?.id,
      getMetadata: async (variables: CreateTaskData) => {
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
        
        return {
          description: variables.description,
          phaseId: variables.phase_id,
          phaseText: phaseContext ? ` in ${phaseContext}` : '',
          priority: variables.priority || 'medium',
          status: variables.status || 'pending',
          assignedTo: variables.assigned_to,
          assigneeName: variables.assigned_to,
          dueDate: variables.due_date,
          estimatedHours: variables.estimated_hours
        };
      }
    },
    
    errorContext: {
      action: 'create task',
      canRetry: true,
      showToast: true
    },
    
    onSuccessCallback: async (newTask, variables) => {
      // Additional invalidations for specific query patterns
      const { queryClient } = require('@tanstack/react-query');
      
      // Update specific query keys with actual IDs
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.phases.detail(variables.phase_id) 
      });
      
      queryClient.invalidateQueries({
        queryKey: ['project-consolidated', variables.project_id]
      });
      
      if (variables.assigned_to) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.tasks.byUser(variables.assigned_to) 
        });
      }
    }
  });
}

/**
 * Hook to update an existing task with activity tracking support
 */
export function useUpdateTask() {
  return useStandardMutation<any, UpdateTaskData>({
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
    
    queryKeysToInvalidate: [
      ['project-consolidated', ''] // Will be filled with actual project_id
    ],
    
    successMessage: 'Task updated successfully',
    
    // Optimistic update for immediate UI feedback
    optimisticUpdate: {
      queryKey: queryKeys.tasks.detail(''), // Will be dynamically set with task ID
      updateFn: (old: any, variables: UpdateTaskData) => {
        if (!old) return old;
        return { ...old, ...variables, updated_at: new Date().toISOString() };
      }
    },
    
    // Activity logging with dynamic activity type based on changes
    activityLog: {
      activityType: 'task_update', // Will be dynamically determined
      entityType: 'task',
      getEntityName: (variables: UpdateTaskData, result?: any) => result?.title || 'Task',
      getEntityId: (variables: UpdateTaskData, result?: any) => result?.id,
      getMetadata: (variables: UpdateTaskData, result?: any) => {
        const updatedFields = Object.keys(variables).filter(key => key !== 'id');
        const wasCompleted = variables.status === 'completed';
        
        return {
          priority: result?.priority,
          status: result?.status,
          assignedTo: result?.assigned_to,
          assigneeName: result?.assigned_to,
          dueDate: result?.due_date,
          estimatedHours: result?.estimated_hours,
          actualHours: result?.actual_hours,
          updatedFields,
          changes: updatedFields,
          activityType: wasCompleted ? 'task_complete' : 
                       updatedFields.includes('assigned_to') ? (result?.assigned_to ? 'task_assign' : 'task_unassign') :
                       updatedFields.includes('status') ? 'task_status_update' : 'task_update'
        };
      }
    },
    
    errorContext: {
      action: 'update task',
      canRetry: true,
      showToast: true
    },
    
    onSuccessCallback: async (updatedTask, variables) => {
      const { queryClient } = require('@tanstack/react-query');
      
      // Update all task-related caches with real server data
      queryClient.setQueryData(queryKeys.tasks.detail(updatedTask.id), updatedTask);
      
      queryClient.setQueryData(queryKeys.tasks.byProject(updatedTask.project_id), (old: any) => {
        if (!old) return old;
        return old.map((task: any) => task.id === updatedTask.id ? updatedTask : task);
      });

      queryClient.setQueryData(queryKeys.tasks.byPhase(updatedTask.phase_id), (old: any) => {
        if (!old) return old;
        return old.map((task: any) => task.id === updatedTask.id ? updatedTask : task);
      });

      // Invalidate consolidated project query
      queryClient.invalidateQueries({
        queryKey: ['project-consolidated', updatedTask.project_id]
      });

      // If assigned to someone, invalidate their tasks
      if (updatedTask.assigned_to) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.tasks.byUser(updatedTask.assigned_to) 
        });
      }
    }
  });
}

/**
 * Hook to delete a task
 */
export function useDeleteTask() {
  return useStandardMutation<{ taskId: string; task: any }, string>({
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
    
    queryKeysToRemove: [
      queryKeys.tasks.detail('') // Will be filled with actual task ID
    ],
    
    successMessage: 'Task deleted successfully',
    
    // Optimistic update - remove task immediately from lists
    optimisticUpdate: {
      queryKey: queryKeys.tasks.byProject(''), // Will be dynamically set
      updateFn: (old: any, taskId: string) => {
        if (!old) return old;
        return old.filter((task: any) => task.id !== taskId);
      }
    },
    
    // Activity logging for task deletion
    activityLog: {
      activityType: 'task_delete',
      entityType: 'task',
      getEntityName: (taskId: string, result?: { taskId: string; task: any }) => 
        result?.task?.title || 'Unknown Task',
      getEntityId: (taskId: string) => taskId,
      getMetadata: (taskId: string, result?: { taskId: string; task: any }) => {
        const task = result?.task;
        return {
          taskTitle: task?.title,
          phaseId: task?.phase_id,
          wasAssignedTo: task?.assigned_to
        };
      }
    },
    
    errorContext: {
      action: 'delete task',
      canRetry: true,
      showToast: true
    },
    
    onSuccessCallback: async ({ taskId, task }, variables) => {
      const { queryClient } = require('@tanstack/react-query');
      
      if (task) {
        // Ensure task is removed from all cached queries
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
    }
  });
}

/**
 * Hook to update task status with optimistic updates and phase timeline automation
 */
export function useUpdateTaskStatus() {
  return useStandardMutation<any, { 
    taskId: string; 
    status: 'pending' | 'in-progress' | 'completed' | 'blocked' | 'cancelled';
    progress?: number;
  }>({
    mutationFn: async ({ taskId, status, progress }) => {
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
    
    queryKeysToInvalidate: [
      ['project-consolidated', ''] // Will be filled with actual project_id
    ],
    
    // No success message for status updates (too frequent)
    
    // Optimistic update for immediate UI feedback
    optimisticUpdate: {
      queryKey: queryKeys.tasks.detail(''), // Will be dynamically set
      updateFn: (old: any, variables) => {
        if (!old) return old;
        return { ...old, status: variables.status };
      }
    },
    
    // Activity logging for status updates
    activityLog: {
      activityType: 'task_status_update', // Will be dynamically determined
      entityType: 'task',
      getEntityName: (variables, result?: any) => result?.title || 'Task',
      getEntityId: (variables, result?: any) => result?.id,
      getMetadata: (variables, result?: any) => {
        const wasCompleted = variables.status === 'completed';
        return {
          status: variables.status,
          newStatus: variables.status,
          activityType: wasCompleted ? 'task_complete' : 'task_status_update'
        };
      }
    },
    
    errorContext: {
      action: 'update task status',
      canRetry: true,
      showToast: true
    },
    
    onSuccessCallback: async (updatedTask, variables) => {
      const { queryClient } = require('@tanstack/react-query');
      
      // Invalidate all task-related caches
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tasks.byProject(updatedTask.project_id) 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tasks.byPhase(updatedTask.phase_id) 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tasks.detail(updatedTask.id) 
      });

      queryClient.invalidateQueries({
        queryKey: ['project-consolidated', updatedTask.project_id]
      });

      if (updatedTask.assigned_to) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.tasks.byUser(updatedTask.assigned_to) 
        });
      }
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
  return useStandardMutation<any, { 
    taskId: string; 
    userId: string | null;
  }>({
    mutationFn: async ({ taskId, userId }) => {
      const { data: task, error } = await supabase
        .from('be_task')
        .update({ assigned_to: userId })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return task;
    },
    
    queryKeysToInvalidate: [
      queryKeys.tasks.detail(''), // Will be filled with actual task ID
      queryKeys.tasks.byProject('') // Will be filled with actual project_id
    ],
    
    successMessage: '', // Dynamic message based on assignment/unassignment
    
    // Activity logging for task assignment/unassignment
    activityLog: {
      activityType: 'task_assign', // Will be dynamically determined
      entityType: 'task',
      getEntityName: (variables, result?: any) => result?.title || 'Task',
      getEntityId: (variables, result?: any) => result?.id,
      getMetadata: (variables, result?: any) => ({
        taskTitle: result?.title,
        phaseId: result?.phase_id,
        assignedTo: result?.assigned_to,
        isAssignment: !!variables.userId,
        activityType: variables.userId ? 'task_assign' : 'task_unassign'
      })
    },
    
    errorContext: {
      action: 'assign task',
      canRetry: true,
      showToast: true
    },
    
    onSuccessCallback: async (updatedTask, variables) => {
      const { queryClient } = require('@tanstack/react-query');
      
      // Invalidate related queries
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
      
      // Show dynamic success message
      const { ErrorHandlingService } = require('@/services/errorHandlingService');
      ErrorHandlingService.showSuccess(
        variables.userId ? 'Task assigned successfully' : 'Task unassigned successfully'
      );
    }
  });
}
