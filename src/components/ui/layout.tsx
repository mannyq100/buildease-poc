import React from 'react';
import { cn } from '@/lib/utils';
import { H1, Lead } from './typography';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'default' | 'small' | 'large' | 'full';
}

export const Container: React.FC<ContainerProps> = ({ 
  children, 
  className,
  size = 'default' 
}) => {
  const maxWidthClasses = {
    small: 'max-w-4xl',
    default: 'max-w-7xl',
    large: 'max-w-screen-2xl',
    full: 'max-w-none'
  };

  return (
    <div className={cn(
      maxWidthClasses[size],
      'mx-auto px-4 sm:px-6 lg:px-8 w-full',
      className
    )}>
      {children}
    </div>
  );
};

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  container?: boolean;
  containerSize?: 'default' | 'small' | 'large' | 'full';
  spacing?: 'default' | 'compact' | 'loose';
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  className,
  container = true,
  containerSize = 'default',
  spacing = 'default'
}) => {
  const spacingClasses = {
    default: 'py-8',
    compact: 'py-4',
    loose: 'py-12'
  };

  const content = (
    <div className={cn(
      spacingClasses[spacing],
      'space-y-6',
      className
    )}>
      {children}
    </div>
  );

  return container ? (
    <Container size={containerSize}>{content}</Container>
  ) : content;
};

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
  alignment?: 'left' | 'center';
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  className,
  children,
  alignment = 'left'
}) => {
  return (
    <div className={cn(
      'mb-8 space-y-4',
      alignment === 'center' && 'text-center',
      className
    )}>
      <div className="space-y-2">
        <H1>{title}</H1>
        {description && <Lead className="text-gray-500 dark:text-gray-400">{description}</Lead>}
      </div>
      {children && <div>{children}</div>}
    </div>
  );
};

interface PageContentProps {
  children: React.ReactNode;
  className?: string;
}

export const PageContent: React.FC<PageContentProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn('space-y-6', className)}>
      {children}
    </div>
  );
};

interface PageGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
  spacing?: 'default' | 'compact' | 'loose';
}

export const PageGrid: React.FC<PageGridProps> = ({
  children,
  className,
  columns = 3,
  spacing = 'default'
}) => {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  const spacingClasses = {
    default: 'gap-6',
    compact: 'gap-4',
    loose: 'gap-8'
  };

  return (
    <div className={cn(
      'grid',
      columnClasses[columns],
      spacingClasses[spacing],
      className
    )}>
      {children}
    </div>
  );
}; 