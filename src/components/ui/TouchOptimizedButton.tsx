/**
 * Touch-optimized button component for construction workers
 * Ensures minimum 44px touch targets and thumb-friendly interactions
 */

import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/utils/core/ui';

interface TouchOptimizedButtonProps extends ButtonProps {
  touchSize?: 'sm' | 'md' | 'lg';
  hapticFeedback?: boolean;
}

export const TouchOptimizedButton = React.forwardRef<
  HTMLButtonElement,
  TouchOptimizedButtonProps
>(({ 
  touchSize = 'md', 
  hapticFeedback = false,
  className, 
  children, 
  onClick,
  ...props 
}, ref) => {
  const sizeClasses = {
    sm: 'min-h-[44px] min-w-[44px] px-4 py-3 text-sm',
    md: 'min-h-[56px] min-w-[56px] px-6 py-4 text-base',
    lg: 'min-h-[64px] min-w-[64px] px-8 py-5 text-lg font-semibold'
  };
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Provide haptic feedback on mobile devices
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10); // Short vibration
    }
    
    // Add visual feedback for touch
    const button = e.currentTarget;
    button.style.transform = 'scale(0.98)';
    
    setTimeout(() => {
      button.style.transform = 'scale(1)';
    }, 100);
    
    // Call original onClick handler
    onClick?.(e);
  };
  
  return (
    <Button
      ref={ref}
      className={cn(
        sizeClasses[touchSize],
        "transition-all duration-100 active:scale-98",
        "focus:ring-2 focus:ring-buildease-blue-500 focus:ring-offset-2",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  );
});

TouchOptimizedButton.displayName = "TouchOptimizedButton";

/**
 * Floating Action Button optimized for mobile
 */
interface FloatingActionButtonProps extends TouchOptimizedButtonProps {
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  icon?: React.ComponentType<{ className?: string }>;
  ariaLabel?: string;
}

export const FloatingActionButton = React.forwardRef<
  HTMLButtonElement,
  FloatingActionButtonProps
>(({ 
  position = 'bottom-right',
  className,
  children,
  icon: Icon,
  ariaLabel,
  ...props 
}, ref) => {
  const positionClasses = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'bottom-center': 'fixed bottom-6 left-1/2 transform -translate-x-1/2'
  };
  
  return (
    <TouchOptimizedButton
      ref={ref}
      touchSize="lg"
      hapticFeedback
      aria-label={ariaLabel}
      className={cn(
        positionClasses[position],
        "rounded-full shadow-lg hover:shadow-xl z-50",
        "bg-buildease-blue-600 hover:bg-buildease-blue-700 text-white",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="h-6 w-6" />}
      {children}
    </TouchOptimizedButton>
  );
});

FloatingActionButton.displayName = "FloatingActionButton";

/**
 * Quick Action Button for bottom sheets and action panels
 */
interface QuickActionButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label?: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'warning' | 'success';
  className?: string;
  ariaLabel?: string;
}

export function QuickActionButton({ 
  icon: Icon, 
  label, 
  onClick, 
  disabled = false,
  variant = 'default',
  className,
  ariaLabel
}: QuickActionButtonProps) {
  const variantClasses = {
    default: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
    primary: 'bg-buildease-blue-100 hover:bg-buildease-blue-200 text-buildease-blue-700',
    warning: 'bg-orange-100 hover:bg-orange-200 text-orange-700',
    success: 'bg-green-100 hover:bg-green-200 text-green-700'
  };
  
  if (label) {
    return (
      <TouchOptimizedButton
        touchSize="lg"
        hapticFeedback
        variant="ghost"
        disabled={disabled}
        onClick={onClick}
        aria-label={ariaLabel || label}
        className={cn(
          "flex flex-col items-center gap-2 h-20 w-full rounded-xl",
          variantClasses[variant],
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <Icon className="h-6 w-6" />
        <span className="text-sm font-medium">{label}</span>
      </TouchOptimizedButton>
    );
  }
  
  // Icon-only button
  return (
    <TouchOptimizedButton
      touchSize="sm"
      hapticFeedback
      variant="ghost"
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "p-2 rounded-lg",
        variantClasses[variant],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <Icon className="h-4 w-4" />
    </TouchOptimizedButton>
  );
}

/**
 * Tab button optimized for mobile navigation
 */
interface TouchTabButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  badge?: number;
  onClick: () => void;
}

export function TouchTabButton({ 
  icon: Icon, 
  label, 
  active = false, 
  badge,
  onClick 
}: TouchTabButtonProps) {
  return (
    <TouchOptimizedButton
      variant="ghost"
      touchSize="md"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 h-16 w-full rounded-none relative",
        active 
          ? "text-buildease-blue-600 bg-buildease-blue-50" 
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
      )}
    >
      <div className="relative">
        <Icon className="h-5 w-5" />
        {badge !== undefined && badge > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {badge > 99 ? '99+' : badge}
          </div>
        )}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </TouchOptimizedButton>
  );
}