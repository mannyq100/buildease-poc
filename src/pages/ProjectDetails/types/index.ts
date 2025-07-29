/**
 * Type definitions for ProjectDetails components
 * Centralized types following BuildEase standards
 */

export interface ProjectDetailsContentProps {
  projectId: string;
}

export interface TaskItem {
  id: string;
  title: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  due_date?: string;
  phase_id?: string;
}

export interface ProjectUpdateFormData {
  name?: string;
  description?: string;
  status?: 'active' | 'planning' | 'completed' | 'on-hold';
  budget?: number;
  start_date?: string;
  end_date?: string;
  location?: string;
  type?: string;
  client?: string;
  project_type?: string;
  street_address?: string;
  currency?: string;
}

export interface ProjectDetailsData {
  project: any;
  budgetExpenses: any[];
  teamMembers: any[];
  phases: any[];
  isLoading: boolean;
  error: Error | null;
}

export interface ModalState {
  showBudgetModal: boolean;
  showPhaseModal: boolean;
  showTeamModal: boolean;
  showUpdateModal: boolean;
  editingItem: any;
  modalMode: 'create' | 'edit';
}

export interface ProjectLayoutProps {
  // Data arrays
  phases: unknown[];
  budgetExpenses: unknown[];
  teamMembers: unknown[];
  tasks: unknown[];
  materials: unknown[];
  
  // Modal management (from useModalManagement)
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
  
  // CRUD operations (from useCRUDOperations)
  handleBudgetSubmit: (data: any, modalMode: 'create' | 'edit', editingItem?: any) => Promise<void>;
  handlePhaseSubmit: (data: any, modalMode: 'create' | 'edit', editingItem?: any, selectedTaskIds?: string[]) => Promise<void>;
  handleTeamMemberSubmit: (data: any, modalMode: 'create' | 'edit', editingItem?: any) => Promise<void>;
  handleDelete: (type: 'budget' | 'phase' | 'team', id: string) => Promise<void>;
  
  // CRUD loading states
  createBudgetExpense: { isPending: boolean };
  updateBudgetExpense: { isPending: boolean };
  createTeamMember: { isPending: boolean };
  updateTeamMember: { isPending: boolean };
  createPhase: { isPending: boolean };
  updatePhase: { isPending: boolean };
  
  // Task operations (from useTaskCRUD)
  taskModal: {
    isOpen: boolean;
    mode: 'create' | 'edit';
    task?: any;
    phaseId?: string;
  };
  openCreateTaskModal: (phaseId: string) => void;
  openEditTaskModal: (task: any, phaseId: string) => void;
  closeTaskModal: () => void;
  handleCreateTask: (taskData: any, phaseId: string, projectId: string) => Promise<void>;
  handleUpdateTask: (taskId: string, taskData: any) => Promise<void>;
  handleDeleteTask: (taskId: string) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}
