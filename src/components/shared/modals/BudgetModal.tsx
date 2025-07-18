// src/components/shared/modals/BudgetModal.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BaseModal } from '@/components/ui/BaseModal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BudgetItem } from '@/types/budget';
import { AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';

// Define potential categories and statuses (can be passed as props later)
const defaultCategories = ['Labor', 'Materials', 'Subcontractor', 'Permits', 'Equipment Rental', 'Income Payment', 'Other'];
const defaultStatuses = ['planned', 'incurred', 'paid', 'received'];
const itemTypes = ['expense', 'income'];

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<BudgetItem>) => void;
  initialData: BudgetItem | null;
  isNewItem: boolean;
}

export function BudgetModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  isNewItem
}: BudgetModalProps) {
  
  const [formData, setFormData] = useState<Partial<BudgetItem>>(initialData || {
    type: 'expense', // Default type
    description: '',
    category: defaultCategories[0], // Default category
    amount: 0,
    date: new Date().toISOString().split('T')[0], // Default to today
    status: 'planned', // Default status
    notes: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Reset form for new item
      setFormData({
        type: 'expense',
        description: '',
        category: defaultCategories[0],
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        status: 'planned',
        notes: ''
      });
    }
    setError(''); // Clear errors when data changes
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement; // Assert type
    const parsedValue = type === 'number' ? parseFloat(value) || 0 : value; // Handle NaN for amount

    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };

  const handleSelectChange = (name: keyof BudgetItem, value: string) => {
     setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    // Basic Validation
    if (!formData.description?.trim()) {
      setError('Description is required.');
      return;
    }
    if (formData.amount === undefined || formData.amount <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }
     if (!formData.date) {
      setError('Date is required.');
      return;
    }
    // Add more validation as needed

    setSaving(true);
    // Simulate API delay
    setTimeout(() => {
      onSave({ ...formData, id: initialData?.id }); // Pass back with ID if editing
      setSaving(false);
      onClose(); // Close modal on successful save
    }, 500);
  };

  const modalTitle = isNewItem ? 'Add Budget Item' : 'Edit Budget Item';
  const modalDescription = isNewItem ? 'Add a new income or expense item to the budget.' : 'Update the details of this budget item.';

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      description={modalDescription}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
               {error && (
                <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-3 py-2 rounded-md text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              {/* Type Select */}
              <div className="space-y-1">
                <Label htmlFor="type" className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</Label>
                 <Select name="type" value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {itemTypes.map(type => (
                      <SelectItem key={type} value={type} className="capitalize flex items-center">
                         {type === 'income' ? 
                          <TrendingUp className="h-4 w-4 mr-2 text-green-500"/> : 
                          <TrendingDown className="h-4 w-4 mr-2 text-red-500"/> 
                         }
                         {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description Input */}
              <div className="space-y-1">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  placeholder="e.g., Concrete delivery, Permit fee, Client payment"
                  required
                  className="w-full"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Amount Input */}
                <div className="space-y-1">
                  <Label htmlFor="amount" className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount ($)</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.amount || ''}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                    className="w-full"
                  />
                </div>

                 {/* Date Input */}
                <div className="space-y-1">
                  <Label htmlFor="date" className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date || ''}
                    onChange={handleChange}
                    required
                    className="w-full"
                  />
                </div>
              </div>

               <div className="grid grid-cols-2 gap-4">
                 {/* Category Select */}
                <div className="space-y-1">
                  <Label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</Label>
                  <Select name="category" value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                    <SelectTrigger id="category" className="w-full">
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {defaultCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                 {/* Status Select */}
                <div className="space-y-1">
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</Label>
                  <Select name="status" value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue placeholder="Select status..." />
                    </SelectTrigger>
                    <SelectContent>
                      {defaultStatuses.map(status => (
                        <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
               </div>

              {/* Notes Textarea */}
              <div className="space-y-1">
                <Label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleChange}
                  placeholder="Add any relevant notes or invoice numbers..."
                  className="w-full min-h-[80px]"
                />
              </div>

            </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={saving} 
            className="min-w-[100px] bg-buildease-blue-600 hover:bg-buildease-blue-700"
          >
            {saving ? 'Saving...' : (isNewItem ? 'Add Item' : 'Save Changes')}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}
