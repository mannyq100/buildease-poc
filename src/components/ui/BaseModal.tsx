import React from 'react';
import { cn } from '@/utils/core/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
  className?: string;
  showCloseButton?: boolean;
  preventCloseOnClickOutside?: boolean;
  icon?: React.ReactNode;
  stickyFooter?: boolean;

}

const sizeClasses = {
  sm: 'max-w-sm w-full mx-4',
  md: 'max-w-md w-full mx-4', 
  lg: 'max-w-lg w-full mx-4',
  xl: 'max-w-xl w-full mx-4',
  '2xl': 'max-w-2xl w-full mx-4',
  '3xl': 'max-w-3xl w-full mx-4',
  '4xl': 'max-w-4xl w-full mx-4',
  '5xl': 'max-w-5xl w-full mx-4',
  full: 'max-w-[95vw] w-full mx-4'
};

export function BaseModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'lg',
  className,
  showCloseButton = true,
  preventCloseOnClickOutside = false,
  icon,
  stickyFooter = true
}: BaseModalProps) {
  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={preventCloseOnClickOutside ? undefined : onClose}
    >
      <DialogContent 
        className={cn(
          sizeClasses[size],
          // Enhanced container styling
          'max-h-[92vh] overflow-hidden flex flex-col',
          'bg-gradient-to-br from-white via-slate-50/60 to-buildease-blue-50/20',
          'dark:from-slate-900 dark:via-slate-800/50 dark:to-buildease-blue-950/20',
          
          // Enhanced borders and shadows
          'border border-slate-200/60 dark:border-slate-700/60',
          'shadow-2xl shadow-slate-900/20 dark:shadow-black/40',
          'ring-1 ring-slate-200/30 dark:ring-slate-700/30',
          'outline outline-1 -outline-offset-1 outline-transparent',
          
          // Modern rounded corners
          'rounded-2xl',
          
          // Enhanced backdrop blur
          'backdrop-blur-xl',
          
          // Animation and transitions
          'animate-in fade-in-0 zoom-in-95 duration-300 ease-out',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          
          // Remove default padding and hide default close button
          'p-0',
          '[&>button]:hidden',
          
          // Responsive improvements
          'sm:rounded-2xl',
          'mx-2 sm:mx-4',
          
          className
        )}
        onPointerDownOutside={preventCloseOnClickOutside ? (e) => e.preventDefault() : undefined}
        onEscapeKeyDown={preventCloseOnClickOutside ? (e) => e.preventDefault() : undefined}
      >
        {/* Enhanced Header with gradient and better styling */}
        <DialogHeader className="flex-shrink-0 px-6 sm:px-8 py-5 sm:py-6 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-buildease-blue-50/50 via-white/90 to-buildease-orange-50/40 dark:from-buildease-blue-950/30 dark:via-slate-800/80 dark:to-buildease-orange-950/20 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                {icon && (
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-buildease-blue-500/10 to-buildease-orange-500/10 flex items-center justify-center ring-1 ring-slate-200/50 dark:ring-slate-700/50">
                    {icon}
                  </div>
                )}
                <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                  {title}
                </DialogTitle>
              </div>
              {description && (
                <DialogDescription className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                  {description}
                </DialogDescription>
              )}
            </div>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className={cn(
                  'flex-shrink-0 h-9 w-9 p-0 rounded-xl',
                  'hover:bg-slate-100 dark:hover:bg-slate-800',
                  'hover:text-slate-700 dark:hover:text-slate-300',
                  'transition-all duration-200',
                  'hover:scale-105 active:scale-95',
                  'focus:ring-2 focus:ring-buildease-blue-500/20 focus:ring-offset-2',
                  'group'
                )}
              >
                <X className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
                <span className="sr-only">Close</span>
              </Button>
            )}
          </div>
        </DialogHeader>
        
        {/* Enhanced Content Area */}
        <div className="flex-1 overflow-auto overscroll-contain px-6 sm:px-8 py-6 bg-gradient-to-b from-white/80 to-slate-50/60 dark:from-slate-900/80 dark:to-slate-800/60 backdrop-blur-sm">
          <div className="space-y-6">
            {children}
          </div>
        </div>
        
        {/* Enhanced Footer */}
        {footer && (
          <div className={cn(
            'flex-shrink-0 px-6 sm:px-8 py-4 sm:py-6 border-t border-slate-200/50 dark:border-slate-700/50',
            'bg-gradient-to-r from-slate-50/80 via-white/90 to-slate-50/80 dark:from-slate-800/80 dark:via-slate-900/90 dark:to-slate-800/80 backdrop-blur-sm',
            stickyFooter ? 'sticky bottom-0' : ''
          )}>
            {footer}
          </div>
        )}
        
        {/* Subtle bottom accent */}
        <div className="h-1 bg-gradient-to-r from-buildease-blue-500/20 via-buildease-orange-500/20 to-buildease-blue-500/20 rounded-b-2xl" />
      </DialogContent>
    </Dialog>
  );
}