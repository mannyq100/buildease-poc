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
      'relative rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 text-white p-6 mb-8',
      'shadow-md border border-blue-800/20',
      className
    )}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-10 h-10 flex items-center justify-center text-white">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-white/80 mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
        
        {actions && (
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

export default PageHeader; 