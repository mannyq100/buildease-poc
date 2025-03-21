/**
 * PageHeader component for consistent page headers across the application
 */
import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface PageHeaderAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  disabled?: boolean;
}

export interface PageHeaderMetadataItem {
  label: string;
  value: string;
}

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
  actions?: React.ReactNode | PageHeaderAction[];
  
  /**
   * Optional breadcrumbs to display above the title
   */
  breadcrumbs?: React.ReactNode;
  
  /**
   * Optional status to display as a badge
   */
  status?: string;
  
  /**
   * Optional metadata items to display below the header
   */
  metadata?: PageHeaderMetadataItem[];
  
  /**
   * Optional class name for custom styling
   */
  className?: string;

  /**
   * Optional children to render below the header content
   */
  children?: React.ReactNode;
}

const PageHeader = memo(function PageHeader({
  title,
  description,
  icon,
  actions,
  breadcrumbs,
  status,
  metadata,
  className,
  children
}: PageHeaderProps) {
  // Helper to render status badge
  const renderStatusBadge = (status: string) => {
    const statusMap = {
      'planning': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-400' },
      'in-progress': { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-800 dark:text-amber-400' },
      'on-hold': { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-400' },
      'completed': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-400' },
      'default': { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-400' }
    };
    
    const style = statusMap[status] || statusMap.default;
    
    return (
      <Badge className={`${style.bg} ${style.text} mr-2`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ')}
      </Badge>
    );
  };
  
  // Helper to render action buttons
  const renderActions = () => {
    if (!actions) return null;
    
    if (Array.isArray(actions)) {
      return actions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant || 'default'}
          size="sm"
          onClick={action.onClick}
          disabled={action.disabled}
          className={action.variant === 'default' ? 'bg-white hover:bg-gray-100 text-blue-700' : ''}
        >
          {action.icon && <span className="mr-1">{action.icon}</span>}
          {action.label}
        </Button>
      ));
    }
    
    return actions;
  };
  
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
        {/* Breadcrumbs */}
        {breadcrumbs && (
          <div className="mb-4 text-sm text-white/80">
            {breadcrumbs}
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm p-2.5 text-white shadow-sm">
                {icon}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                {status && renderStatusBadge(status)}
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  {title}
                </h1>
              </div>
              {description && (
                <p className="text-sm text-white/90 mt-1 max-w-xl">
                  {description}
                </p>
              )}
            </div>
          </div>
          
          {actions && (
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end mt-4 sm:mt-0">
              {renderActions()}
            </div>
          )}
        </div>

        {/* Metadata */}
        {metadata && metadata.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-4">
            {metadata.map((item, index) => (
              <div key={index} className="flex flex-col">
                <span className="text-xs text-white/70">{item.label}</span>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Render children if provided */}
        {children && (
          <div className="mt-4">
            {children}
          </div>
        )}
      </div>
    </div>
  )
});

PageHeader.displayName = 'PageHeader';

export { PageHeader };
export default PageHeader;