import React from 'react';
import { Budget, ConstructionPlan } from '@/data/mock/generatedPlan/planData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Banknote, TrendingUp, Package, Wrench, FileText, ShieldAlert } from 'lucide-react';
import { motion as m } from 'framer-motion';

interface BudgetViewProps {
  plan: ConstructionPlan;
}

export function BudgetView({ plan }: BudgetViewProps) {
  const budget = plan.budget;
  
  // Calculate percentages for the budget breakdown
  const total = budget.totalCost;
  const laborPercentage = (budget.laborCost / total) * 100;
  const materialsPercentage = (budget.materialsCost / total) * 100;
  const equipmentPercentage = (budget.equipmentCost / total) * 100;
  const permitsPercentage = (budget.permitsFees / total) * 100;
  const contingencyPercentage = (budget.contingency / total) * 100;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const BudgetItem = ({ 
    icon, 
    title, 
    amount, 
    percentage, 
    color 
  }: { 
    icon: React.ReactNode, 
    title: string, 
    amount: number, 
    percentage: number, 
    color: string 
  }) => (
    <m.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className={`p-2 rounded-md mr-3 ${color}`}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</h3>
        <p className="text-lg font-semibold text-gray-900 dark:text-white">
          {formatCurrency(amount)}
        </p>
      </div>
      <div className="text-right">
        <span className="text-sm text-gray-500 dark:text-gray-400">{percentage.toFixed(1)}%</span>
        <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
          <div 
            className={`h-full rounded-full ${color.replace('text-', 'bg-').replace('/10', '')}`} 
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </m.div>
  );

  return (
    <div className="space-y-6">
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden rounded-xl">
          <CardHeader className="bg-gray-50 dark:bg-gray-800/30 border-b border-gray-200 dark:border-gray-700 pb-3">
            <CardTitle className="text-lg font-semibold text-[#2B6CB0] dark:text-[#93C5FD] flex items-center">
              <Banknote className="h-5 w-5 mr-2" />
              Budget Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-center mb-6">
              <p className="text-lg text-gray-600 dark:text-gray-400">Total Budget</p>
              <h2 className="text-3xl font-bold text-[#2B6CB0] dark:text-[#93C5FD]">
                {formatCurrency(budget.totalCost)}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BudgetItem 
                icon={<Banknote className="h-5 w-5 text-blue-600 dark:text-blue-400" />} 
                title="Labor" 
                amount={budget.laborCost} 
                percentage={laborPercentage} 
                color="text-blue-600/10 dark:text-blue-400/10"
              />
              <BudgetItem 
                icon={<Package className="h-5 w-5 text-green-600 dark:text-green-400" />} 
                title="Materials" 
                amount={budget.materialsCost} 
                percentage={materialsPercentage} 
                color="text-green-600/10 dark:text-green-400/10"
              />
              <BudgetItem 
                icon={<Wrench className="h-5 w-5 text-amber-600 dark:text-amber-400" />} 
                title="Equipment" 
                amount={budget.equipmentCost} 
                percentage={equipmentPercentage} 
                color="text-amber-600/10 dark:text-amber-400/10"
              />
              <BudgetItem 
                icon={<FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />} 
                title="Permits & Fees" 
                amount={budget.permitsFees} 
                percentage={permitsPercentage} 
                color="text-purple-600/10 dark:text-purple-400/10"
              />
              <div className="md:col-span-2">
                <BudgetItem 
                  icon={<ShieldAlert className="h-5 w-5 text-orange-600 dark:text-orange-400" />} 
                  title="Contingency" 
                  amount={budget.contingency} 
                  percentage={contingencyPercentage} 
                  color="text-orange-600/10 dark:text-orange-400/10"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </m.div>
    </div>
  );
}
