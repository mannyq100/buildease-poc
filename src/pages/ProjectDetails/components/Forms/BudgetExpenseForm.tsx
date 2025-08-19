/**
 * BudgetExpenseForm - Standardized form component for budget expense creation/editing
 * Follows BuildEase component architecture standards:
 * - Under 400 lines
 * - Mobile-first responsive design
 * - Strong TypeScript typing
 * - BuildEase color scheme and proper form validation
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, DollarSign, Save, Plus } from 'lucide-react';
import { BudgetExpenseFormProps, BudgetFormData, FormErrors, TransactionType, PaymentStatus, PaymentMethod, Currency } from '@/types/projectDetails';

// Budget category options
const BUDGET_CATEGORIES = [
  { value: 'Materials', label: 'Materials' },
  { value: 'Labor', label: 'Labor' },
  { value: 'Equipment', label: 'Equipment' },
  { value: 'Permits', label: 'Permits' },
  { value: 'Utilities', label: 'Utilities' },
  { value: 'Subcontractors', label: 'Subcontractors' },
  { value: 'Transportation', label: 'Transportation' },
  { value: 'Other', label: 'Other' }
];

// Transaction type options
const TRANSACTION_TYPE_OPTIONS = [
  { value: 'MATERIAL_PURCHASE', label: 'Material Purchase' },
  { value: 'LABOR', label: 'Labor' },
  { value: 'EQUIPMENT_RENTAL', label: 'Equipment Rental' },
  { value: 'PERMIT_FEE', label: 'Permit Fee' },
  { value: 'DESIGN_FEE', label: 'Design Fee' },
  { value: 'OTHER', label: 'Other' }
];

// Payment status options
const PAYMENT_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'PAID', label: 'Paid' },
  { value: 'COMPLETED', label: 'Completed' }
];

// Payment method options
const PAYMENT_METHOD_OPTIONS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CHECK', label: 'Check' },
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'OTHER', label: 'Other' }
];

// Currency options
const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CAD', label: 'CAD (C$)' }
];

// Default form data
const defaultFormData: BudgetFormData = {
  transaction_type: 'MATERIAL_PURCHASE',
  amount: 0,
  currency: 'USD',
  category: 'Materials',
  description: '',
  payment_status: 'PENDING',
  payment_method: 'CASH',
  payment_date: '',
  phase_id: ''
};

// Form validation
const validateForm = (data: BudgetFormData): FormErrors => {
  const errors: FormErrors = {};

  if (!data.description?.trim()) {
    errors.description = 'Description is required';
  }

  if (data.amount <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }

  if (!data.category) {
    errors.category = 'Category is required';
  }

  if (!data.transaction_type) {
    errors.transaction_type = 'Transaction type is required';
  }

  return errors;
};

const BudgetExpenseFormComponent = function BudgetExpenseForm({
  mode,
  initialData,
  onSubmit,
  isLoading = false
}: BudgetExpenseFormProps) {
  const [formData, setFormData] = useState<BudgetFormData>(defaultFormData);
  const [errors, setErrors] = useState<FormErrors>({});

  // Initialize form data when component mounts or initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...defaultFormData,
        ...initialData,
        amount: initialData.amount || 0
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [initialData]);

  // Handle form field changes
  const handleChange = (field: keyof BudgetFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Description */}
      <div>
        <Label htmlFor="description" className="text-sm font-medium text-slate-700">
          Description *
        </Label>
        <Input
          id="description"
          type="text"
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Enter expense description (e.g., Foundation materials)"
          className={`mt-2 ${errors.description ? 'border-red-500' : ''}`}
          required
        />
        {errors.description && (
          <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
            <AlertTriangle className="h-3 w-3" />
            {errors.description}
          </div>
        )}
      </div>

      {/* Transaction Type */}
      <div>
        <Label htmlFor="transaction_type" className="text-sm font-medium text-slate-700">
          Transaction Type *
        </Label>
        <Select
          value={formData.transaction_type}
          onValueChange={(value) => handleChange('transaction_type', value as TransactionType)}
        >
          <SelectTrigger className={`mt-2 ${errors.transaction_type ? 'border-red-500' : ''}`}>
            <SelectValue placeholder="Select transaction type" />
          </SelectTrigger>
          <SelectContent>
            {TRANSACTION_TYPE_OPTIONS.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.transaction_type && (
          <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
            <AlertTriangle className="h-3 w-3" />
            {errors.transaction_type}
          </div>
        )}
      </div>

      {/* Amount, Currency and Category Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Amount */}
        <div>
          <Label htmlFor="amount" className="text-sm font-medium text-slate-700">
            Amount *
          </Label>
          <div className="relative mt-2">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.amount || ''}
              onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className={`pl-10 ${errors.amount ? 'border-red-500' : ''}`}
              required
            />
          </div>
          {errors.amount && (
            <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
              <AlertTriangle className="h-3 w-3" />
              {errors.amount}
            </div>
          )}
        </div>

        {/* Currency */}
        <div>
          <Label htmlFor="currency" className="text-sm font-medium text-slate-700">
            Currency *
          </Label>
          <Select
            value={formData.currency}
            onValueChange={(value) => handleChange('currency', value as Currency)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCY_OPTIONS.map(currency => (
                <SelectItem key={currency.value} value={currency.value}>
                  {currency.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        <div>
          <Label htmlFor="category" className="text-sm font-medium text-slate-700">
            Category *
          </Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleChange('category', value)}
          >
            <SelectTrigger className={`mt-2 ${errors.category ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {BUDGET_CATEGORIES.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
              <AlertTriangle className="h-3 w-3" />
              {errors.category}
            </div>
          )}
        </div>
      </div>

      {/* Payment Status, Method and Date Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Payment Status */}
        <div>
          <Label htmlFor="payment_status" className="text-sm font-medium text-slate-700">
            Payment Status
          </Label>
          <Select
            value={formData.payment_status}
            onValueChange={(value) => handleChange('payment_status', value as PaymentStatus)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_STATUS_OPTIONS.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Payment Method */}
        <div>
          <Label htmlFor="payment_method" className="text-sm font-medium text-slate-700">
            Payment Method
          </Label>
          <Select
            value={formData.payment_method || ''}
            onValueChange={(value) => handleChange('payment_method', value as PaymentMethod)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHOD_OPTIONS.map(method => (
                <SelectItem key={method.value} value={method.value}>
                  {method.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Payment Date */}
        <div>
          <Label htmlFor="payment_date" className="text-sm font-medium text-slate-700">
            Payment Date
          </Label>
          <Input
            id="payment_date"
            type="date"
            value={formData.payment_date || ''}
            onChange={(e) => handleChange('payment_date', e.target.value)}
            className="mt-2"
          />
        </div>
      </div>

      {/* Currency Conversion Info */}
      {formData.currency !== 'USD' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="text-sm text-slate-700">
            <div className="font-medium mb-1">Currency Conversion</div>
            <div className="text-slate-600 text-xs">
              This expense will be automatically converted to USD for consistent budget calculations. The original amount and currency will be preserved.
            </div>
          </div>
        </div>
      )}

      {/* Budget Impact Info */}
      <div className="bg-buildease-blue-50 border border-buildease-blue-200 rounded-lg p-4">
        <div className="text-sm text-slate-700">
          <div className="font-medium mb-1">Budget Impact</div>
          <div className="text-slate-600 text-xs">
            This expense will be added to your project budget tracking and will affect your overall budget utilization percentage.
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-buildease-blue-600 hover:bg-buildease-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          {isLoading ? (
            <div className="animate-spin h-4 w-4 mr-2" />
          ) : mode === 'create' ? (
            <Plus className="h-4 w-4 mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {mode === 'create' ? 'Add Expense' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};

// Memoize component to prevent unnecessary re-renders
export const BudgetExpenseForm = React.memo(BudgetExpenseFormComponent);