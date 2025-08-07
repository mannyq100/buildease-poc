/**
 * Activity Error Boundary Hook
 * Provides graceful degradation for activity tracking failures
 * Ensures main operations continue even if activity tracking fails
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface ActivityError {
  operation: string;
  error: Error;
  timestamp: Date;
}

export function useActivityErrorBoundary() {
  const [activityErrors, setActivityErrors] = useState<ActivityError[]>([]);
  const [isActivityServiceHealthy, setIsActivityServiceHealthy] = useState(true);

  // Track activity service health
  const reportActivityError = useCallback((operation: string, error: Error) => {
    console.error(`Activity tracking failed for ${operation}:`, error);
    
    const activityError: ActivityError = {
      operation,
      error,
      timestamp: new Date()
    };

    setActivityErrors(prev => [...prev.slice(-4), activityError]); // Keep last 5 errors
    
    // If we have multiple errors in short time, mark service as unhealthy
    const recentErrors = activityErrors.filter(
      err => Date.now() - err.timestamp.getTime() < 60000 // Last minute
    );
    
    if (recentErrors.length >= 3) {
      setIsActivityServiceHealthy(false);
      toast.error('Activity tracking temporarily unavailable', {
        description: 'Your changes are still being saved, but activity history may be incomplete.'
      });
    }
  }, [activityErrors]);

  // Wrapper function that safely executes activity tracking
  const safeActivityTrack = useCallback(async <T>(
    operation: string,
    activityFunction: () => Promise<T>,
    fallbackMessage?: string
  ): Promise<T | null> => {
    try {
      const result = await activityFunction();
      
      // If successful and service was marked unhealthy, mark it as healthy again
      if (!isActivityServiceHealthy) {
        setIsActivityServiceHealthy(true);
        toast.success('Activity tracking restored');
      }
      
      return result;
    } catch (error) {
      reportActivityError(operation, error as Error);
      
      // Show fallback message if provided and service is still considered healthy
      if (fallbackMessage && isActivityServiceHealthy) {
        console.log(`Activity tracking failed but continuing: ${fallbackMessage}`);
      }
      
      return null;
    }
  }, [reportActivityError, isActivityServiceHealthy]);

  // Reset error state (useful for retry mechanisms)
  const resetActivityErrors = useCallback(() => {
    setActivityErrors([]);
    setIsActivityServiceHealthy(true);
  }, []);

  return {
    safeActivityTrack,
    reportActivityError,
    resetActivityErrors,
    isActivityServiceHealthy,
    activityErrors,
    hasRecentErrors: activityErrors.length > 0
  };
}