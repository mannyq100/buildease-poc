/**
 * usePhaseNotifications - Simplified notifications for phase operations
 * Uses shadcn toast for consistent notifications
 */

import { useCallback } from 'react';
import { useToast } from './use-toast';

export function usePhaseNotifications() {
  const { toast } = useToast();

  const onPhaseStarted = useCallback((phaseName: string) => {
    toast({
      title: 'Phase Started',
      description: `"${phaseName}" is now in progress`,
    });
  }, [toast]);

  const onPhaseCompleted = useCallback((phaseName: string) => {
    toast({
      title: 'Phase Completed! 🎉',
      description: `"${phaseName}" has been marked as completed`,
    });
  }, [toast]);

  const onPhaseReopened = useCallback((phaseName: string) => {
    toast({
      title: 'Phase Reopened',
      description: `"${phaseName}" has been reverted to in progress`,
    });
  }, [toast]);

  const onTaskStatusChange = useCallback((taskName: string, status: string, phaseName: string) => {
    const statusMessages = {
      'COMPLETED': {
        title: 'Task Completed ✅',
        description: `"${taskName}" in ${phaseName}`,
      },
      'IN_PROGRESS': {
        title: 'Task Started',
        description: `"${taskName}" is now in progress`,
      },
      'NOT_STARTED': {
        title: 'Task Reset',
        description: `"${taskName}" has been reset`,
      }
    };

    const message = statusMessages[status as keyof typeof statusMessages];
    if (message) {
      toast(message);
    }
  }, [toast]);

  const onPhaseUpdateError = useCallback((error: string) => {
    toast({
      title: 'Phase Update Failed',
      description: error,
      variant: 'destructive',
    });
  }, [toast]);

  const onBulkTaskUpdate = useCallback((count: number, action: string) => {
    toast({
      title: 'Bulk Update Complete',
      description: `${count} tasks ${action}`,
    });
  }, [toast]);

  // Return simplified interface that works with the custom toast system
  return {
    onPhaseStarted,
    onPhaseCompleted,
    onPhaseReopened,
    onTaskStatusChange,
    onPhaseUpdateError,
    onBulkTaskUpdate,
    // Legacy compatibility for existing code
    toasts: [],
    removeToast: () => {},
  };
}