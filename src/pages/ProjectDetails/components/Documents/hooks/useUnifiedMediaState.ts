/**
 * Unified state management for ProjectDocumentsSection
 * Implements clean, single-source state with optimized performance
 */

import { useState, useCallback, useMemo } from 'react';
import { MediaFilters, MediaState } from '../types';

const initialState: MediaState = {
  search: '',
  filters: {
    type: 'all',
    category: 'all'
  },
  modals: {
    upload: { type: null },
    preview: { url: null }
  },
  ui: {
    showUploadOptions: false,
    isLoading: false
  }
};

/**
 * Unified state management hook for media operations
 * Replaces multiple useState hooks with single, optimized state
 */
export const useUnifiedMediaState = (initialShowUploadOptions = false) => {
  const [state, setState] = useState<MediaState>({
    ...initialState,
    ui: {
      ...initialState.ui,
      showUploadOptions: initialShowUploadOptions
    }
  });

  // Optimized actions with useCallback to prevent unnecessary re-renders
  const actions = useMemo(() => ({
    // Search actions
    setSearch: (search: string) => {
      setState(prev => ({ ...prev, search }));
    },

    // Filter actions
    updateFilters: (newFilters: Partial<MediaFilters>) => {
      setState(prev => ({ 
        ...prev, 
        filters: { ...prev.filters, ...newFilters } 
      }));
    },

    setTypeFilter: (type: MediaFilters['type']) => {
      setState(prev => ({ 
        ...prev, 
        filters: { ...prev.filters, type } 
      }));
    },

    setCategoryFilter: (category: string) => {
      setState(prev => ({ 
        ...prev, 
        filters: { ...prev.filters, category } 
      }));
    },

    clearFilters: () => {
      setState(prev => ({
        ...prev,
        search: '',
        filters: { type: 'all', category: 'all' }
      }));
    },

    // Upload modal actions
    openUploadModal: (type: 'inspiration' | 'progress' | 'documents') => {
      setState(prev => ({ 
        ...prev, 
        modals: { 
          ...prev.modals, 
          upload: { type } 
        } 
      }));
    },

    closeUploadModal: () => {
      setState(prev => ({ 
        ...prev, 
        modals: { 
          ...prev.modals, 
          upload: { type: null } 
        } 
      }));
    },

    // Preview modal actions
    openPreviewModal: (url: string) => {
      setState(prev => ({ 
        ...prev, 
        modals: { 
          ...prev.modals, 
          preview: { url } 
        } 
      }));
    },

    closePreviewModal: () => {
      setState(prev => ({ 
        ...prev, 
        modals: { 
          ...prev.modals, 
          preview: { url: null } 
        } 
      }));
    },

    // UI actions
    toggleUploadOptions: () => {
      setState(prev => ({ 
        ...prev, 
        ui: { 
          ...prev.ui, 
          showUploadOptions: !prev.ui.showUploadOptions 
        } 
      }));
    },

    setShowUploadOptions: (show: boolean) => {
      setState(prev => ({ 
        ...prev, 
        ui: { 
          ...prev.ui, 
          showUploadOptions: show 
        } 
      }));
    },

    setLoading: (isLoading: boolean) => {
      setState(prev => ({ 
        ...prev, 
        ui: { 
          ...prev.ui, 
          isLoading 
        } 
      }));
    },

    // Reset all state
    reset: () => {
      setState(initialState);
    }
  }), []);

  // Derived state selectors for easy access
  const selectors = useMemo(() => ({
    hasActiveFilters: state.search !== '' || state.filters.type !== 'all' || state.filters.category !== 'all',
    isUploadModalOpen: state.modals.upload.type !== null,
    isPreviewModalOpen: state.modals.preview.url !== null,
    uploadModalType: state.modals.upload.type,
    previewUrl: state.modals.preview.url
  }), [state]);

  return {
    state,
    actions,
    selectors
  };
};

/**
 * Hook for debounced search with loading state
 * Optimizes search performance and provides loading feedback
 */
export const useDebounceSearchWithLoading = (
  search: string,
  setLoading: (loading: boolean) => void,
  delay: number = 300
) => {
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const updateSearch = useCallback((newSearch: string) => {
    setLoading(true);
    const timer = setTimeout(() => {
      setDebouncedSearch(newSearch);
      setLoading(false);
    }, delay);

    return () => {
      clearTimeout(timer);
      setLoading(false);
    };
  }, [delay, setLoading]);

  return {
    debouncedSearch,
    updateSearch
  };
};
