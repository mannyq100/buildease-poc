/**
 * StatCard component for displaying statistics across the application
 */
import React from 'react';
import { CardDescription, CardHeader, CardContent, CardTitle, Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { StatCardProps } from '@/types/ui';

// Valid color schemes that have explicit mappings
type ValidColorScheme = 'blue' | 'green' | 'amber' | 'red' | 'purple';

export function StatCard({
  title,
  icon,
  value,
  description,
  subtitle, // Add support for subtitle as an alternative to description
  change,
  colorScheme = 'blue',
  className,
}: StatCardProps) {
  // Helper to determine if change is positive, negative, or neutral
  const getChangeType = () => {
    if (!change) return 'neutral';
    return change.startsWith('+') ? 'positive' : change.startsWith('-') ? 'negative' : 'neutral';
  };
  
  // Use subtitle as fallback for description for backward compatibility
  const displayDescription = description || subtitle;
  
  // Handle legacy color scheme names with safe type casting
  const normalizedColorScheme = ((): ValidColorScheme => {
    // Map legacy color names to our standardized palette
    if (colorScheme === 'emerald') return 'green';
    if (colorScheme === 'orange') return 'amber';
    if (colorScheme === 'indigo') return 'purple';
    
    // Check if the color is one of our valid schemes
    if (
      colorScheme === 'blue' || 
      colorScheme === 'green' || 
      colorScheme === 'amber' || 
      colorScheme === 'red' || 
      colorScheme === 'purple'
    ) {
      return colorScheme as ValidColorScheme;
    }
    
    // Default fallback for unknown colors
    return 'blue';
  })();
  
  // Color mappings for different parts based on the colorScheme
  const colors = {
    blue: {
      iconBg: 'bg-blue-100 dark:bg-blue-900/40',
      iconColor: 'text-blue-600 dark:text-blue-400',
      valueColor: 'text-blue-600 dark:text-blue-400',
    },
    green: {
      iconBg: 'bg-green-100 dark:bg-green-900/40',
      iconColor: 'text-green-600 dark:text-green-400',
      valueColor: 'text-green-600 dark:text-green-400',
    },
    amber: {
      iconBg: 'bg-amber-100 dark:bg-amber-900/40',
      iconColor: 'text-amber-600 dark:text-amber-400',
      valueColor: 'text-amber-600 dark:text-amber-400',
    },
    red: {
      iconBg: 'bg-red-100 dark:bg-red-900/40',
      iconColor: 'text-red-600 dark:text-red-400',
      valueColor: 'text-red-600 dark:text-red-400',
    },
    purple: {
      iconBg: 'bg-purple-100 dark:bg-purple-900/40',
      iconColor: 'text-purple-600 dark:text-purple-400',
      valueColor: 'text-purple-600 dark:text-purple-400',
    },
  };

  const getChangeClasses = () => {
    const type = getChangeType();
    if (type === 'positive') {
      return 'text-green-600 dark:text-green-400';
    } else if (type === 'negative') {
      return 'text-red-600 dark:text-red-400';
    }
    return 'text-gray-500 dark:text-gray-400';
  };

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md',
        'bg-blue-50/50 dark:bg-blue-950/10', // Light blue background for all cards
        className
      )}
    >
      <CardHeader className="pb-2 pt-5 px-4 sm:px-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg font-medium text-gray-700 dark:text-gray-200">
            {title}
          </CardTitle>
          {icon && (
            <div className={cn(
              'flex items-center justify-center rounded-full w-8 h-8 sm:w-10 sm:h-10',
              colors[normalizedColorScheme].iconBg
            )}>
              <span className={cn('h-4 w-4 sm:h-5 sm:w-5', colors[normalizedColorScheme].iconColor)}>
                {icon}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-4 px-4 sm:px-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4">
          <div className="flex flex-col gap-1">
            <p className={cn(
              'text-xl sm:text-2xl font-semibold',
              !change && colors[normalizedColorScheme].valueColor
            )}>
              {value}
            </p>
            {displayDescription && (
              <CardDescription className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {displayDescription}
              </CardDescription>
            )}
          </div>
          
          {change && (
            <span
              className={cn(
                'text-xs sm:text-sm font-medium flex items-center gap-1',
                getChangeClasses()
              )}
            >
              {change}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}