/**
 * Budget Tab Component for ProjectDetails
 * Extracted from TeamAndResources for better organization
 */

import React from 'react';
import { DollarSign, TrendingUp, Hammer, Users, FileText, Building, Calculator, BarChart3 } from 'lucide-react';
import { cn } from '@/utils/core/ui';
import { formatCurrency } from '@/utils/core/format';
import type { ProjectBudget } from '@/types/project';
import { TabHeader } from './TabHeader';
import { useConsolidatedProjectData } from '@/hooks/queries/useConsolidatedProjectData';

interface BudgetTabProps {
  projectId: string;
  projectName: string;
  budget?: number | ProjectBudget;
  className?: string;
}

export function BudgetTab({ 
  projectId, 
  projectName: _projectName, 
  budget,
  className 
}: BudgetTabProps) {
  // Get consolidated project data including category totals
  const { data: consolidatedData } = useConsolidatedProjectData(projectId);
  
  // Normalize budget data to handle both number and ProjectBudget types
  const getBudgetData = () => {
    // Use consolidated data if available, otherwise fallback to props
    if (consolidatedData) {
      return {
        allocated: consolidatedData.budget || 0,
        spent: consolidatedData.spent || 0,
        remaining: consolidatedData.remainingBudget || 0,
        utilization: consolidatedData.utilization || 0,
        currency: consolidatedData.currency || 'USD',
        categoryTotals: consolidatedData.categoryTotals || null
      };
    }
    
    if (typeof budget === 'object' && budget) {
      return {
        allocated: budget.allocated || 0,
        spent: budget.spent || 0,
        currency: budget.currency || 'USD',
        categoryTotals: null
      };
    }
    if (typeof budget === 'number') {
      return {
        allocated: budget,
        spent: 0,
        currency: 'USD',
        categoryTotals: null
      };
    }
    return {
      allocated: 0,
      spent: 0,
      currency: 'USD',
      categoryTotals: null
    };
  };

  const budgetData = getBudgetData();
  
  // Use pre-calculated utilization from consolidated data
  const budgetUtilization = Math.round(budgetData.utilization || 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: budgetData.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Budget Summary Header */}
      <TabHeader
        icon={<DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />}
        title="Budget Management"
        description="Track expenses, allocations, and financial health"
        gradient="bg-gradient-to-br from-emerald-50/80 via-white to-emerald-100/60 dark:from-emerald-950/30 dark:via-slate-800/50 dark:to-emerald-900/20 border-emerald-200/40 dark:border-emerald-700/40"
      >
        <div className="flex items-center gap-6 sm:gap-8">
          <div className="text-center group">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 transition-colors group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
              {budgetUtilization}%
            </div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              Utilized
            </div>
          </div>
          <div className="w-px h-12 bg-slate-200 dark:bg-slate-700" />
          <div className="text-center group">
            <div className="text-2xl sm:text-3xl font-bold text-slate-600 dark:text-slate-400 transition-colors group-hover:text-slate-700 dark:group-hover:text-slate-300">
              {formatCurrency(budgetData.remaining || (budgetData.allocated - budgetData.spent))}
            </div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              Remaining
            </div>
          </div>
        </div>
      </TabHeader>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Category Breakdown */}
        <div className="space-y-6">
          <NativeCategoryBreakdown 
            categoryTotals={budgetData.categoryTotals || {}}
            currency={budgetData.currency}
          />
        </div>

        {/* Right Column - Budget Overview */}
        <div className="space-y-6">
          {/* Budget Overview Card */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 hover:bg-white/80 transition-all duration-300">
            <h2 className="text-xl font-semibold text-slate-800 mb-8">Overview</h2>
            
            {/* Main Budget Display */}
            <div className="text-center mb-8">
              <div className="text-3xl font-bold text-slate-800 mb-2">
                {formatCurrency(budgetData.allocated)}
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
                  stroke={budgetUtilization > 90 ? '#ef4444' : budgetUtilization > 75 ? '#f59e0b' : '#10b981'}
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - budgetUtilization / 100)}`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={cn(
                    'text-2xl font-bold',
                    budgetUtilization > 90 ? 'text-red-500' :
                    budgetUtilization > 75 ? 'text-amber-500' :
                    'text-emerald-500'
                  )}>
                    {budgetUtilization}%
                  </div>
                  <div className="text-xs text-slate-500">Used</div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-lg font-semibold text-slate-700 mb-1">
                  {formatCurrency(budgetData.spent)}
                </div>
                <div className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                  Spent
                </div>
              </div>
              <div className="text-center">
                <div className={cn(
                  'text-lg font-semibold mb-1',
                  (budgetData.allocated - budgetData.spent) < 0 ? 'text-red-500' : 'text-emerald-500'
                )}>
                  {formatCurrency(Math.abs(budgetData.allocated - budgetData.spent))}
                </div>
                <div className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                  {(budgetData.allocated - budgetData.spent) < 0 ? 'Over' : 'Remaining'}
                </div>
              </div>
            </div>

            {/* Status Indicator */}
            {budgetUtilization > 90 && (
              <div className="mt-6 flex items-center justify-center gap-2 text-red-500">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {budgetUtilization > 100 ? 'Over Budget' : 'Budget Alert'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Native Category Breakdown Component
function NativeCategoryBreakdown({ 
  categoryTotals, 
  currency 
}: { 
  categoryTotals: Record<string, number>; 
  currency: string; 
}) {
  const CATEGORIES = React.useMemo(() => ({
    material_costs: { label: 'Materials', icon: Hammer, color: '#3b82f6' },
    labor_costs: { label: 'Labor', icon: Users, color: '#10b981' },
    equipment_costs: { label: 'Equipment', icon: Building, color: '#f59e0b' },
    permit_costs: { label: 'Permits', icon: FileText, color: '#8b5cf6' },
    design_costs: { label: 'Design', icon: Building, color: '#06b6d4' },
    other_costs: { label: 'Other', icon: Calculator, color: '#64748b' }
  }), []);

  const categoryData = React.useMemo(() => {
    if (!categoryTotals) return [];

    const totalAmount = Object.values(categoryTotals).reduce((sum, amount) => sum + (amount || 0), 0);

    return Object.entries(categoryTotals)
      .filter(([, amount]) => amount > 0)
      .map(([category, amount]) => {
        const config = CATEGORIES[category as keyof typeof CATEGORIES] || CATEGORIES.other_costs;
        const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
        return { category, amount, percentage, ...config };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6); // Show top 6 categories
  }, [categoryTotals, CATEGORIES]);

  if (categoryData.length === 0) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
          <BarChart3 className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-700 mb-2">No Expenses Yet</h3>
        <p className="text-slate-500">Add expenses to see category breakdown</p>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 hover:bg-white/80 transition-all duration-300">
      <h2 className="text-xl font-semibold text-slate-800 mb-8">Categories</h2>
      
      <div className="space-y-6">
        {categoryData.map(({ category, amount, percentage, label, icon: Icon, color }) => (
          <div key={category} className="flex items-center gap-4">
            {/* Icon */}
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${color}15` }}
            >
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 truncate">{label}</span>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-semibold text-slate-800">
                    {formatCurrency(amount, currency)}
                  </span>
                  <span className="text-xs text-slate-500 w-8 text-right">
                    {Math.round(percentage)}%
                  </span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div 
                  className="h-1.5 rounded-full transition-all duration-700 ease-out"
                  style={{ 
                    backgroundColor: color,
                    width: `${Math.min(percentage, 100)}%`
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
