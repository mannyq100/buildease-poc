/**
 * Modal Store - Centralized Modal State Management with Zustand
 * Replaces the custom useModalState hook with a more robust solution
 * Eliminates infinite re-render issues and simplifies state management
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Phase, Task, Material } from '@/components/shared/modals';
import { BudgetItem } from '@/types/budget';
import { TeamMember } from '@/types/team';

// Modal Types
export type ModalType = 'phase' | 'task' | 'material' | 'date' | 'distribute' | 'budget' | 'team';

// Individual Modal State Interface
export interface ModalState {
  isOpen: boolean;
  data: any;
  isNew: boolean;
  metadata: Record<string, any>;
}

// Date Modal Specific Data
export interface DateModalData {
  dateEditType: 'project' | 'phase';
  phase?: Phase;
}

// Complete Modal Store State
interface ModalStoreState {
  // Individual modal states
  phase: ModalState;
  task: ModalState;
  material: ModalState;
  date: ModalState;
  distribute: ModalState;
  budget: ModalState;
  team: ModalState;
  
  // Global modal state
  isAnyModalOpen: boolean;
  
  // Actions
  openPhaseModal: (phaseData?: Phase, isNew?: boolean) => void;
  openTaskModal: (taskData?: Task, phaseId?: string, isNew?: boolean) => void;
  openMaterialModal: (materialData?: Material, phaseId?: string, isNew?: boolean) => void;
  openDateModal: (type: 'project' | 'phase', phase?: Phase) => void;
  openDistributeModal: () => void;
  openBudgetModal: (budgetData?: BudgetItem, isNew?: boolean) => void;
  openTeamModal: (teamData?: TeamMember, isNew?: boolean) => void;
  
  closePhaseModal: () => void;
  closeTaskModal: () => void;
  closeMaterialModal: () => void;
  closeDateModal: () => void;
  closeDistributeModal: () => void;
  closeBudgetModal: () => void;
  closeTeamModal: () => void;
  closeAllModals: () => void;
  
  // Data update actions
  updatePhaseData: (data: Partial<Phase>) => void;
  updateTaskData: (data: Partial<Task>) => void;
  updateMaterialData: (data: Partial<Material>) => void;
  updateDateData: (data: Partial<DateModalData>) => void;
  updateBudgetData: (data: Partial<BudgetItem>) => void;
  updateTeamData: (data: Partial<TeamMember>) => void;
}

// Initial modal state
const createInitialModalState = (): ModalState => ({
  isOpen: false,
  data: null,
  isNew: true,
  metadata: {}
});

// Create the modal store
export const useModalStore = create<ModalStoreState>()(
  devtools(
    (set, get) => ({
      // Initial states
      phase: createInitialModalState(),
      task: createInitialModalState(),
      material: createInitialModalState(),
      date: createInitialModalState(),
      distribute: createInitialModalState(),
      budget: createInitialModalState(),
      team: createInitialModalState(),
      isAnyModalOpen: false,
      
      // Phase modal actions
      openPhaseModal: (phaseData, isNew = true) => {
        set((state) => ({
          phase: {
            isOpen: true,
            data: phaseData || null,
            isNew,
            metadata: {}
          },
          isAnyModalOpen: true
        }), false, 'openPhaseModal');
      },
      
      closePhaseModal: () => {
        set((state) => {
          const newState = {
            phase: createInitialModalState(),
            isAnyModalOpen: state.task.isOpen || state.material.isOpen || 
                           state.date.isOpen || state.distribute.isOpen ||
                           state.budget.isOpen || state.team.isOpen
          };
          return newState;
        }, false, 'closePhaseModal');
      },
      
      updatePhaseData: (data) => {
        set((state) => ({
          phase: {
            ...state.phase,
            data: { ...state.phase.data, ...data }
          }
        }), false, 'updatePhaseData');
      },
      
      // Task modal actions
      openTaskModal: (taskData, phaseId, isNew = true) => {
        set((state) => ({
          task: {
            isOpen: true,
            data: taskData ? { ...taskData, phaseId } : { phaseId },
            isNew,
            metadata: { phaseId }
          },
          isAnyModalOpen: true
        }), false, 'openTaskModal');
      },
      
      closeTaskModal: () => {
        set((state) => ({
          task: createInitialModalState(),
          isAnyModalOpen: state.phase.isOpen || state.material.isOpen || 
                         state.date.isOpen || state.distribute.isOpen ||
                         state.budget.isOpen || state.team.isOpen
        }), false, 'closeTaskModal');
      },
      
      updateTaskData: (data) => {
        set((state) => ({
          task: {
            ...state.task,
            data: { ...state.task.data, ...data }
          }
        }), false, 'updateTaskData');
      },
      
      // Material modal actions
      openMaterialModal: (materialData, phaseId, isNew = true) => {
        const data = materialData ? { ...materialData, phaseId } : { 
          phaseId,
          id: '',
          name: '',
          quantity: 1,
          unit: 'ea',
          price: 0
        };
        
        set((state) => ({
          material: {
            isOpen: true,
            data,
            isNew,
            metadata: { phaseId }
          },
          isAnyModalOpen: true
        }), false, 'openMaterialModal');
      },
      
      closeMaterialModal: () => {
        set((state) => ({
          material: createInitialModalState(),
          isAnyModalOpen: state.phase.isOpen || state.task.isOpen || 
                         state.date.isOpen || state.distribute.isOpen ||
                         state.budget.isOpen || state.team.isOpen
        }), false, 'closeMaterialModal');
      },
      
      updateMaterialData: (data) => {
        set((state) => ({
          material: {
            ...state.material,
            data: { ...state.material.data, ...data }
          }
        }), false, 'updateMaterialData');
      },
      
      // Date modal actions
      openDateModal: (type, phase) => {
        set((state) => ({
          date: {
            isOpen: true,
            data: { dateEditType: type, phase },
            isNew: false,
            metadata: { dateEditType: type }
          },
          isAnyModalOpen: true
        }), false, 'openDateModal');
      },
      
      closeDateModal: () => {
        set((state) => ({
          date: createInitialModalState(),
          isAnyModalOpen: state.phase.isOpen || state.task.isOpen || 
                         state.material.isOpen || state.distribute.isOpen ||
                         state.budget.isOpen || state.team.isOpen
        }), false, 'closeDateModal');
      },
      
      updateDateData: (data) => {
        set((state) => ({
          date: {
            ...state.date,
            data: { ...state.date.data, ...data }
          }
        }), false, 'updateDateData');
      },
      
      // Distribute modal actions
      openDistributeModal: () => {
        set((state) => ({
          distribute: {
            isOpen: true,
            data: null,
            isNew: false,
            metadata: {}
          },
          isAnyModalOpen: true
        }), false, 'openDistributeModal');
      },
      
      closeDistributeModal: () => {
        set((state) => ({
          distribute: createInitialModalState(),
          isAnyModalOpen: state.phase.isOpen || state.task.isOpen || 
                         state.material.isOpen || state.date.isOpen ||
                         state.budget.isOpen || state.team.isOpen
        }), false, 'closeDistributeModal');
      },
      
      // Budget modal actions
      openBudgetModal: (budgetData, isNew = true) => {
        set((state) => ({
          budget: {
            isOpen: true,
            data: budgetData || null,
            isNew,
            metadata: {}
          },
          isAnyModalOpen: true
        }), false, 'openBudgetModal');
      },
      
      closeBudgetModal: () => {
        set((state) => ({
          budget: createInitialModalState(),
          isAnyModalOpen: state.phase.isOpen || state.task.isOpen || 
                         state.material.isOpen || state.date.isOpen ||
                         state.distribute.isOpen || state.team.isOpen
        }), false, 'closeBudgetModal');
      },
      
      updateBudgetData: (data) => {
        set((state) => ({
          budget: {
            ...state.budget,
            data: { ...state.budget.data, ...data }
          }
        }), false, 'updateBudgetData');
      },
      
      // Team modal actions
      openTeamModal: (teamData, isNew = true) => {
        set((state) => ({
          team: {
            isOpen: true,
            data: teamData || null,
            isNew,
            metadata: {}
          },
          isAnyModalOpen: true
        }), false, 'openTeamModal');
      },
      
      closeTeamModal: () => {
        set((state) => ({
          team: createInitialModalState(),
          isAnyModalOpen: state.phase.isOpen || state.task.isOpen || 
                         state.material.isOpen || state.date.isOpen ||
                         state.distribute.isOpen || state.budget.isOpen
        }), false, 'closeTeamModal');
      },
      
      updateTeamData: (data) => {
        set((state) => ({
          team: {
            ...state.team,
            data: { ...state.team.data, ...data }
          }
        }), false, 'updateTeamData');
      },
      
      // Close all modals
      closeAllModals: () => {
        set(() => ({
          phase: createInitialModalState(),
          task: createInitialModalState(),
          material: createInitialModalState(),
          date: createInitialModalState(),
          distribute: createInitialModalState(),
          budget: createInitialModalState(),
          team: createInitialModalState(),
          isAnyModalOpen: false
        }), false, 'closeAllModals');
      }
    }),
    {
      name: 'modal-store', // Name for devtools
      enabled: process.env.NODE_ENV === 'development'
    }
  )
);

// Convenience hooks for individual modal states
export const usePhaseModal = () => {
  const phase = useModalStore((state) => state.phase);
  const openPhaseModal = useModalStore((state) => state.openPhaseModal);
  const closePhaseModal = useModalStore((state) => state.closePhaseModal);
  const updatePhaseData = useModalStore((state) => state.updatePhaseData);
  
  return {
    ...phase,
    actions: {
      open: openPhaseModal,
      close: closePhaseModal,
      updateData: updatePhaseData
    }
  };
};

export const useTaskModal = () => {
  const task = useModalStore((state) => state.task);
  const openTaskModal = useModalStore((state) => state.openTaskModal);
  const closeTaskModal = useModalStore((state) => state.closeTaskModal);
  const updateTaskData = useModalStore((state) => state.updateTaskData);
  
  return {
    ...task,
    actions: {
      open: openTaskModal,
      close: closeTaskModal,
      updateData: updateTaskData
    }
  };
};

export const useMaterialModal = () => {
  const material = useModalStore((state) => state.material);
  const openMaterialModal = useModalStore((state) => state.openMaterialModal);
  const closeMaterialModal = useModalStore((state) => state.closeMaterialModal);
  const updateMaterialData = useModalStore((state) => state.updateMaterialData);
  
  return {
    ...material,
    actions: {
      open: openMaterialModal,
      close: closeMaterialModal,
      updateData: updateMaterialData
    }
  };
};

export const useDateModal = () => {
  const date = useModalStore((state) => state.date);
  const openDateModal = useModalStore((state) => state.openDateModal);
  const closeDateModal = useModalStore((state) => state.closeDateModal);
  const updateDateData = useModalStore((state) => state.updateDateData);
  
  return {
    ...date,
    actions: {
      open: openDateModal,
      close: closeDateModal,
      updateData: updateDateData
    }
  };
};

export const useDistributeModal = () => {
  const distribute = useModalStore((state) => state.distribute);
  const openDistributeModal = useModalStore((state) => state.openDistributeModal);
  const closeDistributeModal = useModalStore((state) => state.closeDistributeModal);
  
  return {
    ...distribute,
    actions: {
      open: openDistributeModal,
      close: closeDistributeModal
    }
  };
};

export const useBudgetModal = () => {
  const budget = useModalStore((state) => state.budget);
  const openBudgetModal = useModalStore((state) => state.openBudgetModal);
  const closeBudgetModal = useModalStore((state) => state.closeBudgetModal);
  const updateBudgetData = useModalStore((state) => state.updateBudgetData);
  
  return {
    ...budget,
    actions: {
      open: openBudgetModal,
      close: closeBudgetModal,
      updateData: updateBudgetData
    }
  };
};

export const useTeamModal = () => {
  const team = useModalStore((state) => state.team);
  const openTeamModal = useModalStore((state) => state.openTeamModal);
  const closeTeamModal = useModalStore((state) => state.closeTeamModal);
  const updateTeamData = useModalStore((state) => state.updateTeamData);
  
  return {
    ...team,
    actions: {
      open: openTeamModal,
      close: closeTeamModal,
      updateData: updateTeamData
    }
  };
};

// Hook to get all modal handlers (for ref assignment)
export const useModalHandlers = () => {
  return {
    openPhaseModal: useModalStore((state) => state.openPhaseModal),
    openTaskModal: useModalStore((state) => state.openTaskModal),
    openMaterialModal: useModalStore((state) => state.openMaterialModal),
    openDateModal: useModalStore((state) => state.openDateModal),
    openDistributeModal: useModalStore((state) => state.openDistributeModal),
    openBudgetModal: useModalStore((state) => state.openBudgetModal),
    openTeamModal: useModalStore((state) => state.openTeamModal),
    closeAllModals: useModalStore((state) => state.closeAllModals),
  };
};