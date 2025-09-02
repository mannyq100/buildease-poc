/**
 * Optimized filtering hook with performance enhancements
 * Implements debounced search, memoized filtering, and loading states
 */

import { useMemo, useState, useEffect } from 'react';
import { MediaItem, MediaFilters } from '../types';

/**
 * Hook for debounced search with performance optimization
 */
export const useDebounceSearch = (value: string, delay: number = 300): string => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Optimized filtering hook with granular memoization
 * Provides high-performance filtering with search and category filters
 */
export const useOptimizedFiltering = (
  items: MediaItem[],
  search: string,
  filters: MediaFilters
): MediaItem[] => {
  // Debounce search for performance
  const debouncedSearch = useDebounceSearch(search);

  // Pre-compile search regex for performance
  const searchRegex = useMemo(() => {
    if (!debouncedSearch) return null;
    try {
      return new RegExp(debouncedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    } catch {
      return null;
    }
  }, [debouncedSearch]);

  // Memoize filtered results with granular dependencies
  return useMemo(() => {
    return items.filter(item => {
      // Search filter
      if (searchRegex && !searchRegex.test(item.name)) {
        return false;
      }

      // Type filter using database media_type field with backward compatibility
      if (filters.type !== 'all') {
        // Support both legacy display types and database media_type values
        if ((filters.type === 'image' || filters.type === 'PHOTO') && item.media_type !== 'PHOTO') {
          return false;
        }
        if ((filters.type === 'video' || filters.type === 'VIDEO') && item.media_type !== 'VIDEO') {
          return false;
        }
        if ((filters.type === 'document' || filters.type === 'DOCUMENT') && item.media_type !== 'DOCUMENT') {
          return false;
        }
      }

      // Category filter (case-insensitive)
      if (filters.category !== 'all' && 
          item.category.toLowerCase() !== filters.category.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [items, searchRegex, filters.type, filters.category]);
};

/**
 * Hook for filtering statistics and performance metrics
 */
export const useFilteringStats = (
  totalItems: number,
  filteredItems: number,
  isLoading: boolean = false
) => {
  return useMemo(() => ({
    totalCount: totalItems,
    filteredCount: filteredItems,
    isFiltered: filteredItems !== totalItems,
    filterRatio: totalItems > 0 ? filteredItems / totalItems : 0,
    isLoading,
    isEmpty: filteredItems === 0,
    hasResults: filteredItems > 0
  }), [totalItems, filteredItems, isLoading]);
};

/**
 * Hook for advanced filtering with category grouping
 */
export const useGroupedFiltering = (
  items: MediaItem[],
  search: string,
  filters: MediaFilters
) => {
  const filteredItems = useOptimizedFiltering(items, search, filters);

  // Group filtered items by category for enhanced UX
  const groupedItems = useMemo(() => {
    const groups: Record<string, MediaItem[]> = {};
    
    filteredItems.forEach(item => {
      const category = item.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
    });

    return groups;
  }, [filteredItems]);

  // Get category counts for filter UI
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    
    items.forEach(item => {
      const category = item.category;
      counts[category] = (counts[category] || 0) + 1;
    });

    return counts;
  }, [items]);

  return {
    filteredItems,
    groupedItems,
    categoryCounts,
    categories: Object.keys(groupedItems).sort()
  };
};
