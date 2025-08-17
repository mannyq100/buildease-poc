/**
 * Task Assignment Mutation Hooks
 * Handles individual and bulk task assignment operations with activity tracking
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import * as activityService from '@/services/activityService';

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
  const queryClient = useQueryClient();
  const { user } = useSupabaseAuth();

  return useMutation({
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
    onSuccess: async (updatedTask, variables) => {
      console.log('[ACTIVITY_DEBUG] [useAssignTask] onSuccess called', {
        taskId: updatedTask.id,
        taskTitle: updatedTask.title,
        assignedTo: variables.assignedTo,
        projectId: variables.projectId,
        timestamp: new Date().toISOString()
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ['project-consolidated', variables.projectId]
      });
      queryClient.invalidateQueries({
        queryKey: ['tasks', variables.projectId]
      });
      queryClient.invalidateQueries({
        queryKey: ['task', variables.taskId]
      });

      // Fire-and-forget activity logging
      (async () => {
        try {
          const { data: auth, error: authError } = await supabase.auth.getUser();
          
          if (authError) {
            console.error('[ACTIVITY_DEBUG] [useAssignTask] Auth error:', authError);
            return;
          }
          
          const userName = (auth?.user?.user_metadata?.full_name as string | undefined) ||
              (auth?.user?.user_metadata?.name as string | undefined) ||
              (auth?.user?.email as string | undefined);

          // Get assignee name if assigned
          let assigneeName = 'Unassigned';
          if (variables.assignedTo && updatedTask.assigned_user) {
            const assignee = updatedTask.assigned_user;
            assigneeName = `${assignee.first_name} ${assignee.last_name}`.trim() || assignee.email;
          }

          const isAssignment = !!variables.assignedTo;
          const activityType = isAssignment ? 'task_assign' : 'task_unassign';
          const title = isAssignment 
            ? `Task assigned: ${updatedTask.title}`
            : `Task unassigned: ${updatedTask.title}`;
          const description = isAssignment
            ? `Task "${updatedTask.title}" was assigned to ${assigneeName}`
            : `Task "${updatedTask.title}" was unassigned`;

          const result = await activityService.createActivity({
            project_id: variables.projectId,
            activity_type: activityType,
            title,
            description,
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'task',
            entity_id: updatedTask.id,
            metadata: {
              taskTitle: updatedTask.title,
              assignedTo: variables.assignedTo,
              assigneeName,
              previousAssignee: null // Could be enhanced to track previous assignee
            },
            status: 'info'
          });

          console.log('[ACTIVITY_DEBUG] [useAssignTask] Activity created successfully', {
            success: !!result,
            activityId: result?.id,
            activityType,
            taskId: updatedTask.id
          });

        } catch (e) {
          console.error('[ACTIVITY_DEBUG] [useAssignTask] Activity logging failed:', {
            error: e,
            errorMessage: e instanceof Error ? e.message : String(e),
            taskId: updatedTask.id,
            projectId: variables.projectId,
            timestamp: new Date().toISOString()
          });
        }
      })();

      // Success toast
      const isAssignment = !!variables.assignedTo;
      const message = isAssignment 
        ? `Task assigned successfully`
        : `Task unassigned successfully`;
      toast.success(message);
    },
    onError: (error: any) => {
      console.error('[useAssignTask] Error:', error);
      toast.error(`Failed to update task assignment: ${error.message}`);
    },
  });
}

/**
 * Hook to assign/unassign multiple tasks in bulk
 */
export function useBulkAssignTasks() {
  const queryClient = useQueryClient();
  const { user } = useSupabaseAuth();

  return useMutation({
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
    onSuccess: async (updatedTasks, variables) => {
      console.log('[ACTIVITY_DEBUG] [useBulkAssignTasks] onSuccess called', {
        taskCount: updatedTasks.length,
        taskIds: variables.taskIds,
        assignedTo: variables.assignedTo,
        projectId: variables.projectId,
        timestamp: new Date().toISOString()
      });

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

      // Fire-and-forget activity logging for bulk operations
      (async () => {
        try {
          const { data: auth, error: authError } = await supabase.auth.getUser();
          
          if (authError) {
            console.error('[ACTIVITY_DEBUG] [useBulkAssignTasks] Auth error:', authError);
            return;
          }
          
          const userName = (auth?.user?.user_metadata?.full_name as string | undefined) ||
              (auth?.user?.user_metadata?.name as string | undefined) ||
              (auth?.user?.email as string | undefined);

          // Get assignee name if assigned
          let assigneeName = 'Unassigned';
          if (variables.assignedTo && updatedTasks.length > 0 && updatedTasks[0].assigned_user) {
            const assignee = updatedTasks[0].assigned_user;
            assigneeName = `${assignee.first_name} ${assignee.last_name}`.trim() || assignee.email;
          }

          const isAssignment = !!variables.assignedTo;
          const activityType = isAssignment ? 'task_assign' : 'task_unassign';
          const title = isAssignment 
            ? `Bulk task assignment: ${updatedTasks.length} tasks assigned`
            : `Bulk task unassignment: ${updatedTasks.length} tasks unassigned`;
          const description = isAssignment
            ? `${updatedTasks.length} tasks were assigned to ${assigneeName}`
            : `${updatedTasks.length} tasks were unassigned`;

          const result = await activityService.createActivity({
            project_id: variables.projectId,
            activity_type: activityType,
            title,
            description,
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'task',
            entity_id: variables.taskIds[0], // Use first task as reference
            metadata: {
              taskCount: updatedTasks.length,
              taskIds: variables.taskIds,
              taskTitles: updatedTasks.map(t => t.title),
              assignedTo: variables.assignedTo,
              assigneeName,
              bulkOperation: true
            },
            status: 'info'
          });

          console.log('[ACTIVITY_DEBUG] [useBulkAssignTasks] Activity created successfully', {
            success: !!result,
            activityId: result?.id,
            activityType,
            taskCount: updatedTasks.length
          });

        } catch (e) {
          console.error('[ACTIVITY_DEBUG] [useBulkAssignTasks] Activity logging failed:', {
            error: e,
            errorMessage: e instanceof Error ? e.message : String(e),
            taskIds: variables.taskIds,
            projectId: variables.projectId,
            timestamp: new Date().toISOString()
          });
        }
      })();

      // Success toast
      const isAssignment = !!variables.assignedTo;
      const message = isAssignment 
        ? `${updatedTasks.length} tasks assigned successfully`
        : `${updatedTasks.length} tasks unassigned successfully`;
      toast.success(message);
    },
    onError: (error: any) => {
      console.error('[useBulkAssignTasks] Error:', error);
      toast.error(`Failed to update task assignments: ${error.message}`);
    },
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