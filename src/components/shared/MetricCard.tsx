import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { TrendingUp, AlertCircle } from 'lucide-react';

interface MetricCardProps {
  /**
   * Label for the metric
   */
  label: string;
  
  /**
   * Value to display prominently
   */
  value: string;
  
  /**
   * Icon to display
   */
  icon: React.ReactNode;
  
  /**
   * Additional text to display below the value
   */
  subtext?: string;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Color scheme for the card
   */
  colorScheme?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
  
  /**
   * Trend information - can be a simple string or detailed object
   */
  trend?: 'positive' | 'negative' | 'warning' | 'normal' | {
    value: number;
    isPositive: boolean;
    label?: string;
  };
}

/**
 * Enhanced metric card component with animations
 * Consolidates functionality from multiple metric card implementations
 */
export function MetricCard({ 
  icon, 
  label, 
  value, 
  subtext,
  className,
  colorScheme = 'blue',
  trend = 'normal'
}: MetricCardProps) {
  // Check for dark mode
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  // Determine if trend is a string or object
  const isTrendObject = typeof trend !== 'string';
  
  // Define color mappings based on colorScheme
  const colors = {
    blue: {
      iconBg: 'bg-blue-100 dark:bg-blue-900/40',
      iconColor: 'text-blue-600 dark:text-blue-400',
      valueColor: 'text-blue-600 dark:text-blue-400',
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-indigo-500',
      border: isDarkMode ? 'border-blue-800/30' : 'border-blue-200',
    },
    green: {
      iconBg: 'bg-green-100 dark:bg-green-900/40',
      iconColor: 'text-green-600 dark:text-green-400',
      valueColor: 'text-green-600 dark:text-green-400',
      gradientFrom: 'from-green-500',
      gradientTo: 'to-emerald-500',
      border: isDarkMode ? 'border-green-800/30' : 'border-green-200',
    },
    amber: {
      iconBg: 'bg-amber-100 dark:bg-amber-900/40',
      iconColor: 'text-amber-600 dark:text-amber-400',
      valueColor: 'text-amber-600 dark:text-amber-400',
      gradientFrom: 'from-amber-500',
      gradientTo: 'to-orange-500',
      border: isDarkMode ? 'border-amber-800/30' : 'border-amber-200',
    },
    red: {
      iconBg: 'bg-red-100 dark:bg-red-900/40',
      iconColor: 'text-red-600 dark:text-red-400',
      valueColor: 'text-red-600 dark:text-red-400',
      gradientFrom: 'from-red-500',
      gradientTo: 'to-rose-500',
      border: isDarkMode ? 'border-red-800/30' : 'border-red-200',
    },
    purple: {
      iconBg: 'bg-purple-100 dark:bg-purple-900/40',
      iconColor: 'text-purple-600 dark:text-purple-400',
      valueColor: 'text-purple-600 dark:text-purple-400',
      gradientFrom: 'from-purple-500',
      gradientTo: 'to-indigo-500',
      border: isDarkMode ? 'border-purple-800/30' : 'border-purple-200',
    },
  };
  
  // Define trend-specific styles
  const trendColors = {
    positive: isDarkMode ? 'text-green-400' : 'text-green-600',
    negative: isDarkMode ? 'text-red-400' : 'text-red-600',
    warning: isDarkMode ? 'text-amber-400' : 'text-amber-600',
    normal: isDarkMode ? 'text-blue-400' : 'text-blue-600',
  };
  
  // Define trend icons
  const trendIcons = {
    positive: <TrendingUp className="text-green-500" />,
    negative: <AlertCircle className="text-red-500" />,
    warning: <AlertCircle className="text-amber-500" />,
    normal: <></>,
  };
  
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        whileHover={{ 
          y: -4,
          transition: { duration: 0.2 }
        }}
      >
        <Card className={cn(
          "overflow-hidden transition-all duration-300 hover:shadow-lg border relative", 
          colors[colorScheme].border,
          className
        )}>
          <div className="absolute top-0 right-0 h-24 w-24 -mr-8 -mt-8 rounded-full opacity-10 blur-xl bg-current"></div>
          <CardContent className="p-5 pb-4">
            <div className="flex items-center space-x-2">
              <div className={`p-1.5 rounded-full ${colors[colorScheme].iconBg} text-primary flex items-center justify-center`}>
                {icon}
              </div>
              <span className="font-medium text-sm">{label}</span>
            </div>
            <div className="mt-3">
              <div className="flex items-end space-x-1.5">
                <div className={`text-2xl font-bold leading-none ${colors[colorScheme].valueColor}`}>{value}</div>
                {isTrendObject ? (
                  <div className={`text-xs font-semibold mb-0.5 ${trendColors[trend.isPositive ? 'positive' : 'negative']}`}>
                    {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                  </div>
                ) : (
                  <div className={`text-xs font-semibold mb-0.5 ${trendColors[trend]}`}>
                    {trendIcons[trend]}
                  </div>
                )}
              </div>
              {subtext && <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtext}</div>}
            </div>
          </CardContent>
        </Card>
      </m.div>
    </LazyMotion>
  );
}