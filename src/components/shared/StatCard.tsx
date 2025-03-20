import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * StatCard component for displaying statistics and metrics.
 * Follows Buildese UI design principles:
 * - Card-based UI with subtle shadows
 * - Clear visual feedback
 * - Consistent spacing
 * - Modern, aesthetic look
 */
export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  subtitle?: string;
  colorScheme?: 'blue' | 'green' | 'amber' | 'red' | 'gray' | 'purple';
  trend?: {
    value: number;
    isPositive: boolean;
  };
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
      trendPositive: 'text-blue-600 dark:text-blue-400',
      trendNegative: 'text-blue-600 dark:text-blue-400',
      trendBg: 'bg-blue-50 dark:bg-blue-900/20'
    },
    green: {
      iconBg: 'bg-green-100 dark:bg-green-900/40',
      iconColor: 'text-green-600 dark:text-green-400',
      valueColor: 'text-green-700 dark:text-green-300',
      trendPositive: 'text-green-600 dark:text-green-400',
      trendNegative: 'text-red-600 dark:text-red-400',
      trendBg: 'bg-green-50 dark:bg-green-900/20'
    },
    amber: {
      iconBg: 'bg-amber-100 dark:bg-amber-900/40',
      iconColor: 'text-amber-600 dark:text-amber-400',
      valueColor: 'text-amber-700 dark:text-amber-300',
      trendPositive: 'text-amber-600 dark:text-amber-400',
      trendNegative: 'text-amber-600 dark:text-amber-400',
      trendBg: 'bg-amber-50 dark:bg-amber-900/20'
    },
    red: {
      iconBg: 'bg-red-100 dark:bg-red-900/40',
      iconColor: 'text-red-600 dark:text-red-400',
      valueColor: 'text-red-700 dark:text-red-300',
      trendPositive: 'text-green-600 dark:text-green-400',
      trendNegative: 'text-red-600 dark:text-red-400',
      trendBg: 'bg-red-50 dark:bg-red-900/20'
    },
    gray: {
      iconBg: 'bg-gray-100 dark:bg-gray-800',
      iconColor: 'text-gray-600 dark:text-gray-400',
      valueColor: 'text-gray-700 dark:text-gray-300',
      trendPositive: 'text-gray-600 dark:text-gray-400',
      trendNegative: 'text-gray-600 dark:text-gray-400',
      trendBg: 'bg-gray-50 dark:bg-gray-800'
    },
    purple: {
      iconBg: 'bg-purple-100 dark:bg-purple-900/40',
      iconColor: 'text-purple-600 dark:text-purple-400',
      valueColor: 'text-purple-700 dark:text-purple-300',
      trendPositive: 'text-purple-600 dark:text-purple-400',
      trendNegative: 'text-purple-600 dark:text-purple-400',
      trendBg: 'bg-purple-50 dark:bg-purple-900/20'
    }
  };

  // Ensure we use a valid color scheme that exists in our colors object
  const colorConfig = colors[colorScheme] || colors.blue;

  return (
    <div className={cn('w-full', className)}>
      <Card className={cn('p-4 h-full min-h-[140px] flex flex-col justify-between', 'bg-blue-50/50 dark:bg-blue-950/10')}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            {icon && (
              <div className={cn('p-2 rounded-lg', colorConfig.iconBg)}>
                <span className={colorConfig.iconColor}>{icon}</span>
              </div>
            )}
            <h3 className="text-sm font-medium text-muted-foreground flex-grow ml-2">
              {title}
            </h3>
            {trend && (
              <div className={cn(
                'flex items-center gap-1 px-2 py-1 rounded text-sm font-medium ml-2',
                colorConfig.trendBg,
                trend.isPositive ? colorConfig.trendPositive : colorConfig.trendNegative
              )}>
                {trend.isPositive ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                {Math.abs(trend.value)}%
              </div>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className={cn(
              'text-2xl font-semibold tracking-tight truncate max-w-[150px]',
              colorConfig.valueColor
            )}>
              {value}
            </span>
            {subtitle && (
              <span className="text-sm text-muted-foreground truncate">
                {subtitle}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}