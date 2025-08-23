/**
 * BudgetOverviewCard component - Stunning Minimalist Design
 * Clean, modern interface focused on digestible information
 * Seamlessly blends with BuildEase ProjectDetails theme
 */
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/core/ui';
import React from 'react';
import { formatCurrency } from '@/utils/core/format';
import { useProjectData } from '@/hooks/queries/useProjectData';

interface BudgetOverviewCardProps {
  project: {
    id: string;
    name: string;
  };
  onAddExpense?: () => void;
  className?: string;
}

export function BudgetOverviewCard({ 
  project, 
  onAddExpense,
  className
}: BudgetOverviewCardProps) {
  // Fetch optimized financial data from project_financial_summary view
  const { data: projectData, isLoading, error } = useProjectData(project.id);
  
  
  // Extract financial metrics from optimized data
  const allocated = Math.max(0, projectData?.budget || 0);
  const projectCurrency = projectData?.currency || 'USD';
  
  // Calculate spent amount by summing individual expenses in their base currency
  const spent = React.useMemo(() => {
    if (!projectData?.expenses) return 0;
    
    // Sum all expenses, using base_amount if available (for currency conversion)
    const totalSpent = projectData.expenses.reduce((sum, expense) => {
      // Use base_amount if available (converted to project currency), otherwise use amount
      const expenseAmount = expense.base_amount || expense.amount || 0;
      return sum + expenseAmount;
    }, 0);
    
    return Math.max(0, totalSpent);
  }, [projectData?.expenses]);
  
  // Calculate financial metrics - utilization comes pre-calculated from database view
  const remaining = allocated - spent;
  const utilization = React.useMemo(() => {
    // Use pre-calculated spent_percentage from database view (already rounded to 1 decimal)
    const percentage = projectData?.utilization || 0;
    // Cap utilization at 150% for display purposes to prevent UI overflow
    return Math.min(percentage, 150);
  }, [projectData?.utilization]);
  
  // All hooks must be called before any conditional returns
  const [progress, setProgress] = React.useState(0);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      // Animate progress up to 100% for visual appeal, even if utilization exceeds 100%
      setProgress(Math.min(utilization, 100));
    }, 200);
    return () => clearTimeout(timer);
  }, [utilization]);

  // Memoize status color calculation for performance
  const statusColor = React.useMemo(() => {
    if (utilization > 90) return 'text-red-500';
    if (utilization > 75) return 'text-amber-500';
    return 'text-emerald-500';
  }, [utilization]);

  // Memoize progress stroke color for consistency
  const progressStrokeColor = React.useMemo(() => {
    if (utilization > 90) return '#ef4444';
    if (utilization > 75) return '#f59e0b';
    return '#10b981';
  }, [utilization]);

  const formatAmount = React.useCallback((amount: number | null | undefined) => {
    return formatCurrency(amount, projectCurrency);
  }, [projectCurrency]);
  
  // Handle loading state
  if (isLoading) {
    return (
      <Card className={cn('border-0 bg-white/60 backdrop-blur-sm', className)}>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-slate-200 rounded mb-4"></div>
            <div className="h-8 bg-slate-200 rounded mb-6"></div>
            <div className="w-32 h-32 bg-slate-200 rounded-full mx-auto mb-6"></div>
            <div className="grid grid-cols-2 gap-6">
              <div className="h-4 bg-slate-200 rounded"></div>
              <div className="h-4 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </Card>
    );
  }
  
  // Handle error state
  if (error) {
    return (
      <Card className={cn('border-0 bg-red-50/30 backdrop-blur-sm', className)}>
        <div className="p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-600 text-sm">Failed to load budget data</p>
        </div>
      </Card>
    );
  }

  // Empty state
  if (allocated <= 0) {
    return (
      <Card className={cn('border-0 bg-slate-50/30 backdrop-blur-sm', className)}>
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-700 mb-2">No Budget Set</h3>
          <p className="text-slate-500 mb-6">Set a project budget to track expenses</p>
          <Button onClick={onAddExpense} className="bg-buildease-blue-600 hover:bg-buildease-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Set Budget
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300', className)}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-slate-800">Budget</h2>
          <Button 
            size="sm" 
            onClick={onAddExpense}
            className="bg-buildease-blue-600 hover:bg-buildease-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      
        {/* Main Budget Display */}
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-slate-800 mb-2">
            {formatAmount(allocated)}
          </div>
          <div className="text-sm text-slate-500 uppercase tracking-wide font-medium">
            Total Budget
          </div>
        </div>

        {/* Progress Circle */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke="#e2e8f0"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke={progressStrokeColor}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${2 * Math.PI * 50 * (1 - Math.min(progress, 100) / 100)}`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={cn('text-2xl font-bold', statusColor)}>
                {Math.round(Math.min(utilization, 999))}%
              </div>
              <div className="text-xs text-slate-500">Used</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-lg font-semibold text-slate-700 mb-1">
              {formatAmount(spent)}
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wide font-medium">
              Spent
            </div>
          </div>
          <div className="text-center">
            <div className={cn(
              'text-lg font-semibold mb-1',
              remaining < 0 ? 'text-red-500' : 'text-emerald-500'
            )}>
              {formatAmount(Math.abs(remaining))}
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wide font-medium">
              {remaining < 0 ? 'Over' : 'Remaining'}
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        {utilization > 90 && (
          <div className="mt-6 flex items-center justify-center gap-2 text-red-500">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">
              {utilization > 100 ? 'Over Budget' : 'Budget Alert'}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}