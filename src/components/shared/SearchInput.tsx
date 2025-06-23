/**
 * SearchInput Component
 * Reusable search input with debouncing, clear functionality, and loading states
 * Optimized for performance with proper event handling
 */

import React, { useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/core/ui';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  isSearching?: boolean;
  searchStats?: {
    totalItems: number;
    filteredCount: number;
    hasActiveSearch: boolean;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showStats?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

export const SearchInput = React.memo(function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = "Search...",
  isSearching = false,
  searchStats,
  className,
  size = 'md',
  showStats = true,
  disabled = false,
  autoFocus = false
}: SearchInputProps) {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  const handleClear = useCallback(() => {
    onChange('');
    onClear?.();
  }, [onChange, onClear]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  }, [handleClear]);

  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-9 text-sm',
    lg: 'h-10 text-base'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          {isSearching ? (
            <Loader2 className={cn(iconSizes[size], "text-gray-400 animate-spin")} />
          ) : (
            <Search className={cn(iconSizes[size], "text-gray-400")} />
          )}
        </div>

        {/* Input Field */}
        <Input
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className={cn(
            sizeClasses[size],
            "pl-10 pr-10",
            value && "pr-16", // Extra space when clear button is shown
            "transition-all duration-200",
            "focus:ring-2 focus:ring-[#2B6CB0] focus:border-[#2B6CB0]",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />

        {/* Clear Button */}
        {value && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className={cn(
              "absolute right-1 top-1/2 transform -translate-y-1/2",
              "h-6 w-6 p-0",
              "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
              "hover:bg-gray-100 dark:hover:bg-gray-800",
              "transition-colors duration-200"
            )}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>

      {/* Search Statistics */}
      {showStats && searchStats && (
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            {searchStats.hasActiveSearch ? (
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                {searchStats.filteredCount} of {searchStats.totalItems} results
              </Badge>
            ) : (
              <span>{searchStats.totalItems} total items</span>
            )}
          </div>
          
          {searchStats.hasActiveSearch && (
            <div className="flex items-center gap-1">
              <span>Press</span>
              <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">
                Esc
              </kbd>
              <span>to clear</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default SearchInput;