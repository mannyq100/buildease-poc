/**
 * BuildingSpecsForm.tsx
 * Third step of the project creation wizard
 * Collects building specifications information
 */
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ProjectFormValues } from '../../pages/CreateProject';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Ruler, Home, Building2, Bath, ChefHat, Sofa } from 'lucide-react';

// Size units
const SIZE_UNITS = [
  { value: 'sq-m', label: 'Square Meters' },
  { value: 'sq-ft', label: 'Square Feet' }
];

// Number options for dropdowns
const generateNumberOptions = (max: number) => {
  return Array.from({ length: max }, (_, i) => ({
    value: String(i + 1),
    label: String(i + 1)
  }));
};

// Building styles
const BUILDING_STYLES = [
  { value: 'modern', label: 'Modern' },
  { value: 'contemporary', label: 'Contemporary' },
  { value: 'traditional', label: 'Traditional' },
  { value: 'colonial', label: 'Colonial' },
  { value: 'minimalist', label: 'Minimalist' },
  { value: 'tropical', label: 'Tropical' },
  { value: 'mediterranean', label: 'Mediterranean' },
  { value: 'african-contemporary', label: 'African Contemporary' }
];

export function BuildingSpecsForm() {
  const { control } = useFormContext<ProjectFormValues>();

  return (
    <div className="space-y-8">
      {/* Building Size Section */}
      <div className="bg-[#2B6CB0]/5 dark:bg-[#2B6CB0]/10 rounded-xl p-6 space-y-6 border border-[#2B6CB0]/20 dark:border-[#2B6CB0]/30">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-[#2B6CB0] rounded-xl flex items-center justify-center">
            <Ruler className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white font-inter">Building Dimensions</h3>
        </div>

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
                  <Input 
                    type="number"
                    placeholder="0" 
                    {...field} 
                    className="h-14 text-base font-opensans border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:border-[#2B6CB0] dark:focus:border-[#2B6CB0] focus:ring-4 focus:ring-[#2B6CB0]/20 transition-all duration-300 shadow-sm hover:shadow-md placeholder:text-slate-500"
                  />
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
      </div>

      {/* Room Configuration */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 font-inter">
          How many rooms do you need?
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Number of Storeys */}
          <FormField
            control={control}
            name="storeys"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <div className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-xl p-5 transition-all duration-300 hover:border-[#2B6CB0]/50 shadow-sm hover:shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-[#2B6CB0] rounded-xl flex items-center justify-center mr-3">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <FormLabel className="text-base font-semibold text-slate-900 dark:text-white m-0 font-inter">
                      Storeys
                    </FormLabel>
                  </div>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 text-base font-opensans border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:border-[#2B6CB0] focus:ring-2 focus:ring-[#2B6CB0]/20 transition-all duration-200">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {generateNumberOptions(10).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-600 font-opensans text-sm mt-2" />
                </div>
              </FormItem>
            )}
          />

          {/* Number of Bedrooms */}
          <FormField
            control={control}
            name="bedrooms"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <div className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-xl p-5 transition-all duration-300 hover:border-[#2B6CB0]/50 shadow-sm hover:shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-[#2B6CB0] rounded-xl flex items-center justify-center mr-3">
                      <Home className="h-5 w-5 text-white" />
                    </div>
                    <FormLabel className="text-base font-semibold text-slate-900 dark:text-white m-0 font-inter">
                      Bedrooms
                    </FormLabel>
                  </div>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 text-base font-opensans border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:border-[#2B6CB0] focus:ring-2 focus:ring-[#2B6CB0]/20 transition-all duration-200">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {generateNumberOptions(15).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-600 font-opensans text-sm mt-2" />
                </div>
              </FormItem>
            )}
          />

          {/* Number of Bathrooms */}
          <FormField
            control={control}
            name="bathrooms"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <div className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-xl p-5 transition-all duration-300 hover:border-[#2B6CB0]/50 shadow-sm hover:shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-[#2B6CB0] rounded-xl flex items-center justify-center mr-3">
                      <Bath className="h-5 w-5 text-white" />
                    </div>
                    <FormLabel className="text-base font-semibold text-slate-900 dark:text-white m-0 font-inter">
                      Bathrooms
                    </FormLabel>
                  </div>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 text-base font-opensans border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:border-[#2B6CB0] focus:ring-2 focus:ring-[#2B6CB0]/20 transition-all duration-200">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {generateNumberOptions(10).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-600 font-opensans text-sm mt-2" />
                </div>
              </FormItem>
            )}
          />

          {/* Number of Kitchens */}
          <FormField
            control={control}
            name="kitchens"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <div className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-xl p-5 transition-all duration-300 hover:border-[#2B6CB0]/50 shadow-sm hover:shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-[#2B6CB0] rounded-xl flex items-center justify-center mr-3">
                      <ChefHat className="h-5 w-5 text-white" />
                    </div>
                    <FormLabel className="text-base font-semibold text-slate-900 dark:text-white m-0 font-inter">
                      Kitchens
                      <span className="text-sm font-normal text-slate-500 ml-2 font-opensans">(optional)</span>
                    </FormLabel>
                  </div>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value || '1'}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 text-base font-opensans border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:border-[#2B6CB0] focus:ring-2 focus:ring-[#2B6CB0]/20 transition-all duration-200">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {generateNumberOptions(5).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-opensans">
                    Defaults to 1 if not specified
                  </p>
                  <FormMessage className="text-red-600 font-opensans text-sm mt-1" />
                </div>
              </FormItem>
            )}
          />

          {/* Number of Living Areas */}
          <FormField
            control={control}
            name="livingAreas"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <div className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-xl p-5 transition-all duration-300 hover:border-[#2B6CB0]/50 shadow-sm hover:shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-[#2B6CB0] rounded-xl flex items-center justify-center mr-3">
                      <Sofa className="h-5 w-5 text-white" />
                    </div>
                    <FormLabel className="text-base font-semibold text-slate-900 dark:text-white m-0 font-inter">
                      Living Areas
                      <span className="text-sm font-normal text-slate-500 ml-2 font-opensans">(optional)</span>
                    </FormLabel>
                  </div>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value || '1'}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 text-base font-opensans border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:border-[#2B6CB0] focus:ring-2 focus:ring-[#2B6CB0]/20 transition-all duration-200">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {generateNumberOptions(5).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-opensans">
                    Defaults to 1 if not specified
                  </p>
                  <FormMessage className="text-red-600 font-opensans text-sm mt-1" />
                </div>
              </FormItem>
            )}
          />

          {/* Building Style */}
          <FormField
            control={control}
            name="buildingStyle"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <div className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-xl p-5 transition-all duration-300 hover:border-[#2B6CB0]/50 shadow-sm hover:shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-[#2B6CB0] rounded-xl flex items-center justify-center mr-3">
                      <Home className="h-5 w-5 text-white" />
                    </div>
                    <FormLabel className="text-base font-semibold text-slate-900 dark:text-white m-0 font-inter">
                      Architectural Style
                      <span className="text-sm font-normal text-slate-500 ml-2 font-opensans">(optional)</span>
                    </FormLabel>
                  </div>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 text-base font-opensans border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:border-[#2B6CB0] focus:ring-2 focus:ring-[#2B6CB0]/20 transition-all duration-200">
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
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-opensans">
                    Helps guide the architectural design direction
                  </p>
                  <FormMessage className="text-red-600 font-opensans text-sm mt-1" />
                </div>
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Building Tips */}
      <Card className="p-6 bg-[#ED8936]/10 border border-[#ED8936]/30 rounded-xl">
        <div className="flex space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-[#ED8936] rounded-xl flex items-center justify-center">
              <Home className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <h4 className="text-base font-semibold text-slate-900 dark:text-white font-inter mb-3">Building Tips</h4>
            <ul className="text-sm text-slate-700 dark:text-slate-300 font-opensans space-y-2 list-disc pl-4 leading-relaxed">
              <li>Plan at least one bathroom for every two bedrooms</li>
              <li>Consider local climate when determining number of storeys</li>
              <li>Building style should complement surrounding architecture</li>
              <li>Multi-storey buildings may require special permits in some areas</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
