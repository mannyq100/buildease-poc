/**
 * PageHeader component for consistent page headers across the application
 */
import React, { memo } from 'react';
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  /**
   * The title of the page
   */
  title: React.ReactNode;
  
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

const PageHeader = memo(function PageHeader({
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
});

PageHeader.displayName = 'PageHeader';

export { PageHeader };
export default PageHeader; 