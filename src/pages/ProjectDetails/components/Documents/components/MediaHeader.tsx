/**
 * MediaHeader component for search and filter controls
 * Extracted from ProjectDocumentsSection for better maintainability
 */

import React, { memo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, Plus } from 'lucide-react';
import { MediaFilters } from '../types';

interface MediaHeaderProps {
  search: string;
  filters: MediaFilters;
  onSearchChange: (search: string) => void;
  onFilterChange: (filters: Partial<MediaFilters>) => void;
  onAddMedia: () => void;
  itemCount: number;
  filteredCount: number;
}

export const MediaHeader = memo<MediaHeaderProps>(({
  search,
  filters,
  onSearchChange,
  onFilterChange,
  onAddMedia,
  itemCount,
  filteredCount
}) => {
  return (
    <div className="space-y-4">
      {/* Header with title and add button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Project Media</h3>
          <p className="text-sm text-slate-600">
            {filteredCount === itemCount 
              ? `${itemCount} item${itemCount !== 1 ? 's' : ''}`
              : `${filteredCount} of ${itemCount} item${itemCount !== 1 ? 's' : ''}`
            }
          </p>
        </div>
        <Button 
          onClick={onAddMedia}
          className="bg-buildease-blue-600 hover:bg-buildease-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Media
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search media..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Type Filter */}
        <Select
          value={filters.type}
          onValueChange={(value) => onFilterChange({ type: value as MediaFilters['type'] })}
        >
          <SelectTrigger className="w-full sm:w-[140px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="document">Documents</SelectItem>
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select
          value={filters.category}
          onValueChange={(value) => onFilterChange({ category: value })}
        >
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="profile">Profile</SelectItem>
            <SelectItem value="inspiration">Inspiration</SelectItem>
            <SelectItem value="progress">Progress</SelectItem>
            <SelectItem value="contract">Contracts</SelectItem>
            <SelectItem value="permit">Permits</SelectItem>
            <SelectItem value="invoice">Invoices</SelectItem>
            <SelectItem value="blueprint">Blueprints</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters Display */}
      {(search || filters.type !== 'all' || filters.category !== 'all') && (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span>Active filters:</span>
          {search && (
            <span className="px-2 py-1 bg-slate-100 rounded text-xs">
              Search: "{search}"
            </span>
          )}
          {filters.type !== 'all' && (
            <span className="px-2 py-1 bg-slate-100 rounded text-xs">
              Type: {filters.type}
            </span>
          )}
          {filters.category !== 'all' && (
            <span className="px-2 py-1 bg-slate-100 rounded text-xs">
              Category: {filters.category}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onSearchChange('');
              onFilterChange({ type: 'all', category: 'all' });
            }}
            className="text-xs h-6 px-2"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
});

MediaHeader.displayName = 'MediaHeader';
