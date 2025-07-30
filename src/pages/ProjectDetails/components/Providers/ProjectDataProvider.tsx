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
  
  // Use comprehensive project details data with Supabase integration
  const {
    project: projectData,
    budgetExpenses,
    teamMembers,
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

  // Calculate urgency score based on multiple factors - prioritize by priority level first
  const getUrgencyScore = React.useCallback((task: TaskItem): number => {
    let score = 0;
    
    // Priority scoring (main factor) - higher weights for priority-based selection
    const priorityScores = { 'URGENT': 100, 'HIGH': 75, 'MEDIUM': 50, 'LOW': 25 };
    score += priorityScores[task.priority?.toUpperCase()] || 25;
    
    // Status scoring - blocked and in-progress tasks need attention
    if (task.status?.toUpperCase() === 'BLOCKED') score += 30; // Blocked tasks are urgent
    else if (task.status?.toUpperCase() === 'IN_PROGRESS') score += 20; // Continue working on these
    
    // Due date scoring (secondary factor) - bonus points for time-sensitive tasks
    if (task.due_date) {
      const dueDate = new Date(task.due_date);
      const today = new Date();
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDue < 0) score += 25; // Overdue - needs immediate attention
      else if (daysUntilDue === 0) score += 20; // Due today
      else if (daysUntilDue === 1) score += 15; // Due tomorrow
      else if (daysUntilDue <= 3) score += 10; // Due within 3 days
      else if (daysUntilDue <= 7) score += 5; // Due within a week
    }
    
    return score;
  }, []);

  // Calculate today's focus tasks - show priority tasks from all phases
  const todaysFocus = React.useMemo(() => {
    return allProjectTasks
      .filter(task => {
        const status = task.status?.toUpperCase();
        return status !== 'COMPLETED' && status !== 'CANCELLED';
      })
      .sort((a, b) => getUrgencyScore(b) - getUrgencyScore(a))
      .slice(0, 5); // Show top 5 priority tasks from all phases
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
    teamMembers,
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
