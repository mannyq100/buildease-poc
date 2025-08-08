/**
 * Enhanced TypeScript types for Projects page with strict typing
 * Extends the enhanced-project types for Projects page specific needs
 */

import type { Project, ProjectStatus } from './project';
import type { SupabaseErrorWithContext } from './enhanced-project';

// Remove UIProject type - use Project instead
// export type UIProject = Project; // No longer needed

// Projects page specific filters
export interface ProjectsFilters {
  status?: ProjectStatus | 'all';
  search?: string;
  type?: string;
  client?: string;
  sortBy?: 'name' | 'status' | 'budget' | 'progress' | 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// Enhanced project metrics
export interface ProjectsMetrics {
  totalProjects: number;
  completedProjects: number;
  activeProjects: number;
  planningProjects: number;
  onHoldProjects: number;
  totalBudget: number;
  totalSpent: number;
  spentPercentage: number;
  averageProgress: number;
  projectsThisMonth: number;
  completedThisMonth: number;
}

// Projects loading states
export interface ProjectsLoadingState {
  projects: boolean;
  metrics: boolean;
  statusCounts: boolean;
  search: boolean;
  operations: boolean;
}

// Projects error info
export interface ProjectsErrorInfo {
  type: 'loading' | 'not_found' | 'permission_denied' | 'network' | 'server' | 'validation';
  title: string;
  message: string;
  actions: {
    primary?: {
      label: string;
      action: () => void;
    };
    secondary?: {
      label: string;
      action: () => void;
    };
  };
}

// Project card actions
export interface ProjectCardActions {
  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onDuplicate: (project: Project, newName: string) => void;
  onStatusUpdate: (project: Project, status: ProjectStatus) => void;
  onArchive?: (project: Project) => void;
  onRestore?: (project: Project) => void;
}

// Bulk operations
export interface BulkOperationData {
  projectIds: string[];
  operation: 'delete' | 'archive' | 'status_update' | 'assign_team' | 'export';
  data?: {
    status?: ProjectStatus;
    teamMemberId?: string;
    format?: 'pdf' | 'csv' | 'excel';
  };
}

// Projects page view settings
export interface ProjectsViewSettings {
  layout: 'grid' | 'list' | 'table';
  cardsPerPage: number;
  showMetrics: boolean;
  showFilters: boolean;
  compactView: boolean;
  groupBy?: 'status' | 'type' | 'client' | 'none';
}

// Infinite scroll data
export interface ProjectsInfiniteData {
  projects: Project[];
  nextCursor?: string;
  hasMore: boolean;
  totalCount: number;
}

// Search result highlighting
export interface ProjectSearchResult extends Project {
  highlights?: {
    name?: string;
    description?: string;
    client?: string;
    location?: string;
  };
  score?: number;
}

// Component props types
export interface ProjectsContentProps {
  filters: ProjectsFilters;
  onFiltersChange: (filters: ProjectsFilters) => void;
  viewSettings: ProjectsViewSettings;
  onViewSettingsChange: (settings: ProjectsViewSettings) => void;
}

export interface ProjectsMetricsProps {
  metrics?: ProjectsMetrics;
  loading?: boolean;
  error?: SupabaseErrorWithContext | null;
  className?: string;
}

export interface ProjectsFiltersProps {
  filters: ProjectsFilters;
  onFiltersChange: (filters: ProjectsFilters) => void;
  statusCounts?: Record<string, number>;
  loading?: boolean;
  className?: string;
}

export interface ProjectsListProps {
  projects: Project[]; // Using Project instead of UIProject
  loading?: boolean;
  error?: SupabaseErrorWithContext | null;
  viewSettings: ProjectsViewSettings;
  actions: ProjectCardActions;
  selectedProjects?: string[];
  onSelectionChange?: (projectIds: string[]) => void;
  onBulkOperation?: (operation: BulkOperationData) => void;
  className?: string;
}

// Optimistic operation types
export type OptimisticProjectOperation = 
  | { type: 'create'; project: Partial<Project> }
  | { type: 'update'; projectId: string; updates: Partial<Project> }
  | { type: 'delete'; projectId: string }
  | { type: 'status_update'; projectId: string; status: ProjectStatus }
  | { type: 'duplicate'; sourceId: string; newProject: Partial<Project> };

// Advanced filtering
export interface AdvancedFilters {
  budgetRange?: { min: number; max: number };
  progressRange?: { min: number; max: number };
  dateRange?: { start: string; end: string };
  teamMembers?: string[];
  tags?: string[];
  locations?: string[];
  clients?: string[];
  excludeArchived?: boolean;
  onlyFavorites?: boolean;
}