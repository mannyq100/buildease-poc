/**
 * Modal Manager Component
 * Centralizes all modal rendering and management for ProjectDetails
 * Follows BuildEase standards for component organization
 */

import React from 'react';
import { BaseModal } from '@/components/ui/BaseModal';
import { TaskFormModal } from './TaskFormModal';
import { ProjectUpdateForm } from '../Forms/ProjectUpdateForm';
import { 
  BudgetExpenseForm,
  PhaseForm, 
  TeamMemberForm
} from '../LazyComponents';
import type { ModalState, ProjectUpdateFormData } from '../../types';

interface ModalManagerProps {
  modals: ModalState;
  projectId: string;
  projectData?: any;
  project?: any;
  onCloseModals: () => void;
  onCloseUpdateModal: () => void;
  onBudgetSubmit: (data: any, mode: string, editingItem: any) => void;
  onPhaseSubmit: (data: any, mode: string, editingItem: any, selectedTaskIds?: string[]) => void;
  onTeamMemberSubmit: (data: any, mode: string, editingItem: any) => void;
  onUpdateProject: (data: ProjectUpdateFormData) => void;
  taskModal: {
    isOpen: boolean;
    phaseId?: string;
    task?: any;
  };
  onCloseTaskModal: () => void;
  onCreateTask: (data: any) => void;
  onUpdateTask: (data: any) => void;
  isCreatingTask: boolean;
  isUpdatingTask: boolean;
  isLoadingBudget: boolean;
  isLoadingPhase: boolean;
  isLoadingTeam: boolean;
  isLoadingUpdate: boolean;
}

export function ModalManager({
  modals,
  projectId,
  projectData,
  project,
  onCloseModals,
  onCloseUpdateModal,
  onBudgetSubmit,
  onPhaseSubmit,
  onTeamMemberSubmit,
  onUpdateProject,
  taskModal,
  onCloseTaskModal,
  onCreateTask,
  onUpdateTask,
  isCreatingTask,
  isUpdatingTask,
  isLoadingBudget,
  isLoadingPhase,
  isLoadingTeam,
  isLoadingUpdate
}: ModalManagerProps) {
  return (
    <>
      {/* Budget Modal */}
      <BaseModal
        isOpen={modals.showBudgetModal}
        onClose={onCloseModals}
        title={modals.modalMode === 'create' ? 'Add New Expense' : 'Edit Expense'}
        description="Track project expenses with precision and style"
        size="md"
      >
        <BudgetExpenseForm
          mode={modals.modalMode}
          initialData={modals.editingItem?.type === 'budget' ? {
            category: modals.editingItem.data.category,
            amount: modals.editingItem.data.amount,
            description: modals.editingItem.data.description,
            date: modals.editingItem.data.date,
            payment_status: modals.editingItem.data.payment_status
          } : undefined}
          onSubmit={(data) => onBudgetSubmit(data, modals.modalMode, modals.editingItem)}
          isLoading={isLoadingBudget}
        />
      </BaseModal>
      
      {/* Phase Modal */}
      <BaseModal
        isOpen={modals.showPhaseModal}
        onClose={onCloseModals}
        title={modals.modalMode === 'create' ? 'Create New Phase' : 'Edit Phase'}
        description="Build your project timeline with precision and style"
        size="lg"
      >
        <PhaseForm
          mode={modals.modalMode}
          initialData={modals.editingItem?.type === 'phase' ? {
            name: modals.editingItem.data.name,
            category: modals.editingItem.data.category,
            description: modals.editingItem.data.description,
            startDate: modals.editingItem.data.timeline?.planned_start || '',
            endDate: modals.editingItem.data.timeline?.planned_end || ''
          } : undefined}
          projectType={projectData?.project_type}
          projectId={projectId}
          onSubmit={(data, selectedTaskIds) => onPhaseSubmit(data, modals.modalMode, modals.editingItem, selectedTaskIds)}
          isLoading={isLoadingPhase}
        />
      </BaseModal>
      
      {/* Team Modal */}
      <BaseModal
        isOpen={modals.showTeamModal}
        onClose={onCloseModals}
        title={modals.modalMode === 'create' ? 'Add Team Member' : 'Edit Team Member'}
        description="Manage project team members"
        size="md"
      >
        <TeamMemberForm
          mode={modals.modalMode}
          initialData={modals.editingItem?.type === 'team' ? {
            name: (modals.editingItem.data as Record<string, unknown>).name,
            role: (modals.editingItem.data as Record<string, unknown>).role,
            status: (modals.editingItem.data as Record<string, unknown>).status,
            phone: ((modals.editingItem.data as Record<string, unknown>).contactInfo as Record<string, unknown>)?.phone as string || (modals.editingItem.data as Record<string, unknown>).phone as string,
            email: ((modals.editingItem.data as Record<string, unknown>).contactInfo as Record<string, unknown>)?.email as string || (modals.editingItem.data as Record<string, unknown>).email as string
          } : undefined}
          onSubmit={(data: unknown) => onTeamMemberSubmit(data, modals.modalMode, modals.editingItem)}
          isLoading={isLoadingTeam}
        />
      </BaseModal>
      
      {/* Task Modal */}
      <TaskFormModal
        isOpen={taskModal.isOpen}
        onClose={onCloseTaskModal}
        phaseId={taskModal.phaseId || ''}
        projectId={projectId}
        task={taskModal.task}
        onCreateTask={onCreateTask}
        onUpdateTask={onUpdateTask}
        isLoading={isCreatingTask || isUpdatingTask}
        onSuccess={() => {
          // Optional: refresh tasks or show success message
        }}
      />

      {/* Project Update Modal */}
      <BaseModal
        isOpen={modals.showUpdateModal}
        onClose={onCloseUpdateModal}
        title="Update Project"
        description="Modify project details, timeline, budget, and other key properties"
        size="lg"
      >
        {project && (
          <ProjectUpdateForm
            project={project}
            onSubmit={onUpdateProject}
            onCancel={onCloseUpdateModal}
            isLoading={isLoadingUpdate}
          />
        )}
      </BaseModal>
    </>
  );
}
