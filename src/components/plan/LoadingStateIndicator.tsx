/**
 * Loading State Indicator Component
 * Enhanced visual feedback for plan operations with construction industry styling
 */

import React from 'react';
import { motion } from 'framer-motion';
import { getIconWithStyle, PLAN_ACTION_ICONS } from '@/utils/plan-icons';
import { Badge } from '@/components/ui/badge';

interface LoadingStateIndicatorProps {
  isLoading: boolean;
  loadingText: string;
  successText?: string;
  showSuccess?: boolean;
  variant?: 'save' | 'regenerate' | 'distribute' | 'general';
  className?: string;
}

export const LoadingStateIndicator = React.memo(function LoadingStateIndicator({
  isLoading,
  loadingText,
  successText,
  showSuccess = false,
  variant = 'general',
  className = ''
}: LoadingStateIndicatorProps) {
  const getVariantConfig = () => {
    switch (variant) {
      case 'save':
        return {
          icon: PLAN_ACTION_ICONS.save,
          loadingIcon: PLAN_ACTION_ICONS.loading,
          successIcon: PLAN_ACTION_ICONS.complete,
          color: 'primary' as const,
          bgClass: 'bg-buildease-blue-50 dark:bg-buildease-blue-950/20',
          borderClass: 'border-buildease-blue-200 dark:border-buildease-blue-800'
        };
      case 'regenerate':
        return {
          icon: PLAN_ACTION_ICONS.regenerate,
          loadingIcon: PLAN_ACTION_ICONS.loading,
          successIcon: PLAN_ACTION_ICONS.complete,
          color: 'accent' as const,
          bgClass: 'bg-buildease-orange-50 dark:bg-buildease-orange-950/20',
          borderClass: 'border-buildease-orange-200 dark:border-buildease-orange-800'
        };
      case 'distribute':
        return {
          icon: PLAN_ACTION_ICONS.distribute,
          loadingIcon: PLAN_ACTION_ICONS.loading,
          successIcon: PLAN_ACTION_ICONS.complete,
          color: 'secondary' as const,
          bgClass: 'bg-buildease-earth-50 dark:bg-buildease-earth-950/20',
          borderClass: 'border-buildease-earth-200 dark:border-buildease-earth-800'
        };
      default:
        return {
          icon: PLAN_ACTION_ICONS.loading,
          loadingIcon: PLAN_ACTION_ICONS.loading,
          successIcon: PLAN_ACTION_ICONS.complete,
          color: 'primary' as const,
          bgClass: 'bg-gray-50 dark:bg-gray-950/20',
          borderClass: 'border-gray-200 dark:border-gray-800'
        };
    }
  };

  const config = getVariantConfig();
  const loadingIconStyle = getIconWithStyle(config.loadingIcon, 'md', config.color, 'animate-spin');
  const successIconStyle = getIconWithStyle(config.successIcon, 'md', 'success');

  if (!isLoading && !showSuccess) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`flex items-center gap-3 p-3 rounded-lg border ${config.bgClass} ${config.borderClass} ${className}`}
    >
      {isLoading ? (
        <>
          <loadingIconStyle.IconComponent className={loadingIconStyle.className} />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-construction-body">
              {loadingText}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-32 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${variant === 'save' ? 'bg-buildease-blue-500' : variant === 'regenerate' ? 'bg-buildease-orange-500' : 'bg-buildease-earth-500'}`}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                Processing...
              </span>
            </div>
          </div>
        </>
      ) : showSuccess ? (
        <>
          <successIconStyle.IconComponent className={successIconStyle.className} />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              {successText || 'Operation completed successfully'}
            </span>
            <span className="text-xs text-muted-foreground">
              Your plan has been updated
            </span>
          </div>
        </>
      ) : null}
    </motion.div>
  );
});

/**
 * Inline Loading Badge Component
 * Compact loading indicator for buttons and small spaces
 */
interface InlineLoadingBadgeProps {
  isLoading: boolean;
  text: string;
  variant?: 'save' | 'regenerate' | 'distribute';
}

export const InlineLoadingBadge = React.memo(function InlineLoadingBadge({
  isLoading,
  text,
  variant = 'save'
}: InlineLoadingBadgeProps) {
  const getVariantClass = () => {
    switch (variant) {
      case 'save':
        return 'bg-buildease-blue-100 text-buildease-blue-800 border-buildease-blue-200';
      case 'regenerate':
        return 'bg-buildease-orange-100 text-buildease-orange-800 border-buildease-orange-200';
      case 'distribute':
        return 'bg-buildease-earth-100 text-buildease-earth-800 border-buildease-earth-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const loadingIconStyle = getIconWithStyle(PLAN_ACTION_ICONS.loading, 'sm', 'primary', 'animate-spin');

  if (!isLoading) return null;

  return (
    <Badge 
      variant="outline" 
      className={`${getVariantClass()} animate-pulse`}
    >
      <loadingIconStyle.IconComponent className="h-3 w-3 mr-1.5" />
      {text}
    </Badge>
  );
});

export default LoadingStateIndicator;