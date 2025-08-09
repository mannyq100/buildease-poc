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
  progress_percentage?: number;
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
      console.log('[ACTIVITY_DEBUG] [useCreateTask] onSuccess called', {
        taskId: newTask.id,
        taskTitle: variables.title,
        projectId: variables.project_id,
        phaseId: variables.phase_id,
        timestamp: new Date().toISOString()
      });
      
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

      // Fire-and-forget activity logging with comprehensive debug logging
      console.log('[ACTIVITY_DEBUG] [useCreateTask] Starting activity logging for task creation');
      
      (async () => {
        try {
          console.log('[ACTIVITY_DEBUG] [useCreateTask] Fetching auth user');
          const { data: auth, error: authError } = await supabase.auth.getUser();
          
          if (authError) {
            console.error('[ACTIVITY_DEBUG] [useCreateTask] Auth error:', authError);
            return;
          }
          
          console.log('[ACTIVITY_DEBUG] [useCreateTask] Auth user fetched successfully', {
            userId: auth?.user?.id,
            hasUser: !!auth?.user,
            userMetadata: auth?.user?.user_metadata
          });
          
          const userName = (auth?.user?.user_metadata?.full_name as string | undefined) ||
              (auth?.user?.user_metadata?.name as string | undefined) ||
              (auth?.user?.email as string | undefined);
              
          console.log('[ACTIVITY_DEBUG] [useCreateTask] Adding task creation to activity batch', {
            project_id: variables.project_id,
            activity_type: 'task_create',
            title: `Task created: ${variables.title}`,
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'task',
            entity_id: newTask.id
          });
          
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
          
          console.log('[ACTIVITY_DEBUG] [useCreateTask] Activity added to batch successfully');
          
        } catch (e) {
          console.error('[ACTIVITY_DEBUG] [useCreateTask] Activity logging failed:', {
            error: e,
            errorMessage: e instanceof Error ? e.message : String(e),
            errorStack: e instanceof Error ? e.stack : undefined,
            taskId: newTask.id,
            taskTitle: variables.title,
            projectId: variables.project_id,
            timestamp: new Date().toISOString()
          });
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
      console.log('[ACTIVITY_DEBUG] [useUpdateTask] onSuccess called', {
        taskId: updatedTask.id,
        taskTitle: updatedTask.title,
        projectId: updatedTask.project_id,
        phaseId: updatedTask.phase_id,
        updates: variables,
        timestamp: new Date().toISOString()
      });
      
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

      // Fire-and-forget activity logging with comprehensive debug logging
      console.log('[ACTIVITY_DEBUG] [useUpdateTask] Starting activity logging for task update');
      
      (async () => {
        try {
          console.log('[ACTIVITY_DEBUG] [useUpdateTask] Fetching auth user');
          const { data: auth, error: authError } = await supabase.auth.getUser();
          
          if (authError) {
            console.error('[ACTIVITY_DEBUG] [useUpdateTask] Auth error:', authError);
            return;
          }
          
          console.log('[ACTIVITY_DEBUG] [useUpdateTask] Auth user fetched successfully', {
            userId: auth?.user?.id,
            hasUser: !!auth?.user,
            userMetadata: auth?.user?.user_metadata
          });
          
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
              progress: updatedTask.progress_percentage,
              updatedFields: Object.keys(variables).filter(key => key !== 'id')
            },
            status: activityStatus
          });
          
          console.log('[ACTIVITY_DEBUG] [useUpdateTask] Activity created successfully', {
            success: !!result,
            activityId: result?.id,
            result
          });
          
        } catch (e) {
          console.error('[ACTIVITY_DEBUG] [useUpdateTask] Activity logging failed:', {
            error: e,
            errorMessage: e instanceof Error ? e.message : String(e),
            errorStack: e instanceof Error ? e.stack : undefined,
            taskId: updatedTask.id,
            taskTitle: updatedTask.title,
            projectId: updatedTask.project_id,
            timestamp: new Date().toISOString()
          });
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
      console.log('[ACTIVITY_DEBUG] [useDeleteTask] onSuccess called', {
        taskId,
        projectId: task?.project_id,
        phaseId: task?.phase_id,
        timestamp: new Date().toISOString()
      });
      
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

      // Fire-and-forget activity logging with comprehensive debug logging
      if (task?.project_id) {
        console.log('[ACTIVITY_DEBUG] [useDeleteTask] Starting activity logging for task deletion');
        
        (async () => {
          try {
            console.log('[ACTIVITY_DEBUG] [useDeleteTask] Fetching auth user');
            const { data: auth, error: authError } = await supabase.auth.getUser();
            
            if (authError) {
              console.error('[ACTIVITY_DEBUG] [useDeleteTask] Auth error:', authError);
              return;
            }
            
            console.log('[ACTIVITY_DEBUG] [useDeleteTask] Auth user fetched successfully', {
              userId: auth?.user?.id,
              hasUser: !!auth?.user,
              userMetadata: auth?.user?.user_metadata
            });
            
            const userName = (auth?.user?.user_metadata?.full_name as string | undefined) ||
                (auth?.user?.user_metadata?.name as string | undefined) ||
                (auth?.user?.email as string | undefined);
                
            const taskTitle = (task as any)?.title || 'Unknown Task';
                
            console.log('[ACTIVITY_DEBUG] [useDeleteTask] Calling activityService.createActivity', {
              project_id: task.project_id,
              activity_type: 'task_delete',
              title: `Task deleted: ${taskTitle}`,
              user_id: auth?.user?.id,
              user_name: userName,
              entity_type: 'task',
              entity_id: taskId
            });
            
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
            
            console.log('[ACTIVITY_DEBUG] [useDeleteTask] Activity created successfully', {
              success: !!result,
              activityId: result?.id,
              result
            });
            
          } catch (e) {
            console.error('[ACTIVITY_DEBUG] [useDeleteTask] Activity logging failed:', {
              error: e,
              errorMessage: e instanceof Error ? e.message : String(e),
              errorStack: e instanceof Error ? e.stack : undefined,
              taskId,
              projectId: task?.project_id,
              timestamp: new Date().toISOString()
            });
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
        .from('be_task')
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
    },
    onSuccess: async (updatedTask, variables) => {
      console.log('[ACTIVITY_DEBUG] [useUpdateTaskStatus] onSuccess called', {
        taskId: updatedTask.id,
        taskTitle: updatedTask.title,
        projectId: updatedTask.project_id,
        phaseId: updatedTask.phase_id,
        newStatus: variables.status,
        progress: variables.progress,
        timestamp: new Date().toISOString()
      });
      
      // Fire-and-forget activity logging with comprehensive debug logging
      console.log('[ACTIVITY_DEBUG] [useUpdateTaskStatus] Starting activity logging for task status update');
      
      (async () => {
        try {
          console.log('[ACTIVITY_DEBUG] [useUpdateTaskStatus] Fetching auth user');
          const { data: auth, error: authError } = await supabase.auth.getUser();
          
          if (authError) {
            console.error('[ACTIVITY_DEBUG] [useUpdateTaskStatus] Auth error:', authError);
            return;
          }
          
          console.log('[ACTIVITY_DEBUG] [useUpdateTaskStatus] Auth user fetched successfully', {
            userId: auth?.user?.id,
            hasUser: !!auth?.user,
            userMetadata: auth?.user?.user_metadata
          });
          
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
            if (variables.progress && variables.progress < 100) {
              activityDescription += ` (${variables.progress}% progress)`;
            }
          } else if (variables.status === 'in-progress') {
            activityTitle = `Task started: ${updatedTask.title}`;
            activityDescription = `Work began on "${updatedTask.title}"`;
            if (variables.progress) {
              activityDescription += ` (${variables.progress}% progress)`;
            }
          } else if (variables.status === 'blocked') {
            activityTitle = `Task blocked: ${updatedTask.title}`;
            activityDescription = `"${updatedTask.title}" has been blocked`;
          } else if (variables.status === 'cancelled') {
            activityTitle = `Task cancelled: ${updatedTask.title}`;
            activityDescription = `"${updatedTask.title}" was cancelled`;
          }
          
          const activityStatus = wasCompleted ? 'success' : 
                               variables.status === 'blocked' || variables.status === 'cancelled' ? 'warning' : 'info';
              
          console.log('[ACTIVITY_DEBUG] [useUpdateTaskStatus] Calling activityService.createActivity', {
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
              newStatus: variables.status,
              progress: variables.progress || updatedTask.progress_percentage
            },
            status: activityStatus
          });
          
          console.log('[ACTIVITY_DEBUG] [useUpdateTaskStatus] Activity created successfully', {
            success: !!result,
            activityId: result?.id,
            result
          });
          
        } catch (e) {
          console.error('[ACTIVITY_DEBUG] [useUpdateTaskStatus] Activity logging failed:', {
            error: e,
            errorMessage: e instanceof Error ? e.message : String(e),
            errorStack: e instanceof Error ? e.stack : undefined,
            taskId: updatedTask.id,
            taskTitle: updatedTask.title,
            projectId: updatedTask.project_id,
            timestamp: new Date().toISOString()
          });
        }
      })();
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
        .from('be_task')
        .update({ assigned_to: userId })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return task;
    },
    onSuccess: async (updatedTask, variables) => {
      console.log('[ACTIVITY_DEBUG] [useAssignTask] onSuccess called', {
        taskId: variables.taskId,
        taskTitle: updatedTask.title,
        projectId: updatedTask.project_id,
        assignedUserId: variables.userId,
        timestamp: new Date().toISOString()
      });
      
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

      // Fire-and-forget activity logging with comprehensive debug logging
      console.log('[ACTIVITY_DEBUG] [useAssignTask] Starting activity logging for task assignment');
      
      (async () => {
        try {
          console.log('[ACTIVITY_DEBUG] [useAssignTask] Fetching auth user');
          const { data: auth, error: authError } = await supabase.auth.getUser();
          
          if (authError) {
            console.error('[ACTIVITY_DEBUG] [useAssignTask] Auth error:', authError);
            return;
          }
          
          console.log('[ACTIVITY_DEBUG] [useAssignTask] Auth user fetched successfully', {
            userId: auth?.user?.id,
            hasUser: !!auth?.user,
            userMetadata: auth?.user?.user_metadata
          });
          
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
              
          console.log('[ACTIVITY_DEBUG] [useAssignTask] Calling activityService.createActivity', {
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
              assignedTo: updatedTask.assigned_to,
              isAssignment
            },
            status: 'info'
          });
          
          console.log('[ACTIVITY_DEBUG] [useAssignTask] Activity created successfully', {
            success: !!result,
            activityId: result?.id,
            result
          });
          
        } catch (e) {
          console.error('[ACTIVITY_DEBUG] [useAssignTask] Activity logging failed:', {
            error: e,
            errorMessage: e instanceof Error ? e.message : String(e),
            errorStack: e instanceof Error ? e.stack : undefined,
            taskId: variables.taskId,
            taskTitle: updatedTask.title,
            projectId: updatedTask.project_id,
            timestamp: new Date().toISOString()
          });
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
