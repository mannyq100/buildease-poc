import React from 'react';
import { cn } from '@/lib/utils';

interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  smCols?: 1 | 2;
  mdCols?: 1 | 2 | 3 | 4;
  lgCols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'xs' | 'sm' | 'md' | 'lg';
  rowGap?: 'xs' | 'sm' | 'md' | 'lg';
  colGap?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Responsive grid layout component with customizable columns at different breakpoints
 */
export function Grid({
  children,
  cols = 1,
  smCols,
  mdCols,
  lgCols,
  gap = 'md',
  rowGap,
  colGap,
  className
}: GridProps) {
  // Gap classes for different sizes
  const gapClasses = {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };
  
  // Row gap classes
  const rowGapClasses = {
    xs: 'row-gap-1',
    sm: 'row-gap-2',
    md: 'row-gap-4',
    lg: 'row-gap-6'
  };
  
  // Column gap classes
  const colGapClasses = {
    xs: 'col-gap-1',
    sm: 'col-gap-2',
    md: 'col-gap-4',
    lg: 'col-gap-6'
  };
  
  // Helper to resolve cols at each breakpoint
  // If a specific breakpoint col is defined, use that, otherwise fall back
  const getResponsiveColsClasses = () => {
    const baseColClass = `grid-cols-${cols}`;
    const smColClass = smCols ? `sm:grid-cols-${smCols}` : '';
    const mdColClass = mdCols ? `md:grid-cols-${mdCols}` : '';
    const lgColClass = lgCols ? `lg:grid-cols-${lgCols}` : '';
    
    return cn(baseColClass, smColClass, mdColClass, lgColClass);
  };
  
  // Get appropriate gap classes based on properties
  const getGapClasses = () => {
    // If row or col gaps are specified, use those instead of the generic gap
    if (rowGap || colGap) {
      return cn(
        rowGap && rowGapClasses[rowGap],
        colGap && colGapClasses[colGap]
      );
    }
    
    // Otherwise use the generic gap
    return gapClasses[gap];
  };

  return (
    <div className={cn(
      'grid w-full',
      getResponsiveColsClasses(),
      getGapClasses(),
      className
    )}>
      {children}
    </div>
  );
}