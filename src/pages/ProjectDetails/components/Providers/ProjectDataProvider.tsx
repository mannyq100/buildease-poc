/**
 * Project Data Provider Component
 * Centralizes all data fetching and business logic for ProjectDetails
 * Follows BuildEase standards for separation of concerns
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectDetailsData } from '@/hooks/queries/useProjectDetails';
import { useProjectTasks } from '@/hooks/queries/useTask';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useUpdateProject } from '@/hooks/mutations/useProject';
import { useTaskCRUD, useCRUDOperations, useModalManagement } from '../../hooks';
import { ProjectTransformService } from '@/services/projectTransformService';
import type { TaskItem, ProjectUpdateFormData } from '../../types';

interface ProjectDataProviderProps {
  projectId: string;
  children: (data: ProjectDataContextValue) => React.ReactNode;
}

interface ProjectDataContextValue {
  // Data
  projectData: any;
  project: any;
  budgetExpenses: any[];
  teamMembers: any[];
  phases: any[];
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
  const { user: _user } = useSupabaseAuth();
  
  // Use comprehensive project details data with Supabase integration
  const {
    project: projectData,
    budgetExpenses,
    teamMembers: _teamMembers,
    phases,
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
  
  // CRUD operations
  const crudOperations = useCRUDOperations({ 
    projectId, 
    phases, 
    onCloseModals: modalManagement.closeModals 
  });
  
  // Task CRUD operations using custom hook
  const taskOperations = useTaskCRUD(projectId);
  
  // Transform project data for UI consumption
  const project = React.useMemo(() => {
    if (!projectData) return null;
    return ProjectTransformService.transformProjectSummary(projectData);
  }, [projectData]);

  // Calculate urgency score based on multiple factors
  const getUrgencyScore = React.useCallback((task: TaskItem): number => {
    let score = 0;
    
    // Priority scoring
    const priorityScores = { 'URGENT': 40, 'HIGH': 30, 'MEDIUM': 20, 'LOW': 10 };
    score += priorityScores[task.priority] || 0;
    
    // Due date scoring (if task has due date)
    if (task.due_date) {
      const dueDate = new Date(task.due_date);
      const today = new Date();
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDue < 0) score += 50; // Overdue
      else if (daysUntilDue === 0) score += 40; // Due today
      else if (daysUntilDue === 1) score += 30; // Due tomorrow
      else if (daysUntilDue <= 3) score += 20; // Due within 3 days
      else if (daysUntilDue <= 7) score += 10; // Due within a week
    }
    
    // Status scoring (blocked tasks are more urgent)
    if (task.status === 'BLOCKED') score += 25;
    else if (task.status === 'IN_PROGRESS') score += 15;
    
    return score;
  }, []);

  // Calculate today's focus tasks
  const todaysFocus = React.useMemo(() => {
    return allProjectTasks
      .filter(task => task.status !== 'COMPLETED' && task.status !== 'CANCELLED')
      .sort((a, b) => getUrgencyScore(b) - getUrgencyScore(a))
      .slice(0, 3);
  }, [allProjectTasks, getUrgencyScore]);

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
    teamMembers: _teamMembers,
    phases,
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
