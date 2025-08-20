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
import type { BudgetExpense, BudgetFormData, TransactionType, PaymentStatus, PaymentMethod } from '@/types/projectDetails';
import { currencyService, type CurrencyOption } from '@/services/currencyService';
import type { ExchangeRateInfo } from '@/services/currencyService';
import { validateBudgetExpense, type BudgetValidationResult } from '@/utils/budget/budgetValidation';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  editingExpense?: BudgetExpense | null;
  onSave: (data: BudgetFormData & { base_currency?: string; exchange_rate?: number | null }) => Promise<void>;
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
  const [selectedTemplate, setSelectedTemplate] = React.useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = React.useState<CurrencyOption | null>(null);
  const [exchangeRateInfo, setExchangeRateInfo] = React.useState<ExchangeRateInfo | null>(null);
  const [showTemplates, setShowTemplates] = React.useState(false);
  const [validationResult, setValidationResult] = React.useState<BudgetValidationResult | null>(null);

  // Form state for template pre-population
  const [formData, setFormData] = React.useState({
    description: '',
    amount: '',
    category: '',
    notes: '',
    payment_status: 'PENDING' as PaymentStatus,
    payment_method: '' as PaymentMethod | '',
  });

  // Get project's default currency or fallback to USD
  const defaultCurrency = project?.currency?.toUpperCase() || 'USD';

  // Smart currency options from centralized service - provides prioritized list with project currency marked as recommended
  const currencyOptions = React.useMemo<CurrencyOption[]>(() => {
    // Get smart currency options (no country context in this modal, so it will show major currencies first)
    const options = currencyService.getSmartCurrencyOptionsSimple();
    
    // Mark the project's default currency as recommended if it's not already marked
    return options.map(option => ({
      ...option,
      isRecommended: option.value === defaultCurrency || option.isRecommended
    }));
  }, [defaultCurrency]);

  // Keep selectedCurrency in sync when modal opens or project currency changes
  React.useEffect(() => {
    setSelectedCurrency(currencyOptions.find(option => option.value === defaultCurrency) || null);
  }, [isOpen, editingExpense?.currency, defaultCurrency, currencyOptions]);

  // Fetch exchange rate preview when currency differs from base currency
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!defaultCurrency || selectedCurrency?.value === defaultCurrency) {
        if (mounted) setExchangeRateInfo(null);
        return;
      }
      try {
        const info = await currencyService.getExchangeRate(selectedCurrency?.value || 'USD', defaultCurrency);
        if (mounted) setExchangeRateInfo(info);
      } catch {
        if (mounted) setExchangeRateInfo(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [selectedCurrency, defaultCurrency]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data: BudgetFormData & { base_currency?: string; exchange_rate?: number | null } = {
      description: formData.get('description') as string,
      amount: parseFloat(formData.get('amount') as string),
      currency: selectedCurrency?.value || project?.currency || 'USD',
      category: formData.get('category') as string,
      transaction_type: formData.get('transaction_type') as TransactionType,
      payment_status: formData.get('payment_status') as PaymentStatus,
      payment_method: formData.get('payment_method') as PaymentMethod,
      payment_date: formData.get('payment_date') as string || undefined,
      phase_id: formData.get('phase_id') as string || undefined,
      base_currency: defaultCurrency,
      exchange_rate: exchangeRateInfo?.rate
    };
    
    // Validate the expense data before submitting
    const validation = validateBudgetExpense(data);
    setValidationResult(validation);
    
    if (!validation.canProceed) {
      return;
    }
    
    await onSave(data);
    onClose();
  };

  const handleTemplateSelect = (template: ExpenseTemplate) => {
    setSelectedTemplate(template.id);
    setShowTemplates(false);
    
    // Pre-fill form state with comprehensive template data
    setFormData({
      description: template.description,
      amount: template.defaultAmount?.toString() || '',
      category: template.category,
      notes: template.notes || '',
      payment_status: template.paymentStatus,
      payment_method: template.paymentMethod || ''
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
                  className={cn(
                    'p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md',
                    selectedTemplate === template.id ? 
                      'border-buildease-blue-500 bg-buildease-blue-50 dark:bg-buildease-blue-900/20' : 
                      'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  )}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{template.icon}</div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">{template.name}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
            
            <p className="text-xs text-gray-500 mt-3 text-center">
              Select a template to auto-fill common expense details
            </p>
          </div>
        )}

        {/* Template Selection Indicator */}
        {selectedTemplate && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="w-6 h-6 rounded flex items-center justify-center bg-buildease-blue-500 text-white text-xs">
              🏗️
            </div>
            <span className="text-sm text-blue-900">
              Using template: <strong>{CONSTRUCTION_TEMPLATES.find(t => t.id === selectedTemplate)?.name || 'Template'}</strong>
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
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <span className="flex items-center gap-2">
              📝 Expense Name
              <span className="text-red-500">*</span>
            </span>
          </label>
          <input 
            name="description"
            type="text" 
            className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-buildease-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:border-slate-300 dark:hover:border-slate-600"
            placeholder="Enter expense name (e.g., Foundation materials, Electrical supplies)"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
          />
        </div>

        {/* Amount and Currency */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            💰 Amount & Currency
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <span className="flex items-center gap-2">
                  Amount
                  <span className="text-red-500">*</span>
                </span>
              </label>
              <input 
                name="amount"
                type="number" 
                min="0"
                step="0.01"
                className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-buildease-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:border-slate-300 dark:hover:border-slate-600"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <span className="flex items-center gap-2">
                  Currency
                  <span className="text-red-500">*</span>
                </span>
              </label>
              <select 
                name="currency"
                className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-buildease-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:border-slate-300 dark:hover:border-slate-600"
                value={selectedCurrency?.value || ''}
                onChange={(e) => {
                  const option = currencyOptions.find(opt => opt.value === e.target.value);
                  setSelectedCurrency(option || null);
                }}
                required
              >
                {currencyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.isRecommended ? `${option.label} (Recommended)` : option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                💡 Project uses <span className="font-medium">{defaultCurrency}</span> by default
              </p>
            </div>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Category *
          </label>
          <select 
            name="category"
            className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-buildease-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:border-slate-300 dark:hover:border-slate-600"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            required
          >
            <option value="Materials">🔨 Materials</option>
            <option value="Labor">👷 Labor</option>
            <option value="Equipment">🚜 Equipment</option>
            <option value="Permits">📋 Permits</option>
            <option value="Utilities">⚡ Utilities</option>
            <option value="Design">🏗️ Design</option>
            <option value='Transportation'>🚚 Transportation</option>
            <option value="Other">📦 Other</option>
          </select>
        </div>

        {/* Currency Conversion Info */}
        {selectedCurrency?.value !== defaultCurrency && exchangeRateInfo && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <div className="text-sm text-amber-700 dark:text-amber-300">
              <div className="font-medium mb-1">💱 Exchange Rate Preview</div>
              <div className="text-xs">1 {selectedCurrency?.value} = {exchangeRateInfo.rate.toFixed(4)} {defaultCurrency}</div>
              <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                Live exchange rate
              </div>
              <div className="mt-1">
                Estimated base amount: <span className="font-medium">{(() => {
                  const amt = Number(formData.amount || 0);
                  const est = Math.round((amt * exchangeRateInfo.rate) * 100) / 100;
                  return est.toLocaleString();
                })()} {defaultCurrency}</span>
              </div>
            </div>
          </div>
        )}

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <span className="flex items-center gap-2">
              📝 Additional Notes
              <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">(Optional)</span>
            </span>
          </label>
          <textarea 
            name="notes"
            className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-buildease-blue-500 focus:border-transparent transition-all duration-200 resize-none shadow-sm hover:border-slate-300 dark:hover:border-slate-600"
            rows={3}
            placeholder="Add additional notes about this expense (optional)"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          />
        </div>

        {/* Payment Details */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            💳 Payment Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Payment Status *
              </label>
              <select 
                name="payment_status"
                className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-buildease-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:border-slate-300 dark:hover:border-slate-600"
                value={formData.payment_status}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_status: e.target.value as PaymentStatus }))}
                required
              >
                <option value="PENDING">🕐 Pending</option>
                <option value="APPROVED">✅ Approved</option>
                <option value="PAID">💰 Paid</option>
                <option value="COMPLETED">🎉 Completed</option>
                <option value="FAILED">❌ Failed</option>
                <option value="REFUNDED">↩️ Refunded</option>
                <option value="CANCELLED">🚫 Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Payment Method
              </label>
              <select 
                name="payment_method"
                className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-buildease-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:border-slate-300 dark:hover:border-slate-600"
                value={formData.payment_method}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value as PaymentMethod }))}
              >
                <option value="">Select payment method</option>
                <option value="CASH">💵 Cash</option>
                <option value="MOBILE_MONEY">📱 Mobile Money</option>
                <option value="CREDIT_CARD">💳 Credit Card</option>
                <option value="BANK_TRANSFER">🏦 Bank Transfer</option>
                <option value="CHECK">📄 Check</option>
                <option value="OTHER">📋 Other</option>
              </select>
            </div>
          </div>
        </div>


        {/* Payment Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <span className="flex items-center gap-2">
              📅 Payment Date
              <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">(Optional)</span>
            </span>
          </label>
          <input 
            name="payment_date"
            type="date" 
            className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-buildease-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:border-slate-300 dark:hover:border-slate-600"
            defaultValue={editingExpense?.payment_date ? editingExpense.payment_date.split('T')[0] : ''}
          />
        </div>

        {/* Phase Assignment (if phases available) */}
        {projectPhases.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <span className="flex items-center gap-2">
                🏗️ Assign to Phase
                <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">(Optional)</span>
              </span>
            </label>
            <select 
              name="phase_id"
              className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-buildease-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:border-slate-300 dark:hover:border-slate-600"
              defaultValue={editingExpense?.phase_id || ''}
            >
              <option value="">📋 No specific phase</option>
              {projectPhases.map((phase) => (
                <option key={phase.id} value={phase.id}>
                  🔹 {phase.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Validation Results */}
        {validationResult && (validationResult.errors.length > 0 || validationResult.warnings.length > 0) && (
          <div className="space-y-2">
            {validationResult.errors.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="text-sm text-red-700 dark:text-red-300">
                  <div className="font-medium mb-2 flex items-center gap-2">
                    <span className="text-red-600 dark:text-red-400">⚠️</span>
                    Validation Errors
                  </div>
                  <ul className="text-xs space-y-1 ml-6">
                    {validationResult.errors.map((error, index) => (
                      <li key={index} className="list-disc">{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {validationResult.warnings.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="text-sm text-amber-700 dark:text-amber-300">
                  <div className="font-medium mb-2 flex items-center gap-2">
                    <span className="text-amber-600 dark:text-amber-400">⚡</span>
                    Validation Warnings
                  </div>
                  <ul className="text-xs space-y-1 ml-6">
                    {validationResult.warnings.map((warning, index) => (
                      <li key={index} className="list-disc">{warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Budget Impact Info */}
        <div className="bg-buildease-blue-50 dark:bg-buildease-blue-900/20 border border-buildease-blue-200 dark:border-buildease-blue-800 rounded-lg p-4">
          <div className="text-sm text-slate-700 dark:text-slate-300">
            <div className="font-medium mb-2 flex items-center gap-2">
              <span className="text-buildease-blue-600 dark:text-buildease-blue-400">📊</span>
              Financial Transaction Impact
            </div>
            <div className="text-slate-600 dark:text-slate-400 text-xs space-y-1">
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Recorded in your project's financial ledger</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Affects budget calculations and reporting</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">💱</span>
                <span>Multi-currency amounts automatically converted for consistency</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </BaseModal>
  );
}