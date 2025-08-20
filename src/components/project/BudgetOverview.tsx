import { useState } from 'react';
import { cn } from '@/utils/core/ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { BudgetModal } from '@/pages/ProjectDetails/components/Budget/BudgetModal';
import { 
  DollarSign, 
  TrendingDown, 
  Plus,
  Receipt,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { getProjectBudget } from '@/data/mock/expenses/budgetData';
import { initialExpenses, EXPENSE_CATEGORIES } from '@/data/mock/expenses/expensesData';
import type { BudgetData, Expense } from '@/types/expenses';
import type { BudgetFormData } from '@/types/projectDetails';

interface BudgetOverviewProps {
  projectName: string;
  className?: string;
}

export function BudgetOverview({ projectName, className }: BudgetOverviewProps) {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>(
    initialExpenses.filter(expense => expense.project === projectName)
  );

  const budgetData: BudgetData = getProjectBudget(projectName);
  
  // Calculate current spending from actual expenses
  const currentSpending = expenses
    .filter(expense => expense.status === 'approved')
    .reduce((total, expense) => total + expense.amount, 0);

  // Calculate remaining budget
  const remainingBudget = budgetData.total - currentSpending;
  const budgetUtilization = (currentSpending / budgetData.total) * 100;

  // Recent expenses (last 5)
  const recentExpenses = expenses
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Category spending data for table display
  const categorySpending = EXPENSE_CATEGORIES.filter(cat => cat !== 'All Categories').map(category => {
    const categoryExpenses = expenses.filter(exp => exp.category === category && exp.status === 'approved');
    const spent = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const allocation = budgetData.allocations?.find(alloc => alloc.category === category);
    const allocated = allocation?.amount || 0;
    return {
      category,
      spent,
      allocated,
      remaining: Math.max(0, allocated - spent),
      utilization: allocated > 0 ? (spent / allocated) * 100 : 0
    };
  });

  // Budget health indicators
  const budgetHealth = {
    status: budgetUtilization > 90 ? 'critical' : budgetUtilization > 75 ? 'warning' : 'healthy',
    riskLevel: budgetUtilization > 100 ? 'over-budget' : budgetUtilization > 90 ? 'high-risk' : 'low-risk',
    daysToDepletion: remainingBudget > 0 ? Math.ceil((remainingBudget / (currentSpending / 30))) : 0
  };


  const handleAddExpense = async (expenseData: BudgetFormData & { base_currency?: string; exchange_rate?: number | null }) => {
    // Convert BudgetFormData to legacy Expense format for compatibility
    const expense: Expense = {
      id: Math.max(...expenses.map(e => e.id)) + 1,
      description: expenseData.description || 'New Expense',
      category: expenseData.category || 'General',
      amount: expenseData.amount,
      project: projectName,
      phase: 'General',
      vendor: 'Unknown Vendor', // BudgetFormData doesn't have vendor field
      date: new Date().toISOString().split('T')[0],
      receiptUploaded: false,
      status: 'pending'
    };

    setExpenses(prev => [expense, ...prev]);
    setShowAddExpense(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };

    return (
      <Badge variant="outline" className={cn('text-xs', variants[status as keyof typeof variants])}>
        {status}
      </Badge>
    );
  };

  return (
    <div className={cn('space-y-8', className)}>
      {/* Enhanced Budget Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden border-emerald-200/60 dark:border-emerald-700/60 bg-gradient-to-br from-emerald-50/50 via-white to-emerald-100/30 dark:from-emerald-950/30 dark:via-slate-800/50 dark:to-emerald-900/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-emerald-600/5 dark:from-emerald-400/10 dark:to-emerald-500/10" />
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">Total Budget</p>
                <p className="text-3xl font-bold text-emerald-800 dark:text-emerald-200">
                  ${budgetData.total.toLocaleString()}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">Project allocation</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/40 rounded-2xl shadow-sm">
                <DollarSign className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-buildease-orange-200/60 dark:border-buildease-orange-700/60 bg-gradient-to-br from-buildease-orange-50/50 via-white to-buildease-orange-100/30 dark:from-buildease-orange-950/30 dark:via-slate-800/50 dark:to-buildease-orange-900/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-r from-buildease-orange-500/5 to-buildease-orange-600/5 dark:from-buildease-orange-400/10 dark:to-buildease-orange-500/10" />
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-buildease-orange-700 dark:text-buildease-orange-300 uppercase tracking-wide">Current Spending</p>
                <p className="text-3xl font-bold text-buildease-orange-800 dark:text-buildease-orange-200">
                  ${currentSpending.toLocaleString()}
                </p>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    'px-2 py-1 rounded-full text-xs font-semibold',
                    budgetUtilization > 90 ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300' :
                    budgetUtilization > 75 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300' :
                    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                  )}>
                    {budgetUtilization.toFixed(1)}% utilized
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-buildease-orange-100 to-buildease-orange-200 dark:from-buildease-orange-900/40 dark:to-buildease-orange-800/40 rounded-2xl shadow-sm">
                <Receipt className="h-8 w-8 text-buildease-orange-600 dark:text-buildease-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-br from-slate-50/50 via-white to-slate-100/30 dark:from-slate-950/30 dark:via-slate-800/50 dark:to-slate-900/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-500/5 to-slate-600/5 dark:from-slate-400/10 dark:to-slate-500/10" />
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Remaining Budget</p>
                <p className={cn(
                  "text-3xl font-bold",
                  remainingBudget > 0 ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"
                )}>
                  ${remainingBudget.toLocaleString()}
                </p>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    'px-2 py-1 rounded-full text-xs font-semibold',
                    remainingBudget > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300' :
                    'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                  )}>
                    {((remainingBudget / budgetData.total) * 100).toFixed(1)}% left
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800/40 dark:to-slate-700/40 rounded-2xl shadow-sm">
                <TrendingDown className={cn(
                  "h-8 w-8",
                  remainingBudget > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                )} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget Health */}
        <Card className={cn(
          'border-2',
          budgetHealth.status === 'critical' ? 'border-red-200 bg-red-50/50' :
          budgetHealth.status === 'warning' ? 'border-yellow-200 bg-yellow-50/50' :
          'border-green-200 bg-green-50/50'
        )}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Health Status</p>
                <p className={cn(
                  'text-lg font-bold',
                  budgetHealth.status === 'critical' ? 'text-red-700' :
                  budgetHealth.status === 'warning' ? 'text-yellow-700' :
                  'text-green-700'
                )}>
                  {budgetHealth.status.toUpperCase()}
                </p>
                <p className="text-xs text-slate-500">
                  {budgetHealth.riskLevel.replace('-', ' ')}
                </p>
              </div>
              <div className={cn(
                'h-12 w-12 rounded-lg flex items-center justify-center',
                budgetHealth.status === 'critical' ? 'bg-red-100' :
                budgetHealth.status === 'warning' ? 'bg-yellow-100' :
                'bg-green-100'
              )}>
                {budgetHealth.status === 'critical' ? (
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                ) : (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Enhanced Category Budget Analysis */}
      <Card className="border-slate-200/60 dark:border-slate-700/60 shadow-xl bg-gradient-to-br from-white via-slate-50/30 to-buildease-blue-50/10 dark:from-slate-900 dark:via-slate-800/30 dark:to-buildease-blue-950/10 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardHeader className="pb-6 bg-gradient-to-r from-slate-50/80 to-buildease-blue-50/40 dark:from-slate-800/80 dark:to-buildease-blue-950/40 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-buildease-blue-500 to-buildease-orange-500 rounded-full" />
                Category Budget Analysis
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Track spending across project categories</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-6">
            {categorySpending.map((category, index) => (
              <div key={index} className="group p-4 bg-gradient-to-r from-slate-50/50 to-white dark:from-slate-800/50 dark:to-slate-800/30 rounded-xl border border-slate-200/60 dark:border-slate-700/60 hover:shadow-md transition-all duration-300 hover:scale-[1.01]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-buildease-blue-500 to-buildease-orange-500" />
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {category.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        ${category.spent.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        of ${category.allocated.toLocaleString()}
                      </div>
                    </div>
                    <Badge className={cn(
                      'font-semibold px-3 py-1',
                      category.utilization > 90 ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700' :
                      category.utilization > 75 ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700' :
                      'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700'
                    )}>
                      {category.utilization.toFixed(0)}%
                    </Badge>
                  </div>
                </div>
                <div className="relative">
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className={cn(
                        'h-3 rounded-full transition-all duration-500 relative overflow-hidden',
                        category.utilization > 90 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                        category.utilization > 75 ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                        'bg-gradient-to-r from-buildease-blue-500 to-emerald-500'
                      )}
                      style={{ width: `${Math.min(category.utilization, 100)}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                    </div>
                  </div>
                  {category.utilization > 100 && (
                    <div className="absolute -top-1 -right-1">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    </div>
                  )}
                </div>
                {category.remaining < 0 && (
                  <div className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium">
                    Over budget by ${Math.abs(category.remaining).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Recent Expenses */}
      <Card className="border-slate-200/60 dark:border-slate-700/60 shadow-xl bg-gradient-to-br from-white via-slate-50/30 to-buildease-blue-50/10 dark:from-slate-900 dark:via-slate-800/30 dark:to-buildease-blue-950/10 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardHeader className="pb-6 bg-gradient-to-r from-slate-50/80 to-buildease-blue-50/40 dark:from-slate-800/80 dark:to-buildease-blue-950/40 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-buildease-blue-500 to-buildease-orange-500 rounded-full" />
                Recent Expenses
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Latest project expenditures and approvals</p>
            </div>
            <Button
              onClick={() => setShowAddExpense(true)}
              size="default"
              className="bg-gradient-to-r from-buildease-blue-600 to-buildease-blue-700 hover:from-buildease-blue-700 hover:to-buildease-blue-800 text-white transition-all duration-300 hover:shadow-lg hover:scale-[1.02] rounded-xl font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {recentExpenses.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center">
                <Receipt className="h-8 w-8 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No expenses recorded yet</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">Start tracking your project expenses to monitor budget utilization</p>
              <Button
                onClick={() => setShowAddExpense(true)}
                className="bg-gradient-to-r from-buildease-blue-600 to-buildease-blue-700 hover:from-buildease-blue-700 hover:to-buildease-blue-800 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Expense
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentExpenses.map((expense) => (
                <div key={expense.id} className="group p-4 bg-gradient-to-r from-slate-50/50 to-white dark:from-slate-800/50 dark:to-slate-800/30 rounded-xl border border-slate-200/60 dark:border-slate-700/60 hover:shadow-md transition-all duration-300 hover:scale-[1.01]">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-buildease-blue-700 dark:group-hover:text-buildease-blue-300 transition-colors">
                            {expense.description}
                          </h4>
                          {(expense.vendor || expense.phase) && (
                            <div className="flex items-center gap-2 mt-1">
                              {expense.vendor && (
                                <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                                  {expense.vendor}
                                </span>
                              )}
                              {expense.phase && (
                                <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                                  {expense.phase}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-slate-900 dark:text-white">
                            ${expense.amount.toLocaleString()}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(expense.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs bg-buildease-blue-50 text-buildease-blue-700 border-buildease-blue-200 dark:bg-buildease-blue-900/20 dark:text-buildease-blue-300 dark:border-buildease-blue-700">
                          {expense.category}
                        </Badge>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(expense.status)}
                          {getStatusBadge(expense.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Expense Modal */}
      <BudgetModal
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        onSave={handleAddExpense}
        project={{ currency: 'USD' }} // Default project currency
        mode="create"
      />
    </div>
  );
}