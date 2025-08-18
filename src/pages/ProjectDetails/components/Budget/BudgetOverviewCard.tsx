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
  const allocated = Math.max(0, project.budget || 0);
  const spent = Math.max(0, project.spent || 0);
  const currency = project.currency || 'USD';
  const remaining = allocated - spent;
  const utilization = allocated > 0 ? (spent / allocated) * 100 : 0;

  // Smooth progress animation
  const [progress, setProgress] = React.useState(0);
  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(Math.min(utilization, 100)), 200);
    return () => clearTimeout(timer);
  }, [utilization]);

  const formatAmount = (amount: number) => formatCurrency(amount, currency);

  const getStatusColor = () => {
    if (utilization > 90) return 'text-red-500';
    if (utilization > 75) return 'text-amber-500';
    return 'text-emerald-500';
  };

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
              stroke={utilization > 90 ? '#ef4444' : utilization > 75 ? '#f59e0b' : '#10b981'}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress / 100)}`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={cn('text-2xl font-bold', getStatusColor())}>
                {Math.round(utilization)}%
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