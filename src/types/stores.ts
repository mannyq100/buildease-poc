/**
 * Store Type Definitions for Zustand State Management
 * Sprint 4 Day 1: Store Architecture Design
 * Centralized type definitions for all store interfaces
 */

// =============================================================================
// PROJECT PREFERENCES & SETTINGS
// =============================================================================

export interface ProjectPreferences {
  defaultView: 'timeline' | 'phases' | 'budget' | 'team';
  taskFilters: {
    status?: TaskStatus[];
    priority?: TaskPriority[];
    assignee?: string[];
    dateRange?: { start: Date; end: Date };
  };
  phaseFilters: {
    status?: PhaseStatus[];
    showCompleted?: boolean;
  };
  displaySettings: {
    showProgressBars: boolean;
    showBudgetInfo: boolean;
    compactView: boolean;
    showAvatars: boolean;
  };
  notifications: {
    taskDeadlines: boolean;
    phaseCompletions: boolean;
    budgetAlerts: boolean;
  };
}

// =============================================================================
// OPTIMISTIC UPDATES
// =============================================================================

export interface OptimisticUpdate {
  id: string;
  type: 'create' | 'update' | 'delete' | 'task-update' | 'phase-update' | 'budget-update' | 'team-update';
  entity: string;
  timestamp: number;
  data: unknown;
  originalData?: unknown;
}

// =============================================================================
// FILTER TYPES
// =============================================================================

export interface TaskFilters {
  status: TaskStatus[];
  priority: TaskPriority[];
  assignee: string[];
  dueDateRange: { start: Date | null; end: Date | null };
  searchTerm: string;
}

export interface PhaseFilters {
  status: PhaseStatus[];
  showCompleted: boolean;
  showOnlyOverdue: boolean;
  budgetRange: { min: number; max: number };
  searchTerm: string;
}

// =============================================================================
// PROJECT STORE INTERFACE
// =============================================================================

export interface ProjectStore {
  // Current project context
  currentProjectId: string | null;
  projectPreferences: Record<string, ProjectPreferences>;
  
  // Optimistic updates tracking
  optimisticUpdates: Record<string, OptimisticUpdate>;
  pendingMutations: Set<string>;
  
  // Actions
  setCurrentProject: (id: string) => void;
  updateProjectPreferences: (projectId: string, preferences: Partial<ProjectPreferences>) => void;
  
  // Optimistic update management
  addOptimisticUpdate: (key: string, update: OptimisticUpdate) => void;
  removeOptimisticUpdate: (key: string) => void;
  rollbackOptimisticUpdate: (key: string) => void;
  clearAllOptimisticUpdates: () => void;
  
  // Mutation tracking
  addPendingMutation: (mutationId: string) => void;
  removePendingMutation: (mutationId: string) => void;
  isMutationPending: (mutationId: string) => boolean;
}

// =============================================================================
// AUTO TRANSITION STATE
// =============================================================================

export interface AutoTransitionState {
  phaseId: string;
  type: 'started' | 'completed' | 'reopened';
  timestamp: number;
}

// =============================================================================
// UI STORE INTERFACE
// =============================================================================

export interface UIStore {
  // Modal states
  modals: Record<string, boolean>;
  
  // Selection states
  selectedTasks: Set<string>;
  selectedPhases: Set<string>;
  selectedTeamMembers: Set<string>;
  
  // Filter states
  taskFilters: TaskFilters;
  phaseFilters: PhaseFilters;
  
  // View states
  sidebarCollapsed: boolean;
  activeTab: string;
  currentView: 'timeline' | 'phases' | 'budget' | 'team' | 'overview';
  
  // Loading states
  isLoading: Record<string, boolean>;
  
  // Error states
  errors: Record<string, string | null>;
  
  // Auto-transition states (migrated from AutoTransitionContext)
  autoTransitions: Map<string, AutoTransitionState>;
  
  // Actions - Modal Management
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  toggleModal: (modalId: string) => void;
  closeAllModals: () => void;
  
  // Actions - Selection Management
  toggleTaskSelection: (taskId: string) => void;
  selectAllTasks: (taskIds: string[]) => void;
  clearTaskSelection: () => void;
  togglePhaseSelection: (phaseId: string) => void;
  selectAllPhases: (phaseIds: string[]) => void;
  clearPhaseSelection: () => void;
  toggleTeamMemberSelection: (memberId: string) => void;
  clearAllSelections: () => void;
  
  // Actions - Filter Management
  setTaskFilters: (filters: Partial<TaskFilters>) => void;
  resetTaskFilters: () => void;
  setPhaseFilters: (filters: Partial<PhaseFilters>) => void;
  resetPhaseFilters: () => void;
  resetAllFilters: () => void;
  
  // Actions - View Management
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setActiveTab: (tab: string) => void;
  setCurrentView: (view: UIStore['currentView']) => void;
  
  // Actions - Loading State Management
  setLoading: (key: string, loading: boolean) => void;
  clearAllLoading: () => void;
  
  // Actions - Error State Management
  setError: (key: string, error: string | null) => void;
  clearError: (key: string) => void;
  clearAllErrors: () => void;
  
  // Actions - Auto Transition Management
  setAutoTransition: (phaseId: string, transition: AutoTransitionState) => void;
  removeAutoTransition: (phaseId: string) => void;
  getAutoTransition: (phaseId: string) => AutoTransitionState | undefined;
  clearAutoTransitions: () => void;
}

// =============================================================================
// NAVIGATION STORE INTERFACE
// =============================================================================

export interface NavigationStore {
  // Navigation history
  navigationHistory: string[];
  currentHistoryIndex: number;
  
  // Breadcrumb tracking
  breadcrumbs: Array<{
    label: string;
    path: string;
    icon?: string;
  }>;
  
  // Recently visited projects
  recentProjects: Array<{
    id: string;
    name: string;
    lastVisited: Date;
  }>;
  
  // Actions - History Management
  pushToHistory: (path: string) => void;
  goBack: () => string | null;
  goForward: () => string | null;
  canGoBack: () => boolean;
  canGoForward: () => boolean;
  
  // Actions - Breadcrumb Management
  setBreadcrumbs: (breadcrumbs: NavigationStore['breadcrumbs']) => void;
  addBreadcrumb: (breadcrumb: NavigationStore['breadcrumbs'][0]) => void;
  
  // Actions - Recent Projects Management
  addRecentProject: (project: { id: string; name: string }) => void;
  removeRecentProject: (projectId: string) => void;
  clearRecentProjects: () => void;
}

// =============================================================================
// COMBINED STORE TYPE
// =============================================================================

export interface AppStores {
  project: ProjectStore;
  ui: UIStore;
  navigation: NavigationStore;
}

// =============================================================================
// STORE SELECTORS
// =============================================================================

export type ProjectStoreSelector<T> = (state: ProjectStore) => T;
export type UIStoreSelector<T> = (state: UIStore) => T;
export type NavigationStoreSelector<T> = (state: NavigationStore) => T;

// =============================================================================
// SUPPORTING TYPES (Re-exported from existing types)
// =============================================================================

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type PhaseStatus = 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';

// =============================================================================
// PERSISTENCE CONFIGURATION
// =============================================================================

export interface StorePeristenceConfig {
  name: string;
  version: number;
  // Only persist user preferences and settings, not temporary UI state
  partialize: (state: any) => Partial<any>;
  migrate: (persistedState: any, version: number) => any;
}

// =============================================================================
// DEVELOPMENT TOOLS CONFIGURATION
// =============================================================================

export interface StoreDevToolsConfig {
  name: string;
  enabled: boolean;
  actionSanitizer?: (action: any) => any;
  stateSanitizer?: (state: any) => any;
}