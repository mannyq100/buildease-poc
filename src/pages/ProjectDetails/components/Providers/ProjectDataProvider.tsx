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
import { useTaskCRUD, useCRUDOperations, useModalManagement } from '../../hooks';
import { useTodaysFocus } from '../../hooks/useTodaysFocus';
import type { TaskItem, ProjectUpdateFormData } from '../../types';
import type { Project } from '@/types/project';
import type { BudgetExpense, TeamMember, ProjectPhase } from '@/types/projectDetails';
import { toDbPhaseStatus } from '@/utils/core/phaseStatus';
import type { ProjectDetailsPhase } from '@/hooks/mutations/usePhase';

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
  modalManagement: ReturnType<typeof useModalManagement>;
  
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
  
  // Modal management
  const modalManagement = useModalManagement();
  
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
        timeline: {
          // Preserve all timeline fields - fix the critical data loss issue
          planned_start: timelineData.planned_start || p.start_date || undefined,
          planned_end: timelineData.planned_end || p.end_date || undefined,
          actual_start: timelineData.actual_start || p.actual_start || undefined,
          actual_end: timelineData.actual_end || p.actual_end || undefined,
        },
        budget: {
          // Use real budget data instead of hardcoded zeros
          allocated: phaseAllocatedBudget,
          spent: phaseSpentBudget,
          currency: projectCurrency,
        },
        created_at: p.created_at || new Date().toISOString(),
        updated_at: p.updated_at || new Date().toISOString(),
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
  const { todaysFocus, getUrgencyScore } = useTodaysFocus(allProjectTasks, { limit: 5 });

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
