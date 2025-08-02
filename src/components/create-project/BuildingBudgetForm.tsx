/**
 * BuildingBudgetForm.tsx
 * Consolidated third step of the streamlined project creation wizard
 * Combines building specifications and budget information for efficiency
 * Follows BuildEase mobile-first responsive design principles
 */
import React, { useMemo, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { CreateProjectFormValues } from '../../pages/CreateProject/schema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { 
  Ruler, 
  Home, 
  Building2, 
  Bath, 
  ChefHat, 
  Sofa, 
  DollarSign, 
  Calendar as CalendarIcon, 
  Clock, 
  TrendingUp, 
  AlertCircle 
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/utils/core/ui';
import { Country } from 'country-state-city';

// Size units
const SIZE_UNITS = [
  { value: 'sq-m', label: 'Square Meters' },
  { value: 'sq-ft', label: 'Square Feet' }
];

// Currency handling (from BudgetTimelineForm.tsx)
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

// Memoized number options generator
const generateNumberOptions = (max: number) => {
  return Array.from({ length: max }, (_, i) => ({
    value: String(i + 1),
    label: String(i + 1)
  }));
};

// Building styles - optional selections for better AI recommendations
const BUILDING_STYLES = [
  { value: 'ai-recommend', label: 'Let AI recommend' },
  { value: 'modern', label: 'Modern' },
  { value: 'contemporary', label: 'Contemporary' },
  { value: 'traditional', label: 'Traditional' },
  { value: 'colonial', label: 'Colonial' },
  { value: 'minimalist', label: 'Minimalist' },
  { value: 'tropical', label: 'Tropical' },
  { value: 'mediterranean', label: 'Mediterranean' },
  { value: 'african-contemporary', label: 'African Contemporary' }
];

function BuildingBudgetForm() {
  const { control, watch } = useFormContext<CreateProjectFormValues>();
  
  // Memoize number options to prevent recreation on every render
  const storeysOptions = useMemo(() => generateNumberOptions(10), []);
  const bedroomOptions = useMemo(() => generateNumberOptions(15), []);
  const bathroomOptions = useMemo(() => generateNumberOptions(10), []);
  const kitchenOptions = useMemo(() => generateNumberOptions(5), []);
  const livingAreaOptions = useMemo(() => generateNumberOptions(5), []);

  // Watch form values for smart calculations and guidance
  const currency = watch('currency');
  const budget = watch('budget');
  const buildingSize = watch('buildingSize');
  const buildingSizeUnit = watch('buildingSizeUnit');
  const country = watch('country');

  // Smart currency selection: prioritize country currency + major currencies
  const getSmartCurrencyOptions = useCallback((): CurrencyOption[] => {
    const prioritizedCurrencies: CurrencyOption[] = [];
    
    // Get country's currency using efficient lookup (if country is selected)
    let suggestedCurrency: string | null = null;
    if (country) {
      try {
        const countries = Country.getAllCountries();
        const countryData = countries.find(c => c.name === country);
        if (countryData?.isoCode && countryData?.currency) {
          suggestedCurrency = countryData.currency;
        }
      } catch (error) {
        console.error('Error getting country currency:', error);
      }
    }
    
    // Get major currencies from the dynamic list
    const majorCurrencies = ALL_CURRENCIES.filter(c => c.isMajor);
    
    // 1. Add country's currency first if it exists and isn't already a major currency
    if (suggestedCurrency && !MAJOR_CURRENCY_CODES.includes(suggestedCurrency)) {
      const countryCurrencyOption = ALL_CURRENCIES.find(c => c.value === suggestedCurrency);
      if (countryCurrencyOption) {
        prioritizedCurrencies.push({
          ...countryCurrencyOption,
          label: countryCurrencyOption.label,
          isRecommended: true
        });
      }
    }
    
    // 2. Add major currencies, highlighting the suggested one
    prioritizedCurrencies.push(...majorCurrencies.map(c => ({
      ...c,
      isRecommended: c.value === suggestedCurrency,
      label: c.label
    })));
    
    // 3. Add separator if we have other currencies to show
    const otherCurrencies = ALL_CURRENCIES
      .filter(c => !c.isMajor && c.value !== suggestedCurrency)
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
  }, [country, currency]);

  // Helper function to format currency
  const formatCurrency = useCallback((value: string, currencyCode: string) => {
    if (!value) return '';
    
    const numericValue = parseFloat(value.replace(/,/g, ''));
    if (isNaN(numericValue)) return value;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0
    }).format(numericValue);
  }, []);
  
  // Calculate cost per square meter/foot if both values are available
  const calculateCostPerUnit = useCallback(() => {
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
  }, [budget, buildingSize, buildingSizeUnit, currency, formatCurrency]);
  
  const costPerUnit = calculateCostPerUnit();
  
  // Helper function to get budget guidance based on currency
  const getBudgetGuidance = useCallback((currencyCode: string) => {
    switch(currencyCode) {
      case 'USD':
        return 'Construction costs typically range from $150-500 per square meter depending on location, quality, and complexity.';
      case 'EUR':
        return 'Construction costs typically range from €120-450 per square meter depending on location, quality, and complexity.';
      case 'GBP':
        return 'Construction costs typically range from £100-400 per square meter depending on location, quality, and complexity.';
      case 'GHS':
        return 'Construction costs typically range from GHS 2,500-5,000 per square meter depending on location and quality.';
      default:
        return 'Construction costs vary significantly by location, quality, and local labor rates. Consider getting quotes from local contractors.';
    }
  }, []);

  return (
    <div className="space-y-8">
      {/* Building Specifications Section */}
      <div className="bg-[#2B6CB0]/5 dark:bg-[#2B6CB0]/10 rounded-xl p-6 space-y-6 border border-[#2B6CB0]/20 dark:border-[#2B6CB0]/30">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-[#2B6CB0] rounded-xl flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white font-inter">Building Specifications</h3>
        </div>

        {/* Building Size */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="buildingSize"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-base font-semibold text-slate-900 dark:text-white font-inter">
                  Building Size
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Ruler className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#2B6CB0]" />
                    <Input 
                      type="number"
                      placeholder="0" 
                      {...field} 
                      className="h-14 pl-12 text-base font-opensans border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:border-[#2B6CB0] dark:focus:border-[#2B6CB0] focus:ring-4 focus:ring-[#2B6CB0]/20 transition-all duration-300 shadow-sm hover:shadow-md placeholder:text-slate-500"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-600 font-opensans text-sm" />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name="buildingSizeUnit"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-base font-semibold text-slate-900 dark:text-white font-inter">
                  Unit
                </FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-14 text-base font-opensans border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:border-[#2B6CB0] dark:focus:border-[#2B6CB0] focus:ring-4 focus:ring-[#2B6CB0]/20 transition-all duration-300 shadow-sm hover:shadow-md">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SIZE_UNITS.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-600 font-opensans text-sm" />
              </FormItem>
            )}
          />
        </div>

        {/* Core Room Information */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <FormField
            control={control}
            name="storeys"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-base font-semibold text-slate-900 dark:text-white font-inter">
                  Storeys
                </FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-14 text-base font-opensans border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:border-[#2B6CB0] dark:focus:border-[#2B6CB0] focus:ring-4 focus:ring-[#2B6CB0]/20 transition-all duration-300 shadow-sm hover:shadow-md">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {storeysOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                          <Home className="mr-2 h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-600 font-opensans text-sm" />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="bedrooms"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-base font-semibold text-slate-900 dark:text-white font-inter">
                  Bedrooms
                </FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-14 text-base font-opensans border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:border-[#2B6CB0] dark:focus:border-[#2B6CB0] focus:ring-4 focus:ring-[#2B6CB0]/20 transition-all duration-300 shadow-sm hover:shadow-md">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {bedroomOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                          <Home className="mr-2 h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-600 font-opensans text-sm" />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="bathrooms"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-base font-semibold text-slate-900 dark:text-white font-inter">
                  Bathrooms
                </FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-14 text-base font-opensans border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:border-[#2B6CB0] dark:focus:border-[#2B6CB0] focus:ring-4 focus:ring-[#2B6CB0]/20 transition-all duration-300 shadow-sm hover:shadow-md">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {bathroomOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                          <Bath className="mr-2 h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-600 font-opensans text-sm" />
              </FormItem>
            )}
          />
        </div>

        {/* Optional Room Information */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <FormField
            control={control}
            name="kitchens"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-base font-medium text-slate-700 dark:text-slate-300 font-inter">
                  Kitchens <span className="text-sm text-slate-500">(optional)</span>
                </FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 text-base font-opensans border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:border-[#2B6CB0] dark:focus:border-[#2B6CB0] focus:ring-2 focus:ring-[#2B6CB0]/10 transition-all duration-200">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ai-recommend">Let AI recommend</SelectItem>
                    {kitchenOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                          <ChefHat className="mr-2 h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-600 font-opensans text-sm" />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="livingAreas"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-base font-medium text-slate-700 dark:text-slate-300 font-inter">
                  Living Areas <span className="text-sm text-slate-500">(optional)</span>
                </FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 text-base font-opensans border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:border-[#2B6CB0] dark:focus:border-[#2B6CB0] focus:ring-2 focus:ring-[#2B6CB0]/10 transition-all duration-200">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ai-recommend">Let AI recommend</SelectItem>
                    {livingAreaOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                          <Sofa className="mr-2 h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-600 font-opensans text-sm" />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="buildingStyle"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-base font-medium text-slate-700 dark:text-slate-300 font-inter">
                  Building Style <span className="text-sm text-slate-500">(optional)</span>
                </FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 text-base font-opensans border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:border-[#2B6CB0] dark:focus:border-[#2B6CB0] focus:ring-2 focus:ring-[#2B6CB0]/10 transition-all duration-200">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {BUILDING_STYLES.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-600 font-opensans text-sm" />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Budget Section */}
      <div className="bg-[#ED8936]/5 dark:bg-[#ED8936]/10 rounded-xl p-6 space-y-6 border border-[#ED8936]/20 dark:border-[#ED8936]/30">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-[#ED8936] rounded-xl flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white font-inter">Budget & Timeline</h3>
        </div>

        {/* Budget with Currency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="budget"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-base font-medium text-slate-700 dark:text-slate-300 font-inter">
                  Estimated Total Budget
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#ED8936]" />
                    <Input 
                      placeholder="Amount" 
                      {...field} 
                      className="h-12 pl-12 text-base font-opensans border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:border-[#ED8936] dark:focus:border-[#ED8936] focus:ring-2 focus:ring-[#ED8936]/10 transition-all duration-200 placeholder:text-slate-500"
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
                <FormLabel className="text-base font-medium text-slate-700 dark:text-slate-300 font-inter">
                  Currency
                </FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 text-base font-opensans border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:border-[#ED8936] dark:focus:border-[#ED8936] focus:ring-2 focus:ring-[#ED8936]/10 transition-all duration-200">
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
                          className={currencyOption.isRecommended ? 'bg-[#ED8936]/10 border-l-2 border-[#ED8936]' : ''}
                        >
                          {currencyOption.label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-600 font-opensans text-sm" />
              </FormItem>
            )}
          />
        </div>

        {/* Optional Timeline Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="timeframe"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-base font-medium text-slate-700 dark:text-slate-300 font-inter">
                  Expected Timeframe <span className="text-sm font-normal text-slate-500 ml-1 font-opensans">(months)</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#ED8936]" />
                    <Input 
                      type="number"
                      placeholder="e.g., 12" 
                      {...field} 
                      className="h-12 pl-12 text-base font-opensans border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:border-[#ED8936] dark:focus:border-[#ED8936] focus:ring-2 focus:ring-[#ED8936]/10 transition-all duration-200 placeholder:text-slate-500"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-600 font-opensans text-sm" />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="expectedStartDate"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-base font-medium text-slate-700 dark:text-slate-300 font-inter">
                  Expected Start Date <span className="text-sm font-normal text-slate-500 ml-1 font-opensans">(optional)</span>
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <div className="relative">
                        <CalendarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#ED8936]" />
                        <Button
                          variant="outline"
                          className={cn(
                            "h-12 pl-12 text-left font-normal w-full justify-start rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 focus:border-[#ED8936] dark:focus:border-[#ED8936] focus:ring-2 focus:ring-[#ED8936]/10 transition-all duration-200 font-opensans",
                            !field.value && "text-slate-500 dark:text-slate-400"
                          )}
                        >
                          {field.value ? format(new Date(field.value), "PPP") : <span>Select start date</span>}
                        </Button>
                      </div>
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
                <FormMessage className="text-red-600 font-opensans text-sm" />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Smart Budget Analysis */}
      {(budget && buildingSize && currency) && (
        <Card className="p-6 bg-[#2B6CB0]/5 dark:bg-[#2B6CB0]/10 border border-[#2B6CB0]/20 dark:border-[#2B6CB0]/30 rounded-xl">
          <div className="flex space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-[#2B6CB0] rounded-xl flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-white font-inter mb-2">Budget Analysis</h4>
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
      )}
    </div>
  );
}

// Export for both named and default
export { BuildingBudgetForm };
export default BuildingBudgetForm;