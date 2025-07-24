/**
 * BudgetExpensesList component
 * Extracted from ProjectDetailsContent.tsx - Budget Expenses Section
 * Displays list of budget expenses with edit/delete actions
 * Mobile-optimized list layout with proper touch targets
 * Performance optimized with React.memo and memoized computations
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit3, X, Calendar, Tag } from 'lucide-react';
import { cn } from '@/utils/core/ui';
import type { BudgetExpense } from '@/types/projectDetails';

interface BudgetExpensesListProps {
  budgetExpenses?: BudgetExpense[];
  onEditExpense: (expense: BudgetExpense) => void;
  onDeleteExpense: (expenseId: string) => void;
  className?: string;
}

function BudgetExpensesListComponent({
  budgetExpenses = [],
  onEditExpense,
  onDeleteExpense,
  className
}: BudgetExpensesListProps) {
  // Mock data for demonstration - will be replaced by real data from budgetExpenses prop
  const mockExpenses = [
    { 
      id: '1', 
      name: 'Foundation materials', 
      amount: 15000, 
      category: 'Materials', 
      date: '2024-01-15',
      description: 'Concrete, rebar, and foundational supplies'
    },
    { 
      id: '2', 
      name: 'Electrical supplies', 
      amount: 8500, 
      category: 'Materials', 
      date: '2024-01-14',
      description: 'Wiring, outlets, and electrical components'
    },
    { 
      id: '3', 
      name: 'Labor costs', 
      amount: 12000, 
      category: 'Labor', 
      date: '2024-01-13',
      description: 'Professional construction crew services'
    }
  ];

  // Use real data if available, otherwise fallback to mock data
  const expenses = budgetExpenses.length > 0 ? budgetExpenses : mockExpenses;

  // Memoized formatter functions to prevent recreation on every render
  const formatCurrency = React.useMemo(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }, []);

  const formatDate = React.useCallback((dateString: string) => {
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

  const getCategoryColor = React.useCallback((category: string) => {
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

  // Memoized computed values
  const totalAmount = React.useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  if (expenses.length === 0) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="text-sm font-medium text-slate-700">Recent Expenses</div>
        <div className="text-center py-8 text-slate-500">
          <div className="text-sm text-slate-600">No expenses recorded yet</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="text-sm font-medium text-slate-700 flex items-center justify-between">
        <span>Recent Expenses</span>
        <span className="text-xs text-slate-500">{expenses.length} items</span>
      </div>
      
      <div className="space-y-2">
        {expenses.map((expense) => (
          <div 
            key={expense.id} 
            className="group relative bg-white/50 hover:bg-white/70 transition-all duration-200 rounded-lg border border-slate-200/50 hover:border-slate-300/60 hover:shadow-sm"
          >
            {/* Mobile-first layout */}
            <div className="p-3 sm:p-4">
              <div className="flex items-start justify-between gap-3">
                {/* Expense Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-sm font-medium text-slate-900 truncate">
                      {expense.name}
                    </h4>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEditExpense(expense)}
                        className="h-8 w-8 p-0 hover:bg-buildease-blue-100 hover:text-buildease-blue-700"
                        aria-label={`Edit ${expense.name}`}
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeleteExpense(expense.id)}
                        className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700"
                        aria-label={`Delete ${expense.name}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Expense Meta Information */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-2">
                    <div className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      <span 
                        className={cn(
                          "px-2 py-0.5 rounded-full border text-xs font-medium",
                          getCategoryColor(expense.category)
                        )}
                      >
                        {expense.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(expense.date)}</span>
                    </div>
                  </div>

                  {/* Expense Description - if available */}
                  {expense.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                      {expense.description}
                    </p>
                  )}
                </div>

                {/* Amount Display */}
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-semibold text-slate-900">
                    {formatCurrency.format(expense.amount)}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Touch Actions - Alternative to hover actions */}
            <div className="sm:hidden border-t border-slate-200/50 bg-slate-50/30">
              <div className="flex">
                <button
                  onClick={() => onEditExpense(expense)}
                  className="flex-1 py-2 px-3 text-xs font-medium text-buildease-blue-700 hover:bg-buildease-blue-50 transition-colors"
                >
                  Edit
                </button>
                <div className="w-px bg-slate-200" />
                <button
                  onClick={() => onDeleteExpense(expense.id)}
                  className="flex-1 py-2 px-3 text-xs font-medium text-red-700 hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary footer for multiple expenses */}
      {expenses.length > 1 && (
        <div className="mt-4 pt-3 border-t border-slate-200/50">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600 font-medium">Total Expenses</span>
            <span className="font-bold text-slate-900">
              {formatCurrency.format(totalAmount)}
            </span>
          </div>
        </div>
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
           prev.name === next.name && 
           prev.amount === next.amount && 
           prev.category === next.category && 
           prev.date === next.date;
  });
  
  return expensesEqual && 
         prevProps.onEditExpense === nextProps.onEditExpense &&
         prevProps.onDeleteExpense === nextProps.onDeleteExpense &&
         prevProps.className === nextProps.className;
});