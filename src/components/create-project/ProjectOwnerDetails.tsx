/**
 * ProjectOwnerDetails Component
 * 
 * Handles the project owner information section
 * Includes toggle for different owner and conditional owner fields
 */
import React from 'react';
import { User } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CustomSwitch } from '@/components/ui/custom-switch';
import { Control } from 'react-hook-form';
import { ProjectFormValues } from '@/pages/CreateProject';
import { ErrorBoundary } from '@/components/ui/error-boundary';

interface ProjectOwnerDetailsProps {
  control: Control<ProjectFormValues>;
  isDifferentOwner: boolean;
  setIsDifferentOwner: (value: boolean) => void;
  className?: string;
}

/**
 * ProjectOwnerDetails component
 * Allows users to specify if the project has a different owner
 * and collect owner details if needed
 */
export function ProjectOwnerDetails({ 
  control, 
  isDifferentOwner, 
  setIsDifferentOwner,
  className = '' 
}: ProjectOwnerDetailsProps) {
  return (
    <div className={`space-y-6 ${className}`}>
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
          <ErrorBoundary fallback={<div className="p-2 border border-red-300 bg-red-50 text-red-800 rounded-md text-sm">
            Error loading switch
          </div>}>
            <CustomSwitch
              id="different-owner"
              checked={isDifferentOwner}
              onCheckedChange={setIsDifferentOwner}
            />
          </ErrorBoundary>
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
                        placeholder="Enter owner's full name" 
                        {...field} 
                        className="h-12"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base font-semibold text-slate-900 dark:text-white font-inter">
                      Owner Email
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="Enter owner's email address" 
                        {...field} 
                        className="h-12"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base font-semibold text-slate-900 dark:text-white font-inter">
                      Owner Phone
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="tel" 
                        placeholder="Enter owner's phone number" 
                        {...field} 
                        className="h-12"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
