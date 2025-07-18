/**
 * Plan Modal Manager Component - Zustand Version
 * Centralized management for all plan-related modals using Zustand store
 * Eliminates infinite re-render issues and simplifies state management
 */

import React, { useEffect, useCallback } from 'react';
import { PhaseFormModal, TaskFormModal, MaterialModal, DateEditModal, ConfirmationModal } from '@/components/shared/modals';
import { DistributeModal } from './DistributeModal';
import { ConstructionPlan } from '@/data/mock/generatedPlan/planData';
import { Phase, Task, Material } from '@/components/shared/modals';
import { 
  convertPlanPhaseToModal, 
  convertPlanTaskToModal, 
  convertPlanMaterialToModal 
} from '@/types/plan/index';
import {
  usePhaseModal,
  useTaskModal,
  useMaterialModal,
  useDateModal,
  useDistributeModal,
  useConfirmationModal
} from '@/stores/modalStore';

// Use the Material interface directly from the import - no need for extension now
// We've already updated the Material interface in MaterialModal.tsx to include all these fields


interface PlanModalManagerProps {
  plan: ConstructionPlan;
  isSaving: boolean;
  onSavePhase: (phaseData: Partial<Phase>) => void;
  onSaveTask: (taskData: Partial<Task>) => void;
  onSaveMaterial: (materialData: Partial<Material>) => void;
  onSaveDates: (dateRange: { startDate: string; endDate: string }) => void;
  onDistribute: () => void;
  modalHandlersRef?: React.MutableRefObject<PlanModalManagerHandlers>;
}

export interface PlanModalManagerHandlers {
  openPhaseModal: (phaseId?: string, isNew?: boolean) => void;
  openTaskModal: (phaseId: string, taskId?: string, isNew?: boolean) => void;
  openMaterialModal: (phaseId: string, materialId?: string, isNew?: boolean) => void;
  openDateModal: (type: 'project' | 'phase', phaseId?: string) => void;
  openDistributeModal: () => void;
  openConfirmationModal: (data: import('@/stores/modalStore').ConfirmationModalData) => void;
}

export const PlanModalManager = React.memo(function PlanModalManager({
  plan,
  isSaving,
  onSavePhase,
  onSaveTask,
  onSaveMaterial,
  onSaveDates,
  onDistribute,
  modalHandlersRef
}: PlanModalManagerProps) {
  // Zustand modal state hooks
  const phaseModal = usePhaseModal();
  const taskModal = useTaskModal();
  const materialModal = useMaterialModal();
  const dateModal = useDateModal();
  const distributeModal = useDistributeModal();
  const confirmationModal = useConfirmationModal();

  // Stable statuses array to prevent re-renders
  const PHASE_STATUSES = React.useMemo(() => ['planning', 'in-progress', 'on-hold', 'completed'], []);
  const TASK_STATUSES = React.useMemo(() => ['not-started', 'in-progress', 'completed', 'on-hold'], []);
  const TEAM_MEMBERS = React.useMemo(() => plan.team.map(member => member.name), [plan.team]);

  // Use unified conversion functions from types/plan

  // Phase modal handlers - now using Zustand store actions
  const handleOpenPhaseModal = useCallback((phaseId?: string, isNew = true) => {
    if (phaseId && !isNew) {
      const planPhase = plan.phases.find(p => p.id === phaseId);
      if (planPhase) {
        phaseModal.actions.open(convertPlanPhaseToModal(planPhase), false);
      } else {
        console.error('PhaseModal: Could not find phase with ID:', phaseId);
      }
    } else {
      phaseModal.actions.open(undefined, true);
    }
  }, [plan.phases, phaseModal.actions]);

  const handleSavePhaseModal = (phaseData: Partial<Phase>) => {
    onSavePhase(phaseData);
    phaseModal.actions.close();
  };

  // Task modal handlers - now using Zustand store actions
  const handleOpenTaskModal = useCallback((phaseId: string, taskId?: string, isNew = true) => {
    if (taskId && !isNew) {
      const phase = plan.phases.find(p => p.id === phaseId);
      if (phase) {
        const task = phase.tasks?.find(t => t.id === taskId);
        if (task) {
          const modalTask = convertPlanTaskToModal(task);
          modalTask.phaseId = phaseId; // Ensure phaseId is set
          taskModal.actions.open(modalTask, phaseId, false);
        } else {
          console.error('TaskModal: Could not find task with ID:', taskId);
        }
      } else {
        console.error('TaskModal: Could not find phase with ID:', phaseId);
      }
    } else {
      taskModal.actions.open(undefined, phaseId, true);
    }
  }, [plan.phases, taskModal.actions]);

  const handleSaveTaskModal = (taskData: Partial<Task>) => {
    onSaveTask(taskData);
    taskModal.actions.close();
  };

  // Material modal handlers - now using Zustand store actions
  const handleOpenMaterialModal = useCallback((phaseId: string, materialId?: string, isNew = true) => {
    if (materialId && !isNew) {
      const phase = plan.phases.find(p => p.id === phaseId);
      if (phase) {
        const material = phase.materials?.find(m => m.id === materialId);
        if (material) {
          const modalMaterial = convertPlanMaterialToModal(material);
          modalMaterial.phaseId = phaseId; // Ensure phaseId is set
          materialModal.actions.open(modalMaterial, phaseId, false);
        } else {
          console.error('MaterialModal: Could not find material with ID:', materialId);
        }
      } else {
        console.error('MaterialModal: Could not find phase with ID:', phaseId);
      }
    } else {
      materialModal.actions.open(undefined, phaseId, true);
    }
  }, [plan.phases, materialModal.actions]);

  const handleSaveMaterialModal = (materialData: Material) => {
    onSaveMaterial(materialData);
    materialModal.actions.close();
  };

  // Date modal handlers - now using Zustand store actions
  const handleOpenDateModal = useCallback((type: 'project' | 'phase', phaseId?: string) => {
    let phase: Phase | undefined;
    
    if (type === 'phase' && phaseId) {
      const planPhase = plan.phases.find(p => p.id === phaseId);
      if (planPhase) {
        phase = convertPlanPhaseToModal(planPhase);
      } else {
        console.error('DateModal: Could not find phase with ID:', phaseId);
        return;
      }
    }

    dateModal.actions.open(type, phase);
  }, [plan.phases, dateModal.actions]);

  const handleSaveDateModal = (dateRange: { startDate: string; endDate: string }) => {
    onSaveDates(dateRange);
    dateModal.actions.close();
  };

  // Distribute modal handlers - now using Zustand store actions
  const handleOpenDistributeModal = useCallback(() => {
    distributeModal.actions.open();
  }, [distributeModal.actions]);

  const handleSaveDistributeModal = () => {
    onDistribute();
    distributeModal.actions.close();
  };

  // Update the ref with current handlers - now stable due to Zustand
  useEffect(() => {
    if (modalHandlersRef) {
      modalHandlersRef.current = {
        openPhaseModal: handleOpenPhaseModal,
        openTaskModal: handleOpenTaskModal,
        openMaterialModal: handleOpenMaterialModal,
        openDateModal: handleOpenDateModal,
        openDistributeModal: handleOpenDistributeModal,
        openConfirmationModal: confirmationModal.actions.open
      };
    }
  }, [modalHandlersRef, handleOpenPhaseModal, handleOpenTaskModal, handleOpenMaterialModal, handleOpenDateModal, handleOpenDistributeModal, confirmationModal.actions.open]);


  return (
    <>
      {/* Phase Modal */}
      <PhaseFormModal
        isOpen={phaseModal.isOpen}
        onClose={phaseModal.actions.close}
        onSave={handleSavePhaseModal}
        phase={phaseModal.data}
        isNew={phaseModal.isNew}
        currentOrder={plan.phases.length}
        statuses={PHASE_STATUSES}
      />
      
      {/* Task Modal */}
      <TaskFormModal
        isOpen={taskModal.isOpen}
        onClose={taskModal.actions.close}
        onSave={handleSaveTaskModal}
        task={taskModal.data}
        isNew={taskModal.isNew}
        statuses={TASK_STATUSES}
        teamMembers={TEAM_MEMBERS}
        phaseId={taskModal.data?.phaseId || ''}
      />
      
      {/* Material Modal */}
      <MaterialModal
        isOpen={materialModal.isOpen}
        onClose={materialModal.actions.close}
        onSave={handleSaveMaterialModal}
        material={materialModal.data}
        isNew={materialModal.isNew}
        phaseId={materialModal.data?.phaseId}
      />
      
      {/* Date Edit Modal */}
      <DateEditModal
        isOpen={dateModal.isOpen}
        onClose={dateModal.actions.close}
        onSave={handleSaveDateModal}
        title={dateModal.data?.dateEditType === 'project' ? 'Edit Project Timeline' : 'Edit Phase Timeline'}
        description={dateModal.data?.dateEditType === 'project' ? 'Update the project start and end dates' : 'Update the phase start and end dates'}
        dateRange={{
          startDate: dateModal.data?.dateEditType === 'project' ? plan.startDate : dateModal.data?.phase?.startDate || '',
          endDate: dateModal.data?.dateEditType === 'project' ? plan.endDate : dateModal.data?.phase?.endDate || '',
          type: dateModal.data?.dateEditType || 'project'
        }}
        isLoading={isSaving}
      />
      
      {/* Distribute Modal */}
      <DistributeModal
        isOpen={distributeModal.isOpen}
        onClose={distributeModal.actions.close}
        onDistribute={handleSaveDistributeModal}
        saving={isSaving}
      />
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={confirmationModal.actions.close}
        onConfirm={confirmationModal.data?.onConfirm || (() => {})}
        title={confirmationModal.data?.title || ''}
        description={confirmationModal.data?.description || ''}
        confirmText={confirmationModal.data?.confirmText}
        cancelText={confirmationModal.data?.cancelText}
        variant={confirmationModal.data?.variant}
        isLoading={isSaving}
      />
    </>
  );
});

export default PlanModalManager;