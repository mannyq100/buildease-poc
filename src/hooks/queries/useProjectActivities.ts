/**
 * React Query hooks for project activities
 * Provides data fetching, caching, and real-time updates for project activities
 * Integrates with ProjectActivityService
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import * as activityService from '@/services/activityService';
import type { ProjectActivity, ActivityType } from '@/types/database';

interface UseProjectActivitiesOptions {
  project_id: string;
  activity_types?: ActivityType[];
  user_id?: string;
  limit?: number;
  realtime?: boolean;
}

interface CreateActivityData {
  project_id: string;
  activity_type: ActivityType;
  title: string;
  description?: string;
  user_id?: string;
  user_name?: string;
  entity_type?: string;
  entity_id?: string;
  metadata?: Record<string, unknown>;
  status?: 'success' | 'info' | 'warning' | 'error';
}

/**
 * Hook to fetch project activities with optional real-time updates
 */
export function useProjectActivities({
  project_id,
  activity_types,
  user_id,
  limit = 20,
  realtime = false
}: UseProjectActivitiesOptions) {
  const queryClient = useQueryClient();
  const queryKey = ['project-activities', project_id, { activity_types, user_id, limit }];

  const query = useQuery({
    queryKey,
    queryFn: () => activityService.getProjectActivities({
      project_id,
      activity_types,
      user_id,
      limit
    }),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!realtime || !project_id) return;

    const channel = activityService.subscribeToProjectActivities(
      project_id,
      (newActivity: ProjectActivity) => {
        // Update the query cache with the new activity
        queryClient.setQueryData<ProjectActivity[]>(queryKey, (oldData) => {
          if (!oldData) return [newActivity];
          
          // Check if activity already exists to avoid duplicates
          const exists = oldData.some(activity => activity.id === newActivity.id);
          if (exists) return oldData;
          
          // Add new activity to the beginning of the list
          const updatedData = [newActivity, ...oldData];
          
          // Maintain the limit
          return limit ? updatedData.slice(0, limit) : updatedData;
        });

        // Also invalidate related queries
        queryClient.invalidateQueries({ 
          queryKey: ['project-activities', project_id],
          exact: false 
        });
      }
    );

    return () => {
      channel.unsubscribe();
    };
  }, [project_id, realtime, queryClient, queryKey, limit]);

  return query;
}

/**
 * Hook to fetch recent activities (last 7 days)
 */
export function useRecentProjectActivities(projectId: string, limit = 10, realtime = true) {
  return useProjectActivities({
    project_id: projectId,
    limit,
    realtime
  });
}

/**
 * Hook to create a new project activity
 */
export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateActivityData) => 
      activityService.createActivity(data),
    onSuccess: (newActivity, variables) => {
      if (!newActivity) return;

      // Update all relevant activity queries
      queryClient.invalidateQueries({ 
        queryKey: ['project-activities', variables.project_id],
        exact: false 
      });

      // Optimistically update the cache
      const queryKey = ['project-activities', variables.project_id];
      queryClient.setQueryData<ProjectActivity[]>(queryKey, (oldData) => {
        if (!oldData) return [newActivity];
        return [newActivity, ...oldData];
      });
    },
    onError: (error) => {
      console.error('Error creating activity:', error);
    }
  });
}

/**
 * Hook to get activity statistics
 */
export function useActivityStats(projectId: string, days = 30) {
  return useQuery({
    queryKey: ['activity-stats', projectId, days],
    queryFn: () => activityService.getActivityStats(projectId, days),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Automated activity tracking hooks for common operations
 */
export function useActivityTrackers() {
  const createActivity = useCreateActivity();

  return {
    trackDocumentUpload: (
      projectId: string,
      documentId: string,
      documentName: string,
      documentType: string,
      userId?: string,
      userName?: string
    ) => activityService.trackDocumentUpload(
      projectId, documentId, documentName, documentType, userId, userName
    ),

    trackDocumentDelete: (
      projectId: string,
      documentName: string,
      userId?: string,
      userName?: string
    ) => activityService.trackDocumentDelete(
      projectId, documentName, userId, userName
    ),

    trackExpenseCreate: (
      projectId: string,
      expenseId: string,
      title: string,
      amount: number,
      currency: string,
      userId?: string,
      userName?: string
    ) => activityService.trackExpenseCreate(
      projectId, expenseId, title, amount, currency, userId, userName
    ),

    trackTaskComplete: (
      projectId: string,
      taskId: string,
      taskTitle: string,
      phaseId?: string,
      userId?: string,
      userName?: string
    ) => activityService.trackTaskComplete(
      projectId, taskId, taskTitle, phaseId, userId, userName
    ),

    trackStatusChange: (
      projectId: string,
      title: string,
      description: string,
      status: 'success' | 'info' | 'warning' | 'error' = 'info',
      userId?: string,
      userName?: string,
      metadata?: Record<string, unknown>
    ) => activityService.trackStatusChange(
      projectId, title, description, status, userId, userName, metadata
    ),

    trackBudgetUpdate: (
      projectId: string,
      previousAmount: number,
      newAmount: number,
      currency: string,
      userId?: string,
      userName?: string
    ) => activityService.trackBudgetUpdate(
      projectId, previousAmount, newAmount, currency, userId, userName
    ),

    // Generic activity creation
    createActivity: createActivity.mutateAsync
  };
}

/**
 * Hook for filtering activities by type with easy presets
 */
export function useFilteredActivities(projectId: string, filter: 'all' | 'documents' | 'expenses' | 'tasks' | 'status' | ActivityType[]) {
  let activity_types: ActivityType[] | undefined;

  if (Array.isArray(filter)) {
    activity_types = filter;
  } else if (filter === 'documents') {
    activity_types = ['document_upload', 'document_delete'];
  } else if (filter === 'expenses') {
    activity_types = ['expense_create', 'expense_update', 'expense_delete', 'budget_update'];
  } else if (filter === 'tasks') {
    activity_types = ['task_create', 'task_update', 'task_complete'];
  } else if (filter === 'status') {
    activity_types = ['status_change', 'phase_update', 'project_update'];
  }
  // 'all' uses undefined to fetch all types

  return useProjectActivities({
    project_id: projectId,
    activity_types,
    realtime: true
  });
}