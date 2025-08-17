/**
 * usePhaseStatusManager - Unified hook for managing phase status transitions
 * Consolidates all phase status logic into a single, well-organized hook
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ProjectPhase, EnhancedTask } from '@/types/projectDetails';
import { useUpdatePhase } from '@/hooks/mutations/usePhase';
import { toDbPhaseStatus } from '@/utils/core/phaseStatus';

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

export function usePhaseStatusManager(
  phase: ProjectPhase,
  tasks: EnhancedTask[]
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
  
  // Prevent multiple rapid updates
  const lastUpdateTimeRef = useRef<number>(0);

  // Memoized task metrics calculation with stable comparison
  const taskMetrics = useMemo((): TaskMetrics => {
    // Inline the normalization to avoid function dependency
    const normalizeStatus = (status: string | undefined): string => {
      if (!status) return '';
      return status.toUpperCase().replace('-', '_');
    };

    const total = tasks.length;
    const completed = tasks.filter(t => normalizeStatus(t.status) === 'COMPLETED').length;
    const inProgress = tasks.filter(t => normalizeStatus(t.status) === 'IN_PROGRESS').length;
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

  // Error handling wrapper
  const withErrorHandling = useCallback(
    (operation: () => Promise<void>) => async () => {
      try {
        setError(null); // Clear previous errors
        await operation();
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An unexpected error occurred');
        setError(error);
        setLastFailedOperation(() => operation);
        console.error('Phase operation failed:', error);
      }
    },
    []
  );

  // Action handlers with error handling
  const handleConfirmComplete = useCallback(
    withErrorHandling(async () => {
      const nowIso = new Date().toISOString();
      const timelineUpdates: Partial<ProjectPhase['timeline']> = {};
      
      if (!phaseTimelineRef.current?.actual_end) {
        timelineUpdates.actual_end = nowIso;
      }

      await updatePhase.mutateAsync({
        id: phaseIdRef.current,
        status: 'COMPLETED',
        timeline: Object.keys(timelineUpdates).length
          ? { ...(phaseTimelineRef.current || {}), ...timelineUpdates }
          : undefined,
      });

      setState(prev => ({ ...prev, showCompletePrompt: false }));
    }),
    [updatePhase, withErrorHandling]
  );

  const handleConfirmReopen = useCallback(
    withErrorHandling(async () => {
      await updatePhase.mutateAsync({
        id: phaseIdRef.current,
        status: 'IN_PROGRESS',
        // Clear actual_end; keep actual_start intact
        timeline: { ...(phaseTimelineRef.current || {}), actual_end: null },
      });

      setState(prev => ({ ...prev, showReopenPrompt: false }));
    }),
    [updatePhase, withErrorHandling]
  );

  const handleUpdateProgress = useCallback(
    withErrorHandling(async () => {
      // Determine next status based on current task metrics
      let nextStatus: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' = 'PLANNING';
      
      if (taskMetrics.allCompleted) {
        nextStatus = 'COMPLETED';
      } else if (taskMetrics.anyProgress) {
        nextStatus = 'IN_PROGRESS';
      }

      // Prepare timeline updates
      const nowIso = new Date().toISOString();
      const timelineUpdates: Partial<ProjectPhase['timeline']> = {};
      
      if (nextStatus !== 'PLANNING' && !phaseTimelineRef.current?.actual_start) {
        timelineUpdates.actual_start = nowIso;
      }
      if (nextStatus === 'COMPLETED' && !phaseTimelineRef.current?.actual_end) {
        timelineUpdates.actual_end = nowIso;
      }

      await updatePhase.mutateAsync({
        id: phaseIdRef.current,
        status: nextStatus,
        timeline: Object.keys(timelineUpdates).length
          ? { ...(phaseTimelineRef.current || {}), ...timelineUpdates }
          : undefined,
      });
    }),
    [taskMetrics.allCompleted, taskMetrics.anyProgress, updatePhase, withErrorHandling]
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

    // 2. Handle automatic IN_PROGRESS transition (only if not already updating)
    if (currentMetrics.anyProgress && 
        phaseStatus !== 'IN_PROGRESS' && 
        phaseStatus !== 'COMPLETED' &&
        !updatePhase.isPending) {
      
      // Prevent rapid fire updates - minimum 1 second between updates
      const now = Date.now();
      if (now - lastUpdateTimeRef.current < 1000) {
        return;
      }
      lastUpdateTimeRef.current = now;
      
      const nowIso = new Date().toISOString();
      const timelineUpdates: Partial<ProjectPhase['timeline']> = {};
      
      // Set actual_start only if this is the first time we have progress
      if (!phaseTimelineRef.current?.actual_start) {
        timelineUpdates.actual_start = nowIso;
      }
      
      updatePhase.mutate({
        id: phaseIdRef.current,
        status: 'IN_PROGRESS',
        timeline: Object.keys(timelineUpdates).length
          ? { ...(phaseTimelineRef.current || {}), ...timelineUpdates }
          : undefined,
      });
    }

    // 3. Handle reopening after completion
    if (prev.allCompleted && !currentMetrics.allCompleted && phaseStatus === 'COMPLETED' && !state.showReopenPrompt) {
      setState(prev => ({ ...prev, showReopenPrompt: true }));
    }

    // Update previous metrics
    prevMetricsRef.current = currentMetrics;
  }, [taskMetrics, state.hasPrompted, state.showReopenPrompt, updatePhase]);

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