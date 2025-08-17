/**
 * Budget components barrel exports
 * Centralized exports for budget-related components extracted from ProjectDetailsContent
 */

export { BudgetOverviewCard } from './BudgetOverviewCard';
export { BudgetExpensesList } from './BudgetExpensesList';
export { BudgetModal } from './BudgetModal';
export { default as QuickExpenseTemplates } from './QuickExpenseTemplates';
export { default as ExpenseFilters } from './ExpenseFilters';
export { default as SwipeableExpenseCard } from './SwipeableExpenseCard';

// Re-export budget-related types for convenience
export type { 
  BudgetExpense, 
  BudgetSummary, 
  BudgetOverviewProps, 
  BudgetExpensesListProps 
} from '@/types/projectDetails';