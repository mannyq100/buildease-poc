/**
 * ProjectTypeSelector Component
 * 
 * A component for selecting project type with visual options
 * Part of the project creation workflow
 */
import React from 'react';
import { Building, Home, Store, Hammer } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { CustomRadioGroup } from '@/components/ui/custom-radio-group';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Control } from 'react-hook-form';
import { ProjectFormValues } from '@/pages/CreateProject';

// Project type options with icons
const PROJECT_TYPE_OPTIONS = [
  {
    value: 'residential',
    label: 'Residential',
    description: 'Home renovation or new construction',
    icon: <Home className="h-5 w-5" />
  },
  {
    value: 'commercial',
    label: 'Commercial',
    description: 'Office, retail, or restaurant spaces',
    icon: <Building className="h-5 w-5" />
  },
  {
    value: 'retail',
    label: 'Retail',
    description: 'Store or shopping center projects',
    icon: <Store className="h-5 w-5" />
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Other construction projects',
    icon: <Hammer className="h-5 w-5" />
  }
];

interface ProjectTypeSelectorProps {
  control: Control<ProjectFormValues>;
  className?: string;
}

/**
 * ProjectTypeSelector component
 * Allows users to select the type of construction project
 */
export function ProjectTypeSelector({ control, className = '' }: ProjectTypeSelectorProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white font-inter">
        Project Type
      </h3>
      
      <FormField
        control={control}
        name="projectType"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel className="sr-only">Project Type</FormLabel>
            <FormControl>
              <ErrorBoundary fallback={<div className="p-4 border border-red-300 bg-red-50 text-red-800 rounded-md">
                There was an error loading the project type selector. Please try refreshing the page.
              </div>}>
                <CustomRadioGroup
                  options={PROJECT_TYPE_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                />
              </ErrorBoundary>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
