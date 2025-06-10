/**
 * MaterialsConstructionForm.tsx
 * Fifth step of the project creation wizard
 * Collects materials and construction information
 */
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ProjectFormValues } from '../../pages/CreateProject';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Layers, Warehouse, Home, Blocks, Grid3X3 } from 'lucide-react';

// Structure types
const STRUCTURE_TYPES = [
  { value: 'concrete-frame', label: 'Concrete Frame', description: 'Reinforced concrete columns and beams' },
  { value: 'load-bearing-wall', label: 'Load-Bearing Wall', description: 'Walls support the structural load' },
  { value: 'steel-frame', label: 'Steel Frame', description: 'Steel columns and beams' },
  { value: 'timber-frame', label: 'Timber Frame', description: 'Wooden structural elements' },
  { value: 'hybrid', label: 'Hybrid Structure', description: 'Combination of structural systems' }
];

// Foundation types
const FOUNDATION_TYPES = [
  { value: 'strip', label: 'Strip Foundation', description: 'Continuous strips under load-bearing walls' },
  { value: 'raft', label: 'Raft Foundation', description: 'Single slab supporting the entire building' },
  { value: 'pad', label: 'Pad Foundation', description: 'Individual footings for columns' },
  { value: 'pile', label: 'Pile Foundation', description: 'Deep foundations for poor soil conditions' },
  { value: 'stepped', label: 'Stepped Foundation', description: 'For sloping sites' }
];

// Roof types
const ROOF_TYPES = [
  { value: 'gable', label: 'Gable Roof', description: 'Traditional triangular roof' },
  { value: 'hip', label: 'Hip Roof', description: 'Slopes on all four sides' },
  { value: 'flat', label: 'Flat Roof', description: 'Horizontal or slightly sloped roof' },
  { value: 'shed', label: 'Shed Roof', description: 'Single sloping roof' },
  { value: 'mansard', label: 'Mansard Roof', description: 'Four-sided roof with double slope' },
  { value: 'butterfly', label: 'Butterfly Roof', description: 'V-shaped roof for water collection' }
];

// Wall materials
const WALL_MATERIALS = [
  { value: 'concrete-blocks', label: 'Concrete Blocks', description: 'Standard building blocks' },
  { value: 'clay-bricks', label: 'Clay Bricks', description: 'Traditional fired clay bricks' },
  { value: 'stone', label: 'Stone', description: 'Natural stone construction' },
  { value: 'compressed-earth', label: 'Compressed Earth Blocks', description: 'Eco-friendly earth blocks' },
  { value: 'timber', label: 'Timber', description: 'Wooden wall construction' },
  { value: 'glass', label: 'Glass Curtain Wall', description: 'For modern designs' }
];

// Floor materials
const FLOOR_MATERIALS = [
  { value: 'ceramic-tiles', label: 'Ceramic Tiles', description: 'Durable and easy to clean' },
  { value: 'porcelain-tiles', label: 'Porcelain Tiles', description: 'More durable than ceramic' },
  { value: 'terrazzo', label: 'Terrazzo', description: 'Composite material with marble chips' },
  { value: 'concrete', label: 'Polished Concrete', description: 'Modern and industrial look' },
  { value: 'wood', label: 'Wood', description: 'Natural and warm appearance' },
  { value: 'marble', label: 'Marble', description: 'Luxury natural stone' },
  { value: 'granite', label: 'Granite', description: 'Very hard and durable stone' }
];

export function MaterialsConstructionForm() {
  const { control } = useFormContext<ProjectFormValues>();

  return (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white font-inter mb-2">
          Material Preferences
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-opensans max-w-2xl mx-auto">
          These selections are optional. Our AI will recommend suitable materials based on your location, budget, and project type.
        </p>
      </div>

      {/* Material Selection Cards */}
      <div className="grid grid-cols-1 gap-6">
        {/* Structure Type */}
        <Card className="p-6 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-300">
          <FormField
            control={control}
            name="structureType"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-[#2B6CB0] rounded-xl flex items-center justify-center mr-4">
                    <Warehouse className="h-5 w-5 text-white" />
                  </div>
                  <FormLabel className="text-lg font-semibold text-slate-900 dark:text-white font-inter m-0">
                    Structure Type
                    <span className="text-base font-normal text-slate-500 ml-2 font-opensans">(optional)</span>
                  </FormLabel>
                </div>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-14 text-base font-opensans border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:border-[#2B6CB0] dark:focus:border-[#2B6CB0] focus:ring-4 focus:ring-[#2B6CB0]/20 transition-all duration-300 shadow-sm hover:shadow-md">
                      <SelectValue placeholder="Select structure type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {STRUCTURE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium font-inter">{type.label}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 font-opensans">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-600 font-opensans text-sm" />
              </FormItem>
            )}
          />
        </Card>

        {/* Foundation Type */}
        <Card className="p-6 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-300">
          <FormField
            control={control}
            name="foundationType"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-[#2B6CB0] rounded-xl flex items-center justify-center mr-4">
                    <Layers className="h-5 w-5 text-white" />
                  </div>
                  <FormLabel className="text-lg font-semibold text-slate-900 dark:text-white font-inter m-0">
                    Foundation Type
                    <span className="text-base font-normal text-slate-500 ml-2 font-opensans">(optional)</span>
                  </FormLabel>
                </div>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-14 text-base font-opensans border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:border-[#2B6CB0] dark:focus:border-[#2B6CB0] focus:ring-4 focus:ring-[#2B6CB0]/20 transition-all duration-300 shadow-sm hover:shadow-md">
                      <SelectValue placeholder="Select foundation type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {FOUNDATION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium font-inter">{type.label}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 font-opensans">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-600 font-opensans text-sm" />
              </FormItem>
            )}
          />
        </Card>

        {/* Roof Type */}
        <Card className="p-6 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-300">
          <FormField
            control={control}
            name="roofType"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-[#2B6CB0] rounded-xl flex items-center justify-center mr-4">
                    <Home className="h-5 w-5 text-white" />
                  </div>
                  <FormLabel className="text-lg font-semibold text-slate-900 dark:text-white font-inter m-0">
                    Roof Type
                    <span className="text-base font-normal text-slate-500 ml-2 font-opensans">(optional)</span>
                  </FormLabel>
                </div>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-14 text-base font-opensans border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:border-[#2B6CB0] dark:focus:border-[#2B6CB0] focus:ring-4 focus:ring-[#2B6CB0]/20 transition-all duration-300 shadow-sm hover:shadow-md">
                      <SelectValue placeholder="Select roof type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ROOF_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium font-inter">{type.label}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 font-opensans">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-600 font-opensans text-sm" />
              </FormItem>
            )}
          />
        </Card>

        {/* Wall Material */}
        <Card className="p-6 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-300">
          <FormField
            control={control}
            name="wallMaterial"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-[#2B6CB0] rounded-xl flex items-center justify-center mr-4">
                    <Blocks className="h-5 w-5 text-white" />
                  </div>
                  <FormLabel className="text-lg font-semibold text-slate-900 dark:text-white font-inter m-0">
                    Wall Material
                    <span className="text-base font-normal text-slate-500 ml-2 font-opensans">(optional)</span>
                  </FormLabel>
                </div>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-14 text-base font-opensans border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:border-[#2B6CB0] dark:focus:border-[#2B6CB0] focus:ring-4 focus:ring-[#2B6CB0]/20 transition-all duration-300 shadow-sm hover:shadow-md">
                      <SelectValue placeholder="Select wall material" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {WALL_MATERIALS.map((material) => (
                      <SelectItem key={material.value} value={material.value}>
                        <div>
                          <div className="font-medium font-inter">{material.label}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 font-opensans">{material.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-600 font-opensans text-sm" />
              </FormItem>
            )}
          />
        </Card>

        {/* Floor Material */}
        <Card className="p-6 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-300">
          <FormField
            control={control}
            name="floorMaterial"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-[#2B6CB0] rounded-xl flex items-center justify-center mr-4">
                    <Grid3X3 className="h-5 w-5 text-white" />
                  </div>
                  <FormLabel className="text-lg font-semibold text-slate-900 dark:text-white font-inter m-0">
                    Floor Material
                    <span className="text-base font-normal text-slate-500 ml-2 font-opensans">(optional)</span>
                  </FormLabel>
                </div>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-14 text-base font-opensans border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:border-[#2B6CB0] dark:focus:border-[#2B6CB0] focus:ring-4 focus:ring-[#2B6CB0]/20 transition-all duration-300 shadow-sm hover:shadow-md">
                      <SelectValue placeholder="Select floor material" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {FLOOR_MATERIALS.map((material) => (
                      <SelectItem key={material.value} value={material.value}>
                        <div>
                          <div className="font-medium font-inter">{material.label}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 font-opensans">{material.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-600 font-opensans text-sm" />
              </FormItem>
            )}
          />
        </Card>
      </div>

      {/* Materials Tips */}
      <Card className="p-6 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl">
        <div className="flex space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
              <Layers className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <h4 className="text-base font-semibold text-slate-900 dark:text-white font-inter mb-3">Local Materials Advantage</h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 font-opensans leading-relaxed mb-4">
              Using locally sourced materials can reduce costs by 15-20% and support the local economy.
            </p>
            <ul className="text-sm text-slate-700 dark:text-slate-300 font-opensans space-y-2 list-disc pl-4 leading-relaxed">
              <li>Concrete blocks are widely available and cost-effective in Ghana</li>
              <li>Consider compressed earth blocks for eco-friendly construction</li>
              <li>Local timber can be used for roof structures and interior finishes</li>
              <li>Ceramic tiles manufactured in Ghana offer good value for flooring</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
