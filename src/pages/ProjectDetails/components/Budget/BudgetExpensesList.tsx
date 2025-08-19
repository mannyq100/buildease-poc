/**
 * BudgetExpensesList component
 * Extracted from ProjectDetailsContent.tsx - Budget Expenses Section
 * Displays list of budget expenses with edit/delete actions
 * Mobile-optimized list layout with proper touch targets
 * Performance optimized with React.memo and memoized computations
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { createPerformanceMeasurement } from '@/utils/core/performance';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ProCard } from '@/components/ui/ProCard';
import { Filter, Plus, Search, X, TrendingUp, BarChart3, Hammer, Users, Truck, FileText, Palette, MoreHorizontal, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/core/ui';
import { useConsolidatedProjectData } from '@/hooks/queries/useConsolidatedProjectData';
import SwipeableExpenseCard from './SwipeableExpenseCard';
import type { BudgetExpense } from '@/types/projectDetails';

interface BudgetExpensesListProps {
  budgetExpenses?: BudgetExpense[];
  onEditExpense: (expense: BudgetExpense) => void;
  onDeleteExpense: (expenseId: string) => void;
  onAddExpense?: () => void;
  className?: string;
  projectId?: string;
}

function BudgetExpensesListComponent({
  budgetExpenses = [],
  onEditExpense,
  onDeleteExpense,
  onAddExpense,
  className,
  projectId
}: BudgetExpensesListProps) {
  // Get consolidated project data for category breakdown
  const { data: consolidatedData, isLoading, error } = useConsolidatedProjectData(projectId || '');
  
  // Filtering state
  const [filters, setFilters] = React.useState({
    search: '',
    status: 'all' as 'all' | 'PAID' | 'PENDING' | 'APPROVED' | 'FAILED',
    category: 'all'
  });
  const [showFilters, setShowFilters] = React.useState(false);
  const [showCategoryBreakdown, setShowCategoryBreakdown] = React.useState(true);
  
  const expenses = React.useMemo(() => budgetExpenses || [], [budgetExpenses]);

  // Filtered expenses based on current filters
  const filteredExpenses = React.useMemo(() => {
    let filtered = [...expenses];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(expense => 
        expense.description?.toLowerCase().includes(searchLower) ||
        expense.category?.toLowerCase().includes(searchLower) ||
        expense.transaction_type?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(expense => expense.payment_status === filters.status);
    }


    // Apply category filter - map UI category to transaction type
    if (filters.category !== 'all') {
      const categoryToTransactionType: Record<string, string> = {
        'materials': 'MATERIAL_PURCHASE',
        'labor': 'LABOR',
        'equipment': 'EQUIPMENT_RENTAL', 
        'permits': 'PERMIT_FEE',
        'design': 'DESIGN_FEE',
        'other': 'OTHER'
      };
      const transactionType = categoryToTransactionType[filters.category];
      if (transactionType) {
        filtered = filtered.filter(expense => expense.transaction_type === transactionType);
      }
    }

    return filtered;
  }, [expenses, filters]);

  // Memoized formatter function for currency
  const formatCurrency = React.useCallback((amount: number, currency: string = 'USD') => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: currency === 'JPY' || currency === 'CNY' ? 0 : 2,
      }).format(amount);
    } catch {
      // Fallback for unsupported currencies
      const currencySymbols: Record<string, string> = {
        'USD': '$', 'EUR': '€', 'GBP': '£', 'CAD': 'C$', 'AUD': 'A$',
        'JPY': '¥', 'CNY': '¥', 'INR': '₹', 'BRL': 'R$', 'MXN': '$',
        'ZAR': 'R', 'CHF': 'CHF', 'SEK': 'kr', 'NOK': 'kr', 'DKK': 'kr'
      };
      const symbol = currencySymbols[currency] || currency;
      return `${symbol}${amount.toLocaleString()}`;
    }
  }, []);

  // Category configuration for simplified breakdown with modern styling
  const CATEGORY_CONFIG = React.useMemo(() => ({
    material_costs: { label: 'Materials', icon: Hammer, color: 'bg-blue-500', bgColor: 'bg-white', textColor: 'text-blue-600', borderColor: 'border-blue-100', iconBg: 'bg-blue-50' },
    labor_costs: { label: 'Labor', icon: Users, color: 'bg-emerald-500', bgColor: 'bg-white', textColor: 'text-emerald-600', borderColor: 'border-emerald-100', iconBg: 'bg-emerald-50' },
    equipment_costs: { label: 'Equipment', icon: Truck, color: 'bg-amber-500', bgColor: 'bg-white', textColor: 'text-amber-600', borderColor: 'border-amber-100', iconBg: 'bg-amber-50' },
    permit_costs: { label: 'Permits', icon: FileText, color: 'bg-purple-500', bgColor: 'bg-white', textColor: 'text-purple-600', borderColor: 'border-purple-100', iconBg: 'bg-purple-50' },
    design_costs: { label: 'Design', icon: Palette, color: 'bg-pink-500', bgColor: 'bg-white', textColor: 'text-pink-600', borderColor: 'border-pink-100', iconBg: 'bg-pink-50' },
    other_costs: { label: 'Other', icon: MoreHorizontal, color: 'bg-slate-500', bgColor: 'bg-white', textColor: 'text-slate-600', borderColor: 'border-slate-100', iconBg: 'bg-slate-50' }
  }), []);

  // Performance measurement for expensive calculations
  const measureCalculation = React.useMemo(() => 
    createPerformanceMeasurement('BudgetExpensesList', 'totalCalculation'), []
  );
  
  // Memoized computed values - use base_amount for consistent USD totals
  // Always display totals in USD for consistency across multi-currency projects
  const totalAmountUSD = React.useMemo(() => {
    return measureCalculation(() => {
      return filteredExpenses.reduce((sum, expense) => sum + (expense.base_amount || expense.amount), 0);
    });
  }, [filteredExpenses, measureCalculation]);

  // Get active filter count for badge
  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status !== 'all') count++;
    if (filters.category !== 'all') count++;
    return count;
  }, [filters]);

  // Performance measurement for category breakdown
  const measureBreakdown = React.useMemo(() => 
    createPerformanceMeasurement('BudgetExpensesList', 'categoryBreakdown'), []
  );
  
  // Enhanced category breakdown data with both database totals and filtered totals
  const categoryBreakdownData = React.useMemo(() => {
    if (!consolidatedData?.categoryTotals) return null;
    
    try {
      return measureBreakdown(() => {
    
    // Calculate totals from database (all expenses)
    const dbTotalAmount = Object.values(consolidatedData.categoryTotals).reduce((sum, amount) => sum + amount, 0);
    
    // Calculate totals from filtered expenses (current view)
    // Map database transaction_type to category totals keys (matches SQL view logic)
    const transactionTypeMapping: Record<string, string> = {
      'MATERIAL_PURCHASE': 'material_costs',
      'LABOR': 'labor_costs', 
      'EQUIPMENT_RENTAL': 'equipment_costs',
      'PERMIT_FEE': 'permit_costs',
      'DESIGN_FEE': 'design_costs',
      'OTHER': 'other_costs'
    };
    
    const filteredCategoryTotals = filteredExpenses.reduce((acc, expense) => {
      // Use transaction_type to match database view logic exactly
      const transactionType = expense.transaction_type;
      const categoryKey = transactionTypeMapping[transactionType || 'OTHER'] || 'other_costs';
      const amount = expense.base_amount || expense.amount || 0;
      acc[categoryKey] = (acc[categoryKey] || 0) + amount;
      return acc;
    }, {} as Record<string, number>);
    
    const filteredTotalAmount = Object.values(filteredCategoryTotals).reduce((sum, amount) => sum + amount, 0);
    
    if (dbTotalAmount === 0 && filteredTotalAmount === 0) return null;
    
    // Combine database totals with filtered totals for comparison
    const allCategories = new Set([
      ...Object.keys(consolidatedData.categoryTotals),
      ...Object.keys(filteredCategoryTotals)
    ]);
    
    return Array.from(allCategories)
      .map(key => {
        const dbAmount = (consolidatedData.categoryTotals as Record<string, number>)[key] || 0;
        const filteredAmount = filteredCategoryTotals[key] || 0;
        const config = CATEGORY_CONFIG[key as keyof typeof CATEGORY_CONFIG];
        
        if (!config || (dbAmount === 0 && filteredAmount === 0)) return null;
        
        return {
          key: key as keyof typeof CATEGORY_CONFIG,
          dbAmount,
          filteredAmount,
          dbPercentage: dbTotalAmount > 0 ? (dbAmount / dbTotalAmount) * 100 : 0,
          filteredPercentage: filteredTotalAmount > 0 ? (filteredAmount / filteredTotalAmount) * 100 : 0,
          config,
          isFiltered: activeFilterCount > 0
        };
      })
      .filter(Boolean)
      .sort((a, b) => (b?.dbAmount || 0) - (a?.dbAmount || 0))
      .slice(0, 6); // Show top 6 categories
    }); // Close measureBreakdown
    } catch (error) {
      console.error('Error calculating category breakdown:', error);
      return null;
    }
  }, [consolidatedData?.categoryTotals, filteredExpenses, CATEGORY_CONFIG, activeFilterCount, measureBreakdown]);

  // Loading skeleton component
  const CategorySkeleton = () => (
    <ProCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div>
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-start justify-between mb-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-5 w-10 rounded" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16 mb-1" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </ProCard>
  );

  // Error state component
  const ErrorState = () => (
    <ProCard className="p-8 text-center">
      <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-lg flex items-center justify-center">
        <AlertCircle className="h-6 w-6 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">Unable to load expenses</h3>
      <p className="text-slate-600 mb-4 text-sm">
        There was an error loading your expense data. Please try refreshing the page.
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.location.reload()}
      >
        <Loader2 className="h-4 w-4 mr-2" />
        Refresh Page
      </Button>
    </ProCard>
  );

  return (
    <div className={cn("space-y-6", className)}>
        {/* Show error state if there's an error */}
        {error && <ErrorState />}
        
        {/* Show loading skeleton while loading */}
        {isLoading && showCategoryBreakdown && <CategorySkeleton />}
        
        {/* Category Overview */}
        {!isLoading && !error && showCategoryBreakdown && Array.isArray(categoryBreakdownData) && categoryBreakdownData.length > 0 && (
        <ProCard accent="blue">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Category Breakdown</h3>
                  <p className="text-sm text-slate-600">Spending distribution by category</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCategoryBreakdown(false)}
                className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryBreakdownData?.map((item) => {
                if (!item) return null;
                const { key, dbAmount, filteredAmount, dbPercentage, filteredPercentage, config, isFiltered } = item;
                const Icon = config.icon;
                const displayAmount = isFiltered ? filteredAmount : dbAmount;
                const displayPercentage = isFiltered ? filteredPercentage : dbPercentage;
                
                return (
                  <div 
                    key={key} 
                    className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-lg ${config.iconBg}`}>
                        <Icon className={`h-5 w-5 ${config.textColor}`} />
                      </div>
                      <Badge 
                        variant="secondary"
                        className={`text-xs font-semibold ${config.textColor} bg-slate-50 border-slate-200`}
                      >
                        {displayPercentage.toFixed(0)}%
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 mb-1">{config.label}</h4>
                        <p className="text-xl font-bold text-slate-900">
                          {formatCurrency(displayAmount, consolidatedData?.currency || 'USD')}
                        </p>
                        {isFiltered && filteredAmount !== dbAmount && (
                          <p className="text-xs text-slate-500 mt-1">
                            of {formatCurrency(dbAmount, consolidatedData?.currency || 'USD')} total
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${config.color} transition-all duration-500 ease-out`}
                            style={{ width: `${Math.min(displayPercentage, 100)}%` }}
                          />
                        </div>
                        {isFiltered && filteredAmount !== dbAmount && (
                          <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden opacity-50">
                            <div 
                              className={`h-full rounded-full ${config.color} opacity-40`}
                              style={{ width: `${Math.min(dbPercentage, 100)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ProCard>
        )}

      {/* Main Expenses Section */}
      {!isLoading && !error && (
        <ProCard accent="neutral" className="overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Expense Management</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-sm text-slate-600">
                      {filteredExpenses.length} of {expenses.length} expenses
                    </span>
                    {totalAmountUSD > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {formatCurrency(totalAmountUSD, 'USD')} total
                      </Badge>
                    )}
                    {activeFilterCount > 0 && (
                      <Badge variant="default" className="text-xs">
                        {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    'transition-colors',
                    showFilters && 'bg-blue-50 border-blue-200 text-blue-700'
                  )}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
                {onAddExpense && (
                  <Button
                    size="sm"
                    onClick={onAddExpense}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Expense
                  </Button>
                )}
              </div>
            </div>
            
            {activeFilterCount > 0 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
                <span className="text-sm text-slate-600">Active filters applied</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilters({
                    search: '',
                    status: 'all' as const,
                    category: 'all'
                  })}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear all
                </Button>
              </div>
            )}
            
            {!showCategoryBreakdown && Array.isArray(categoryBreakdownData) && categoryBreakdownData.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCategoryBreakdown(true)}
                  className="text-sm text-slate-600 hover:text-slate-700"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Show category breakdown
                </Button>
              </div>
            )}
          </div>

          <div className="p-6">
            {/* Filters */}
            {showFilters && (
              <div className="mb-6 p-4 bg-slate-50 rounded-lg border">
                <h4 className="text-sm font-medium text-slate-900 mb-3">Filter Expenses</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Search Filter */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-700">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search by description..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-700">Payment Status</label>
                    <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as typeof prev.status }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="PAID">Paid</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="FAILED">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Category Filter */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-700">Category</label>
                    <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="materials">Materials</SelectItem>
                        <SelectItem value="labor">Labor</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                        <SelectItem value="permits">Permits</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Empty States */}
            {expenses.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 mx-auto mb-4 bg-slate-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No expenses yet</h3>
                <p className="text-slate-500 mb-4 max-w-sm mx-auto">Start tracking your project expenses to monitor budget utilization and maintain financial oversight.</p>
                {onAddExpense && (
                  <Button onClick={onAddExpense} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Expense
                  </Button>
                )}
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 mx-auto mb-4 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Search className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No matching expenses</h3>
                <p className="text-slate-500 mb-4 max-w-sm mx-auto">No expenses match your current filters. Try adjusting your search criteria or clearing filters.</p>
                <Button
                  variant="outline"
                  onClick={() => setFilters({
                    search: '',
                    status: 'all' as const,
                    category: 'all'
                  })}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear all filters
                </Button>
              </div>
            ) : (
              /* Expense List */
              <div className="space-y-3">
                {filteredExpenses.map((expense, index) => (
                  <SwipeableExpenseCard
                    key={expense.id}
                    expense={expense}
                    onEdit={onEditExpense}
                    onDelete={onDeleteExpense}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </div>
            )}
          </div>
        </ProCard>
      )}
    </div>
  );
}

// Export memoized component with custom comparison
export const BudgetExpensesList = React.memo(BudgetExpensesListComponent, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  const prevExpenses = prevProps.budgetExpenses || [];
  const nextExpenses = nextProps.budgetExpenses || [];
  
  if (prevExpenses.length !== nextExpenses.length) return false;
  
  const expensesEqual = prevExpenses.every((prev, index) => {
    const next = nextExpenses[index];
    return prev.id === next.id && 
           prev.description === next.description && 
           prev.amount === next.amount && 
           prev.category === next.category && 
           prev.payment_status === next.payment_status &&
           prev.created_at === next.created_at;
  });
  
  return expensesEqual && 
         prevProps.onEditExpense === nextProps.onEditExpense &&
         prevProps.onDeleteExpense === nextProps.onDeleteExpense &&
         prevProps.onAddExpense === nextProps.onAddExpense &&
         prevProps.className === nextProps.className;
});

export default BudgetExpensesList;