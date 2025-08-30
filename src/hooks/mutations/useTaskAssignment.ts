/**
 * Task Assignment Mutation Hooks
 * Handles individual and bulk task assignment operations with activity tracking
 */

import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useProjectMutation } from '@/hooks/useStandardMutation';

export interface AssignTaskData {
  taskId: string;
  assignedTo: string | null;
  projectId: string;
  taskTitle?: string;
}

export interface BulkAssignTasksData {
  taskIds: string[];
  assignedTo: string | null;
  projectId: string;
}

/**
 * Hook to assign/unassign a single task
 */
export function useAssignTask() {
  const { user } = useSupabaseAuth();

  return useProjectMutation<any, AssignTaskData>({
    mutationFn: async (data: AssignTaskData) => {
      const { data: task, error } = await supabase
        .from('be_task')
        .update({ 
          assigned_to: data.assignedTo,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.taskId)
        .select(`
          *,
          assigned_user:be_user!assigned_to(
            id,
            first_name,
            last_name,
            email
          )
        `)
        .single();

      if (error) throw error;
      return task;
    },
    
    queryKeysToInvalidate: [
      ['project-consolidated', ''], // Will be filled with projectId
      ['tasks', ''], // Will be filled with projectId
      ['task', ''] // Will be filled with taskId
    ],
    
    // Dynamic success message based on assignment/unassignment
    successMessage: '', // Will be set dynamically in callback
    
    // Activity logging with dynamic types
    activityLog: {
      activityType: 'task_assign', // Will be dynamically determined
      entityType: 'task',
      getEntityName: (variables, result?: any) => result?.title || 'Task',
      getEntityId: (variables, result?: any) => result?.id,
      getMetadata: async (variables, result?: any) => {
        console.log('[ACTIVITY_DEBUG] [useAssignTask] Activity logging called', {
          taskId: result?.id,
          taskTitle: result?.title,
          assignedTo: variables.assignedTo,
          projectId: variables.projectId,
          timestamp: new Date().toISOString()
        });

        // Get assignee name if assigned
        let assigneeName = 'Unassigned';
        if (variables.assignedTo && result?.assigned_user) {
          const assignee = result.assigned_user;
          assigneeName = `${assignee.first_name} ${assignee.last_name}`.trim() || assignee.email;
        }

        const isAssignment = !!variables.assignedTo;
        
        return {
          taskTitle: result?.title,
          assignedTo: variables.assignedTo,
          assigneeName,
          previousAssignee: null, // Could be enhanced to track previous assignee
          activityType: isAssignment ? 'task_assign' : 'task_unassign'
        };
      }
    },
    
    errorContext: {
      action: 'update task assignment',
      canRetry: true,
      showToast: true
    },
    
    onSuccessCallback: async (updatedTask, variables) => {
      const { queryClient } = require('@tanstack/react-query');
      
      // Invalidate specific queries with actual IDs
      queryClient.invalidateQueries({
        queryKey: ['project-consolidated', variables.projectId]
      });
      queryClient.invalidateQueries({
        queryKey: ['tasks', variables.projectId]
      });
      queryClient.invalidateQueries({
        queryKey: ['task', variables.taskId]
      });
      
      // Show dynamic success message
      const { ErrorHandlingService } = require('@/services/errorHandlingService');
      const isAssignment = !!variables.assignedTo;
      const message = isAssignment 
        ? `Task assigned successfully`
        : `Task unassigned successfully`;
      ErrorHandlingService.showSuccess(message);
    }
  });
}

/**
 * Hook to assign/unassign multiple tasks in bulk
 */
export function useBulkAssignTasks() {
  const { user } = useSupabaseAuth();

  return useProjectMutation<any[], BulkAssignTasksData>({
    mutationFn: async (data: BulkAssignTasksData) => {
      // Update all tasks in bulk
      const { data: tasks, error } = await supabase
        .from('be_task')
        .update({ 
          assigned_to: data.assignedTo,
          updated_at: new Date().toISOString()
        })
        .in('id', data.taskIds)
        .select(`
          *,
          assigned_user:be_user!assigned_to(
            id,
            first_name,
            last_name,
            email
          )
        `);

      if (error) throw error;
      return tasks || [];
    },
    
    queryKeysToInvalidate: [
      ['project-consolidated', ''], // Will be filled with projectId
      ['tasks', ''] // Will be filled with projectId
    ],
    
    // Dynamic success message based on task count and assignment/unassignment
    successMessage: '', // Will be set dynamically in callback
    
    // Activity logging for bulk operations
    activityLog: {
      activityType: 'task_assign', // Will be dynamically determined
      entityType: 'task',
      getEntityName: (variables, result?: any[]) => 
        `${result?.length || variables.taskIds.length} tasks`,
      getEntityId: (variables, result?: any[]) => variables.taskIds[0], // Use first task as reference
      getMetadata: async (variables, result?: any[]) => {
        console.log('[ACTIVITY_DEBUG] [useBulkAssignTasks] Activity logging called', {
          taskCount: result?.length || variables.taskIds.length,
          taskIds: variables.taskIds,
          assignedTo: variables.assignedTo,
          projectId: variables.projectId,
          timestamp: new Date().toISOString()
        });

        // Get assignee name if assigned
        let assigneeName = 'Unassigned';
        if (variables.assignedTo && result && result.length > 0 && result[0].assigned_user) {
          const assignee = result[0].assigned_user;
          assigneeName = `${assignee.first_name} ${assignee.last_name}`.trim() || assignee.email;
        }

        const isAssignment = !!variables.assignedTo;
        const taskCount = result?.length || variables.taskIds.length;
        
        return {
          taskCount,
          taskIds: variables.taskIds,
          taskTitles: result?.map(t => t.title) || [],
          assignedTo: variables.assignedTo,
          assigneeName,
          bulkOperation: true,
          activityType: isAssignment ? 'task_assign' : 'task_unassign'
        };
      }
    },
    
    errorContext: {
      action: 'update task assignments',
      canRetry: true,
      showToast: true
    },
    
    onSuccessCallback: async (updatedTasks, variables) => {
      const { queryClient } = require('@tanstack/react-query');
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ['project-consolidated', variables.projectId]
      });
      queryClient.invalidateQueries({
        queryKey: ['tasks', variables.projectId]
      });
      
      // Invalidate individual task queries
      variables.taskIds.forEach(taskId => {
        queryClient.invalidateQueries({
          queryKey: ['task', taskId]
        });
      });
      
      // Show dynamic success message
      const { ErrorHandlingService } = require('@/services/errorHandlingService');
      const isAssignment = !!variables.assignedTo;
      const message = isAssignment 
        ? `${updatedTasks.length} tasks assigned successfully`
        : `${updatedTasks.length} tasks unassigned successfully`;
      ErrorHandlingService.showSuccess(message);
    }
  });
}

/**
 * Hook to get task assignment statistics for workload management
 */
export function useTaskAssignmentStats(projectId: string) {
  return {
    queryKey: ['task-assignment-stats', projectId],
    queryFn: async () => {
      const { data: tasks, error } = await supabase
        .from('be_task')
        .select(`
          id,
          status,
          assigned_to,
          assigned_user:be_user!assigned_to(
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('project_id', projectId);

      if (error) throw error;

      // Calculate assignment statistics
      const stats = {
        totalTasks: tasks?.length || 0,
        assignedTasks: tasks?.filter(t => t.assigned_to).length || 0,
        unassignedTasks: tasks?.filter(t => !t.assigned_to).length || 0,
        memberWorkloads: {} as Record<string, {
          id: string;
          name: string;
          email: string;
          totalTasks: number;
          completedTasks: number;
          inProgressTasks: number;
          pendingTasks: number;
          workloadPercentage: number;
        }>
      };

      // Calculate per-member workloads
      tasks?.forEach(task => {
        if (task.assigned_to && task.assigned_user) {
          const userId = task.assigned_user.id;
          const userName = `${task.assigned_user.first_name} ${task.assigned_user.last_name}`.trim();
          
          if (!stats.memberWorkloads[userId]) {
            stats.memberWorkloads[userId] = {
              id: userId,
              name: userName || task.assigned_user.email,
              email: task.assigned_user.email,
              totalTasks: 0,
              completedTasks: 0,
              inProgressTasks: 0,
              pendingTasks: 0,
              workloadPercentage: 0
            };
          }

          const member = stats.memberWorkloads[userId];
          member.totalTasks++;

          switch (task.status?.toLowerCase()) {
            case 'completed':
              member.completedTasks++;
              break;
            case 'in-progress':
            case 'in_progress':
              member.inProgressTasks++;
              break;
            case 'pending':
              member.pendingTasks++;
              break;
          }

          // Calculate workload percentage (non-completed tasks)
          const activeTasks = member.totalTasks - member.completedTasks;
          member.workloadPercentage = Math.round((activeTasks / Math.max(member.totalTasks, 1)) * 100);
        }
      });

      return stats;
    }
  };
}