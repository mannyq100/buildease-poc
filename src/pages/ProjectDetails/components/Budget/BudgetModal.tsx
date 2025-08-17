/**
 * BudgetModal component
 * Extracted from ProjectDetailsContent.tsx - Budget CRUD Modal
 * Handles creating and editing budget expenses with proper form validation
 * Mobile-first responsive design with proper form controls
 */

import React from 'react';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/button';
import { 
  Hammer, 
  HardHat, 
  Wrench, 
  Truck,
  Building,
  ClipboardList,
  Sparkles
} from 'lucide-react';
import { cn } from '@/utils/core/ui';
import type { BudgetExpense, BudgetFormData, TransactionType, PaymentStatus, PaymentMethod, Currency } from '@/types/projectDetails';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  editingExpense?: BudgetExpense | null;
  onSave: (data: BudgetFormData) => Promise<void>;
  isLoading?: boolean;
  projectPhases?: { id: string; name: string }[];
  project?: { currency?: string; };
}

interface ExpenseTemplate {
  id: string;
  name: string;
  icon: React.ReactNode;
  category: string;
  transaction_type: TransactionType;
  description: string;
  color: string;
  defaultAmount?: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  notes?: string;
}

const CONSTRUCTION_TEMPLATES: ExpenseTemplate[] = [
  {
    id: 'materials',
    name: 'Materials',
    icon: <Hammer className="h-4 w-4" />,
    category: 'Materials',
    transaction_type: 'MATERIAL_PURCHASE',
    description: 'Construction materials purchase',
    defaultAmount: 500,
    paymentStatus: 'PENDING',
    paymentMethod: 'CREDIT_CARD',
    notes: 'Bulk materials for construction phase',
    color: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    id: 'labor',
    name: 'Labor',
    icon: <HardHat className="h-4 w-4" />,
    category: 'Labor',
    transaction_type: 'LABOR',
    description: 'Worker payment for construction services',
    defaultAmount: 800,
    paymentStatus: 'PENDING',
    paymentMethod: 'CHECK',
    notes: 'Daily/weekly labor costs',
    color: 'bg-green-500 hover:bg-green-600',
  },
  {
    id: 'equipment',
    name: 'Equipment',
    icon: <Wrench className="h-4 w-4" />,
    category: 'Equipment',
    transaction_type: 'EQUIPMENT_RENTAL',
    description: 'Equipment rental or purchase',
    defaultAmount: 300,
    paymentStatus: 'APPROVED',
    paymentMethod: 'BANK_TRANSFER',
    notes: 'Heavy machinery and tools rental',
    color: 'bg-orange-500 hover:bg-orange-600',
  },
  {
    id: 'transport',
    name: 'Transport',
    icon: <Truck className="h-4 w-4" />,
    category: 'Other',
    transaction_type: 'OTHER',
    description: 'Delivery and transportation costs',
    defaultAmount: 150,
    paymentStatus: 'PENDING',
    paymentMethod: 'CASH',
    notes: 'Material delivery and logistics',
    color: 'bg-purple-500 hover:bg-purple-600',
  },
  {
    id: 'permits',
    name: 'Permits',
    icon: <ClipboardList className="h-4 w-4" />,
    category: 'Permits',
    transaction_type: 'PERMIT_FEE',
    description: 'Building permit and inspection fees',
    defaultAmount: 250,
    paymentStatus: 'PAID',
    paymentMethod: 'CHECK',
    notes: 'Required municipal permits and inspections',
    color: 'bg-slate-500 hover:bg-slate-600',
  },
  {
    id: 'design',
    name: 'Design',
    icon: <Building className="h-4 w-4" />,
    category: 'Design',
    transaction_type: 'DESIGN_FEE',
    description: 'Architectural and design services',
    defaultAmount: 1200,
    paymentStatus: 'APPROVED',
    paymentMethod: 'BANK_TRANSFER',
    notes: 'Professional design and architectural fees',
    color: 'bg-indigo-500 hover:bg-indigo-600',
  },
];

export function BudgetModal({
  isOpen,
  onClose,
  mode,
  editingExpense,
  onSave,
  isLoading = false,
  projectPhases = [],
  project
}: BudgetModalProps) {
  const [selectedTemplate, setSelectedTemplate] = React.useState<ExpenseTemplate | null>(null);
  const [showTemplates, setShowTemplates] = React.useState(mode === 'create');
  
  // Form state for template pre-population
  const [formData, setFormData] = React.useState({
    description: '',
    amount: '',
    category: '',
    notes: '',
    payment_status: 'PENDING' as PaymentStatus,
    payment_method: '' as PaymentMethod | '',
  });
  // Popular currencies with symbols and names
  const popularCurrencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr' }
  ];

  // Get project's default currency or fallback to USD
  const defaultCurrency = project?.currency?.toUpperCase() || 'USD';
  
  // Get currency symbol for display
  const getCurrencySymbol = (currencyCode: string): string => {
    const currency = popularCurrencies.find(c => c.code === currencyCode);
    return currency?.symbol || currencyCode;
  };

  // Reorder currencies to show project default first
  const orderedCurrencies = React.useMemo(() => {
    const defaultCurrencyObj = popularCurrencies.find(c => c.code === defaultCurrency);
    const otherCurrencies = popularCurrencies.filter(c => c.code !== defaultCurrency);
    
    if (defaultCurrencyObj) {
      return [defaultCurrencyObj, ...otherCurrencies];
    }
    return popularCurrencies;
  }, [defaultCurrency]);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const category = formData.get('category') as string;
    
    // Map category to appropriate transaction_type
    const getTransactionType = (category: string): TransactionType => {
      switch (category.toLowerCase()) {
        case 'materials': return 'MATERIAL_PURCHASE';
        case 'labor': return 'LABOR';
        case 'equipment': return 'EQUIPMENT_RENTAL';
        case 'permits': return 'PERMIT_FEE';
        case 'design': return 'DESIGN_FEE';
        default: return 'OTHER';
      }
    };

    const expenseName = formData.get('description') as string;
    const notes = formData.get('notes') as string;
    
    // Combine expense name and notes for the description field
    const fullDescription = notes ? `${expenseName} - ${notes}` : expenseName;

    const data: BudgetFormData = {
      transaction_type: getTransactionType(category),
      amount: Number(formData.get('amount')),
      currency: formData.get('currency') as Currency,
      description: fullDescription,
      category: category,
      payment_date: formData.get('payment_date') as string,
      payment_status: formData.get('payment_status') as PaymentStatus,
      payment_method: formData.get('payment_method') as PaymentMethod,
      phase_id: formData.get('phase_id') as string || undefined,
    };

    try {
      await onSave(data);
      onClose();
    } catch (error) {
      console.error('Failed to save budget expense:', error);
    }
  };

  const handleTemplateSelect = (template: ExpenseTemplate) => {
    setSelectedTemplate(template);
    setShowTemplates(false);
    
    // Pre-fill form state with comprehensive template data
    setFormData({
      description: template.description,
      amount: template.defaultAmount?.toString() || '',
      category: template.category,
      notes: template.notes || '',
      payment_status: template.paymentStatus,
      payment_method: template.paymentMethod || '',
    });
  };

  // Initialize form data when modal opens
  React.useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && editingExpense) {
        // Pre-populate form with existing expense data
        setFormData({
          description: editingExpense.description ? editingExpense.description.split(' - ')[0] || editingExpense.description : '',
          amount: editingExpense.amount?.toString() || '',
          category: editingExpense.category || '',
          notes: editingExpense.description ? editingExpense.description.split(' - ')[1] || '' : '',
          payment_status: editingExpense.payment_status || 'PENDING',
          payment_method: editingExpense.payment_method || '',
        });
        setSelectedTemplate(null);
        setShowTemplates(false);
      } else {
        // Reset form for create mode
        setFormData({
          description: '',
          amount: '',
          category: 'Materials',
          notes: '',
          payment_status: 'PENDING',
          payment_method: '',
        });
        setSelectedTemplate(null);
        setShowTemplates(true);
      }
    }
  }, [isOpen, mode, editingExpense]);

  // Reset when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedTemplate(null);
      setShowTemplates(mode === 'create');
      setFormData({
        description: '',
        amount: '',
        category: 'Materials',
        notes: '',
        payment_status: 'PENDING',
        payment_method: '',
      });
    }
  }, [isOpen, mode]);

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
        {/* Quick Templates (only show in create mode) */}
        {mode === 'create' && showTemplates && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-medium text-gray-900">Quick Templates</h3>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowTemplates(false)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Skip templates
              </Button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CONSTRUCTION_TEMPLATES.map((template) => (
                <Button
                  key={template.id}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTemplateSelect(template)}
                  className={cn(
                    'h-16 flex-col gap-1 p-2',
                    'border border-gray-200 hover:border-gray-300',
                    'bg-white hover:bg-gray-50',
                    'transition-all duration-200'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center text-white',
                    template.color
                  )}>
                    {template.icon}
                  </div>
                  <span className="text-xs font-medium leading-tight text-center">
                    {template.name}
                  </span>
                </Button>
              ))}
            </div>
            
            <p className="text-xs text-gray-500 mt-3 text-center">
              Select a template to auto-fill common expense details
            </p>
          </div>
        )}

        {/* Selected Template Indicator */}
        {selectedTemplate && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className={cn(
              'w-6 h-6 rounded flex items-center justify-center text-white text-xs',
              selectedTemplate.color
            )}>
              {selectedTemplate.icon}
            </div>
            <span className="text-sm text-blue-900">
              Using <strong>{selectedTemplate.name}</strong> template
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedTemplate(null);
                setShowTemplates(true);
              }}
              className="ml-auto h-6 w-6 p-0 text-blue-600 hover:text-blue-700"
            >
              ×
            </Button>
          </div>
        )}

        {/* Expense Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Expense Name *
          </label>
          <input 
            name="description"
            type="text" 
            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-buildease-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter expense name (e.g., Foundation materials, Electrical supplies)"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
          />
        </div>

        {/* Amount and Currency */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Amount *
            </label>
            <input 
              name="amount"
              type="number" 
              min="0"
              step="0.01"
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-buildease-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Currency *
            </label>
            <select 
              name="currency"
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-buildease-blue-500 focus:border-transparent transition-all duration-200"
              defaultValue={editingExpense?.currency || defaultCurrency}
              required
            >
              {orderedCurrencies.map((currency, index) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} ({currency.symbol}) - {currency.name}
                  {index === 0 && currency.code === defaultCurrency ? ' (Project Default)' : ''}
                </option>
              ))}
            </select>
            {defaultCurrency !== 'USD' && (
              <p className="text-xs text-slate-500 mt-1">
                💡 Project uses {defaultCurrency} by default
              </p>
            )}
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
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            required
          >
            <option value="Materials">Materials</option>
            <option value="Labor">Labor</option>
            <option value="Equipment">Equipment</option>
            <option value="Permits">Permits</option>
            <option value="Utilities">Utilities</option>
            <option value="Design">Design</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Additional Notes
          </label>
          <textarea 
            name="notes"
            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-buildease-blue-500 focus:border-transparent transition-all duration-200 resize-none"
            rows={3}
            placeholder="Add additional notes about this expense (optional)"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          />
        </div>

        {/* Payment Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Payment Status *
            </label>
            <select 
              name="payment_status"
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-buildease-blue-500 focus:border-transparent transition-all duration-200"
              value={formData.payment_status}
              onChange={(e) => setFormData(prev => ({ ...prev, payment_status: e.target.value as PaymentStatus }))}
              required
            >
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="PAID">Paid</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Payment Method
            </label>
            <select 
              name="payment_method"
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-buildease-blue-500 focus:border-transparent transition-all duration-200"
              value={formData.payment_method}
              onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value as PaymentMethod }))}
            >
              <option value="">Select payment method</option>
              <option value="CASH">Cash</option>
              <option value="CHECK">Check</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>


        {/* Payment Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Payment Date
          </label>
          <input 
            name="payment_date"
            type="date" 
            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-buildease-blue-500 focus:border-transparent transition-all duration-200"
            defaultValue={editingExpense?.payment_date ? editingExpense.payment_date.split('T')[0] : ''}
          />
        </div>

        {/* Phase Assignment (if phases available) */}
        {projectPhases.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Assign to Phase (Optional)
            </label>
            <select 
              name="phase_id"
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-buildease-blue-500 focus:border-transparent transition-all duration-200"
              defaultValue={editingExpense?.phase_id || ''}
            >
              <option value="">No specific phase</option>
              {projectPhases.map((phase) => (
                <option key={phase.id} value={phase.id}>
                  {phase.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Budget Impact Info */}
        <div className="bg-buildease-blue-50 border border-buildease-blue-200 rounded-lg p-4">
          <div className="text-sm text-slate-700">
            <div className="font-medium mb-1">Financial Transaction</div>
            <div className="text-slate-600 text-xs">
              This transaction will be recorded in your project's financial ledger and will affect budget calculations. Multi-currency amounts are automatically converted to USD for reporting.
            </div>
          </div>
        </div>
      </form>
    </BaseModal>
  );
}