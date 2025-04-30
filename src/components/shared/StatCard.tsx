import React from 'react';
import { Card } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/utils/core/ui';

/**
 * StatCard component for displaying statistics and metrics.
 * Follows BuildEase UI design principles:
 * - Card-based UI with subtle shadows
 * - Clear visual feedback
 * - Consistent spacing
 * - Modern, aesthetic look with warm blue primary color (#2B6CB0)
 * - Mobile-first responsive design with touch-friendly elements
 */
export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  subtitle?: string;
  colorScheme?: 'blue' | 'green' | 'amber' | 'red' | 'gray' | 'purple';
  trend?: number | { value: number; isPositive: boolean };
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  subtitle,
  colorScheme = 'blue',
  trend,
  icon,
  className
}: StatCardProps) {

  const colors = {
    blue: {
      iconBg: 'bg-blue-100 dark:bg-blue-900/40',
      iconColor: 'text-blue-600 dark:text-blue-400',
      valueColor: 'text-blue-700 dark:text-blue-300',
      trendPositive: 'text-green-600 dark:text-green-400',
      trendNegative: 'text-red-600 dark:text-red-400',
      trendBg: 'bg-blue-50 dark:bg-blue-900/20',
      cardBg: 'bg-blue-50/50 dark:bg-blue-900/10'
    },
    green: {
      iconBg: 'bg-green-100 dark:bg-green-900/40',
      iconColor: 'text-green-600 dark:text-green-400',
      valueColor: 'text-green-700 dark:text-green-300',
      trendPositive: 'text-green-600 dark:text-green-400',
      trendNegative: 'text-red-600 dark:text-red-400',
      trendBg: 'bg-green-50 dark:bg-green-900/20',
      cardBg: 'bg-green-50/50 dark:bg-green-900/10'
    },
    amber: {
      iconBg: 'bg-amber-100 dark:bg-amber-900/40',
      iconColor: 'text-amber-600 dark:text-amber-400',
      valueColor: 'text-amber-700 dark:text-amber-300',
      trendPositive: 'text-green-600 dark:text-green-400',
      trendNegative: 'text-red-600 dark:text-red-400',
      trendBg: 'bg-amber-50 dark:bg-amber-900/20',
      cardBg: 'bg-amber-50/50 dark:bg-amber-900/10'
    },
    red: {
      iconBg: 'bg-red-100 dark:bg-red-900/40',
      iconColor: 'text-red-600 dark:text-red-400',
      valueColor: 'text-red-700 dark:text-red-300',
      trendPositive: 'text-green-600 dark:text-green-400',
      trendNegative: 'text-red-600 dark:text-red-400',
      trendBg: 'bg-red-50 dark:bg-red-900/20',
      cardBg: 'bg-red-50/50 dark:bg-red-900/10'
    },
    gray: {
      iconBg: 'bg-gray-100 dark:bg-gray-800',
      iconColor: 'text-gray-600 dark:text-gray-400',
      valueColor: 'text-gray-700 dark:text-gray-300',
      trendPositive: 'text-green-600 dark:text-green-400',
      trendNegative: 'text-red-600 dark:text-red-400',
      trendBg: 'bg-gray-50 dark:bg-gray-800',
      cardBg: 'bg-gray-50/50 dark:bg-gray-900/10'
    },
    purple: {
      iconBg: 'bg-purple-100 dark:bg-purple-900/40',
      iconColor: 'text-purple-600 dark:text-purple-400',
      valueColor: 'text-purple-700 dark:text-purple-300',
      trendPositive: 'text-green-600 dark:text-green-400',
      trendNegative: 'text-red-600 dark:text-red-400',
      trendBg: 'bg-purple-50 dark:bg-purple-900/20',
      cardBg: 'bg-purple-50/50 dark:bg-purple-900/10'
    }
  };

  // Ensure we use a valid color scheme that exists in our colors object
  const colorConfig = colors[colorScheme] || colors.blue;

  return (
    <div className={cn('w-full', className)}>
      <Card className={cn(
        'p-3 sm:p-4 h-full min-h-[120px] sm:min-h-[140px] flex flex-col justify-between', 
        colorConfig.cardBg,
        'border-gray-200/70 dark:border-slate-700/30',
        'transition-all duration-200 shadow-sm hover:shadow-md dark:shadow-slate-900/10',
        'touch-manipulation' // Improve touch behavior on mobile
      )}>
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            {icon && (
              <div className={cn(
                'p-1.5 sm:p-2 rounded-lg transition-colors duration-200', 
                colorConfig.iconBg,
                'min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center' // Touch-friendly size
              )}>
                <span className={colorConfig.iconColor}>{icon}</span>
              </div>
            )}
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground flex-grow ml-2">
              {title}
            </h3>
            {trend && (
              <div className={cn(
                'flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded text-xs sm:text-sm font-medium ml-2',
                colorConfig.trendBg,
                typeof trend === 'object' ? (trend.isPositive ? colorConfig.trendPositive : colorConfig.trendNegative) : colorConfig.trendPositive,
                'transition-colors duration-200',
                'min-h-[24px] sm:min-h-[28px]' // Ensure touch-friendly height
              )}>
                {typeof trend === 'object' ? (trend.isPositive ? (
                  <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4" />
                )) : (
                  <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
                )}
                {typeof trend === 'object' ? Math.abs(trend.value) : trend}%
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
            <span className={cn(
              'text-xl sm:text-2xl font-semibold tracking-tight truncate max-w-full sm:max-w-[150px]',
              colorConfig.valueColor,
              'transition-colors duration-200'
            )}>
              {value}
            </span>
            {subtitle && (
              <span className="text-xs sm:text-sm text-muted-foreground truncate mt-0.5 sm:mt-0">
                {subtitle}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-1">
              {description}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}