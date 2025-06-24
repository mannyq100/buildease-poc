/**
 * usePlanLoading Hook
 * Centralized loading state management for all plan operations
 * Provides consistent loading feedback across all views
 */

import { useState, useCallback, useRef } from 'react';

export interface LoadingState {
  // Global loading states
  isGenerating: boolean;
  isSaving: boolean;
  isDistributing: boolean;
  
  // Entity-specific loading states
  phases: Record<string, boolean>;
  tasks: Record<string, boolean>;
  materials: Record<string, boolean>;
  
  // Operation-specific loading states
  operations: Record<string, boolean>;
}

export interface LoadingActions {
  // Global loading actions
  setGenerating: (loading: boolean) => void;
  setSaving: (loading: boolean) => void;
  setDistributing: (loading: boolean) => void;
  
  // Entity-specific loading actions
  setPhaseLoading: (phaseId: string, loading: boolean) => void;
  setTaskLoading: (taskId: string, loading: boolean) => void;
  setMaterialLoading: (materialId: string, loading: boolean) => void;
  
  // Operation-specific loading actions
  setOperationLoading: (operation: string, loading: boolean) => void;
  
  // Utility actions
  clearAllLoading: () => void;
  isAnyLoading: () => boolean;
}

const initialLoadingState: LoadingState = {
  isGenerating: false,
  isSaving: false,
  isDistributing: false,
  phases: {},
  tasks: {},
  materials: {},
  operations: {}
};

export function usePlanLoading() {
  const [loadingState, setLoadingState] = useState<LoadingState>(initialLoadingState);
  const loadingTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  // Helper to clear timeout
  const clearLoadingTimeout = useCallback((key: string) => {
    if (loadingTimeouts.current[key]) {
      clearTimeout(loadingTimeouts.current[key]);
      delete loadingTimeouts.current[key];
    }
  }, []);

  // Helper to set loading with auto-clear timeout
  const setLoadingWithTimeout = useCallback((
    updateFn: () => void,
    timeoutKey: string,
    timeoutMs: number = 10000 // 10 second timeout by default
  ) => {
    updateFn();
    
    // Clear any existing timeout for this key
    clearLoadingTimeout(timeoutKey);
    
    // Set new timeout to auto-clear loading state
    loadingTimeouts.current[timeoutKey] = setTimeout(() => {
      setLoadingState(prev => {
        const newState = { ...prev };
        // Auto-clear based on timeout key pattern
        if (timeoutKey.includes('phase-')) {
          const phaseId = timeoutKey.replace('phase-', '');
          delete newState.phases[phaseId];
        } else if (timeoutKey.includes('task-')) {
          const taskId = timeoutKey.replace('task-', '');
          delete newState.tasks[taskId];
        } else if (timeoutKey.includes('material-')) {
          const materialId = timeoutKey.replace('material-', '');
          delete newState.materials[materialId];
        } else if (timeoutKey.includes('operation-')) {
          const operation = timeoutKey.replace('operation-', '');
          delete newState.operations[operation];
        }
        return newState;
      });
      delete loadingTimeouts.current[timeoutKey];
    }, timeoutMs);
  }, [clearLoadingTimeout]);

  const actions: LoadingActions = {
    // Global loading actions
    setGenerating: useCallback((loading: boolean) => {
      setLoadingState(prev => ({ ...prev, isGenerating: loading }));
      if (loading) {
        setLoadingWithTimeout(() => {}, 'generating');
      } else {
        clearLoadingTimeout('generating');
      }
    }, [setLoadingWithTimeout, clearLoadingTimeout]),

    setSaving: useCallback((loading: boolean) => {
      setLoadingState(prev => ({ ...prev, isSaving: loading }));
      if (loading) {
        setLoadingWithTimeout(() => {}, 'saving');
      } else {
        clearLoadingTimeout('saving');
      }
    }, [setLoadingWithTimeout, clearLoadingTimeout]),

    setDistributing: useCallback((loading: boolean) => {
      setLoadingState(prev => ({ ...prev, isDistributing: loading }));
      if (loading) {
        setLoadingWithTimeout(() => {}, 'distributing');
      } else {
        clearLoadingTimeout('distributing');
      }
    }, [setLoadingWithTimeout, clearLoadingTimeout]),

    // Entity-specific loading actions
    setPhaseLoading: useCallback((phaseId: string, loading: boolean) => {
      const timeoutKey = `phase-${phaseId}`;
      setLoadingWithTimeout(() => {
        setLoadingState(prev => ({
          ...prev,
          phases: loading 
            ? { ...prev.phases, [phaseId]: true }
            : { ...prev.phases, [phaseId]: false }
        }));
      }, timeoutKey);
      
      if (!loading) {
        clearLoadingTimeout(timeoutKey);
      }
    }, [setLoadingWithTimeout, clearLoadingTimeout]),

    setTaskLoading: useCallback((taskId: string, loading: boolean) => {
      const timeoutKey = `task-${taskId}`;
      setLoadingWithTimeout(() => {
        setLoadingState(prev => ({
          ...prev,
          tasks: loading 
            ? { ...prev.tasks, [taskId]: true }
            : { ...prev.tasks, [taskId]: false }
        }));
      }, timeoutKey);
      
      if (!loading) {
        clearLoadingTimeout(timeoutKey);
      }
    }, [setLoadingWithTimeout, clearLoadingTimeout]),

    setMaterialLoading: useCallback((materialId: string, loading: boolean) => {
      const timeoutKey = `material-${materialId}`;
      setLoadingWithTimeout(() => {
        setLoadingState(prev => ({
          ...prev,
          materials: loading 
            ? { ...prev.materials, [materialId]: true }
            : { ...prev.materials, [materialId]: false }
        }));
      }, timeoutKey);
      
      if (!loading) {
        clearLoadingTimeout(timeoutKey);
      }
    }, [setLoadingWithTimeout, clearLoadingTimeout]),

    // Operation-specific loading actions
    setOperationLoading: useCallback((operation: string, loading: boolean) => {
      const timeoutKey = `operation-${operation}`;
      setLoadingWithTimeout(() => {
        setLoadingState(prev => ({
          ...prev,
          operations: loading 
            ? { ...prev.operations, [operation]: true }
            : { ...prev.operations, [operation]: false }
        }));
      }, timeoutKey);
      
      if (!loading) {
        clearLoadingTimeout(timeoutKey);
      }
    }, [setLoadingWithTimeout, clearLoadingTimeout]),

    // Utility actions
    clearAllLoading: useCallback(() => {
      // Clear all timeouts
      Object.keys(loadingTimeouts.current).forEach(key => {
        clearTimeout(loadingTimeouts.current[key]);
      });
      loadingTimeouts.current = {};
      
      setLoadingState(initialLoadingState);
    }, []),

    isAnyLoading: useCallback(() => {
      return loadingState.isGenerating ||
             loadingState.isSaving ||
             loadingState.isDistributing ||
             Object.values(loadingState.phases).some(Boolean) ||
             Object.values(loadingState.tasks).some(Boolean) ||
             Object.values(loadingState.materials).some(Boolean) ||
             Object.values(loadingState.operations).some(Boolean);
    }, [loadingState])
  };

  // Cleanup timeouts on unmount
  const cleanup = useCallback(() => {
    Object.values(loadingTimeouts.current).forEach(timeout => {
      clearTimeout(timeout);
    });
    loadingTimeouts.current = {};
  }, []);

  return {
    loadingState,
    actions,
    cleanup
  };
}

export default usePlanLoading;