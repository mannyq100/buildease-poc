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
import { Filter, Plus } from 'lucide-react';
import { cn } from '@/utils/core/ui';
import ExpenseFilters, { type ExpenseFiltersState } from './ExpenseFilters';
import SwipeableExpenseCard from './SwipeableExpenseCard';
import type { BudgetExpense } from '@/types/projectDetails';

interface BudgetExpensesListProps {
  budgetExpenses?: BudgetExpense[];
  onEditExpense: (expense: BudgetExpense) => void;
  onDeleteExpense: (expenseId: string) => void;
  onAddExpense?: () => void;
  className?: string;
}

function BudgetExpensesListComponent({
  budgetExpenses = [],
  onEditExpense,
  onDeleteExpense,
  onAddExpense,
  className
}: BudgetExpensesListProps) {
  // Filtering state
  const [filters, setFilters] = React.useState<ExpenseFiltersState>({
    search: '',
    status: 'all',
    dateRange: 'all',
    amountRange: 'all',
    category: 'all'
  });
  const [showFilters, setShowFilters] = React.useState(false);
  // Use real data from Supabase - no mock data fallback
  const expenses = budgetExpenses || [];

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
    } catch (error) {
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

  const _formatDate = React.useCallback((dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  }, []);

  const _getCategoryColor = React.useCallback((category: string) => {
    switch (category.toLowerCase()) {
      case 'materials':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'labor':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'equipment':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  }, []);

  // Memoized computed values - use base_amount for consistent USD totals
  // Always display totals in USD for consistency across multi-currency projects
  const totalAmountUSD = React.useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + (expense.base_amount || expense.amount), 0);
  }, [filteredExpenses]);

  // Also calculate totals by currency for detailed breakdown
  const _totalsByCurrency = React.useMemo(() => {
    const totals: Record<string, number> = {};
    filteredExpenses.forEach(expense => {
      const currency = expense.currency || 'USD';
      totals[currency] = (totals[currency] || 0) + expense.amount;
    });
    return totals;
  }, [filteredExpenses]);

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Expenses</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'h-8 px-3',
                showFilters && 'bg-blue-50 border-blue-200 text-blue-700'
              )}
            >
              <Filter className="h-3 w-3 mr-1" />
              Filters
              {(filters.search || filters.status !== 'all' || filters.dateRange !== 'all' || 
                filters.amountRange !== 'all' || filters.category !== 'all') && (
                <span className="ml-1 h-2 w-2 bg-blue-600 rounded-full" />
              )}
            </Button>
            {onAddExpense && (
              <Button
                size="sm"
                onClick={onAddExpense}
                className="h-8 px-3 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            )}
          </div>
        </div>
        
        {/* Filter Summary */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {filteredExpenses.length} of {expenses.length} expenses
          </span>
          {totalAmountUSD > 0 && (
            <div className="text-sm text-muted-foreground">
              Total: {formatCurrency(totalAmountUSD, 'USD')}
              {filteredExpenses.length > 0 && ` • ${filteredExpenses.length} expense${filteredExpenses.length === 1 ? '' : 's'}`}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-4">
            <ExpenseFilters
              expenses={expenses}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>
        )}

        {/* Empty State */}
        {expenses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">
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
            <div className="text-gray-500">
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