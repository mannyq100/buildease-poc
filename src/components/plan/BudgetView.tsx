import React, { useState } from 'react';
import { ConstructionPlan } from '@/data/mock/generatedPlan/planData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Banknote, TrendingUp, Package, Wrench, FileText, ShieldAlert, Plus, Edit, Trash } from 'lucide-react';
import { motion as m } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BudgetModal } from '@/components/shared/modals/BudgetModal';
import { BudgetItem as BudgetItemType } from '@/types/budget';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/utils/plan-helpers';
import { useBudgetModal } from '@/stores/modalStore';

const mockBudgetItems: BudgetItemType[] = [
  { id: 1, type: 'expense', description: 'Foundation Concrete', category: 'Materials', amount: 15000, date: '2025-04-10', status: 'paid' },
  { id: 2, type: 'expense', description: 'Framing Labor', category: 'Labor', amount: 25000, date: '2025-04-15', status: 'incurred' },
  { id: 3, type: 'income', description: 'Client Downpayment', category: 'Income Payment', amount: 50000, date: '2025-04-05', status: 'received' },
  { id: 4, type: 'expense', description: 'Building Permit', category: 'Permits', amount: 2500, date: '2025-04-08', status: 'paid' },
  { id: 5, type: 'expense', description: 'Excavator Rental', category: 'Equipment Rental', amount: 3000, date: '2025-04-12', status: 'planned' },
];

interface BudgetViewProps {
  plan: ConstructionPlan;
}

export function BudgetView({ plan }: BudgetViewProps) {
  const budget = plan.budget;
  const [budgetItems, setBudgetItems] = useState<BudgetItemType[]>(mockBudgetItems);
  
  // Use Zustand modal hook
  const budgetModal = useBudgetModal();

  const total = budget.totalCost;
  const laborPercentage = total > 0 ? (budget.laborCost / total) * 100 : 0;
  const materialsPercentage = total > 0 ? (budget.materialsCost / total) * 100 : 0;
  const equipmentPercentage = total > 0 ? (budget.equipmentCost / total) * 100 : 0;
  const permitsPercentage = total > 0 ? (budget.permitsFees / total) * 100 : 0;
  const contingencyPercentage = total > 0 ? (budget.contingency / total) * 100 : 0;

  // Using shared formatCurrency utility

  function handleOpenAddModal() {
    budgetModal.actions.open(undefined, true);
  }

  function handleOpenEditModal(item: BudgetItemType) {
    budgetModal.actions.open(item, false);
  }

  function handleSaveBudgetItem(savedItem: Partial<BudgetItemType>) {
    setBudgetItems(prevItems => {
      if (budgetModal.isNew) {
        const newItemWithId = { ...savedItem, id: Date.now() } as BudgetItemType;
        return [...prevItems, newItemWithId];
      } else {
        return prevItems.map(item => item.id === savedItem.id ? { ...item, ...savedItem } : item);
      }
    });
    budgetModal.actions.close();
  }

  function handleDeleteBudgetItem(id: number) {
    setBudgetItems(prevItems => prevItems.filter(item => item.id !== id));
  }

  const BudgetItemSummary = ({ 
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
          <CardHeader className="bg-gray-50 dark:bg-gray-800/30 border-b border-gray-200 dark:border-gray-700 pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-[#2B6CB0] dark:text-[#93C5FD] flex items-center">
              <Banknote className="h-5 w-5 mr-2" />
              Budget Summary
            </CardTitle>
            <Button size="sm" onClick={handleOpenAddModal} className="bg-[#ED8936] hover:bg-[#ED8936]/90 text-white">
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-center mb-6">
              <p className="text-lg text-gray-600 dark:text-gray-400">Total Budget</p>
              <h2 className="text-3xl font-bold text-[#2B6CB0] dark:text-[#93C5FD]">
                {formatCurrency(budget.totalCost)}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BudgetItemSummary 
                icon={<Banknote className="h-5 w-5 text-blue-600 dark:text-blue-400" />} 
                title="Labor" 
                amount={budget.laborCost} 
                percentage={laborPercentage} 
                color="text-blue-600/10 dark:text-blue-400/10"
              />
              <BudgetItemSummary 
                icon={<Package className="h-5 w-5 text-green-600 dark:text-green-400" />} 
                title="Materials" 
                amount={budget.materialsCost} 
                percentage={materialsPercentage} 
                color="text-green-600/10 dark:text-green-400/10"
              />
              <BudgetItemSummary 
                icon={<Wrench className="h-5 w-5 text-amber-600 dark:text-amber-400" />} 
                title="Equipment" 
                amount={budget.equipmentCost} 
                percentage={equipmentPercentage} 
                color="text-amber-600/10 dark:text-amber-400/10"
              />
              <BudgetItemSummary 
                icon={<FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />} 
                title="Permits & Fees" 
                amount={budget.permitsFees} 
                percentage={permitsPercentage} 
                color="text-purple-600/10 dark:text-purple-400/10"
              />
              <div className="md:col-span-2">
                <BudgetItemSummary 
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

      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden rounded-xl">
          <CardHeader className="bg-gray-50 dark:bg-gray-800/30 border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" />
              Budget Line Items
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgetItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No budget items added yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  budgetItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell className="capitalize">{item.status}</TableCell>
                      <TableCell className={`text-right font-semibold ${item.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteBudgetItem(item.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </m.div>

      <BudgetModal
        show={budgetModal.isOpen}
        onClose={budgetModal.actions.close}
        onSave={handleSaveBudgetItem}
        initialData={budgetModal.data}
        isNewItem={budgetModal.isNew}
      />
    </div>
  );
}
