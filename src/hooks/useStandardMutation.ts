/**
 * Standard Mutation Hooks
 * Provides consistent mutation patterns with activity tracking and error handling
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { ErrorHandlingService } from '@/services/errorHandlingService';

// Types for mutation configuration
interface MutationContext {
  previousData: unknown;
  queryKey: readonly unknown[];
}

export interface OptimisticUpdate<TData = unknown, TVariables = unknown> {
  queryKey: readonly unknown[];
  updateFn: (old: TData, variables: TVariables) => TData;
}

export interface ActivityLogConfig<TVariables = unknown, TData = unknown> {
  activityType: string;
  entityType: string;
  getEntityName: (variables: TVariables, result?: TData) => string;
  getEntityId: (variables: TVariables, result?: TData) => string;
  getMetadata?: (variables: TVariables, result?: TData) => Promise<Record<string, unknown>> | Record<string, unknown>;
}

export interface ErrorContext {
  action: string;
  canRetry: boolean;
  showToast: boolean;
}

export interface StandardMutationConfig<TData = unknown, TVariables = unknown> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  queryKeysToInvalidate?: readonly (readonly unknown[])[];
  queryKeysToRemove?: readonly (readonly unknown[])[];
  successMessage?: string;
  optimisticUpdate?: OptimisticUpdate<TData, TVariables>;
  activityLog?: ActivityLogConfig<TVariables, TData>;
  errorContext?: ErrorContext;
  onSuccessCallback?: (data: TData, variables: TVariables) => Promise<void> | void;
  onErrorCallback?: (error: Error, variables: TVariables) => Promise<void> | void;
}

export interface ProjectMutationConfig<TData = unknown, TVariables = unknown> extends StandardMutationConfig<TData, TVariables> {
  projectId: string;
}

/**
 * Standard mutation hook with consistent error handling and activity tracking
 */
export function useStandardMutation<TData = unknown, TVariables = unknown>(
  config: StandardMutationConfig<TData, TVariables>
) {
  const queryClient = useQueryClient();
  const { user } = useSupabaseAuth();

  return useMutation({
    mutationFn: config.mutationFn,
    
    onMutate: async (variables: TVariables) => {
      // Handle optimistic updates
      if (config.optimisticUpdate) {
        const { queryKey, updateFn } = config.optimisticUpdate;
        
        // Cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey });
        
        // Snapshot the previous value
        const previousData = queryClient.getQueryData(queryKey);
        
        // Optimistically update to the new value
        queryClient.setQueryData(queryKey, (old: TData) => updateFn(old, variables));
        
        // Return context object with the previous data
        return { previousData, queryKey };
      }
    },
    
    onSuccess: async (data: TData, variables: TVariables, _context: MutationContext | undefined) => {
      try {
        // Invalidate queries
        if (config.queryKeysToInvalidate) {
          const invalidations = config.queryKeysToInvalidate.map(queryKey =>
            queryClient.invalidateQueries({ queryKey })
          );
          await Promise.all(invalidations);
        }
        
        // Remove queries
        if (config.queryKeysToRemove) {
          config.queryKeysToRemove.forEach(queryKey =>
            queryClient.removeQueries({ queryKey })
          );
        }
        
        // Show success message
        if (config.successMessage) {
          ErrorHandlingService.showSuccess(config.successMessage);
        }
        
        // Activity logging temporarily disabled to prevent crashes
        // TODO: Re-implement activity logging with proper project context
        if (config.activityLog && user) {
          console.log('Activity would be logged:', {
            activityType: config.activityLog.activityType,
            entityType: config.activityLog.entityType,
            entityName: config.activityLog.getEntityName(variables, data),
            entityId: config.activityLog.getEntityId(variables, data)
          });
        }
        
        // Execute success callback
        if (config.onSuccessCallback) {
          await config.onSuccessCallback(data, variables);
        }
        
      } catch (error) {
        console.error('Error in mutation success handler:', error);
      }
    },
    
    onError: async (error: Error, variables: TVariables, context: MutationContext | undefined) => {
      try {
        // Restore optimistic updates
        if (context?.previousData && context?.queryKey) {
          queryClient.setQueryData(context.queryKey, context.previousData);
        }
        
        // Handle error display
        if (config.errorContext?.showToast) {
          console.error('Mutation error:', error, {
            action: config.errorContext.action,
            canRetry: config.errorContext.canRetry
          });
        }
        
        // Execute error callback
        if (config.onErrorCallback) {
          await config.onErrorCallback(error, variables);
        }
        
      } catch (callbackError) {
        console.error('Error in mutation error handler:', callbackError);
      }
    }
  });
}

/**
 * Project-specific mutation hook with additional project context
 */
export function useProjectMutation<TData = unknown, TVariables = unknown>(
  config: ProjectMutationConfig<TData, TVariables>
) {
  return useStandardMutation(config);
}