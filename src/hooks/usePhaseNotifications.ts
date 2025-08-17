/**
 * usePhaseNotifications - Specialized notifications for phase operations
 * Provides construction-specific toast messages with appropriate actions
 */

import { useCallback } from 'react';
import { useToast } from './useToast';

export function usePhaseNotifications() {
  const toast = useToast();

  const onPhaseStarted = useCallback((phaseName: string) => {
    toast.info(
      'Phase Started',
      `"${phaseName}" is now in progress`,
      { duration: 3000 }
    );
  }, [toast]);

  const onPhaseCompleted = useCallback((phaseName: string) => {
    toast.success(
      'Phase Completed! 🎉',
      `"${phaseName}" has been marked as completed`,
      { duration: 5000 }
    );
  }, [toast]);

  const onPhaseReopened = useCallback((phaseName: string) => {
    toast.warning(
      'Phase Reopened',
      `"${phaseName}" has been reverted to in progress`,
      { duration: 4000 }
    );
  }, [toast]);

  const onTaskStatusChange = useCallback((taskName: string, status: string, phaseName: string) => {
    const statusMessages = {
      'COMPLETED': {
        title: 'Task Completed ✅',
        description: `"${taskName}" in ${phaseName}`,
        type: 'success' as const
      },
      'IN_PROGRESS': {
        title: 'Task Started',
        description: `"${taskName}" is now in progress`,
        type: 'info' as const
      },
      'NOT_STARTED': {
        title: 'Task Reset',
        description: `"${taskName}" has been reset`,
        type: 'warning' as const
      }
    };

    const message = statusMessages[status as keyof typeof statusMessages];
    if (message) {
      toast[message.type](message.title, message.description, { duration: 3000 });
    }
  }, [toast]);

  const onPhaseUpdateError = useCallback((error: string, retryAction?: () => void) => {
    toast.error(
      'Phase Update Failed',
      error,
      { 
        duration: 0, // Don't auto-dismiss errors
        action: retryAction ? {
          label: 'Retry',
          onClick: retryAction
        } : undefined
      }
    );
  }, [toast]);

  const onBulkTaskUpdate = useCallback((count: number, action: string) => {
    toast.success(
      'Bulk Update Complete',
      `${count} tasks ${action}`,
      { duration: 3000 }
    );
  }, [toast]);

  const onPhaseAutoTransition = useCallback((
    fromStatus: string, 
    toStatus: string, 
    phaseName: string,
    reason: string
  ) => {
    const messages = {
      'PLANNING_to_IN_PROGRESS': `Started automatically because ${reason}`,
      'IN_PROGRESS_to_COMPLETED': `Completed automatically because ${reason}`,
      'COMPLETED_to_IN_PROGRESS': `Reopened because ${reason}`
    };

    const key = `${fromStatus}_to_${toStatus}` as keyof typeof messages;
    const description = messages[key] || reason;

    toast.info(
      `Phase Auto-Updated`,
      `"${phaseName}": ${description}`,
      { duration: 4000 }
    );
  }, [toast]);

  const onTimelineUpdate = useCallback((phaseName: string, updateType: 'started' | 'completed') => {
    const messages = {
      started: 'Start date recorded',
      completed: 'Completion date recorded'
    };

    toast.info(
      'Timeline Updated',
      `${phaseName}: ${messages[updateType]}`,
      { duration: 3000 }
    );
  }, [toast]);

  return {
    onPhaseStarted,
    onPhaseCompleted,
    onPhaseReopened,
    onTaskStatusChange,
    onPhaseUpdateError,
    onBulkTaskUpdate,
    onPhaseAutoTransition,
    onTimelineUpdate,
    // Expose the base toast functions
    ...toast
  };
}