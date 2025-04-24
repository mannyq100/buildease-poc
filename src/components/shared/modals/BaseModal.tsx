import React, { ReactNode } from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BaseModalProps {
  show: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  saving?: boolean;
  description?: string;
}

export function BaseModal({
  show,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  saving = false,
  description
}: BaseModalProps) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop with subtle blur */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal Content */}
          <m.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.25 
            }}
            className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col transform`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-[#2B6CB0] to-[#2B6CB0]/90 p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">{title}</h2>
                  {description && (
                    <p className="mt-1 text-sm text-white/80">{description}</p>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClose} 
                  disabled={saving}
                  className="text-white/70 hover:text-white hover:bg-white/10 rounded-full h-8 w-8 flex items-center justify-center"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Body - Scrollable with refined padding */}
            <div className="flex-grow overflow-y-auto p-5 md:p-6 bg-gray-50 dark:bg-gray-900/30">
              {children}
            </div>

            {/* Footer with subtle separator */}
            {footer && (
              <div className="flex items-center justify-end p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 gap-3">
                {footer}
              </div>
            )}
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
