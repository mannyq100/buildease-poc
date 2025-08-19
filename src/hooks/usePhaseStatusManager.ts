/**
 * usePhaseStatusManager - Unified hook for managing phase status transitions
 * Consolidates all phase status logic into a single, well-organized hook
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ProjectPhase, EnhancedTask } from '@/types/projectDetails';
import { useUpdatePhase } from '@/hooks/mutations/usePhase';
import { 
  toDbPhaseStatus, 
  calculatePhaseStatusFromTasks, 
  toDbTaskStatus,
  normalizePhaseStatusTransition 
} from '@/utils/core/dataNormalization';

interface TaskMetrics {
  total: number;
  completed: number;
  inProgress: number;
  anyProgress: boolean;
  allCompleted: boolean;
  hasChanged: boolean;
}

interface PhaseStatusState {
  showCompletePrompt: boolean;
  showReopenPrompt: boolean;
  hasPrompted: boolean;
}

interface PhaseStatusActions {
  handleConfirmComplete: () => Promise<void>;
  handleConfirmReopen: () => Promise<void>;
  handleUpdateProgress: () => Promise<void>;
  setShowCompletePrompt: (show: boolean) => void;
  setShowReopenPrompt: (show: boolean) => void;
}

interface UsePhaseStatusManagerReturn {
  state: PhaseStatusState;
  actions: PhaseStatusActions;
  taskMetrics: TaskMetrics;
  isUpdating: boolean;
  error: Error | null;
  retryLastOperation: () => void;
}

interface PhaseNotifications {
  onPhaseAutoTransition?: (fromStatus: string, toStatus: string, phaseName: string, reason: string) => void;
  onTimelineUpdate?: (phaseName: string, updateType: 'started' | 'completed') => void;
}

interface AutoTransitionCallbacks {
  showTransition?: (phaseId: string, type: 'started' | 'completed' | 'reopened') => void;
}

export function usePhaseStatusManager(
  phase: ProjectPhase,
  tasks: EnhancedTask[],
  notifications?: PhaseNotifications,
  autoTransition?: AutoTransitionCallbacks
): UsePhaseStatusManagerReturn {
  // Local state for UI prompts
  const [state, setState] = useState<PhaseStatusState>({
    showCompletePrompt: false,
    showReopenPrompt: false,
    hasPrompted: false
  });

  // Error handling state
  const [error, setError] = useState<Error | null>(null);
  const [lastFailedOperation, setLastFailedOperation] = useState<(() => Promise<void>) | null>(null);

  // Track previous metrics to detect changes
  const prevMetricsRef = useRef<TaskMetrics>();
  const updatePhase = useUpdatePhase();
  
  // CRITICAL: Prevent multiple rapid updates and concurrent mutations
  const lastUpdateTimeRef = useRef<number>(0);
  const mutationInProgressRef = useRef<boolean>(false);
  const pendingMutationRef = useRef<Promise<void> | null>(null);
  
  // Debouncing for rapid status changes (500ms)
  const DEBOUNCE_DELAY = 500;

  // Helper function to prepare mutation state (DRY principle)
  const prepareMutationState = useCallback((debounceMultiplier: number = 1) => {
    const now = Date.now();
    const requiredDelay = DEBOUNCE_DELAY * debounceMultiplier;
    
    if (now - lastUpdateTimeRef.current < requiredDelay) {
      return { canProceed: false };
    }
    
    mutationInProgressRef.current = true;
    lastUpdateTimeRef.current = now;
    return { canProceed: true };
  }, []);

  // Memoized task metrics calculation with stable comparison
  const taskMetrics = useMemo((): TaskMetrics => {
    const total = tasks.length;
    const completed = tasks.filter(t => toDbTaskStatus(t.status) === 'COMPLETED').length;
    const inProgress = tasks.filter(t => toDbTaskStatus(t.status) === 'IN_PROGRESS').length;
    const anyProgress = inProgress > 0 || completed > 0;
    const allCompleted = total > 0 && completed === total;
    
    // Check if metrics have changed from previous calculation
    const prev = prevMetricsRef.current;
    const hasChanged = !prev || 
      prev.total !== total ||
      prev.completed !== completed ||
      prev.inProgress !== inProgress;

    return {
      total,
      completed,
      inProgress,
      anyProgress,
      allCompleted,
      hasChanged
    };
  }, [tasks]);

  // ENHANCED: Error handling wrapper with concurrency protection
  const withErrorHandling = useCallback(
    (operation: () => Promise<void>) => async () => {
      try {
        // CRITICAL: Check if mutation is already in progress
        if (updatePhase.isPending || mutationInProgressRef.current) {
          console.warn('Phase mutation already in progress, skipping duplicate request');
          return;
        }
        
        // Use helper to prepare mutation state
        const { canProceed } = prepareMutationState();
        if (!canProceed) {
          console.warn('Phase mutation debounced, too rapid updates');
          return;
        }
        
        setError(null); // Clear previous errors
        
        const mutationPromise = operation();
        pendingMutationRef.current = mutationPromise;
        
        await mutationPromise;
        
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An unexpected error occurred');
        setError(error);
        setLastFailedOperation(() => operation);
        console.error('Phase operation failed:', error);
      } finally {
        mutationInProgressRef.current = false;
        pendingMutationRef.current = null;
      }
    },
    [updatePhase.isPending, prepareMutationState]
  );

  // ENHANCED: Action handlers with optimistic updates and rollback
  const handleConfirmComplete = useCallback(
    withErrorHandling(async () => {
      // Store previous state for potential rollback
      const previousState = { ...state };
      const previousPhaseData = {
        status: phaseStatusRef.current,
        timeline: { ...phaseTimelineRef.current }
      };
      
      const nowIso = new Date().toISOString().split('T')[0]; // Use date only for consistency
      const timelineUpdates: Partial<ProjectPhase['timeline']> = {};
      
      if (!phaseTimelineRef.current?.actual_end) {
        timelineUpdates.actual_end = nowIso;
      }

      try {
        // Optimistically update local state
        setState(prev => ({ ...prev, showCompletePrompt: false }));
        
        await updatePhase.mutateAsync({
          id: phaseIdRef.current,
          status: 'COMPLETED',
          timeline: Object.keys(timelineUpdates).length
            ? { ...(phaseTimelineRef.current || {}), ...timelineUpdates }
            : undefined,
        });
        
        // Notify about successful completion
        if (notifications?.onPhaseAutoTransition) {
          notifications.onPhaseAutoTransition(
            previousPhaseData.status,
            'COMPLETED',
            phase.name,
            'Manual completion confirmation'
          );
        }
        
      } catch (error) {
        // ROLLBACK: Restore previous state on failure
        setState(previousState);
        throw error; // Re-throw to be handled by withErrorHandling
      }
    }),
    [updatePhase, withErrorHandling, state, phase.name, notifications]
  );

  const handleConfirmReopen = useCallback(
    withErrorHandling(async () => {
      // Store previous state for potential rollback
      const previousState = { ...state };
      const previousPhaseData = {
        status: phaseStatusRef.current,
        timeline: { ...phaseTimelineRef.current }
      };
      
      try {
        // Optimistically update local state
        setState(prev => ({ ...prev, showReopenPrompt: false }));
        
        await updatePhase.mutateAsync({
          id: phaseIdRef.current,
          status: 'IN_PROGRESS',
          // Clear actual_end; keep actual_start intact
          timeline: { ...(phaseTimelineRef.current || {}), actual_end: null },
        });
        
        // Notify about successful reopening
        if (notifications?.onPhaseAutoTransition) {
          notifications.onPhaseAutoTransition(
            previousPhaseData.status,
            'IN_PROGRESS',
            phase.name,
            'Manual reopen confirmation'
          );
        }
        
      } catch (error) {
        // ROLLBACK: Restore previous state on failure
        setState(previousState);
        throw error; // Re-throw to be handled by withErrorHandling
      }
    }),
    [updatePhase, withErrorHandling, state, phase.name, notifications]
  );

  const handleUpdateProgress = useCallback(
    withErrorHandling(async () => {
      // Store previous state for potential rollback
      const previousPhaseData = {
        status: phaseStatusRef.current,
        timeline: { ...phaseTimelineRef.current }
      };
      
      // Calculate next status based on task data using centralized logic
      const nextStatus = calculatePhaseStatusFromTasks(tasks);
      const currentStatus = toDbPhaseStatus(phaseStatusRef.current);
      
      // Validate transition is allowed
      const transition = normalizePhaseStatusTransition(currentStatus, nextStatus);
      if (!transition.isValid) {
        console.warn(`Invalid phase status transition from ${transition.fromStatus} to ${transition.toStatus}`);
        return;
      }
      
      // Skip update if status hasn't changed
      if (transition.fromStatus === transition.toStatus) {
        return;
      }

      // Prepare timeline updates
      const nowIso = new Date().toISOString();
      const timelineUpdates: Partial<ProjectPhase['timeline']> = {};
      
      if (nextStatus !== 'PLANNING' && !phaseTimelineRef.current?.actual_start) {
        timelineUpdates.actual_start = nowIso;
      }
      if (nextStatus === 'COMPLETED' && !phaseTimelineRef.current?.actual_end) {
        // If both start and end are being set to the same time (instant completion),
        // add 1ms to end time to ensure end > start for timeline consistency
        const endTime = timelineUpdates.actual_start ? 
          new Date(Date.now() + 1).toISOString() : nowIso;
        timelineUpdates.actual_end = endTime;
      }

      try {
        await updatePhase.mutateAsync({
          id: phaseIdRef.current,
          status: nextStatus,
          timeline: Object.keys(timelineUpdates).length
            ? { ...(phaseTimelineRef.current || {}), ...timelineUpdates }
            : undefined,
        });
        
        // Notify about successful automatic update
        if (notifications?.onPhaseAutoTransition) {
          notifications.onPhaseAutoTransition(
            previousPhaseData.status,
            nextStatus,
            phase.name,
            'Automatic status update based on task progress'
          );
        }
        
      } catch (error) {
        // This error will be handled by withErrorHandling wrapper
        throw error;
      }
    }),
    [tasks, updatePhase, withErrorHandling, phase.name, notifications]
  );

  // Stable phase status and timeline refs to prevent unnecessary re-renders
  const phaseStatusRef = useRef(phase.status);
  const phaseTimelineRef = useRef(phase.timeline);
  const phaseIdRef = useRef(phase.id);
  
  // Update refs when phase changes
  useEffect(() => {
    phaseStatusRef.current = phase.status;
    phaseTimelineRef.current = phase.timeline;
    phaseIdRef.current = phase.id;
  }, [phase.status, phase.timeline, phase.id]);

  // Auto-transition notification callbacks
  const notifyAutoTransition = useCallback((
    fromStatus: string,
    toStatus: string,
    reason: string,
    timelineUpdates: Partial<ProjectPhase['timeline']>
  ) => {
    // Call notification function if available
    if (notifications?.onPhaseAutoTransition) {
      notifications.onPhaseAutoTransition(fromStatus, toStatus, phase.name, reason);
    }

    // Notify about timeline updates
    if (notifications?.onTimelineUpdate) {
      if (timelineUpdates.actual_start && !phaseTimelineRef.current?.actual_start) {
        notifications.onTimelineUpdate(phase.name, 'started');
      }
      if (timelineUpdates.actual_end && !phaseTimelineRef.current?.actual_end) {
        notifications.onTimelineUpdate(phase.name, 'completed');
      }
    }

    // Log for debugging (can be removed in production)
    console.log(`🔄 Phase "${phase.name}" transitioned: ${fromStatus} → ${toStatus} (${reason})`);
  }, [phase.name, notifications]);

  // Unified effect for all phase status transitions (with optimized dependencies)
  useEffect(() => {
    const prev = prevMetricsRef.current;
    const currentMetrics = taskMetrics;
    
    // Skip if this is the first render or no changes
    if (!prev || !currentMetrics.hasChanged) {
      prevMetricsRef.current = currentMetrics;
      return;
    }

    // Convert phase status to canonical DB format for comparison
    const phaseStatus = toDbPhaseStatus(String(phaseStatusRef.current || ''));

    // 1. Handle automatic completion prompt
    if (currentMetrics.allCompleted && phaseStatus !== 'COMPLETED' && !state.hasPrompted) {
      setState(prev => ({ 
        ...prev, 
        showCompletePrompt: true, 
        hasPrompted: true 
      }));
    }

    // 2. Handle automatic status transitions based on task data
    const suggestedStatus = calculatePhaseStatusFromTasks(tasks);
    if (suggestedStatus !== phaseStatus && !updatePhase.isPending && !mutationInProgressRef.current) {
      
      // Validate the transition is allowed
      const transition = normalizePhaseStatusTransition(phaseStatus, suggestedStatus);
      if (!transition.isValid) {
        return;
      }
      
      // Use helper to prepare mutation state for auto-transitions (2x debounce multiplier)
      const { canProceed } = prepareMutationState(2);
      if (!canProceed) {
        return;
      }
      
      const nowIso = new Date().toISOString();
      const timelineUpdates: Partial<ProjectPhase['timeline']> = {};
      
      // Set actual_start when moving to IN_PROGRESS or COMPLETED
      if ((suggestedStatus === 'IN_PROGRESS' || suggestedStatus === 'COMPLETED') && 
          !phaseTimelineRef.current?.actual_start) {
        timelineUpdates.actual_start = nowIso;
      }
      
      // Set actual_end when completing
      if (suggestedStatus === 'COMPLETED' && !phaseTimelineRef.current?.actual_end) {
        // If both start and end are being set to the same time (instant completion),
        // add 1ms to end time to ensure end > start for better timeline visualization
        const endTime = timelineUpdates.actual_start ? 
          new Date(Date.now() + 1).toISOString() : nowIso;
        timelineUpdates.actual_end = endTime;
      }

      // Generate context-aware reason for the transition
      const getTransitionReason = () => {
        if (phaseStatus === 'PLANNING' && suggestedStatus === 'IN_PROGRESS') {
          return currentMetrics.inProgress > 0 
            ? `${currentMetrics.inProgress} task${currentMetrics.inProgress > 1 ? 's' : ''} started`
            : 'first task was started';
        }
        if (phaseStatus === 'IN_PROGRESS' && suggestedStatus === 'COMPLETED') {
          return `all ${currentMetrics.total} task${currentMetrics.total > 1 ? 's' : ''} completed`;
        }
        if (phaseStatus === 'COMPLETED' && suggestedStatus === 'IN_PROGRESS') {
          return 'a completed task was reopened';
        }
        return 'task status changed';
      };

      // Notify about automatic transition
      notifyAutoTransition(phaseStatus, suggestedStatus, getTransitionReason(), timelineUpdates);

      // Show visual transition indicator
      if (autoTransition?.showTransition) {
        const transitionType = suggestedStatus === 'IN_PROGRESS' ? 'started' :
                             suggestedStatus === 'COMPLETED' ? 'completed' : 'reopened';
        autoTransition.showTransition(phase.id, transitionType);
      }
      
      // Use async mutation with proper error handling
      updatePhase.mutateAsync({
        id: phaseIdRef.current,
        status: suggestedStatus,
        timeline: Object.keys(timelineUpdates).length
          ? { ...(phaseTimelineRef.current || {}), ...timelineUpdates }
          : undefined,
      }).catch((error) => {
        console.error('Auto-transition failed:', error);
        setError(error instanceof Error ? error : new Error('Auto-transition failed'));
      }).finally(() => {
        mutationInProgressRef.current = false;
      });
    }

    // 3. Handle reopening after completion
    if (prev.allCompleted && !currentMetrics.allCompleted && phaseStatus === 'COMPLETED' && !state.showReopenPrompt) {
      setState(prev => ({ ...prev, showReopenPrompt: true }));
    }

    // Update previous metrics
    prevMetricsRef.current = currentMetrics;
  }, [taskMetrics, tasks, state.hasPrompted, state.showReopenPrompt, updatePhase, notifyAutoTransition, autoTransition, phase.id]);

  // Cleanup effect to handle component unmount during mutations
  useEffect(() => {
    return () => {
      // Cancel any pending mutations on unmount
      if (pendingMutationRef.current) {
        console.warn('Component unmounting with pending mutation, cancelling...');
        mutationInProgressRef.current = false;
        pendingMutationRef.current = null;
      }
    };
  }, []);

  // Retry function for failed operations
  const retryLastOperation = useCallback(async () => {
    if (lastFailedOperation) {
      await lastFailedOperation();
      setLastFailedOperation(null);
    }
  }, [lastFailedOperation]);

  const actions: PhaseStatusActions = {
    handleConfirmComplete,
    handleConfirmReopen,
    handleUpdateProgress,
    setShowCompletePrompt: (show) => setState(prev => ({ ...prev, showCompletePrompt: show })),
    setShowReopenPrompt: (show) => setState(prev => ({ ...prev, showReopenPrompt: show }))
  };

  return {
    state,
    actions,
    taskMetrics,
    isUpdating: updatePhase.isPending,
    error,
    retryLastOperation
  };
}