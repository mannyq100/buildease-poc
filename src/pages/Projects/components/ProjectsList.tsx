/**
 * Enhanced Projects List with touch-optimized mobile design
 * Displays project cards with construction worker-friendly interactions
 */

import { useState, useOptimistic, useTransition, useMemo, memo } from 'react';
import { AlertCircle, Loader2, Zap } from 'lucide-react';
import { TouchOptimizedButton } from '@/components/ui/TouchOptimizedButton';
import { ProjectCard } from '@/components/shared/ProjectCard';
import { cn } from '@/utils/core/ui';
import type { 
  ProjectsListProps 
} from '@/types/enhanced-projects';
import type { Project, ProjectStatus } from '@/types/project';

// Helper function to map project status to ProjectCard status
function mapProjectStatus(status: ProjectStatus): 'active' | 'completed' | 'pending' | 'delayed' {
  console.log('Mapping project status:', status);
  switch (status) {
    case 'active':
      return 'active';
    case 'completed':
      return 'completed';
    case 'planning':
    case 'upcoming':
      return 'pending';
    case 'on-hold':
      return 'delayed';
    default:
      console.warn('Unknown status, using pending:', status);
      return 'pending';
  }
}

export const ProjectsList = memo(function ProjectsList({ 
  projects, 
  loading = false, 
  error = null,
  viewSettings,
  actions,
  className 
}: ProjectsListProps) {
  const [isPending, startTransition] = useTransition();
  const [performanceMode, setPerformanceMode] = useState<'standard' | 'optimized'>('standard');
  
  // Debug logging
  console.log('ProjectsList render:', {
    projectsCount: projects?.length || 0,
    loading,
    error,
    projects: projects?.slice(0, 1) // Log first project for debugging
  });
  
  // Optimistic updates for instant UI feedback
  const [optimisticProjects, addOptimisticUpdate] = useOptimistic(
    projects,
    (state: Project[], action: { type: string; projectId: string; payload?: any }) => {
      switch (action.type) {
        case 'UPDATE_STATUS':
          return state.map(project => 
            project.id === action.projectId 
              ? { ...project, status: action.payload.status }
              : project
          );
        case 'DELETE':
          return state.filter(project => project.id !== action.projectId);
        case 'DUPLICATE':
          const originalProject = state.find(p => p.id === action.projectId);
          if (!originalProject) return state;
          const duplicatedProject: Project = {
            ...originalProject,
            id: `temp-${Date.now()}`,
            name: action.payload.newName,
            status: 'planning',
            progress: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          return [duplicatedProject, ...state];
        default:
          return state;
      }
    }
  );

  // Performance optimization: limit rendering for large datasets
  const shouldOptimize = optimisticProjects.length > 50;
  const displayProjects = useMemo(() => {
    if (performanceMode === 'optimized' && shouldOptimize) {
      // Show only first 50 items in optimized mode
      return optimisticProjects.slice(0, 50);
    }
    return optimisticProjects;
  }, [optimisticProjects, performanceMode, shouldOptimize]);
  
  if (loading) {
    return <ProjectsListSkeleton className={className} />;
  }
  
  if (error) {
    return (
      <div className={cn("p-6 border border-red-200 bg-red-50 rounded-lg", className)}>
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <h3 className="font-medium text-red-900">Unable to Load Projects</h3>
        </div>
        <p className="text-sm text-red-700">
          Please check your connection and try again.
        </p>
      </div>
    );
  }
  
  if (!optimisticProjects || optimisticProjects.length === 0) {
    return (
      <EmptyProjectsState 
        className={className}
        onCreateProject={() => window.location.href = '/projects/new'}
      />
    );
  }
  
  
  return (
    <div className={className}>
      {/* Performance mode toggle for large datasets */}
      {shouldOptimize && (
        <div className="flex items-center justify-between p-3 mb-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-600" />
            <span className="text-sm text-amber-700">
              Large dataset detected ({optimisticProjects.length} projects)
            </span>
          </div>
          <TouchOptimizedButton
            touchSize="sm"
            variant={performanceMode === 'optimized' ? 'default' : 'outline'}
            onClick={() => setPerformanceMode(
              performanceMode === 'optimized' ? 'standard' : 'optimized'
            )}
            className="text-xs"
          >
            {performanceMode === 'optimized' ? 'Show All' : 'Optimize'}
          </TouchOptimizedButton>
        </div>
      )}
      
      {/* Loading indicator for pending transitions */}
      {isPending && (
        <div className="flex items-center justify-center p-4 mb-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600 mr-2" />
          <span className="text-sm text-blue-700">Updating projects...</span>
        </div>
      )}
      
      {/* Projects Grid/List */}
      <div className={cn(
        "grid gap-4 transition-opacity duration-200",
        viewSettings.layout === 'grid' 
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
          : "grid-cols-1",
        isPending && "opacity-75"
      )}>
        {displayProjects.map((project) => (
          <ProjectCard
            key={project.id}
            title={project.name}
            description={project.description}
            client={project.client}
            owner={project.owner_name}
            status={mapProjectStatus(project.status)}
            progress={project.progress}
            imageUrl={''}
            startDate={project.start_date ? new Date(project.start_date).toLocaleDateString() : undefined}
            endDate={project.end_date ? new Date(project.end_date).toLocaleDateString() : undefined}
            team={project.teamMembers}
            budget={{
              total: project.budget,
              spent: project.spent,
              currency: project.currency
            }}
            onClick={() => actions.onView(project)}
            className={cn(
              "transition-all duration-200",
              isPending && project.id.startsWith('temp-') && "opacity-75"
            )}
          />
        ))}
      </div>
      
      {/* Performance info and load more indicator */}
      {performanceMode === 'optimized' && shouldOptimize && (
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
          <p className="text-sm text-slate-600">
            Showing {displayProjects.length} of {optimisticProjects.length} projects
          </p>
          <TouchOptimizedButton
            touchSize="sm"
            variant="outline"
            onClick={() => setPerformanceMode('standard')}
            className="mt-2"
          >
            Show All Projects
          </TouchOptimizedButton>
        </div>
      )}
      
    </div>
  );
});

/**
 * Empty state component for when no projects exist
 */
function EmptyProjectsState({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4", className)}>
      <div className="text-center space-y-4 max-w-md">
        <h3 className="text-lg font-semibold text-slate-900">
          No Projects Yet
        </h3>
        <p className="text-slate-600">
          Get started by creating your first construction project.
        </p>
      </div>
    </div>
  );
}

/**
 * Loading skeleton for projects list
 */
function ProjectsListSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="h-48 bg-slate-200 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}