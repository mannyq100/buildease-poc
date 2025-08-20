/**
 * BuildingBudgetForm.tsx
 * Consolidated third step of the streamlined project creation wizard
 * Combines building specifications and budget information for efficiency
 * Follows BuildEase mobile-first responsive design principles
 */
import { useMemo, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { CreateProjectFormValues } from '../../pages/CreateProject/schema';
import { Input } from '@/components/ui/input';
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
import { cn } from '@/utils/core/ui';
import { currencyService, type CurrencyOption } from '@/services/currencyService';

// Size units
const SIZE_UNITS = [
  { value: 'sq-m', label: 'Square Meters' },
  { value: 'sq-ft', label: 'Square Feet' }
];

// Currency options are now provided by centralized currencyService

// Memoized number options generator
const generateNumberOptions = (max: number) => {
  return Array.from({ length: max }, (_, i) => ({
    value: String(i + 1),
    label: String(i + 1)
  }));
};

// Simplified building styles - focused on popular, widely-recognized options
const BUILDING_STYLES = [
  { value: 'ai-recommend', label: 'Let AI recommend based on my location & preferences', category: 'AI', description: 'Our AI will suggest the best style for your project' },
  
  // Popular Modern Styles (3 options)
  { value: 'modern', label: 'Modern', category: 'Contemporary', description: 'Clean lines, open spaces, minimal decoration' },
  { value: 'contemporary', label: 'Contemporary', category: 'Contemporary', description: 'Current design trends with flexible layouts' },
  { value: 'minimalist', label: 'Minimalist', category: 'Contemporary', description: 'Simple, uncluttered design with focus on function' },
  
  // Classic Traditional Styles (3 options)
  { value: 'traditional', label: 'Traditional', category: 'Traditional', description: 'Timeless design with classic proportions' },
  { value: 'colonial', label: 'Colonial', category: 'Traditional', description: 'Historical style with symmetrical design' },
  { value: 'craftsman', label: 'Craftsman', category: 'Traditional', description: 'Handcrafted details with natural materials' },
  
  // Regional Styles (3 options)
  { value: 'tropical', label: 'Tropical', category: 'Regional', description: 'Designed for warm, humid climates with natural ventilation' },
  { value: 'mediterranean', label: 'Mediterranean', category: 'Regional', description: 'Inspired by coastal European architecture' },
  { value: 'ranch', label: 'Ranch/Single-Story', category: 'Regional', description: 'Low-profile, sprawling design perfect for accessibility' },
  
  // Special Categories (2 options)
  { value: 'eco-friendly', label: 'Eco-Friendly', category: 'Sustainable', description: 'Environmentally conscious design with sustainable features' },
  { value: 'mixed', label: 'Mixed/Custom Style', category: 'Custom', description: 'Combination of different styles or unique design' }
];

function BuildingBudgetForm() {
  const { control, watch } = useFormContext<CreateProjectFormValues>();
  
  // Memoize number options to prevent recreation on every render
  const storeysOptions = useMemo(() => generateNumberOptions(10), []);
  const bedroomOptions = useMemo(() => generateNumberOptions(15), []);
  const bathroomOptions = useMemo(() => generateNumberOptions(10), []);
  const kitchenOptions = useMemo(() => generateNumberOptions(5), []);
  const livingAreaOptions = useMemo(() => generateNumberOptions(5), []);

  // Organize building styles by category for better UX
  const organizedBuildingStyles = useMemo(() => {
    const categories = new Map<string, typeof BUILDING_STYLES>();
    
    BUILDING_STYLES.forEach(style => {
      const category = style.category || 'Other';
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(style);
    });
    
    // Sort categories in a logical order
    const categoryOrder = ['AI', 'Contemporary', 'Traditional', 'Regional', 'Sustainable', 'Custom'];
    const sortedCategories: Array<{category: string, styles: typeof BUILDING_STYLES}> = [];
    
    categoryOrder.forEach(category => {
      if (categories.has(category)) {
        sortedCategories.push({
          category,
          styles: categories.get(category)!
        });
      }
    });
    
    // Add any remaining categories
    categories.forEach((styles, category) => {
      if (!categoryOrder.includes(category)) {
        sortedCategories.push({ category, styles });
      }
    });
    
    return sortedCategories;
  }, []);

  // Watch form values for smart calculations and guidance
  const currency = watch('currency');
  const budget = watch('budget');
  const buildingSize = watch('buildingSize');
  const buildingSizeUnit = watch('buildingSizeUnit');
  const country = watch('country');

  // Smart currency options from service (simple prioritized list)
  const currencyOptions = useMemo<CurrencyOption[]>(() => {
    return currencyService.getSmartCurrencyOptionsSimple(country);
  }, [country]);

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
    // Provide general guidance since we can't maintain static cost data for all currencies
    return `Construction costs vary significantly by location, quality, and local labor rates in ${currencyCode}. Consider getting quotes from local contractors for accurate pricing in your area.`;
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
                  <SelectContent className="max-h-[300px]">
                    {organizedBuildingStyles.map(({ category, styles }) => (
                      <div key={category}>
                        {/* Category Header */}
                        {category !== 'AI' && (
                          <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                            {category} Styles
                          </div>
                        )}
                        
                        {/* Category Items */}
                        {styles.map((style) => (
                          <SelectItem 
                            key={style.value} 
                            value={style.value}
                            className={cn(
                              category === 'AI' && 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500 font-medium',
                              'py-3'
                            )}
                          >
                            {style.value === 'ai-recommend' ? (
                              <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                                <div>
                                  <div className="font-medium">{style.label}</div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {style.description}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="font-medium">{style.label}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                  {style.description}
                                </div>
                              </div>
                            )}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-600 font-opensans text-sm" />
                
                {/* Style Description Helper */}
                <div className="text-xs text-slate-600 dark:text-slate-400 font-opensans mt-1">
                  💡 Not sure? Choose "Let AI recommend" for the best style based on your location, climate, and project type.
                </div>
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
                    {currencyOptions.map((currencyOption) => (
                      <SelectItem 
                        key={currencyOption.value} 
                        value={currencyOption.value}
                        className={currencyOption.isRecommended ? 'bg-[#ED8936]/10 border-l-2 border-[#ED8936]' : ''}
                      >
                        {currencyOption.isRecommended ? `${currencyOption.label} (Recommended)` : currencyOption.label}
                      </SelectItem>
                    ))}
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
                <FormControl>
                  <div className="relative">
                    <CalendarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#ED8936]" />
                    <Input 
                      type="date"
                      {...field}
                      value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        const dateValue = e.target.value;
                        if (dateValue) {
                          // Convert YYYY-MM-DD to ISO string
                          const isoDate = new Date(dateValue + 'T00:00:00').toISOString();
                          field.onChange(isoDate);
                        } else {
                          field.onChange('');
                        }
                      }}
                      min={new Date().toISOString().split('T')[0]} // Prevent past dates
                      className="h-12 pl-12 text-base font-opensans border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:border-[#ED8936] dark:focus:border-[#ED8936] focus:ring-2 focus:ring-[#ED8936]/10 transition-all duration-200 placeholder:text-slate-500"
                    />
                  </div>
                </FormControl>
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
                  
                  {/* General budget note */}
                  <div className="mt-2 flex items-center text-blue-600 dark:text-blue-400">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span className="font-opensans">Get local quotes to validate your budget estimate</span>
                  </div>
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