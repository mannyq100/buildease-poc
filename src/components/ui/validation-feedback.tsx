/**
 * ValidationFeedback Component
 * Displays real-time validation feedback with appropriate styling
 */
import React from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ValidationResult } from '@/hooks/useRealTimeValidation';

interface ValidationFeedbackProps {
  validation: ValidationResult | null;
  isValidating?: boolean;
  className?: string;
}

export function ValidationFeedback({ 
  validation, 
  isValidating = false, 
  className 
}: ValidationFeedbackProps) {
  // Don't render anything if no validation result and not validating
  if (!validation && !isValidating) {
    return null;
  }

  // Show loading state while validating
  if (isValidating) {
    return (
      <div className={cn(
        "flex items-center gap-2 text-sm font-opensans mt-1 transition-all duration-200",
        "text-slate-500",
        className
      )}>
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Validating...</span>
      </div>
    );
  }

  // Don't render if validation passed but no message
  if (validation?.isValid && !validation.message) {
    return null;
  }

  const getIcon = () => {
    if (!validation) return null;
    
    switch (validation.type) {
      case 'success':
        return <CheckCircle className="h-3 w-3" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3" />;
      case 'error':
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
  };

  const getStyles = () => {
    if (!validation) return "text-slate-500";
    
    switch (validation.type) {
      case 'success':
        return "text-green-600 dark:text-green-400";
      case 'warning':
        return "text-amber-600 dark:text-amber-400";
      case 'error':
      default:
        return "text-red-600 dark:text-red-400";
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-2 text-sm font-opensans mt-1 transition-all duration-200",
      getStyles(),
      className
    )}>
      {getIcon()}
      <span>{validation?.message}</span>
    </div>
  );
}

/**
 * Enhanced FormField wrapper that includes real-time validation
 */
interface ValidatedFormFieldProps {
  children: React.ReactNode;
  fieldName: string;
  validation: ValidationResult | null;
  isValidating?: boolean;
  className?: string;
}

export function ValidatedFormField({ 
  children, 
  fieldName: _fieldName, 
  validation, 
  isValidating = false,
  className 
}: ValidatedFormFieldProps) {
  const getBorderColor = () => {
    if (isValidating) return "border-slate-300 dark:border-slate-600";
    if (!validation) return "border-slate-300 dark:border-slate-600";
    
    switch (validation.type) {
      case 'success':
        return "border-green-300 dark:border-green-600 focus:border-green-500 dark:focus:border-green-400";
      case 'warning':
        return "border-amber-300 dark:border-amber-600 focus:border-amber-500 dark:focus:border-amber-400";
      case 'error':
      default:
        return "border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400";
    }
  };

  const getRingColor = () => {
    if (isValidating) return "focus:ring-[#2B6CB0]/20";
    if (!validation) return "focus:ring-[#2B6CB0]/20";
    
    switch (validation.type) {
      case 'success':
        return "focus:ring-green-500/20";
      case 'warning':
        return "focus:ring-amber-500/20";
      case 'error':
      default:
        return "focus:ring-red-500/20";
    }
  };

  return (
    <div className={cn("space-y-1", className)}>
      <div className={cn(
        "relative",
        // Apply dynamic border colors to child input elements
        `[&_input]:${getBorderColor()}`,
        `[&_textarea]:${getBorderColor()}`,
        `[&_input]:${getRingColor()}`,
        `[&_textarea]:${getRingColor()}`
      )}>
        {children}
        
        {/* Validation icon overlay for input fields */}
        {validation && !isValidating && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {validation.type === 'success' && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            {validation.type === 'warning' && (
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            )}
            {validation.type === 'error' && (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
        )}
        
        {/* Loading spinner overlay */}
        {isValidating && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
          </div>
        )}
      </div>
      
      {/* Validation feedback message */}
      <ValidationFeedback 
        validation={validation} 
        isValidating={isValidating}
      />
    </div>
  );
}
