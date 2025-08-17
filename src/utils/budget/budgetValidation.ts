/**
 * Budget Validation Utilities
 * Handles validation and error handling for budget allocations and calculations
 * Part of Phase 2: Budget System Fix Implementation
 */

import type { ProjectBudgetData, BudgetExpense } from '@/types/projectDetails';

export interface BudgetValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  canProceed: boolean;
}

export interface BudgetValidationOptions {
  allowZeroBudget?: boolean;
  requireCurrency?: boolean;
  maxUtilization?: number; // percentage
}

/**
 * Validates project budget allocation
 */
export function validateBudgetAllocation(
  allocatedBudget: number,
  currency: string,
  options: BudgetValidationOptions = {}
): BudgetValidationResult {
  const {
    allowZeroBudget = false,
    requireCurrency = true,
    maxUtilization = 120
  } = options;

  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate budget amount
  if (!allocatedBudget || allocatedBudget < 0) {
    errors.push('Budget allocation must be a positive number');
  } else if (allocatedBudget === 0 && !allowZeroBudget) {
    errors.push('Budget allocation cannot be zero');
  } else if (allocatedBudget < 1000) {
    warnings.push('Budget allocation seems unusually low for a construction project');
  }

  // Validate currency
  if (requireCurrency && (!currency || currency.trim() === '')) {
    errors.push('Budget currency is required');
  }

  // Check for reasonable budget range
  if (allocatedBudget > 10000000) { // $10M
    warnings.push('Budget allocation is very large - please verify the amount');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    canProceed: errors.length === 0
  };
}

/**
 * Validates budget utilization and expense calculations
 */
export function validateBudgetUtilization(
  budgetData: Partial<ProjectBudgetData>,
  options: BudgetValidationOptions = {}
): BudgetValidationResult {
  const _maxUtilization = 1.5; // 150% - warning threshold
  const errors: string[] = [];
  const warnings: string[] = [];

  const {
    allocatedBudget = 0,
    totalExpenses = 0,
    spentAmount = 0,
    utilization = 0
  } = budgetData;

  // Validate budget allocation first
  const allocationValidation = validateBudgetAllocation(
    allocatedBudget,
    budgetData.allocatedCurrency || 'USD',
    options
  );
  
  if (!allocationValidation.isValid) {
    return allocationValidation;
  }

  // Validate expense calculations
  if (totalExpenses < 0) {
    errors.push('Total expenses cannot be negative');
  }

  if (spentAmount < 0) {
    errors.push('Spent amount cannot be negative');
  }

  if (spentAmount > totalExpenses) {
    warnings.push('Spent amount exceeds total planned expenses');
  }

  // Validate utilization
  if (utilization > _maxUtilization) {
    warnings.push(`Budget utilization is very high: ${(utilization * 100).toFixed(1)}% (threshold: ${(_maxUtilization * 100).toFixed(0)}%)`);
  } else if (utilization > 100) {
    warnings.push(`Budget is over-allocated (${utilization.toFixed(1)}%)`);
  } else if (utilization > 90) {
    warnings.push(`Budget utilization is high (${utilization.toFixed(1)}%)`);
  }

  // Check for inconsistent calculations
  if (allocatedBudget > 0 && totalExpenses > 0) {
    const calculatedUtilization = (totalExpenses / allocatedBudget) * 100;
    if (Math.abs(calculatedUtilization - utilization) > 1) {
      warnings.push('Budget utilization calculation may be inconsistent');
    }
  }

  return {
    isValid: errors.length === 0,
    errors: [...allocationValidation.errors, ...errors],
    warnings: [...allocationValidation.warnings, ...warnings],
    canProceed: errors.length === 0
  };
}

/**
 * Validates individual budget expense
 */
export function validateBudgetExpense(
  expense: Partial<BudgetExpense>
): BudgetValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!expense.amount || expense.amount <= 0) {
    errors.push('Expense amount must be greater than zero');
  }

  if (!expense.currency) {
    errors.push('Expense currency is required');
  }

  if (!expense.transaction_type) {
    errors.push('Transaction type is required');
  }

  if (!expense.category || expense.category.trim() === '') {
    errors.push('Expense category is required');
  }

  if (!expense.payment_status) {
    errors.push('Payment status is required');
  }

  // Validation warnings
  if (expense.amount && expense.amount > 100000) {
    warnings.push('Large expense amount - please verify');
  }

  if (expense.base_amount && expense.amount && expense.currency !== 'USD') {
    const conversionRate = expense.base_amount / expense.amount;
    if (conversionRate < 0.1 || conversionRate > 10) {
      warnings.push('Currency conversion rate seems unusual');
    }
  }

  // Date validations
  if (expense.payment_date) {
    const paymentDate = new Date(expense.payment_date);
    const now = new Date();
    
    if (paymentDate > now) {
      warnings.push('Payment date is in the future');
    }
    
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);
    
    if (paymentDate < oneYearAgo) {
      warnings.push('Payment date is more than one year old');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    canProceed: errors.length === 0
  };
}

/**
 * Creates a safe fallback budget data object when validation fails
 */
export function createFallbackBudgetData(
  allocatedBudget: number = 0,
  currency: string = 'USD'
): ProjectBudgetData {
  return {
    allocatedBudget: Math.max(0, allocatedBudget),
    allocatedCurrency: currency,
    totalExpenses: 0,
    spentAmount: 0,
    pendingAmount: 0,
    approvedAmount: 0,
    remainingBudget: Math.max(0, allocatedBudget),
    utilization: 0,
    status: allocatedBudget > 0 ? 'healthy' : 'critical',
    baseAmounts: {
      allocated: Math.max(0, allocatedBudget),
      totalExpenses: 0,
      spent: 0,
      pending: 0,
      approved: 0,
      remaining: Math.max(0, allocatedBudget)
    }
  };
}

/**
 * Validates and sanitizes budget data with comprehensive error handling
 */
export function validateAndSanitizeBudgetData(
  rawBudgetData: Partial<ProjectBudgetData>,
  options: BudgetValidationOptions = {}
): {
  budgetData: ProjectBudgetData;
  validation: BudgetValidationResult;
} {
  // First validate the raw data
  const validation = validateBudgetUtilization(rawBudgetData, options);
  
  // Create sanitized budget data
  const budgetData: ProjectBudgetData = {
    allocatedBudget: Math.max(0, rawBudgetData.allocatedBudget || 0),
    allocatedCurrency: rawBudgetData.allocatedCurrency || 'USD',
    totalExpenses: Math.max(0, rawBudgetData.totalExpenses || 0),
    spentAmount: Math.max(0, rawBudgetData.spentAmount || 0),
    pendingAmount: Math.max(0, rawBudgetData.pendingAmount || 0),
    approvedAmount: Math.max(0, rawBudgetData.approvedAmount || 0),
    remainingBudget: rawBudgetData.remainingBudget || 0,
    utilization: Math.max(0, rawBudgetData.utilization || 0),
    status: rawBudgetData.status || 'healthy',
    baseAmounts: {
      allocated: Math.max(0, rawBudgetData.baseAmounts?.allocated || rawBudgetData.allocatedBudget || 0),
      totalExpenses: Math.max(0, rawBudgetData.baseAmounts?.totalExpenses || rawBudgetData.totalExpenses || 0),
      spent: Math.max(0, rawBudgetData.baseAmounts?.spent || rawBudgetData.spentAmount || 0),
      pending: Math.max(0, rawBudgetData.baseAmounts?.pending || rawBudgetData.pendingAmount || 0),
      approved: Math.max(0, rawBudgetData.baseAmounts?.approved || rawBudgetData.approvedAmount || 0),
      remaining: rawBudgetData.baseAmounts?.remaining || rawBudgetData.remainingBudget || 0
    }
  };

  // Recalculate derived values to ensure consistency
  budgetData.remainingBudget = budgetData.allocatedBudget - budgetData.totalExpenses;
  budgetData.utilization = budgetData.allocatedBudget > 0 
    ? (budgetData.totalExpenses / budgetData.allocatedBudget) * 100 
    : 0;
  
  // Update base amounts
  budgetData.baseAmounts.remaining = budgetData.baseAmounts.allocated - budgetData.baseAmounts.totalExpenses;

  // Determine status based on utilization
  if (budgetData.utilization > 100) {
    budgetData.status = 'over-budget';
  } else if (budgetData.utilization > 90) {
    budgetData.status = 'critical';
  } else if (budgetData.utilization > 75) {
    budgetData.status = 'warning';
  } else {
    budgetData.status = 'healthy';
  }

  return {
    budgetData,
    validation
  };
}
