/**
 * Standard Mutation Hook
 * Provides unified mutation handling with optimistic updates, error handling, and activity logging
 * Reduces boilerplate code across all mutation hooks
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useProjectStore } from '@/stores/projectStore';
import { logActivityAsync } from '@/utils/activityLogging';
import { ErrorHandlingService, createMutationErrorHandler } from '@/services/errorHandlingService';
import type { ActivityType } from '@/types/database';

export interface StandardMutationOptions<TData, TVariables> {
  // Core mutation function
  mutationFn: (variables: TVariables) => Promise<TData>;
  
  // Query invalidation
  queryKeysToInvalidate?: any[][];
  queryKeysToRemove?: any[][];
  
  // Messages
  successMessage?: string;
  errorMessage?: string;
  loadingMessage?: string;
  
  // Optimistic updates
  optimisticUpdate?: {
    queryKey: any[];
    updateFn: (old: any, variables: TVariables) => any;
  };
  
  // Activity logging
  activityLog?: {
    activityType: ActivityType;
    entityType: string;
    getEntityName: (variables: TVariables, result?: TData) => string;
    getEntityId?: (variables: TVariables, result?: TData) => string;
    getMetadata?: (variables: TVariables, result?: TData) => Record<string, any>;
  };
  
  // Error handling
  errorContext?: {
    action: string;
    canRetry?: boolean;
    showToast?: boolean;
  };
  
  // Callbacks
  onSuccessCallback?: (data: TData, variables: TVariables) => void | Promise<void>;
  onErrorCallback?: (error: any, variables: TVariables) => void | Promise<void>;
  
  // Override default behavior
  customOptions?: Omit<UseMutationOptions<TData, any, TVariables>, 'mutationFn'>;
}

export function useStandardMutation<TData, TVariables>({
  mutationFn,
  queryKeysToInvalidate = [],
  queryKeysToRemove = [],
  successMessage,
  errorMessage,
  optimisticUpdate,
  activityLog,
  errorContext = { action: 'perform operation', showToast: true },
  onSuccessCallback,
  onErrorCallback,
  customOptions
}: StandardMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();
  const { user } = useSupabaseAuth();
  const addOptimisticUpdate = useProjectStore(state => state.addOptimisticUpdate);
  const removeOptimisticUpdate = useProjectStore(state => state.removeOptimisticUpdate);

  return useMutation({
    mutationFn,
    
    // Optimistic updates
    onMutate: async (variables: TVariables) => {
      if (!optimisticUpdate) return {};

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: optimisticUpdate.queryKey });
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(optimisticUpdate.queryKey);
      
      // Optimistically update
      queryClient.setQueryData(optimisticUpdate.queryKey, (old: any) => 
        optimisticUpdate.updateFn(old, variables)
      );

      // Track optimistic update
      const optimisticId = `${errorContext.action}_${Date.now()}`;
      addOptimisticUpdate(optimisticId, {
        id: optimisticId,
        type: 'update',
        entity: activityLog?.entityType || 'unknown',
        data: queryClient.getQueryData(optimisticUpdate.queryKey),
        originalData: previousData,
        timestamp: Date.now()
      });

      return { previousData, optimisticId };
    },

    // Error handling
    onError: async (error: any, variables: TVariables, context: any) => {
      // Rollback optimistic update
      if (optimisticUpdate && context?.previousData) {
        queryClient.setQueryData(optimisticUpdate.queryKey, context.previousData);
      }

      // Remove optimistic update tracking
      if (context?.optimisticId) {
        removeOptimisticUpdate(context.optimisticId);
      }

      // Handle error with unified service
      const errorHandler = createMutationErrorHandler({
        ...errorContext,
        action: errorMessage || errorContext.action
      });
      errorHandler(error, variables, context);

      // Custom error callback
      if (onErrorCallback) {
        try {
          await onErrorCallback(error, variables);
        } catch (callbackError) {
          console.error('Error in onErrorCallback:', callbackError);
        }
      }
    },

    // Success handling
    onSuccess: async (data: TData, variables: TVariables, context: any) => {
      // Remove optimistic update tracking
      if (context?.optimisticId) {
        removeOptimisticUpdate(context.optimisticId);
      }

      // Invalidate queries
      for (const queryKey of queryKeysToInvalidate) {
        queryClient.invalidateQueries({ queryKey });
      }

      // Remove query data
      for (const queryKey of queryKeysToRemove) {
        queryClient.removeQueries({ queryKey });
      }

      // Show success message
      if (successMessage) {
        ErrorHandlingService.showSuccess(successMessage);
      }

      // Log activity
      if (activityLog && user) {
        logActivityAsync({
          projectId: '', // Should be provided in activityLog or variables
          activityType: activityLog.activityType,
          entityType: activityLog.entityType,
          entityName: activityLog.getEntityName(variables, data),
          entityId: activityLog.getEntityId?.(variables, data),
          userId: user.id,
          metadata: activityLog.getMetadata?.(variables, data)
        });
      }

      // Custom success callback
      if (onSuccessCallback) {
        try {
          await onSuccessCallback(data, variables);
        } catch (callbackError) {
          console.error('Error in onSuccessCallback:', callbackError);
        }
      }
    },

    // Merge custom options
    ...customOptions
  });
}

/**
 * Convenience wrapper for project-specific mutations
 */
export function useProjectMutation<TData, TVariables extends { projectId: string }>({
  activityLog,
  ...options
}: Omit<StandardMutationOptions<TData, TVariables>, 'activityLog'> & {
  activityLog?: Omit<StandardMutationOptions<TData, TVariables>['activityLog'], 'getEntityId'> & {
    getEntityId?: (variables: TVariables, result?: TData) => string;
  };
}) {
  return useStandardMutation({
    ...options,
    activityLog: activityLog ? {
      ...activityLog,
      getEntityId: activityLog.getEntityId || ((variables: TVariables) => variables.projectId)
    } : undefined
  });
}

/**
 * Convenience wrapper for file upload mutations
 */
export function useUploadMutation<TData, TVariables extends { file?: File; files?: File[] }>({
  ...options
}: StandardMutationOptions<TData, TVariables>) {
  return useStandardMutation({
    ...options,
    errorContext: {
      action: 'upload file',
      canRetry: true,
      showToast: true,
      ...options.errorContext
    }
  });
}