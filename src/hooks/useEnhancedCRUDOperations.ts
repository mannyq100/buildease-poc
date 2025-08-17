/**
 * Enhanced CRUD Operations with Activity Tracking
 * Wraps existing CRUD operations to automatically track project activities
 * Provides seamless integration with the Recent Updates feature
 */

import { toast } from 'sonner';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useActivityTracker } from './useActivityTracker';
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
  useUpdateTask
} from '@/hooks/mutations';
import { BudgetFormData, PhaseFormData, TeamMemberFormData } from '@/types/projectDetails';

interface UseEnhancedCRUDOperationsProps {
  projectId: string;
  phases?: Array<{ name: string }>;
  onCloseModals: () => void;
}

// Minimal shape used by edit handlers
interface EditingItemRef { data: { id: string } }

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
  
  const updateTask = useUpdateTask();

  // Enhanced budget operations with activity tracking
  const handleBudgetSubmit = async (
    data: BudgetFormData, 
    modalMode: 'create' | 'edit', 
    editingItem?: EditingItemRef
  ) => {
    try {
      if (modalMode === 'create') {
        const result = await createBudgetExpense.mutateAsync({
          project_id: projectId,
          ...data,
        });

        // Track expense creation activity
        await activityTracker.trackExpenseCreate(
          result.id,
          data.description || data.category,
          data.amount
        );

        toast.success('Budget expense created successfully!');
      } else if (editingItem) {
        await updateBudgetExpense.mutateAsync({
          id: editingItem.data.id,
          ...data,
        });

        // Track expense update activity
        await activityTracker.trackActivity(
          'expense_update',
          `Expense updated: ${data.description || data.category}`,
          `Budget expense "${data.description || data.category}" was modified`,
          {
            entityType: 'expense',
            entityId: editingItem.data.id,
            metadata: { 
              expenseTitle: data.description || data.category, 
              amount: data.amount,
              category: data.category,
              payment_status: data.payment_status
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
    editingItem?: EditingItemRef, 
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
        
        // Create phase with proper mutation payload
        const phaseData = {
          project_id: projectId,
          name: data.name,
          description: data.description,
          category: data.category,
          start_date: data.startDate,
          end_date: data.endDate,
          ...(data.actualStart !== undefined && { actual_start: data.actualStart ?? null }),
          ...(data.actualEnd !== undefined && { actual_end: data.actualEnd ?? null })
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
          id: editingItem.data.id,
          name: data.name,
          description: data.description,
          ...(data.startDate !== undefined && { start_date: data.startDate }),
          ...(data.endDate !== undefined && { end_date: data.endDate }),
          ...(data.actualStart !== undefined && { actual_start: data.actualStart ?? null }),
          ...(data.actualEnd !== undefined && { actual_end: data.actualEnd ?? null })
        });

        // Track phase update activity
        await activityTracker.trackPhaseUpdate(
          editingItem.data.id,
          data.name,
          {
            description: data.description
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
    editingItem?: EditingItemRef
  ) => {
    try {
      // Map UI status to backend-accepted status
      const mappedStatus: 'active' | 'inactive' | 'pending' | undefined =
        data.status === 'active' ? 'active'
        : data.status === 'on-break' ? 'inactive'
        : data.status === 'off-site' ? 'active'
        : undefined;

      if (modalMode === 'create') {
        const result = await createTeamMember.mutateAsync({
          project_id: projectId,
          name: data.name,
          role: data.role,
          email: data.email,
          phone: data.phone,
          ...(mappedStatus && { status: mappedStatus })
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
          id: editingItem.data.id,
          name: data.name,
          role: data.role,
          email: data.email,
          phone: data.phone,
          ...(mappedStatus && { status: mappedStatus }),
          // Provide project_id for JSONB fallback path in useUpdateTeamMember
          project_id: projectId
        } as unknown as import('@/hooks/mutations').UpdateTeamMemberData);

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
        id: taskId,
        status: 'completed'
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