/**
 * BudgetModal - Construction budget management modal
 * Mobile-first design optimized for construction site usage
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BaseModal } from '@/components/ui/BaseModal';
import { DollarSign } from 'lucide-react';
import { BudgetFormData, TransactionType, PaymentStatus, PaymentMethod, Currency } from '@/types/projectDetails';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BudgetFormData) => void;
  mode: 'create' | 'edit';
  initialData?: BudgetFormData;
  isLoading?: boolean;
}

export function BudgetModal({ 
  isOpen, 
  onClose, 
  onSave, 
  mode, 
  initialData,
  isLoading = false 
}: BudgetModalProps) {
  const [formData, setFormData] = useState<BudgetFormData>({
    transaction_type: initialData?.transaction_type || 'MATERIAL_PURCHASE',
    amount: initialData?.amount || 0,
    currency: initialData?.currency || 'USD',
    description: initialData?.description || '',
    category: initialData?.category || 'Materials',
    payment_date: initialData?.payment_date || '',
    payment_status: initialData?.payment_status || 'PENDING',
    payment_method: initialData?.payment_method || 'CASH',
    phase_id: initialData?.phase_id || ''
  });

  const handleSubmit = () => {
    // Basic validation
    if (!formData.category || !formData.description || formData.amount <= 0) {
      return;
    }
    
    onSave(formData);
  };

  const handleInputChange = (field: keyof BudgetFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Add Budget Item' : 'Edit Budget Item'}
      description="Manage project budget expenses and allocations"
      size="md"
      footer={
        <div className="flex gap-3">
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 h-12 bg-buildease-blue-600 hover:bg-buildease-blue-700 text-white font-medium rounded-lg touch-manipulation"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            {mode === 'create' ? 'Add Budget Item' : 'Save Changes'}
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-12 border-2 border-slate-300 text-slate-700 font-medium rounded-lg touch-manipulation"
          >
            Cancel
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Description */}
        <div>
          <Label className="block text-sm font-medium text-slate-700 mb-2">
            Description *
          </Label>
          <Input
            type="text"
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter expense description"
            className="h-12 border-2 border-slate-300 focus:border-buildease-blue-500 rounded-lg"
          />
        </div>

        {/* Transaction Type */}
        <div>
          <Label className="block text-sm font-medium text-slate-700 mb-2">
            Transaction Type *
          </Label>
          <Select 
            value={formData.transaction_type} 
            onValueChange={(value) => handleInputChange('transaction_type', value as TransactionType)}
          >
            <SelectTrigger className="h-12 border-2 border-slate-300 focus:border-buildease-blue-500 rounded-lg">
              <SelectValue placeholder="Select transaction type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MATERIAL_PURCHASE">Material Purchase</SelectItem>
              <SelectItem value="LABOR">Labor</SelectItem>
              <SelectItem value="EQUIPMENT_RENTAL">Equipment Rental</SelectItem>
              <SelectItem value="PERMIT_FEE">Permit Fee</SelectItem>
              <SelectItem value="DESIGN_FEE">Design Fee</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Amount, Currency and Category */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-2">
              Amount *
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="h-12 pl-10 border-2 border-slate-300 focus:border-buildease-blue-500 rounded-lg"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-2">
              Currency
            </Label>
            <Select 
              value={formData.currency} 
              onValueChange={(value) => handleInputChange('currency', value as Currency)}
            >
              <SelectTrigger className="h-12 border-2 border-slate-300 focus:border-buildease-blue-500 rounded-lg">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="CAD">CAD (C$)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-2">
              Category
            </Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => handleInputChange('category', value)}
            >
              <SelectTrigger className="h-12 border-2 border-slate-300 focus:border-buildease-blue-500 rounded-lg">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Materials">Materials</SelectItem>
                <SelectItem value="Labor">Labor</SelectItem>
                <SelectItem value="Equipment">Equipment</SelectItem>
                <SelectItem value="Permits">Permits</SelectItem>
                <SelectItem value="Utilities">Utilities</SelectItem>
                <SelectItem value="Subcontractors">Subcontractors</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Payment Status, Method and Date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-2">
              Payment Status
            </Label>
            <Select 
              value={formData.payment_status} 
              onValueChange={(value) => handleInputChange('payment_status', value as PaymentStatus)}
            >
              <SelectTrigger className="h-12 border-2 border-slate-300 focus:border-buildease-blue-500 rounded-lg">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-2">
              Payment Method
            </Label>
            <Select 
              value={formData.payment_method || ''} 
              onValueChange={(value) => handleInputChange('payment_method', value as PaymentMethod)}
            >
              <SelectTrigger className="h-12 border-2 border-slate-300 focus:border-buildease-blue-500 rounded-lg">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="CHECK">Check</SelectItem>
                <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-2">
              Payment Date
            </Label>
            <Input
              type="date"
              value={formData.payment_date || ''}
              onChange={(e) => handleInputChange('payment_date', e.target.value)}
              className="h-12 border-2 border-slate-300 focus:border-buildease-blue-500 rounded-lg"
            />
          </div>
        </div>

        {/* Currency Conversion Notice */}
        {formData.currency !== 'USD' && (
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="text-sm text-amber-800">
              <div className="font-medium mb-1">Currency Conversion</div>
              <div className="text-xs">
                This expense will be automatically converted to USD for consistent budget calculations.
              </div>
            </div>
          </div>
        )}

        {/* Construction Budget Tips */}
        <div className="p-3 bg-buildease-blue-50 rounded-lg border border-buildease-blue-200">
          <h4 className="text-sm font-semibold text-buildease-blue-900 mb-2">
            💡 Budget Management Tips
          </h4>
          <ul className="text-xs text-buildease-blue-800 space-y-1">
            <li>• Include 10-20% contingency for unexpected costs</li>
            <li>• Track actual costs regularly to avoid overruns</li>
            <li>• Get multiple quotes for major expenses</li>
            <li>• Factor in material price fluctuations</li>
          </ul>
        </div>
      </div>
    </BaseModal>
  );
}
