/**
 * UI Store - Zustand Implementation
 * Sprint 4 Day 1: Store Architecture Design
 * Manages UI state, modals, selections, filters, and view states
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';
// DevTools middleware removed after Sprint 4 completion
import type { 
  UIStore, 
  TaskFilters, 
  PhaseFilters,
  AutoTransitionState
} from '@/types/stores';

// =============================================================================
// DEFAULT VALUES
// =============================================================================

const defaultTaskFilters: TaskFilters = {
  status: [],
  priority: [],
  assignee: [],
  dueDateRange: { start: null, end: null },
  searchTerm: '',
};

const defaultPhaseFilters: PhaseFilters = {
  status: [],
  showCompleted: true,
  showOnlyOverdue: false,
  budgetRange: { min: 0, max: 100000 },
  searchTerm: '',
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

// =============================================================================
// STORE IMPLEMENTATION
// =============================================================================

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // =============================================================================
        // STATE
        // =============================================================================
        modals: {},
        selectedTasks: new Set(),
        selectedPhases: new Set(),
        selectedTeamMembers: new Set(),
        taskFilters: { ...defaultTaskFilters },
        phaseFilters: { ...defaultPhaseFilters },
        sidebarCollapsed: false,
        activeTab: 'overview',
        currentView: 'overview',
        isLoading: {},
        errors: {},
        autoTransitions: new Map(),

        // =============================================================================
        // MODAL MANAGEMENT ACTIONS
        // =============================================================================
        openModal: (modalId: string) =>
          set((state) => {
            state.modals[modalId] = true;
          }),

        closeModal: (modalId: string) =>
          set((state) => {
            state.modals[modalId] = false;
          }),

        toggleModal: (modalId: string) =>
          set((state) => {
            state.modals[modalId] = !state.modals[modalId];
          }),

        closeAllModals: () =>
          set((state) => {
            Object.keys(state.modals).forEach(modalId => {
              state.modals[modalId] = false;
            });
          }),

        // =============================================================================
        // SELECTION MANAGEMENT ACTIONS
        // =============================================================================
        toggleTaskSelection: (taskId: string) =>
          set((state) => {
            if (state.selectedTasks.has(taskId)) {
              state.selectedTasks.delete(taskId);
            } else {
              state.selectedTasks.add(taskId);
            }
          }),

        selectAllTasks: (taskIds: string[]) =>
          set((state) => {
            state.selectedTasks = new Set(taskIds);
          }),

        clearTaskSelection: () =>
          set((state) => {
            state.selectedTasks.clear();
          }),

        togglePhaseSelection: (phaseId: string) =>
          set((state) => {
            if (state.selectedPhases.has(phaseId)) {
              state.selectedPhases.delete(phaseId);
            } else {
              state.selectedPhases.add(phaseId);
            }
          }),

        selectAllPhases: (phaseIds: string[]) =>
          set((state) => {
            state.selectedPhases = new Set(phaseIds);
          }),

        clearPhaseSelection: () =>
          set((state) => {
            state.selectedPhases.clear();
          }),

        toggleTeamMemberSelection: (memberId: string) =>
          set((state) => {
            if (state.selectedTeamMembers.has(memberId)) {
              state.selectedTeamMembers.delete(memberId);
            } else {
              state.selectedTeamMembers.add(memberId);
            }
          }),

        clearAllSelections: () =>
          set((state) => {
            state.selectedTasks.clear();
            state.selectedPhases.clear();
            state.selectedTeamMembers.clear();
          }),

        // =============================================================================
        // FILTER MANAGEMENT ACTIONS
        // =============================================================================
        setTaskFilters: (filters: Partial<TaskFilters>) =>
          set((state) => {
            state.taskFilters = {
              ...state.taskFilters,
              ...filters,
              // Handle nested objects properly
              dueDateRange: {
                ...state.taskFilters.dueDateRange,
                ...filters.dueDateRange,
              },
            };
          }),

        resetTaskFilters: () =>
          set((state) => {
            state.taskFilters = { ...defaultTaskFilters };
          }),

        setPhaseFilters: (filters: Partial<PhaseFilters>) =>
          set((state) => {
            state.phaseFilters = {
              ...state.phaseFilters,
              ...filters,
              // Handle nested objects properly
              budgetRange: {
                ...state.phaseFilters.budgetRange,
                ...filters.budgetRange,
              },
            };
          }),

        resetPhaseFilters: () =>
          set((state) => {
            state.phaseFilters = { ...defaultPhaseFilters };
          }),

        resetAllFilters: () =>
          set((state) => {
            state.taskFilters = { ...defaultTaskFilters };
            state.phaseFilters = { ...defaultPhaseFilters };
          }),

        // =============================================================================
        // VIEW MANAGEMENT ACTIONS
        // =============================================================================
        setSidebarCollapsed: (collapsed: boolean) =>
          set((state) => {
            state.sidebarCollapsed = collapsed;
          }),

        toggleSidebar: () =>
          set((state) => {
            state.sidebarCollapsed = !state.sidebarCollapsed;
          }),

        setActiveTab: (tab: string) =>
          set((state) => {
            state.activeTab = tab;
          }),

        setCurrentView: (view: UIStore['currentView']) =>
          set((state) => {
            state.currentView = view;
            // Clear selections when changing views
            state.selectedTasks.clear();
            state.selectedPhases.clear();
            state.selectedTeamMembers.clear();
          }),

        // =============================================================================
        // LOADING STATE MANAGEMENT ACTIONS
        // =============================================================================
        setLoading: (key: string, loading: boolean) =>
          set((state) => {
            if (loading) {
              state.isLoading[key] = true;
            } else {
              delete state.isLoading[key];
            }
          }),

        clearAllLoading: () =>
          set((state) => {
            state.isLoading = {};
          }),

        // =============================================================================
        // ERROR STATE MANAGEMENT ACTIONS
        // =============================================================================
        setError: (key: string, error: string | null) =>
          set((state) => {
            if (error) {
              state.errors[key] = error;
            } else {
              delete state.errors[key];
            }
          }),

        clearError: (key: string) =>
          set((state) => {
            delete state.errors[key];
          }),

        clearAllErrors: () =>
          set((state) => {
            state.errors = {};
          }),

        // =============================================================================
        // AUTO TRANSITION MANAGEMENT ACTIONS
        // =============================================================================
        setAutoTransition: (phaseId: string, transition: AutoTransitionState) =>
          set((state) => {
            state.autoTransitions.set(phaseId, transition);
          }),

        removeAutoTransition: (phaseId: string) =>
          set((state) => {
            state.autoTransitions.delete(phaseId);
          }),

        getAutoTransition: (phaseId: string) => {
          const state = get();
          return state.autoTransitions.get(phaseId);
        },

        clearAutoTransitions: () =>
          set((state) => {
            state.autoTransitions.clear();
          }),
      })),
      {
        name: 'buildease-ui-store',
        partialize: (state) => ({
          sidebarCollapsed: state.sidebarCollapsed,
          currentView: state.currentView,
          taskFilters: state.taskFilters,
          phaseFilters: state.phaseFilters,
          activeTab: state.activeTab,
        }),
        version: 1,
      }
    ),
    // DevTools removed after Sprint 4 completion
  )
);

// =============================================================================
// TYPED SELECTORS
// =============================================================================

// Modal selectors
export const selectModalState = (modalId: string) => (state: UIStore) => 
  Boolean(state.modals[modalId]);
export const selectAnyModalOpen = (state: UIStore) => 
  Object.values(state.modals).some(Boolean);

// Selection selectors (raw Set access - prefer these for performance)
export const selectSelectedTasksSet = (state: UIStore) => state.selectedTasks;
export const selectSelectedPhasesSet = (state: UIStore) => state.selectedPhases;
export const selectSelectedTeamMembersSet = (state: UIStore) => state.selectedTeamMembers;

// Array selectors (use sparingly, prefer Set-based operations)
// Note: These create new arrays on each call - use React.useMemo() when needed
export const selectSelectedTasks = (state: UIStore) => Array.from(state.selectedTasks);
export const selectSelectedPhases = (state: UIStore) => Array.from(state.selectedPhases);
export const selectSelectedTeamMembers = (state: UIStore) => Array.from(state.selectedTeamMembers);
export const selectHasTaskSelections = (state: UIStore) => state.selectedTasks.size > 0;
export const selectHasPhaseSelections = (state: UIStore) => state.selectedPhases.size > 0;
export const selectHasAnySelections = (state: UIStore) => 
  state.selectedTasks.size > 0 || state.selectedPhases.size > 0 || state.selectedTeamMembers.size > 0;

// Filter selectors
export const selectTaskFilters = (state: UIStore) => state.taskFilters;
export const selectPhaseFilters = (state: UIStore) => state.phaseFilters;
export const selectHasActiveTaskFilters = (state: UIStore) => {
  const filters = state.taskFilters;
  return (
    filters.status.length > 0 ||
    filters.priority.length > 0 ||
    filters.assignee.length > 0 ||
    filters.dueDateRange.start !== null ||
    filters.dueDateRange.end !== null ||
    filters.searchTerm.length > 0
  );
};
export const selectHasActivePhaseFilters = (state: UIStore) => {
  const filters = state.phaseFilters;
  return (
    filters.status.length > 0 ||
    !filters.showCompleted ||
    filters.showOnlyOverdue ||
    filters.budgetRange.min > 0 ||
    filters.budgetRange.max < 100000 ||
    filters.searchTerm.length > 0
  );
};

// View selectors
export const selectCurrentView = (state: UIStore) => state.currentView;
export const selectActiveTab = (state: UIStore) => state.activeTab;
export const selectSidebarCollapsed = (state: UIStore) => state.sidebarCollapsed;

// Loading state selectors
export const selectIsLoading = (key: string) => (state: UIStore) => Boolean(state.isLoading[key]);
export const selectAnyLoading = (state: UIStore) => Object.keys(state.isLoading).length > 0;

// Error state selectors
export const selectError = (key: string) => (state: UIStore) => state.errors[key] || null;
export const selectHasAnyErrors = (state: UIStore) => Object.keys(state.errors).length > 0;
export const selectAllErrors = (state: UIStore) => state.errors;

// Auto transition selectors
export const selectAutoTransitions = (state: UIStore) => state.autoTransitions;
export const selectAutoTransition = (phaseId: string) => (state: UIStore) => 
  state.autoTransitions.get(phaseId);
export const selectHasAutoTransitions = (state: UIStore) => state.autoTransitions.size > 0;
export const selectAutoTransitionsByType = (type: AutoTransitionState['type']) => (state: UIStore) =>
  Array.from(state.autoTransitions.values()).filter(t => t.type === type);

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Check if a specific modal is open
export const isModalOpen = (modalId: string): boolean => {
  const state = useUIStore.getState();
  return Boolean(state.modals[modalId]);
};

// Check if a task is selected
export const isTaskSelected = (taskId: string): boolean => {
  const state = useUIStore.getState();
  return state.selectedTasks.has(taskId);
};

// Check if a phase is selected
export const isPhaseSelected = (phaseId: string): boolean => {
  const state = useUIStore.getState();
  return state.selectedPhases.has(phaseId);
};

// Get count of selected items
export const getSelectedItemsCount = () => {
  const state = useUIStore.getState();
  return {
    tasks: state.selectedTasks.size,
    phases: state.selectedPhases.size,
    teamMembers: state.selectedTeamMembers.size,
    total: state.selectedTasks.size + state.selectedPhases.size + state.selectedTeamMembers.size,
  };
};

// =============================================================================
// DEVELOPMENT HELPERS
// =============================================================================

if (process.env.NODE_ENV === 'development') {
  // Expose store to window for debugging
  (window as any).__uiStore__ = useUIStore;
  
  // Add logging for state changes
  useUIStore.subscribe((state, prevState) => {
    if (state.currentView !== prevState.currentView) {
      console.log('👁️ [UIStore] Current view changed:', state.currentView);
    }
    
    if (state.selectedTasks.size !== prevState.selectedTasks.size) {
      console.log('✅ [UIStore] Task selection changed:', state.selectedTasks.size);
    }
    
    if (Object.keys(state.modals).length !== Object.keys(prevState.modals).length) {
      console.log('🪟 [UIStore] Modals changed:', Object.keys(state.modals));
    }
  });
}