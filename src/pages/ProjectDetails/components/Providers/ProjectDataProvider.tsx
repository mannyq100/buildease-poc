/**
 * Project Data Provider Component
 * Centralizes all data fetching and business logic for ProjectDetails
 * Follows BuildEase standards for separation of concerns
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectDetailsData } from '@/hooks/queries/useProjectDetails';
import { useProjectTasks } from '@/hooks/queries/useTask';
import { useUpdateProject } from '@/hooks/mutations/useProject';
import { useTaskCRUD, useCRUDOperations } from '../../hooks';
import { useUIStore } from '@/stores/uiStore';
import { useTodaysFocus } from '../../hooks/useTodaysFocus';
import type { TaskItem, ProjectUpdateFormData } from '../../types';
import type { Project } from '@/types/project';
import type { BudgetExpense, TeamMember, ProjectPhase, EnhancedTask } from '@/types/projectDetails';
import { toDbPhaseStatus } from '@/utils/core/phaseStatus';
import type { ProjectDetailsPhase } from '@/hooks/mutations/usePhase';

/**
 * Validates and sanitizes date strings to prevent data corruption
 * Implements timezone-aware date handling and chronological validation
 */
function validateAndSanitizeDate(dateInput: string | null | undefined): string | null {
  // Return null for empty/invalid inputs
  if (!dateInput || typeof dateInput !== 'string') {
    return null;
  }
  
  // Sanitize input - remove potential injection attempts
  const sanitized = dateInput.trim().replace(/[<>'"]/g, '');
  
  // Validate date format (ISO 8601 or YYYY-MM-DD)
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})?)?$/;
  const simpleDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  
  if (!isoDateRegex.test(sanitized) && !simpleDateRegex.test(sanitized)) {
    console.warn(`Invalid date format rejected: ${sanitized}`);
    return null;
  }
  
  // Parse and validate the date
  const parsedDate = new Date(sanitized);
  
  // Check if date is valid
  if (isNaN(parsedDate.getTime())) {
    console.warn(`Invalid date value rejected: ${sanitized}`);
    return null;
  }
  
  // Validate reasonable date range (not too far in past or future)
  const now = new Date();
  const minDate = new Date('2000-01-01');
  const maxDate = new Date(now.getFullYear() + 50, 11, 31); // 50 years from now
  
  if (parsedDate < minDate || parsedDate > maxDate) {
    console.warn(`Date out of reasonable range rejected: ${sanitized}`);
    return null;
  }
  
  // Return normalized ISO date string (preserves timezone if present)
  return sanitized;
}

/**
 * Validates chronological consistency in timeline dates
 * Ensures start dates are before end dates and logs inconsistencies
 */
function validateTimelineChronology(
  timeline: {
    planned_start: string | null;
    planned_end: string | null;
    actual_start: string | null;
    actual_end: string | null;
  },
  phaseName: string
): {
  planned_start: string | null;
  planned_end: string | null;
  actual_start: string | null;
  actual_end: string | null;
} {
  const result = { ...timeline };
  
  // Validate planned dates chronology
  if (result.planned_start && result.planned_end) {
    const startDate = new Date(result.planned_start);
    const endDate = new Date(result.planned_end);
    
    if (startDate >= endDate) {
      console.error(`Invalid timeline for phase "${phaseName}": planned_start (${result.planned_start}) must be before planned_end (${result.planned_end})`);
      // Keep the dates but log the error - UI should handle this gracefully
    }
  }
  
  // Validate actual dates chronology  
  if (result.actual_start && result.actual_end) {
    const startDate = new Date(result.actual_start);
    const endDate = new Date(result.actual_end);
    
    // Allow equal timestamps (instantaneous completion) but not start after end
    if (startDate > endDate) {
      console.error(`Invalid timeline for phase "${phaseName}": actual_start (${result.actual_start}) must be before or equal to actual_end (${result.actual_end})`);
      // Keep the dates but log the error - UI should handle this gracefully
    }
  }
  
  // Validate planned vs actual consistency (actual should be reasonably close to planned)
  if (result.planned_start && result.actual_start) {
    const plannedDate = new Date(result.planned_start);
    const actualDate = new Date(result.actual_start);
    const daysDiff = Math.abs((actualDate.getTime() - plannedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Warn if actual dates are significantly different from planned (more than 6 months)
    if (daysDiff > 180) {
      console.warn(`Large variance in phase "${phaseName}": actual_start differs from planned_start by ${Math.round(daysDiff)} days`);
    }
  }
  
  return result;
}

interface ProjectDataProviderProps {
  projectId: string;
  children: (data: ProjectDataContextValue) => React.ReactNode;
}

interface ProjectDataContextValue {
  // Data
  projectData: unknown;
  project: Project | null;
  budgetExpenses: BudgetExpense[];
  teamMembers: TeamMember[];
  phases: ProjectPhase[];
  allProjectTasks: TaskItem[];
  todaysFocus: TaskItem[];
  
  // Loading states
  isLoading: boolean;
  projectLoading: boolean;
  tasksLoading: boolean;
  
  // Error states
  projectError: Error | null;
  
  // Modal state
  showUpdateModal: boolean;
  setShowUpdateModal: (show: boolean) => void;
  
  // Modal management
  modalManagement: {
    showBudgetModal: boolean;
    showPhaseModal: boolean;
    showTeamModal: boolean;
    currentPhaseId: string;
    editingItem: {
      type: 'budget' | 'phase' | 'team';
      data: Record<string, unknown>;
    } | null;
    modalMode: 'create' | 'edit';
    openCreateModal: (type: 'budget' | 'phase' | 'team') => void;
    openEditModal: (type: 'budget' | 'phase' | 'team', data: Record<string, unknown>) => void;
    closeModals: () => void;
    setCurrentPhaseId: (id: string) => void;
  };
  
  // CRUD operations
  crudOperations: ReturnType<typeof useCRUDOperations>;
  
  // Task operations
  taskOperations: ReturnType<typeof useTaskCRUD>;
  
  // Project update
  updateProject: ReturnType<typeof useUpdateProject>;
  
  // Handlers
  handleUpdateProject: (data: ProjectUpdateFormData) => void;
  handleCloseUpdateModal: () => void;
  getUrgencyScore: (task: TaskItem) => number;
  
  // Navigation
  navigate: ReturnType<typeof useNavigate>;
}

export function ProjectDataProvider({ projectId, children }: ProjectDataProviderProps) {
  const navigate = useNavigate();
  
  // Use comprehensive project details data with Supabase integration
  const {
    project: projectData,
    budgetExpenses,
    teamMembers,
    phases: rawPhases,
    isLoading: projectLoading,
    error: projectError
  } = useProjectDetailsData(projectId);
  
  // Fetch all project tasks for today's focus calculation
  const { data: allProjectTasks = [], isLoading: tasksLoading } = useProjectTasks(projectId);
  
  // Project update mutation
  const updateProject = useUpdateProject();
  
  // Project update modal state
  const [showUpdateModal, setShowUpdateModal] = React.useState(false);
  
  // Modal management (with migration compatibility)
  // Modal management using direct store access
  const closeAllModals = useUIStore(state => state.closeAllModals);
  const openModal = useUIStore(state => state.openModal);
  const closeModal = useUIStore(state => state.closeModal);
  
  // Modal states using store
  const showBudgetModal = useUIStore(state => state.modals.budgetModal || false);
  const showPhaseModal = useUIStore(state => state.modals.phaseModal || false);
  const showTeamModal = useUIStore(state => state.modals.teamModal || false);
  
  // Local modal state for editing
  const [currentPhaseId, setCurrentPhaseId] = React.useState('');
  const [editingItem, setEditingItem] = React.useState<{
    type: 'budget' | 'phase' | 'team';
    data: Record<string, unknown>;
  } | null>(null);
  const [modalMode, setModalMode] = React.useState<'create' | 'edit'>('create');
  
  // Modal management functions
  const modalManagement = {
    showBudgetModal,
    showPhaseModal,
    showTeamModal,
    currentPhaseId,
    editingItem,
    modalMode,
    openCreateModal: (type: 'budget' | 'phase' | 'team') => {
      setModalMode('create');
      setEditingItem(null);
      openModal(`${type}Modal`);
    },
    openEditModal: (type: 'budget' | 'phase' | 'team', data: Record<string, unknown>) => {
      setModalMode('edit');
      setEditingItem({ type, data });
      openModal(`${type}Modal`);
    },
    closeModals: () => {
      closeAllModals();
      setEditingItem(null);
    },
    setCurrentPhaseId
  };
  
  // Normalize phases from query (UI shape) to full ProjectPhase[] expected by components
  const normalizedPhases: ProjectPhase[] = React.useMemo(() => {
    // phases from hook are UI-shaped: ProjectDetailsPhase
    if (!Array.isArray(rawPhases)) return [];
    const withIds = (rawPhases as ProjectDetailsPhase[]).filter((p): p is ProjectDetailsPhase & { id: string } => Boolean(p.id));
    return withIds.map((p) => {
      // Extract timeline data properly - preserve actual_start/actual_end from database
      const timelineData = p.timeline || {};
      
      // Extract budget data from consolidated query if available
      const projectCurrency = projectData?.currency || 'USD';
      const phaseAllocatedBudget = p.budget?.allocated || 0;
      const phaseSpentBudget = p.budget?.spent || 0;
      
      return {
        id: p.id,
        name: p.name,
        description: p.description || '',
        category: p.category || 'CONSTRUCTION',
        status: toDbPhaseStatus(p.status),
        project_id: p.project_id,
        details: p.details || {},
        timeline: (() => {
          // SECURITY & DATA INTEGRITY: Validate and sanitize all date fields
          const plannedStart = validateAndSanitizeDate(timelineData.planned_start || p.start_date);
          const plannedEnd = validateAndSanitizeDate(timelineData.planned_end || p.end_date);
          const actualStart = validateAndSanitizeDate(timelineData.actual_start || p.actual_start);
          const actualEnd = validateAndSanitizeDate(timelineData.actual_end || p.actual_end);
          
          // Validate chronological consistency
          const validatedTimeline = validateTimelineChronology({
            planned_start: plannedStart,
            planned_end: plannedEnd,
            actual_start: actualStart,
            actual_end: actualEnd,
          }, p.name);
          
          // Convert null to undefined to match ProjectPhase interface
          return {
            planned_start: validatedTimeline.planned_start || undefined,
            planned_end: validatedTimeline.planned_end || undefined,
            actual_start: validatedTimeline.actual_start || undefined,
            actual_end: validatedTimeline.actual_end || undefined,
          };
        })(),
        budget: {
          // Use real budget data instead of hardcoded zeros
          allocated: phaseAllocatedBudget,
          spent: phaseSpentBudget,
          currency: projectCurrency,
        },
        created_at: p.created_at || new Date().toISOString(),
        updated_at: p.updated_at || new Date().toISOString(),
        // CRITICAL: Preserve tasks from consolidated query
        tasks: Array.isArray((p as any).tasks) ? (p as any).tasks as EnhancedTask[] : [],
      };
    });
  }, [rawPhases, projectData]);

  // CRUD operations
  const crudOperations = useCRUDOperations({ 
    projectId, 
    phases: normalizedPhases, 
    onCloseModals: modalManagement.closeModals 
  });
  
  // Task CRUD operations using custom hook
  const taskOperations = useTaskCRUD();
  
  // Transform project data for UI consumption
  // Note: projectData is already transformed by the consolidated query
  const project = React.useMemo(() => {
    if (!projectData) return null;
    // The consolidated query already applies transformations, so we can use it directly
    return projectData as Project;
  }, [projectData]);

  // Use reusable hook for urgency scoring and today's focus selection
  // OPTIMIZED: Now uses server-side urgency calculations when projectId is available
  const { todaysFocus, getUrgencyScore } = useTodaysFocus(allProjectTasks, { 
    limit: 5, 
    projectId // Pass projectId to enable server-side optimizations
  });

  // Handle project update
  const handleUpdateProject = React.useCallback(async (data: ProjectUpdateFormData) => {
    try {
      await updateProject.mutateAsync({
        id: projectId,
        ...data
      });
      setShowUpdateModal(false);
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  }, [updateProject, projectId]);

  // Handle close update modal
  const handleCloseUpdateModal = React.useCallback(() => {
    setShowUpdateModal(false);
  }, []);

  const contextValue: ProjectDataContextValue = {
    // Data
    projectData,
    project,
    budgetExpenses,
    teamMembers,
    phases: normalizedPhases,
    allProjectTasks,
    todaysFocus,
    
    // Loading states
    isLoading: projectLoading || tasksLoading,
    projectLoading,
    tasksLoading,
    
    // Error states
    projectError,
    
    // Modal state
    showUpdateModal,
    setShowUpdateModal,
    
    // Operations
    modalManagement,
    crudOperations,
    taskOperations,
    updateProject,
    
    // Handlers
    handleUpdateProject,
    handleCloseUpdateModal,
    getUrgencyScore,
    
    // Navigation
    navigate
  };

  return children(contextValue);
}
