/**
 * usePlanActions Hook
 * Unified CRUD operations for all plan entities
 * Provides consistent APIs across all components
 */

import { useCallback } from 'react';
import { toast } from 'sonner';
import { 
  PlanPhase, 
  PlanTask, 
  PlanMaterial,
  ModalPhase,
  ModalTask,
  ModalMaterial,
  convertModalPhaseToPlan,
  convertModalTaskToPlan,
  convertModalMaterialToPlan
} from '@/types/plan/index';

interface PlanActionsConfig {
  // Core plan state actions
  addPhase: (phaseData: Omit<PlanPhase, 'id' | 'tasks' | 'materials'>) => void;
  updatePhase: (phaseId: string, phaseData: Partial<PlanPhase>) => void;
  deletePhase: (phaseId: string) => void;
  reorderPhase: (phaseId: string, direction: 'up' | 'down') => void;
  
  addTask: (phaseId: string, taskData: Omit<PlanTask, 'id'>) => void;
  updateTask: (phaseId: string, taskId: string, taskData: Partial<PlanTask>) => void;
  deleteTask: (phaseId: string, taskId: string) => void;
  
  addMaterial: (phaseId: string, materialData: Omit<PlanMaterial, 'id'>) => void;
  updateMaterial: (phaseId: string, materialId: string, materialData: Partial<PlanMaterial>) => void;
  deleteMaterial: (phaseId: string, materialId: string) => void;
  
  updatePlanDates: (startDate: string, endDate: string) => void;
  updatePlanStatus: (status: 'draft' | 'final') => void;
  
  // Loading state actions
  setPhaseLoading?: (phaseId: string, loading: boolean) => void;
  setTaskLoading?: (taskId: string, loading: boolean) => void;
  setMaterialLoading?: (materialId: string, loading: boolean) => void;
  setOperationLoading?: (operation: string, loading: boolean) => void;
}

interface PlanActionsOptions {
  enableToasts?: boolean;
  enableLoading?: boolean;
  autoConvertTypes?: boolean;
}

export function usePlanActions(
  actions: PlanActionsConfig,
  options: PlanActionsOptions = {}
) {
  const {
    enableToasts = true,
    enableLoading = true,
    autoConvertTypes = true
  } = options;

  // === Phase Actions ===

  const handleSavePhase = useCallback(async (phaseData: Partial<ModalPhase>) => {
    if (!phaseData.id) {
      // Add new phase
      const modalPhase: ModalPhase = {
        id: phaseData.id || '',
        name: phaseData.name || '',
        description: phaseData.description || '',
        order: phaseData.order || 1,
        startDate: phaseData.startDate || new Date().toISOString().substring(0, 10),
        endDate: phaseData.endDate || new Date().toISOString().substring(0, 10),
        status: phaseData.status || 'pending',
        progress: phaseData.progress || 0
      };
      
      const planPhase = autoConvertTypes 
        ? convertModalPhaseToPlan(modalPhase)
        : phaseData as Omit<PlanPhase, 'id' | 'tasks' | 'materials'>;
      
      if (enableLoading) {
        actions.setOperationLoading?.('add-phase', true);
      }
      
      try {
        actions.addPhase(planPhase);
        if (enableToasts) {
          toast.success(`Phase "${planPhase.name}" added successfully`);
        }
      } finally {
        if (enableLoading) {
          actions.setOperationLoading?.('add-phase', false);
        }
      }
    } else {
      // Update existing phase
      if (enableLoading) {
        actions.setPhaseLoading?.(phaseData.id, true);
      }
      
      try {
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
        
        const planPhaseUpdate = autoConvertTypes 
          ? convertModalPhaseToPlan(modalPhase)
          : phaseData as Partial<PlanPhase>;
        
        actions.updatePhase(phaseData.id, planPhaseUpdate);
        if (enableToasts) {
          toast.success('Phase updated successfully');
        }
      } finally {
        if (enableLoading) {
          actions.setPhaseLoading?.(phaseData.id, false);
        }
      }
    }
  }, [actions, enableToasts, enableLoading, autoConvertTypes]);

  const handleDeletePhase = useCallback(async (phaseId: string, phaseName?: string) => {
    if (enableLoading) {
      actions.setPhaseLoading?.(phaseId, true);
    }
    
    try {
      actions.deletePhase(phaseId);
      if (enableToasts) {
        toast.success(`Phase "${phaseName || 'Phase'}" deleted successfully`);
      }
    } finally {
      if (enableLoading) {
        actions.setPhaseLoading?.(phaseId, false);
      }
    }
  }, [actions, enableToasts, enableLoading]);

  const handleReorderPhase = useCallback(async (phaseId: string, direction: 'up' | 'down') => {
    if (enableLoading) {
      actions.setOperationLoading?.(`reorder-phase-${phaseId}`, true);
    }
    
    try {
      actions.reorderPhase(phaseId, direction);
      if (enableToasts) {
        toast.success(`Phase moved ${direction}`);
      }
    } finally {
      if (enableLoading) {
        actions.setOperationLoading?.(`reorder-phase-${phaseId}`, false);
      }
    }
  }, [actions, enableToasts, enableLoading]);

  // === Task Actions ===

  const handleSaveTask = useCallback(async (taskData: Partial<ModalTask>) => {
    if (!taskData.phaseId) {
      if (enableToasts) {
        toast.error('Phase ID is required for task operations');
      }
      return;
    }

    if (!taskData.id) {
      // Add new task
      const modalTask: ModalTask = {
        id: taskData.id || '',
        name: taskData.name || '',
        description: taskData.description || '',
        duration: taskData.duration || 1,
        startDate: taskData.startDate || new Date().toISOString().substring(0, 10),
        endDate: taskData.endDate || new Date().toISOString().substring(0, 10),
        status: taskData.status || 'pending',
        assignedTo: taskData.assignedTo,
        progress: taskData.progress || 0,
        phaseId: taskData.phaseId
      };
      
      if (enableLoading) {
        actions.setOperationLoading?.('add-task', true);
      }
      
      try {
        const planTask = autoConvertTypes 
          ? convertModalTaskToPlan(modalTask)
          : taskData as Omit<PlanTask, 'id'>;
        
        actions.addTask(taskData.phaseId, planTask);
        if (enableToasts) {
          toast.success(`Task "${planTask.name}" added successfully`);
        }
      } finally {
        if (enableLoading) {
          actions.setOperationLoading?.('add-task', false);
        }
      }
    } else {
      // Update existing task
      if (enableLoading) {
        actions.setTaskLoading?.(taskData.id, true);
      }
      
      try {
        const modalTask: ModalTask = {
          id: taskData.id,
          name: taskData.name || '',
          description: taskData.description || '',
          duration: taskData.duration || 1,
          startDate: taskData.startDate || new Date().toISOString().substring(0, 10),
          endDate: taskData.endDate || new Date().toISOString().substring(0, 10),
          status: taskData.status || 'pending',
          assignedTo: taskData.assignedTo,
          progress: taskData.progress || 0,
          phaseId: taskData.phaseId
        };
        
        const planTaskUpdate = autoConvertTypes 
          ? convertModalTaskToPlan(modalTask)
          : taskData as Partial<PlanTask>;
        
        actions.updateTask(taskData.phaseId, taskData.id, planTaskUpdate);
        if (enableToasts) {
          toast.success('Task updated successfully');
        }
      } finally {
        if (enableLoading) {
          actions.setTaskLoading?.(taskData.id, false);
        }
      }
    }
  }, [actions, enableToasts, enableLoading, autoConvertTypes]);

  const handleDeleteTask = useCallback(async (phaseId: string, taskId: string, taskName?: string) => {
    if (enableLoading) {
      actions.setTaskLoading?.(taskId, true);
    }
    
    try {
      actions.deleteTask(phaseId, taskId);
      if (enableToasts) {
        toast.success(`Task "${taskName || 'Task'}" deleted successfully`);
      }
    } finally {
      if (enableLoading) {
        actions.setTaskLoading?.(taskId, false);
      }
    }
  }, [actions, enableToasts, enableLoading]);

  // === Material Actions ===

  const handleSaveMaterial = useCallback(async (materialData: Partial<ModalMaterial>) => {
    const phaseId = materialData.phaseId;
    if (!phaseId) {
      if (enableToasts) {
        toast.error('Phase ID is required for material operations');
      }
      return;
    }

    if (!materialData.id) {
      // Add new material
      const modalMaterial: ModalMaterial = {
        id: materialData.id || '',
        name: materialData.name || '',
        quantity: materialData.quantity || 1,
        unit: materialData.unit || 'ea',
        phaseId: phaseId,
        ...materialData
      };
      
      if (enableLoading) {
        actions.setOperationLoading?.('add-material', true);
      }
      
      try {
        const planMaterial = autoConvertTypes 
          ? convertModalMaterialToPlan(modalMaterial)
          : materialData as Omit<PlanMaterial, 'id'>;
        
        actions.addMaterial(phaseId, planMaterial);
        if (enableToasts) {
          toast.success(`Material "${planMaterial.name}" added successfully`);
        }
      } finally {
        if (enableLoading) {
          actions.setOperationLoading?.('add-material', false);
        }
      }
    } else {
      // Update existing material
      if (enableLoading) {
        actions.setMaterialLoading?.(materialData.id, true);
      }
      
      try {
        const modalMaterial: ModalMaterial = {
          id: materialData.id,
          name: materialData.name || '',
          quantity: materialData.quantity || 1,
          unit: materialData.unit || 'ea',
          phaseId: phaseId,
          ...materialData
        };
        
        const planMaterial = autoConvertTypes 
          ? convertModalMaterialToPlan(modalMaterial)
          : materialData as Partial<PlanMaterial>;
        
        actions.updateMaterial(phaseId, materialData.id, planMaterial);
        if (enableToasts) {
          toast.success('Material updated successfully');
        }
      } finally {
        if (enableLoading) {
          actions.setMaterialLoading?.(materialData.id, false);
        }
      }
    }
  }, [actions, enableToasts, enableLoading, autoConvertTypes]);

  const handleDeleteMaterial = useCallback(async (phaseId: string, materialId: string, materialName?: string) => {
    if (enableLoading) {
      actions.setMaterialLoading?.(materialId, true);
    }
    
    try {
      actions.deleteMaterial(phaseId, materialId);
      if (enableToasts) {
        toast.success(`Material "${materialName || 'Material'}" deleted successfully`);
      }
    } finally {
      if (enableLoading) {
        actions.setMaterialLoading?.(materialId, false);
      }
    }
  }, [actions, enableToasts, enableLoading]);

  // === Plan Actions ===

  const handleUpdatePlanDates = useCallback(async (dateRange: { startDate: string; endDate: string }) => {
    // Validate date range
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    
    if (startDate >= endDate) {
      if (enableToasts) {
        toast.error('End date must be after start date');
      }
      return;
    }
    
    // Check if dates are in the past (optional warning)
    const today = new Date();
    if (startDate < today && enableToasts) {
      toast.warning('Start date is in the past');
    }
    
    if (enableLoading) {
      actions.setOperationLoading?.('update-dates', true);
    }
    
    try {
      actions.updatePlanDates(dateRange.startDate, dateRange.endDate);
      if (enableToasts) {
        toast.success('Project timeline updated');
      }
    } finally {
      if (enableLoading) {
        actions.setOperationLoading?.('update-dates', false);
      }
    }
  }, [actions, enableToasts, enableLoading]);

  const handleUpdatePlanStatus = useCallback(async (status: 'draft' | 'final') => {
    if (enableLoading) {
      actions.setOperationLoading?.('update-status', true);
    }
    
    try {
      actions.updatePlanStatus(status);
      if (enableToasts) {
        toast.success(`Plan status updated to ${status}`);
      }
    } finally {
      if (enableLoading) {
        actions.setOperationLoading?.('update-status', false);
      }
    }
  }, [actions, enableToasts, enableLoading]);

  return {
    // Phase actions
    handleSavePhase,
    handleDeletePhase,
    handleReorderPhase,
    
    // Task actions
    handleSaveTask,
    handleDeleteTask,
    
    // Material actions
    handleSaveMaterial,
    handleDeleteMaterial,
    
    // Plan actions
    handleUpdatePlanDates,
    handleUpdatePlanStatus,
    
    // Direct access to underlying actions
    actions
  };
}

export default usePlanActions;