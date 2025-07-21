/**
 * Enhanced Projects List with touch-optimized mobile design
 * Displays project cards with construction worker-friendly interactions
 */

import React, { useState, useOptimistic, useTransition, useMemo, memo } from 'react';
import { 
  MoreVertical, 
  Eye, 
  Edit, 
  Copy, 
  Trash2, 
  Calendar, 
  DollarSign, 
  Users, 
  MapPin,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Zap
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TouchOptimizedButton, QuickActionButton } from '@/components/ui/TouchOptimizedButton';
import { BottomSheet } from '@/components/mobile/BottomSheet';
import { cn } from '@/utils/core/ui';
import type { 
  ProjectsListProps, 
  UIProject, 
  ProjectViewSettings 
} from '@/types/enhanced-projects';
import type { ProjectStatus } from '@/types/project';

export const ProjectsList = memo(function ProjectsList({ 
  projects, 
  loading = false, 
  error = null,
  viewSettings,
  actions,
  className 
}: ProjectsListProps) {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showActionsSheet, setShowActionsSheet] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [performanceMode, setPerformanceMode] = useState<'standard' | 'optimized'>('standard');
  
  // Optimistic updates for instant UI feedback
  const [optimisticProjects, addOptimisticUpdate] = useOptimistic(
    projects,
    (state: UIProject[], action: { type: string; projectId: string; payload?: any }) => {
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
          const duplicatedProject: UIProject = {
            ...originalProject,
            id: `temp-${Date.now()}`,
            name: action.payload.newName,
            status: 'planning',
            progress: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
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
  
  const handleProjectAction = (projectId: string, action: string) => {
    setSelectedProject(null);
    setShowActionsSheet(false);
    
    switch (action) {
      case 'view':
        actions.onView(projectId);
        break;
      case 'edit':
        actions.onEdit(projectId);
        break;
      case 'delete':
        // Optimistic deletion with transition
        startTransition(() => {
          addOptimisticUpdate({ type: 'DELETE', projectId });
        });
        actions.onDelete(projectId);
        break;
      case 'duplicate':
        // Optimistic duplication with transition
        const originalProject = optimisticProjects.find(p => p.id === projectId);
        const newName = originalProject ? `${originalProject.name} (Copy)` : 'Project Copy';
        startTransition(() => {
          addOptimisticUpdate({ 
            type: 'DUPLICATE', 
            projectId, 
            payload: { newName } 
          });
        });
        actions.onDuplicate(projectId, newName);
        break;
    }
  };
  
  const handleStatusUpdate = (projectId: string, status: ProjectStatus) => {
    // Optimistic status update with transition
    startTransition(() => {
      addOptimisticUpdate({ 
        type: 'UPDATE_STATUS', 
        projectId, 
        payload: { status } 
      });
    });
    actions.onStatusUpdate(projectId, status);
  };
  
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
          <MemoizedProjectCard
            key={project.id}
            project={project}
            layout={viewSettings.layout}
            isPending={isPending && project.id.startsWith('temp-')}
            onShowActions={(projectId) => {
              setSelectedProject(projectId);
              setShowActionsSheet(true);
            }}
            onQuickView={() => actions.onView(project.id)}
            onStatusUpdate={handleStatusUpdate}
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
      
      {/* Project Actions Bottom Sheet */}
      <ProjectActionsSheet
        isOpen={showActionsSheet}
        onClose={() => {
          setShowActionsSheet(false);
          setSelectedProject(null);
        }}
        project={selectedProject ? optimisticProjects.find(p => p.id === selectedProject) : null}
        onAction={(action) => {
          if (selectedProject) {
            handleProjectAction(selectedProject, action);
          }
        }}
        isPending={isPending}
      />
    </div>
  );
});

/**
 * Individual project card with touch optimizations and React 19 concurrent features
 */
interface ProjectCardProps {
  project: UIProject;
  layout: ProjectViewSettings['layout'];
  isPending?: boolean;
  onShowActions: (projectId: string) => void;
  onQuickView: () => void;
  onStatusUpdate: (projectId: string, status: ProjectStatus) => void;
}

const ProjectCard = memo(function ProjectCard({ 
  project, 
  layout,
  isPending = false,
  onShowActions, 
  onQuickView,
  onStatusUpdate 
}: ProjectCardProps) {
  const isListLayout = layout === 'list';
  const isTemporary = project.id.startsWith('temp-');
  
  return (
    <Card className={cn(
      "hover:shadow-md transition-all duration-200 touch-manipulation",
      (isPending || isTemporary) && "opacity-75 scale-[0.98]",
      isTemporary && "border-dashed border-blue-300 bg-blue-50/50"
    )}>
      <CardContent className={cn(
        "p-4 relative",
        isListLayout ? "flex items-center gap-4" : "space-y-4"
      )}>
        {/* Pending indicator */}
        {(isPending || isTemporary) && (
          <div className="absolute top-2 right-2 z-10">
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          </div>
        )}
        {/* Project Header */}
        <div className={cn(
          "flex items-start justify-between",
          isListLayout ? "flex-1" : "w-full"
        )}>
          <div className={cn(
            "space-y-2",
            isListLayout ? "flex-1" : "w-full"
          )}>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 truncate">
                {project.name}
              </h3>
              <ProjectStatusBadge 
                status={project.status}
                onStatusChange={(status) => onStatusUpdate(project.id, status)}
                disabled={isPending || isTemporary}
              />
            </div>
            
            {project.client && (
              <p className="text-sm text-slate-600 flex items-center gap-1">
                <Users className="h-3 w-3" />
                {project.client}
              </p>
            )}
            
            {project.location && (
              <p className="text-sm text-slate-600 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {project.location}
              </p>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-1">
            <QuickActionButton
              icon={Eye}
              onClick={onQuickView}
              className="text-slate-600 hover:text-buildease-blue-600"
              ariaLabel="View project details"
            />
            <QuickActionButton
              icon={MoreVertical}
              onClick={() => onShowActions(project.id)}
              className="text-slate-600 hover:text-slate-900"
              ariaLabel="More actions"
            />
          </div>
        </div>
        
        {/* Project Metrics */}
        {!isListLayout && (
          <div className="grid grid-cols-2 gap-4">
            <ProjectMetric
              icon={DollarSign}
              label="Budget"
              value={formatCurrency(project.budget)}
              color="green"
            />
            <ProjectMetric
              icon={TrendingUp}
              label="Progress"
              value={`${project.progress}%`}
              color="blue"
            />
            <ProjectMetric
              icon={Calendar}
              label="Due Date"
              value={formatDate(project.endDate)}
              color="purple"
            />
            <ProjectMetric
              icon={Clock}
              label="Updated"
              value={formatRelativeTime(project.updatedAt)}
              color="gray"
            />
          </div>
        )}
        
        {/* List Layout Metrics */}
        {isListLayout && (
          <div className="flex items-center gap-6 text-sm text-slate-600">
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {formatCurrency(project.budget)}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {project.progress}%
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(project.endDate)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

// Memoized version for performance optimization
const MemoizedProjectCard = memo(ProjectCard);

/**
 * Project status badge with quick status change and React 19 concurrent features
 */
interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  onStatusChange: (status: ProjectStatus) => void;
  disabled?: boolean;
}

function ProjectStatusBadge({ status, onStatusChange, disabled = false }: ProjectStatusBadgeProps) {
  const statusConfig = {
    'planning': { 
      label: 'Planning', 
      color: 'bg-blue-100 text-blue-800',
      icon: Clock 
    },
    'active': { 
      label: 'Active', 
      color: 'bg-green-100 text-green-800',
      icon: TrendingUp 
    },
    'completed': { 
      label: 'Completed', 
      color: 'bg-gray-100 text-gray-800',
      icon: CheckCircle2 
    },
    'on-hold': { 
      label: 'On Hold', 
      color: 'bg-orange-100 text-orange-800',
      icon: AlertCircle 
    },
  };
  
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <Badge 
      variant="secondary" 
      className={cn(
        config.color,
        "text-xs px-2 py-1 flex items-center gap-1 transition-all duration-200",
        disabled 
          ? "opacity-50 cursor-not-allowed" 
          : "cursor-pointer hover:scale-105"
      )}
      onClick={() => {
        if (disabled) return;
        
        // Cycle through statuses for quick updates
        const statuses: ProjectStatus[] = ['planning', 'active', 'completed', 'on-hold'];
        const currentIndex = statuses.indexOf(status);
        const nextStatus = statuses[(currentIndex + 1) % statuses.length];
        onStatusChange(nextStatus);
      }}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

/**
 * Project metric display component
 */
interface ProjectMetricProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: 'blue' | 'green' | 'purple' | 'gray';
}

function ProjectMetric({ icon: Icon, label, value, color }: ProjectMetricProps) {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    gray: 'text-slate-600',
  };
  
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${colorClasses[color]}`} />
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <p className="text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

/**
 * Project actions bottom sheet with React 19 concurrent features
 */
interface ProjectActionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  project: UIProject | null;
  onAction: (action: string) => void;
  isPending?: boolean;
}

function ProjectActionsSheet({ 
  isOpen, 
  onClose, 
  project, 
  onAction,
  isPending = false
}: ProjectActionsSheetProps) {
  if (!project) return null;
  
  const actions = [
    { key: 'view', label: 'View Details', icon: Eye, variant: 'default' as const },
    { key: 'edit', label: 'Edit Project', icon: Edit, variant: 'default' as const },
    { key: 'duplicate', label: 'Duplicate', icon: Copy, variant: 'outline' as const },
    { key: 'delete', label: 'Delete', icon: Trash2, variant: 'destructive' as const },
  ];
  
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={project.name}
      snapPoints={[40, 80]}
    >
      <div className="space-y-3">
        <div className="text-sm text-slate-600 pb-2 border-b">
          Choose an action for this project
        </div>
        
        {actions.map((action) => {
          const Icon = action.icon;
          const isDestructive = action.variant === 'destructive';
          
          return (
            <TouchOptimizedButton
              key={action.key}
              touchSize="lg"
              variant={action.variant}
              onClick={() => onAction(action.key)}
              disabled={isPending && isDestructive}
              className={cn(
                "w-full justify-start gap-3 transition-all duration-200",
                isPending && isDestructive && "opacity-50"
              )}
            >
              {isPending && isDestructive ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
              {action.label}
              {isPending && isDestructive && (
                <span className="ml-auto text-xs text-slate-500">Processing...</span>
              )}
            </TouchOptimizedButton>
          );
        })}
      </div>
    </BottomSheet>
  );
}

/**
 * Empty state when no projects exist
 */
function EmptyProjectsState({ 
  className, 
  onCreateProject 
}: { 
  className?: string; 
  onCreateProject: () => void; 
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4", className)}>
      <div className="text-center space-y-4 max-w-md">
        <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
          <Users className="h-8 w-8 text-slate-400" />
        </div>
        
        <h3 className="text-lg font-semibold text-slate-900">
          No Projects Yet
        </h3>
        
        <p className="text-slate-600">
          Get started by creating your first construction project. 
          Track progress, manage budgets, and coordinate with your team.
        </p>
        
        <TouchOptimizedButton
          touchSize="lg"
          onClick={onCreateProject}
          className="mt-4"
          hapticFeedback
        >
          Create First Project
        </TouchOptimizedButton>
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
        <Card key={i}>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-slate-200 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-slate-200 rounded w-1/2 animate-pulse" />
                <div className="h-3 bg-slate-200 rounded w-2/3 animate-pulse" />
              </div>
              <div className="h-8 w-8 bg-slate-200 rounded animate-pulse" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }, (_, j) => (
                <div key={j} className="space-y-1">
                  <div className="h-3 bg-slate-200 rounded w-16 animate-pulse" />
                  <div className="h-4 bg-slate-200 rounded w-12 animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Utility functions for formatting
 */
function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function formatRelativeTime(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffInHours = Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks}w ago`;
}