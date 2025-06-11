/**
 * BudgetTimelineForm.tsx
 * Fourth step of the project creation wizard
 * Collects budget and timeline information
 */
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ProjectFormValues } from '../../pages/CreateProject';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { DollarSign, Calendar as CalendarIcon, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import {cn} from '@/utils/core/ui'
// Currency options
const CURRENCIES = [
  { value: 'GHS', label: 'GHS - Ghanaian Cedi' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'NGN', label: 'NGN - Nigerian Naira' },
  { value: 'ZAR', label: 'ZAR - South African Rand' },
  { value: 'XOF', label: 'XOF - West African CFA Franc' }
];

export function BudgetTimelineForm() {
  const { control, watch } = useFormContext<ProjectFormValues>();
  
  // Watch currency to provide appropriate guidance
  const currency = watch('currency');
  const budget = watch('budget');
  const buildingSize = watch('buildingSize');
  const buildingSizeUnit = watch('buildingSizeUnit');
  
  // Helper function to format currency
  const formatCurrency = (value: string, currencyCode: string) => {
    if (!value) return '';
    
    const numericValue = parseFloat(value.replace(/,/g, ''));
    if (isNaN(numericValue)) return value;
    
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0
    }).format(numericValue);
  };
  
  // Calculate cost per square meter/foot if both values are available
  const calculateCostPerUnit = () => {
    if (!budget || !buildingSize) return null;
    
    const numericBudget = parseFloat(budget.replace(/,/g, ''));
    const numericSize = parseFloat(buildingSize);
    
    if (isNaN(numericBudget) || isNaN(numericSize) || numericSize === 0) return null;
    
    const costPerUnit = numericBudget / numericSize;
    return {
      value: costPerUnit,
      formatted: formatCurrency(costPerUnit.toFixed(0), currency),
      unit: buildingSizeUnit === 'sq-m' ? 'per square meter' : 'per square foot'
    };
  };
  
  const costPerUnit = calculateCostPerUnit();
  
  // Helper function to get budget guidance based on currency
  const getBudgetGuidance = (currencyCode: string) => {
    switch(currencyCode) {
      case 'GHS':
        return 'Construction costs in Ghana typically range from GHS 2,500-5,000 per square meter for standard quality.';
      case 'USD':
        return 'Construction costs in Ghana typically range from $200-400 per square meter for standard quality.';
      case 'EUR':
        return 'Construction costs in Ghana typically range from €180-360 per square meter for standard quality.';
      default:
        return 'Construction costs vary by location and quality. Consider getting local quotes.';
    }
  };

  return (
    <div className="space-y-6">
      {/* Budget with Currency */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="budget"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-lg font-semibold text-slate-900 dark:text-white font-inter">
                What's your total budget?
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#2B6CB0]" />
                  <Input 
                    placeholder="Amount" 
                    {...field} 
                    className="h-14 pl-12 text-base font-opensans border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:border-[#2B6CB0] dark:focus:border-[#2B6CB0] focus:ring-4 focus:ring-[#2B6CB0]/20 transition-all duration-300 shadow-sm hover:shadow-md placeholder:text-slate-500"
                    onChange={(e) => {
                      // Format the input as a number with commas
                      const value = e.target.value.replace(/[^\d]/g, '');
                      if (value) {
                        const formattedValue = new Intl.NumberFormat('en-US').format(parseInt(value));
                        field.onChange(formattedValue);
                      } else {
                        field.onChange('');
                      }
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-red-600 font-opensans text-sm" />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="currency"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-lg font-semibold text-slate-900 dark:text-white font-inter">
                Currency
              </FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="h-14 text-base font-opensans border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:border-[#2B6CB0] dark:focus:border-[#2B6CB0] focus:ring-4 focus:ring-[#2B6CB0]/20 transition-all duration-300 shadow-sm hover:shadow-md">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-red-600 font-opensans text-sm" />
            </FormItem>
          )}
        />
      </div>
      
      {/* Budget guidance */}
      <Card className="p-6 bg-[#2B6CB0]/5 dark:bg-[#2B6CB0]/10 border border-[#2B6CB0]/20 dark:border-[#2B6CB0]/30 rounded-xl">
        <div className="flex space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-[#2B6CB0] rounded-xl flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <h4 className="text-base font-semibold text-slate-900 dark:text-white font-inter mb-2">Budget Considerations</h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 font-opensans leading-relaxed">
              {getBudgetGuidance(currency)}
            </p>
            
            {costPerUnit && (
              <div className="mt-4 text-sm">
                <span className="font-medium text-slate-900 dark:text-white font-opensans">
                  Your budget: {costPerUnit.formatted} {costPerUnit.unit}
                </span>
                
                {/* Add budget assessment */}
                {costPerUnit.value < 2000 && currency === 'GHS' && (
                  <div className="mt-2 flex items-center text-amber-600 dark:text-amber-400">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span className="font-opensans">This budget may be low for standard construction quality</span>
                  </div>
                )}
                
                {costPerUnit.value > 6000 && currency === 'GHS' && (
                  <div className="mt-2 flex items-center text-green-600 dark:text-green-400">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span className="font-opensans">This budget allows for premium construction quality</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Expected Timeframe */}
      <FormField
        control={control}
        name="timeframe"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel className="text-lg font-semibold text-slate-900 dark:text-white font-inter">
              Expected Timeframe
              <span className="text-base font-normal text-slate-500 ml-2 font-opensans">(optional)</span>
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#2B6CB0]" />
                <Input 
                  type="number"
                  placeholder="Number of months" 
                  {...field} 
                  className="h-14 pl-12 text-base font-opensans border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:border-[#2B6CB0] dark:focus:border-[#2B6CB0] focus:ring-4 focus:ring-[#2B6CB0]/20 transition-all duration-300 shadow-sm hover:shadow-md placeholder:text-slate-500"
                />
              </div>
            </FormControl>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-opensans">
              Typical residential construction takes 12-18 months in Ghana
            </p>
            <FormMessage className="text-red-600 font-opensans text-sm" />
          </FormItem>
        )}
      />

      {/* Expected Start Date */}
      <FormField
        control={control}
        name="expectedStartDate"
        render={({ field }) => (
          <FormItem className="flex flex-col space-y-3">
            <FormLabel className="text-lg font-semibold text-slate-900 dark:text-white font-inter">
              Expected Start Date
              <span className="text-base font-normal text-slate-500 ml-2 font-opensans">(optional)</span>
            </FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <button
                    type="button"
                    className={cn(
                      "h-14 pl-4 text-left font-normal w-full inline-flex items-center justify-start rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 focus:border-[#2B6CB0] dark:focus:border-[#2B6CB0] focus:ring-4 focus:ring-[#2B6CB0]/20 transition-all duration-300 shadow-sm hover:shadow-md font-opensans",
                      !field.value && "text-slate-500 dark:text-slate-400"
                    )}
                  >
                    <CalendarIcon className="mr-3 h-5 w-5 text-[#2B6CB0]" />
                    {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                  </button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={(date) => field.onChange(date ? date.toISOString() : '')}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-opensans">
              Select a date at least 2-4 weeks in the future to allow for planning
            </p>
            <FormMessage className="text-red-600 font-opensans text-sm" />
          </FormItem>
        )}
      />
      
      {/* Timeline Tips */}
      <Card className="p-6 bg-[#ED8936]/10 border border-[#ED8936]/30 rounded-xl">
        <div className="flex space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-[#ED8936] rounded-xl flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <h4 className="text-base font-semibold text-slate-900 dark:text-white font-inter mb-3">Timeline Considerations</h4>
            <ul className="text-sm text-slate-700 dark:text-slate-300 font-opensans space-y-2 list-disc pl-4 leading-relaxed">
              <li>Account for rainy season delays (May-July and September-October)</li>
              <li>Add 15-20% buffer to your timeline for unexpected delays</li>
              <li>Consider phased construction if budget constraints exist</li>
              <li>Material procurement can take 2-4 weeks before construction begins</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

