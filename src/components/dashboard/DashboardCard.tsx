import React, { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { H3, Small } from '@/components/ui/typography';

export type CardVariant = 'metric' | 'action' | 'chart' | 'status';
export type CardAccent = 'blue' | 'green' | 'amber' | 'purple' | 'red' | 'indigo' | 'none';

interface DashboardCardProps {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  variant?: CardVariant;
  accent?: CardAccent;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  isLoading?: boolean;
  minHeight?: string;
  headerSlot?: ReactNode;
  footerSlot?: ReactNode;
  padding?: 'default' | 'large' | 'compact' | 'none';
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  subtitle,
  icon,
  variant = 'metric',
  accent = 'none',
  className,
  children,
  onClick,
  isLoading = false,
  minHeight = 'min-h-[140px]',
  headerSlot,
  footerSlot,
  padding = 'default',
}) => {
  const isDarkMode = document.documentElement.classList.contains('dark');

  // Padding configuration
  const paddingConfig = {
    default: { header: 'p-6 pb-3', content: 'px-6 pb-6' },
    large: { header: 'p-8 pb-4', content: 'px-8 pb-8' },
    compact: { header: 'p-4 pb-2', content: 'px-4 pb-4' },
    none: { header: 'p-0', content: 'p-0' }
  };

  // Base styles for all cards
  const baseStyles = cn(
    "overflow-hidden transition-all duration-200",
    minHeight,
    isDarkMode 
      ? "bg-slate-800 border-slate-700 shadow-md shadow-slate-900/10" 
      : "bg-white border-gray-200 shadow-sm",
    onClick ? "cursor-pointer" : "",
    className
  );

  // Variant-specific styles
  const variantStyles = {
    metric: cn(
      "border",
      isDarkMode ? "hover:border-blue-700/50" : "hover:border-blue-100",
      accent === 'blue' && (isDarkMode ? "border-l-4 border-l-blue-500" : "border-l-4 border-l-blue-500"),
      accent === 'green' && (isDarkMode ? "border-l-4 border-l-green-500" : "border-l-4 border-l-green-500"),
      accent === 'amber' && (isDarkMode ? "border-l-4 border-l-amber-500" : "border-l-4 border-l-amber-500"),
      accent === 'purple' && (isDarkMode ? "border-l-4 border-l-purple-500" : "border-l-4 border-l-purple-500"),
      accent === 'red' && (isDarkMode ? "border-l-4 border-l-red-500" : "border-l-4 border-l-red-500"),
      accent === 'indigo' && (isDarkMode ? "border-l-4 border-l-indigo-500" : "border-l-4 border-l-indigo-500"),
      onClick && (isDarkMode ? "hover:bg-slate-750 hover:shadow-lg" : "hover:bg-gray-50 hover:shadow-md"),
    ),
    action: cn(
      "border-2",
      isDarkMode ? "border-slate-700 hover:border-blue-700/50" : "border-gray-100 hover:border-blue-200",
      "hover:-translate-y-1 hover:shadow-md",
      "transition-transform"
    ),
    chart: cn(
      "border",
      isDarkMode ? "border-slate-700" : "border-gray-200",
      onClick && (isDarkMode ? "hover:bg-slate-750 hover:shadow-lg" : "hover:bg-gray-50 hover:shadow-md"),
      "p-0 overflow-hidden", // No padding for chart container
    ),
    status: cn(
      "border",
      accent === 'blue' && (isDarkMode ? "bg-blue-900/20 border-blue-800/30" : "bg-blue-50 border-blue-200"),
      accent === 'green' && (isDarkMode ? "bg-green-900/20 border-green-800/30" : "bg-green-50 border-green-200"),
      accent === 'amber' && (isDarkMode ? "bg-amber-900/20 border-amber-800/30" : "bg-amber-50 border-amber-200"),
      accent === 'red' && (isDarkMode ? "bg-red-900/20 border-red-800/30" : "bg-red-50 border-red-200"),
      accent === 'purple' && (isDarkMode ? "bg-purple-900/20 border-purple-800/30" : "bg-purple-50 border-purple-200"),
      accent === 'indigo' && (isDarkMode ? "bg-indigo-900/20 border-indigo-800/30" : "bg-indigo-50 border-indigo-200"),
      accent === 'none' && (isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"),
    ),
  };

  // Get appropriate padding based on variant and padding prop
  const headerPadding = variant === 'chart' ? 'p-4 pb-2' : paddingConfig[padding].header;
  const contentPadding = variant === 'chart' ? 'p-0' : paddingConfig[padding].content;

  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        whileHover={onClick ? { scale: 1.01 } : {}}
        onClick={onClick}
        className={cn(baseStyles, variantStyles[variant])}
      >
        {/* Header section - conditionally rendered */}
        {(title || icon || headerSlot) && (
          <div className={cn("flex items-center justify-between", headerPadding)}>
            <div className="flex items-center gap-3">
              {icon && <div className="text-primary dark:text-primary-400">{icon}</div>}
              <div className="space-y-1">
                {title && (
                  <H3 className="font-medium text-gray-900 dark:text-white text-[15px]">{title}</H3>
                )}
                {subtitle && (
                  <Small className="text-gray-500 dark:text-gray-400">{subtitle}</Small>
                )}
              </div>
            </div>
            {headerSlot}
          </div>
        )}

        {/* Main content */}
        <div className={cn(contentPadding, 'space-y-4', (title || icon || headerSlot) && 'pt-0', isLoading && "opacity-60")}>
          {children}
        </div>

        {/* Optional footer */}
        {footerSlot && (
          <div className={cn(paddingConfig[padding].content.replace('pb-', 'px-'), "py-4 border-t bg-gray-50 dark:bg-slate-800/80 dark:border-slate-700")}>
            {footerSlot}
          </div>
        )}
      </m.div>
    </LazyMotion>
  );
};

export default DashboardCard; 