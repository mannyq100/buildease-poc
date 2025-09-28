/**
 * Utility functions for expense management
 */
import { Expense, TopCategory } from '@/types/expenses';

// Currency formatting moved to @/utils/core/currencyUtils
// Use formatCurrency from there for better currency support

// Date formatting moved to @/utils/core/date
// Use formatDate from there for consistent date handling

/**
 * Calculate expenses grouped by category
 * @param expenses List of expenses to process
 * @returns Record with category names as keys and total amounts as values
 */
export function calculateExpensesByCategory(expenses: Expense[]): Record<string, number> {
  return expenses.reduce((acc: Record<string, number>, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});
}

/**
 * Find the top spending category
 * @param expensesByCategory Record with category names as keys and total amounts as values
 * @returns The top category and its amount
 */
export function findTopCategory(expensesByCategory: Record<string, number>): TopCategory {
  return Object.entries(expensesByCategory).reduce(
    (max, [category, amount]) => amount > (max.amount || 0) ? { category, amount } : max, 
    {} as TopCategory
  );
}

/**
 * Prepare data for time series chart from expenses
 * @param expenses List of expenses to process
 * @returns Array of time series data points
 */
export function prepareTimeSeriesData(expenses: Expense[]): { date: string, amount: number }[] {
  // Group expenses by date
  const expensesByDate: Record<string, number> = {};
  
  expenses.forEach(expense => {
    const date = expense.date;
    expensesByDate[date] = (expensesByDate[date] || 0) + expense.amount;
  });
  
  // Sort dates and create chart data
  return Object.entries(expensesByDate)
    .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
    .map(([date, amount]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount
    }));
}

/**
 * Prepare data for project chart from expenses
 * @param expenses List of expenses to process
 * @returns Array of project data points
 */
export function prepareProjectChartData(expenses: Expense[]): { name: string, amount: number }[] {
  const data: Record<string, number> = {};
  
  expenses.forEach(expense => {
    if (expense.project !== 'All Projects') {
      data[expense.project] = (data[expense.project] || 0) + expense.amount;
    }
  });
  
  return Object.entries(data).map(([project, amount]) => ({
    name: project,
    amount
  }));
}

/**
 * Calculate growth insights based on expenses
 * @param expenses List of expenses to process
 * @returns Growth insights data
 */
export function calculateGrowthInsights(expenses: Expense[]): {
  thisMonth: number;
  lastMonth: number;
  growthRate: number;
  increasing: boolean;
} {
  // Get this month's expenses
  const thisMonth = new Date();
  const thisMonthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
  const thisMonthExpenses = expenses.filter(
    expense => new Date(expense.date) >= thisMonthStart
  ).reduce((sum, expense) => sum + expense.amount, 0);
  
  // Get last month's expenses
  const lastMonth = new Date(thisMonth);
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
  const lastMonthEnd = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 0);
  const lastMonthExpenses = expenses.filter(
    expense => {
      const date = new Date(expense.date);
      return date >= lastMonthStart && date <= lastMonthEnd;
    }
  ).reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate growth rate
  const growthRate = lastMonthExpenses > 0 
    ? ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 
    : 0;
  
  return {
    thisMonth: thisMonthExpenses,
    lastMonth: lastMonthExpenses,
    growthRate,
    increasing: growthRate > 0
  };
} 