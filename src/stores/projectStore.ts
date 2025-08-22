/**
 * Project Store - Zustand Implementation
 * Sprint 4 Day 1: Store Architecture Design
 * Manages project context, preferences, and optimistic updates
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';
// DevTools middleware removed after Sprint 4 completion
import type { 
  ProjectStore, 
  ProjectPreferences, 
  OptimisticUpdate 
} from '@/types/stores';

// =============================================================================
// DEFAULT VALUES
// =============================================================================

const defaultProjectPreferences: ProjectPreferences = {
  defaultView: 'overview',
  taskFilters: {
    status: undefined,
    priority: undefined,
    assignee: undefined,
    dateRange: undefined,
  },
  phaseFilters: {
    status: undefined,
    showCompleted: true,
  },
  displaySettings: {
    showProgressBars: true,
    showBudgetInfo: true,
    compactView: false,
    showAvatars: true,
  },
  notifications: {
    taskDeadlines: true,
    phaseCompletions: true,
    budgetAlerts: true,
  },
};

// =============================================================================
// IMMER CONFIGURATION
// =============================================================================

// Enable Map and Set support for Immer (avoid double enabling)
if (typeof enableMapSet === 'function') {
  enableMapSet();
}

// =============================================================================
// MIDDLEWARE CONFIGURATION
// =============================================================================

// Time travel debugger removed after Sprint 4 completion

// =============================================================================
// STORE IMPLEMENTATION
// =============================================================================

export const useProjectStore = create<ProjectStore>()(
  devtools(
    persist(
      immer((set, get) => {
        const enhancedSet = (updater: any, replace?: boolean, action?: string) => {
          return set(updater, replace, action);
        };

        return {
        // =============================================================================
        // STATE
        // =============================================================================
        currentProjectId: null,
        projectPreferences: {},
        optimisticUpdates: {},
        pendingMutations: new Set(),

        // =============================================================================
        // PROJECT CONTEXT ACTIONS
        // =============================================================================
        setCurrentProject: (id: string) =>
          enhancedSet((state) => {
            state.currentProjectId = id;
            // Initialize preferences for project if not exists
            if (!state.projectPreferences[id]) {
              state.projectPreferences[id] = { ...defaultProjectPreferences };
            }
          }, false, 'setCurrentProject'),

        updateProjectPreferences: (projectId: string, preferences: Partial<ProjectPreferences>) =>
          enhancedSet((state) => {
            if (!state.projectPreferences[projectId]) {
              state.projectPreferences[projectId] = { ...defaultProjectPreferences };
            }
            
            // Deep merge preferences
            const currentPrefs = state.projectPreferences[projectId];
            state.projectPreferences[projectId] = {
              ...currentPrefs,
              ...preferences,
              // Handle nested objects
              taskFilters: {
                ...currentPrefs.taskFilters,
                ...preferences.taskFilters,
              },
              phaseFilters: {
                ...currentPrefs.phaseFilters,
                ...preferences.phaseFilters,
              },
              displaySettings: {
                ...currentPrefs.displaySettings,
                ...preferences.displaySettings,
              },
              notifications: {
                ...currentPrefs.notifications,
                ...preferences.notifications,
              },
            };
          }, false, 'updateProjectPreferences'),

        // =============================================================================
        // OPTIMISTIC UPDATE ACTIONS
        // =============================================================================
        addOptimisticUpdate: (key: string, update: OptimisticUpdate) =>
          enhancedSet((state) => {
            state.optimisticUpdates[key] = update;
          }, false, 'addOptimisticUpdate'),

        removeOptimisticUpdate: (key: string) =>
          enhancedSet((state) => {
            delete state.optimisticUpdates[key];
          }, false, 'removeOptimisticUpdate'),

        rollbackOptimisticUpdate: (key: string) =>
          enhancedSet((state) => {
            const update = state.optimisticUpdates[key];
            if (update) {
              // Here you would typically trigger a revert action
              // For now, just remove the optimistic update
              delete state.optimisticUpdates[key];
              
              // In a real implementation, you might want to:
              // 1. Invalidate related queries
              // 2. Show user notification about rollback
              // 3. Log the rollback for debugging
            }
          }, false, 'rollbackOptimisticUpdate'),

        clearAllOptimisticUpdates: () =>
          enhancedSet((state) => {
            state.optimisticUpdates = {};
          }, false, 'clearAllOptimisticUpdates'),

        // =============================================================================
        // MUTATION TRACKING ACTIONS
        // =============================================================================
        addPendingMutation: (mutationId: string) =>
          enhancedSet((state) => {
            state.pendingMutations.add(mutationId);
          }, false, 'addPendingMutation'),

        removePendingMutation: (mutationId: string) =>
          enhancedSet((state) => {
            state.pendingMutations.delete(mutationId);
          }, false, 'removePendingMutation'),

        isMutationPending: (mutationId: string) => {
          const state = get();
          return state.pendingMutations.has(mutationId);
        },
        };
      }),
      {
        name: 'buildease-project-store',
        partialize: (state) => ({
          currentProjectId: state.currentProjectId,
          projectPreferences: state.projectPreferences,
        }),
        version: 1,
      }
    ),
    { name: 'buildease-project-store' }
  )
);

// =============================================================================
// TYPED SELECTORS
// =============================================================================

// Current project selectors
export const selectCurrentProjectId = (state: ProjectStore) => state.currentProjectId;
export const selectCurrentProjectPreferences = (state: ProjectStore) => {
  if (!state.currentProjectId) return defaultProjectPreferences;
  return state.projectPreferences[state.currentProjectId] || defaultProjectPreferences;
};

// Optimistic update selectors
export const selectOptimisticUpdates = (state: ProjectStore) => state.optimisticUpdates;
export const selectHasOptimisticUpdates = (state: ProjectStore) => 
  Object.keys(state.optimisticUpdates).length > 0;

// Mutation tracking selectors
export const selectPendingMutations = (state: ProjectStore) => state.pendingMutations;
export const selectHasPendingMutations = (state: ProjectStore) => 
  state.pendingMutations.size > 0;

// Project-specific preference selectors
export const selectProjectTaskFilters = (projectId: string) => (state: ProjectStore) =>
  state.projectPreferences[projectId]?.taskFilters || defaultProjectPreferences.taskFilters;

export const selectProjectPhaseFilters = (projectId: string) => (state: ProjectStore) =>
  state.projectPreferences[projectId]?.phaseFilters || defaultProjectPreferences.phaseFilters;

export const selectProjectDisplaySettings = (projectId: string) => (state: ProjectStore) =>
  state.projectPreferences[projectId]?.displaySettings || defaultProjectPreferences.displaySettings;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Get preferences for current project with fallback
export const getCurrentProjectPreferences = (): ProjectPreferences => {
  const state = useProjectStore.getState();
  if (!state.currentProjectId) return defaultProjectPreferences;
  return state.projectPreferences[state.currentProjectId] || defaultProjectPreferences;
};

// Check if any mutations are pending for race condition prevention
export const hasAnyPendingMutations = (): boolean => {
  const state = useProjectStore.getState();
  return state.pendingMutations.size > 0;
};

// Generate unique mutation ID
export const generateMutationId = (type: string, target: string): string => {
  return `${type}-${target}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// =============================================================================
// DEVELOPMENT HELPERS
// =============================================================================

if (process.env.NODE_ENV === 'development') {
  // Expose store to window for debugging
  (window as any).__projectStore__ = useProjectStore;
  
  // Add logging for state changes
  useProjectStore.subscribe((state, prevState) => {
    if (state.currentProjectId !== prevState.currentProjectId) {
      console.log('🏗️ [ProjectStore] Current project changed:', state.currentProjectId);
    }
    
    if (Object.keys(state.optimisticUpdates).length !== Object.keys(prevState.optimisticUpdates).length) {
      console.log('⚡ [ProjectStore] Optimistic updates changed:', 
        Object.keys(state.optimisticUpdates).length);
    }
    
    if (state.pendingMutations.size !== prevState.pendingMutations.size) {
      console.log('🔄 [ProjectStore] Pending mutations:', state.pendingMutations.size);
    }
  });
}