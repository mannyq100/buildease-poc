/**
 * Budget Tab Component for ProjectDetails
 * Extracted from TeamAndResources for better organization
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/core/ui';
import type { ProjectBudget } from '@/types/project';
import { TabHeader } from './TabHeader';

interface BudgetTabProps {
  projectId: string;
  projectName: string;
  budget?: number | ProjectBudget;
  className?: string;
}

export function BudgetTab({ 
  projectId, 
  projectName, 
  budget,
  className 
}: BudgetTabProps) {
  // Normalize budget data to handle both number and ProjectBudget types
  const getBudgetData = () => {
    if (typeof budget === 'object' && budget) {
      return {
        allocated: budget.allocated || 0,
        spent: budget.spent || 0,
        currency: budget.currency || 'USD'
      };
    }
    if (typeof budget === 'number') {
      return {
        allocated: budget,
        spent: 0,
        currency: 'USD'
      };
    }
    return {
      allocated: 0,
      spent: 0,
      currency: 'USD'
    };
  };

  const budgetData = getBudgetData();
  
  // Calculate budget utilization
  const budgetUtilization = budgetData.allocated > 0 
    ? Math.round((budgetData.spent / budgetData.allocated) * 100)
    : 0;

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
              {formatCurrency(budgetData.allocated - budgetData.spent)}
            </div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              Remaining
            </div>
          </div>
        </div>
      </TabHeader>

      {/* Budget Summary Cards */}
      <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/20 border-emerald-200/30 dark:border-emerald-800/30">
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                {formatCurrency(budgetData.allocated)}
              </div>
              <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                Total Budget
              </div>
            </div>
            
            <div className="text-center p-4 bg-white/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
              <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                {formatCurrency(budgetData.spent)}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                Spent to Date
              </div>
            </div>
            
            <div className="text-center p-4 bg-white/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
              <div className={cn(
                "text-2xl font-bold",
                budgetUtilization > 90 ? "text-red-600 dark:text-red-400" :
                budgetUtilization > 75 ? "text-amber-600 dark:text-amber-400" :
                "text-emerald-600 dark:text-emerald-400"
              )}>
                {budgetUtilization}%
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                Utilization
              </div>
            </div>
          </div>

          {/* Budget Status Badge */}
          <div className="flex justify-center">
            <Badge className={cn(
              "px-4 py-2",
              budgetUtilization > 90 ? "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700" :
              budgetUtilization > 75 ? "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700" :
              "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700"
            )}>
              {budgetUtilization > 90 ? (
                <><AlertTriangle className="h-4 w-4 mr-2" />Over Budget Risk</>
              ) : budgetUtilization > 75 ? (
                <><TrendingUp className="h-4 w-4 mr-2" />High Usage</>
              ) : (
                <><TrendingUp className="h-4 w-4 mr-2" />On Track</>
              )}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Budget Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-buildease-orange-500 rounded-full" />
            Budget Actions
          </CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Manage expenses and financial planning
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-12 justify-start border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
            <Button
              variant="outline"
              className="h-12 justify-start border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/20"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              View Reports
            </Button>
            <Button
              variant="outline"
              className="h-12 justify-start border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-900/20"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Set Alerts
            </Button>
            <Button
              variant="outline"
              className="h-12 justify-start border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900/20"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Adjust Budget
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Budget Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-slate-500 to-buildease-orange-500 rounded-full" />
            Quick Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="flex items-center justify-between p-3 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50">
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                💰 Largest expense category
              </span>
              <span className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                Materials
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                📅 Projected completion
              </span>
              <span className="text-sm font-bold text-blue-800 dark:text-blue-200">
                On budget
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-amber-50/50 dark:bg-amber-900/20 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
              <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                ⚡ Monthly burn rate
              </span>
              <span className="text-sm font-bold text-amber-800 dark:text-amber-200">
                ${(budgetData.spent * 0.3).toLocaleString()}/mo
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}