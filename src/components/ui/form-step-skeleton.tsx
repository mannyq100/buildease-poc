/**
 * FormStepSkeleton Component
 * 
 * Loading skeleton for form steps during lazy loading
 * Provides visual feedback while components are loading
 */
import React from 'react';
import { Card } from './card';

interface FormStepSkeletonProps {
  variant?: 'basic' | 'detailed' | 'grid';
  className?: string;
}

/**
 * Basic skeleton component for loading states
 */
function SkeletonBox({ className = '' }: { className?: string }) {
  return (
    <div 
      className={`bg-slate-200 dark:bg-slate-700 animate-pulse rounded-lg ${className}`}
      role="status"
      aria-label="Loading..."
    />
  );
}

/**
 * Form field skeleton
 */
function FormFieldSkeleton() {
  return (
    <div className="space-y-3">
      {/* Label */}
      <SkeletonBox className="h-6 w-32" />
      {/* Input */}
      <SkeletonBox className="h-14 w-full rounded-xl" />
    </div>
  );
}

/**
 * Grid item skeleton for card-based layouts
 */
function GridItemSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-xl p-5 space-y-4">
      {/* Header with icon and title */}
      <div className="flex items-center gap-3">
        <SkeletonBox className="w-10 h-10 rounded-xl" />
        <SkeletonBox className="h-6 w-24" />
      </div>
      {/* Select dropdown */}
      <SkeletonBox className="h-12 w-full rounded-lg" />
    </div>
  );
}

/**
 * Main form step skeleton component
 */
export function FormStepSkeleton({ variant = 'basic', className = '' }: FormStepSkeletonProps) {
  const baseClasses = `space-y-6 ${className}`;

  if (variant === 'grid') {
    return (
      <div className={baseClasses}>
        {/* Title */}
        <div className="space-y-3">
          <SkeletonBox className="h-8 w-48" />
          <SkeletonBox className="h-4 w-64" />
        </div>

        {/* Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <GridItemSkeleton key={index} />
          ))}
        </div>

        {/* Tips section */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <SkeletonBox className="w-10 h-10 rounded-xl" />
            <SkeletonBox className="h-6 w-32" />
          </div>
          <div className="space-y-2">
            <SkeletonBox className="h-4 w-full" />
            <SkeletonBox className="h-4 w-5/6" />
            <SkeletonBox className="h-4 w-4/5" />
          </div>
        </Card>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={baseClasses}>
        {/* Main content area */}
        <Card className="p-6 space-y-6">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-6">
            <SkeletonBox className="w-10 h-10 rounded-xl" />
            <div className="space-y-2">
              <SkeletonBox className="h-6 w-40" />
              <SkeletonBox className="h-4 w-56" />
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormFieldSkeleton />
            <FormFieldSkeleton />
          </div>
        </Card>

        {/* Additional section */}
        <div className="space-y-6">
          <FormFieldSkeleton />
          
          {/* Textarea-like field */}
          <div className="space-y-3">
            <SkeletonBox className="h-6 w-32" />
            <SkeletonBox className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Basic variant (default)
  return (
    <div className={baseClasses}>
      {/* Form section */}
      <div className="space-y-8">
        {/* Primary fields */}
        <FormFieldSkeleton />
        <FormFieldSkeleton />
        
        {/* Radio group skeleton */}
        <div className="space-y-4">
          <SkeletonBox className="h-6 w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="border-2 border-slate-300 dark:border-slate-600 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-4">
                  <SkeletonBox className="w-5 h-5 rounded-full" />
                  <SkeletonBox className="w-12 h-12 rounded-xl" />
                  <div className="space-y-2">
                    <SkeletonBox className="h-5 w-32" />
                    <SkeletonBox className="h-4 w-40" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Step-specific skeleton variants
 */
export const ProjectDetailsFormSkeleton = () => <FormStepSkeleton variant="basic" />;
export const LocationPlotFormSkeleton = () => <FormStepSkeleton variant="detailed" />;
export const BuildingSpecsFormSkeleton = () => <FormStepSkeleton variant="grid" />;
export const BudgetTimelineFormSkeleton = () => <FormStepSkeleton variant="detailed" />;
export const MaterialsConstructionFormSkeleton = () => <FormStepSkeleton variant="basic" />;
export const FeaturesFormSkeleton = () => <FormStepSkeleton variant="basic" />;
export const ReviewSubmitFormSkeleton = () => <FormStepSkeleton variant="detailed" />;