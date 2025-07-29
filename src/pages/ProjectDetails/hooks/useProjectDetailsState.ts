/**
 * useProjectDetailsState - Centralized UI state management for ProjectDetails components
 * Manages all UI state with localStorage persistence for user preferences
 * Extracted from multiple components for better organization and consistency
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useDebounce } from '@/hooks/utils/useDebounce';

// Types for UI state management
export interface ExpandedSections {
  phases: boolean;
  budget: boolean;
  team: boolean;
  documents: boolean;
  settings: boolean;
  recentUpdates: boolean;
  todaysFocus: boolean;
}

export interface ViewModes {
  teamView: 'compact' | 'detailed';
  budgetView: 'list' | 'grid';
  phaseView: 'timeline' | 'cards';
  documentView: 'grid' | 'list';
}

export interface SortOptions {
  budgetSort: 'date' | 'amount' | 'category' | 'name';
  teamSort: 'name' | 'role' | 'status';
  phaseSort: 'date' | 'name' | 'status';
  taskSort: 'priority' | 'due_date' | 'status' | 'name';
}

export interface FilterStates {
  budgetCategory: string | null;
  teamStatus: string | null;
  phaseStatus: string | null;
  taskStatus: string | null;
}

export interface ImageUploadStates {
  showImageUpload: boolean;
  imagesCollapsed: boolean;
  previewImage: { url: string; caption?: string } | null;
  selectedImageType: 'profile' | 'inspiration' | 'progress' | null;
}

export interface ProjectDetailsUIState {
  expandedSections: ExpandedSections;
  expandedPhases: Record<string, boolean>;
  viewModes: ViewModes;
  sortOptions: SortOptions;
  filterStates: FilterStates;
  imageUploadStates: ImageUploadStates;
}

// Default states providing good UX
const DEFAULT_EXPANDED_SECTIONS: ExpandedSections = {
  budget: true,    // Open budget first (most important)
  phases: true,    // Open timeline second (project flow)
  team: false,     // Keep team collapsed initially
  documents: false, // Keep documents collapsed initially
  settings: false,  // Keep settings collapsed initially
  recentUpdates: false, // Keep recent updates collapsed initially
  todaysFocus: true // Open today's focus by default (important for daily workflow)
};

const DEFAULT_VIEW_MODES: ViewModes = {
  teamView: 'compact',
  budgetView: 'list',
  phaseView: 'timeline',
  documentView: 'grid'
};

const DEFAULT_SORT_OPTIONS: SortOptions = {
  budgetSort: 'date',
  teamSort: 'name',
  phaseSort: 'date',
  taskSort: 'priority'
};

const DEFAULT_FILTER_STATES: FilterStates = {
  budgetCategory: null,
  teamStatus: null,
  phaseStatus: null,
  taskStatus: null
};

const DEFAULT_IMAGE_UPLOAD_STATES: ImageUploadStates = {
  showImageUpload: false,
  imagesCollapsed: false,
  previewImage: null,
  selectedImageType: null
};

// Storage keys for localStorage persistence
const STORAGE_KEYS = {
  EXPANDED_SECTIONS: 'project-details-expanded-sections',
  EXPANDED_PHASES: 'project-details-expanded-phases',
  VIEW_MODES: 'project-details-view-modes',
  SORT_OPTIONS: 'project-details-sort-options'
} as const;

/**
 * Custom hook for centralized ProjectDetails UI state management
 * @param projectId - Project ID for scoped localStorage keys
 */
export function useProjectDetailsState(projectId: string) {
  // Generate scoped storage keys
  const scopedKeys = useMemo(() => ({
    expandedSections: `${STORAGE_KEYS.EXPANDED_SECTIONS}-${projectId}`,
    expandedPhases: `${STORAGE_KEYS.EXPANDED_PHASES}-${projectId}`,
    viewModes: `${STORAGE_KEYS.VIEW_MODES}-${projectId}`,
    sortOptions: `${STORAGE_KEYS.SORT_OPTIONS}-${projectId}`
  }), [projectId]);

  // Load initial state from localStorage
  const loadInitialState = useCallback((): ProjectDetailsUIState => {
    try {
      const savedExpandedSections = localStorage.getItem(scopedKeys.expandedSections);
      const savedExpandedPhases = localStorage.getItem(scopedKeys.expandedPhases);
      const savedViewModes = localStorage.getItem(scopedKeys.viewModes);
      const savedSortOptions = localStorage.getItem(scopedKeys.sortOptions);

      return {
        expandedSections: savedExpandedSections 
          ? { ...DEFAULT_EXPANDED_SECTIONS, ...JSON.parse(savedExpandedSections) }
          : DEFAULT_EXPANDED_SECTIONS,
        expandedPhases: savedExpandedPhases 
          ? JSON.parse(savedExpandedPhases) 
          : {},
        viewModes: savedViewModes 
          ? { ...DEFAULT_VIEW_MODES, ...JSON.parse(savedViewModes) }
          : DEFAULT_VIEW_MODES,
        sortOptions: savedSortOptions 
          ? { ...DEFAULT_SORT_OPTIONS, ...JSON.parse(savedSortOptions) }
          : DEFAULT_SORT_OPTIONS,
        filterStates: DEFAULT_FILTER_STATES,
        imageUploadStates: DEFAULT_IMAGE_UPLOAD_STATES
      };
    } catch (error) {
      console.warn('Failed to load ProjectDetails UI state from localStorage:', error);
      return {
        expandedSections: DEFAULT_EXPANDED_SECTIONS,
        expandedPhases: {},
        viewModes: DEFAULT_VIEW_MODES,
        sortOptions: DEFAULT_SORT_OPTIONS,
        filterStates: DEFAULT_FILTER_STATES,
        imageUploadStates: DEFAULT_IMAGE_UPLOAD_STATES
      };
    }
  }, [scopedKeys]);

  // Initialize state
  const [uiState, setUIState] = useState<ProjectDetailsUIState>(loadInitialState);

  // Debounced state for localStorage updates (prevent excessive writes)
  const debouncedUIState = useDebounce(uiState, 500);

  // Persist state to localStorage (debounced)
  useEffect(() => {
    try {
      localStorage.setItem(scopedKeys.expandedSections, JSON.stringify(debouncedUIState.expandedSections));
      localStorage.setItem(scopedKeys.expandedPhases, JSON.stringify(debouncedUIState.expandedPhases));
      localStorage.setItem(scopedKeys.viewModes, JSON.stringify(debouncedUIState.viewModes));
      localStorage.setItem(scopedKeys.sortOptions, JSON.stringify(debouncedUIState.sortOptions));
    } catch (error) {
      console.warn('Failed to save ProjectDetails UI state to localStorage:', error);
    }
  }, [debouncedUIState, scopedKeys]);

  // Section toggle actions
  const toggleSection = useCallback((section: keyof ExpandedSections) => {
    setUIState(prev => ({
      ...prev,
      expandedSections: {
        ...prev.expandedSections,
        [section]: !prev.expandedSections[section]
      }
    }));
  }, []);

  // Phase toggle actions
  const togglePhase = useCallback((phaseId: string) => {
    setUIState(prev => ({
      ...prev,
      expandedPhases: {
        ...prev.expandedPhases,
        [phaseId]: !prev.expandedPhases[phaseId]
      }
    }));
  }, []);

  // View mode actions
  const setViewMode = useCallback(<K extends keyof ViewModes>(
    viewType: K, 
    mode: ViewModes[K]
  ) => {
    setUIState(prev => ({
      ...prev,
      viewModes: {
        ...prev.viewModes,
        [viewType]: mode
      }
    }));
  }, []);

  // Sort option actions
  const setSortOption = useCallback(<K extends keyof SortOptions>(
    sortType: K, 
    option: SortOptions[K]
  ) => {
    setUIState(prev => ({
      ...prev,
      sortOptions: {
        ...prev.sortOptions,
        [sortType]: option
      }
    }));
  }, []);

  // Filter actions
  const setFilter = useCallback(<K extends keyof FilterStates>(
    filterType: K, 
    value: FilterStates[K]
  ) => {
    setUIState(prev => ({
      ...prev,
      filterStates: {
        ...prev.filterStates,
        [filterType]: value
      }
    }));
  }, []);

  // Image upload state actions
  const setImageUploadState = useCallback(<K extends keyof ImageUploadStates>(
    stateKey: K, 
    value: ImageUploadStates[K]
  ) => {
    setUIState(prev => ({
      ...prev,
      imageUploadStates: {
        ...prev.imageUploadStates,
        [stateKey]: value
      }
    }));
  }, []);

  // Reset state actions
  const resetState = useCallback(() => {
    setUIState({
      expandedSections: DEFAULT_EXPANDED_SECTIONS,
      expandedPhases: {},
      viewModes: DEFAULT_VIEW_MODES,
      sortOptions: DEFAULT_SORT_OPTIONS,
      filterStates: DEFAULT_FILTER_STATES,
      imageUploadStates: DEFAULT_IMAGE_UPLOAD_STATES
    });
  }, []);

  const resetSection = useCallback((section: keyof ExpandedSections) => {
    setUIState(prev => ({
      ...prev,
      expandedSections: {
        ...prev.expandedSections,
        [section]: DEFAULT_EXPANDED_SECTIONS[section]
      }
    }));
  }, []);

  return {
    // Current state
    ...uiState,
    
    // Section actions
    toggleSection,
    togglePhase,
    
    // View and sort actions
    setViewMode,
    setSortOption,
    setFilter,
    
    // Image upload actions
    setImageUploadState,
    
    // Reset actions
    resetState,
    resetSection,
    
    // Convenience getters
    isExpanded: useCallback((section: keyof ExpandedSections) => 
      uiState.expandedSections[section], [uiState.expandedSections]),
    
    isPhaseExpanded: useCallback((phaseId: string) => 
      Boolean(uiState.expandedPhases[phaseId]), [uiState.expandedPhases])
  };
}

export type UseProjectDetailsStateReturn = ReturnType<typeof useProjectDetailsState>;