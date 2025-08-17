/**
 * Toast Components - UI components for toast notifications
 * Provides animated toast notifications for user feedback
 */

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toast, ToastIcons, ToastStyles } from '@/hooks/useToast';
import { cn } from '@/utils/core/ui';

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

export function ToastItem({ toast, onRemove }: ToastItemProps) {
  const Icon = ToastIcons[toast.type];
  const styles = ToastStyles[toast.type];

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-sm transition-all duration-300 transform',
        styles.container,
        toast.isVisible
          ? 'translate-x-0 opacity-100 scale-100'
          : 'translate-x-full opacity-0 scale-95'
      )}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        <Icon className={cn('h-5 w-5', styles.icon)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className={cn('text-sm font-medium leading-5', styles.title)}>
          {toast.title}
        </h4>
        
        {toast.description && (
          <p className={cn('text-sm mt-1 leading-5', styles.description)}>
            {toast.description}
          </p>
        )}

        {/* Action Button */}
        {toast.action && (
          <div className="mt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={toast.action.onClick}
              className={cn(
                'h-8 text-xs',
                toast.type === 'success' && 'border-green-300 text-green-700 hover:bg-green-50',
                toast.type === 'error' && 'border-red-300 text-red-700 hover:bg-red-50',
                toast.type === 'info' && 'border-blue-300 text-blue-700 hover:bg-blue-50',
                toast.type === 'warning' && 'border-amber-300 text-amber-700 hover:bg-amber-50'
              )}
            >
              {toast.action.label}
            </Button>
          </div>
        )}
      </div>

      {/* Close Button */}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 h-6 w-6 p-0 hover:bg-transparent opacity-60 hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export function ToastContainer({ 
  toasts, 
  onRemove, 
  position = 'bottom-right' 
}: ToastContainerProps) {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  };

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div 
      className={cn(
        'fixed z-50 flex flex-col gap-2 w-full max-w-sm',
        positionClasses[position]
      )}
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}