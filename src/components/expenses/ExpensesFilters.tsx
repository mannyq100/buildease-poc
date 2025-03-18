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
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  projectFilter: string;
  setProjectFilter: (project: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  dateRange: string;
  setDateRange: (range: string) => void;
  EXPENSE_CATEGORIES: string[];
  EXPENSE_PROJECTS: string[];
  EXPENSE_STATUSES: string[];
}

/**
 * ExpensesFilters component for filtering expense data
 */
export function ExpensesFilters({
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  projectFilter,
  setProjectFilter,
  statusFilter,
  setStatusFilter,
  dateRange,
  setDateRange,
  EXPENSE_CATEGORIES,
  EXPENSE_PROJECTS,
  EXPENSE_STATUSES,
}: ExpensesFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input 
          placeholder="Search expenses..." 
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {EXPENSE_CATEGORIES.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            {EXPENSE_PROJECTS.map(project => (
              <SelectItem key={project} value={project}>{project}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {EXPENSE_STATUSES.map(status => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="thisMonth">This Month</SelectItem>
            <SelectItem value="last30">Last 30 Days</SelectItem>
            <SelectItem value="last7">Last 7 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
} 