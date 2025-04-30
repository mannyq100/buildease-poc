import React from 'react';
import { cn } from '@/utils/core/ui';

interface FormLayoutProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
  layout?: 'vertical' | 'horizontal' | 'grid';
  columns?: 1 | 2 | 3 | 4;
  submitButton?: React.ReactNode;
  cancelButton?: React.ReactNode;
  title?: string;
  description?: string;
  isLoading?: boolean;
}

/**
 * FormLayout component for creating responsive form layouts
 * 
 * Implements mobile-first responsive design principles with:
 * - Proper spacing and layout for mobile devices
 * - Responsive grid for form fields
 * - Adaptive button layout
 * - Touch-friendly spacing
 */
export function FormLayout({
  children,
  className,
  fullWidth = false,
  maxWidth = 'lg',
  gap = 'md',
  layout = 'vertical',
  columns = 1,
  submitButton,
  cancelButton,
  title,
  description,
  isLoading = false,
}: FormLayoutProps) {
  // Map maxWidth to Tailwind classes
  const maxWidthClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  };

  // Map gap to Tailwind classes
  const gapClasses = {
    none: 'gap-0',
    xs: 'gap-2',
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  };

  // Generate responsive grid columns
  const getGridColumns = () => {
    switch (columns) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
      default:
        return 'grid-cols-1';
    }
  };

  return (
    <div
      className={cn(
        'w-full',
        !fullWidth && maxWidthClasses[maxWidth],
        'mx-auto',
        className
      )}
    >
      {/* Form Header */}
      {(title || description) && (
        <div className="mb-4 sm:mb-6">
          {title && (
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Form Content */}
      <div
        className={cn(
          layout === 'grid' && 'grid',
          layout === 'grid' && getGridColumns(),
          layout === 'grid' && gapClasses[gap],
          layout === 'vertical' && 'flex flex-col',
          layout === 'vertical' && gapClasses[gap],
          layout === 'horizontal' && 'flex flex-col sm:flex-row flex-wrap',
          layout === 'horizontal' && gapClasses[gap],
          isLoading && 'opacity-70 pointer-events-none'
        )}
      >
        {children}
      </div>

      {/* Form Actions */}
      {(submitButton || cancelButton) && (
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:items-center">
          {submitButton && (
            <div className="w-full sm:w-auto order-2 sm:order-1">
              {submitButton}
            </div>
          )}
          {cancelButton && (
            <div className="w-full sm:w-auto order-1 sm:order-2">
              {cancelButton}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * FormSection component for grouping form fields
 */
export function FormSection({
  children,
  title,
  description,
  className,
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn('mb-6', className)}>
      {(title || description) && (
        <div className="mb-3">
          {title && (
            <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

/**
 * FormRow component for horizontal layout of form fields
 */
export function FormRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * FormField component for individual form fields with consistent spacing
 */
export function FormField({
  children,
  className,
  fullWidth = true,
}: {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={cn(
        'min-h-[76px]',
        fullWidth ? 'w-full' : 'w-full sm:w-auto',
        className
      )}
    >
      {children}
    </div>
  );
}
