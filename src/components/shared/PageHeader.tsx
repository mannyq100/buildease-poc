/**
 * PageHeader component for consistent page headers across the application
 */
import React, { useMemo, memo } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { cn, darkModeDetector } from '@/lib/utils';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderAction {
  label: string;
  icon?: React.ReactNode;
  variant?: 'construction' | 'blueprint' | 'default' | 'glow';
  onClick: () => void;
}

export interface PageHeaderProps {
  /**
   * The title of the page
   */
  title: string;
  
  /**
   * Optional subtitle or description
   */
  description?: string;
  
  /**
   * Optional icon to display with title
   */
  icon?: React.ReactNode;
  
  /**
   * Optional actions to display in the header
   */
  actions?: React.ReactNode;
  
  /**
   * Optional class name for custom styling
   */
  className?: string;
}

// Memoize gradient options to avoid recalculation
const themeGradients = {
  blue: {
    light: 'from-[#1E3A8A] to-[#2B6CB0]',
    dark: 'from-blue-900 to-blue-700/90'
  },
  purple: {
    light: 'from-purple-900 to-purple-700',
    dark: 'from-purple-900 to-purple-800/90'
  },
  green: {
    light: 'from-green-900 to-green-700',
    dark: 'from-green-900 to-green-800/90'
  },
  amber: {
    light: 'from-amber-800 to-[#ED8936]',
    dark: 'from-amber-900 to-amber-700/90'
  }
};

// Memoize action button for performance
const ActionButton = memo(({ action }: { action: PageHeaderAction }) => {
  return (
    <Button
      variant={action.variant || 'construction'}
      onClick={action.onClick}
      className={cn(
        "transition-all duration-300 font-medium",
        action.variant === 'construction' 
          ? "bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/40" 
          : action.variant === 'blueprint'
          ? "bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30"
          : action.variant === 'glow'
          ? "bg-[#ED8936] hover:bg-[#DD7926] text-white shadow-lg shadow-black/20"
          : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
      )}
    >
      {action.icon && (
        <span className="mr-2 opacity-90">
          {action.icon}
        </span>
      )}
      <span className="whitespace-nowrap">{action.label}</span>
    </Button>
  );
});

ActionButton.displayName = 'ActionButton';

// Optimized breadcrumb item component
const BreadcrumbItem = memo(({ item, isLast }: { item: Breadcrumb, isLast: boolean }) => {
  return (
    <>
      {!isLast && <ChevronRight className="h-4 w-4 text-white/70" />}
      {item.href ? (
        <a href={item.href} className="text-white/70 hover:text-white transition-colors">
          {item.label}
        </a>
      ) : (
        <span className="text-white/90">{item.label}</span>
      )}
    </>
  );
});

BreadcrumbItem.displayName = 'BreadcrumbItem';

export function PageHeader({
  title,
  description,
  icon,
  actions,
  className
}: PageHeaderProps) {
  return (
    <div className={cn(
      'relative rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 mb-8',
      'shadow-lg border border-blue-500/20 overflow-hidden',
      className
    )}>
      {/* Abstract background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm p-2.5 text-white shadow-sm">
                {icon}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {title}
              </h1>
              {description && (
                <p className="text-sm text-white/90 mt-1 max-w-xl">
                  {description}
                </p>
              )}
            </div>
          </div>
          
          {actions && (
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end mt-4 sm:mt-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PageHeader; 