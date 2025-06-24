/**
 * usePlanActionsOptimistic Hook
 * Enhanced version of usePlanActions with optimistic updates
 * Provides immediate UI feedback with rollback capability
 */

import { useCallback } from 'react';
import { toast } from 'sonner';
import { useOptimisticCRUD } from './useOptimisticUpdates';
import { 
  PlanPhase, 
  PlanTask, 
  PlanMaterial,
  ModalPhase,
  ModalTask,
  ModalMaterial,
  convertModalPhaseToPlan
} from '@/types/plan/index';

interface PlanActionsOptimisticConfig {
  // Plan data
  phases: PlanPhase[];
  
  // Actual async operations (these would call your backend)
  apiActions: {
    // Phase operations
    addPhase: (phaseData: Omit<PlanPhase, 'id' | 'tasks' | 'materials'>) => Promise<PlanPhase>;
    updatePhase: (phaseId: string, phaseData: Partial<PlanPhase>) => Promise<PlanPhase>;
    deletePhase: (phaseId: string) => Promise<void>;
    reorderPhase: (phaseId: string, direction: 'up' | 'down') => Promise<PlanPhase[]>;
    
    // Task operations
    addTask: (phaseId: string, taskData: Omit<PlanTask, 'id'>) => Promise<PlanTask>;
    updateTask: (phaseId: string, taskId: string, taskData: Partial<PlanTask>) => Promise<PlanTask>;
    deleteTask: (phaseId: string, taskId: string) => Promise<void>;
    
    // Material operations
    addMaterial: (phaseId: string, materialData: Omit<PlanMaterial, 'id'>) => Promise<PlanMaterial>;
    updateMaterial: (phaseId: string, materialId: string, materialData: Partial<PlanMaterial>) => Promise<PlanMaterial>;
    deleteMaterial: (phaseId: string, materialId: string) => Promise<void>;
    
    // Plan-level operations
    updatePlanDates: (startDate: string, endDate: string) => Promise<void>;
  };
  
  // Loading state setters
  setPhaseLoading?: (phaseId: string, loading: boolean) => void;
  setTaskLoading?: (taskId: string, loading: boolean) => void;
  setMaterialLoading?: (materialId: string, loading: boolean) => void;
  setOperationLoading?: (operation: string, loading: boolean) => void;
}

interface PlanActionsOptimisticOptions {
  enableToasts?: boolean;
  enableOptimisticUpdates?: boolean;
  rollbackDelay?: number;
}

export function usePlanActionsOptimistic(
  config: PlanActionsOptimisticConfig,
  options: PlanActionsOptimisticOptions = {}
) {
  const {
    enableToasts = true,
    enableOptimisticUpdates = true,
    rollbackDelay = 3000
  } = options;

  const { phases, apiActions } = config;

  // Set up optimistic updates for phases
  const {
    items: optimisticPhases,
    optimisticCreate: createPhaseOptimistic,
    optimisticUpdate: updatePhaseOptimistic,
    optimisticDelete: deletePhaseOptimistic,
    hasPendingActions: hasPendingPhaseActions,
    clearPendingActions: clearPendingPhaseActions
  } = useOptimisticCRUD(phases, {
    create: apiActions.addPhase,
    update: apiActions.updatePhase,
    delete: apiActions.deletePhase
  });

  // === Enhanced Phase Actions with Optimistic Updates ===

  const handleSavePhase = useCallback(async (phaseData: Partial<ModalPhase>) => {
    const setLoading = (loading: boolean) => {
      if (phaseData.id) {
        config.setPhaseLoading?.(phaseData.id, loading);
      } else {
        config.setOperationLoading?.('add-phase', loading);
      }
    };

    setLoading(true);

    try {
      if (!phaseData.id) {
        // Add new phase with optimistic update
        const newPhaseData: Omit<PlanPhase, 'id' | 'tasks' | 'materials'> = {
          name: phaseData.name || '',
          description: phaseData.description || '',
          order: phaseData.order || 1,
          startDate: phaseData.startDate || new Date().toISOString().substring(0, 10),
          endDate: phaseData.endDate || new Date().toISOString().substring(0, 10),
          status: (phaseData.status as any) || 'pending',
          progress: phaseData.progress || 0
        };

        if (enableOptimisticUpdates) {
          await createPhaseOptimistic(newPhaseData);
        } else {
          const result = await apiActions.addPhase(newPhaseData);
          if (enableToasts) {
            toast.success(`Phase "${result.name}" added successfully`);
          }
        }
      } else {
        // Update existing phase with optimistic update
        const modalPhase: ModalPhase = {
          id: phaseData.id,
          name: phaseData.name || '',
          description: phaseData.description || '',
          order: phaseData.order || 1,
          startDate: phaseData.startDate || new Date().toISOString().substring(0, 10),
          endDate: phaseData.endDate || new Date().toISOString().substring(0, 10),
          status: phaseData.status || 'pending',
          progress: phaseData.progress || 0
        };

        const planPhaseUpdate = convertModalPhaseToPlan(modalPhase);

        if (enableOptimisticUpdates) {
          await updatePhaseOptimistic(phaseData.id, planPhaseUpdate);
        } else {
          const result = await apiActions.updatePhase(phaseData.id, planPhaseUpdate);
          if (enableToasts) {
            toast.success('Phase updated successfully');
          }
        }
      }
    } catch (error) {
      console.error('Failed to save phase:', error);
      if (!enableOptimisticUpdates && enableToasts) {
        toast.error('Failed to save phase');
      }
    } finally {
      setLoading(false);
    }
  }, [config, apiActions, enableOptimisticUpdates, enableToasts, createPhaseOptimistic, updatePhaseOptimistic]);

  const handleDeletePhase = useCallback(async (phaseId: string, phaseName?: string) => {
    config.setPhaseLoading?.(phaseId, true);

    try {
      if (enableOptimisticUpdates) {
        await deletePhaseOptimistic(phaseId);
        // Toast is handled by optimistic hook
      } else {
        await apiActions.deletePhase(phaseId);
        if (enableToasts) {
          toast.success(`Phase "${phaseName || 'Phase'}" deleted successfully`);
        }
      }
    } catch (error) {
      console.error('Failed to delete phase:', error);
      if (!enableOptimisticUpdates && enableToasts) {
        toast.error('Failed to delete phase');
      }
    } finally {
      config.setPhaseLoading?.(phaseId, false);
    }
  }, [config, apiActions, enableOptimisticUpdates, enableToasts, deletePhaseOptimistic]);

  const handleReorderPhase = useCallback(async (phaseId: string, direction: 'up' | 'down') => {
    const operationId = `reorder-phase-${phaseId}`;
    config.setOperationLoading?.(operationId, true);

    try {
      // For reordering, we might want to show immediate feedback but not full optimistic updates
      // since it affects multiple phases
      await apiActions.reorderPhase(phaseId, direction);
      
      if (enableToasts) {
        toast.success(`Phase moved ${direction}`);
      }
    } catch (error) {
      console.error('Failed to reorder phase:', error);
      if (enableToasts) {
        toast.error('Failed to reorder phase');
      }
    } finally {
      config.setOperationLoading?.(operationId, false);
    }
  }, [config, apiActions, enableToasts]);

  // === Task Actions (for future implementation) ===

  const handleSaveTask = useCallback(async (taskData: Partial<ModalTask>) => {
    // Implementation similar to phases, but for tasks within phases
    // TODO: Implement task optimistic updates
  }, []);

  const handleDeleteTask = useCallback(async (phaseId: string, taskId: string, taskName?: string) => {
    // Implementation similar to phases, but for tasks
    // TODO: Implement task deletion with optimistic updates
  }, []);

  // === Material Actions (for future implementation) ===

  const handleSaveMaterial = useCallback(async (materialData: Partial<ModalMaterial>) => {
    // Implementation similar to phases, but for materials
    // TODO: Implement material optimistic updates
  }, []);

  const handleDeleteMaterial = useCallback(async (phaseId: string, materialId: string, materialName?: string) => {
    // Implementation similar to phases, but for materials
    // TODO: Implement material deletion with optimistic updates
  }, []);

  // === Plan-level Actions ===

  const handleUpdatePlanDates = useCallback(async (dateRange: { startDate: string; endDate: string }) => {
    config.setOperationLoading?.('update-plan-dates', true);

    try {
      // Validate date range
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      
      if (startDate >= endDate) {
        toast.error('End date must be after start date');
        return;
      }

      await apiActions.updatePlanDates(dateRange.startDate, dateRange.endDate);
      
      if (enableToasts) {
        toast.success('Project timeline updated');
      }
    } catch (error) {
      console.error('Failed to update plan dates:', error);
      if (enableToasts) {
        toast.error('Failed to update project timeline');
      }
    } finally {
      config.setOperationLoading?.('update-plan-dates', false);
    }
  }, [config, apiActions, enableToasts]);

  return {
    // Enhanced data with optimistic updates
    phases: optimisticPhases,
    hasPendingActions: hasPendingPhaseActions,
    
    // Actions with optimistic updates
    handleSavePhase,
    handleDeletePhase,
    handleReorderPhase,
    handleSaveTask,
    handleDeleteTask,
    handleSaveMaterial,
    handleDeleteMaterial,
    handleUpdatePlanDates,
    
    // Utility actions
    clearPendingActions: clearPendingPhaseActions,
    
    // For debugging/monitoring
    optimisticState: {
      hasPendingPhaseActions
    }
  };
}