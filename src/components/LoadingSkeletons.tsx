/**
 * LoadingSkeletons - Reusable skeleton loading components
 * Provides smooth loading states for better perceived performance
 */

import React from 'react';
import { cn } from '@/utils/core/ui';

interface SkeletonProps {
  className?: string;
  animate?: boolean;
}

export function Skeleton({ className, animate = true }: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-slate-200 dark:bg-slate-700 rounded',
        animate && 'animate-pulse',
        className
      )}
    />
  );
}

// Task Card Skeleton
export function TaskCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <div
      className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200/40 shadow-sm min-h-[56px] animate-in fade-in slide-in-from-left-2"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center gap-4 flex-1">
        {/* Status Icon Skeleton */}
        <Skeleton className="h-5 w-5 rounded-full" />
        
        <div className="flex-1 space-y-2">
          {/* Title Skeleton */}
          <Skeleton className="h-4 w-3/4" />
          
          {/* Meta info skeleton */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </div>
      
      {/* Actions skeleton */}
      <Skeleton className="h-8 w-8 rounded" />
    </div>
  );
}

// Multiple Task Cards Skeleton
export function TaskListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }, (_, i) => (
        <TaskCardSkeleton key={i} index={i} />
      ))}
    </div>
  );
}

// Phase Header Skeleton
export function PhaseHeaderSkeleton() {
  return (
    <div className="p-4 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
      
      <div className="flex gap-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-32" />
      </div>
    </div>
  );
}

// Progress Bar Skeleton
export function ProgressBarSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  );
}

// Button Loading State
interface LoadingButtonProps {
  children: React.ReactNode;
  isLoading?: boolean;
  className?: string;
  [key: string]: any;
}

export function LoadingButton({ 
  children, 
  isLoading = false, 
  className, 
  disabled,
  ...props 
}: LoadingButtonProps) {
  return (
    <button
      className={cn(
        'relative transition-all duration-200',
        isLoading && 'cursor-not-allowed',
        className
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <span className={cn(isLoading && 'opacity-0')}>
        {children}
      </span>
    </button>
  );
}

// Optimistic Task Card (shows pending state)
interface OptimisticTaskCardProps {
  children: React.ReactNode;
  isPending?: boolean;
  operation?: 'updating' | 'deleting' | 'creating';
}

export function OptimisticTaskCard({ 
  children, 
  isPending = false, 
  operation = 'updating' 
}: OptimisticTaskCardProps) {
  const overlayColors = {
    updating: 'bg-blue-50/80',
    deleting: 'bg-red-50/80',
    creating: 'bg-green-50/80'
  };

  const spinnerColors = {
    updating: 'border-blue-500',
    deleting: 'border-red-500',
    creating: 'border-green-500'
  };

  return (
    <div className={cn('relative', isPending && 'pointer-events-none')}>
      {isPending && (
        <div className={cn(
          'absolute inset-0 rounded-lg flex items-center justify-center z-10',
          overlayColors[operation]
        )}>
          <div className="flex items-center gap-2 px-3 py-1 bg-white/90 rounded-full shadow-sm">
            <div className={cn(
              'w-3 h-3 border-2 border-t-transparent rounded-full animate-spin',
              spinnerColors[operation]
            )} />
            <span className="text-xs font-medium text-slate-700 capitalize">
              {operation}...
            </span>
          </div>
        </div>
      )}
      <div className={cn(isPending && 'opacity-75 transition-opacity')}>
        {children}
      </div>
    </div>
  );
}

// Full Page Loading
export function PageLoadingSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      
      {/* Content sections */}
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-2">
            {Array.from({ length: 4 }, (_, j) => (
              <Skeleton key={j} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}