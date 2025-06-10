/**
 * FeaturesForm.tsx
 * Sixth step of the project creation wizard
 * Collects special features and sustainability information
 */
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ProjectFormValues } from '../../pages/CreateProject';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Leaf, AlertTriangle, ScrollText } from 'lucide-react';

// Special features options
const SPECIAL_FEATURES = [
  { id: 'swimming-pool', label: 'Swimming Pool' },
  { id: 'home-office', label: 'Home Office' },
  { id: 'outdoor-kitchen', label: 'Outdoor Kitchen' },
  { id: 'garden', label: 'Garden' },
  { id: 'garage', label: 'Garage' },
  { id: 'balcony', label: 'Balcony' },
  { id: 'rooftop-terrace', label: 'Rooftop Terrace' },
  { id: 'gym', label: 'Gym/Fitness Room' },
  { id: 'entertainment-room', label: 'Entertainment Room' },
  { id: 'guest-house', label: 'Guest House/Quarters' },
  { id: 'walk-in-closet', label: 'Walk-in Closet' },
  { id: 'study-room', label: 'Study/Library Room' }
];

// Sustainability features options
const SUSTAINABILITY_FEATURES = [
  { id: 'solar-panels', label: 'Solar Panels' },
  { id: 'rainwater-harvesting', label: 'Rainwater Harvesting' },
  { id: 'energy-efficient-windows', label: 'Energy Efficient Windows' },
  { id: 'green-roof', label: 'Green Roof' },
  { id: 'natural-ventilation', label: 'Natural Ventilation System' },
  { id: 'led-lighting', label: 'LED Lighting Throughout' },
  { id: 'water-saving-fixtures', label: 'Water-Saving Fixtures' },
  { id: 'recycled-materials', label: 'Recycled Building Materials' },
  { id: 'greywater-system', label: 'Greywater Recycling System' },
  { id: 'smart-home-energy', label: 'Smart Home Energy Management' },
  { id: 'cross-ventilation', label: 'Cross Ventilation Design' },
  { id: 'thermal-insulation', label: 'Thermal Insulation' }
];


export function FeaturesForm() {
  const { control } = useFormContext<ProjectFormValues>();

  return (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white font-inter mb-2">
          Special Features
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-opensans max-w-2xl mx-auto">
          These selections are optional. Choose features that enhance your lifestyle and add value to your project.
        </p>
      </div>

      {/* Special Features */}
      <Card className="p-6 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-300">
        <FormField
          control={control}
          name="specialFeatures"
          render={({ field }) => (
            <FormItem className="space-y-4">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-[#2B6CB0] rounded-xl flex items-center justify-center mr-4">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <FormLabel className="text-lg font-semibold text-slate-900 dark:text-white font-inter m-0">
                  Lifestyle Features
                  <span className="text-base font-normal text-slate-500 ml-2 font-opensans">(optional)</span>
                </FormLabel>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-opensans leading-relaxed mb-6">
                Select any special features you'd like to include in your project
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SPECIAL_FEATURES.map((feature) => (
                  <FormItem
                    key={feature.id}
                    className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-4 hover:border-[#2B6CB0]/50 dark:hover:border-[#2B6CB0]/50 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(feature.id)}
                        onCheckedChange={(checked) => {
                          const currentValues = field.value || [];
                          if (checked) {
                            field.onChange([...currentValues, feature.id]);
                          } else {
                            field.onChange(
                              currentValues.filter((value) => value !== feature.id)
                            );
                          }
                        }}
                        className="data-[state=checked]:bg-[#2B6CB0] data-[state=checked]:border-[#2B6CB0] border-2 border-slate-400 dark:border-slate-500 mt-0.5"
                      />
                    </FormControl>
                    <FormLabel className="text-base font-medium cursor-pointer text-slate-900 dark:text-white font-opensans leading-relaxed">
                      {feature.label}
                    </FormLabel>
                  </FormItem>
                ))}
              </div>
              <FormMessage className="text-red-600 font-opensans text-sm" />
            </FormItem>
          )}
        />
      </Card>

      {/* Sustainability Features */}
      <Card className="p-6 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-300">
        <FormField
          control={control}
          name="sustainabilityFeatures"
          render={({ field }) => (
            <FormItem className="space-y-4">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center mr-4">
                  <Leaf className="h-5 w-5 text-white" />
                </div>
                <FormLabel className="text-lg font-semibold text-slate-900 dark:text-white font-inter m-0">
                  Sustainability Features
                  <span className="text-base font-normal text-slate-500 ml-2 font-opensans">(optional)</span>
                </FormLabel>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-opensans leading-relaxed mb-6">
                Select sustainable building features to reduce environmental impact and operating costs
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SUSTAINABILITY_FEATURES.map((feature) => (
                  <FormItem
                    key={feature.id}
                    className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-4 hover:border-green-500/50 dark:hover:border-green-500/50 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(feature.id)}
                        onCheckedChange={(checked) => {
                          const currentValues = field.value || [];
                          if (checked) {
                            field.onChange([...currentValues, feature.id]);
                          } else {
                            field.onChange(
                              currentValues.filter((value) => value !== feature.id)
                            );
                          }
                        }}
                        className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 border-2 border-slate-400 dark:border-slate-500 mt-0.5"
                      />
                    </FormControl>
                    <FormLabel className="text-base font-medium cursor-pointer text-slate-900 dark:text-white font-opensans leading-relaxed">
                      {feature.label}
                    </FormLabel>
                  </FormItem>
                ))}
              </div>
              <FormMessage className="text-red-600 font-opensans text-sm" />
            </FormItem>
          )}
        />
      </Card>

      {/* Site Constraints */}
      <Card className="p-6 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-300">
        <FormField
          control={control}
          name="siteConstraints"
          render={({ field }) => (
            <FormItem className="space-y-4">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-[#ED8936] rounded-xl flex items-center justify-center mr-4">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <FormLabel className="text-lg font-semibold text-slate-900 dark:text-white font-inter m-0">
                  Site Constraints
                  <span className="text-base font-normal text-slate-500 ml-2 font-opensans">(optional)</span>
                </FormLabel>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-opensans leading-relaxed mb-4">
                Describe any site constraints that may affect construction
              </p>
              <FormControl>
                <Textarea 
                  placeholder="E.g., sloping terrain, nearby structures, drainage issues..." 
                  {...field} 
                  className="min-h-[120px] text-base font-opensans leading-relaxed border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:border-[#2B6CB0] dark:focus:border-[#2B6CB0] focus:ring-4 focus:ring-[#2B6CB0]/20 transition-all duration-300 resize-none shadow-sm hover:shadow-md placeholder:text-slate-500"
                />
              </FormControl>
              <FormMessage className="text-red-600 font-opensans text-sm" />
            </FormItem>
          )}
        />
      </Card>

      {/* Local Regulations */}
      <Card className="p-6 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-300">
        <FormField
          control={control}
          name="localRegulations"
          render={({ field }) => (
            <FormItem className="space-y-4">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-[#2B6CB0] rounded-xl flex items-center justify-center mr-4">
                  <ScrollText className="h-5 w-5 text-white" />
                </div>
                <FormLabel className="text-lg font-semibold text-slate-900 dark:text-white font-inter m-0">
                  Local Regulations
                  <span className="text-base font-normal text-slate-500 ml-2 font-opensans">(optional)</span>
                </FormLabel>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-opensans leading-relaxed mb-4">
                Note any specific local building regulations or zoning requirements
              </p>
              <FormControl>
                <Textarea 
                  placeholder="E.g., height restrictions, setback requirements..." 
                  {...field} 
                  className="min-h-[120px] text-base font-opensans leading-relaxed border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:border-[#2B6CB0] dark:focus:border-[#2B6CB0] focus:ring-4 focus:ring-[#2B6CB0]/20 transition-all duration-300 resize-none shadow-sm hover:shadow-md placeholder:text-slate-500"
                />
              </FormControl>
              <FormMessage className="text-red-600 font-opensans text-sm" />
            </FormItem>
          )}
        />
      </Card>

      {/* Sustainability Tips */}
      <Card className="p-6 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl">
        <div className="flex space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
              <Leaf className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <h4 className="text-base font-semibold text-slate-900 dark:text-white font-inter mb-3">Sustainability Benefits</h4>
            <ul className="text-sm text-slate-700 dark:text-slate-300 font-opensans space-y-2 list-disc pl-4 leading-relaxed">
              <li>Solar panels can reduce electricity costs by up to 70% in Ghana</li>
              <li>Rainwater harvesting systems pay for themselves within 2-3 years</li>
              <li>Energy-efficient windows reduce cooling costs by 15-25%</li>
              <li>Natural ventilation systems eliminate the need for air conditioning in many areas</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
