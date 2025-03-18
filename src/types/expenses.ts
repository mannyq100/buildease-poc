import React from 'react';

/**
 * Expense-related type definitions
 * Used for expense management features
 */

/**
 * Represents an expense entry in the system
 */
export interface Expense {
  id: number;
  description: string;
  amount: number;
  date: string;
  category: string;
  project: string;
  status: 'approved' | 'pending' | 'rejected';
  receiptUploaded: boolean;
  notes?: string;
}

/**
 * Represents a new expense entry
 */
export interface NewExpense {
  description: string;
  amount: number;
  date: string;
  category: string;
  project: string;
  notes?: string;
}

/**
 * Represents a top spending category with its amount
 */
export interface TopCategory {
  category: string;
  amount: number;
}

/**
 * Represents budget data with allocations
 */
export interface BudgetData {
  total: number;
  spent: number;
  remaining: number;
}

/**
 * Represents a data point for time series charts
 */
export interface TimeSeriesDataPoint {
  date: string;
  value: number;
}

/**
 * Represents insight data for the dashboard
 */
export interface ExpenseInsight {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: 'green' | 'blue' | 'amber' | 'red' | 'purple';
}

/**
 * Represents an export format option
 */
export interface ExportOption {
  id: string;
  label: string;
  icon: React.ComponentType;
} 