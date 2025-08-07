/**
 * Enhanced CRUD Operations with Activity Tracking
 * Wraps existing CRUD operations to automatically track project activities
 * Provides seamless integration with the Recent Updates feature
 */

import { toast } from 'sonner';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useActivityTracker } from './useActivityTracker';
import { getProjectCurrency } from '@/utils/projectUtils';
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
  useCreateTask,
  useUpdateTask
} from '@/hooks/mutations';
import { BudgetFormData, PhaseFormData, TeamMemberFormData } from '@/types/projectDetails';

interface UseEnhancedCRUDOperationsProps {
  projectId: string;
  phases?: any[];
  onCloseModals: () => void;
}

export function useEnhancedCRUDOperations({ 
  projectId, 
  phases, 
  onCloseModals 
}: UseEnhancedCRUDOperationsProps) {
  const { user } = useSupabaseAuth();
  const activityTracker = useActivityTracker({ projectId });

  // Base mutations
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
  const updateTask = useUpdateTask();

  // Enhanced budget operations with activity tracking
  const handleBudgetSubmit = async (
    data: BudgetFormData, 
    modalMode: 'create' | 'edit', 
    editingItem?: any
  ) => {
    try {
      if (modalMode === 'create') {
        const result = await createBudgetExpense.mutateAsync({
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

        // Track expense creation activity
        await activityTracker.trackExpenseCreate(
          result.id,
          data.name,
          data.amount
        );

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

        // Track expense update activity
        await activityTracker.trackActivity(
          'expense_update',
          `Expense updated: ${data.name}`,
          `Budget expense "${data.name}" was modified`,
          {
            entityType: 'expense',
            entityId: editingItem.data.id,
            metadata: { 
              expenseTitle: data.name, 
              amount: data.amount,
              category: data.category,
              status: data.status
            },
            status: 'info'
          }
        );

        toast.success('Budget expense updated successfully!');
      }
      onCloseModals();
    } catch (error) {
      console.error('Failed to save budget expense:', error);
    }
  };

  // Enhanced phase operations with activity tracking
  const handlePhaseSubmit = async (
    data: PhaseFormData, 
    modalMode: 'create' | 'edit', 
    editingItem?: any, 
    selectedTaskIds?: string[]
  ) => {
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
            currency: await getProjectCurrency(projectId)
          },
          details: {}
        };
        
        // Create the phase
        const createdPhase = await createPhase.mutateAsync(phaseData);

        // Track phase creation activity
        await activityTracker.trackPhaseCreate(
          createdPhase.id,
          data.name,
          {
            category: data.category,
            description: data.description,
            taskCount: selectedTaskIds?.length || 0
          }
        );
        
        // Create selected default tasks for the phase
        if (selectedTaskIds && selectedTaskIds.length > 0 && user?.id) {
          // Track task creation as part of phase creation
          await activityTracker.trackActivity(
            'task_create',
            `${selectedTaskIds.length} tasks created for ${data.name}`,
            `Default tasks were added to the ${data.name} phase`,
            {
              entityType: 'phase',
              entityId: createdPhase.id,
              metadata: { 
                phaseName: data.name,
                taskCount: selectedTaskIds.length,
                taskIds: selectedTaskIds
              },
              status: 'success'
            }
          );

          toast.success(`Phase created with ${selectedTaskIds.length} tasks successfully!`);
        } else {
          toast.success('Phase created successfully!');
        }
      } else if (editingItem) {
        await updatePhase.mutateAsync({
          phaseId: editingItem.data.id,
          phase: {
            name: data.name,
            description: data.description,
            status: 'in-progress'
          }
        });

        // Track phase update activity
        await activityTracker.trackPhaseUpdate(
          editingItem.data.id,
          data.name,
          {
            description: data.description,
            status: 'in-progress'
          }
        );

        toast.success('Phase updated successfully!');
      }
      onCloseModals();
    } catch (error) {
      console.error('Failed to save phase:', error);
    }
  };

  // Enhanced team member operations with activity tracking
  const handleTeamMemberSubmit = async (
    data: TeamMemberFormData, 
    modalMode: 'create' | 'edit', 
    editingItem?: any
  ) => {
    try {
      if (modalMode === 'create') {
        const result = await createTeamMember.mutateAsync({
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

        // Track team member addition activity
        await activityTracker.trackTeamMemberAdd(
          result.id,
          data.name,
          data.role,
          {
            status: data.status,
            email: data.email,
            phone: data.phone
          }
        );

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

        // Track team member update activity
        await activityTracker.trackActivity(
          'team_member_add', // Using add type for updates too
          `Team member updated: ${data.name}`,
          `Team member information was updated`,
          {
            entityType: 'team_member',
            entityId: editingItem.data.id,
            metadata: { 
              memberName: data.name,
              role: data.role,
              status: data.status
            },
            status: 'info'
          }
        );

        toast.success('Team member updated successfully!');
      }
      onCloseModals();
    } catch (error) {
      console.error('Failed to save team member:', error);
    }
  };

  // Enhanced delete handler with activity tracking
  const handleDelete = async (type: 'budget' | 'phase' | 'team', id: string, itemName?: string) => {
    try {
      if (type === 'budget') {
        await deleteBudgetExpense.mutateAsync(id);
        
        // Track expense deletion
        await activityTracker.trackExpenseDelete(
          id,
          itemName || 'Unknown expense'
        );
      } else if (type === 'phase') {
        await deletePhase.mutateAsync(id);
        
        // Track phase deletion
        await activityTracker.trackPhaseDelete(
          id,
          itemName || 'Unknown phase'
        );
      } else if (type === 'team') {
        await deleteTeamMember.mutateAsync({ memberId: id, projectId });
        
        // Track team member removal
        await activityTracker.trackTeamMemberRemove(
          id,
          itemName || 'Unknown member'
        );
      }
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error);
    }
  };

  // Task completion tracking
  const handleTaskComplete = async (taskId: string, taskTitle: string, phaseId?: string) => {
    try {
      await updateTask.mutateAsync({
        taskId,
        task: { status: 'completed' }
      });

      // Track task completion
      await activityTracker.trackTaskComplete(
        taskId,
        taskTitle,
        phaseId
      );

      toast.success(`Task "${taskTitle}" completed!`);
    } catch (error) {
      console.error('Failed to complete task:', error);
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
    
    // Enhanced CRUD handlers with activity tracking
    handleDelete,
    handleBudgetSubmit,
    handlePhaseSubmit,
    handleTeamMemberSubmit,
    handleTaskComplete,
    
    // Utility functions
    activityTracker // Expose activity tracker for custom tracking
  };
}