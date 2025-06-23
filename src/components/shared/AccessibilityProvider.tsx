/**
 * Accessibility Provider Component
 * Global accessibility features and utilities for the BuildEase application
 * Provides skip links, screen reader announcements, and accessibility settings
 */

import React, { createContext, useContext, useCallback } from 'react';
import { useSkipLinks, useScreenReader, useReducedMotion, useHighContrast } from '@/hooks/useAccessibility';
import { cn } from '@/utils/core/ui';

interface AccessibilityContextValue {
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
  announceNavigation: (page: string, totalPages?: number) => void;
  announceStatus: (status: string, details?: string) => void;
  prefersReducedMotion: boolean;
  isHighContrast: boolean;
  addSkipLink: (target: string, label: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export function useAccessibilityContext() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibilityContext must be used within AccessibilityProvider');
  }
  return context;
}

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const { getSkipLinksContainer, addSkipLink } = useSkipLinks();
  const { announce, announceNavigation, announceStatus, getAnnouncementElement } = useScreenReader();
  const { prefersReducedMotion } = useReducedMotion();
  const { isHighContrast } = useHighContrast();

  const contextValue: AccessibilityContextValue = {
    announceToScreenReader: announce,
    announceNavigation,
    announceStatus,
    prefersReducedMotion,
    isHighContrast,
    addSkipLink
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {/* Skip Links Container */}
      {getSkipLinksContainer()}
      
      {/* Screen Reader Announcements */}
      {getAnnouncementElement()}
      
      {/* Main Content */}
      <div 
        className={cn(
          prefersReducedMotion && 'motion-reduce',
          isHighContrast && 'high-contrast'
        )}
      >
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
}

// Accessible Button Component
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  iconPosition?: 'left' | 'right';
  announceOnClick?: string;
}

export function AccessibleButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  announceOnClick,
  className,
  onClick,
  disabled,
  ...props
}: AccessibleButtonProps) {
  const { announceToScreenReader } = useAccessibilityContext();
  const { getAnimationProps } = useReducedMotion();

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (announceOnClick) {
      announceToScreenReader(announceOnClick);
    }
    onClick?.(e);
  }, [onClick, announceOnClick, announceToScreenReader]);

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm min-h-[32px]',
    md: 'px-4 py-2 text-sm min-h-[40px]',
    lg: 'px-6 py-3 text-base min-h-[48px]'
  };

  const variantClasses = {
    primary: 'bg-[#2B6CB0] hover:bg-[#2B6CB0]/90 text-white focus:ring-[#2B6CB0]',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-400',
    ghost: 'hover:bg-gray-100 text-gray-700 focus:ring-gray-400',
    destructive: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
  };

  const animationProps = getAnimationProps(
    { transition: 'all 150ms ease-in-out' },
    { transition: 'none' }
  );

  const isDisabled = disabled || loading;

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white',
        'focus-visible:ring-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      style={animationProps}
      onClick={handleClick}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      
      {Icon && iconPosition === 'left' && !loading && (
        <Icon className={cn('h-4 w-4', children && 'mr-2')} aria-hidden="true" />
      )}
      
      {children}
      
      {Icon && iconPosition === 'right' && !loading && (
        <Icon className={cn('h-4 w-4', children && 'ml-2')} aria-hidden="true" />
      )}
      
      {loading && (
        <span className="sr-only">Loading...</span>
      )}
    </button>
  );
}

// Accessible Input Component
interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  description?: string;
  required?: boolean;
}

export function AccessibleInput({
  id,
  label,
  error,
  description,
  required,
  className,
  ...props
}: AccessibleInputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const descriptionId = description ? `${inputId}-description` : undefined;

  const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="space-y-1">
      <label 
        htmlFor={inputId}
        className={cn(
          'block text-sm font-medium text-gray-700 dark:text-gray-300',
          required && 'after:content-["*"] after:ml-0.5 after:text-red-500'
        )}
      >
        {label}
      </label>
      
      {description && (
        <p id={descriptionId} className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      
      <input
        id={inputId}
        className={cn(
          'block w-full rounded-md border-gray-300 shadow-sm',
          'focus:border-[#2B6CB0] focus:ring-[#2B6CB0] focus:ring-1',
          'disabled:bg-gray-50 disabled:text-gray-500',
          error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
          className
        )}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={describedBy}
        aria-required={required}
        {...props}
      />
      
      {error && (
        <p id={errorId} className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// Accessible Link Component
interface AccessibleLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'default' | 'button' | 'subtle';
  external?: boolean;
}

export function AccessibleLink({
  children,
  variant = 'default',
  external = false,
  className,
  ...props
}: AccessibleLinkProps) {
  const variantClasses = {
    default: 'text-[#2B6CB0] hover:text-[#2B6CB0]/80 underline underline-offset-2',
    button: 'inline-flex items-center px-4 py-2 bg-[#2B6CB0] text-white rounded-md hover:bg-[#2B6CB0]/90',
    subtle: 'text-gray-600 hover:text-[#2B6CB0] hover:underline'
  };

  return (
    <a
      className={cn(
        'focus:outline-none focus:ring-2 focus:ring-[#2B6CB0] focus:ring-offset-2 rounded',
        'focus-visible:ring-2',
        variantClasses[variant],
        className
      )}
      {...(external && {
        target: '_blank',
        rel: 'noopener noreferrer',
        'aria-label': `${props['aria-label'] || children} (opens in new tab)`
      })}
      {...props}
    >
      {children}
      {external && (
        <svg
          className="ml-1 h-3 w-3"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
            clipRule="evenodd"
          />
          <path
            fillRule="evenodd"
            d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </a>
  );
}

// Accessible Heading Component
interface AccessibleHeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function AccessibleHeading({ level, children, className, id }: AccessibleHeadingProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  const sizeClasses = {
    1: 'text-3xl md:text-4xl font-bold',
    2: 'text-2xl md:text-3xl font-bold',
    3: 'text-xl md:text-2xl font-semibold',
    4: 'text-lg md:text-xl font-semibold',
    5: 'text-base md:text-lg font-medium',
    6: 'text-sm md:text-base font-medium'
  };

  return (
    <Tag
      id={id}
      className={cn(
        'text-gray-900 dark:text-white',
        sizeClasses[level],
        className
      )}
    >
      {children}
    </Tag>
  );
}