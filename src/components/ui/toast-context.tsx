import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ToastActionElement, Toast, ToastTitle, ToastDescription, ToastProvider, ToastViewport } from './toast';
import { v4 as uuidv4 } from 'uuid';

type ToastType = 'default' | 'destructive' | 'success' | 'warning' | 'info';

export type ToastOptions = {
  title?: string;
  description?: string;
  action?: ToastActionElement;
  variant?: ToastType;
  duration?: number;
  onDismiss?: () => void;
}

type ToastInstance = ToastOptions & {
  id: string;
  progress: number;
  open: boolean;
  startTime?: number;
}

type ToastContextType = {
  toast: (options: ToastOptions) => void;
  dismiss: (id: string) => void;
  toasts: ToastInstance[];
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Optimized for React 19 with improved state management
export const ToastContextProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastInstance[]>([]);
  
  // Memoize toast function to prevent unnecessary re-renders
  const toast = useCallback((options: ToastOptions) => {
    const id = uuidv4();
    const duration = options.duration || 5000; // Default to 5 seconds
    
    setToasts(prev => [
      ...prev,
      { 
        id, 
        progress: 100, 
        open: true,
        duration,
        startTime: Date.now(), // Set startTime immediately
        ...options 
      }
    ]);
    
    // Schedule removal
    setTimeout(() => {
      dismiss(id);
      options.onDismiss?.();
    }, duration);
    
  }, []);

  // Memoize dismiss function to prevent unnecessary re-renders
  const dismiss = useCallback((id: string) => {
    setToasts(prev => 
      prev.map(toast => 
        toast.id === id ? { ...toast, open: false } : toast
      )
    );
    // Remove from state after animation completes
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 300);
  }, []);

  // Update progress bars with optimized dependency array
  useEffect(() => {
    if (toasts.length === 0) return;
    
    const interval = setInterval(() => {
      setToasts(prev => 
        prev.map(toast => {
          if (!toast.open || !toast.startTime) return toast;
          const elapsed = 100 * (Date.now() - toast.startTime) / (toast.duration || 5000);
          return {
            ...toast,
            progress: Math.max(0, 100 - elapsed)
          };
        })
      );
    }, 100);
    
    return () => clearInterval(interval);
  }, [toasts.length]); // Only depend on toasts.length, not the entire toasts array
  
  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    toast,
    dismiss,
    toasts
  }), [toast, dismiss, toasts]);

  return (
    <ToastContext.Provider value={contextValue}>
      <ToastProvider>
        {children}
        <ToastViewport>
          {toasts.map(({ id, progress, variant, open, title, description, action }) => (
            <Toast 
              key={id} 
              variant={variant} 
              open={open}
              progress={progress}
              onOpenChange={(open) => {
                if (!open) dismiss(id);
              }}
            >
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
              {action}
            </Toast>
          ))}
        </ToastViewport>
      </ToastProvider>
    </ToastContext.Provider>
  );
};