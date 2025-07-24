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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, DollarSign, Save, Plus } from 'lucide-react';
import { BudgetExpenseFormProps, BudgetFormData, FormErrors } from '@/types/projectDetails';

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

// Status options
const STATUS_OPTIONS = [
  { value: 'planned', label: 'Planned' },
  { value: 'approved', label: 'Approved' },
  { value: 'paid', label: 'Paid' }
];

// Default form data
const defaultFormData: BudgetFormData = {
  name: '',
  amount: 0,
  category: 'Materials',
  description: '',
  status: 'planned',
  paymentDate: '',
  vendorName: ''
};

// Form validation
const validateForm = (data: BudgetFormData): FormErrors => {
  const errors: FormErrors = {};

  if (!data.name.trim()) {
    errors.name = 'Expense name is required';
  }

  if (data.amount <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }

  if (!data.category) {
    errors.category = 'Category is required';
  }

  return errors;
};

export function BudgetExpenseForm({
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
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Expense Name */}
      <div>
        <Label htmlFor="name" className="text-sm font-medium text-slate-700">
          Expense Name *
        </Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter expense name (e.g., Foundation materials)"
          className={`mt-2 ${errors.name ? 'border-red-500' : ''}`}
          required
        />
        {errors.name && (
          <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
            <AlertTriangle className="h-3 w-3" />
            {errors.name}
          </div>
        )}
      </div>

      {/* Amount and Category Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      {/* Status and Payment Date Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Status */}
        <div>
          <Label htmlFor="status" className="text-sm font-medium text-slate-700">
            Status
          </Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleChange('status', value)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Payment Date */}
        <div>
          <Label htmlFor="paymentDate" className="text-sm font-medium text-slate-700">
            Payment Date
          </Label>
          <Input
            id="paymentDate"
            type="date"
            value={formData.paymentDate}
            onChange={(e) => handleChange('paymentDate', e.target.value)}
            className="mt-2"
          />
        </div>
      </div>

      {/* Vendor Name */}
      <div>
        <Label htmlFor="vendorName" className="text-sm font-medium text-slate-700">
          Vendor/Supplier Name
        </Label>
        <Input
          id="vendorName"
          type="text"
          value={formData.vendorName}
          onChange={(e) => handleChange('vendorName', e.target.value)}
          placeholder="Enter vendor or supplier name"
          className="mt-2"
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description" className="text-sm font-medium text-slate-700">
          Description
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Add notes about this expense (optional)"
          className="mt-2 resize-none"
          rows={3}
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
}