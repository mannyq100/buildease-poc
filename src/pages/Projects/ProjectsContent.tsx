/**
 * Progressive loading content for Projects page
 * Implements React 19 Suspense boundaries for optimal mobile performance
 */

import React, { Suspense, useState } from 'react';
import { useProjects, useProjectMetrics } from '@/hooks/queries';
import { ProjectsErrorBoundary } from '@/components/error-boundaries/ProjectsErrorBoundary';
import { 
  ProjectsMetricsSkeleton, 
  ProjectsFiltersSkeleton, 
  ProjectsListSkeleton 
} from '@/components/ui/projects-skeletons';
import { createSupabaseError } from '@/lib/error-utils';
import { useInfiniteProjects } from '@/hooks/useInfiniteProjects';
import { TouchOptimizedButton } from '@/components/ui/TouchOptimizedButton';
import type { ProjectsContentProps } from '@/types/enhanced-projects';

// Lazy load heavy components for better performance
const ProjectsMetrics = React.lazy(() => 
  import('./components/ProjectsMetrics').then(m => ({ default: m.ProjectsMetrics }))
);

const ProjectsFilters = React.lazy(() => 
  import('./components/ProjectsFilters').then(m => ({ default: m.ProjectsFilters }))
);

const ProjectsList = React.lazy(() => 
  import('./components/ProjectsList').then(m => ({ default: m.ProjectsList }))
);

const VirtualizedProjectsList = React.lazy(() => 
  import('./components/VirtualizedProjectsList').then(m => ({ default: m.VirtualizedProjectsList }))
);

export function ProjectsContent({ 
  filters, 
  onFiltersChange, 
  viewSettings, 
  onViewSettingsChange 
}: ProjectsContentProps) {
  const [renderMode, setRenderMode] = useState<'standard' | 'infinite' | 'virtualized'>('standard');
  
  return (
    <div className="space-y-8 pb-8">
      {/* Enhanced Project Metrics Section */}
      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
        <Suspense fallback={<ProjectsMetricsSkeleton />}>
          <ProjectsMetricsSection />
        </Suspense>
      </div>

      {/* Enhanced Filters Section */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-md border border-white/30 dark:border-slate-700/50 p-5">
        <Suspense fallback={<ProjectsFiltersSkeleton />}>
          <ProjectsFiltersSection 
            filters={filters}
            onFiltersChange={onFiltersChange}
          />
        </Suspense>
      </div>

      {/* Enhanced Projects List Section */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl shadow-md border border-white/30 dark:border-slate-700/50 overflow-hidden">
        <Suspense fallback={<ProjectsListSkeleton />}>
          {renderMode === 'virtualized' ? (
            <VirtualizedProjectsSection 
              filters={filters}
              viewSettings={viewSettings}
              onViewSettingsChange={onViewSettingsChange}
            />
          ) : renderMode === 'infinite' ? (
            <InfiniteProjectsSection 
              filters={filters}
              viewSettings={viewSettings}
              onViewSettingsChange={onViewSettingsChange}
            />
          ) : (
            <ProjectsListSection 
              filters={filters}
              viewSettings={viewSettings}
              onViewSettingsChange={onViewSettingsChange}
            />
          )}
        </Suspense>
      </div>
    </div>
  );
}

/**
 * Virtualized Projects Section
 */
function VirtualizedProjectsSection({ 
  filters, 
  viewSettings,
  onViewSettingsChange
}: { 
  filters: ProjectsContentProps['filters'];
  viewSettings: ProjectsContentProps['viewSettings'];
  onViewSettingsChange: ProjectsContentProps['onViewSettingsChange'];
}) {
  return (
    <VirtualizedProjectsList
      filters={filters}
      viewSettings={viewSettings}
      actions={{
        onView: (projectId) => window.location.href = `/project/${projectId}`,
        onEdit: (projectId) => window.location.href = `/project/${projectId}/edit`,
        onDelete: (projectId) => console.log('Delete project:', projectId),
        onDuplicate: (projectId, newName) => console.log('Duplicate project:', projectId, newName),
        onStatusUpdate: (projectId, status) => console.log('Update status:', projectId, status),
      }}
    />
  );
}

/**
 * Infinite Scroll Projects Section
 */
function InfiniteProjectsSection({ 
  filters, 
  viewSettings,
  onViewSettingsChange
}: { 
  filters: ProjectsContentProps['filters'];
  viewSettings: ProjectsContentProps['viewSettings'];
  onViewSettingsChange: ProjectsContentProps['onViewSettingsChange'];
}) {
  const {
    projects,
    totalCount,
    loadedCount,
    hasMore,
    isLoading,
    isFetchingNextPage,
    loadMore,
    loadMoreRef
  } = useInfiniteProjects({
    filters,
    pageSize: 20,
    staleTime: 5 * 60 * 1000
  });
  
  if (isLoading) {
    return <ProjectsListSkeleton />;
  }
  
  return (
    <div>
      {/* Progress indicator */}
      <div className="mb-4 text-sm text-slate-600">
        Showing {loadedCount} of {totalCount} projects
        {hasMore && <span className="ml-2 text-blue-600">• Scroll for more</span>}
      </div>
      
      {/* Projects using standard list with infinite scroll */}
      <ProjectsList
        projects={projects}
        loading={false}
        viewSettings={viewSettings}
        actions={{
          onView: (projectId) => window.location.href = `/project/${projectId}`,
          onEdit: (projectId) => window.location.href = `/project/${projectId}/edit`,
          onDelete: (projectId) => console.log('Delete project:', projectId),
          onDuplicate: (projectId, newName) => console.log('Duplicate project:', projectId, newName),
          onStatusUpdate: (projectId, status) => console.log('Update status:', projectId, status),
        }}
      />
      
      {/* Load more indicator */}
      {(hasMore || isFetchingNextPage) && (
        <div ref={loadMoreRef} className="mt-4 text-center">
          {isFetchingNextPage ? (
            <div className="text-sm text-slate-600">Loading more projects...</div>
          ) : (
            <TouchOptimizedButton
              touchSize="md"
              variant="outline"
              onClick={loadMore}
            >
              Load More Projects
            </TouchOptimizedButton>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Projects Metrics Section with error boundary
 */
function ProjectsMetricsSection() {
  const { data: metrics, isLoading, error } = useProjectMetrics();
  
  if (error) {
    const enhancedError = createSupabaseError(error, 'network');
    return (
      <ProjectsErrorBoundary 
        error={enhancedError}
        component="metrics"
        fallback={() => (
          <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
            <p className="text-sm text-orange-700">
              Unable to load project metrics. <button className="underline">Try again</button>
            </p>
          </div>
        )}
      />
    );
  }
  
  return (
    <ProjectsMetrics 
      metrics={metrics}
      loading={isLoading}
      error={error ? createSupabaseError(error, 'network') : null}
    />
  );
}

/**
 * Projects Filters Section with error boundary
 */
function ProjectsFiltersSection({ 
  filters, 
  onFiltersChange 
}: { 
  filters: ProjectsContentProps['filters'];
  onFiltersChange: ProjectsContentProps['onFiltersChange'];
}) {
  // For now, we'll implement basic filters. Status counts can be added later
  return (
    <ProjectsFilters 
      filters={filters}
      onFiltersChange={onFiltersChange}
      loading={false}
    />
  );
}

/**
 * Projects List Section with error boundary and data fetching
 */
function ProjectsListSection({ 
  filters, 
  viewSettings,
  onViewSettingsChange
}: { 
  filters: ProjectsContentProps['filters'];
  viewSettings: ProjectsContentProps['viewSettings'];
  onViewSettingsChange: ProjectsContentProps['onViewSettingsChange'];
}) {
  // Fetch projects with current filters
  const { data: projects, isLoading, error } = useProjects({
    status: filters.status,
    search: filters.search,
    type: filters.type,
    client: filters.client,
  });
  
  // Handle errors with enhanced error boundary
  if (error) {
    const enhancedError = createSupabaseError(error, 'network');
    return (
      <ProjectsErrorBoundary 
        error={enhancedError}
        component="projects-list"
      />
    );
  }
  
  return (
    <ProjectsList 
      projects={projects || []}
      loading={isLoading}
      error={error ? createSupabaseError(error, 'network') : null}
      viewSettings={viewSettings}
      actions={{
        onView: (projectId) => {
          window.location.href = `/project/${projectId}`;
        },
        onEdit: (projectId) => {
          window.location.href = `/project/${projectId}/edit`;
        },
        onDelete: (projectId) => {
          console.log('Delete project:', projectId);
          // TODO: Implement with mutation hook
        },
        onDuplicate: (projectId, newName) => {
          console.log('Duplicate project:', projectId, newName);
          // TODO: Implement with mutation hook
        },
        onStatusUpdate: (projectId, status) => {
          console.log('Update status:', projectId, status);
          // TODO: Implement with mutation hook
        },
      }}
    />
  );
}