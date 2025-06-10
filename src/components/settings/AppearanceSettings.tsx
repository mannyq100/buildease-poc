/**
 * AppearanceSettings component
 * Handles theme and UI density preferences
 */
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import type { SettingsTabProps } from '@/types/settings';

export function AppearanceSettings({ className }: SettingsTabProps) {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    {
      value: 'light',
      label: 'Light',
      description: 'Bright mode with light backgrounds',
      icon: Sun,
      iconColor: 'text-amber-500',
      preview: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
    },
    {
      value: 'dark',
      label: 'Dark',
      description: 'Dark mode with reduced brightness',
      icon: Moon,
      iconColor: 'text-blue-400',
      preview: 'bg-slate-900 border border-slate-700'
    },
    {
      value: 'system',
      label: 'System',
      description: 'Follow your device\'s theme setting',
      icon: Laptop,
      iconColor: 'text-slate-500',
      preview: 'bg-gradient-to-r from-white to-slate-900 border border-slate-200'
    }
  ];

  const densityOptions = [
    {
      value: 'comfortable',
      label: 'Comfortable',
      description: 'Standard spacing between elements',
      preview: (
        <div className="flex flex-col items-center gap-4 w-4/5">
          <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-700"></div>
          <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-700"></div>
        </div>
      )
    },
    {
      value: 'compact',
      label: 'Compact',
      description: 'Reduced spacing for more content',
      preview: (
        <div className="flex flex-col items-center gap-2 w-4/5">
          <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700"></div>
          <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700"></div>
          <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700"></div>
        </div>
      )
    }
  ];

  return (
    <Card className={`border-0 shadow-md dark:shadow-slate-900/30 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Appearance Settings</CardTitle>
        <CardDescription>
          Customize the look and feel of the application
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Theme Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-900/30">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
              Theme Preference
            </h3>
            <p className="text-sm text-blue-600/90 dark:text-blue-400/90">
              Choose how BuildEase looks to you
            </p>
          </div>
          
          <div className="space-y-3">
            <RadioGroup 
              defaultValue={theme} 
              onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')} 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {themeOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <div 
                    key={option.value}
                    className="flex flex-col space-y-2 rounded-lg border p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors dark:border-gray-700 cursor-pointer relative"
                  >
                    <RadioGroupItem 
                      value={option.value} 
                      id={`theme-${option.value}`} 
                      className="absolute right-4 top-4" 
                    />
                    <div className={`h-20 sm:h-24 rounded-md ${option.preview} flex items-center justify-center shadow-sm overflow-hidden`}>
                      {option.value === 'system' ? (
                        <div className="flex items-center gap-2">
                          <Sun size={20} className="text-amber-500" />
                          <Laptop size={24} className="text-slate-500" />
                          <Moon size={20} className="text-blue-400" />
                        </div>
                      ) : (
                        <IconComponent size={28} className={option.iconColor} />
                      )}
                    </div>
                    <Label 
                      htmlFor={`theme-${option.value}`} 
                      className="flex flex-col gap-1 font-medium cursor-pointer"
                    >
                      <span className="text-sm sm:text-base">{option.label}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                        {option.description}
                      </span>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>
          
          <Separator className="my-6" />
          
          {/* UI Density Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-medium mb-2">UI Density</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Adjust the spacing and density of UI elements
              </p>
            </div>
            
            <RadioGroup 
              defaultValue="comfortable" 
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {densityOptions.map((option) => (
                <div 
                  key={option.value}
                  className="flex flex-col space-y-2 rounded-lg border p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors dark:border-gray-700 cursor-pointer relative"
                >
                  <RadioGroupItem 
                    value={option.value} 
                    id={`density-${option.value}`} 
                    className="absolute right-4 top-4" 
                  />
                  <div className="h-16 sm:h-20 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
                    {option.preview}
                  </div>
                  <Label 
                    htmlFor={`density-${option.value}`} 
                    className="flex flex-col gap-1 font-medium cursor-pointer"
                  >
                    <span className="text-sm sm:text-base">{option.label}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                      {option.description}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          {/* Save Button */}
          <div className="pt-4">
            <Button 
              variant="default" 
              className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700 w-full sm:w-auto"
            >
              Save Appearance Settings
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}