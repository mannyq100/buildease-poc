import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ExpensesFiltersProps {
  activeFilters: {
    searchQuery: string;
    category: string;
    project: string;
    phase: string;
    status: string;
    dateRange: string;
  };
  onFilterChange: (filterType: string, value: string) => void;
  categories: string[];
  projects: string[];
  phases: string[];
  statuses: string[];
}

/**
 * ExpensesFilters component for filtering expense data
 */
export function ExpensesFilters({
  activeFilters,
  onFilterChange,
  categories,
  projects,
  phases,
  statuses
}: ExpensesFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input 
          placeholder="Search expenses..." 
          className="pl-10"
          value={activeFilters.searchQuery}
          onChange={(e) => onFilterChange('searchQuery', e.target.value)}
        />
      </div>

      <div>
        <Select 
          value={activeFilters.category} 
          onValueChange={(value) => onFilterChange('category', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.slice(1).map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Select 
          value={activeFilters.project} 
          onValueChange={(value) => onFilterChange('project', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.slice(1).map(project => (
              <SelectItem key={project} value={project}>{project}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Select 
          value={activeFilters.status} 
          onValueChange={(value) => onFilterChange('status', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.slice(1).map(status => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Select 
          value={activeFilters.dateRange} 
          onValueChange={(value) => onFilterChange('dateRange', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="month">Last 30 Days</SelectItem>
            <SelectItem value="quarter">Last 90 Days</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}