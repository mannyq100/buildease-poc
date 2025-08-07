/**
 * useRetryableQuery - Enhanced React Query wrapper with retry logic
 * Integrates RetryService with React Query for robust data fetching
 * Optimized for BuildEase construction site usage with unreliable connectivity
 */

import { useQuery, useQueryClient, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { retryService, RetryOptions } from '@/services/retryService';
import { toast } from 'sonner';

interface RetryableQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryFn' | 'retry' | 'queryKey'> {
  retryOptions?: RetryOptions;
  circuitBreakerKey?: string;
  showRetryNotifications?: boolean;
  enableManualRetry?: boolean;
  onRetrySuccess?: (attempt: number) => void;
  onRetryFailure?: (error: Error, attempts: number) => void;
}

interface RetryableQueryResult<T> extends UseQueryResult<T> {
  manualRetry: () => void;
  retryCount: number;
  isRetrying: boolean;
  canRetry: boolean;
  circuitBreakerStats?: any;
}

/**
 * Enhanced useQuery hook with advanced retry capabilities
 */
export function useRetryableQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options: RetryableQueryOptions<T> = {}
): RetryableQueryResult<T> {
  const queryClient = useQueryClient();
  const [retryCount, setRetryCount] = useState(0);
  const [isManualRetrying, setIsManualRetrying] = useState(false);

  const {
    retryOptions = {},
    circuitBreakerKey,
    showRetryNotifications = true,
    enableManualRetry = true,
    onRetrySuccess,
    onRetryFailure,
    ...queryOptions
  } = options;

  // Enhanced retry configuration for construction site usage
  const enhancedRetryOptions: RetryOptions = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    jitter: true,
    retryCondition: (error: Error) => {
      // Custom retry logic for construction management errors
      const retryablePatterns = [
        'network',
        'timeout',
        'connection',
        'offline',
        'fetch',
        '500',
        '502',
        '503',
        '504'
      ];
      
      const errorMessage = error.message.toLowerCase();
      return retryablePatterns.some(pattern => errorMessage.includes(pattern));
    },
    onRetry: (attempt: number, error: Error) => {
      setRetryCount(attempt);
      
      if (showRetryNotifications && attempt === 1) {
        toast.info(`Connection issue detected. Retrying... (${attempt}/3)`, {
          duration: 2000
        });
      }
      
      console.warn(`🔄 Query retry attempt ${attempt} for:`, queryKey, error.message);
    },
    onFailure: (error: Error, attempts: number) => {
      if (showRetryNotifications) {
        toast.error(`Unable to load data after ${attempts} attempts. Please check your connection.`, {
          duration: 5000,
          action: enableManualRetry ? {
            label: 'Retry',
            onClick: () => manualRetry()
          } : undefined
        });
      }
      
      onRetryFailure?.(error, attempts);
      console.error(`💀 Query failed after ${attempts} attempts:`, queryKey, error);
    },
    ...retryOptions
  };

  // Wrap the query function with retry logic
  const retryableQueryFn = async (): Promise<T> => {
    return retryService.executeWithRetry(
      queryFn,
      enhancedRetryOptions,
      circuitBreakerKey
    );
  };

  // Use React Query with our retryable function
  const queryResult = useQuery({
    queryKey,
    queryFn: retryableQueryFn,
    retry: false, // We handle retries ourselves
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    ...queryOptions
  });

  // Manual retry function
  const manualRetry = useCallback(async () => {
    if (!enableManualRetry || queryResult.isFetching) {
      return;
    }

    setIsManualRetrying(true);
    setRetryCount(0);

    try {
      await queryResult.refetch();
      
      if (showRetryNotifications) {
        toast.success('Data loaded successfully!');
      }
      
      onRetrySuccess?.(retryCount + 1);
    } catch (error) {
      console.error('Manual retry failed:', error);
    } finally {
      setIsManualRetrying(false);
    }
  }, [queryResult, enableManualRetry, showRetryNotifications, onRetrySuccess, retryCount]);

  // Get circuit breaker stats if available
  const circuitBreakerStats = circuitBreakerKey 
    ? retryService.getCircuitBreakerStats()[circuitBreakerKey]
    : undefined;

  // Determine if manual retry is available
  const canRetry = enableManualRetry && 
                   !queryResult.isFetching && 
                   !isManualRetrying && 
                   queryResult.isError;

  return {
    ...queryResult,
    manualRetry,
    retryCount,
    isRetrying: queryResult.isFetching || isManualRetrying,
    canRetry,
    circuitBreakerStats
  };
}

/**
 * Hook for offline-capable queries with automatic sync
 */
export function useOfflineQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options: RetryableQueryOptions<T> = {}
): RetryableQueryResult<T> {
  const offlineOptions: RetryableQueryOptions<T> = {
    ...options,
    retryOptions: {
      maxAttempts: 5,
      baseDelay: 2000,
      maxDelay: 60000,
      ...options.retryOptions
    },
    circuitBreakerKey: `offline-${queryKey.join('-')}`,
    showRetryNotifications: true,
    enableManualRetry: true
  };

  return useRetryableQuery(queryKey, queryFn, offlineOptions);
}

/**
 * Hook for critical queries that need aggressive retry
 */
export function useCriticalQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options: RetryableQueryOptions<T> = {}
): RetryableQueryResult<T> {
  const criticalOptions: RetryableQueryOptions<T> = {
    ...options,
    retryOptions: {
      maxAttempts: 5,
      baseDelay: 500,
      maxDelay: 10000,
      backoffMultiplier: 1.5,
      ...options.retryOptions
    },
    circuitBreakerKey: `critical-${queryKey.join('-')}`,
    showRetryNotifications: true,
    enableManualRetry: true
  };

  return useRetryableQuery(queryKey, queryFn, criticalOptions);
}

/**
 * Utility hook to get retry service status
 */
export function useRetryServiceStatus() {
  const [status, setStatus] = useState(() => ({
    queueStatus: retryService.getQueueStatus(),
    circuitBreakerStats: retryService.getCircuitBreakerStats()
  }));

  const refreshStatus = useCallback(() => {
    setStatus({
      queueStatus: retryService.getQueueStatus(),
      circuitBreakerStats: retryService.getCircuitBreakerStats()
    });
  }, []);

  const resetCircuitBreakers = useCallback(() => {
    retryService.resetCircuitBreakers();
    refreshStatus();
    toast.success('Circuit breakers reset successfully');
  }, [refreshStatus]);

  return {
    ...status,
    refreshStatus,
    resetCircuitBreakers
  };
}