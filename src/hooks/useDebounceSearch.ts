/**
 * useDebounceSearch Hook
 * Provides debounced search functionality with customizable delay
 * Optimized for search inputs to reduce API calls and improve performance
 */

import { useState, useEffect, useMemo, useCallback } from 'react';

interface UseDebounceSearchOptions {
  delay?: number;
  minLength?: number;
  enabled?: boolean;
}

interface UseDebounceSearchResult<T> {
  searchTerm: string;
  debouncedSearchTerm: string;
  filteredResults: T[];
  isSearching: boolean;
  setSearchTerm: (term: string) => void;
  clearSearch: () => void;
  searchStats: {
    totalItems: number;
    filteredCount: number;
    hasActiveSearch: boolean;
  };
}

/**
 * Generic debounced search hook with filtering capabilities
 */
export function useDebounceSearch<T>(
  items: T[],
  searchFunction: (items: T[], searchTerm: string) => T[],
  options: UseDebounceSearchOptions = {}
): UseDebounceSearchResult<T> {
  const {
    delay = 300,
    minLength = 1,
    enabled = true
  } = options;

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounce the search term
  useEffect(() => {
    if (!enabled) return;

    if (searchTerm.length === 0) {
      setDebouncedSearchTerm('');
      setIsSearching(false);
      return;
    }

    if (searchTerm.length < minLength) {
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, delay, minLength, enabled]);

  // Filter results based on debounced search term
  const filteredResults = useMemo(() => {
    if (!enabled || !debouncedSearchTerm || debouncedSearchTerm.length < minLength) {
      return items;
    }
    return searchFunction(items, debouncedSearchTerm);
  }, [items, debouncedSearchTerm, searchFunction, minLength, enabled]);

  // Clear search function
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setIsSearching(false);
  }, []);

  // Search statistics
  const searchStats = useMemo(() => ({
    totalItems: items.length,
    filteredCount: filteredResults.length,
    hasActiveSearch: debouncedSearchTerm.length >= minLength
  }), [items.length, filteredResults.length, debouncedSearchTerm.length, minLength]);

  return {
    searchTerm,
    debouncedSearchTerm,
    filteredResults,
    isSearching,
    setSearchTerm,
    clearSearch,
    searchStats
  };
}

/**
 * Specific search functions for different data types
 */

// Materials search function
export const searchMaterials = (materials: any[], searchTerm: string) => {
  const lowerSearchTerm = searchTerm.toLowerCase();
  return materials.filter(material =>
    material.name?.toLowerCase().includes(lowerSearchTerm) ||
    material.phaseName?.toLowerCase().includes(lowerSearchTerm) ||
    material.supplier?.toLowerCase().includes(lowerSearchTerm) ||
    material.status?.toLowerCase().includes(lowerSearchTerm)
  );
};

// Tasks search function
export const searchTasks = (tasks: any[], searchTerm: string) => {
  const lowerSearchTerm = searchTerm.toLowerCase();
  return tasks.filter(task =>
    task.title?.toLowerCase().includes(lowerSearchTerm) ||
    task.description?.toLowerCase().includes(lowerSearchTerm) ||
    task.project?.toLowerCase().includes(lowerSearchTerm) ||
    task.phase?.toLowerCase().includes(lowerSearchTerm) ||
    task.status?.toLowerCase().includes(lowerSearchTerm) ||
    task.priority?.toLowerCase().includes(lowerSearchTerm) ||
    task.assignedTo?.toLowerCase().includes(lowerSearchTerm)
  );
};

// Team members search function
export const searchTeamMembers = (members: any[], searchTerm: string) => {
  const lowerSearchTerm = searchTerm.toLowerCase();
  return members.filter(member =>
    member.name?.toLowerCase().includes(lowerSearchTerm) ||
    member.role?.toLowerCase().includes(lowerSearchTerm) ||
    member.email?.toLowerCase().includes(lowerSearchTerm) ||
    member.department?.toLowerCase().includes(lowerSearchTerm) ||
    member.status?.toLowerCase().includes(lowerSearchTerm)
  );
};

// Phases search function
export const searchPhases = (phases: any[], searchTerm: string) => {
  const lowerSearchTerm = searchTerm.toLowerCase();
  return phases.filter(phase =>
    phase.name?.toLowerCase().includes(lowerSearchTerm) ||
    phase.description?.toLowerCase().includes(lowerSearchTerm) ||
    phase.status?.toLowerCase().includes(lowerSearchTerm)
  );
};