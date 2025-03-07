/**
 * Types for expense management and financial data
 */

/**
 * Represents an expense entry in the system
 */
export interface Expense {
  id: number;
  description: string;
  category: string;
  amount: number;
  date: string;
  project: string;
  phase: string;
  paymentMethod: string;
  vendor: string;
  receiptUploaded: boolean;
  receiptUrl?: string;
  status: 'approved' | 'pending' | 'rejected';
  selected?: boolean;
}

/**
 * Represents a top spending category with its amount
 */
export interface TopCategory {
  category?: string;
  amount?: number;
}

/**
 * Represents budget data with allocations
 */
export interface BudgetData {
  total: number;
  spent: number;
  remaining: number;
  allocations?: {
    category: string;
    amount: number;
    spent: number;
  }[];
}

/**
 * Represents a data point for time series charts
 */
export interface TimeSeriesDataPoint {
  date: string;
  amount: number;
  project?: string;
  category?: string;
}

/**
 * Represents insight data for the dashboard
 */
export interface ExpenseInsight {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

/**
 * Represents an export format option
 */
export interface ExportOption {
  id: string;
  label: string;
  icon: React.ComponentType;
} 