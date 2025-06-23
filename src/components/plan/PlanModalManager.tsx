/**
 * Plan Modal Manager Component - Zustand Version
 * Centralized management for all plan-related modals using Zustand store
 * Eliminates infinite re-render issues and simplifies state management
 */

import React, { useEffect } from 'react';
import { PhaseFormModal, TaskFormModal, MaterialModal, DateEditModal } from '@/components/shared/modals';
import { DistributeModal } from './DistributeModal';
import { ConstructionPlan, Material as PlanMaterial, convertToModalMaterial, convertToPlanMaterial } from '@/data/mock/generatedPlan/planData';
import { Phase, Task, Material } from '@/components/shared/modals';
import {
  usePhaseModal,
  useTaskModal,
  useMaterialModal,
  useDateModal,
  useDistributeModal
} from '@/stores/modalStore';

// Use the Material interface directly from the import - no need for extension now
// We've already updated the Material interface in MaterialModal.tsx to include all these fields


interface PlanModalManagerProps {
  plan: ConstructionPlan;
  isSaving: boolean;
  onSavePhase: (phaseData: Partial<Phase>) => void;
  onSaveTask: (taskData: Partial<Task>) => void;
  onSaveMaterial: (materialData: Partial<PlanMaterial>) => void;
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

  // Stable statuses array to prevent re-renders
  const PHASE_STATUSES = React.useMemo(() => ['planning', 'in-progress', 'on-hold', 'completed'], []);
  const TASK_STATUSES = React.useMemo(() => ['not-started', 'in-progress', 'completed', 'on-hold'], []);
  const TEAM_MEMBERS = React.useMemo(() => plan.team.map(member => member.name), [plan.team]);

  // Helper function to convert plan phase to modal phase format
  const convertToModalPhase = (planPhase: ConstructionPlan['phases'][0]): Phase => ({
    id: planPhase.id,
    name: planPhase.name,
    description: planPhase.description,
    order: planPhase.order,
    startDate: planPhase.startDate || '',
    endDate: planPhase.endDate || '',
    status: planPhase.status,
    progress: planPhase.progress
  });

  // Helper function to convert plan task to modal task format
  const convertToModalTask = (planTask: ConstructionPlan['phases'][0]['tasks'][0], phaseId: string): Task => ({
    id: planTask.id,
    name: planTask.name,
    description: planTask.description,
    duration: typeof planTask.duration === 'string' ? parseInt(planTask.duration) || 1 : planTask.duration || 1,
    startDate: planTask.startDate || '',
    endDate: planTask.endDate || '',
    status: planTask.status,
    assignedTo: planTask.assignedTo,
    progress: planTask.progress,
    phaseId: phaseId
  });

  // Phase modal handlers - now using Zustand store actions
  const handleOpenPhaseModal = (phaseId?: string, isNew = true) => {
    console.log('PhaseModal: Opening phase modal', { phaseId, isNew });
    if (phaseId && !isNew) {
      const planPhase = plan.phases.find(p => p.id === phaseId);
      if (planPhase) {
        console.log('PhaseModal: Found phase to edit:', planPhase);
        phaseModal.actions.open(convertToModalPhase(planPhase), false);
      } else {
        console.error('PhaseModal: Could not find phase with ID:', phaseId);
      }
    } else {
      console.log('PhaseModal: Opening new phase modal');
      phaseModal.actions.open(undefined, true);
    }
  };

  const handleSavePhaseModal = (phaseData: Partial<Phase>) => {
    console.log('PhaseModal: Saving phase data:', phaseData);
    onSavePhase(phaseData);
    phaseModal.actions.close();
  };

  // Task modal handlers - now using Zustand store actions
  const handleOpenTaskModal = (phaseId: string, taskId?: string, isNew = true) => {
    console.log('TaskModal: Opening task modal with ID:', taskId);
    if (taskId && !isNew) {
      const phase = plan.phases.find(p => p.id === phaseId);
      if (phase) {
        const task = phase.tasks?.find(t => t.id === taskId);
        if (task) {
          console.log('TaskModal: Found task to edit:', task);
          taskModal.actions.open(convertToModalTask(task, phaseId), phaseId, false);
        } else {
          console.error('TaskModal: Could not find task with ID:', taskId);
        }
      } else {
        console.error('TaskModal: Could not find phase with ID:', phaseId);
      }
    } else {
      console.log('TaskModal: Opening new task modal for phase:', phaseId);
      taskModal.actions.open(undefined, phaseId, true);
    }
  };

  const handleSaveTaskModal = (taskData: Partial<Task>) => {
    console.log('TaskModal: Saving task data:', taskData);
    onSaveTask(taskData);
    taskModal.actions.close();
    console.log('TaskModal: Closing task modal after save');
  };

  // Material modal handlers - now using Zustand store actions
  const handleOpenMaterialModal = (phaseId: string, materialId?: string, isNew = true) => {
    console.log('MaterialModal: Opening material modal', { phaseId, materialId, isNew });
    if (materialId && !isNew) {
      const phase = plan.phases.find(p => p.id === phaseId);
      if (phase) {
        const material = phase.materials?.find(m => m.id === materialId);
        if (material) {
          console.log('MaterialModal: Found material to edit:', material);
          const modalMaterial = convertToModalMaterial(material);
          console.log('MaterialModal: Converted material for modal:', modalMaterial);
          materialModal.actions.open(modalMaterial, phaseId, false);
        } else {
          console.error('MaterialModal: Could not find material with ID:', materialId);
        }
      } else {
        console.error('MaterialModal: Could not find phase with ID:', phaseId);
      }
    } else {
      console.log('MaterialModal: Opening new material modal for phase:', phaseId);
      materialModal.actions.open(undefined, phaseId, true);
    }
  };

  const handleSaveMaterialModal = (materialData: Material) => {
    console.log('MaterialModal: Saving material data:', materialData);
    const planMaterialData = convertToPlanMaterial(materialData);
    console.log('MaterialModal: Converted to plan format:', planMaterialData);
    onSaveMaterial(planMaterialData);
    materialModal.actions.close();
  };

  // Date modal handlers - now using Zustand store actions
  const handleOpenDateModal = (type: 'project' | 'phase', phaseId?: string) => {
    console.log('DateModal: Opening date modal', { type, phaseId });
    let phase: Phase | undefined;
    
    if (type === 'phase' && phaseId) {
      const planPhase = plan.phases.find(p => p.id === phaseId);
      if (planPhase) {
        phase = convertToModalPhase(planPhase);
      } else {
        console.error('DateModal: Could not find phase with ID:', phaseId);
        return;
      }
    }

    dateModal.actions.open(type, phase);
  };

  const handleSaveDateModal = (dateRange: { startDate: string; endDate: string }) => {
    onSaveDates(dateRange);
    dateModal.actions.close();
  };

  // Distribute modal handlers - now using Zustand store actions
  const handleOpenDistributeModal = () => {
    console.log('DistributeModal: Opening distribute modal');
    distributeModal.actions.open();
  };

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
        openDistributeModal: handleOpenDistributeModal
      };
      console.log('ModalManager: Handlers assigned to ref (Zustand version)');
    }
  }, [modalHandlersRef]);


  return (
    <>
      {/* Phase Modal */}
      <PhaseFormModal
        show={phaseModal.isOpen}
        onClose={phaseModal.actions.close}
        onSave={handleSavePhaseModal}
        phase={phaseModal.data}
        isNew={phaseModal.isNew}
        currentOrder={plan.phases.length}
        statuses={PHASE_STATUSES}
      />
      
      {/* Task Modal */}
      <TaskFormModal
        show={taskModal.isOpen}
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
        show={materialModal.isOpen}
        onClose={materialModal.actions.close}
        onSave={handleSaveMaterialModal}
        material={materialModal.data}
        isNew={materialModal.isNew}
        phaseId={materialModal.data?.phaseId}
      />
      
      {/* Date Edit Modal */}
      <DateEditModal
        show={dateModal.isOpen}
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
        show={distributeModal.isOpen}
        onClose={distributeModal.actions.close}
        onDistribute={handleSaveDistributeModal}
        saving={isSaving}
      />
    </>
  );
});

export default PlanModalManager;