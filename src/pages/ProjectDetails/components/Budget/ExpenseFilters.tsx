/**
 * ExpenseFilters component
 * Smart filtering and search for budget expenses
 * Mobile-optimized with horizontal scroll and debounced search
 */

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Calendar, 
  DollarSign,
  Clock,
  CheckCircle2,
  X
} from 'lucide-react';
import { cn } from '@/utils/core/ui';
import type { BudgetExpense, PaymentStatus } from '@/types/projectDetails';

export interface ExpenseFiltersState {
  search: string;
  status: PaymentStatus | 'all';
  dateRange: 'all' | 'today' | 'this-week' | 'this-month' | 'last-30-days';
  amountRange: 'all' | 'under-100' | '100-500' | '500-1000' | 'over-1000';
  category: string | 'all';
}

interface ExpenseFiltersProps {
  expenses: BudgetExpense[];
  filters: ExpenseFiltersState;
  onFiltersChange: (filters: ExpenseFiltersState) => void;
  className?: string;
}

interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  count?: number;
}

function FilterChip({ active, onClick, children, icon, count }: FilterChipProps) {
  return (
    <Button
      variant={active ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className={cn(
        'h-8 px-3 text-xs font-medium whitespace-nowrap flex-shrink-0',
        'border transition-all duration-200',
        active 
          ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      )}
    >
      {icon && <span className="mr-1.5">{icon}</span>}
      {children}
      {count !== undefined && count > 0 && (
        <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-xs">
          {count}
        </Badge>
      )}
    </Button>
  );
}

export function ExpenseFilters({ 
  expenses, 
  filters, 
  onFiltersChange, 
  className 
}: ExpenseFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search);

  // Debounced search effect
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        onFiltersChange({ ...filters, search: searchValue });
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchValue, filters, onFiltersChange]);

  // Calculate filter counts
  const filterCounts = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const last30Days = new Date(now.setDate(now.getDate() - 30));

    return {
      all: expenses.length,
      pending: expenses.filter(e => e.payment_status === 'PENDING').length,
      paid: expenses.filter(e => e.payment_status === 'PAID').length,
      approved: expenses.filter(e => e.payment_status === 'APPROVED').length,
      thisWeek: expenses.filter(e => new Date(e.created_at) >= startOfWeek).length,
      thisMonth: expenses.filter(e => new Date(e.created_at) >= startOfMonth).length,
      last30Days: expenses.filter(e => new Date(e.created_at) >= last30Days).length,
    };
  }, [expenses]);

  // Extract unique categories
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(expenses.map(e => e.category).filter(Boolean)));
    return uniqueCategories.sort();
  }, [expenses]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status !== 'all') count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.amountRange !== 'all') count++;
    if (filters.category !== 'all') count++;
    return count;
  }, [filters]);

  const clearAllFilters = () => {
    setSearchValue('');
    onFiltersChange({
      search: '',
      status: 'all',
      dateRange: 'all',
      amountRange: 'all',
      category: 'all'
    });
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search expenses..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-10 pr-4 h-9 text-sm"
        />
        {searchValue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchValue('')}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="h-5 px-2 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-7 px-2 text-xs text-gray-500 hover:text-gray-700"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Status Filters */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</h4>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <FilterChip
            active={filters.status === 'all'}
            onClick={() => onFiltersChange({ ...filters, status: 'all' })}
            count={filterCounts.all}
          >
            All
          </FilterChip>
          <FilterChip
            active={filters.status === 'PENDING'}
            onClick={() => onFiltersChange({ ...filters, status: 'PENDING' })}
            icon={<Clock className="h-3 w-3" />}
            count={filterCounts.pending}
          >
            Pending
          </FilterChip>
          <FilterChip
            active={filters.status === 'APPROVED'}
            onClick={() => onFiltersChange({ ...filters, status: 'APPROVED' })}
            icon={<CheckCircle2 className="h-3 w-3" />}
            count={filterCounts.approved}
          >
            Approved
          </FilterChip>
          <FilterChip
            active={filters.status === 'PAID'}
            onClick={() => onFiltersChange({ ...filters, status: 'PAID' })}
            icon={<CheckCircle2 className="h-3 w-3" />}
            count={filterCounts.paid}
          >
            Paid
          </FilterChip>
        </div>
      </div>

      {/* Date Filters */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date</h4>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <FilterChip
            active={filters.dateRange === 'all'}
            onClick={() => onFiltersChange({ ...filters, dateRange: 'all' })}
          >
            All Time
          </FilterChip>
          <FilterChip
            active={filters.dateRange === 'this-week'}
            onClick={() => onFiltersChange({ ...filters, dateRange: 'this-week' })}
            icon={<Calendar className="h-3 w-3" />}
            count={filterCounts.thisWeek}
          >
            This Week
          </FilterChip>
          <FilterChip
            active={filters.dateRange === 'this-month'}
            onClick={() => onFiltersChange({ ...filters, dateRange: 'this-month' })}
            icon={<Calendar className="h-3 w-3" />}
            count={filterCounts.thisMonth}
          >
            This Month
          </FilterChip>
          <FilterChip
            active={filters.dateRange === 'last-30-days'}
            onClick={() => onFiltersChange({ ...filters, dateRange: 'last-30-days' })}
            icon={<Calendar className="h-3 w-3" />}
            count={filterCounts.last30Days}
          >
            Last 30 Days
          </FilterChip>
        </div>
      </div>

      {/* Amount Filters */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Amount</h4>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <FilterChip
            active={filters.amountRange === 'all'}
            onClick={() => onFiltersChange({ ...filters, amountRange: 'all' })}
          >
            All Amounts
          </FilterChip>
          <FilterChip
            active={filters.amountRange === 'under-100'}
            onClick={() => onFiltersChange({ ...filters, amountRange: 'under-100' })}
            icon={<DollarSign className="h-3 w-3" />}
          >
            Under $100
          </FilterChip>
          <FilterChip
            active={filters.amountRange === '100-500'}
            onClick={() => onFiltersChange({ ...filters, amountRange: '100-500' })}
            icon={<DollarSign className="h-3 w-3" />}
          >
            $100 - $500
          </FilterChip>
          <FilterChip
            active={filters.amountRange === '500-1000'}
            onClick={() => onFiltersChange({ ...filters, amountRange: '500-1000' })}
            icon={<DollarSign className="h-3 w-3" />}
          >
            $500 - $1K
          </FilterChip>
          <FilterChip
            active={filters.amountRange === 'over-1000'}
            onClick={() => onFiltersChange({ ...filters, amountRange: 'over-1000' })}
            icon={<DollarSign className="h-3 w-3" />}
          >
            Over $1K
          </FilterChip>
        </div>
      </div>

      {/* Category Filters */}
      {categories.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</h4>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <FilterChip
              active={filters.category === 'all'}
              onClick={() => onFiltersChange({ ...filters, category: 'all' })}
            >
              All Categories
            </FilterChip>
            {categories.map((category) => (
              <FilterChip
                key={category}
                active={filters.category === category}
                onClick={() => onFiltersChange({ ...filters, category })}
              >
                {category}
              </FilterChip>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ExpenseFilters;