import React, { useCallback, useState } from 'react';
import { Expense } from '@/types/expenses';
import { BaseModal } from './BaseModal';
import { FormField, ModalFooter, SelectField } from '@/components/ui/form-fields';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFormState } from '@/hooks/useFormState';
import { DollarSign, Calendar, FileUp, Receipt, Tag, Building } from 'lucide-react';
import { cn } from '@/utils/core/ui';
import { v4 as uuidv4 } from 'uuid';

export interface ExpenseFormData {
  id?: string | number;
  description: string;
  amount: number;
  date: string;
  category: string;
  project: string;
  notes: string;
  status?: 'pending' | 'approved' | 'rejected';
  receipt?: string;
}

interface ExpenseModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (expense: ExpenseFormData) => void;
  expense?: ExpenseFormData;
  isNew?: boolean;
  title?: string;
  description?: string;
  isLoading?: boolean;
  categories?: string[];
  projects?: string[];
}

export function ExpenseModal({
  show,
  onClose,
  onSave,
  expense,
  isNew = true,
  title = isNew ? 'Add Expense' : 'Edit Expense',
  description = isNew ? 'Enter expense details below' : 'Update expense information',
  isLoading = false,
  categories = [],
  projects = []
}: ExpenseModalProps) {
  // Default expense data for new expenses
  const defaultExpense: ExpenseFormData = {
    id: '',
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    category: categories.length > 0 ? categories[0] : '',
    project: projects.length > 0 ? projects[0] : '',
    notes: '',
    status: 'pending',
  };

  // Validation function for the expense form
  const validateExpense = useCallback((data: ExpenseFormData) => {
    const errors: Partial<Record<keyof ExpenseFormData, string>> = {};
    
    if (!data.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (isNaN(data.amount) || data.amount <= 0) {
      errors.amount = 'Amount must be greater than zero';
    }
    
    if (!data.date) {
      errors.date = 'Date is required';
    }
    
    if (!data.category) {
      errors.category = 'Category is required';
    }
    
    if (!data.project) {
      errors.project = 'Project is required';
    }
    
    return errors;
  }, []);

  // Use our custom form state hook
  const {
    formData,
    errors,
    setFormData,
    handleChange,
    validate,
    saving: internalSaving,
    setSaving
  } = useFormState<ExpenseFormData>(
    expense,
    defaultExpense,
    show,
    validateExpense
  );

  // For file upload handling
  const [receipt, setReceipt] = useState<File | null>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setReceipt(e.target.files[0]);
    }
  };

  // Combine the internal saving state with any external loading state
  const saving = internalSaving || isLoading;

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    
    // Prepare the data with a new ID if this is a new expense
    const expenseToSave: ExpenseFormData = {
      ...formData,
      id: formData.id || uuidv4()
    };

    // Here you would typically handle the file upload if needed
    // For this example, we'll just save the expense data
    setTimeout(() => {
      onSave(expenseToSave);
      setSaving(false);
    }, 500);
  }, [formData, validate, onSave, setSaving]);

  // Viewing existing expense
  const isViewingMode = !isNew && formData?.status;

  // Create the modal footer with appropriate actions
  const modalFooter = isViewingMode ? (
    <div className="flex justify-end space-x-2">
      <Button variant="outline" onClick={onClose}>Close</Button>
      <Button onClick={() => {
        setFormData({ ...formData, status: 'approved' });
        handleSubmit({ preventDefault: () => {} } as React.FormEvent);
      }}>
        Approve
      </Button>
    </div>
  ) : (
    <ModalFooter
      onClose={onClose}
      onSubmit={handleSubmit}
      isNew={isNew}
      saving={saving}
    />
  );

  return (
    <BaseModal
      show={show}
      onClose={onClose}
      title={title}
      description={description}
      footer={modalFooter}
      saving={saving}
    >
      {isViewingMode ? (
        // View mode display
        <div className="space-y-6 py-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{formData.description}</h3>
            <Badge 
              className={cn(
                "font-normal",
                formData.status === 'approved' && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200",
                formData.status === 'pending' && "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200",
                formData.status === 'rejected' && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200"
              )}
            >
              {(formData.status || '').charAt(0).toUpperCase() + (formData.status || '').slice(1)}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Amount</div>
              <div className="text-xl font-medium flex items-center">
                <DollarSign className="h-5 w-5 text-gray-400 mr-1" />
                ${formData.amount.toFixed(2)}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Date</div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                {new Date(formData.date).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Category</div>
              <Badge variant="outline" className="font-normal text-sm">
                {formData.category}
              </Badge>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Project</div>
              <Badge variant="outline" className="font-normal text-sm bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
                {formData.project}
              </Badge>
            </div>
          </div>
            
          {formData.notes && (
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Notes</div>
              <div className="text-sm border border-gray-200 dark:border-gray-700 rounded-md p-3 bg-gray-50 dark:bg-gray-800/50">
                {formData.notes}
              </div>
            </div>
          )}
            
          {formData.receipt && (
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Receipt</div>
              <div className="flex items-center">
                <Receipt className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-blue-600 hover:underline cursor-pointer">
                  View Receipt
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Edit/Add mode form
        <form id="expense-form" onSubmit={handleSubmit} className="space-y-4 py-2">
          <FormField
            label="Description"
            name="description"
            type="text"
            value={formData.description || ''}
            onChange={handleChange}
            placeholder="Enter expense description"
            error={errors.description}
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Amount"
              name="amount"
              type="number"
              value={formData.amount?.toString() || ''}
              onChange={handleChange}
              placeholder="0.00"
              icon={DollarSign}
              error={errors.amount}
              required
              min={0.01}
              step={0.01}
            />
            
            <FormField
              label="Date"
              name="date"
              type="date"
              value={formData.date || ''}
              onChange={handleChange}
              icon={Calendar}
              error={errors.date}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Category"
              name="category"
              value={formData.category || ''}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              options={categories.map(cat => ({ value: cat, label: cat }))}
              icon={Tag}
              error={errors.category}
              required
            />
            
            <SelectField
              label="Project"
              name="project"
              value={formData.project || ''}
              onValueChange={(value) => setFormData({ ...formData, project: value })}
              options={projects.map(proj => ({ value: proj, label: proj }))}
              icon={Building}
              error={errors.project}
              required
            />
          </div>
          
          <FormField
            label="Notes"
            name="notes"
            type="textarea"
            value={formData.notes || ''}
            onChange={handleChange}
            placeholder="Enter any additional notes"
            error={errors.notes}
          />
          
          <div className="grid gap-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Receipt
            </label>
            <div className="relative">
              <Button 
                type="button"
                variant="outline" 
                className="w-full flex items-center justify-center py-6 border-dashed"
              >
                <FileUp className="h-5 w-5 mr-2" />
                <span>{receipt ? receipt.name : 'Upload Receipt'}</span>
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                />
              </Button>
            </div>
          </div>
        </form>
      )}
    </BaseModal>
  );
}
