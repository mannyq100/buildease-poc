/**
 * BudgetTimelineForm.tsx
 * Fourth step of the project creation wizard
 * Collects budget and timeline information
 */
import { useFormContext } from 'react-hook-form';
import { CreateProjectFormValues } from '../../pages/CreateProject/schema';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { DollarSign, Calendar as CalendarIcon, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import {cn} from '@/utils/core/ui'
import { Country } from 'country-state-city';
// Currency option type
interface CurrencyOption {
  value: string;
  label: string;
  isMajor: boolean;
  isRecommended?: boolean;
  disabled?: boolean;
}

// Major global currencies (prioritized in dropdown)
const MAJOR_CURRENCY_CODES = ['USD', 'EUR', 'GBP', 'CAD', 'XOF', 'XAF'];

// Generate currency name mapping for better labels
const CURRENCY_NAMES: Record<string, string> = {
  'USD': 'US Dollar',
  'EUR': 'Euro',
  'GBP': 'British Pound',
  'CAD': 'Canadian Dollar',
  'XOF': 'West African CFA Franc',
  'XAF': 'Central African CFA Franc',
  'JPY': 'Japanese Yen',
  'CNY': 'Chinese Yuan',
  'AUD': 'Australian Dollar',
  'CHF': 'Swiss Franc',
  'GHS': 'Ghanaian Cedi',
  'NGN': 'Nigerian Naira',
  'ZAR': 'South African Rand',
  'KES': 'Kenyan Shilling',
  'UGX': 'Ugandan Shilling',
  'TZS': 'Tanzanian Shilling',
  'EGP': 'Egyptian Pound',
  'MAD': 'Moroccan Dirham',
  'INR': 'Indian Rupee',
  'BRL': 'Brazilian Real',
  'MXN': 'Mexican Peso',
  'AED': 'UAE Dirham',
  'SAR': 'Saudi Riyal',
  'SGD': 'Singapore Dollar',
  'HKD': 'Hong Kong Dollar',
  'NZD': 'New Zealand Dollar',
  'SEK': 'Swedish Krona',
  'NOK': 'Norwegian Krone',
  'DKK': 'Danish Krone',
  'PLN': 'Polish Zloty',
  'CZK': 'Czech Koruna',
  'HUF': 'Hungarian Forint',
  'RUB': 'Russian Ruble',
  'TRY': 'Turkish Lira',
  'ILS': 'Israeli Shekel',
  'KRW': 'South Korean Won',
  'THB': 'Thai Baht',
  'MYR': 'Malaysian Ringgit',
  'IDR': 'Indonesian Rupiah',
  'PHP': 'Philippine Peso',
  'VND': 'Vietnamese Dong'
};

// Helper function to get currency for a specific country
const getCurrencyByCountryCode = (countryCode: string): string | null => {
  try {
    if (!countryCode || countryCode.trim().length === 0) return null;
    
    const country = Country.getCountryByCode(countryCode.trim().toUpperCase());
    return country?.currency || null;
  } catch (error) {
    console.error(`Error getting currency for country ${countryCode}:`, error);
    return null;
  }
};

// Generate all available currencies from country-state-city library
const generateAllCurrencies = (): CurrencyOption[] => {
  try {
    const countries = Country.getAllCountries();
    const currencyMap = new Map<string, CurrencyOption>();
    
    // Extract unique currencies from all countries
    countries.forEach(country => {
      if (country.currency && country.currency.trim()) {
        const currencyCode = country.currency.trim();
        const currencyName = CURRENCY_NAMES[currencyCode] || currencyCode;
        const isMajor = MAJOR_CURRENCY_CODES.includes(currencyCode);
        
        if (!currencyMap.has(currencyCode)) {
          currencyMap.set(currencyCode, {
            value: currencyCode,
            label: `${currencyCode} - ${currencyName}`,
            isMajor
          });
        }
      }
    });
    
    // Convert map to array and sort
    return Array.from(currencyMap.values()).sort((a, b) => {
      // Major currencies first, then alphabetical
      if (a.isMajor && !b.isMajor) return -1;
      if (!a.isMajor && b.isMajor) return 1;
      return a.label.localeCompare(b.label);
    });
  } catch (error) {
    console.error('Error generating currencies from country-state-city:', error);
    // Fallback to major currencies if there's an error
    return MAJOR_CURRENCY_CODES.map(code => ({
      value: code,
      label: `${code} - ${CURRENCY_NAMES[code] || code}`,
      isMajor: true
    }));
  }
};

// Generate the currency list
const ALL_CURRENCIES = generateAllCurrencies();

export function BudgetTimelineForm() {
  const { control, watch } = useFormContext<CreateProjectFormValues>();
  
  // Watch currency to provide appropriate guidance
  const currency = watch('currency');
  const budget = watch('budget');
  const buildingSize = watch('buildingSize');
  const buildingSizeUnit = watch('buildingSizeUnit');
  const country = watch('country'); // Watch country to show auto-population feedback
  
  // Smart currency selection: prioritize country currency + major currencies
  const getSmartCurrencyOptions = (): CurrencyOption[] => {
    const countryCurrency = currency; // Current selected currency (could be from country auto-selection)
    const prioritizedCurrencies: CurrencyOption[] = [];
    
    // Get major currencies from the dynamic list
    const majorCurrencies = ALL_CURRENCIES.filter(c => c.isMajor);
    
    // Get country's currency using efficient lookup (if country is selected)
    let suggestedCurrency: string | null = null;
    if (country) {
      // Try to find country ISO code from the country name
      // This assumes the country field stores the country name, not ISO code
      try {
        const countries = Country.getAllCountries();
        const countryData = countries.find(c => c.name === country);
        if (countryData?.isoCode) {
          suggestedCurrency = getCurrencyByCountryCode(countryData.isoCode);
        }
      } catch (error) {
        console.error('Error getting country currency:', error);
      }
    }
    
    // 1. Add country's currency first if it exists and isn't already a major currency
    const displayCurrency = countryCurrency || suggestedCurrency;
    if (displayCurrency && !MAJOR_CURRENCY_CODES.includes(displayCurrency)) {
      const countryCurrencyOption = ALL_CURRENCIES.find(c => c.value === displayCurrency);
      if (countryCurrencyOption) {
        prioritizedCurrencies.push({
          ...countryCurrencyOption,
          label: `⭐ ${countryCurrencyOption.label} (Recommended for ${country || 'your country'})`,
          isRecommended: true
        });
      }
    }
    
    // 2. Add major currencies
    prioritizedCurrencies.push(...majorCurrencies.map(c => ({
      ...c,
      isRecommended: c.value === displayCurrency,
      label: c.value === displayCurrency ? `⭐ ${c.label}` : c.label
    })));
    
    // 3. Add separator if we have other currencies to show
    const otherCurrencies = ALL_CURRENCIES
      .filter(c => !c.isMajor && c.value !== displayCurrency)
      .sort((a, b) => a.label.localeCompare(b.label));
    
    if (otherCurrencies.length > 0) {
      prioritizedCurrencies.push({ 
        value: 'separator', 
        label: '──── Other Currencies ────', 
        disabled: true, 
        isMajor: false 
      });
      
      // 4. Add other currencies (sorted alphabetically)
      prioritizedCurrencies.push(...otherCurrencies);
    }
    
    return prioritizedCurrencies;
  };
  
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
                {country && currency && (
                  <span className="text-sm font-normal text-[#2B6CB0] ml-2 font-opensans">
                    (auto-selected for {country})
                  </span>
                )}
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
                  {getSmartCurrencyOptions().map((currencyOption) => {
                    if (currencyOption.value === 'separator') {
                      return (
                        <div key="separator" className="px-2 py-1 text-xs text-slate-400 font-opensans">
                          Other Currencies
                        </div>
                      );
                    }
                    return (
                      <SelectItem 
                        key={currencyOption.value} 
                        value={currencyOption.value}
                        className={currencyOption.isRecommended ? 'bg-[#2B6CB0]/10 border-l-2 border-[#2B6CB0]' : ''}
                      >
                        <div className="flex items-center">
                          {currencyOption.isRecommended && (
                            <span className="mr-2 text-[#2B6CB0]">⭐</span>
                          )}
                          {currencyOption.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {country && currency && (
                <p className="text-sm text-[#2B6CB0] font-opensans flex items-center">
                  <span className="mr-1">🌍</span>
                  Currency automatically selected based on your country selection
                </p>
              )}
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

