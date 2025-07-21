/**
 * Virtualized Projects List for optimal performance with large datasets
 * Uses React 19 concurrent features and virtual scrolling for construction projects
 */

import React, { useMemo, useCallback, startTransition } from 'react';
import { VariableSizeList as List } from 'react-window';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TouchOptimizedButton, QuickActionButton } from '@/components/ui/TouchOptimizedButton';
import { 
  Eye, 
  MoreVertical, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Users,
  MapPin,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/utils/core/ui';
import { useInfiniteProjects } from '@/hooks/useInfiniteProjects';
import type { 
  UIProject, 
  ProjectViewSettings,
  ProjectActions,
  ProjectsFilters 
} from '@/types/enhanced-projects';
import type { ProjectStatus } from '@/types/project';

interface VirtualizedProjectsListProps {
  filters: ProjectsFilters;
  viewSettings: ProjectViewSettings;
  actions: ProjectActions;
  className?: string;
}

interface ProjectItemData {
  projects: UIProject[];
  viewSettings: ProjectViewSettings;
  actions: ProjectActions;
  hasMore: boolean;
  loadMore: () => void;
  isFetchingNextPage: boolean;
}

/**
 * Calculate item height based on layout and content
 */
function getItemHeight(index: number, data: ProjectItemData): number {
  const { viewSettings, projects, hasMore, isFetchingNextPage } = data;
  
  // Loading indicator height
  if (index === projects.length) {
    return hasMore || isFetchingNextPage ? 80 : 0;
  }
  
  // Project card heights
  if (viewSettings.layout === 'list') {
    return viewSettings.density === 'compact' ? 80 : 100;
  } else {
    return viewSettings.density === 'compact' ? 200 : 280;
  }
}

/**
 * Individual project item renderer for virtualization
 */
function ProjectItem({ 
  index, 
  style, 
  data 
}: { 
  index: number; 
  style: React.CSSProperties; 
  data: ProjectItemData; 
}) {
  const { projects, viewSettings, actions, hasMore, loadMore, isFetchingNextPage } = data;
  
  // Loading indicator at the end
  if (index === projects.length) {
    if (!hasMore && !isFetchingNextPage) return null;
    
    return (
      <div style={style}>
        <LoadMoreIndicator 
          hasMore={hasMore}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={loadMore}
        />
      </div>
    );
  }
  
  const project = projects[index];
  if (!project) return null;
  
  return (
    <div style={style} className="px-4 pb-4">
      <VirtualProjectCard
        project={project}
        layout={viewSettings.layout}
        density={viewSettings.density}
        actions={actions}
      />
    </div>
  );
}

/**
 * Virtualized project card component
 */
interface VirtualProjectCardProps {
  project: UIProject;
  layout: ProjectViewSettings['layout'];
  density: ProjectViewSettings['density'];
  actions: ProjectActions;
}

function VirtualProjectCard({ 
  project, 
  layout, 
  density,
  actions 
}: VirtualProjectCardProps) {
  const isCompact = density === 'compact';
  const isListLayout = layout === 'list';
  
  const handleStatusUpdate = useCallback((status: ProjectStatus) => {
    startTransition(() => {
      actions.onStatusUpdate(project.id, status);
    });
  }, [project.id, actions]);
  
  return (
    <Card className="hover:shadow-md transition-shadow duration-200 touch-manipulation">
      <CardContent className={cn(
        isListLayout ? "flex items-center gap-4" : "space-y-3",
        isCompact ? "p-3" : "p-4"
      )}>
        {/* Project Header */}
        <div className={cn(
          "flex items-start justify-between",
          isListLayout ? "flex-1" : "w-full"
        )}>
          <div className={cn(
            "space-y-1",
            isListLayout ? "flex-1" : "w-full"
          )}>
            <div className="flex items-center gap-2">
              <h3 className={cn(
                "font-semibold text-slate-900 truncate",
                isCompact ? "text-sm" : "text-base"
              )}>
                {project.name}
              </h3>
              <ProjectStatusBadge status={project.status} />
            </div>
            
            {!isCompact && project.client && (
              <p className="text-sm text-slate-600 flex items-center gap-1">
                <Users className="h-3 w-3" />
                {project.client}
              </p>
            )}
            
            {!isCompact && project.location && (
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
              onClick={() => actions.onView(project.id)}
              className="text-slate-600 hover:text-buildease-blue-600"
              ariaLabel="View project"
            />
            <QuickActionButton
              icon={MoreVertical}
              onClick={() => {
                // TODO: Show actions menu
                console.log('Show actions for:', project.id);
              }}
              className="text-slate-600 hover:text-slate-900"
              ariaLabel="More actions"
            />
          </div>
        </div>
        
        {/* Project Metrics - Grid Layout Only */}
        {!isListLayout && (
          <div className="grid grid-cols-2 gap-3">
            <MetricItem
              icon={DollarSign}
              label="Budget"
              value={formatCurrency(project.budget)}
              compact={isCompact}
            />
            <MetricItem
              icon={TrendingUp}
              label="Progress"
              value={`${project.progress}%`}
              compact={isCompact}
            />
            {!isCompact && (
              <>
                <MetricItem
                  icon={Calendar}
                  label="Due Date"
                  value={formatDate(project.endDate)}
                  compact={false}
                />
                <MetricItem
                  icon={Calendar}
                  label="Updated"
                  value={formatRelativeTime(project.updatedAt)}
                  compact={false}
                />
              </>
            )}
          </div>
        )}
        
        {/* List Layout Metrics */}
        {isListLayout && (
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {formatCurrency(project.budget)}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {project.progress}%
            </span>
            {!isCompact && (
              <span className="hidden sm:flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(project.endDate)}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Project status badge component
 */
function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const statusConfig = {
    'planning': { label: 'Planning', color: 'bg-blue-100 text-blue-800' },
    'active': { label: 'Active', color: 'bg-green-100 text-green-800' },
    'completed': { label: 'Completed', color: 'bg-gray-100 text-gray-800' },
    'on-hold': { label: 'On Hold', color: 'bg-orange-100 text-orange-800' },
  };
  
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant="secondary" 
      className={`${config.color} text-xs px-2 py-1`}
    >
      {config.label}
    </Badge>
  );
}

/**
 * Metric item component for project cards
 */
interface MetricItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  compact: boolean;
}

function MetricItem({ icon: Icon, label, value, compact }: MetricItemProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <Icon className="h-3 w-3 text-slate-500" />
        <span className={cn(
          "text-slate-500",
          compact ? "text-xs" : "text-sm"
        )}>
          {label}
        </span>
      </div>
      <p className={cn(
        "font-medium text-slate-900",
        compact ? "text-sm" : "text-base"
      )}>
        {value}
      </p>
    </div>
  );
}

/**
 * Load more indicator component
 */
interface LoadMoreIndicatorProps {
  hasMore: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}

function LoadMoreIndicator({ 
  hasMore, 
  isFetchingNextPage, 
  onLoadMore 
}: LoadMoreIndicatorProps) {
  if (isFetchingNextPage) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-3" />
        <span className="text-sm text-slate-600">Loading more projects...</span>
      </div>
    );
  }
  
  if (hasMore) {
    return (
      <div className="flex items-center justify-center p-6">
        <TouchOptimizedButton
          touchSize="md"
          variant="outline"
          onClick={onLoadMore}
          className="gap-2"
        >
          <ChevronDown className="h-4 w-4" />
          Load More Projects
        </TouchOptimizedButton>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center p-6">
      <span className="text-sm text-slate-500">All projects loaded</span>
    </div>
  );
}

/**
 * Main virtualized projects list component
 */
export function VirtualizedProjectsList({
  filters,
  viewSettings,
  actions,
  className
}: VirtualizedProjectsListProps) {
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
    pageSize: 20, // Larger page size for virtualization
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });
  
  // Item data for virtualization
  const itemData: ProjectItemData = useMemo(() => ({
    projects,
    viewSettings,
    actions,
    hasMore,
    loadMore,
    isFetchingNextPage
  }), [projects, viewSettings, actions, hasMore, loadMore, isFetchingNextPage]);
  
  // Calculate total item count (projects + loading indicator)
  const itemCount = projects.length + (hasMore || isFetchingNextPage ? 1 : 0);
  
  // Height calculation function
  const getItemHeightMemo = useCallback(
    (index: number) => getItemHeight(index, itemData),
    [itemData]
  );
  
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-64 bg-slate-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }
  
  if (projects.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12", className)}>
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">No Projects Found</h3>
          <p className="text-slate-600">
            No projects match your current filters. Try adjusting your search criteria.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={className}>
      {/* Progress indicator */}
      <div className="mb-4 text-sm text-slate-600">
        Showing {loadedCount} of {totalCount} projects
        {hasMore && (
          <span className="ml-2 text-blue-600">
            • Scroll for more
          </span>
        )}
      </div>
      
      {/* Virtualized list */}
      <div style={{ height: '600px' }} className="w-full">
        <List
          height={600}
          itemCount={itemCount}
          itemSize={getItemHeightMemo}
          itemData={itemData}
          overscanCount={2}
          className="scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100"
        >
          {ProjectItem}
        </List>
      </div>
      
      {/* Intersection observer target */}
      <div ref={loadMoreRef} className="h-px" />
    </div>
  );
}

/**
 * Utility functions
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
    day: 'numeric'
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