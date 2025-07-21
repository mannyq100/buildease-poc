/**
 * Enhanced Projects Filters with touch-optimized mobile design
 * Provides intuitive filtering for construction project management
 */

import React, { useState, startTransition } from 'react';
import { Search, X, SlidersHorizontal, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TouchOptimizedButton } from '@/components/ui/TouchOptimizedButton';
import { BottomSheet } from '@/components/mobile/BottomSheet';
import { cn } from '@/utils/core/ui';
import type { ProjectsFiltersProps } from '@/types/enhanced-projects';
import type { ProjectStatus } from '@/types/project';

export function ProjectsFilters({ 
  filters, 
  onFiltersChange, 
  statusCounts,
  loading = false,
  className 
}: ProjectsFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [isFilterPending, setIsFilterPending] = useState(false);
  
  const statusTabs = [
    { key: 'all', label: 'All', count: statusCounts?.all },
    { key: 'active', label: 'Active', count: statusCounts?.active },
    { key: 'planning', label: 'Planning', count: statusCounts?.planning },
    { key: 'completed', label: 'Completed', count: statusCounts?.completed },
    { key: 'on-hold', label: 'On Hold', count: statusCounts?.['on-hold'] },
  ];
  
  const handleStatusChange = (status: 'all' | ProjectStatus) => {
    setIsFilterPending(true);
    startTransition(() => {
      onFiltersChange({ ...filters, status });
      setIsFilterPending(false);
    });
  };
  
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setIsFilterPending(true);
    
    // Debounce search with React 19 concurrent features
    const timeoutId = setTimeout(() => {
      startTransition(() => {
        onFiltersChange({ ...filters, search: value.trim() || undefined });
        setIsFilterPending(false);
      });
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };
  
  const handleClearFilters = () => {
    setSearchInput('');
    setIsFilterPending(true);
    startTransition(() => {
      onFiltersChange({
        status: 'all',
        search: undefined,
        type: undefined,
        client: undefined,
        sortBy: 'updated_at',
        sortOrder: 'desc',
      });
      setIsFilterPending(false);
    });
  };
  
  const hasActiveFilters = filters.search || 
    filters.type || 
    filters.client || 
    (filters.status && filters.status !== 'all');
  
  return (
    <div className={className}>
      {/* Concurrent loading indicator */}
      {isFilterPending && (
        <div className="flex items-center justify-center p-2 mb-2 bg-blue-50 border border-blue-200 rounded-lg">
          <Loader2 className="h-3 w-3 animate-spin text-blue-600 mr-2" />
          <span className="text-xs text-blue-700">Applying filters...</span>
        </div>
      )}
      
      {/* Mobile-First Filter Interface */}
      <Card className={cn(
        "transition-opacity duration-200",
        isFilterPending && "opacity-75"
      )}>
        <CardContent className="p-4 lg:p-6">
          {/* Status Tabs - Horizontal scroll on mobile */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
            {statusTabs.map((tab) => (
              <TouchOptimizedButton
                key={tab.key}
                touchSize="md"
                variant={filters.status === tab.key ? "default" : "outline"}
                onClick={() => handleStatusChange(tab.key as 'all' | ProjectStatus)}
                className={cn(
                  "flex-shrink-0 gap-2 transition-all duration-200",
                  filters.status === tab.key 
                    ? "bg-buildease-blue-600 text-white shadow-md" 
                    : "bg-white hover:bg-slate-50 text-slate-700"
                )}
                disabled={loading || isFilterPending}
              >
                <span className="font-medium">{tab.label}</span>
                {tab.count !== undefined && (
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "text-xs px-2 py-0.5",
                      filters.status === tab.key 
                        ? "bg-white/20 text-white" 
                        : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {tab.count}
                  </Badge>
                )}
              </TouchOptimizedButton>
            ))}
          </div>
          
          {/* Search and Advanced Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search projects, clients, locations..."
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 h-12 text-base" // Touch-friendly height and text size
                disabled={loading || isFilterPending}
              />
              {searchInput && (
                <TouchOptimizedButton
                  touchSize="sm"
                  variant="ghost"
                  onClick={() => {
                    setSearchInput('');
                    onFiltersChange({ ...filters, search: undefined });
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
                >
                  <X className="h-4 w-4" />
                </TouchOptimizedButton>
              )}
            </div>
            
            {/* Advanced Filters Button */}
            <TouchOptimizedButton
              touchSize="lg"
              variant="outline"
              onClick={() => setShowAdvancedFilters(true)}
              className="flex-shrink-0 gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                  Active
                </Badge>
              )}
            </TouchOptimizedButton>
            
            {/* Clear Filters */}
            {hasActiveFilters && (
              <TouchOptimizedButton
                touchSize="lg"
                variant="outline"
                onClick={handleClearFilters}
                className="flex-shrink-0 text-slate-600 hover:text-slate-900"
              >
                <X className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Clear</span>
              </TouchOptimizedButton>
            )}
          </div>
          
          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-200">
              {filters.search && (
                <FilterChip
                  label={`Search: "${filters.search}"`}
                  onRemove={() => {
                    setSearchInput('');
                    onFiltersChange({ ...filters, search: undefined });
                  }}
                />
              )}
              {filters.type && (
                <FilterChip
                  label={`Type: ${filters.type}`}
                  onRemove={() => onFiltersChange({ ...filters, type: undefined })}
                />
              )}
              {filters.client && (
                <FilterChip
                  label={`Client: ${filters.client}`}
                  onRemove={() => onFiltersChange({ ...filters, client: undefined })}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Advanced Filters Bottom Sheet */}
      <AdvancedFiltersSheet
        isOpen={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        filters={filters}
        onFiltersChange={onFiltersChange}
      />
    </div>
  );
}

/**
 * Filter chip component for active filters
 */
interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <Badge 
      variant="secondary" 
      className="flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700"
    >
      <span className="text-sm">{label}</span>
      <TouchOptimizedButton
        touchSize="sm"
        variant="ghost"
        onClick={onRemove}
        className="p-0.5 h-auto hover:bg-slate-200 rounded-full"
      >
        <X className="h-3 w-3" />
      </TouchOptimizedButton>
    </Badge>
  );
}

/**
 * Advanced filters bottom sheet for mobile
 */
interface AdvancedFiltersSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ProjectsFiltersProps['filters'];
  onFiltersChange: ProjectsFiltersProps['onFiltersChange'];
}

function AdvancedFiltersSheet({ 
  isOpen, 
  onClose, 
  filters, 
  onFiltersChange 
}: AdvancedFiltersSheetProps) {
  const [tempFilters, setTempFilters] = useState(filters);
  
  const handleApply = () => {
    onFiltersChange(tempFilters);
    onClose();
  };
  
  const handleReset = () => {
    const resetFilters = {
      status: 'all' as const,
      search: undefined,
      type: undefined,
      client: undefined,
      sortBy: 'updated_at' as const,
      sortOrder: 'desc' as const,
    };
    setTempFilters(resetFilters);
    onFiltersChange(resetFilters);
    onClose();
  };
  
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Filter Projects"
      snapPoints={[60, 90]}
    >
      <div className="space-y-6">
        {/* Project Type Filter */}
        <div className="space-y-3">
          <h4 className="font-medium text-slate-900">Project Type</h4>
          <div className="grid grid-cols-2 gap-2">
            {['Residential', 'Commercial', 'Industrial', 'Infrastructure'].map((type) => (
              <TouchOptimizedButton
                key={type}
                touchSize="md"
                variant={tempFilters.type === type ? "default" : "outline"}
                onClick={() => setTempFilters({ 
                  ...tempFilters, 
                  type: tempFilters.type === type ? undefined : type 
                })}
                className="justify-center"
              >
                {type}
              </TouchOptimizedButton>
            ))}
          </div>
        </div>
        
        {/* Sort Options */}
        <div className="space-y-3">
          <h4 className="font-medium text-slate-900">Sort By</h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'name', label: 'Name' },
              { key: 'updated_at', label: 'Recent' },
              { key: 'budget', label: 'Budget' },
              { key: 'progress', label: 'Progress' },
            ].map((sort) => (
              <TouchOptimizedButton
                key={sort.key}
                touchSize="md"
                variant={tempFilters.sortBy === sort.key ? "default" : "outline"}
                onClick={() => setTempFilters({ ...tempFilters, sortBy: sort.key as any })}
                className="justify-center"
              >
                {sort.label}
              </TouchOptimizedButton>
            ))}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <TouchOptimizedButton
            touchSize="lg"
            variant="outline"
            onClick={handleReset}
            className="flex-1"
          >
            Reset All
          </TouchOptimizedButton>
          <TouchOptimizedButton
            touchSize="lg"
            onClick={handleApply}
            className="flex-1"
          >
            Apply Filters
          </TouchOptimizedButton>
        </div>
      </div>
    </BottomSheet>
  );
}