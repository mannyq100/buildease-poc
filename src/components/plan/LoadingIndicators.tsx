/**
 * Loading Indicators Components
 * Standardized loading indicators for all plan operations
 * Consistent with BuildEase design system
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle, Save, RefreshCw, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// === Button Loading States ===

interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'xs';
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const LoadingButton = React.memo(function LoadingButton({
  isLoading,
  children,
  loadingText,
  variant = 'default',
  size = 'default',
  className = '',
  disabled = false,
  onClick,
  type = 'button'
}: LoadingButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      disabled={disabled || isLoading}
      onClick={onClick}
      type={type}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {loadingText || 'Loading...'}
        </>
      ) : (
        children
      )}
    </Button>
  );
});

// === Entity Loading States ===

interface EntityLoadingProps {
  entityType: 'phase' | 'task' | 'material';
  entityName?: string;
  isLoading: boolean;
  operation?: 'saving' | 'deleting' | 'updating';
  className?: string;
}

export const EntityLoadingIndicator = React.memo(function EntityLoadingIndicator({
  entityType,
  entityName,
  isLoading,
  operation = 'updating',
  className = ''
}: EntityLoadingProps) {
  if (!isLoading) return null;

  const getOperationText = () => {
    switch (operation) {
      case 'saving':
        return `Saving ${entityType}`;
      case 'deleting':
        return `Deleting ${entityType}`;
      case 'updating':
        return `Updating ${entityType}`;
      default:
        return `Processing ${entityType}`;
    }
  };

  const getOperationColor = () => {
    switch (operation) {
      case 'saving':
        return 'text-buildease-blue-600 bg-buildease-blue-50 border-buildease-blue-200';
      case 'deleting':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'updating':
        return 'text-buildease-orange-600 bg-buildease-orange-50 border-buildease-orange-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm font-medium ${getOperationColor()} ${className}`}
    >
      <Loader2 className="h-3 w-3 animate-spin" />
      <span>
        {getOperationText()}
        {entityName && ` "${entityName}"`}...
      </span>
    </motion.div>
  );
});

// === Inline Loading Badge ===

interface InlineLoadingBadgeProps {
  isLoading: boolean;
  text: string;
  variant?: 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
}

export const InlineLoadingBadge = React.memo(function InlineLoadingBadge({
  isLoading,
  text,
  variant = 'primary',
  size = 'sm'
}: InlineLoadingBadgeProps) {
  if (!isLoading) return null;

  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-buildease-blue-100 text-buildease-blue-800 border-buildease-blue-200';
    }
  };

  const getSizeClasses = () => {
    return size === 'md' ? 'px-3 py-1.5 text-sm' : 'px-2 py-1 text-xs';
  };

  return (
    <Badge 
      variant="outline" 
      className={`${getVariantClasses()} ${getSizeClasses()} animate-pulse inline-flex items-center gap-1.5`}
    >
      <Loader2 className={`${size === 'md' ? 'h-3 w-3' : 'h-2.5 w-2.5'} animate-spin`} />
      {text}
    </Badge>
  );
});

// === Action Loading Overlay ===

interface ActionLoadingOverlayProps {
  isLoading: boolean;
  operation: 'save' | 'regenerate' | 'distribute' | 'delete' | 'update';
  message?: string;
  className?: string;
}

export const ActionLoadingOverlay = React.memo(function ActionLoadingOverlay({
  isLoading,
  operation,
  message,
  className = ''
}: ActionLoadingOverlayProps) {
  if (!isLoading) return null;

  const getOperationConfig = () => {
    switch (operation) {
      case 'save':
        return {
          icon: Save,
          defaultMessage: 'Saving your changes...',
          color: 'text-buildease-blue-600',
          bgColor: 'bg-buildease-blue-50/90'
        };
      case 'regenerate':
        return {
          icon: RefreshCw,
          defaultMessage: 'Regenerating plan...',
          color: 'text-buildease-orange-600',
          bgColor: 'bg-buildease-orange-50/90'
        };
      case 'distribute':
        return {
          icon: Share2,
          defaultMessage: 'Distributing plan...',
          color: 'text-buildease-earth-600',
          bgColor: 'bg-buildease-earth-50/90'
        };
      case 'delete':
        return {
          icon: AlertCircle,
          defaultMessage: 'Deleting item...',
          color: 'text-red-600',
          bgColor: 'bg-red-50/90'
        };
      case 'update':
        return {
          icon: CheckCircle,
          defaultMessage: 'Updating...',
          color: 'text-amber-600',
          bgColor: 'bg-amber-50/90'
        };
      default:
        return {
          icon: Loader2,
          defaultMessage: 'Processing...',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50/90'
        };
    }
  };

  const config = getOperationConfig();
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`absolute inset-0 flex items-center justify-center ${config.bgColor} backdrop-blur-sm z-10 ${className}`}
    >
      <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-lg">
        <IconComponent className={`h-5 w-5 ${config.color} ${operation === 'regenerate' ? 'animate-spin' : operation === 'save' ? 'animate-pulse' : ''}`} />
        <span className={`font-medium ${config.color}`}>
          {message || config.defaultMessage}
        </span>
      </div>
    </motion.div>
  );
});

// === List Item Loading States ===

interface ListItemLoadingProps {
  isLoading: boolean;
  itemName?: string;
  operation?: 'loading' | 'saving' | 'deleting';
}

export const ListItemLoading = React.memo(function ListItemLoading({
  isLoading,
  itemName,
  operation = 'loading'
}: ListItemLoadingProps) {
  if (!isLoading) return null;

  const getMessage = () => {
    const name = itemName ? ` "${itemName}"` : '';
    switch (operation) {
      case 'saving':
        return `Saving${name}...`;
      case 'deleting':
        return `Deleting${name}...`;
      default:
        return `Loading${name}...`;
    }
  };

  const getColor = () => {
    switch (operation) {
      case 'saving':
        return 'text-buildease-blue-600';
      case 'deleting':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="flex items-center gap-2 py-2 px-3 text-sm">
      <Loader2 className={`h-4 w-4 animate-spin ${getColor()}`} />
      <span className={`${getColor()}`}>
        {getMessage()}
      </span>
    </div>
  );
});

// === View Loading Skeleton ===

interface ViewLoadingSkeletonProps {
  viewType?: string;
  showHeader?: boolean;
  itemCount?: number;
}

export const ViewLoadingSkeleton = React.memo(function ViewLoadingSkeleton({
  viewType = 'content',
  showHeader = true,
  itemCount = 3
}: ViewLoadingSkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 p-6"
    >
      {showHeader && (
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
        </div>
      )}
      
      <div className="space-y-3">
        {Array.from({ length: itemCount }).map((_, i) => (
          <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-center py-8 text-gray-500 dark:text-gray-400">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading {viewType}...
      </div>
    </motion.div>
  );
});

export default {
  LoadingButton,
  EntityLoadingIndicator,
  InlineLoadingBadge,
  ActionLoadingOverlay,
  ListItemLoading,
  ViewLoadingSkeleton
};