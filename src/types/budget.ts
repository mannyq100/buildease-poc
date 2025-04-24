// src/types/budget.ts
export interface BudgetItem {
  id: number;
  type: 'expense' | 'income';
  description: string;
  category: string; // Consider defining specific categories later
  amount: number;
  date: string; // ISO format: YYYY-MM-DD
  status: 'planned' | 'incurred' | 'paid' | 'received'; // Status values
  notes?: string;
}

// Optional: Define common categories if needed
// export const budgetCategories = ['Labor', 'Materials', 'Subcontractor', 'Permits', 'Equipment Rental', 'Income Payment', 'Other']
// export const budgetStatuses = ['planned', 'incurred', 'paid', 'received'];
