/**
 * AutoTransitionContext - Global context for managing automatic phase transition indicators
 * Provides centralized state management for visual feedback on automatic status changes
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface AutoTransitionState {
  phaseId: string;
  type: 'started' | 'completed' | 'reopened';
  timestamp: number;
}

interface AutoTransitionContextValue {
  activeTransitions: Map<string, AutoTransitionState>;
  showTransition: (phaseId: string, type: 'started' | 'completed' | 'reopened') => void;
  hideTransition: (phaseId: string) => void;
  getTransition: (phaseId: string) => AutoTransitionState | undefined;
  clearAllTransitions: () => void;
}

const AutoTransitionContext = createContext<AutoTransitionContextValue | undefined>(undefined);

interface AutoTransitionProviderProps {
  children: ReactNode;
}

export function AutoTransitionProvider({ children }: AutoTransitionProviderProps) {
  const [activeTransitions, setActiveTransitions] = useState<Map<string, AutoTransitionState>>(new Map());

  const showTransition = useCallback((
    phaseId: string, 
    type: 'started' | 'completed' | 'reopened'
  ) => {
    setActiveTransitions(prev => {
      const newMap = new Map(prev);
      newMap.set(phaseId, {
        phaseId,
        type,
        timestamp: Date.now()
      });
      return newMap;
    });

    // Auto-hide after 4 seconds
    setTimeout(() => {
      setActiveTransitions(prev => {
        const newMap = new Map(prev);
        newMap.delete(phaseId);
        return newMap;
      });
    }, 4000);
  }, []);

  const hideTransition = useCallback((phaseId: string) => {
    setActiveTransitions(prev => {
      const newMap = new Map(prev);
      newMap.delete(phaseId);
      return newMap;
    });
  }, []);

  const getTransition = useCallback((phaseId: string) => {
    return activeTransitions.get(phaseId);
  }, [activeTransitions]);

  const clearAllTransitions = useCallback(() => {
    setActiveTransitions(new Map());
  }, []);

  const value: AutoTransitionContextValue = {
    activeTransitions,
    showTransition,
    hideTransition,
    getTransition,
    clearAllTransitions
  };

  return (
    <AutoTransitionContext.Provider value={value}>
      {children}
    </AutoTransitionContext.Provider>
  );
}

export function useAutoTransition() {
  const context = useContext(AutoTransitionContext);
  if (context === undefined) {
    throw new Error('useAutoTransition must be used within an AutoTransitionProvider');
  }
  return context;
}

/**
 * Optional hook that returns safe defaults if context is not available
 * Useful for components that might be used outside the provider
 */
export function useAutoTransitionSafe() {
  const context = useContext(AutoTransitionContext);
  
  const fallback: AutoTransitionContextValue = {
    activeTransitions: new Map(),
    showTransition: () => {},
    hideTransition: () => {},
    getTransition: () => undefined,
    clearAllTransitions: () => {}
  };

  return context || fallback;
}