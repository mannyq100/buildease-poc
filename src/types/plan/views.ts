/**
 * Plan View Interface Types
 * Standardized prop interfaces for all plan view components
 * Following BuildEase conventions for consistent component APIs
 */

import { ConstructionPlan } from './base';
import { LoadingState } from '@/hooks/usePlanLoading';
import { PlanModalManagerHandlers } from '@/components/plan/PlanModalManager';

/**
 * Base interface that all plan views should extend
 * Contains common props shared across all views
 */
export interface PlanViewBaseProps {
  /** The construction plan to display */
  plan: ConstructionPlan;
  
  /** Optional loading state for UI feedback */
  loadingState?: LoadingState;
  
  /** Optional view mode for customizing display */
  viewMode?: ViewMode;
  
  /** Optional className for custom styling */
  className?: string;
}

/**
 * Standard CRUD action handlers for plan entities
 * Consistent callback patterns across all views
 */
export interface PlanViewActionHandlers {
  // Phase actions
  onAddPhase?: (planId: string) => void;
  onEditPhase?: (phaseId: string) => void;
  onDeletePhase?: (phaseId: string) => void;
  onReorderPhase?: (oldIndex: number, newIndex: number) => void;
  
  // Task actions
  onAddTask?: (phaseId: string) => void;
  onEditTask?: (phaseId: string, taskId: string) => void;
  onDeleteTask?: (phaseId: string, taskId: string) => void;
  
  // Material actions
  onAddMaterial?: (phaseId: string) => void;
  onEditMaterial?: (phaseId: string, materialId: string) => void;
  onDeleteMaterial?: (phaseId: string, materialId: string) => void;
  
  // Plan-level actions
  onEditProjectDates?: () => void;
  onEditPhaseDates?: (phaseId: string) => void;
}

/**
 * Full interface combining base props with action handlers
 * For views that need complete CRUD functionality
 */
export interface PlanViewWithActionsProps extends PlanViewBaseProps, PlanViewActionHandlers {}

/**
 * Specific view prop interfaces extending the base
 */

export interface OverviewViewProps extends PlanViewWithActionsProps {
  /** Determines how much detail to show in the overview */
  viewMode?: 'detailed' | 'summary';
  
  /** Handler for updating project progress */
  onUpdateProgress?: () => void;
}

export interface TimelineViewProps extends PlanViewBaseProps {
  /** Timeline-specific action handlers */
  onEditPhase?: (phaseId: string) => void;
  onAddTask?: (phaseId: string) => void;
  onEditTask?: (phaseId: string, taskId: string) => void;
  onEditDates?: (phaseId: string) => void;
  onReorderPhase?: (oldIndex: number, newIndex: number) => void;
}

export interface MaterialsViewProps extends PlanViewBaseProps {
  /** Material-specific action handlers */
  onAddMaterial?: (phaseId: string) => void;
  onEditMaterial?: (phaseId: string, materialId: string) => void;
  onDeleteMaterial?: (phaseId: string, materialId: string) => void;
  
  /** Material view modes */
  viewMode?: 'detailed' | 'summary' | 'inventory';
}

export interface BudgetViewProps extends PlanViewBaseProps {
  /** Budget-specific display options */
  viewMode?: 'detailed' | 'summary' | 'chart';
  
  /** Whether to show cost breakdowns */
  showBreakdowns?: boolean;
}

export interface TeamViewProps extends PlanViewBaseProps {
  /** Team-specific display options */
  viewMode?: 'detailed' | 'summary' | 'assignments';
  
  /** Whether to show task assignments */
  showAssignments?: boolean;
}

export interface DocumentsViewProps extends PlanViewBaseProps {
  /** Document-specific display options */
  viewMode?: 'detailed' | 'summary' | 'grid' | 'list';
  
  /** Whether to show document previews */
  showPreviews?: boolean;
}

/**
 * Plan View Renderer Props
 * Props for the central component that renders individual views
 */
export interface PlanViewRendererProps extends PlanViewBaseProps {
  /** Active view identifier */
  activeView: string;
  
  /** Reference to modal handlers for opening modals */
  modalHandlersRef?: React.RefObject<PlanModalManagerHandlers>;
  
  /** Loading actions for updating loading states */
  loadingActions?: {
    setPhaseLoading: (phaseId: string, loading: boolean) => void;
    setTaskLoading: (taskId: string, loading: boolean) => void;
    setMaterialLoading: (materialId: string, loading: boolean) => void;
    setOperationLoading: (operation: string, loading: boolean) => void;
  };
}

/**
 * Type utilities for view props
 */
export type ViewType = 'overview' | 'timeline' | 'materials' | 'budget' | 'team' | 'documents';

export type ViewMode = 'detailed' | 'summary' | 'compact' | 'inventory' | 'chart' | 'assignments' | 'grid' | 'list';

/**
 * Helper type for creating view-specific prop interfaces
 */
export type ViewPropsForType<T extends ViewType> = 
  T extends 'overview' ? OverviewViewProps :
  T extends 'timeline' ? TimelineViewProps :
  T extends 'materials' ? MaterialsViewProps :
  T extends 'budget' ? BudgetViewProps :
  T extends 'team' ? TeamViewProps :
  T extends 'documents' ? DocumentsViewProps :
  PlanViewBaseProps;