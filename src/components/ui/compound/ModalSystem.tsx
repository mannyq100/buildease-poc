/**
 * Compound Modal System Components
 * Reusable, accessible modal system using compound component pattern
 * Supports nested modals, custom animations, and flexible layouts
 */

import React, { createContext, useContext, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/core/ui';

// Context for modal system state
interface ModalContextValue {
  isOpen: boolean;
  onClose: () => void;
  size: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick: boolean;
  closeOnEscape: boolean;
  showCloseButton: boolean;
}

const ModalContext = createContext<ModalContextValue | null>(null);

// Hook to use modal context
function useModalContext() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('Modal components must be used within a ModalSystem');
  }
  return context;
}

// Main ModalSystem component
interface ModalSystemProps {
  isOpen: boolean;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
  children: React.ReactNode;
}

function ModalSystem({
  isOpen,
  onClose,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
  children
}: ModalSystemProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeOnEscape, isOpen, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  const contextValue: ModalContextValue = {
    isOpen,
    onClose,
    size,
    closeOnOverlayClick,
    closeOnEscape,
    showCloseButton
  };

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full h-full'
  };

  return (
    <ModalContext.Provider value={contextValue}>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={closeOnOverlayClick ? onClose : undefined}
            />
            
            {/* Modal Content */}
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.25 
              }}
              className={cn(
                'relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full',
                sizeClasses[size],
                size === 'full' ? 'h-full' : 'max-h-[90vh]',
                'overflow-hidden flex flex-col transform',
                className
              )}
              onClick={(e) => e.stopPropagation()}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
            >
              {children}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  );
}

// ModalHeader component
interface ModalHeaderProps {
  className?: string;
  children: React.ReactNode;
}

function ModalHeader({ className, children }: ModalHeaderProps) {
  const { onClose, showCloseButton } = useModalContext();

  return (
    <div className={cn(
      'modal-header',
      'bg-gradient-to-r from-[#2B6CB0] to-[#2B6CB0]/90 p-5 text-white',
      'flex items-center justify-between',
      className
    )}>
      <div className="flex-1">
        {children}
      </div>
      
      {showCloseButton && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="text-white/70 hover:text-white hover:bg-white/10 rounded-full h-8 w-8 flex items-center justify-center ml-4"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close modal</span>
        </Button>
      )}
    </div>
  );
}

// ModalTitle component
interface ModalTitleProps {
  className?: string;
  children: React.ReactNode;
}

function ModalTitle({ className, children }: ModalTitleProps) {
  return (
    <h2 className={cn(
      'modal-title text-xl font-semibold text-white',
      className
    )}>
      {children}
    </h2>
  );
}

// ModalDescription component
interface ModalDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

function ModalDescription({ className, children }: ModalDescriptionProps) {
  return (
    <p className={cn(
      'modal-description mt-1 text-sm text-white/80',
      className
    )}>
      {children}
    </p>
  );
}

// ModalBody component
interface ModalBodyProps {
  className?: string;
  children: React.ReactNode;
}

function ModalBody({ className, children }: ModalBodyProps) {
  return (
    <div className={cn(
      'modal-body flex-grow overflow-y-auto p-5 md:p-6',
      'bg-gray-50 dark:bg-gray-900/30',
      className
    )}>
      {children}
    </div>
  );
}

// ModalFooter component
interface ModalFooterProps {
  className?: string;
  children: React.ReactNode;
}

function ModalFooter({ className, children }: ModalFooterProps) {
  return (
    <div className={cn(
      'modal-footer flex items-center justify-end p-4',
      'bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700',
      'gap-3',
      className
    )}>
      {children}
    </div>
  );
}

// Pre-built action buttons
interface ModalActionsProps {
  onCancel?: () => void;
  onConfirm?: () => void;
  cancelText?: string;
  confirmText?: string;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'destructive';
  className?: string;
}

function ModalActions({
  onCancel,
  onConfirm,
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  isLoading = false,
  disabled = false,
  variant = 'default',
  className
}: ModalActionsProps) {
  const { onClose } = useModalContext();

  const handleCancel = onCancel || onClose;

  return (
    <div className={cn('flex justify-end gap-3', className)}>
      <Button
        variant="outline"
        onClick={handleCancel}
        disabled={isLoading}
      >
        {cancelText}
      </Button>
      
      {onConfirm && (
        <Button
          onClick={onConfirm}
          disabled={disabled || isLoading}
          className={cn(
            variant === 'destructive' 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-[#ED8936] hover:bg-[#ED8936]/90 text-white'
          )}
        >
          {isLoading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
              />
              Loading...
            </>
          ) : (
            confirmText
          )}
        </Button>
      )}
    </div>
  );
}

// Convenience hook for modal state management
function useModalState(initialOpen = false) {
  const [isOpen, setIsOpen] = React.useState(initialOpen);
  
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen
  };
}

// Compose the compound component
const Modal = Object.assign(ModalSystem, {
  Header: ModalHeader,
  Title: ModalTitle,
  Description: ModalDescription,
  Body: ModalBody,
  Footer: ModalFooter,
  Actions: ModalActions
});

export { 
  Modal, 
  ModalSystem, 
  ModalHeader, 
  ModalTitle, 
  ModalDescription, 
  ModalBody, 
  ModalFooter, 
  ModalActions,
  useModalState 
};

export type { 
  ModalSystemProps, 
  ModalHeaderProps, 
  ModalTitleProps, 
  ModalDescriptionProps, 
  ModalBodyProps, 
  ModalFooterProps, 
  ModalActionsProps 
};