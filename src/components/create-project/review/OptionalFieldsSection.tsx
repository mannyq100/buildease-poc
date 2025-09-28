/**
 * OptionalFieldsSection Component
 * Handles the expandable optional specifications form
 */
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { m } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Sparkles 
} from 'lucide-react';
import { CreateProjectFormValues } from '../../../pages/CreateProject/schema';
import { 
  STRUCTURE_TYPES, 
  FOUNDATION_TYPES, 
  ROOF_TYPES, 
  WALL_MATERIALS, 
  FLOOR_MATERIALS,
  SPECIAL_FEATURES,
  SUSTAINABILITY_FEATURES
} from './constants';
import { capitalize } from './utils';

export function OptionalFieldsSection() {
  const { control, watch } = useFormContext<CreateProjectFormValues>();
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const formValues = watch();

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
    >
      <Card className="border border-slate-200 dark:border-slate-700 bg-[#ED8936]/5 dark:bg-[#ED8936]/10">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#ED8936]/20 dark:bg-[#ED8936]/30 rounded-lg flex items-center justify-center border border-[#ED8936]/30">
                <Settings className="h-4 w-4 text-[#ED8936]" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white font-inter">
                Optional Specifications
              </h3>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowOptionalFields(!showOptionalFields)}
              className="flex items-center gap-2 border border-[#ED8936]/30 text-[#ED8936] hover:bg-[#ED8936]/10"
            >
              {showOptionalFields ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {showOptionalFields ? 'Hide Details' : 'Add Preferences'}
            </Button>
          </div>
          
          <div className="text-sm text-slate-600 dark:text-slate-400 font-opensans mb-4">
            Our AI will make smart recommendations, but you can specify preferences below if you have specific requirements.
          </div>
          
          {showOptionalFields && (
            <m.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-600"
            >
              {/* Materials & Construction */}
              <div className="space-y-4">
                <h4 className="text-base font-semibold text-slate-900 dark:text-white font-inter flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Materials & Construction
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormField
                    control={control}
                    name="structureType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Structure Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10 text-sm">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {STRUCTURE_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="foundationType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Foundation Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10 text-sm">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {FOUNDATION_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="roofType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Roof Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10 text-sm">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ROOF_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="wallMaterial"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Wall Material</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10 text-sm">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {WALL_MATERIALS.map((material) => (
                              <SelectItem key={material.value} value={material.value}>
                                {material.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="floorMaterial"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Floor Material</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10 text-sm">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {FLOOR_MATERIALS.map((material) => (
                              <SelectItem key={material.value} value={material.value}>
                                {material.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Special Features */}
              <div className="space-y-4">
                <h4 className="text-base font-semibold text-slate-900 dark:text-white font-inter flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Special Features
                </h4>
                
                <FormField
                  control={control}
                  name="specialFeatures"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Features & Amenities</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
                        {SPECIAL_FEATURES.map((feature) => (
                          <div key={feature} className="flex items-center space-x-2">
                            <Checkbox
                              id={feature}
                              checked={field.value?.includes(feature) || false}
                              onCheckedChange={(checked) => {
                                const current = field.value || [];
                                if (checked) {
                                  field.onChange([...current, feature]);
                                } else {
                                  field.onChange(current.filter((f: string) => f !== feature));
                                }
                              }}
                            />
                            <label
                              htmlFor={feature}
                              className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer"
                            >
                              {capitalize(feature)}
                            </label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="sustainabilityFeatures"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Sustainability Features</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
                        {SUSTAINABILITY_FEATURES.map((feature) => (
                          <div key={feature} className="flex items-center space-x-2">
                            <Checkbox
                              id={`sustainability-${feature}`}
                              checked={field.value?.includes(feature) || false}
                              onCheckedChange={(checked) => {
                                const current = field.value || [];
                                if (checked) {
                                  field.onChange([...current, feature]);
                                } else {
                                  field.onChange(current.filter((f: string) => f !== feature));
                                }
                              }}
                            />
                            <label
                              htmlFor={`sustainability-${feature}`}
                              className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer"
                            >
                              {capitalize(feature)}
                            </label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Additional Notes */}
              <div className="space-y-4">
                <h4 className="text-base font-semibold text-slate-900 dark:text-white font-inter">Additional Notes</h4>
                
                <div className="space-y-4">
                  <FormField
                    control={control}
                    name="siteConstraints"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Site Constraints</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe any site limitations, access issues, or constraints..."
                            className="min-h-[80px] text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="localRegulations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Local Regulations</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any specific building codes, regulations, or approval requirements..."
                            className="min-h-[80px] text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="additionalNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any other requirements, preferences, or important information..."
                            className="min-h-[100px] text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Summary of Selected Features */}
              {(formValues.specialFeatures?.length > 0 || formValues.sustainabilityFeatures?.length > 0) && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-600 space-y-4">
                  <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 font-opensans">
                    Selected Features Summary
                  </h4>
                  
                  {formValues.specialFeatures?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 font-opensans">
                        Special Features
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {formValues.specialFeatures.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="bg-[#2B6CB0]/10 text-[#2B6CB0] border-[#2B6CB0]/20">
                            {capitalize(feature)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {formValues.sustainabilityFeatures?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 font-opensans">
                        Sustainability Features
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {formValues.sustainabilityFeatures.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                            {capitalize(feature)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </m.div>
          )}
        </div>
      </Card>
    </m.div>
  );
}