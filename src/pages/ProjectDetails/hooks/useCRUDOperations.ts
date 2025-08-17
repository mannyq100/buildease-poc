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
  phases?: Array<{ id: string; name: string; }>;
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

  // Generic delete handler
  const handleDelete = async (type: 'budget' | 'phase' | 'team', id: string) => {
    try {
      if (type === 'budget') {
        await deleteBudgetExpense.mutateAsync(id);
      } else if (type === 'phase') {
        await deletePhase.mutateAsync(id);
      } else if (type === 'team') {
        await deleteTeamMember.mutateAsync({ memberId: id, projectId });
      }
    } catch (error) {
      console.error('Delete operation failed:', {
        type,
        id,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  };

  // Budget CRUD operations
  const handleBudgetSubmit = async (data: BudgetFormData, modalMode: 'create' | 'edit', editingItem?: { data: { id: string; } }) => {
    try {
      if (modalMode === 'create') {
        await createBudgetExpense.mutateAsync({
          project_id: projectId,
          transaction_type: data.transaction_type,
          amount: data.amount,
          currency: data.currency,
          category: data.category,
          payment_status: data.payment_status,
          payment_date: data.payment_date || new Date().toISOString().split('T')[0],
          payment_method: data.payment_method,
          description: data.description || '',
          phase_id: data.phase_id
        });
        toast.success('Budget expense created successfully!');
      } else if (editingItem) {
        await updateBudgetExpense.mutateAsync({
          id: editingItem.data.id,
          transaction_type: data.transaction_type,
          amount: data.amount,
          currency: data.currency,
          category: data.category,
          payment_status: data.payment_status,
          payment_date: data.payment_date,
          payment_method: data.payment_method,
          description: data.description,
          phase_id: data.phase_id
        });
        toast.success('Budget expense updated successfully!');
      }
      onCloseModals();
    } catch (error) {
      console.error('Failed to save budget expense:', error);
    }
  };

  // Phase CRUD operations
  const handlePhaseSubmit = async (data: PhaseFormData, modalMode: 'create' | 'edit', editingItem?: { data: { id: string; } }, selectedTaskIds?: string[]) => {
    try {
      if (modalMode === 'create') {
        
        // Check for duplicate phase names
        const existingPhase = phases?.find(phase => 
          phase.name.toLowerCase().trim() === data.name.toLowerCase().trim()
        );
        
        if (existingPhase) {
          toast.error(`Phase "${data.name}" already exists. Please choose a different name.`);
          return;
        }
        
        // Create phase with proper mutation payload
        const phaseData = {
          project_id: projectId,
          name: data.name,
          description: data.description,
          category: data.category,
          start_date: data.startDate,
          end_date: data.endDate,
          // Pass actuals only if explicitly provided; default to null when undefined
          ...(data.actualStart !== undefined && { actual_start: data.actualStart ?? null }),
          ...(data.actualEnd !== undefined && { actual_end: data.actualEnd ?? null })
        };
        
        // Create the phase
        const createdPhase = await createPhase.mutateAsync(phaseData);
        
        // Create selected default tasks for the phase
        if (selectedTaskIds && selectedTaskIds.length > 0 && user?.id) {
          // Find the phase template to get task details
          const phaseTemplate = CONSTRUCTION_PHASES_WITH_TASKS[data.category as keyof typeof CONSTRUCTION_PHASES_WITH_TASKS];
          
          const taskCreationPromises = selectedTaskIds.map(async (taskId) => {
            try {
              // Find the task template to get meaningful name and description
              const taskTemplate = phaseTemplate?.tasks.find((task: { id: string; name: string; description?: string; }) => task.id === taskId);
              
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
        
        const updateData: {
          name?: string;
          description?: string;
          start_date?: string;
          end_date?: string;
          actual_start?: string | null;
          actual_end?: string | null;
        } = {
          name: data.name,
          description: data.description,
          // Only include timeline fields if provided in the form
          ...(data.startDate !== undefined && { start_date: data.startDate }),
          ...(data.endDate !== undefined && { end_date: data.endDate }),
          ...(data.actualStart !== undefined && { actual_start: data.actualStart ?? null }),
          ...(data.actualEnd !== undefined && { actual_end: data.actualEnd ?? null })
        };
        await updatePhase.mutateAsync({ id: editingItem.data.id, ...updateData });
        
        toast.success('Phase updated successfully!');
      }
      onCloseModals();
    } catch (error) {
      console.error('Failed to save phase:', error);
    }
  };

  // Team member CRUD operations
  const handleTeamMemberSubmit = async (data: TeamMemberFormData, modalMode: 'create' | 'edit', editingItem?: { data: { id: string; } }) => {
    try {
      if (modalMode === 'create') {
        await createTeamMember.mutateAsync({
          project_id: projectId,
          name: data.name,
          role: data.role,
          email: data.email || '',
          phone: data.phone || ''
        });
        toast.success('Team member added successfully!');
      } else if (editingItem) {
        await updateTeamMember.mutateAsync({
          id: editingItem.data.id,
          name: data.name,
          role: data.role,
          email: data.email || '',
          phone: data.phone || ''
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