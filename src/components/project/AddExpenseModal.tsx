import React, { useState } from 'react';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EXPENSE_CATEGORIES } from '@/data/mock/expenses/expensesData';
import type { Expense } from '@/types/expenses';

interface NewExpenseData {
  description: string;
  category: string;
  amount: string;
  vendor: string;
  phase: string;
  paymentMethod: string;
}

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: Omit<Expense, 'id' | 'date' | 'receiptUploaded' | 'status'>) => void;
  projectName: string;
}

export function AddExpenseModal({
  isOpen,
  onClose,
  onAddExpense,
  projectName,
}: AddExpenseModalProps) {
  const [newExpense, setNewExpense] = useState<NewExpenseData>({
    description: '',
    category: '',
    amount: '',
    vendor: '',
    phase: '',
    paymentMethod: ''
  });

  const handleAddExpense = () => {
    if (!newExpense.description || !newExpense.category || !newExpense.amount) return;

    const expense = {
      description: newExpense.description,
      category: newExpense.category as any,
      amount: parseFloat(newExpense.amount),
      project: projectName,
      phase: newExpense.phase || 'General',
      paymentMethod: newExpense.paymentMethod || 'Credit Card',
      vendor: newExpense.vendor || 'Unknown Vendor',
    };

    onAddExpense(expense);
    
    // Reset form
    setNewExpense({
      description: '',
      category: '',
      amount: '',
      vendor: '',
      phase: '',
      paymentMethod: ''
    });
    
    onClose();
  };

  const handleCancel = () => {
    // Reset form on cancel
    setNewExpense({
      description: '',
      category: '',
      amount: '',
      vendor: '',
      phase: '',
      paymentMethod: ''
    });
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Add New Expense"
      description="Record a new project expense for tracking and budget management"
      size="md"
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Description
            </label>
            <Input
              placeholder="e.g., Steel reinforcement bars"
              value={newExpense.description}
              onChange={(e) => setNewExpense(prev => ({...prev, description: e.target.value}))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Category
              </label>
              <Select
                value={newExpense.category}
                onValueChange={(value) => setNewExpense(prev => ({...prev, category: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.filter(cat => cat !== 'All Categories').map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Amount
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={newExpense.amount}
                onChange={(e) => setNewExpense(prev => ({...prev, amount: e.target.value}))}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Vendor
            </label>
            <Input
              placeholder="e.g., BuildSupply Inc."
              value={newExpense.vendor}
              onChange={(e) => setNewExpense(prev => ({...prev, vendor: e.target.value}))}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleAddExpense}
            disabled={!newExpense.description || !newExpense.category || !newExpense.amount}
            className="bg-buildease-blue-600 hover:bg-buildease-blue-700"
          >
            Add Expense
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}