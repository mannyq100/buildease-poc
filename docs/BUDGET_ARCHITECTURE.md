# Budget Architecture & Data Flow

## Overview

The BuildEase budget and expense tracking system has been refactored to provide accurate financial tracking with proper separation of concerns between allocated budgets and actual expenses.

## Core Architecture

### 1. Data Separation

**Project Budget Allocation** (Approved Budget)
- Stored in `projects.budget` field
- Represents the total approved budget for the project
- Used as the baseline for all budget calculations and utilization metrics

**Expense Tracking** (Actual Spending)
- Stored in `budget_expenses` table
- Represents individual expense items and transactions
- Aggregated to calculate total expenses, spent amounts, and pending costs

### 2. Currency Handling

**Base Amount Strategy**
- All calculations use `base_amount` (USD) for consistency
- Original currency and amount preserved for display purposes
- Currency conversion handled server-side for accuracy
- Client-side rough estimates used for optimistic UI updates

### 3. Key Components

#### Data Layer
- `useConsolidatedProjectData.ts` - Fetches and consolidates project data
- `useMemoizedCalculations.ts` - Calculates budget metrics with memoization
- `useBudget.ts` - Mutation hooks for expense CRUD operations

#### UI Layer
- `BudgetOverviewCard.tsx` - Displays budget summary and utilization
- `BudgetExpensesList.tsx` - Lists expenses with filtering and totals
- `BudgetModal.tsx` - Form for creating/editing expenses

#### Validation Layer
- `budgetValidation.ts` - Validates budget data and expense entries
- Provides warnings for unusual values and data inconsistencies

## Data Flow

### Budget Calculation Flow

1. **Project Budget**: Retrieved from `projects.budget`
2. **Expense Aggregation**: Sum of `budget_expenses.base_amount` by status
   - Spent: `PAID` + `COMPLETED` expenses
   - Pending: `PENDING` + `APPROVED` expenses
   - Total: All expenses regardless of status
3. **Utilization**: `(Total Expenses / Allocated Budget) * 100`
4. **Remaining**: `Allocated Budget - Total Expenses`

### Currency Conversion Flow

1. **Input**: User enters amount in original currency
2. **Optimistic Update**: Client estimates USD conversion for immediate UI feedback
3. **Server Processing**: Accurate conversion calculated and stored as `base_amount`
4. **Display**: Original currency shown to user, USD used for calculations

## Key Interfaces

### ProjectBudgetData
```typescript
interface ProjectBudgetData {
  allocatedBudget: number;        // Project budget allocation
  totalExpenses: number;          // Sum of all expenses (base_amount)
  spentAmount: number;           // Sum of paid expenses (base_amount)
  pendingAmount: number;         // Sum of pending expenses (base_amount)
  remainingBudget: number;       // allocatedBudget - totalExpenses
  utilization: number;           // (totalExpenses / allocatedBudget) * 100
  currency: string;              // Project currency
}
```

### BudgetExpense
```typescript
interface BudgetExpense {
  id: string;
  project_id: string;
  description: string;
  amount: number;                // Original amount
  base_amount: number;           // USD equivalent
  currency: Currency;            // Original currency
  category: string;
  transaction_type: TransactionType;
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod;
  payment_date?: string;
  created_at: string;
  updated_at: string;
}
```

## Validation Rules

### Budget Allocation
- Must be positive number
- Cannot be zero for active projects
- Warnings for unusually high/low amounts

### Expense Validation
- Amount must be positive
- Currency must be valid ISO code
- Payment date cannot be in future
- Base amount should align with currency conversion rates

### Utilization Warnings
- > 90%: High utilization warning
- > 100%: Over-budget warning
- > 150%: Critical over-budget warning

## Performance Optimizations

### Memoization
- Budget calculations memoized based on expense data changes
- Filtered expense lists cached to prevent re-computation
- Currency formatting memoized for repeated use

### Optimistic Updates
- Immediate UI feedback with estimated conversions
- Server reconciliation for accurate final values
- Rollback mechanism for failed operations

## Error Handling

### Data Validation
- Client-side validation for immediate feedback
- Server-side validation for data integrity
- Graceful fallbacks for missing or invalid data

### Currency Conversion
- Fallback to original amount if conversion fails
- Warning indicators for unusual conversion rates
- Manual override capability for edge cases

## Testing Scenarios

### Multi-Currency Projects
- Mixed currency expenses with proper USD aggregation
- Currency conversion accuracy validation
- Display consistency between original and calculated amounts

### Budget Utilization
- Accurate percentage calculations
- Proper warning thresholds
- Edge cases (zero budget, negative expenses)

### Data Integrity
- Expense totals match individual expense sums
- Budget allocation separate from expense aggregation
- Consistent currency handling across all components

## Migration Notes

### Breaking Changes
- Budget calculation logic changed from expense-sum to project allocation
- All calculations now use `base_amount` for consistency
- Activity logging temporarily disabled pending service integration

### Backward Compatibility
- Existing expense data preserved
- Graceful handling of missing `base_amount` fields
- Fallback to original amount when USD conversion unavailable

## Future Enhancements

### Planned Features
- Budget allocation workflow during project setup
- Advanced currency conversion with real-time rates
- Budget forecasting and trend analysis
- Expense categorization and reporting

### Technical Debt
- Activity service integration for expense tracking
- Comprehensive test coverage for multi-currency scenarios
- Performance optimization for large expense datasets
- Enhanced error boundary implementation
