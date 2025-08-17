/**
 * BudgetOverviewCard component
 * Extracted from ProjectDetailsContent.tsx - Budget Overview Section
 * Displays budget summary, progress bars, and allocation breakdown
 * Mobile-first responsive design with proper number formatting
 */
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProCard } from '@/components/ui/ProCard';
import { Button } from '@/components/ui/button';
import { DollarSign, Plus } from 'lucide-react';
import { cn } from '@/utils/core/ui';
import React from 'react';
import { formatCurrency } from '@/utils/core/format';

interface BudgetOverviewCardProps {
  project: {
    id: string;
    name: string;
    budget: number;
    spent: number;
    currency: string;
  };
  onAddExpense?: () => void;
  className?: string;
}

export function BudgetOverviewCard({ 
  project, 
  onAddExpense,
  className
}: BudgetOverviewCardProps) {
  // Normalize budget data to handle both number and object types
  const getBudgetData = () => {
    // The Project interface has budget as number, spent as number, and currency as string
    // Use these direct properties from the transformed project data
    const budgetData = {
      allocated: project.budget || 0,
      spent: project.spent || 0,
      currency: project.currency || 'USD'
    };
    
    return budgetData;
  };

  const budgetData = getBudgetData();
  
  // Calculate budget utilization and remaining amount
  const budgetUtilization = budgetData.allocated > 0 
    ? Math.round((budgetData.spent / budgetData.allocated) * 100)
    : 0;
  // Animated progress width for micro-interaction on mount/changes
  const [animatedWidth, setAnimatedWidth] = React.useState(0);
  React.useEffect(() => {
    const target = Math.min(budgetUtilization, 100);
    const id = requestAnimationFrame(() => setAnimatedWidth(target));
    return () => cancelAnimationFrame(id);
  }, [budgetUtilization]);
  
  const remainingBudget = budgetData.allocated - budgetData.spent;

  // Format currency amounts using the shared utility with smart formatting for large amounts
  const formatAmount = (amount: number) => {
    // For large amounts, use compact notation to prevent overflow
    if (amount >= 1000000) {
      return `${budgetData.currency === 'USD' ? '$' : budgetData.currency + ' '}${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 10000) {
      return `${budgetData.currency === 'USD' ? '$' : budgetData.currency + ' '}${Math.round(amount / 1000)}K`;
    } else {
      return formatCurrency(amount, budgetData.currency);
    }
  };

  // Determine budget status color based on utilization
  const getBudgetStatusColor = () => {
    if (budgetUtilization > 90) return 'text-red-600';
    if (budgetUtilization > 75) return 'text-amber-600';
    return 'text-emerald-600';
  };

  return (
    <ProCard 
      accent="blue"
      className={cn(
        '',
        className
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg font-bold text-slate-900">
              Budget Overview
            </CardTitle>
          </div>
          <Button 
            size="sm" 
            onClick={onAddExpense}
            className="bg-buildease-blue-600 hover:bg-buildease-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Add Expense</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Budget Summary Grid - Mobile-first responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50/50 p-4 rounded-xl">
            <div className="text-sm text-slate-600 mb-1 font-medium">Total Budget</div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
              {formatAmount(budgetData.allocated)}
            </div>
          </div>
          <div className="bg-slate-50/50 p-4 rounded-xl">
            <div className="text-sm text-slate-600 mb-1 font-medium">Spent</div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
              {formatAmount(budgetData.spent)}
            </div>
          </div>
        </div>

        {/* Budget Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-slate-700">Budget Utilization</span>
            <span className={cn("font-bold", getBudgetStatusColor())}>
              {budgetUtilization}%
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div 
              className={cn(
                "h-3 rounded-full transition-[width] duration-700 ease-out will-change-[width]",
                budgetUtilization > 90 ? "bg-red-500" :
                budgetUtilization > 75 ? "bg-amber-500" :
                "bg-emerald-500",
                // subtle glow
                "shadow-[0_0_8px_rgba(16,185,129,0.35)]"
              )}
              style={{ width: `${animatedWidth}%` }}
            />
          </div>
        </div>

        {/* Remaining Budget Display */}
        <div className="bg-gradient-to-r from-buildease-blue-50 to-slate-50 p-4 rounded-xl border border-buildease-blue-100">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-slate-600 font-medium">Remaining Budget</div>
              <div className={cn(
                "text-lg font-bold truncate",
                remainingBudget < 0 ? "text-red-600" : "text-emerald-600"
              )}>
                {formatAmount(remainingBudget)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-600 font-medium">Status</div>
              <div className={cn(
                "text-sm font-semibold capitalize",
                budgetUtilization > 100 ? "text-red-600" :
                budgetUtilization > 90 ? "text-amber-600" :
                budgetUtilization > 75 ? "text-amber-600" :
                "text-emerald-600"
              )}>
                {budgetUtilization > 100 ? "Over Budget" :
                 budgetUtilization > 90 ? "High Risk" :
                 budgetUtilization > 75 ? "Monitor" :
                 "On Track"}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Budget Insights - Mobile-optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
          <div className="bg-white/60 p-3 rounded-lg border border-slate-200/50">
            <div className="text-slate-600">Avg. Monthly Spend</div>
            <div className="font-semibold text-slate-900 truncate">
              {formatAmount(budgetData.spent * 0.3)}
            </div>
          </div>
          <div className="bg-white/60 p-3 rounded-lg border border-slate-200/50">
            <div className="text-slate-600">Budget Health</div>
            <div className={cn("font-semibold", getBudgetStatusColor())}>
              {budgetUtilization > 90 ? "Critical" :
               budgetUtilization > 75 ? "Warning" :
               "Healthy"}
            </div>
          </div>
          <div className="bg-white/60 p-3 rounded-lg border border-slate-200/50 sm:col-span-2 lg:col-span-1">
            <div className="text-slate-600">Projected Total</div>
            <div className="font-semibold text-slate-900 truncate">
              {formatAmount(budgetData.allocated)}
            </div>
          </div>
        </div>
      </CardContent>
    </ProCard>
  );
}