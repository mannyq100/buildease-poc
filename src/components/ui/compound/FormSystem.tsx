/**
 * Compound Form System Components
 * Reusable, accessible form system using compound component pattern
 * Supports validation, field groups, and flexible layouts
 */

import React, { createContext, useContext, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Check, Info } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/core/ui';

// Context for form system state
interface FormContextValue {
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  size: 'sm' | 'md' | 'lg';
  layout: 'vertical' | 'horizontal';
}

const FormContext = createContext<FormContextValue | null>(null);

// Hook to use form context
function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('Form components must be used within a FormSystem');
  }
  return context;
}

// Main FormSystem component
interface FormSystemProps {
  onSubmit?: (e: React.FormEvent) => void;
  errors?: Record<string, string>;
  touched?: Record<string, boolean>;
  isSubmitting?: boolean;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'vertical' | 'horizontal';
  className?: string;
  children: React.ReactNode;
}

function FormSystem({
  onSubmit,
  errors = {},
  touched = {},
  isSubmitting = false,
  size = 'md',
  layout = 'vertical',
  className,
  children
}: FormSystemProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const contextValue: FormContextValue = {
    errors,
    touched,
    isSubmitting,
    size,
    layout
  };

  return (
    <FormContext.Provider value={contextValue}>
      <form
        ref={formRef}
        onSubmit={onSubmit}
        className={cn(
          'form-system space-y-4',
          layout === 'horizontal' && 'space-y-6',
          className
        )}
        noValidate
      >
        {children}
      </form>
    </FormContext.Provider>
  );
}

// FormSection component for grouping fields
interface FormSectionProps {
  title?: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}

function FormSection({ title, description, className, children }: FormSectionProps) {
  return (
    <div className={cn('form-section space-y-4', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

// FormField component
interface FormFieldProps {
  name: string;
  label: string;
  required?: boolean;
  description?: string;
  className?: string;
  children: React.ReactNode;
}

function FormField({ 
  name, 
  label, 
  required = false, 
  description, 
  className, 
  children 
}: FormFieldProps) {
  const { errors, touched, layout, size } = useFormContext();
  const hasError = touched[name] && errors[name];

  const sizeClasses = {
    sm: 'space-y-1',
    md: 'space-y-1.5',
    lg: 'space-y-2'
  };

  return (
    <motion.div 
      className={cn(
        'form-field',
        sizeClasses[size],
        layout === 'horizontal' && 'grid grid-cols-1 md:grid-cols-3 gap-4 items-start',
        className
      )}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className={cn(
        layout === 'horizontal' && 'md:col-span-1'
      )}>
        <Label 
          htmlFor={name} 
          className={cn(
            'text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center',
            hasError && 'text-red-600 dark:text-red-400'
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </div>

      <div className={cn(
        'space-y-1',
        layout === 'horizontal' && 'md:col-span-2'
      )}>
        {children}
        
        {hasError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-start gap-1 text-xs text-red-600 dark:text-red-400"
          >
            <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
            {errors[name]}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// FormInput component
interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
}

function FormInput({ name, icon: Icon, className, ...props }: FormInputProps) {
  const { errors, touched, size } = useFormContext();
  const hasError = touched[name] && errors[name];

  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-9 text-sm', 
    lg: 'h-10 text-base'
  };

  return (
    <div className="relative group">
      {Icon && (
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-[#2B6CB0] transition-colors duration-200">
          <Icon className="h-4 w-4" />
        </span>
      )}
      
      <Input
        id={name}
        name={name}
        className={cn(
          sizeClasses[size],
          Icon && 'pl-10',
          hasError && 'border-red-300 focus:ring-red-200 focus:border-red-400',
          !hasError && 'focus:border-[#2B6CB0] focus:ring-[#2B6CB0]/10',
          'transition-all duration-200 bg-white dark:bg-gray-800 shadow-sm hover:border-gray-400 dark:hover:border-gray-600 rounded-md',
          className
        )}
        aria-invalid={hasError ? 'true' : 'false'}
        aria-describedby={hasError ? `${name}-error` : undefined}
        {...props}
      />
    </div>
  );
}

// FormActions component
interface FormActionsProps {
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
  submitVariant?: 'default' | 'destructive';
  alignment?: 'left' | 'center' | 'right';
  className?: string;
}

function FormActions({
  submitText = 'Submit',
  cancelText = 'Cancel',
  onCancel,
  submitVariant = 'default',
  alignment = 'right',
  className
}: FormActionsProps) {
  const { isSubmitting } = useFormContext();

  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  return (
    <div className={cn(
      'form-actions flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700',
      alignmentClasses[alignment],
      className
    )}>
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {cancelText}
        </Button>
      )}
      
      <Button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          'min-w-[96px]',
          submitVariant === 'destructive' 
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-[#ED8936] hover:bg-[#ED8936]/90 text-white'
        )}
      >
        {isSubmitting ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
            />
            Submitting...
          </>
        ) : (
          submitText
        )}
      </Button>
    </div>
  );
}

// FormMessage component for general form messages
interface FormMessageProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
  children: React.ReactNode;
}

function FormMessage({ type = 'info', className, children }: FormMessageProps) {
  const icons = {
    info: Info,
    success: Check,
    warning: AlertCircle,
    error: AlertCircle
  };

  const colorClasses = {
    info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    success: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
    error: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
  };

  const Icon = icons[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'form-message flex items-start gap-2 p-3 rounded-md border text-sm',
        colorClasses[type],
        className
      )}
    >
      <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <div>{children}</div>
    </motion.div>
  );
}

// Convenience hook for form validation
function useFormValidation<T extends Record<string, any>>(
  validationSchema: (values: T) => Record<string, string>
) {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const validate = useCallback((values: T) => {
    const newErrors = validationSchema(values);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validationSchema]);

  const touch = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const reset = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  return {
    errors,
    touched,
    validate,
    touch,
    reset
  };
}

// Compose the compound component
const Form = Object.assign(FormSystem, {
  Section: FormSection,
  Field: FormField,
  Input: FormInput,
  Actions: FormActions,
  Message: FormMessage
});

export { 
  Form, 
  FormSystem, 
  FormSection, 
  FormField, 
  FormInput, 
  FormActions, 
  FormMessage,
  useFormValidation 
};

export type { 
  FormSystemProps, 
  FormSectionProps, 
  FormFieldProps, 
  FormInputProps, 
  FormActionsProps, 
  FormMessageProps 
};