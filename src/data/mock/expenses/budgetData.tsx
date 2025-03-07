/**
 * Mock data for project budgets
 * Contains budget allocations and spending data for different projects
 */
import { BudgetData } from '@/types/expenses';

/**
 * Budget data for Villa Construction project
 */
export const VILLA_CONSTRUCTION_BUDGET: BudgetData = {
  total: 120000,
  spent: 10360,
  remaining: 109640,
  allocations: [
    { category: 'Materials', amount: 50000, spent: 4960 },
    { category: 'Labor', amount: 30000, spent: 1950 },
    { category: 'Equipment', amount: 15000, spent: 1500 },
    { category: 'Professional Services', amount: 10000, spent: 1200 },
    { category: 'Permits', amount: 5000, spent: 750 },
    { category: 'Miscellaneous', amount: 10000, spent: 0 }
  ]
};

/**
 * Budget data for Office Renovation project
 */
export const OFFICE_RENOVATION_BUDGET: BudgetData = {
  total: 45000,
  spent: 4000,
  remaining: 41000,
  allocations: [
    { category: 'Materials', amount: 25000, spent: 4000 },
    { category: 'Labor', amount: 10000, spent: 0 },
    { category: 'Equipment', amount: 5000, spent: 0 },
    { category: 'Miscellaneous', amount: 5000, spent: 0 }
  ]
};

/**
 * Combined budget data for all projects
 */
export const ALL_PROJECTS_BUDGET: BudgetData = {
  total: 165000,
  spent: 14360,
  remaining: 150640,
  allocations: [
    { category: 'Materials', amount: 75000, spent: 8960 },
    { category: 'Labor', amount: 40000, spent: 1950 },
    { category: 'Equipment', amount: 20000, spent: 1500 },
    { category: 'Professional Services', amount: 10000, spent: 1200 },
    { category: 'Permits', amount: 5000, spent: 750 },
    { category: 'Miscellaneous', amount: 15000, spent: 0 }
  ]
};

/**
 * Get budget data for a specific project
 * @param project The project name
 * @returns Budget data for the specified project
 */
export function getProjectBudget(project: string): BudgetData {
  switch (project) {
    case 'Villa Construction':
      return VILLA_CONSTRUCTION_BUDGET;
    case 'Office Renovation':
      return OFFICE_RENOVATION_BUDGET;
    default:
      return ALL_PROJECTS_BUDGET;
  }
} 