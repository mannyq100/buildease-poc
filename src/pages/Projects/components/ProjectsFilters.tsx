/**
 * Modern Projects Filters component
 * Clean, mobile-first filtering with enhanced visual design
 */

import React, { useState } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  const [searchInput, setSearchInput] = useState(filters.search || '');
  
  const statusTabs = [
    { key: 'all', label: 'All', count: statusCounts?.all },
    { key: 'active', label: 'Active', count: statusCounts?.active },
    { key: 'planning', label: 'Planning', count: statusCounts?.planning },
    { key: 'completed', label: 'Completed', count: statusCounts?.completed },
    { key: 'on-hold', label: 'On Hold', count: statusCounts?.['on-hold'] },
  ];
  
  const handleStatusChange = (status: 'all' | ProjectStatus) => {
    onFiltersChange({ ...filters, status });
  };
  
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    // Simple debounce
    setTimeout(() => {
      onFiltersChange({ ...filters, search: value.trim() || undefined });
    }, 300);
  };
  
  const handleClearSearch = () => {
    setSearchInput('');
    onFiltersChange({ ...filters, search: undefined });
  };
  
  const hasActiveFilters = filters.search || (filters.status && filters.status !== 'all');
  
  return (
    <div className={cn("w-full", className)}>
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search projects..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-10 bg-slate-50 border-slate-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            disabled={loading}
          />
          {searchInput && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full"
            >
              <X className="h-4 w-4 text-slate-500" />
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 overflow-x-auto">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleStatusChange(tab.key as 'all' | ProjectStatus)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap",
                "transition-colors min-h-[44px] flex-shrink-0",
                filters.status === tab.key 
                  ? "bg-blue-600 text-white" 
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              )}
              disabled={loading}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span 
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs",
                    filters.status === tab.key 
                      ? "bg-white/20 text-white" 
                      : "bg-white text-slate-600"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-200">
            {filters.search && (
              <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                <span>Search: "{filters.search}"</span>
                <button onClick={handleClearSearch} className="ml-1 hover:bg-blue-100 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {filters.status && filters.status !== 'all' && (
              <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                <span>Status: {filters.status}</span>
                <button onClick={() => onFiltersChange({ ...filters, status: 'all' })} className="ml-1 hover:bg-blue-100 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

