/**
 * Modal Manager Component
 * Centralizes all modal rendering and management for ProjectDetails
 * Follows BuildEase standards for component organization
 */

import React from 'react';
import { BaseModal } from '@/components/ui/BaseModal';
import { TaskFormModal } from './TaskFormModal';
import { ProjectUpdateForm } from '../Forms/ProjectUpdateForm';
import { BudgetModal } from '../Budget/BudgetModal';
import { 
  PhaseForm, 
  TeamMemberForm
} from '../LazyComponents';
import type { ModalState, ProjectUpdateFormData } from '../../types';
import type { Project } from '@/types/database';

// Helper interfaces for better type safety
interface EditingItem {
  type: 'budget' | 'phase' | 'team';
  data: Record<string, unknown>;
}

interface TaskModal {
  isOpen: boolean;
  phaseId?: string;
  task?: Record<string, unknown> | null;
}

interface ModalManagerProps {
  modals: ModalState;
  projectId: string;
  projectData?: Record<string, unknown>;
  project?: Project;
  onCloseModals: () => void;
  onCloseUpdateModal: () => void;
  onBudgetSubmit: (data: Record<string, unknown>, mode: string, editingItem: EditingItem | null) => void;
  onPhaseSubmit: (data: Record<string, unknown>, mode: string, editingItem: EditingItem | null, selectedTaskIds?: string[]) => void;
  onTeamMemberSubmit: (data: Record<string, unknown>, mode: string, editingItem: EditingItem | null) => void;
  onUpdateProject: (data: ProjectUpdateFormData) => void;
  taskModal: TaskModal;
  onCloseTaskModal: () => void;
  onCreateTask: (data: Record<string, unknown>) => void;
  onUpdateTask: (data: Record<string, unknown>) => void;
  isCreatingTask: boolean;
  isUpdatingTask: boolean;
  isLoadingBudget: boolean;
  isLoadingPhase: boolean;
  isLoadingTeam: boolean;
  isLoadingUpdate: boolean;
  projectPhases?: { id: string; name: string }[];
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
  isLoadingUpdate,
  projectPhases
}: ModalManagerProps) {
  return (
    <>
      {/* Budget Modal */}
      <BudgetModal
        isOpen={modals.showBudgetModal}
        onClose={onCloseModals}
        mode={modals.modalMode}
        editingExpense={modals.editingItem?.type === 'budget' ? modals.editingItem.data as any : null}
        onSave={(data) => onBudgetSubmit(data, modals.modalMode, modals.editingItem)}
        isLoading={isLoadingBudget}
        projectPhases={projectPhases}
        project={project}
      />
      
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
            status: modals.editingItem.data.status,
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
