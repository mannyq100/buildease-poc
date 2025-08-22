/**
 * Store Composition and Utilities
 * Sprint 4 Day 1: Store Architecture Design
 * Central export point for all stores and utilities
 */

// =============================================================================
// STORE IMPORTS
// =============================================================================

import { useProjectStore } from './projectStore';
import { useUIStore } from './uiStore';
import { useNavigationStore } from './navigationStore';

// Re-export individual stores
export { useProjectStore, useUIStore, useNavigationStore };

// Re-export store selectors
export * from './projectStore';
export * from './uiStore';
export * from './navigationStore';

// Re-export types
export type * from '../types/stores';

// Migration utilities removed after Sprint 4 completion

// =============================================================================
// STORE COMPOSITION
// =============================================================================

/**
 * Composite hook that provides access to all stores
 * Useful for components that need multiple stores
 */
export const useAppStores = () => ({
  project: useProjectStore(),
  ui: useUIStore(),
  navigation: useNavigationStore(),
});

/**
 * Hook that provides getState functions for all stores
 * Useful for accessing store state outside of React components
 */
export const useAppStoreStates = () => ({
  project: useProjectStore.getState,
  ui: useUIStore.getState,
  navigation: useNavigationStore.getState,
});

// =============================================================================
// TYPED STORE SELECTORS
// =============================================================================

/**
 * Creates a typed selector for any store
 * Ensures type safety and performance optimization
 */
export const createStoreSelector = <TStore, TResult>(
  useStore: () => TStore,
  selector: (state: TStore) => TResult
) => {
  return () => useStore()(selector as any);
};

/**
 * Creates a shallow equality selector
 * Prevents unnecessary re-renders for object/array selections
 */
export const createShallowSelector = <TStore, TResult>(
  useStore: any,
  selector: (state: TStore) => TResult
) => {
  return () => useStore(selector, (a: TResult, b: TResult) => {
    if (Array.isArray(a) && Array.isArray(b)) {
      return a.length === b.length && a.every((item, index) => item === b[index]);
    }
    if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      return keysA.length === keysB.length && 
             keysA.every(key => (a as any)[key] === (b as any)[key]);
    }
    return a === b;
  });
};

// =============================================================================
// CROSS-STORE UTILITIES
// =============================================================================

/**
 * Clears all temporary state across all stores
 * Useful for logout or project switching
 */
export const clearAllTemporaryState = () => {
  const { clearAllOptimisticUpdates } = useProjectStore.getState();
  const { closeAllModals, clearAllSelections, clearAllLoading, clearAllErrors } = useUIStore.getState();
  
  clearAllOptimisticUpdates();
  closeAllModals();
  clearAllSelections();
  clearAllLoading();
  clearAllErrors();
};

/**
 * Gets the current project context across stores
 */
export const getCurrentProjectContext = () => {
  const { currentProjectId, projectPreferences } = useProjectStore.getState();
  const { currentView } = useUIStore.getState();
  
  return {
    projectId: currentProjectId,
    preferences: currentProjectId ? projectPreferences[currentProjectId] : undefined,
    currentView,
  };
};

/**
 * Sets up a new project context across stores
 */
export const setProjectContext = (projectId: string, projectName: string) => {
  const { setCurrentProject } = useProjectStore.getState();
  const { addRecentProject } = useNavigationStore.getState();
  
  setCurrentProject(projectId);
  addRecentProject({ id: projectId, name: projectName });
};

// =============================================================================
// PERFORMANCE MONITORING
// =============================================================================

/**
 * Development utility to monitor store performance
 * Only active in development mode
 */
export const enableStorePerformanceMonitoring = () => {
  if (process.env.NODE_ENV !== 'development') return;
  
  let renderCount = 0;
  let lastRenderTime = Date.now();
  
  const monitorStore = (storeName: string, store: any) => {
    store.subscribe(() => {
      renderCount++;
      const now = Date.now();
      const timeSinceLastRender = now - lastRenderTime;
      
      if (timeSinceLastRender < 16) { // Less than one frame (60fps)
        console.warn(`🚨 [${storeName}] Rapid state changes detected (${timeSinceLastRender}ms)`);
      }
      
      if (renderCount > 100) {
        console.info(`📊 [${storeName}] ${renderCount} state changes in session`);
        renderCount = 0;
      }
      
      lastRenderTime = now;
    });
  };
  
  monitorStore('ProjectStore', useProjectStore);
  monitorStore('UIStore', useUIStore);
  monitorStore('NavigationStore', useNavigationStore);
};

// =============================================================================
// STORE DEBUGGING UTILITIES
// =============================================================================

/**
 * Development utility to log current state of all stores
 */
export const debugStoreState = () => {
  if (process.env.NODE_ENV !== 'development') return;
  
  console.group('🏗️ Store State Debug');
  
  console.group('📦 Project Store');
  console.log(useProjectStore.getState());
  console.groupEnd();
  
  console.group('🎨 UI Store');
  console.log(useUIStore.getState());
  console.groupEnd();
  
  console.group('🧭 Navigation Store');
  console.log(useNavigationStore.getState());
  console.groupEnd();
  
  console.groupEnd();
};

/**
 * Development utility to export store state
 */
export const exportStoreState = () => {
  if (process.env.NODE_ENV !== 'development') return;
  
  const state = {
    project: useProjectStore.getState(),
    ui: useUIStore.getState(),
    navigation: useNavigationStore.getState(),
    timestamp: new Date().toISOString(),
  };
  
  const dataStr = JSON.stringify(state, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `buildease-store-state-${Date.now()}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
};

// =============================================================================
// STORE HYDRATION
// =============================================================================

/**
 * Hydrates stores from exported state
 * Useful for debugging and testing
 */
export const hydrateStoresFromState = (state: any) => {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('Store hydration only available in development mode');
    return;
  }
  
  try {
    if (state.project) {
      useProjectStore.setState(state.project);
    }
    if (state.ui) {
      useUIStore.setState(state.ui);
    }
    if (state.navigation) {
      useNavigationStore.setState(state.navigation);
    }
    
    console.log('✅ Stores hydrated successfully');
  } catch (error) {
    console.error('❌ Failed to hydrate stores:', error);
  }
};

// =============================================================================
// DEVELOPMENT SETUP
// =============================================================================

if (process.env.NODE_ENV === 'development') {
  // Expose utilities to window for debugging
  (window as any).__storeUtils__ = {
    debugState: debugStoreState,
    exportState: exportStoreState,
    hydrateState: hydrateStoresFromState,
    clearTemporaryState: clearAllTemporaryState,
    enablePerformanceMonitoring: enableStorePerformanceMonitoring,
    getProjectContext: getCurrentProjectContext,
  };
  
  // Auto-enable performance monitoring in development
  enableStorePerformanceMonitoring();
  
  console.log('🚀 BuildEase Store System initialized');
  console.log('💡 Use __storeUtils__ in console for debugging utilities');
}