/**
 * LocationPlotForm.tsx
 * Second step of the project creation wizard
 * Collects location and plot information
 */
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ProjectFormValues } from '../../pages/CreateProject';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Ruler } from 'lucide-react';
import { AreaUnit } from '../../utils/projectFormUtils';

// Countries
const COUNTRIES = [
  { value: 'ghana', label: 'Ghana' },
  { value: 'nigeria', label: 'Nigeria' },
  { value: 'kenya', label: 'Kenya' },
  { value: 'south-africa', label: 'South Africa' },
  { value: 'other', label: 'Other' }
];

// Regions by country
const REGIONS_BY_COUNTRY = {
  ghana: [
    { value: 'greater-accra', label: 'Greater Accra' },
    { value: 'ashanti', label: 'Ashanti' },
    { value: 'eastern', label: 'Eastern' },
    { value: 'western', label: 'Western' },
    { value: 'central', label: 'Central' },
    { value: 'volta', label: 'Volta' },
    { value: 'northern', label: 'Northern' },
    { value: 'upper-east', label: 'Upper East' },
    { value: 'upper-west', label: 'Upper West' },
    { value: 'north-east', label: 'North East' },
    { value: 'savannah', label: 'Savannah' },
    { value: 'bono', label: 'Bono' },
    { value: 'bono-east', label: 'Bono East' },
    { value: 'ahafo', label: 'Ahafo' },
    { value: 'western-north', label: 'Western North' },
    { value: 'oti', label: 'Oti' }
  ],
  nigeria: [
    { value: 'lagos', label: 'Lagos' },
    { value: 'abuja', label: 'FCT - Abuja' },
    { value: 'kano', label: 'Kano' },
    { value: 'oyo', label: 'Oyo' },
    { value: 'rivers', label: 'Rivers' },
    { value: 'kaduna', label: 'Kaduna' },
    { value: 'ogun', label: 'Ogun' },
    { value: 'anambra', label: 'Anambra' },
    { value: 'delta', label: 'Delta' },
    { value: 'edo', label: 'Edo' }
  ],
  kenya: [
    { value: 'nairobi', label: 'Nairobi' },
    { value: 'mombasa', label: 'Mombasa' },
    { value: 'kisumu', label: 'Kisumu' },
    { value: 'nakuru', label: 'Nakuru' },
    { value: 'eldoret', label: 'Uasin Gishu (Eldoret)' },
    { value: 'thika', label: 'Kiambu (Thika)' },
    { value: 'malindi', label: 'Kilifi (Malindi)' },
    { value: 'garissa', label: 'Garissa' },
    { value: 'kakamega', label: 'Kakamega' }
  ],
  'south-africa': [
    { value: 'gauteng', label: 'Gauteng' },
    { value: 'western-cape', label: 'Western Cape' },
    { value: 'kwazulu-natal', label: 'KwaZulu-Natal' },
    { value: 'eastern-cape', label: 'Eastern Cape' },
    { value: 'limpopo', label: 'Limpopo' },
    { value: 'mpumalanga', label: 'Mpumalanga' },
    { value: 'north-west', label: 'North West' },
    { value: 'free-state', label: 'Free State' },
    { value: 'northern-cape', label: 'Northern Cape' }
  ],
  other: []
};

// Terrain types
const TERRAIN_TYPES = [
  { value: 'flat', label: 'Flat' },
  { value: 'sloped', label: 'Sloped' },
  { value: 'hilly', label: 'Hilly' },
  { value: 'rocky', label: 'Rocky' },
  { value: 'waterfront', label: 'Waterfront' },
  { value: 'wetland', label: 'Wetland' }
];

// Size units
const SIZE_UNITS: { value: AreaUnit; label: string }[] = [
  { value: 'sq-m', label: 'Square Meters' },
  { value: 'sq-ft', label: 'Square Feet' },
  { value: 'acres', label: 'Acres' },
  { value: 'hectare', label: 'Hectares' },
];

export function LocationPlotForm() {
  const { control, watch, setValue } = useFormContext<ProjectFormValues>();
  
  // Watch plot size unit to provide appropriate guidance
  const plotSizeUnit = watch('plotSizeUnit');
  
  // Watch country to show conditional regions
  const selectedCountry = watch('country');
  
  // Helper function to get size guidance based on unit
  const getSizeGuidance = (unit: string) => {
    switch(unit) {
      case 'sq-m':
        return 'Standard residential plot sizes in Ghana range from 370-740 sq meters';
      case 'sq-ft':
        return 'Standard residential plot sizes in Ghana range from 4,000-8,000 sq feet';
      case 'acres':
        return 'For reference, 1 acre = 4,047 sq meters or 43,560 sq feet';
      case 'hectares':
        return 'For reference, 1 hectare = 10,000 sq meters or 2.47 acres';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-8">
      {/* Address Section */}
      <div className="space-y-8">
        <FormField
          control={control}
          name="location"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-lg font-semibold text-slate-900 dark:text-white font-inter">
                Where will your project be built?
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#2B6CB0]" />
                  <Input 
                    placeholder="Enter the full address or location" 
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
          name="country"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-lg font-semibold text-slate-900 dark:text-white font-inter">
                Which country?
              </FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  // Reset region when country changes
                  setValue('region', '');
                }} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="h-14 text-base font-opensans border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:border-[#2B6CB0] dark:focus:border-[#2B6CB0] focus:ring-4 focus:ring-[#2B6CB0]/20 transition-all duration-300 shadow-sm hover:shadow-md">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-red-600 font-opensans text-sm" />
            </FormItem>
          )}
        />

        {/* Conditional Region Field */}
        {selectedCountry && selectedCountry !== 'other' && (
          <FormField
            control={control}
            name="region"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-lg font-semibold text-slate-900 dark:text-white font-inter">
                  Which region/state?
                </FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-14 text-base font-opensans border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:border-[#2B6CB0] dark:focus:border-[#2B6CB0] focus:ring-4 focus:ring-[#2B6CB0]/20 transition-all duration-300 shadow-sm hover:shadow-md">
                      <SelectValue placeholder="Select your region/state" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {REGIONS_BY_COUNTRY[selectedCountry as keyof typeof REGIONS_BY_COUNTRY]?.map((region: { value: string; label: string }) => (
                      <SelectItem key={region.value} value={region.value}>
                        {region.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-600 font-opensans text-sm" />
              </FormItem>
            )}
          />
        )}

        {/* Custom region input for "Other" countries */}
        {selectedCountry === 'other' && (
          <FormField
            control={control}
            name="region"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-lg font-semibold text-slate-900 dark:text-white font-inter">
                  Region/State
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your region or state" 
                    {...field} 
                    className="h-14 text-base font-opensans border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:border-[#2B6CB0] dark:focus:border-[#2B6CB0] focus:ring-4 focus:ring-[#2B6CB0]/20 transition-all duration-300 shadow-sm hover:shadow-md placeholder:text-slate-500"
                  />
                </FormControl>
                <FormMessage className="text-red-600 font-opensans text-sm" />
              </FormItem>
            )}
          />
        )}
      </div>

      {/* Plot Details Section */}
      <div className="bg-[#2B6CB0]/5 dark:bg-[#2B6CB0]/10 rounded-xl p-6 space-y-6 border border-[#2B6CB0]/20 dark:border-[#2B6CB0]/30">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-[#2B6CB0] rounded-xl flex items-center justify-center">
            <Ruler className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white font-inter">Plot Information</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="plotSize"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-base font-semibold text-slate-900 dark:text-white font-inter">
                  Plot Size
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
            name="plotSizeUnit"
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
        
        {/* Size guidance */}
        {plotSizeUnit && (
          <div className="bg-[#ED8936]/10 border border-[#ED8936]/30 rounded-xl p-4">
            <p className="text-sm text-[#ED8936] dark:text-[#ED8936] font-medium font-opensans">
              💡 {getSizeGuidance(plotSizeUnit)}
            </p>
          </div>
        )}
      </div>

      {/* Additional Details */}
      <div className="space-y-8">
        <FormField
          control={control}
          name="terrain"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-lg font-semibold text-slate-900 dark:text-white font-inter">
                What's the terrain like?
                <span className="text-base font-normal text-slate-500 ml-2 font-opensans">(optional)</span>
              </FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="h-14 text-base font-opensans border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:border-[#2B6CB0] dark:focus:border-[#2B6CB0] focus:ring-4 focus:ring-[#2B6CB0]/20 transition-all duration-300 shadow-sm hover:shadow-md">
                    <SelectValue placeholder="Select terrain type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TERRAIN_TYPES.map((terrain) => (
                    <SelectItem key={terrain.value} value={terrain.value}>
                      {terrain.label}
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
          name="nearbyLandmarks"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-lg font-semibold text-slate-900 dark:text-white font-inter">
                Any notable landmarks nearby?
                <span className="text-base font-normal text-slate-500 ml-2 font-opensans">(optional)</span>
              </FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Schools, hospitals, markets, main roads, shopping centers..." 
                  {...field} 
                  className="min-h-[120px] text-base font-opensans leading-relaxed border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:border-[#2B6CB0] dark:focus:border-[#2B6CB0] focus:ring-4 focus:ring-[#2B6CB0]/20 transition-all duration-300 resize-none shadow-sm hover:shadow-md placeholder:text-slate-500"
                />
              </FormControl>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-opensans">
                This helps us plan access routes and understand your location better
              </p>
              <FormMessage className="text-red-600 font-opensans text-sm" />
            </FormItem>
          )}
        />
      </div>
      
    </div>
  );
}
