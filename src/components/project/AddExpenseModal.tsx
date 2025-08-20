// This component has been deprecated and replaced with the standardized BudgetModal
// from /src/pages/ProjectDetails/components/Budget/BudgetModal.tsx
// 
// The BudgetModal provides:
// - Better type safety with BudgetExpense/BudgetFormData types
// - Consistent UI/UX with the main budget management system
// - Proper currency handling and validation
// - Activity logging integration
//
// Migration guide:
// - Replace AddExpenseModal imports with BudgetModal
// - Update props: onAddExpense -> onSave, projectName -> project
// - Handle BudgetFormData type instead of legacy Expense type
//
// This file is kept for reference and will be removed in a future cleanup.

export {}; // Make this a module to avoid TS errors