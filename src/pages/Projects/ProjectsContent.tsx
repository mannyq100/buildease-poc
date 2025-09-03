/**
 * Progressive loading content for Projects page
 * Implements React 19 Suspense boundaries for optimal mobile performance
 */

import React, { Suspense, useMemo, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { useAllProjectSummaries, useProjectMetrics } from '@/hooks/queries/useProjectSummary';
import type { ProjectSummaryFilters } from '@/hooks/queries/useProjectSummary';
import type { ProjectSummary } from '@/types/projectSummary';
import { ProjectsErrorBoundary } from '@/components/error-boundaries/ProjectsErrorBoundary';
import { 
  ProjectsMetricsSkeleton, 
  ProjectsFiltersSkeleton, 
  ProjectsListSkeleton 
} from '@/components/ui/projects-skeletons';
import { TouchOptimizedButton } from '@/components/ui/TouchOptimizedButton';
import { createSupabaseError } from '@/lib/error-utils';
import type { ProjectsContentProps } from '@/types/enhanced-projects';

// Lazy load components with intelligent preloading
const ProjectsMetrics = React.lazy(() => 
  import('./components/ProjectsMetrics').then(m => ({ default: m.ProjectsMetrics }))
);

const ProjectsFilters = React.lazy(() => 
  import('./components/ProjectsFilters').then(m => ({ default: m.ProjectsFilters }))
);

const ProjectsList = React.lazy(() => 
  import('./components/ProjectsList').then(m => ({ default: m.ProjectsList }))
);

// Preload components on idle for better performance
if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
  window.requestIdleCallback(() => {
    // Preload components during browser idle time
    import('./components/ProjectsMetrics');
    import('./components/ProjectsFilters');
    import('./components/ProjectsList');
  });
} else {
  // Fallback for browsers without requestIdleCallback
  setTimeout(() => {
    import('./components/ProjectsMetrics');
    import('./components/ProjectsFilters');
    import('./components/ProjectsList');
  }, 100);
}

export const ProjectsContent = React.memo<ProjectsContentProps>(function ProjectsContent({ 
  filters, 
  onFiltersChange, 
  viewSettings, 
  onViewSettingsChange 
}) {
  
  const handleCreateProject = useCallback(() => {
    window.location.href = '/projects/new';
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Enhanced Background with Construction Theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-orange-50/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.1)_1px,transparent_0)] bg-[length:20px_20px]" />
      
      <div className="relative space-y-6 p-6">
        {/* Enhanced Project Metrics Section with Create Button */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-blue-200/30 overflow-hidden
                        hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-orange-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500" />
          
          {/* Header Section with Create Button */}
          <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg">🏗️</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Project Overview</h1>
                  <p className="text-blue-100 text-sm">Manage your construction portfolio</p>
                </div>
              </div>
              
              <TouchOptimizedButton
                touchSize="md"
                onClick={handleCreateProject}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 
                          hover:border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 
                          hover:scale-105 font-semibold"
              >
                <Plus className="mr-2 h-5 w-5" />
                <span className="hidden sm:inline">Create Project</span>
                <span className="sm:hidden">Create</span>
              </TouchOptimizedButton>
            </div>
          </div>
          
          {/* Metrics Content */}
          <div className="p-6 bg-gradient-to-br from-white via-blue-50/20 to-orange-50/10">
            <Suspense fallback={<ProjectsMetricsSkeleton />}>
              <ProjectsMetricsSection />
            </Suspense>
          </div>
        </div>

        {/* Enhanced Filters Section */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-slate-200/60 overflow-hidden
                        hover:shadow-xl hover:shadow-slate-500/5 transition-all duration-300">
          <div className="bg-gradient-to-r from-slate-100 to-slate-50 px-6 py-4 border-b border-slate-200/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xs">🔍</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Smart Filters</h3>
                <p className="text-sm text-slate-600">Find projects quickly</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <Suspense fallback={<ProjectsFiltersSkeleton />}>
              <ProjectsFiltersSection 
                filters={filters}
                onFiltersChange={onFiltersChange}
              />
            </Suspense>
          </div>
        </div>

        {/* Projects List Section */}
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200/60 overflow-hidden
                        hover:shadow-2xl hover:shadow-slate-500/10 transition-all duration-500">
          <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-5 border-b border-slate-200/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">📋</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Construction Projects</h3>
                <p className="text-sm text-slate-600">Active building portfolio</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-white to-slate-50/30">
            <Suspense fallback={<ProjectsListSkeleton />}>
              <ProjectsListSection 
                filters={filters}
                viewSettings={viewSettings}
                onViewSettingsChange={onViewSettingsChange}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
});


/**
 * Projects Metrics Section with error boundary
 */
const ProjectsMetricsSection = React.memo(function ProjectsMetricsSection() {
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
});

/**
 * Projects Filters Section with error boundary
 */
const ProjectsFiltersSection = React.memo<{
  filters: ProjectsContentProps['filters'];
  onFiltersChange: ProjectsContentProps['onFiltersChange'];
}>(function ProjectsFiltersSection({ 
  filters, 
  onFiltersChange 
}) {
  // For now, we'll implement basic filters. Status counts can be added later
  return (
    <ProjectsFilters 
      filters={filters}
      onFiltersChange={onFiltersChange}
      loading={false}
    />
  );
});

/**
 * Projects List Section with error boundary and data fetching
 */
const ProjectsListSection = React.memo<{
  filters: ProjectsContentProps['filters'];
  viewSettings: ProjectsContentProps['viewSettings'];
  onViewSettingsChange: ProjectsContentProps['onViewSettingsChange'];
}>(function ProjectsListSection({ 
  filters, 
  viewSettings,
  onViewSettingsChange: _onViewSettingsChange
}) {
  // Memoize filter object to prevent unnecessary refetches
  const memoizedFilters = useMemo((): ProjectSummaryFilters => ({
    status: filters.status,
    search: filters.search,
    type: filters.type,
    client: filters.client,
  }), [filters.status, filters.search, filters.type, filters.client]);

  // Fetch project summaries with memoized filters
  const { data: projectSummaries = [], isLoading, error } = useAllProjectSummaries(memoizedFilters);

  // Memoize action handlers to prevent unnecessary re-renders
  const handleView = useCallback((project: ProjectSummary) => {
    const urlSlug = project.slug || project.id;
    window.location.href = `/project/${urlSlug}`;
  }, []);

  const handleEdit = useCallback((project: ProjectSummary) => {
    const urlSlug = project.slug || project.id;
    window.location.href = `/project/${urlSlug}/edit`;
  }, []);

  const handleDelete = useCallback((project: ProjectSummary) => {
    console.log('Delete project:', project.id);
    // TODO: Implement with mutation hook
  }, []);

  const handleDuplicate = useCallback((project: ProjectSummary, newName: string) => {
    console.log('Duplicate project:', project.id, newName);
    // TODO: Implement with mutation hook
  }, []);

  const handleStatusUpdate = useCallback((project: ProjectSummary, status: string) => {
    console.log('Update status:', project.id, status);
    // TODO: Implement with mutation hook
  }, []);

  // Memoize actions object to prevent ProjectsList re-renders
  const actions = useMemo(() => ({
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
    onDuplicate: handleDuplicate,
    onStatusUpdate: handleStatusUpdate,
  }), [handleView, handleEdit, handleDelete, handleDuplicate, handleStatusUpdate]);
  
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
      projects={projectSummaries}
      loading={isLoading}
      error={error ? createSupabaseError(error, 'network') : null}
      viewSettings={viewSettings}
      actions={actions}
    />
  );
});