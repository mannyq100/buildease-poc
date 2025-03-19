/**
 * StatCard component for displaying statistics across the application
 */
import React from 'react';
import { CardDescription, CardHeader, CardContent, CardTitle, Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { StatCardProps } from '@/types/ui';

export function StatCard({
  title,
  icon,
  value,
  description,
  change,
  colorScheme = 'blue',
  className,
}: StatCardProps) {
  // Helper to determine if change is positive, negative, or neutral
  const getChangeType = () => {
    if (!change) return 'neutral';
    return change.startsWith('+') ? 'positive' : change.startsWith('-') ? 'negative' : 'neutral';
  };
  
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
  
  // Get change type for styling
  const changeType = getChangeType();
  
  // Change colors
  const changeColors = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-500 dark:text-gray-400',
  };

  return (
    <Card className={cn(
      // Consistent light blue background across all cards
      'bg-blue-50/50 dark:bg-blue-950/10 border-0 shadow-sm',
      // Improved mobile responsiveness with better padding
      'p-0.5 sm:p-1',
      className
    )}>
      <CardHeader className="pb-2 pt-4 px-4 sm:px-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg font-medium text-gray-700 dark:text-gray-200">
            {title}
          </CardTitle>
          {icon && (
            <div className={cn(
              'flex items-center justify-center rounded-full w-8 h-8 sm:w-10 sm:h-10',
              colors[colorScheme].iconBg
            )}>
              <span className={cn('h-4 w-4 sm:h-5 sm:w-5', colors[colorScheme].iconColor)}>
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
              colors[colorScheme].valueColor
            )}>
              {value}
            </p>
            {description && (
              <CardDescription className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {description}
              </CardDescription>
            )}
          </div>
          {change && (
            <div className={cn(
              'flex items-center text-xs sm:text-sm font-medium',
              changeColors[changeType]
            )}>
              {change}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}