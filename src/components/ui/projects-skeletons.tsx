/**
 * Enhanced skeleton components for Projects page progressive loading
 * Provides contextual loading states for construction management projects
 */

import React from 'react';
import { cn } from '@/utils/core/ui';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonProps {
  className?: string;
}

/**
 * Full Projects page skeleton for initial page load
 */
export function ProjectsPageSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-slate-900", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-0">
        {/* Page Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        
        {/* Metrics Skeleton */}
        <ProjectsMetricsSkeleton className="mb-8" />
        
        {/* Filters Skeleton */}
        <ProjectsFiltersSkeleton className="mb-6" />
        
        {/* Projects List Skeleton */}
        <ProjectsListSkeleton />
      </div>
    </div>
  );
}

/**
 * Projects metrics skeleton for dashboard cards
 */
export function ProjectsMetricsSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", className)}>
      {Array.from({ length: 4 }, (_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-12 w-12 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Projects filters skeleton
 */
export function ProjectsFiltersSkeleton({ className }: SkeletonProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status tabs */}
          <div className="flex gap-2">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-10 w-20" />
            ))}
          </div>
          
          {/* Search and filters */}
          <div className="flex gap-3 sm:ml-auto">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Projects list skeleton for grid view
 */
export function ProjectsListSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
      {Array.from({ length: 9 }, (_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Individual project card skeleton
 */
export function ProjectCardSkeleton({ className }: SkeletonProps) {
  return (
    <Card className={className}>
      <CardHeader className="p-0">
        <Skeleton className="h-48 w-full rounded-t-lg" />
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Project title and status */}
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          
          {/* Project details */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-8" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
          
          {/* Budget info */}
          <div className="flex justify-between">
            <div className="space-y-1">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Projects table view skeleton
 */
export function ProjectsTableSkeleton({ className }: SkeletonProps) {
  return (
    <Card className={className}>
      <CardContent className="p-0">
        {/* Table header */}
        <div className="border-b p-4">
          <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-4 w-20" />
            ))}
          </div>
        </div>
        
        {/* Table rows */}
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="border-b last:border-b-0 p-4">
            <div className="grid grid-cols-6 gap-4 items-center">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
              <Skeleton className="h-4 w-20" />
              <div className="flex gap-1">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/**
 * Empty state skeleton for when no projects match filters
 */
export function ProjectsEmptyStateSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16", className)}>
      <Skeleton className="h-16 w-16 rounded-full mb-4" />
      <Skeleton className="h-6 w-48 mb-2" />
      <Skeleton className="h-4 w-64 mb-6" />
      <Skeleton className="h-10 w-32" />
    </div>
  );
}

/**
 * Search results skeleton
 */
export function ProjectsSearchSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: 5 }, (_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-64" />
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Mobile projects list skeleton optimized for small screens
 */
export function MobileProjectsListSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: 6 }, (_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Skeleton className="h-16 w-16 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-24" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-2 w-20 rounded-full" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-12" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}