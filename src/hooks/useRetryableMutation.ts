/**
 * useRetryableMutation - Enhanced React Query mutation wrapper with retry logic
 * Handles failed mutations with intelligent retry strategies
 * Optimized for BuildEase construction site usage
 */

import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { retryService, RetryOptions } from '@/services/retryService';
import { toast } from 'sonner';

interface RetryableMutationOptions<TData, TError, TVariables, TContext> {
  retryOptions?: RetryOptions;
  circuitBreakerKey?: string;
  showRetryNotifications?: boolean;
  enableManualRetry?: boolean;
  queueOnFailure?: boolean; // Queue failed mutations for later retry
  onRetrySuccess?: (attempt: number, data: TData) => void;
  onRetryFailure?: (error: TError, attempts: number) => void;
  // Include common mutation options
  onSuccess?: (data: TData, variables: TVariables, context: TContext | undefined) => Promise<unknown> | unknown;
  onError?: (error: TError, variables: TVariables, context: TContext | undefined) => Promise<unknown> | unknown;
  onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables, context: TContext | undefined) => Promise<unknown> | unknown;
  onMutate?: (variables: TVariables) => Promise<TContext | undefined> | TContext | undefined;
}

interface RetryableMutationResult<TData, TError, TVariables, TContext> 
  extends UseMutationResult<TData, TError, TVariables, TContext> {
  retryLastOperation: () => void;
  retryCount: number;
  isRetrying: boolean;
  canRetry: boolean;
  lastVariables?: TVariables;
  queuedOperations: string[];
}

/**
 * Enhanced useMutation hook with retry capabilities
 */
export function useRetryableMutation<TData = unknown, TError = Error, TVariables = void, TContext = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: RetryableMutationOptions<TData, TError, TVariables, TContext> = {}
): RetryableMutationResult<TData, TError, TVariables, TContext> {
  const queryClient = useQueryClient();
  const [retryCount, setRetryCount] = useState(0);
  const [isManualRetrying, setIsManualRetrying] = useState(false);
  const [lastVariables, setLastVariables] = useState<TVariables>();
  const [queuedOperations, setQueuedOperations] = useState<string[]>([]);

  const {
    retryOptions = {},
    circuitBreakerKey,
    showRetryNotifications = true,
    enableManualRetry = true,
    queueOnFailure = false,
    onRetrySuccess,
    onRetryFailure,
    onSuccess,
    onError,
    onSettled,
    onMutate
  } = options;

  // Enhanced retry configuration for mutations
  const enhancedRetryOptions: RetryOptions = {
    maxAttempts: 2, // Fewer attempts for mutations to avoid duplicate operations
    baseDelay: 1500,
    maxDelay: 15000,
    backoffMultiplier: 2,
    jitter: true,
    retryCondition: (error: Error) => {
      // Be more conservative with mutation retries
      const retryablePatterns = [
        'network',
        'timeout',
        'connection',
        '502',
        '503',
        '504'
      ];
      
      const errorMessage = error.message.toLowerCase();
      const isRetryable = retryablePatterns.some(pattern => errorMessage.includes(pattern));
      
      // Don't retry on 4xx errors (client errors)
      const isClientError = /4[0-9][0-9]/.test(error.message);
      
      return isRetryable && !isClientError;
    },
    onRetry: (attempt: number, error: Error) => {
      setRetryCount(attempt);
      
      if (showRetryNotifications && attempt === 1) {
        toast.info(`Connection issue. Retrying operation... (${attempt}/2)`, {
          duration: 2000
        });
      }
      
      console.warn(`🔄 Mutation retry attempt ${attempt}:`, error.message);
    },
    onFailure: (error: Error, attempts: number) => {
      if (showRetryNotifications) {
        const message = queueOnFailure 
          ? `Operation failed but has been queued for later retry.`
          : `Operation failed after ${attempts} attempts. Please try again.`;
          
        toast.error(message, {
          duration: 5000,
          action: enableManualRetry ? {
            label: 'Retry Now',
            onClick: () => retryLastOperation()
          } : undefined
        });
      }
      
      onRetryFailure?.(error as TError, attempts);
    },
    ...retryOptions
  };

  // Wrap the mutation function with retry logic
  const retryableMutationFn = async (variables: TVariables): Promise<TData> => {
    setLastVariables(variables);
    
    return retryService.executeWithRetry(
      () => mutationFn(variables),
      enhancedRetryOptions,
      circuitBreakerKey
    );
  };

  // Use React Query mutation with our retryable function
  const mutationResult = useMutation({
    mutationFn: retryableMutationFn,
    onSuccess: (data, variables, context) => {
      setRetryCount(0);
      onRetrySuccess?.(retryCount + 1, data);
      onSuccess?.(data, variables, context);
      
      if (showRetryNotifications && retryCount > 0) {
        toast.success('Operation completed successfully!');
      }
    },
    onError: (error, variables, context) => {
      // Queue for retry if enabled and it's a retryable error
      if (queueOnFailure && enhancedRetryOptions.retryCondition!(error as Error)) {
        const operationId = `mutation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        retryService.queueForRetry(
          operationId,
          () => mutationFn(variables),
          enhancedRetryOptions
        );
        
        setQueuedOperations(prev => [...prev, operationId]);
      }
      
      onError?.(error, variables, context);
    },
    onSettled,
    onMutate
  });

  // Manual retry function
  const retryLastOperation = useCallback(async () => {
    if (!enableManualRetry || !lastVariables || mutationResult.isPending) {
      return;
    }

    setIsManualRetrying(true);
    setRetryCount(0);

    try {
      await mutationResult.mutateAsync(lastVariables);
    } catch (error) {
      console.error('Manual retry failed:', error);
    } finally {
      setIsManualRetrying(false);
    }
  }, [mutationResult, lastVariables, enableManualRetry]);

  // Determine if manual retry is available
  const canRetry = enableManualRetry && 
                   !mutationResult.isPending && 
                   !isManualRetrying && 
                   lastVariables !== undefined &&
                   mutationResult.isError;

  return {
    ...mutationResult,
    retryLastOperation,
    retryCount,
    isRetrying: mutationResult.isPending || isManualRetrying,
    canRetry,
    lastVariables,
    queuedOperations
  };
}

/**
 * Hook for critical mutations that need aggressive retry
 */
export function useCriticalMutation<TData = unknown, TError = Error, TVariables = void, TContext = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: RetryableMutationOptions<TData, TError, TVariables, TContext> = {}
): RetryableMutationResult<TData, TError, TVariables, TContext> {
  const criticalOptions: RetryableMutationOptions<TData, TError, TVariables, TContext> = {
    ...options,
    retryOptions: {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 1.5,
      ...options.retryOptions
    },
    circuitBreakerKey: `critical-mutation-${Date.now()}`,
    showRetryNotifications: true,
    enableManualRetry: true,
    queueOnFailure: true
  };

  return useRetryableMutation(mutationFn, criticalOptions);
}

/**
 * Hook for offline-capable mutations with automatic queuing
 */
export function useOfflineMutation<TData = unknown, TError = Error, TVariables = void, TContext = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: RetryableMutationOptions<TData, TError, TVariables, TContext> = {}
): RetryableMutationResult<TData, TError, TVariables, TContext> {
  const offlineOptions: RetryableMutationOptions<TData, TError, TVariables, TContext> = {
    ...options,
    retryOptions: {
      maxAttempts: 5,
      baseDelay: 3000,
      maxDelay: 60000,
      ...options.retryOptions
    },
    circuitBreakerKey: `offline-mutation-${Date.now()}`,
    showRetryNotifications: true,
    enableManualRetry: true,
    queueOnFailure: true
  };

  return useRetryableMutation(mutationFn, offlineOptions);
}