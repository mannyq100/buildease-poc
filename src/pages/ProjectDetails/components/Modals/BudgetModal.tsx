/**
 * BudgetModal - Construction budget management modal
 * Mobile-first design optimized for construction site usage
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BaseModal } from '@/components/ui/BaseModal';
import { DollarSign } from 'lucide-react';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BudgetFormData) => void;
  mode: 'create' | 'edit';
  initialData?: BudgetFormData;
  isLoading?: boolean;
}

interface BudgetFormData {
  category: string;
  description: string;
  budgetedAmount: number;
  actualAmount?: number;
  notes?: string;
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
    category: initialData?.category || '',
    description: initialData?.description || '',
    budgetedAmount: initialData?.budgetedAmount || 0,
    actualAmount: initialData?.actualAmount || 0,
    notes: initialData?.notes || ''
  });

  const handleSubmit = () => {
    // Basic validation
    if (!formData.category || !formData.description || formData.budgetedAmount <= 0) {
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
        {/* Category Selection - Construction-specific categories */}
        <div>
          <Label className="block text-sm font-medium text-slate-700 mb-2">
            Budget Category
          </Label>
          <Select 
            value={formData.category} 
            onValueChange={(value) => handleInputChange('category', value)}
          >
            <SelectTrigger className="h-12 border-2 border-slate-300 focus:border-buildease-blue-500 rounded-lg">
              <SelectValue placeholder="Select budget category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="materials">Materials & Supplies</SelectItem>
              <SelectItem value="labor">Labor Costs</SelectItem>
              <SelectItem value="equipment">Equipment Rental</SelectItem>
              <SelectItem value="permits">Permits & Inspections</SelectItem>
              <SelectItem value="subcontractors">Subcontractors</SelectItem>
              <SelectItem value="utilities">Utilities</SelectItem>
              <SelectItem value="insurance">Insurance</SelectItem>
              <SelectItem value="contingency">Contingency</SelectItem>
              <SelectItem value="other">Other Expenses</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div>
          <Label className="block text-sm font-medium text-slate-700 mb-2">
            Description
          </Label>
          <Input
            type="text"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter budget item description"
            className="h-12 border-2 border-slate-300 focus:border-buildease-blue-500 rounded-lg"
          />
        </div>

        {/* Budget Amounts - Side by side on larger screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-2">
              Budgeted Amount
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                type="number"
                value={formData.budgetedAmount}
                onChange={(e) => handleInputChange('budgetedAmount', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="h-12 pl-10 border-2 border-slate-300 focus:border-buildease-blue-500 rounded-lg"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-2">
              Actual Amount <span className="text-xs text-slate-500">(optional)</span>
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                type="number"
                value={formData.actualAmount || ''}
                onChange={(e) => handleInputChange('actualAmount', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="h-12 pl-10 border-2 border-slate-300 focus:border-buildease-blue-500 rounded-lg"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Budget Variance Indicator */}
        {formData.budgetedAmount > 0 && formData.actualAmount && formData.actualAmount > 0 && (
          <div className="p-3 rounded-lg border-2 bg-slate-50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Budget Variance:</span>
              <span className={`text-sm font-semibold ${
                formData.actualAmount <= formData.budgetedAmount 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                ${Math.abs(formData.actualAmount - formData.budgetedAmount).toFixed(2)} 
                {formData.actualAmount <= formData.budgetedAmount ? ' under' : ' over'}
              </span>
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <Label className="block text-sm font-medium text-slate-700 mb-2">
            Notes <span className="text-xs text-slate-500">(optional)</span>
          </Label>
          <Textarea
            value={formData.notes || ''}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Add any additional notes about this budget item..."
            className="min-h-[80px] border-2 border-slate-300 focus:border-buildease-blue-500 rounded-lg resize-none"
            rows={3}
          />
        </div>

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
