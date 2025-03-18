import React from 'react';
import { StatCard } from '@/components/shared/StatCard';
import { DollarSign, Building, Clock, PieChart } from 'lucide-react';
import { TopCategory, BudgetData } from '@/types/expenses';

interface ExpenseMetricsGridProps {
  totalExpenses: number;
  budget: BudgetData;
  topCategory: TopCategory | null;
  pendingCount: number;
  growthInsights: {
    increasing: boolean;
    growthRate: number;
  };
  formatCurrency: (amount: number) => string;
}

/**
 * Grid of expense metrics cards displaying key financial metrics
 */
export function ExpenseMetricsGrid({
  totalExpenses,
  budget,
  topCategory,
  pendingCount,
  growthInsights,
  formatCurrency
}: ExpenseMetricsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Expenses"
        value={formatCurrency(totalExpenses)}
        icon={<DollarSign className="h-6 w-6" />}
        colorScheme="emerald"
        subtitle={growthInsights.increasing 
          ? `+${growthInsights.growthRate.toFixed(1)}% vs last month` 
          : `-${Math.abs(growthInsights.growthRate).toFixed(1)}% vs last month`}
      />
      
      <StatCard
        title="Budget Status"
        value={`${Math.round((budget.spent / budget.total) * 100)}%`}
        icon={<Building className="h-6 w-6" />}
        colorScheme="blue"
        subtitle={`${formatCurrency(budget.spent)} of ${formatCurrency(budget.total)}`}
      />
      
      <StatCard
        title="Pending Approval"
        value={pendingCount}
        icon={<Clock className="h-6 w-6" />}
        colorScheme="amber"
        subtitle="expenses"
      />
      
      <StatCard
        title="Top Category"
        value={topCategory?.category || "None"}
        icon={<PieChart className="h-6 w-6" />}
        colorScheme="purple"
        subtitle={topCategory?.amount ? formatCurrency(topCategory.amount) : ""}
      />
    </div>
  );
} 