/**
 * Enhanced Action Button Component
 * Provides visual feedback, loading states, and micro-interactions
 * Built on top of the enhanced Button component
 */

import React, { useState, useCallback } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/utils/core/ui';
import { Check, X, AlertTriangle } from 'lucide-react';

interface EnhancedActionButtonProps extends Omit<ButtonProps, 'feedbackState' | 'onFeedbackComplete'> {
  /** The action to perform on click */
  onAction?: () => Promise<void> | void;
  
  /** Show success feedback after successful action */
  showSuccessFeedback?: boolean;
  
  /** Show error feedback after failed action */
  showErrorFeedback?: boolean;
  
  /** Custom success message */
  successMessage?: string;
  
  /** Custom error message */
  errorMessage?: string;
  
  /** Callback when action completes successfully */
  onSuccess?: () => void;
  
  /** Callback when action fails */
  onError?: (error: Error) => void;
  
  /** Whether to prevent multiple clicks during action */
  preventMultipleClicks?: boolean;
}

/**
 * Enhanced Action Button with automatic feedback states
 * Handles loading, success, and error states automatically
 */
export const EnhancedActionButton = React.forwardRef<HTMLButtonElement, EnhancedActionButtonProps>(({
  onAction,
  showSuccessFeedback = true,
  showErrorFeedback = true,
  successMessage,
  errorMessage,
  onSuccess,
  onError,
  preventMultipleClicks = true,
  children,
  className,
  disabled,
  onClick,
  ...props
}, ref) => {
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [feedbackState, setFeedbackState] = useState<'success' | 'error' | null>(null);
  const [actionDisabled, setActionDisabled] = useState(false);

  const handleClick = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    // Call original onClick if provided
    onClick?.(e);
    
    // Don't proceed if action is already in progress and prevention is enabled
    if (preventMultipleClicks && (isActionLoading || actionDisabled)) {
      return;
    }
    
    if (!onAction) return;
    
    try {
      setIsActionLoading(true);
      if (preventMultipleClicks) {
        setActionDisabled(true);
      }
      
      // Execute the action
      await onAction();
      
      // Show success feedback if enabled
      if (showSuccessFeedback) {
        setFeedbackState('success');
      }
      
      onSuccess?.();
      
    } catch (error) {
      console.error('Action failed:', error);
      
      // Show error feedback if enabled
      if (showErrorFeedback) {
        setFeedbackState('error');
      }
      
      onError?.(error instanceof Error ? error : new Error('Unknown error'));
      
    } finally {
      setIsActionLoading(false);
    }
  }, [
    onClick, onAction, isActionLoading, actionDisabled, preventMultipleClicks,
    showSuccessFeedback, showErrorFeedback, onSuccess, onError
  ]);

  const handleFeedbackComplete = useCallback(() => {
    setFeedbackState(null);
    if (preventMultipleClicks) {
      setActionDisabled(false);
    }
  }, [preventMultipleClicks]);

  return (
    <Button
      ref={ref}
      className={cn(
        "transition-all duration-200",
        className
      )}
      disabled={disabled || (preventMultipleClicks && actionDisabled)}
      isLoading={isActionLoading}
      feedbackState={feedbackState}
      onFeedbackComplete={handleFeedbackComplete}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  );
});

EnhancedActionButton.displayName = "EnhancedActionButton";

/**
 * Quick Action Button variants for common actions
 */

interface QuickActionButtonProps extends Omit<EnhancedActionButtonProps, 'variant' | 'leftIcon'> {
  actionType: 'save' | 'delete' | 'edit' | 'add' | 'submit' | 'cancel';
}

export const QuickActionButton = React.forwardRef<HTMLButtonElement, QuickActionButtonProps>(({
  actionType,
  children,
  ...props
}, ref) => {
  const getActionConfig = () => {
    switch (actionType) {
      case 'save':
        return {
          variant: 'default' as const,
          leftIcon: <Check className="h-4 w-4" />,
          successMessage: 'Saved successfully!',
          className: "bg-green-600 hover:bg-green-700 text-white"
        };
      case 'delete':
        return {
          variant: 'destructive' as const,
          leftIcon: <X className="h-4 w-4" />,
          successMessage: 'Deleted successfully!',
          errorMessage: 'Failed to delete'
        };
      case 'edit':
        return {
          variant: 'outline' as const,
          successMessage: 'Updated successfully!'
        };
      case 'add':
        return {
          variant: 'default' as const,
          successMessage: 'Added successfully!'
        };
      case 'submit':
        return {
          variant: 'primary' as const,
          successMessage: 'Submitted successfully!'
        };
      case 'cancel':
        return {
          variant: 'ghost' as const,
          showSuccessFeedback: false,
          showErrorFeedback: false
        };
      default:
        return {};
    }
  };

  const config = getActionConfig();

  return (
    <EnhancedActionButton
      ref={ref}
      {...config}
      {...props}
    >
      {children}
    </EnhancedActionButton>
  );
});

QuickActionButton.displayName = "QuickActionButton";

/**
 * Toast-like feedback component for enhanced actions
 */
interface ActionFeedbackToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  isVisible: boolean;
  onClose?: () => void;
  duration?: number;
}

export const ActionFeedbackToast: React.FC<ActionFeedbackToastProps> = ({
  type,
  message,
  isVisible,
  onClose,
  duration = 3000
}) => {
  React.useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200';
      case 'error':
        return 'bg-red-100 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200';
      case 'warning':
        return 'bg-yellow-100 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200';
      case 'info':
        return 'bg-blue-100 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200';
      default:
        return 'bg-gray-100 border-gray-200 text-gray-800 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-200';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Check className="h-4 w-4" />;
      case 'error':
        return <X className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg border shadow-lg transition-all duration-300 transform",
      "animate-in slide-in-from-top-2 fade-in-0",
      getTypeStyles()
    )}>
      <div className="flex items-center gap-3">
        {getIcon()}
        <p className="text-sm font-medium">{message}</p>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto flex-shrink-0 p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
};