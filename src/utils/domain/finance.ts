/**
 * Finance domain utilities
 * Functions for managing construction project budgets, expenses, and financial metrics
 */

// BuildEase color scheme based on design principles
const BUILDEASE_COLORS = {
  primary: '#2B6CB0', // Warm blue for trust and professionalism
  accent: '#ED8936', // Warm orange for calls-to-action
  success: '#48BB78', // Green for success
  warning: '#F6AD55', // Amber for in-progress
  error: '#F56565', // Red for error
  earthTone1: '#9C6F44', // Muted earth tones for construction context
  earthTone2: '#8D6E63',
  earthTone3: '#A1887F'
};

/**
 * Format currency value with proper formatting
 * @param value Number to format as currency
 * @param locale Locale for formatting (default: en-US)
 * @param currency Currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  locale: string = 'en-US',
  currency: string = 'USD'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Calculate the difference between budgeted and actual values
 * @param budgeted Budgeted amount
 * @param actual Actual amount spent
 * @returns Variance amount (negative means over budget)
 */
export function calculateVariance(budgeted: number, actual: number): number {
  return budgeted - actual;
}

/**
 * Calculate the percentage variance between budgeted and actual values
 * @param budgeted Budgeted amount
 * @param actual Actual amount spent
 * @returns Percentage variance (negative means over budget)
 */
export function calculateVariancePercentage(budgeted: number, actual: number): number {
  if (budgeted === 0) return actual === 0 ? 0 : -100;
  return Math.round(((budgeted - actual) / budgeted) * 100);
}

/**
 * Get CSS classes for budget variance status
 * @param variance Variance amount or percentage
 * @returns Tailwind CSS classes for the variance display
 */
export function getVarianceClasses(variance: number): string {
  if (variance > 0) {
    return 'text-green-600 dark:text-green-400'; // Under budget (good)
  } else if (variance < 0) {
    return 'text-red-600 dark:text-red-400'; // Over budget (bad)
  } else {
    return 'text-gray-600 dark:text-gray-400'; // On budget (neutral)
  }
}

/**
 * Get color for budget variance charts
 * @param variance Variance amount or percentage
 * @returns HEX color code
 */
export function getVarianceColor(variance: number): string {
  if (variance > 5) {
    return BUILDEASE_COLORS.success; // Significantly under budget
  } else if (variance > 0) {
    return '#86EFAC'; // Slightly under budget (green-300)
  } else if (variance === 0) {
    return '#94A3B8'; // On budget (slate-400)
  } else if (variance > -5) {
    return '#FCA5A5'; // Slightly over budget (red-300)
  } else {
    return BUILDEASE_COLORS.error; // Significantly over budget
  }
}

/**
 * Calculate projected final cost based on current progress and spending
 * @param totalBudget Total project budget
 * @param currentSpent Amount spent so far
 * @param percentComplete Percentage of project completed (0-100)
 * @returns Projected final cost
 */
export function calculateProjectedCost(
  totalBudget: number,
  currentSpent: number,
  percentComplete: number
): number {
  // If no progress, return the budget as the projection
  if (percentComplete <= 0) return totalBudget;
  
  // Calculate the burn rate and project to 100%
  const burnRate = currentSpent / percentComplete;
  return Math.round(burnRate * 100);
}

/**
 * Format percentage with proper formatting
 * @param value Number to format as percentage
 * @param decimalPlaces Number of decimal places to show
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number,
  decimalPlaces: number = 1
): string {
  return `${value.toFixed(decimalPlaces)}%`;
}

/**
 * Group budget items by category
 * @param items Budget items with category and amount properties
 * @returns Object with categories as keys and total amounts as values
 */
export function groupBudgetByCategory<T extends { category: string; amount: number }>(
  items: T[]
): Record<string, number> {
  return items.reduce((groups, item) => {
    const category = item.category;
    if (!groups[category]) {
      groups[category] = 0;
    }
    groups[category] += item.amount;
    return groups;
  }, {} as Record<string, number>);
}

/**
 * Calculate budget allocation percentages for visualization
 * @param categoryTotals Object with categories and their total amounts
 * @returns Array of objects with category, amount, and percentage
 */
export function calculateBudgetPercentages(
  categoryTotals: Record<string, number>
): Array<{ category: string; amount: number; percentage: number }> {
  const total = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
  
  return Object.entries(categoryTotals).map(([category, amount]) => ({
    category,
    amount,
    percentage: total > 0 ? Math.round((amount / total) * 100 * 10) / 10 : 0
  }));
}

/**
 * Assign colors to budget categories for consistent visualization
 * @param categories Array of category names
 * @returns Object mapping categories to color codes
 */
export function assignCategoryColors(categories: string[]): Record<string, string> {
  // Predefined colors for common construction budget categories
  const categoryColors: Record<string, string> = {
    'Labor': BUILDEASE_COLORS.primary,
    'Materials': BUILDEASE_COLORS.accent,
    'Equipment': BUILDEASE_COLORS.earthTone1,
    'Subcontractors': BUILDEASE_COLORS.earthTone2,
    'Permits': '#9333EA', // Purple-600
    'Overhead': '#F97316', // Orange-500
    'Contingency': '#14B8A6', // Teal-500
    'Design': '#8B5CF6', // Violet-500
    'Site Work': '#22C55E', // Green-500
    'Foundation': '#A1887F', // Brown-300
    'Framing': '#DC2626', // Red-600
    'Electrical': '#F59E0B', // Amber-500
    'Plumbing': '#06B6D4', // Cyan-500
    'HVAC': '#F43F5E', // Rose-500
    'Finishes': '#8D6E63' // Brown-400
  };
  
  // Fallback colors for any categories not in the predefined list
  const fallbackColors = [
    '#3B82F6', // Blue-500
    '#EF4444', // Red-500
    '#10B981', // Emerald-500
    '#F59E0B', // Amber-500
    '#8B5CF6', // Violet-500
    '#EC4899', // Pink-500
    '#6366F1', // Indigo-500
    '#14B8A6', // Teal-500
    '#F97316', // Orange-500
    '#A855F7' // Purple-500
  ];
  
  const result: Record<string, string> = {};
  let fallbackIndex = 0;
  
  // Assign colors to each category
  categories.forEach(category => {
    if (categoryColors[category]) {
      result[category] = categoryColors[category];
    } else {
      result[category] = fallbackColors[fallbackIndex % fallbackColors.length];
      fallbackIndex++;
    }
  });
  
  return result;
}
