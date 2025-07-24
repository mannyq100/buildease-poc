/**
 * BudgetModal component
 * Extracted from ProjectDetailsContent.tsx - Budget CRUD Modal
 * Handles creating and editing budget expenses with proper form validation
 * Mobile-first responsive design with proper form controls
 */

import React from 'react';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/button';
import type { BudgetExpense } from '@/types/projectDetails';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  editingExpense?: BudgetExpense | null;
  onSave: (data: Partial<BudgetExpense>) => Promise<void>;
  isLoading?: boolean;
}

export function BudgetModal({
  isOpen,
  onClose,
  mode,
  editingExpense,
  onSave,
  isLoading = false
}: BudgetModalProps) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      amount: Number(formData.get('amount')),
      category: formData.get('category') as string,
      description: formData.get('description') as string,
    };

    try {
      await onSave(data);
      onClose();
    } catch (error) {
      console.error('Failed to save budget expense:', error);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Add Expense' : 'Edit Expense'}
      description="Manage project budget expenses with detailed tracking"
      size="md"
      footer={
        <div className="flex gap-3">
          <Button 
            type="submit"
            form="budget-form"
            className="flex-1 bg-buildease-blue-600 hover:bg-buildease-blue-700"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : mode === 'create' ? 'Add Expense' : 'Save Changes'}
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      }
    >
      <form id="budget-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Expense Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Expense Name *
          </label>
          <input 
            name="name"
            type="text" 
            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-buildease-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter expense name (e.g., Foundation materials)"
            defaultValue={editingExpense?.name || ''}
            required
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Amount *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 text-sm">
              $
            </span>
            <input 
              name="amount"
              type="number" 
              min="0"
              step="0.01"
              className="w-full pl-8 pr-3 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-buildease-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="0.00"
              defaultValue={editingExpense?.amount || ''}
              required
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Category *
          </label>
          <select 
            name="category"
            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-buildease-blue-500 focus:border-transparent transition-all duration-200"
            defaultValue={editingExpense?.category || 'Materials'}
            required
          >
            <option value="Materials">Materials</option>
            <option value="Labor">Labor</option>
            <option value="Equipment">Equipment</option>
            <option value="Permits">Permits</option>
            <option value="Utilities">Utilities</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Description
          </label>
          <textarea 
            name="description"
            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-buildease-blue-500 focus:border-transparent transition-all duration-200 resize-none"
            rows={3}
            placeholder="Add notes about this expense (optional)"
            defaultValue={editingExpense?.description || ''}
          />
        </div>

        {/* Budget Impact Info */}
        <div className="bg-buildease-blue-50 border border-buildease-blue-200 rounded-lg p-4">
          <div className="text-sm text-slate-700">
            <div className="font-medium mb-1">Budget Impact</div>
            <div className="text-slate-600 text-xs">
              This expense will be added to your project budget tracking and will affect your overall budget utilization percentage.
            </div>
          </div>
        </div>
      </form>
    </BaseModal>
  );
}