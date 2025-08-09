/**
 * useCRUDOperations - Custom hook for handling CRUD operations
 * Extracted from ProjectDetailsContent.tsx for better organization
 * Handles create, update, delete operations for budget, phases, and team members
 */

import { toast } from 'sonner';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import {
  useCreateBudgetExpense,
  useUpdateBudgetExpense,
  useDeleteBudgetExpense,
  useCreateTeamMember,
  useUpdateTeamMember,
  useDeleteTeamMember,
  useCreateProjectDetailsPhase,
  useUpdateProjectDetailsPhase,
  useDeleteProjectDetailsPhase,
  useCreateTask
} from '@/hooks/mutations';
import { BudgetFormData, PhaseFormData, TeamMemberFormData } from '@/types/projectDetails';
import { CONSTRUCTION_PHASES_WITH_TASKS } from '@/data/constants/constructionPhasesWithTasks';

interface UseCRUDOperationsProps {
  projectId: string;
  phases?: any[];
  onCloseModals: () => void;
}

export function useCRUDOperations({ projectId, phases, onCloseModals }: UseCRUDOperationsProps) {
  const { user } = useSupabaseAuth();
  
  // Mutations
  const createBudgetExpense = useCreateBudgetExpense();
  const updateBudgetExpense = useUpdateBudgetExpense();
  const deleteBudgetExpense = useDeleteBudgetExpense();
  
  const createTeamMember = useCreateTeamMember();
  const updateTeamMember = useUpdateTeamMember();
  const deleteTeamMember = useDeleteTeamMember();
  
  const createPhase = useCreateProjectDetailsPhase();
  const updatePhase = useUpdateProjectDetailsPhase();
  const deletePhase = useDeleteProjectDetailsPhase();
  
  const createTask = useCreateTask();

  // Generic delete handler with comprehensive debug logging
  const handleDelete = async (type: 'budget' | 'phase' | 'team', id: string) => {
    console.log('[ACTIVITY_DEBUG] [useCRUDOperations] handleDelete called from PhaseTimelineCard', {
      type,
      id,
      projectId,
      timestamp: new Date().toISOString(),
      userId: user?.id,
      userEmail: user?.email
    });
    
    try {
      if (type === 'budget') {
        console.log('[ACTIVITY_DEBUG] [useCRUDOperations] Calling deleteBudgetExpense.mutateAsync');
        await deleteBudgetExpense.mutateAsync(id);
      } else if (type === 'phase') {
        console.log('[ACTIVITY_DEBUG] [useCRUDOperations] Calling deletePhase.mutateAsync (useDeleteProjectDetailsPhase)', {
          phaseId: id,
          projectId,
          timestamp: new Date().toISOString()
        });
        await deletePhase.mutateAsync(id);
        console.log('[ACTIVITY_DEBUG] [useCRUDOperations] deletePhase.mutateAsync completed successfully');
      } else if (type === 'team') {
        console.log('[ACTIVITY_DEBUG] [useCRUDOperations] Calling deleteTeamMember.mutateAsync');
        await deleteTeamMember.mutateAsync({ memberId: id, projectId });
      }
      
      console.log('[ACTIVITY_DEBUG] [useCRUDOperations] Delete operation completed successfully', {
        type,
        id,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('[ACTIVITY_DEBUG] [useCRUDOperations] Delete operation failed:', {
        type,
        id,
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
    }
  };

  // Budget CRUD operations
  const handleBudgetSubmit = async (data: BudgetFormData, modalMode: 'create' | 'edit', editingItem?: any) => {
    try {
      if (modalMode === 'create') {
        await createBudgetExpense.mutateAsync({
          projectId,
          expense: {
            name: data.name,
            amount: data.amount,
            category: data.category,
            status: data.status || 'planned',
            paymentDate: data.paymentDate || new Date().toISOString().split('T')[0],
            vendorName: data.vendorName || 'TBD',
            description: data.description || ''
          }
        });
        toast.success('Budget expense created successfully!');
      } else if (editingItem) {
        await updateBudgetExpense.mutateAsync({
          expenseId: editingItem.data.id,
          expense: {
            name: data.name,
            amount: data.amount,
            category: data.category,
            status: data.status || 'planned',
            paymentDate: data.paymentDate,
            vendorName: data.vendorName,
            description: data.description
          }
        });
        toast.success('Budget expense updated successfully!');
      }
      onCloseModals();
    } catch (error) {
      console.error('Failed to save budget expense:', error);
    }
  };

  // Phase CRUD operations
  const handlePhaseSubmit = async (data: PhaseFormData, modalMode: 'create' | 'edit', editingItem?: any, selectedTaskIds?: string[]) => {
    try {
      if (modalMode === 'create') {
        console.log('[ACTIVITY_DEBUG] [useCRUDOperations] handlePhaseSubmit - CREATE mode', {
          phaseName: data.name,
          projectId,
          userId: user?.id,
          timestamp: new Date().toISOString()
        });
        
        // Check for duplicate phase names
        const existingPhase = phases?.find(phase => 
          phase.name.toLowerCase().trim() === data.name.toLowerCase().trim()
        );
        
        if (existingPhase) {
          toast.error(`Phase "${data.name}" already exists. Please choose a different name.`);
          return;
        }
        
        // Create phase with proper database structure
        const phaseData = {
          name: data.name,
          description: data.description,
          category: data.category,
          project_id: projectId,
          status: 'PLANNING' as const,
          timeline: {
            planned_start: data.startDate || null,
            planned_end: data.endDate || null,
            actual_start: null,
            actual_end: null
          },
          budget: {
            allocated: 0,
            spent: 0,
            currency: 'USD'
          },
          details: {}
        };
        
        console.log('[ACTIVITY_DEBUG] [useCRUDOperations] Calling createPhase.mutateAsync (useCreateProjectDetailsPhase)', {
          phaseData,
          timestamp: new Date().toISOString()
        });
        
        // Create the phase
        const createdPhase = await createPhase.mutateAsync(phaseData);
        
        console.log('[ACTIVITY_DEBUG] [useCRUDOperations] createPhase.mutateAsync completed successfully', {
          createdPhaseId: createdPhase.id,
          phaseName: createdPhase.name,
          timestamp: new Date().toISOString()
        });
        
        // Create selected default tasks for the phase
        if (selectedTaskIds && selectedTaskIds.length > 0 && user?.id) {
          // Find the phase template to get task details
          const phaseTemplate = CONSTRUCTION_PHASES_WITH_TASKS[data.category as keyof typeof CONSTRUCTION_PHASES_WITH_TASKS];
          
          const taskCreationPromises = selectedTaskIds.map(async (taskId) => {
            try {
              // Find the task template to get meaningful name and description
              const taskTemplate = phaseTemplate?.tasks.find(task => task.id === taskId);
              
              const taskData = {
                title: taskTemplate?.name || `Task ${taskId}`,
                description: taskTemplate?.description || `Default task for ${createdPhase.name} phase`,
                phase_id: createdPhase.id,
                project_id: projectId,
                status: 'pending' as const,
                priority: 'medium' as const,
                created_by: user?.id || ''
              };
              
              return await createTask.mutateAsync(taskData);
            } catch (error) {
              console.error(`Failed to create task: ${taskId}`, error);
              return null;
            }
          });
          
          const createdTasks = await Promise.all(taskCreationPromises);
          const successfulTasks = createdTasks.filter(task => task !== null);
          
          if (successfulTasks.length > 0) {
            toast.success(`Phase created with ${successfulTasks.length} tasks successfully!`);
          }
        } else {
          toast.success('Phase created successfully!');
        }
      } else if (editingItem) {
        console.log('[ACTIVITY_DEBUG] [useCRUDOperations] handlePhaseSubmit - EDIT mode', {
          phaseId: editingItem.data.id,
          phaseName: data.name,
          projectId,
          userId: user?.id,
          timestamp: new Date().toISOString()
        });
        
        console.log('[ACTIVITY_DEBUG] [useCRUDOperations] Calling updatePhase.mutateAsync (useUpdateProjectDetailsPhase)', {
          phaseId: editingItem.data.id,
          updateData: {
            name: data.name,
            description: data.description,
            status: 'in-progress'
          },
          timestamp: new Date().toISOString()
        });
        
        await updatePhase.mutateAsync({
          phaseId: editingItem.data.id,
          phase: {
            name: data.name,
            description: data.description,
            status: 'in-progress'
          }
        });
        
        console.log('[ACTIVITY_DEBUG] [useCRUDOperations] updatePhase.mutateAsync completed successfully', {
          phaseId: editingItem.data.id,
          timestamp: new Date().toISOString()
        });
        
        toast.success('Phase updated successfully!');
      }
      onCloseModals();
    } catch (error) {
      console.error('Failed to save phase:', error);
    }
  };

  // Team member CRUD operations
  const handleTeamMemberSubmit = async (data: TeamMemberFormData, modalMode: 'create' | 'edit', editingItem?: any) => {
    try {
      if (modalMode === 'create') {
        await createTeamMember.mutateAsync({
          projectId,
          member: {
            name: data.name,
            role: data.role,
            status: data.status,
            contactInfo: {
              phone: data.phone || '',
              email: data.email || ''
            }
          }
        });
        toast.success('Team member added successfully!');
      } else if (editingItem) {
        await updateTeamMember.mutateAsync({
          memberId: editingItem.data.id,
          member: {
            name: data.name,
            role: data.role,
            status: data.status,
            contactInfo: {
              phone: data.phone || '',
              email: data.email || ''
            }
          }
        });
        toast.success('Team member updated successfully!');
      }
      onCloseModals();
    } catch (error) {
      console.error('Failed to save team member:', error);
    }
  };

  return {
    // Mutations for loading states
    createBudgetExpense,
    updateBudgetExpense,
    createTeamMember,
    updateTeamMember,
    createPhase,
    updatePhase,
    
    // CRUD handlers
    handleDelete,
    handleBudgetSubmit,
    handlePhaseSubmit,
    handleTeamMemberSubmit,
  };
}