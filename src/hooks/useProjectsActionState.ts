/**
 * React 19 useActionState for Projects filters and search
 * Provides optimized form handling with concurrent features
 */

import { useActionState, useCallback } from 'react';
import type { ProjectsFilters } from '@/types/enhanced-projects';

interface ProjectsActionState {
  filters: ProjectsFilters;
  isSubmitting: boolean;
  error?: string;
}

type ProjectsAction = 
  | { type: 'UPDATE_SEARCH'; payload: string }
  | { type: 'UPDATE_STATUS'; payload: ProjectsFilters['status'] }
  | { type: 'UPDATE_TYPE'; payload: string | undefined }
  | { type: 'UPDATE_CLIENT'; payload: string | undefined }
  | { type: 'UPDATE_SORT'; payload: { sortBy: string; sortOrder: 'asc' | 'desc' } }
  | { type: 'RESET_FILTERS' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

/**
 * Reducer for projects action state
 */
function projectsReducer(
  state: ProjectsActionState, 
  action: ProjectsAction
): ProjectsActionState {
  switch (action.type) {
    case 'UPDATE_SEARCH':
      return {
        ...state,
        filters: {
          ...state.filters,
          search: action.payload.trim() || undefined
        },
        error: undefined
      };
      
    case 'UPDATE_STATUS':
      return {
        ...state,
        filters: {
          ...state.filters,
          status: action.payload
        },
        error: undefined
      };
      
    case 'UPDATE_TYPE':
      return {
        ...state,
        filters: {
          ...state.filters,
          type: action.payload
        },
        error: undefined
      };
      
    case 'UPDATE_CLIENT':
      return {
        ...state,
        filters: {
          ...state.filters,
          client: action.payload
        },
        error: undefined
      };
      
    case 'UPDATE_SORT':
      return {
        ...state,
        filters: {
          ...state.filters,
          sortBy: action.payload.sortBy,
          sortOrder: action.payload.sortOrder
        },
        error: undefined
      };
      
    case 'RESET_FILTERS':
      return {
        ...state,
        filters: {
          status: 'all',
          search: undefined,
          type: undefined,
          client: undefined,
          sortBy: 'updated_at',
          sortOrder: 'desc',
        },
        error: undefined
      };
      
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isSubmitting: false
      };
      
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: undefined
      };
      
    default:
      return state;
  }
}

/**
 * Async action for applying filters with validation
 */
async function applyFiltersAction(
  prevState: ProjectsActionState,
  formData: FormData
): Promise<ProjectsActionState> {
  try {
    // Simulate async validation/processing
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const search = formData.get('search') as string;
    const status = formData.get('status') as ProjectsFilters['status'];
    const type = formData.get('type') as string;
    const client = formData.get('client') as string;
    
    // Basic validation
    if (search && search.length > 100) {
      throw new Error('Search term is too long (max 100 characters)');
    }
    
    return {
      ...prevState,
      filters: {
        ...prevState.filters,
        search: search?.trim() || undefined,
        status: status || 'all',
        type: type || undefined,
        client: client || undefined,
      },
      isSubmitting: false,
      error: undefined
    };
  } catch (error) {
    return {
      ...prevState,
      isSubmitting: false,
      error: error instanceof Error ? error.message : 'Failed to apply filters'
    };
  }
}

/**
 * Hook for managing Projects filters with React 19 useActionState
 */
export function useProjectsActionState(initialFilters: ProjectsFilters) {
  const initialState: ProjectsActionState = {
    filters: initialFilters,
    isSubmitting: false,
    error: undefined
  };
  
  const [state, submitAction, isPending] = useActionState(applyFiltersAction, initialState);
  
  const updateSearch = useCallback((search: string) => {
    // For immediate updates, we can use a form submission
    const formData = new FormData();
    formData.set('search', search);
    formData.set('status', state.filters.status);
    if (state.filters.type) formData.set('type', state.filters.type);
    if (state.filters.client) formData.set('client', state.filters.client);
    
    submitAction(formData);
  }, [state.filters, submitAction]);
  
  const updateStatus = useCallback((status: ProjectsFilters['status']) => {
    const formData = new FormData();
    if (state.filters.search) formData.set('search', state.filters.search);
    formData.set('status', status);
    if (state.filters.type) formData.set('type', state.filters.type);
    if (state.filters.client) formData.set('client', state.filters.client);
    
    submitAction(formData);
  }, [state.filters, submitAction]);
  
  const updateType = useCallback((type: string | undefined) => {
    const formData = new FormData();
    if (state.filters.search) formData.set('search', state.filters.search);
    formData.set('status', state.filters.status);
    if (type) formData.set('type', type);
    if (state.filters.client) formData.set('client', state.filters.client);
    
    submitAction(formData);
  }, [state.filters, submitAction]);
  
  const resetFilters = useCallback(() => {
    const formData = new FormData();
    formData.set('search', '');
    formData.set('status', 'all');
    
    submitAction(formData);
  }, [submitAction]);
  
  return {
    filters: state.filters,
    isSubmitting: isPending || state.isSubmitting,
    error: state.error,
    actions: {
      updateSearch,
      updateStatus,
      updateType,
      resetFilters,
      submitAction
    }
  };
}