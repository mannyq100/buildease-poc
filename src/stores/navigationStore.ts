/**
 * Navigation Store - Zustand Implementation
 * Sprint 4 Day 1: Store Architecture Design
 * Manages navigation history, breadcrumbs, and recent projects
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
// DevTools middleware removed after Sprint 4 completion
import type { NavigationStore } from '@/types/stores';

// =============================================================================
// CONFIGURATION
// =============================================================================

const MAX_HISTORY_SIZE = 50;
const MAX_RECENT_PROJECTS = 10;

// =============================================================================
// MIDDLEWARE CONFIGURATION
// =============================================================================

// const persistenceConfig = createNavigationStorePersistence();

// =============================================================================
// STORE IMPLEMENTATION
// =============================================================================

export const useNavigationStore = create<NavigationStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // =============================================================================
        // STATE
        // =============================================================================
        navigationHistory: [],
        currentHistoryIndex: -1,
        breadcrumbs: [],
        recentProjects: [],

        // =============================================================================
        // HISTORY MANAGEMENT ACTIONS
        // =============================================================================
        pushToHistory: (path: string) =>
          set((state) => {
            // Don't add duplicate consecutive paths
            if (state.navigationHistory[state.currentHistoryIndex] === path) {
              return;
            }

            // If we're not at the end of history, remove everything after current index
            if (state.currentHistoryIndex < state.navigationHistory.length - 1) {
              state.navigationHistory = state.navigationHistory.slice(0, state.currentHistoryIndex + 1);
            }

            // Add new path
            state.navigationHistory.push(path);
            state.currentHistoryIndex = state.navigationHistory.length - 1;

            // Maintain max history size
            if (state.navigationHistory.length > MAX_HISTORY_SIZE) {
              state.navigationHistory.shift();
              state.currentHistoryIndex--;
            }
          }),

        goBack: () => {
          const state = get();
          if (state.currentHistoryIndex > 0) {
            set((draft) => {
              draft.currentHistoryIndex--;
            });
            return state.navigationHistory[state.currentHistoryIndex - 1];
          }
          return null;
        },

        goForward: () => {
          const state = get();
          if (state.currentHistoryIndex < state.navigationHistory.length - 1) {
            set((draft) => {
              draft.currentHistoryIndex++;
            });
            return state.navigationHistory[state.currentHistoryIndex + 1];
          }
          return null;
        },

        canGoBack: () => {
          const state = get();
          return state.currentHistoryIndex > 0;
        },

        canGoForward: () => {
          const state = get();
          return state.currentHistoryIndex < state.navigationHistory.length - 1;
        },

        // =============================================================================
        // BREADCRUMB MANAGEMENT ACTIONS
        // =============================================================================
        setBreadcrumbs: (breadcrumbs) =>
          set((state) => {
            state.breadcrumbs = breadcrumbs;
          }),

        addBreadcrumb: (breadcrumb) =>
          set((state) => {
            // Check if breadcrumb already exists (avoid duplicates)
            const exists = state.breadcrumbs.some(b => b.path === breadcrumb.path);
            if (!exists) {
              state.breadcrumbs.push(breadcrumb);
            }
          }),

        // =============================================================================
        // RECENT PROJECTS MANAGEMENT ACTIONS
        // =============================================================================
        addRecentProject: (project) =>
          set((state) => {
            // Remove existing entry for this project
            state.recentProjects = state.recentProjects.filter(p => p.id !== project.id);
            
            // Add to front
            state.recentProjects.unshift({
              ...project,
              lastVisited: new Date(),
            });

            // Maintain max recent projects
            if (state.recentProjects.length > MAX_RECENT_PROJECTS) {
              state.recentProjects = state.recentProjects.slice(0, MAX_RECENT_PROJECTS);
            }
          }),

        removeRecentProject: (projectId) =>
          set((state) => {
            state.recentProjects = state.recentProjects.filter(p => p.id !== projectId);
          }),

        clearRecentProjects: () =>
          set((state) => {
            state.recentProjects = [];
          }),
      })),
      {
        name: 'buildease-navigation-store',
        partialize: (state) => ({
          recentProjects: state.recentProjects,
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

// History selectors
export const selectNavigationHistory = (state: NavigationStore) => state.navigationHistory;
export const selectCurrentHistoryIndex = (state: NavigationStore) => state.currentHistoryIndex;
export const selectCurrentPath = (state: NavigationStore) => 
  state.navigationHistory[state.currentHistoryIndex];
export const selectCanGoBack = (state: NavigationStore) => state.currentHistoryIndex > 0;
export const selectCanGoForward = (state: NavigationStore) => 
  state.currentHistoryIndex < state.navigationHistory.length - 1;

// Breadcrumb selectors
export const selectBreadcrumbs = (state: NavigationStore) => state.breadcrumbs;
export const selectCurrentBreadcrumb = (state: NavigationStore) => 
  state.breadcrumbs[state.breadcrumbs.length - 1];

// Recent projects selectors
export const selectRecentProjects = (state: NavigationStore) => 
  state.recentProjects.sort((a, b) => b.lastVisited.getTime() - a.lastVisited.getTime());
export const selectRecentProjectById = (projectId: string) => (state: NavigationStore) =>
  state.recentProjects.find(p => p.id === projectId);

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Get breadcrumb path for current location
export const generateBreadcrumbsFromPath = (path: string): NavigationStore['breadcrumbs'] => {
  const segments = path.split('/').filter(Boolean);
  const breadcrumbs: NavigationStore['breadcrumbs'] = [];
  
  // Home
  breadcrumbs.push({ label: 'Home', path: '/', icon: 'home' });
  
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Generate human-readable labels
    let label = segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    let icon: string | undefined;
    
    // Special cases for known routes
    if (segment === 'projects') {
      label = 'Projects';
      icon = 'folder';
    } else if (segment === 'project') {
      label = 'Project';
      icon = 'building';
    } else if (segment === 'phases') {
      label = 'Phases';
      icon = 'layers';
    } else if (segment === 'tasks') {
      label = 'Tasks';
      icon = 'check-square';
    } else if (segment === 'team') {
      label = 'Team';
      icon = 'users';
    } else if (segment === 'budget') {
      label = 'Budget';
      icon = 'dollar-sign';
    }
    
    breadcrumbs.push({ label, path: currentPath, icon });
  });
  
  return breadcrumbs;
};

// Update recent projects from project data
export const updateRecentProjectFromData = (project: { id: string; name: string }) => {
  const { addRecentProject } = useNavigationStore.getState();
  addRecentProject(project);
};

// Navigation helper functions
export const navigateWithHistory = (path: string) => {
  const { pushToHistory } = useNavigationStore.getState();
  pushToHistory(path);
  // In a real router integration, you would trigger navigation here
};

export const goBackInHistory = () => {
  const { goBack } = useNavigationStore.getState();
  const previousPath = goBack();
  if (previousPath) {
    // In a real router integration, you would navigate to previousPath
    return previousPath;
  }
  return null;
};

export const goForwardInHistory = () => {
  const { goForward } = useNavigationStore.getState();
  const nextPath = goForward();
  if (nextPath) {
    // In a real router integration, you would navigate to nextPath
    return nextPath;
  }
  return null;
};

// =============================================================================
// DEVELOPMENT HELPERS
// =============================================================================

if (process.env.NODE_ENV === 'development') {
  // Expose store to window for debugging
  (window as any).__navigationStore__ = useNavigationStore;
  
  // Add logging for state changes
  useNavigationStore.subscribe((state, prevState) => {
    if (state.currentHistoryIndex !== prevState.currentHistoryIndex) {
      console.log('🧭 [NavigationStore] History index changed:', {
        index: state.currentHistoryIndex,
        path: state.navigationHistory[state.currentHistoryIndex],
        canGoBack: state.currentHistoryIndex > 0,
        canGoForward: state.currentHistoryIndex < state.navigationHistory.length - 1,
      });
    }
    
    if (state.breadcrumbs.length !== prevState.breadcrumbs.length) {
      console.log('🍞 [NavigationStore] Breadcrumbs changed:', 
        state.breadcrumbs.map(b => b.label).join(' > '));
    }
    
    if (state.recentProjects.length !== prevState.recentProjects.length) {
      console.log('📋 [NavigationStore] Recent projects changed:', state.recentProjects.length);
    }
  });
}