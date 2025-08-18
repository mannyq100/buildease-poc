/**
 * BudgetExpensesList component
 * Extracted from ProjectDetailsContent.tsx - Budget Expenses Section
 * Displays list of budget expenses with edit/delete actions
 * Mobile-optimized list layout with proper touch targets
 * Performance optimized with React.memo and memoized computations
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Plus, Search, X, TrendingUp, BarChart3, Hammer, Users, Truck, FileText, Palette, MoreHorizontal } from 'lucide-react';
import { cn } from '@/utils/core/ui';
import { useConsolidatedProjectData } from '@/hooks/queries/useConsolidatedProjectData';
// Removed ExpenseFilters import as we're using inline filter state
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
  const { data: consolidatedData } = useConsolidatedProjectData(projectId || '');
  
  // Filtering state with modern minimal approach
  const [filters, setFilters] = React.useState({
    search: '',
    status: 'all' as 'all' | 'paid' | 'pending' | 'overdue',
    dateRange: 'all' as 'all' | 'today' | 'this-week' | 'this-month' | 'last-30-days',
    amountRange: 'all' as 'all' | 'under-100' | '100-500' | '500-1000' | 'over-1000',
    category: 'all'
  });
  const [showFilters, setShowFilters] = React.useState(false);
  const [showCategoryBreakdown, setShowCategoryBreakdown] = React.useState(true);
  
  // Use real data from Supabase - no mock data fallback
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

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = (() => {
        switch (filters.dateRange) {
          case 'today':
            return new Date(now.setHours(0, 0, 0, 0));
          case 'this-week': {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            return startOfWeek;
          }
          case 'this-month':
            return new Date(now.getFullYear(), now.getMonth(), 1);
          case 'last-30-days':
            return new Date(now.setDate(now.getDate() - 30));
          default:
            return null;
        }
      })();

      if (filterDate) {
        filtered = filtered.filter(expense => 
          new Date(expense.created_at) >= filterDate
        );
      }
    }

    // Apply amount range filter
    if (filters.amountRange !== 'all') {
      filtered = filtered.filter(expense => {
        const amount = expense.amount;
        switch (filters.amountRange) {
          case 'under-100':
            return amount < 100;
          case '100-500':
            return amount >= 100 && amount <= 500;
          case '500-1000':
            return amount >= 500 && amount <= 1000;
          case 'over-1000':
            return amount > 1000;
          default:
            return true;
        }
      });
    }

    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(expense => expense.category === filters.category);
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

  // Removed unused _formatDate function

  // Category configuration for simplified breakdown with modern styling
  const CATEGORY_CONFIG = React.useMemo(() => ({
    material_costs: { label: 'Materials', icon: Hammer, color: 'bg-blue-500', bgColor: 'bg-white', textColor: 'text-blue-600', borderColor: 'border-blue-100', iconBg: 'bg-blue-50' },
    labor_costs: { label: 'Labor', icon: Users, color: 'bg-emerald-500', bgColor: 'bg-white', textColor: 'text-emerald-600', borderColor: 'border-emerald-100', iconBg: 'bg-emerald-50' },
    equipment_costs: { label: 'Equipment', icon: Truck, color: 'bg-amber-500', bgColor: 'bg-white', textColor: 'text-amber-600', borderColor: 'border-amber-100', iconBg: 'bg-amber-50' },
    permit_costs: { label: 'Permits', icon: FileText, color: 'bg-purple-500', bgColor: 'bg-white', textColor: 'text-purple-600', borderColor: 'border-purple-100', iconBg: 'bg-purple-50' },
    design_costs: { label: 'Design', icon: Palette, color: 'bg-pink-500', bgColor: 'bg-white', textColor: 'text-pink-600', borderColor: 'border-pink-100', iconBg: 'bg-pink-50' },
    other_costs: { label: 'Other', icon: MoreHorizontal, color: 'bg-slate-500', bgColor: 'bg-white', textColor: 'text-slate-600', borderColor: 'border-slate-100', iconBg: 'bg-slate-50' }
  }), []);

  // Removed unused _getCategoryColor function

  // Memoized computed values - use base_amount for consistent USD totals
  // Always display totals in USD for consistency across multi-currency projects
  const totalAmountUSD = React.useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + (expense.base_amount || expense.amount), 0);
  }, [filteredExpenses]);

  // Removed unused _totalsByCurrency calculation

  // Get active filter count for badge
  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status !== 'all') count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.amountRange !== 'all') count++;
    if (filters.category !== 'all') count++;
    return count;
  }, [filters]);

  // Simplified category breakdown data
  const categoryBreakdownData = React.useMemo(() => {
    if (!consolidatedData?.categoryTotals) return null;
    
    const totalAmount = Object.values(consolidatedData.categoryTotals).reduce((sum, amount) => sum + amount, 0);
    if (totalAmount === 0) return null;
    
    return Object.entries(consolidatedData.categoryTotals)
      .filter(([_, amount]) => amount > 0)
      .map(([key, amount]) => ({
        key: key as keyof typeof CATEGORY_CONFIG,
        amount,
        percentage: (amount / totalAmount) * 100,
        config: CATEGORY_CONFIG[key as keyof typeof CATEGORY_CONFIG]
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4); // Show top 4 categories only
  }, [consolidatedData?.categoryTotals, CATEGORY_CONFIG]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Simplified Category Breakdown Section */}
      {showCategoryBreakdown && categoryBreakdownData && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Category Overview
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCategoryBreakdown(false)}
                className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-4">
              {categoryBreakdownData.map(({ key, amount, percentage, config }) => {
                const Icon = config.icon;
                return (
                  <div key={key} className={`group p-4 rounded-xl ${config.bgColor} ${config.borderColor} border hover:shadow-sm transition-all duration-200 hover:scale-[1.02]`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${config.iconBg} group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className={`h-4 w-4 ${config.textColor}`} />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{config.label}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-slate-900">
                          {formatCurrency(amount, consolidatedData?.currency || 'USD')}
                        </span>
                        <Badge variant="secondary" className={`text-xs ${config.textColor} bg-slate-50 border-slate-200 font-medium`}>
                          {percentage.toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full ${config.color} rounded-full transition-all duration-500 ease-out`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Expenses Card */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-white to-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg font-semibold">Expenses</CardTitle>
              {totalAmountUSD > 0 && (
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  {formatCurrency(totalAmountUSD, 'USD')}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'h-8 px-3 transition-all duration-200',
                  showFilters 
                    ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' 
                    : 'hover:bg-slate-50'
                )}
              >
                <Filter className="h-3 w-3 mr-1" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="ml-2 h-5 w-5 p-0 bg-blue-600 text-white text-xs flex items-center justify-center"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
              {onAddExpense && (
                <Button
                  size="sm"
                  onClick={onAddExpense}
                  className="h-8 px-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              )}
            </div>
          </div>
          
          {/* Modern Filter Summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <TrendingUp className="h-4 w-4" />
              <span>
                {filteredExpenses.length} of {expenses.length} expenses
              </span>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilters({
                    search: '',
                    status: 'all',
                    dateRange: 'all',
                    amountRange: 'all',
                    category: 'all'
                  })}
                  className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  Clear all
                </Button>
              )}
            </div>
            {!showCategoryBreakdown && categoryBreakdownData && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCategoryBreakdown(true)}
                className="h-6 px-2 text-xs text-slate-600 hover:text-slate-700 hover:bg-slate-50"
              >
                <BarChart3 className="h-3 w-3 mr-1" />
                Show categories
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Modern Minimal Filters */}
          {showFilters && (
            <div className="mb-6 p-4 bg-slate-50/50 rounded-lg border border-slate-200/60">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Search Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-700">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search expenses..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-9 h-9 bg-white border-slate-200 focus:border-blue-300 focus:ring-blue-200"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-700">Status</label>
                  <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger className="h-9 bg-white border-slate-200 focus:border-blue-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-700">Category</label>
                  <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger className="h-9 bg-white border-slate-200 focus:border-blue-300">
                      <SelectValue />
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

          {/* Empty State */}
          {expenses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-slate-500">
                <div className="text-sm">No expenses recorded yet</div>
                {onAddExpense && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onAddExpense}
                    className="mt-3"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Expense
                  </Button>
                )}
              </div>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-slate-500">
                <div className="text-sm">No expenses match your filters</div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilters({
                    search: '',
                    status: 'all',
                    dateRange: 'all',
                    amountRange: 'all',
                    category: 'all'
                  })}
                  className="mt-3 text-blue-600 hover:text-blue-700"
                >
                  Clear filters
                </Button>
              </div>
            </div>
          ) : (
            /* Expense List */
            <div className="space-y-3">
              {filteredExpenses.map((expense) => (
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
        </CardContent>
      </Card>
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