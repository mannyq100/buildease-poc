/**
 * SuspenseWrapper component for React 19
 * Provides a better way to handle loading states with Suspense
 */
import React, { Suspense, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface SuspenseWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

/**
 * Default loading skeleton that matches BuildEase's design system
 * with warm blue primary color (#2B6CB0) and subtle animations
 */
export function DefaultLoadingSkeleton() {
  return (
    <Card className="border-0 shadow-sm overflow-hidden w-full animate-pulse">
      <CardContent className="p-6 space-y-4">
        <div className="h-6 bg-blue-100 dark:bg-blue-900/30 rounded-md w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-md w-full"></div>
          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-md w-5/6"></div>
          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-md w-4/6"></div>
        </div>
        <div className="flex space-x-4 pt-2">
          <div className="h-10 bg-blue-100 dark:bg-blue-900/30 rounded-md w-1/4"></div>
          <div className="h-10 bg-orange-100 dark:bg-orange-900/30 rounded-md w-1/4"></div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * SuspenseWrapper component that provides a consistent way to handle loading states
 * Optimized for React 19's improved Suspense capabilities
 */
export function SuspenseWrapper({ children, fallback, className = '' }: SuspenseWrapperProps) {
  return (
    <Suspense fallback={fallback || <DefaultLoadingSkeleton />}>
      <div className={className}>
        {children}
      </div>
    </Suspense>
  );
}

/**
 * Higher-order component that wraps a component with SuspenseWrapper
 * Makes it easier to add Suspense to existing components
 */
export function withSuspense<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
): React.FC<P & { className?: string }> {
  return function WithSuspense(props: P & { className?: string }) {
    const { className, ...componentProps } = props;
    return (
      <SuspenseWrapper fallback={fallback} className={className}>
        <Component {...componentProps as P} />
      </SuspenseWrapper>
    );
  };
}
