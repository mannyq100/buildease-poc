/**
 * Simplified Projects Filters component
 * Clean, mobile-first filtering for construction projects
 */

import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
    <div className={className}>
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardContent className="p-4">
          {/* Status Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleStatusChange(tab.key as 'all' | ProjectStatus)}
                className={cn(
                  "flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  "flex items-center gap-2",
                  filters.status === tab.key 
                    ? "bg-blue-600 text-white" 
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                )}
                disabled={loading}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "text-xs px-2 py-0.5",
                      filters.status === tab.key 
                        ? "bg-white/20 text-white" 
                        : "bg-white text-slate-600"
                    )}
                  >
                    {tab.count}
                  </Badge>
                )}
              </button>
            ))}
          </div>
          
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-10"
              disabled={loading}
            />
            {searchInput && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-100 rounded"
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            )}
          </div>
          
          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-200">
              {filters.search && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Search: "{filters.search}"
                  <button onClick={handleClearSearch} className="ml-1 hover:bg-slate-200 rounded">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

