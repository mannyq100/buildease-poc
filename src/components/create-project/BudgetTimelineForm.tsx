/**
 * Budget and timeline input component for project creation
 */
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface BudgetTimelineFormProps {
  budget: string;
  currency: string;
  timeframe: string;
  expectedStartDate: string;
  currencies: Array<{ value: string, label: string, symbol?: string }>;
  onInputChange: (field: string, value: string) => void;
  isDarkMode: boolean;
}

export function BudgetTimelineForm({
  budget,
  currency,
  timeframe,
  expectedStartDate,
  currencies,
  onInputChange,
  isDarkMode
}: BudgetTimelineFormProps) {
  const inputClass = `transition-all duration-300 ${
    isDarkMode 
      ? "bg-slate-900 border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 text-white" 
      : "border-gray-200 focus:ring-2 focus:ring-blue-500/20 hover:border-blue-300"
  }`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="budget" className={isDarkMode ? "text-slate-300" : "text-gray-900"}>
            Total Budget
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="budget"
              type="number" 
              placeholder="Enter budget amount" 
              value={budget}
              onChange={(e) => onInputChange('budget', e.target.value)}
              className={`pl-9 ${inputClass}`}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="currency" className={isDarkMode ? "text-slate-300" : "text-gray-900"}>
            Currency
          </Label>
          <Select
            value={currency}
            onValueChange={(value) => onInputChange('currency', value)}
          >
            <SelectTrigger className={inputClass}>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map(currency => (
                <SelectItem key={currency.value} value={currency.value}>
                  {currency.symbol} {currency.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div className="space-y-2">
          <Label htmlFor="timeframe" className={isDarkMode ? "text-slate-300" : "text-gray-900"}>
            Expected Timeframe (months)
          </Label>
          <Input
            id="timeframe"
            type="number"
            placeholder="Enter estimated months"
            value={timeframe}
            onChange={(e) => onInputChange('timeframe', e.target.value)}
            className={inputClass}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="expectedStartDate" className={isDarkMode ? "text-slate-300" : "text-gray-900"}>
            Expected Start Date
          </Label>
          <Input
            id="expectedStartDate"
            type="date"
            value={expectedStartDate}
            onChange={(e) => onInputChange('expectedStartDate', e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
      
      <div className="p-4 mt-2 border border-amber-100 rounded-lg bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-500">
        <h4 className="font-medium mb-1">Budget Considerations</h4>
        <p className="text-sm">
          Construction costs in Ghana typically range from GHS 2,500-5,000 per square meter for standard quality,
          to GHS 5,000-12,000 per square meter for premium quality construction. Consider allocating an additional
          10-15% for contingencies.
        </p>
      </div>
    </div>
  );
} 