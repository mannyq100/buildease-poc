/**
 * ProjectDetailsForm.tsx
 * First step of the project creation wizard
 * Collects basic project information with real-time validation
 */
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { CreateProjectFormValues } from '../../pages/CreateProject';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Building, Home, Store, Hammer, User } from 'lucide-react';
import { ProjectInspirationImages } from './ProjectInspirationImages';


// Project type options with better icons (memoized to prevent re-creation)
const PROJECT_TYPES = [
  {
    value: 'residential-single',
    label: 'Single Family Home',
    description: 'Individual house for one family',
    icon: <Home className="h-5 w-5" />
  },
  {
    value: 'residential-multi',
    label: 'Multi-Family Building',
    description: 'Apartment or duplex building',
    icon: <Building className="h-5 w-5" />
  },
  {
    value: 'commercial',
    label: 'Commercial Building',
    description: 'Office, retail, or business space',
    icon: <Store className="h-5 w-5" />
  },
  {
    value: 'renovation',
    label: 'Renovation Project',
    description: 'Remodeling existing structure',
    icon: <Hammer className="h-5 w-5" />
  }
] as const;

function ProjectDetailsFormComponent() {
  const { control, watch } = useFormContext<CreateProjectFormValues>();
  const [isDifferentOwner, setIsDifferentOwner] = useState(false);
  const selectedType = watch('projectType');

  return (
    <div className="space-y-8">
      {/* Project Name */}
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel className="text-lg font-semibold text-slate-900 dark:text-white font-inter">
              What would you like to name your project?
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="e.g., My Dream Home, Modern Office Building" 
                {...field} 
                className="h-14 text-base font-opensans border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:border-[#2B6CB0] dark:focus:border-[#2B6CB0] focus:ring-4 focus:ring-[#2B6CB0]/20 transition-all duration-300 shadow-sm hover:shadow-md placeholder:text-slate-500"
              />
            </FormControl>
            <FormMessage className="text-red-600 font-opensans text-sm" />
          </FormItem>
        )}
      />

      {/* Project Description */}
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel className="text-lg font-semibold text-slate-900 dark:text-white font-inter">
              Project Description
              <span className="text-base font-normal text-slate-500 ml-2 font-opensans">(optional)</span>
            </FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Tell us about your vision, requirements, or inspiration..." 
                {...field} 
                className="min-h-[120px] text-base font-opensans leading-relaxed border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:border-[#2B6CB0] dark:focus:border-[#2B6CB0] focus:ring-4 focus:ring-[#2B6CB0]/20 transition-all duration-300 resize-none shadow-sm hover:shadow-md placeholder:text-slate-500"
              />
            </FormControl>
            <FormMessage className="text-red-600 font-opensans text-sm" />
          </FormItem>
        )}
      />

      {/* Project Type */}
      <FormField
        control={control}
        name="projectType"
        render={({ field }) => (
          <FormItem className="space-y-5">
            <FormLabel className="text-lg font-semibold text-slate-900 dark:text-white font-inter">
              What type of project are you building?
            </FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {PROJECT_TYPES.map((type) => (
                  <div key={type.value} className="relative">
                    <RadioGroupItem 
                      value={type.value} 
                      id={`project-type-${type.value}`} 
                      className="peer sr-only"
                    />
                    <Label 
                      htmlFor={`project-type-${type.value}`}
                      className={`flex items-start gap-4 p-5 border-2 cursor-pointer transition-all duration-300 rounded-xl shadow-sm hover:shadow-md bg-white dark:bg-slate-800 ${
                        selectedType === type.value
                          ? 'border-[#2B6CB0] bg-[#2B6CB0]/5 dark:bg-[#2B6CB0]/10 shadow-md'
                          : 'border-slate-300 dark:border-slate-600 hover:border-[#2B6CB0]/50'
                      }`}
                    >
                      {/* Radio Button Circle */}
                      <div className={`relative flex-shrink-0 w-5 h-5 rounded-full border-2 mt-0.5 transition-all duration-200 ${
                        selectedType === type.value
                          ? 'border-[#2B6CB0] bg-[#2B6CB0]'
                          : 'border-slate-400 dark:border-slate-500'
                      }`}>
                        {selectedType === type.value && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>

                      {/* Icon */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                        selectedType === type.value
                          ? 'bg-[#2B6CB0] text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}>
                        {React.cloneElement(type.icon, { className: "h-6 w-6" })}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-1 font-inter">
                          {type.label}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-opensans leading-relaxed">
                          {type.description}
                        </p>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage className="text-red-600 font-opensans text-sm" />
          </FormItem>
        )}
      />

      {/* Owner Details Toggle */}
      <div className="border-t border-slate-200 dark:border-slate-600 pt-8">
        <div className="flex items-center justify-between mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
          <div>
            <Label htmlFor="different-owner" className="text-lg font-semibold text-slate-900 dark:text-white font-inter">
              Different Project Owner
            </Label>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-opensans">
              Enable if you're creating this project for someone else
            </p>
          </div>
          <Switch
            id="different-owner"
            checked={isDifferentOwner}
            onCheckedChange={setIsDifferentOwner}
            className="data-[state=checked]:bg-[#2B6CB0]"
          />
        </div>

        {/* Conditional Owner Details */}
        {isDifferentOwner && (
          <div className="space-y-6 p-6 bg-[#2B6CB0]/5 dark:bg-[#2B6CB0]/10 rounded-xl border-2 border-[#2B6CB0]/20 dark:border-[#2B6CB0]/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-[#2B6CB0] rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white font-inter">
                Owner Details
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={control}
                name="owner"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base font-semibold text-slate-900 dark:text-white font-inter">
                      Owner Name
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Full name" 
                        {...field} 
                        className="h-12 text-base font-opensans border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:border-[#2B6CB0] dark:focus:border-[#2B6CB0] focus:ring-4 focus:ring-[#2B6CB0]/20 transition-all duration-300 shadow-sm hover:shadow-md placeholder:text-slate-500"
                      />
                    </FormControl>
                    <FormMessage className="text-red-600 font-opensans text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base font-semibold text-slate-900 dark:text-white font-inter">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="email@example.com" 
                        type="email"
                        {...field} 
                        className="h-12 text-base font-opensans border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:border-[#2B6CB0] dark:focus:border-[#2B6CB0] focus:ring-4 focus:ring-[#2B6CB0]/20 transition-all duration-300 shadow-sm hover:shadow-md placeholder:text-slate-500"
                      />
                    </FormControl>
                    <FormMessage className="text-red-600 font-opensans text-sm" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base font-semibold text-slate-900 dark:text-white font-inter">
                    Phone Number
                    <span className="text-base font-normal text-slate-500 ml-2 font-opensans">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="+233 50 123 4567" 
                      type="tel"
                      {...field} 
                      className="h-12 text-base font-opensans border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:border-[#2B6CB0] dark:focus:border-[#2B6CB0] focus:ring-4 focus:ring-[#2B6CB0]/20 transition-all duration-300 shadow-sm hover:shadow-md placeholder:text-slate-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-600 font-opensans text-sm" />
                </FormItem>
              )}
            />
          </div>
        )}
      </div>
      
      {/* Project Inspiration Images */}
      <div className="border-t border-slate-200 dark:border-slate-600 pt-8 mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-[#ED8936] rounded-lg flex items-center justify-center">
            <Building className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white font-inter">
            Project Inspiration Images
          </h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 font-opensans">
          Upload images that inspire your project. These will help contractors understand your vision.
        </p>
        <ProjectInspirationImages control={control} />
      </div>
    </div>
  );
}

// Memoized export to prevent unnecessary re-renders
export const ProjectDetailsForm = React.memo(ProjectDetailsFormComponent);
