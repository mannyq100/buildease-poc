/**
 * QuickExpenseTemplates component
 * Provides one-click expense creation with construction-specific templates
 * Mobile-optimized grid layout with touch-friendly buttons
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Hammer, 
  Truck, 
  HardHat, 
  Wrench, 
  Zap, 
  PaintBucket,
  Building,
  TreePine,
  ClipboardList,
  Plus
} from 'lucide-react';
import { cn } from '@/utils/core/ui';
import type { TransactionType, BudgetFormData } from '@/types/projectDetails';

interface ExpenseTemplate {
  id: string;
  name: string;
  icon: React.ReactNode;
  transaction_type: TransactionType;
  category: string;
  description: string;
  defaultAmount?: number;
  color: string;
}

interface QuickExpenseTemplatesProps {
  onSelectTemplate: (template: Partial<BudgetFormData>) => void;
  className?: string;
  projectCurrency?: string;
}

const CONSTRUCTION_TEMPLATES: ExpenseTemplate[] = [
  {
    id: 'materials',
    name: 'Materials',
    icon: <Hammer className="h-5 w-5" />,
    transaction_type: 'MATERIALS',
    category: 'Materials & Supplies',
    description: 'Construction materials purchase',
    color: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    id: 'labor',
    name: 'Labor',
    icon: <HardHat className="h-5 w-5" />,
    transaction_type: 'LABOR',
    category: 'Labor & Wages',
    description: 'Worker payment',
    color: 'bg-green-500 hover:bg-green-600',
  },
  {
    id: 'equipment',
    name: 'Equipment',
    icon: <Wrench className="h-5 w-5" />,
    transaction_type: 'EQUIPMENT',
    category: 'Equipment & Tools',
    description: 'Equipment rental or purchase',
    color: 'bg-orange-500 hover:bg-orange-600',
  },
  {
    id: 'transport',
    name: 'Transport',
    icon: <Truck className="h-5 w-5" />,
    transaction_type: 'TRANSPORT',
    category: 'Transportation',
    description: 'Delivery and transportation costs',
    color: 'bg-purple-500 hover:bg-purple-600',
  },
  {
    id: 'electrical',
    name: 'Electrical',
    icon: <Zap className="h-5 w-5" />,
    transaction_type: 'SUBCONTRACTOR',
    category: 'Electrical Work',
    description: 'Electrical contractor services',
    color: 'bg-yellow-500 hover:bg-yellow-600',
  },
  {
    id: 'painting',
    name: 'Painting',
    icon: <PaintBucket className="h-5 w-5" />,
    transaction_type: 'SUBCONTRACTOR',
    category: 'Painting & Finishing',
    description: 'Painting contractor services',
    color: 'bg-pink-500 hover:bg-pink-600',
  },
  {
    id: 'structural',
    name: 'Structural',
    icon: <Building className="h-5 w-5" />,
    transaction_type: 'SUBCONTRACTOR',
    category: 'Structural Work',
    description: 'Structural contractor services',
    color: 'bg-indigo-500 hover:bg-indigo-600',
  },
  {
    id: 'landscaping',
    name: 'Landscaping',
    icon: <TreePine className="h-5 w-5" />,
    transaction_type: 'SUBCONTRACTOR',
    category: 'Landscaping',
    description: 'Landscaping services',
    color: 'bg-emerald-500 hover:bg-emerald-600',
  },
  {
    id: 'permits',
    name: 'Permits',
    icon: <ClipboardList className="h-5 w-5" />,
    transaction_type: 'PERMIT',
    category: 'Permits & Inspections',
    description: 'Building permit or inspection fee',
    color: 'bg-slate-500 hover:bg-slate-600',
  },
];

export function QuickExpenseTemplates({ 
  onSelectTemplate, 
  className,
  projectCurrency = 'USD'
}: QuickExpenseTemplatesProps) {
  
  const handleTemplateSelect = (template: ExpenseTemplate) => {
    const formData: Partial<BudgetFormData> = {
      title: template.name,
      transaction_type: template.transaction_type,
      category: template.category,
      description: template.description,
      currency: projectCurrency as any,
      amount: template.defaultAmount || 0,
    };
    
    onSelectTemplate(formData);
  };

  return (
    <Card className={cn('', className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">Quick Add</h3>
          <span className="text-xs text-gray-500">Tap to create</span>
        </div>
        
        {/* Grid layout optimized for mobile */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {CONSTRUCTION_TEMPLATES.map((template) => (
            <Button
              key={template.id}
              variant="ghost"
              size="sm"
              onClick={() => handleTemplateSelect(template)}
              className={cn(
                'h-16 w-full flex-col gap-1 p-2',
                'hover:scale-105 transition-all duration-200',
                'border border-gray-200 hover:border-gray-300',
                'bg-white hover:bg-gray-50'
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
          
          {/* Custom expense button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectTemplate({})}
            className={cn(
              'h-16 w-full flex-col gap-1 p-2',
              'hover:scale-105 transition-all duration-200',
              'border border-dashed border-gray-300 hover:border-gray-400',
              'bg-white hover:bg-gray-50'
            )}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-300 text-gray-500">
              <Plus className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium leading-tight text-center text-gray-600">
              Custom
            </span>
          </Button>
        </div>
        
        {/* Usage hint */}
        <p className="text-xs text-gray-500 mt-3 text-center">
          Templates auto-fill form fields • Edit before saving
        </p>
      </CardContent>
    </Card>
  );
}

export default QuickExpenseTemplates;