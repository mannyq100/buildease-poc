/**
 * Enhanced skeleton components for progressive loading
 * Provides contextual loading states for construction management
 */

import React from 'react';
import { cn } from '@/utils/core/ui';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonProps {
  className?: string;
}

/**
 * Main project details skeleton for initial page load
 */
export function ProjectDetailsSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-slate-50 to-buildease-blue-50/30", className)}>
      <div className="container mx-auto px-4 py-6 lg:px-6 xl:px-8">
        {/* Hero section skeleton */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-28" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Main content skeleton */}
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4 space-y-6">
            <CurrentPhaseSkeleton />
            <AIAssistantSkeleton />
          </div>
          <div className="lg:col-span-8">
            <DetailsSkeleton />
          </div>
        </div>
        
        {/* Workflow sections skeleton */}
        <div className="mt-12 space-y-8">
          <WorkflowSkeleton />
          <WorkflowSkeleton />
          <WorkflowSkeleton />
        </div>
      </div>
    </div>
  );
}

/**
 * Current phase section skeleton
 */
export function CurrentPhaseSkeleton({ className }: SkeletonProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * AI Assistant card skeleton
 */
export function AIAssistantSkeleton({ className }: SkeletonProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-5 w-24" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-8 w-28" />
      </CardContent>
    </Card>
  );
}

/**
 * Details accordion skeleton
 */
export function DetailsSkeleton({ className }: SkeletonProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6 space-y-6">
        {/* Project overview section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-8 w-8" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
        </div>
        
        {/* Divider */}
        <Skeleton className="h-px w-full" />
        
        {/* Additional sections */}
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/**
 * Workflow section skeleton
 */
export function WorkflowSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Section header */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <div className="space-y-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-1 w-16 rounded-full" />
        </div>
      </div>
      
      {/* Section content */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Task list skeleton
 */
export function TaskListSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: 5 }, (_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <Skeleton className="h-5 w-5 rounded mt-0.5" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Material list skeleton
 */
export function MaterialListSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <div className="text-right space-y-1">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-3 w-8" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Team member list skeleton
 */
export function TeamMemberSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/**
 * Projects page specific skeletons
 */
export function ProjectsMetricsSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6", className)}>
      {Array.from({ length: 4 }, (_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-12 w-12 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ProjectsFiltersSkeleton({ className }: SkeletonProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProjectsListSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: 6 }, (_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}