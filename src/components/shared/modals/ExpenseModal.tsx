import React, { useCallback, useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { BaseModal } from '@/components/ui/BaseModal';
import { FormField, ModalFooter, SelectField } from '@/components/ui/form-fields';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  isOpen: boolean;
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
  isOpen,
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
  const getDefaultValues = useCallback((): ExpenseFormData => ({
    id: expense?.id || uuidv4(),
    description: expense?.description || '',
    amount: expense?.amount || 0,
    date: expense?.date || new Date().toISOString().split('T')[0],
    category: expense?.category || (categories.length > 0 ? categories[0] : ''),
    project: expense?.project || (projects.length > 0 ? projects[0] : ''),
    notes: expense?.notes || '',
    status: expense?.status || 'pending',
  }), [expense, categories, projects]);

  // Initialize React Hook Form
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<ExpenseFormData>({
    defaultValues: getDefaultValues(),
    mode: 'onBlur'
  });

  // Watch form data for viewing mode
  const formData = watch();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      reset(getDefaultValues());
    }
  }, [isOpen, reset, getDefaultValues]);

  // For file upload handling
  const [receipt, setReceipt] = useState<File | null>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setReceipt(e.target.files[0]);
    }
  };

  // Combine the internal saving state with any external loading state
  const saving = isSubmitting || isLoading;

  // Handle form submission
  const onSubmit = useCallback((data: ExpenseFormData) => {
    // Prepare the data with a new ID if this is a new expense
    const expenseToSave: ExpenseFormData = {
      ...data,
      id: data.id || uuidv4()
    };

    // Here you would typically handle the file upload if needed
    // For this example, we'll just save the expense data
    setTimeout(() => {
      onSave(expenseToSave);
    }, 500);
  }, [onSave]);

  // Handle form submit wrapper
  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(onSubmit)(e);
  }, [handleSubmit, onSubmit]);

  // Viewing existing expense
  const isViewingMode = !isNew && formData?.status;

  // Create the modal footer with appropriate actions
  const modalFooter = isViewingMode ? (
    <div className="flex justify-end space-x-2">
      <Button variant="outline" onClick={onClose}>Close</Button>
      <Button onClick={() => {
        setValue('status', 'approved');
        handleSubmit(onSubmit)();
      }}>
        Approve
      </Button>
    </div>
  ) : (
    <ModalFooter
      onClose={onClose}
      onSubmit={handleFormSubmit}
      isNew={isNew}
      saving={saving}
    />
  );

  return (
    <BaseModal
      isOpen={isOpen}
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
        <form id="expense-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <Controller
            control={control}
            name="description"
            rules={{ 
              required: 'Description is required',
              validate: (value) => value?.trim() ? true : 'Description cannot be empty'
            }}
            render={({ field, fieldState: { error } }) => (
              <FormField
                label="Description"
                name="description"
                type="text"
                value={field.value || ''}
                onChange={field.onChange}
                placeholder="Enter expense description"
                error={error?.message}
                required
              />
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Controller
              control={control}
              name="amount"
              rules={{ 
                required: 'Amount is required',
                min: { value: 0.01, message: 'Amount must be greater than zero' },
                validate: (value) => !isNaN(value) || 'Amount must be a valid number'
              }}
              render={({ field, fieldState: { error } }) => (
                <FormField
                  label="Amount"
                  name="amount"
                  type="number"
                  value={field.value?.toString() || ''}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  placeholder="0.00"
                  icon={DollarSign}
                  error={error?.message}
                  required
                  min={0.01}
                  step={0.01}
                />
              )}
            />
            
            <Controller
              control={control}
              name="date"
              rules={{ required: 'Date is required' }}
              render={({ field, fieldState: { error } }) => (
                <FormField
                  label="Date"
                  name="date"
                  type="date"
                  value={field.value || ''}
                  onChange={field.onChange}
                  icon={Calendar}
                  error={error?.message}
                  required
                />
              )}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Controller
              control={control}
              name="category"
              rules={{ required: 'Category is required' }}
              render={({ field, fieldState: { error } }) => (
                <SelectField
                  label="Category"
                  name="category"
                  value={field.value || ''}
                  onValueChange={field.onChange}
                  options={categories.map(cat => ({ value: cat, label: cat }))}
                  icon={Tag}
                  error={error?.message}
                  required
                />
              )}
            />
            
            <Controller
              control={control}
              name="project"
              rules={{ required: 'Project is required' }}
              render={({ field, fieldState: { error } }) => (
                <SelectField
                  label="Project"
                  name="project"
                  value={field.value || ''}
                  onValueChange={field.onChange}
                  options={projects.map(proj => ({ value: proj, label: proj }))}
                  icon={Building}
                  error={error?.message}
                  required
                />
              )}
            />
          </div>
          
          <Controller
            control={control}
            name="notes"
            render={({ field, fieldState: { error } }) => (
              <FormField
                label="Notes"
                name="notes"
                type="textarea"
                value={field.value || ''}
                onChange={field.onChange}
                placeholder="Enter any additional notes"
                error={error?.message}
              />
            )}
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
