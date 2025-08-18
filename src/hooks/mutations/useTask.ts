import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'sonner';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import * as activityService from '@/services/activityService';

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
    onSuccess: async (newTask, variables) => {
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

      // Fire-and-forget activity logging
      (async () => {
        try {
          const { data: auth, error: authError } = await supabase.auth.getUser();
          
          if (authError) {
            console.error('Failed to get auth user for activity logging:', authError);
            return;
          }
          
          const userName = (auth?.user?.user_metadata?.full_name as string | undefined) ||
              (auth?.user?.user_metadata?.name as string | undefined) ||
              (auth?.user?.email as string | undefined);
          
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
          
          const priorityText = variables.priority && variables.priority !== 'medium' 
            ? ` (${variables.priority} priority)` 
            : '';
          
          const phaseText = phaseContext ? ` in ${phaseContext}` : '';
          
          // Use batching for task creation to reduce noise when multiple tasks are created
          await activityService.createBatchedActivity({
            project_id: variables.project_id,
            activity_type: 'task_create',
            title: `New task created${phaseText}: ${variables.title}`,
            description: `Task "${variables.title}"${priorityText} was added${phaseText}`,
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'task',
            entity_id: newTask.id,
            metadata: {
              taskTitle: variables.title,
              description: variables.description,
              phaseId: variables.phase_id,
              phaseName: phaseContext,
              priority: variables.priority || 'medium',
              status: variables.status || 'pending',
              assignedTo: variables.assigned_to,
              dueDate: variables.due_date,
              estimatedHours: variables.estimated_hours
            },
            status: 'success'
          });
          
        } catch (e) {
          console.error('Failed to create activity for task creation:', e);
        }
      })();

      toast.success('Task created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating task:', error);
      toast.error(error.message || 'Failed to create task');
    }
  });
}

/**
 * Hook to update an existing task with activity tracking support
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();

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
    onSuccess: async (updatedTask, variables) => {
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

      // Fire-and-forget activity logging
      (async () => {
        try {
          const { data: auth, error: authError } = await supabase.auth.getUser();
          
          if (authError) {
            console.error('Failed to get auth user for activity logging:', authError);
            return;
          }
          
          const userName = (auth?.user?.user_metadata?.full_name as string | undefined) ||
              (auth?.user?.user_metadata?.name as string | undefined) ||
              (auth?.user?.email as string | undefined);
              
          // Get phase name for better context
          let phaseContext = '';
          try {
            const { data: phaseData } = await supabase
              .from('be_phase')
              .select('name')
              .eq('id', updatedTask.phase_id)
              .single();
            phaseContext = phaseData?.name || '';
          } catch (e) {
            console.warn('Could not fetch phase name for activity');
          }
          
          // Determine what changed for more specific messaging
          const updatedFields = Object.keys(variables).filter(key => key !== 'id');
          
          // Determine activity type and message based on status changes
          const wasCompleted = variables.status === 'completed';
          const activityType = wasCompleted ? 'task_complete' : 'task_update';
          
          let activityTitle = `Task modified: ${updatedTask.title}`;
          let activityDescription = `Task "${updatedTask.title}" was updated`;
          
          if (wasCompleted) {
            activityTitle = `Task completed: ${updatedTask.title}`;
            activityDescription = `Task "${updatedTask.title}" has been marked as completed`;
          } else if (updatedFields.includes('priority')) {
            activityTitle = `Task priority changed: ${updatedTask.title}`;
            activityDescription = `"${updatedTask.title}" priority updated to ${updatedTask.priority}`;
          } else if (updatedFields.includes('due_date')) {
            const dueDate = updatedTask.due_date ? new Date(updatedTask.due_date).toLocaleDateString() : 'unset';
            activityTitle = `Task due date updated: ${updatedTask.title}`;
            activityDescription = `"${updatedTask.title}" due date set to ${dueDate}`;
          } else if (updatedFields.includes('assigned_to')) {
            activityTitle = updatedTask.assigned_to 
              ? `Task assigned: ${updatedTask.title}`
              : `Task unassigned: ${updatedTask.title}`;
            activityDescription = updatedTask.assigned_to
              ? `"${updatedTask.title}" was assigned to a team member`
              : `"${updatedTask.title}" was unassigned`;
          } else if (updatedFields.includes('status') && !wasCompleted) {
            activityTitle = `Task status changed: ${updatedTask.title}`;
            activityDescription = `"${updatedTask.title}" status changed to ${updatedTask.status}`;
          }
          
          const activityStatus = wasCompleted ? 'success' : 'info';
              
          console.log('[ACTIVITY_DEBUG] [useUpdateTask] Calling activityService.createActivity', {
            project_id: updatedTask.project_id,
            activity_type: activityType,
            title: activityTitle,
            description: activityDescription,
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'task',
            entity_id: updatedTask.id
          });
          
          const result = await activityService.createActivity({
            project_id: updatedTask.project_id,
            activity_type: activityType,
            title: activityTitle,
            description: activityDescription,
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'task',
            entity_id: updatedTask.id,
            metadata: {
              taskTitle: updatedTask.title,
              phaseId: updatedTask.phase_id,
              priority: updatedTask.priority,
              status: updatedTask.status,
              assignedTo: updatedTask.assigned_to,
              dueDate: updatedTask.due_date,
              estimatedHours: updatedTask.estimated_hours,
              actualHours: updatedTask.actual_hours,
              updatedFields: Object.keys(variables).filter(key => key !== 'id')
            },
            status: activityStatus
          });
          
        } catch (e) {
          console.error('Failed to create activity for task update:', e);
        }
      })();

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
        .from('be_task')
        .select('project_id, phase_id, assigned_to')
        .eq('id', taskId)
        .single();

      const { error } = await supabase
        .from('be_task')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      return { taskId, task };
    },
    onSuccess: async ({ taskId, task }) => {      
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

      // Fire-and-forget activity logging
      if (task?.project_id) {
        (async () => {
          try {
            const { data: auth, error: authError } = await supabase.auth.getUser();
            
            if (authError) {
              console.error('Failed to get auth user for activity logging:', authError);
              return;
            }
            
            const userName = (auth?.user?.user_metadata?.full_name as string | undefined) ||
                (auth?.user?.user_metadata?.name as string | undefined) ||
                (auth?.user?.email as string | undefined);
                
            const taskTitle = (task as any)?.title || 'Unknown Task';
            
            const result = await activityService.createActivity({
              project_id: task.project_id,
              activity_type: 'task_delete',
              title: `Task deleted: ${taskTitle}`,
              description: `Task "${taskTitle}" was removed from the project`,
              user_id: auth?.user?.id,
              user_name: userName,
              entity_type: 'task',
              entity_id: taskId,
              metadata: {
                taskTitle,
                phaseId: task.phase_id,
                wasAssignedTo: task.assigned_to
              },
              status: 'warning'
            });
            
          } catch (e) {
            console.error('Failed to create activity for task deletion:', e);
          }
        })();
      }

      toast.success('Task deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting task:', error);
      toast.error(error.message || 'Failed to delete task');
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
      
      // Fire-and-forget activity logging
      (async () => {
        try {
          const { data: auth, error: authError } = await supabase.auth.getUser();
          
          if (authError) {
            console.error('Failed to get auth user for activity logging:', authError);
            return;
          }
          
          const userName = (auth?.user?.user_metadata?.full_name as string | undefined) ||
              (auth?.user?.user_metadata?.name as string | undefined) ||
              (auth?.user?.email as string | undefined);
              
          // Determine activity type and message based on status
          const wasCompleted = variables.status === 'completed';
          const activityType = wasCompleted ? 'task_complete' : 'task_status_update';
          
          let activityTitle = `Task status changed: ${updatedTask.title}`;
          let activityDescription = `"${updatedTask.title}" status changed to ${variables.status}`;
          
          if (wasCompleted) {
            activityTitle = `Task completed: ${updatedTask.title}`;
            activityDescription = `Task "${updatedTask.title}" has been completed`;
          } else if (variables.status === 'in-progress') {
            activityTitle = `Task started: ${updatedTask.title}`;
            activityDescription = `Work began on "${updatedTask.title}"`;
          } else if (variables.status === 'blocked') {
            activityTitle = `Task blocked: ${updatedTask.title}`;
            activityDescription = `"${updatedTask.title}" has been blocked`;
          } else if (variables.status === 'cancelled') {
            activityTitle = `Task cancelled: ${updatedTask.title}`;
            activityDescription = `"${updatedTask.title}" was cancelled`;
          }
          
          const activityStatus = wasCompleted ? 'success' : 
                               variables.status === 'blocked' || variables.status === 'cancelled' ? 'warning' : 'info';
          
          const result = await activityService.createActivity({
            project_id: updatedTask.project_id,
            activity_type: activityType,
            title: activityTitle,
            description: activityDescription,
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'task',
            entity_id: updatedTask.id,
            metadata: {
              taskTitle: updatedTask.title,
              phaseId: updatedTask.phase_id,
              newStatus: variables.status
            },
            status: activityStatus
          });
          
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

      // Fire-and-forget activity logging
      (async () => {
        try {
          const { data: auth, error: authError } = await supabase.auth.getUser();
          
          if (authError) {
            console.error('Failed to get auth user for activity logging:', authError);
            return;
          }
          
          const userName = (auth?.user?.user_metadata?.full_name as string | undefined) ||
              (auth?.user?.user_metadata?.name as string | undefined) ||
              (auth?.user?.email as string | undefined);
              
          const isAssignment = !!variables.userId;
          const activityType = isAssignment ? 'task_assign' : 'task_unassign';
          const activityTitle = isAssignment 
            ? `Task assigned: ${updatedTask.title}` 
            : `Task unassigned: ${updatedTask.title}`;
          const activityDescription = isAssignment
            ? `Task "${updatedTask.title}" was assigned to a team member`
            : `Task "${updatedTask.title}" was unassigned`;
          
          const result = await activityService.createActivity({
            project_id: updatedTask.project_id,
            activity_type: activityType,
            title: activityTitle,
            description: activityDescription,
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'task',
            entity_id: updatedTask.id,
            metadata: {
              taskTitle: updatedTask.title,
              phaseId: updatedTask.phase_id,
              assignedTo: updatedTask.assigned_to,
              isAssignment
            },
            status: 'info'
          });
          
        } catch (e) {
          console.error('Failed to create activity for task assignment:', e);
        }
      })();

      toast.success(variables.userId ? 'Task assigned successfully' : 'Task unassigned successfully');
    },
    onError: (error: any) => {
      console.error('Error assigning task:', error);
      toast.error(error.message || 'Failed to assign task');
    }
  });
}
