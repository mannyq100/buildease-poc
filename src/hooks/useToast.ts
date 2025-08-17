/**
 * useToast - Custom toast notification system
 * Provides user-friendly feedback for phase and task operations
 */

import { useState, useCallback, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  isVisible: boolean;
  timestamp: number;
}

interface ToastOptions {
  type?: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const DEFAULT_DURATION = 4000; // 4 seconds
const MAX_TOASTS = 5;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const generateId = useCallback(() => {
    return `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const removeToast = useCallback((id: string) => {
    // Clear timeout if exists
    const timeoutRef = timeoutRefs.current.get(id);
    if (timeoutRef) {
      clearTimeout(timeoutRef);
      timeoutRefs.current.delete(id);
    }

    // Mark as not visible first for smooth animation
    setToasts(prev => 
      prev.map(toast => 
        toast.id === id ? { ...toast, isVisible: false } : toast
      )
    );

    // Remove from array after animation
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 300);
  }, []);

  const addToast = useCallback((options: ToastOptions) => {
    const id = generateId();
    const duration = options.duration ?? DEFAULT_DURATION;

    const newToast: Toast = {
      id,
      type: options.type || 'info',
      title: options.title,
      description: options.description,
      duration,
      action: options.action,
      isVisible: true,
      timestamp: Date.now()
    };

    setToasts(prev => {
      // Limit number of toasts
      let updatedToasts = [...prev, newToast];
      if (updatedToasts.length > MAX_TOASTS) {
        const oldestToast = updatedToasts[0];
        removeToast(oldestToast.id);
        updatedToasts = updatedToasts.slice(1);
      }
      return updatedToasts;
    });

    // Auto-remove toast after duration
    if (duration > 0) {
      const timeoutId = setTimeout(() => {
        removeToast(id);
      }, duration);
      timeoutRefs.current.set(id, timeoutId);
    }

    return id;
  }, [generateId, removeToast]);

  // Convenience methods
  const success = useCallback((title: string, description?: string, options?: Partial<ToastOptions>) => {
    return addToast({ ...options, type: 'success', title, description });
  }, [addToast]);

  const error = useCallback((title: string, description?: string, options?: Partial<ToastOptions>) => {
    return addToast({ ...options, type: 'error', title, description, duration: options?.duration ?? 6000 });
  }, [addToast]);

  const info = useCallback((title: string, description?: string, options?: Partial<ToastOptions>) => {
    return addToast({ ...options, type: 'info', title, description });
  }, [addToast]);

  const warning = useCallback((title: string, description?: string, options?: Partial<ToastOptions>) => {
    return addToast({ ...options, type: 'warning', title, description });
  }, [addToast]);

  const clearAll = useCallback(() => {
    // Clear all timeouts
    timeoutRefs.current.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    timeoutRefs.current.clear();

    // Remove all toasts
    setToasts([]);
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    clearAll,
    // Convenience methods
    success,
    error,
    info,
    warning
  };
}

// Toast notification icons
export const ToastIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle
};

// Toast styling classes
export const ToastStyles = {
  success: {
    container: 'bg-green-50 border-green-200',
    icon: 'text-green-600',
    title: 'text-green-900',
    description: 'text-green-700'
  },
  error: {
    container: 'bg-red-50 border-red-200',
    icon: 'text-red-600',
    title: 'text-red-900',
    description: 'text-red-700'
  },
  info: {
    container: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-600',
    title: 'text-blue-900',
    description: 'text-blue-700'
  },
  warning: {
    container: 'bg-amber-50 border-amber-200',
    icon: 'text-amber-600',
    title: 'text-amber-900',
    description: 'text-amber-700'
  }
};