import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { H2, Small } from '@/components/ui/typography';

interface DashboardGridProps {
  className?: string;
  children: ReactNode;
  spacing?: 'default' | 'compact' | 'loose';
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ 
  className, 
  children,
  spacing = 'default'
}) => {
  const spacingClasses = {
    default: 'gap-6',
    compact: 'gap-4',
    loose: 'gap-8'
  };

  return (
    <div className={cn(
      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      spacingClasses[spacing],
      className
    )}>
      {children}
    </div>
  );
};

interface DashboardRowProps {
  className?: string;
  children: ReactNode;
  spacing?: 'default' | 'compact' | 'loose';
}

export const DashboardRow: React.FC<DashboardRowProps> = ({ 
  className, 
  children,
  spacing = 'default'
}) => {
  const spacingClasses = {
    default: 'gap-6',
    compact: 'gap-4',
    loose: 'gap-8'
  };

  return (
    <div className={cn(
      "flex flex-col sm:flex-row w-full", 
      spacingClasses[spacing], 
      className
    )}>
      {children}
    </div>
  );
};

interface DashboardSectionProps {
  title?: string;
  description?: string;
  className?: string;
  children: ReactNode;
  fullWidth?: boolean;
  divider?: boolean;
  spacing?: 'default' | 'compact' | 'loose';
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  title,
  description,
  className,
  children,
  fullWidth = false,
  divider = false,
  spacing = 'default'
}) => {
  const spacingClasses = {
    default: 'space-y-6 mb-8',
    compact: 'space-y-4 mb-6',
    loose: 'space-y-8 mb-12'
  };

  return (
    <div className={cn(
      spacingClasses[spacing], 
      fullWidth && "col-span-full", 
      divider && "border-b pb-8 border-gray-100 dark:border-gray-800",
      className
    )}>
      {(title || description) && (
        <div className="space-y-1.5">
          {title && <H2>{title}</H2>}
          {description && <Small className="text-gray-500 dark:text-gray-400">{description}</Small>}
        </div>
      )}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}; 