/**
 * Project Layout Component
 * Handles the main UI layout and structure for ProjectDetails
 * Follows BuildEase standards for mobile-first responsive design
 */

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BudgetOverviewCard, BudgetExpensesList } from '../Budget';
import { TeamMembersList } from '../Team';
import { PhaseTimelineCard } from '../Phases';
import { 
  ProjectDocumentsSection, 
  ProjectSettingsSection
} from '../LazyComponents';
import { TodaysFocusCard } from '../TodaysFocusCard';
import { RecentUpdatesCard } from '../Updates/RecentUpdatesCard';
import { ProjectStatusHero, ProjectQuickActions } from '../ProjectHeader';
import { ModalManager } from '../Modals/ModalManager';
import { useProjectDetailsState } from '../../hooks/useProjectDetailsState';
import type { TaskItem, ProjectUpdateFormData } from '../../types';

interface ProjectLayoutProps {
  // Data
  project: any;
  projectData: any;
  budgetExpenses: any[];
  teamMembers: any[];
  phases: any[];
  todaysFocus: TaskItem[];
  
  // State
  showUpdateModal: boolean;
  setShowUpdateModal: (show: boolean) => void;
  
  // Modal management (nested object)
  modalManagement: {
    showBudgetModal: boolean;
    showPhaseModal: boolean;
    showTeamModal: boolean;
    currentPhaseId: string;
    editingItem: {
      type: 'budget' | 'phase' | 'team';
      data: Record<string, unknown>;
    } | null;
    modalMode: 'create' | 'edit';
    openCreateModal: (type: 'budget' | 'phase' | 'team') => void;
    openEditModal: (type: 'budget' | 'phase' | 'team', data: Record<string, unknown>) => void;
    closeModals: () => void;
    setCurrentPhaseId: (id: string) => void;
  };
  
  // CRUD operations (nested object)
  crudOperations: {
    handleBudgetSubmit: (data: any, modalMode: 'create' | 'edit', editingItem?: any) => Promise<void>;
    handlePhaseSubmit: (data: any, modalMode: 'create' | 'edit', editingItem?: any, selectedTaskIds?: string[]) => Promise<void>;
    handleTeamMemberSubmit: (data: any, modalMode: 'create' | 'edit', editingItem?: any) => Promise<void>;
    handleDelete: (type: 'budget' | 'phase' | 'team', id: string) => Promise<void>;
    createBudgetExpense: { isPending: boolean };
    updateBudgetExpense: { isPending: boolean };
    createTeamMember: { isPending: boolean };
    updateTeamMember: { isPending: boolean };
    createPhase: { isPending: boolean };
    updatePhase: { isPending: boolean };
  };
  
  // Task operations (nested object)
  taskOperations: {
    taskModal: {
      isOpen: boolean;
      mode: 'create' | 'edit';
      task?: any;
      phaseId?: string;
    };
    openCreateTaskModal: (phaseId: string) => void;
    openEditTaskModal: (task: any, phaseId: string) => void;
    closeTaskModal: () => void;
    handleCreateTask: (taskData: any, phaseId: string, projectId: string) => Promise<void>;
    handleUpdateTask: (taskId: string, taskData: any) => Promise<void>;
    handleDeleteTask: (taskId: string) => Promise<void>;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
  };
  
  // Project update
  updateProject: any;
  handleUpdateProject: (data: ProjectUpdateFormData) => void;
  handleCloseUpdateModal: () => void;
  projectId: string;
}

export function ProjectLayout({
  project,
  projectData,
  budgetExpenses,
  teamMembers,
  phases,
  todaysFocus,
  showUpdateModal,
  setShowUpdateModal,
  modalManagement,
  crudOperations,
  taskOperations,
  updateProject,
  handleUpdateProject,
  handleCloseUpdateModal,
  projectId
}: ProjectLayoutProps) {
  // UI state management for expandable sections
  const { expandedSections, toggleSection } = useProjectDetailsState(projectId);
  
  // Upload modal state management
  const [uploadModalState, setUploadModalState] = useState({
    showImageUpload: false,
    showDocumentUpload: false,
    previewImage: null as { url: string; caption: string; index: number } | null
  });
  
  // Fallback for expandedSections to prevent undefined errors
  const safeExpandedSections = expandedSections || { 
    budget: true, 
    phases: true, 
    team: false, 
    documents: false, 
    settings: false, 
    recentUpdates: false,
    todaysFocus: true
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Project Header */}
        <div className="space-y-4">
          <ProjectStatusHero 
            project={project}
            activeTeamMembers={teamMembers || []}
            toggleSection={(section: string) => {
              // Simple toggle function - could be enhanced to scroll to sections
              console.log('Toggle section:', section);
            }}
            onUpdateProject={() => setShowUpdateModal(true)}
          />
          <ProjectQuickActions 
            onCreateBudgetExpense={() => modalManagement.openCreateModal('budget')}
            onCreatePhase={() => modalManagement.openCreateModal('phase')}
            onAddTeamMember={() => modalManagement.openCreateModal('team')}
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-white/80 backdrop-blur-sm border border-slate-200/60">
            <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
            <TabsTrigger value="budget" className="text-sm">Budget</TabsTrigger>
            <TabsTrigger value="timeline" className="text-sm">Timeline</TabsTrigger>
            <TabsTrigger value="team" className="text-sm">Team</TabsTrigger>
            <TabsTrigger value="documents" className="text-sm">Media</TabsTrigger>
            <TabsTrigger value="settings" className="text-sm">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TodaysFocusCard 
                tasks={todaysFocus}
                onCreateTask={taskOperations.openCreateTaskModal}
                onEditTask={taskOperations.openEditTaskModal}
                isExpanded={safeExpandedSections.todaysFocus}
                onToggleExpanded={() => toggleSection('todaysFocus')}
              />
              <RecentUpdatesCard 
                project={project}
                isExpanded={safeExpandedSections.recentUpdates}
                onToggleExpanded={() => toggleSection('recentUpdates')}
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BudgetOverviewCard 
                project={project}
                onAddExpense={() => modalManagement.openCreateModal('budget')}
              />
              <PhaseTimelineCard 
                phases={phases}
                onAddPhase={() => modalManagement.openCreateModal('phase')}
                onEditPhase={(phase) => modalManagement.openEditModal('phase', phase)}
                onCreateTask={taskOperations.openCreateTaskModal}
                onDeletePhase={(phaseId) => crudOperations.handleDelete('phase', phaseId)}
                onEditTask={taskOperations.openEditTaskModal}
                onDeleteTask={(taskId) => crudOperations.handleDelete('task', taskId)}
              />
            </div>
          </TabsContent>

          {/* Budget Tab */}
          <TabsContent value="budget" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <BudgetOverviewCard 
                  project={project}
                  onAddExpense={() => modalManagement.openCreateModal('budget')}
                />
              </div>
              <div className="lg:col-span-2">
                <BudgetExpensesList 
                  expenses={budgetExpenses}
                  onEdit={(expense) => modalManagement.openEditModal('budget', expense)}
                  onDelete={(id) => crudOperations.handleDelete('budget', id)}
                  onAdd={() => modalManagement.openCreateModal('budget')}
                />
              </div>
            </div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6 mt-6">
            <PhaseTimelineCard 
              phases={phases}
              onAddPhase={() => modalManagement.openCreateModal('phase')}
              onEditPhase={(phase) => modalManagement.openEditModal('phase', phase)}
              onCreateTask={taskOperations.openCreateTaskModal}
              onDeletePhase={(phaseId) => crudOperations.handleDelete('phase', phaseId)}
              onEditTask={taskOperations.openEditTaskModal}
              onDeleteTask={(taskId) => crudOperations.handleDelete('task', taskId)}
            />
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6 mt-6">
            <TeamMembersList 
              teamMembers={teamMembers}
              onEditMember={(member) => modalManagement.openEditModal('team', member)}
              onDeleteMember={(id) => crudOperations.handleDelete('team', id)}
              onCreateMember={() => modalManagement.openCreateModal('team')}
            />
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6 mt-6">
            <ProjectDocumentsSection 
              project={project}
              uploadModalState={uploadModalState}
              onUpdateProject={(updates) => {
                // Update project using mutation
                updateProject.mutateAsync({
                  id: project.id,
                  ...updates
                }).catch(error => {
                  console.error('Failed to update project images:', error);
                });
              }}
              onSetImageUploadState={(key: string, value: unknown) => {
                // Handle image upload state changes
                setUploadModalState(prev => ({
                  ...prev,
                  [key]: value
                }));
              }}
            />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 mt-6">
            <ProjectSettingsSection 
              project={project}
              onUpdateProject={() => setShowUpdateModal(true)}
            />
          </TabsContent>
        </Tabs>

        {/* Modal Manager */}
        <ModalManager
          modals={{
            showBudgetModal: modalManagement.showBudgetModal,
            showPhaseModal: modalManagement.showPhaseModal,
            showTeamModal: modalManagement.showTeamModal,
            showUpdateModal,
            editingItem: modalManagement.editingItem,
            modalMode: modalManagement.modalMode
          }}
          projectId={projectId}
          projectData={projectData}
          project={project}
          onCloseModals={modalManagement.closeModals}
          onCloseUpdateModal={handleCloseUpdateModal}
          onBudgetSubmit={crudOperations.handleBudgetSubmit}
          onPhaseSubmit={crudOperations.handlePhaseSubmit}
          onTeamMemberSubmit={crudOperations.handleTeamMemberSubmit}
          onUpdateProject={handleUpdateProject}
          taskModal={taskOperations.taskModal}
          onCloseTaskModal={taskOperations.closeTaskModal}
          onCreateTask={taskOperations.handleCreateTask}
          onUpdateTask={taskOperations.handleUpdateTask}
          isCreatingTask={taskOperations.isCreatingTask}
          isUpdatingTask={taskOperations.isUpdatingTask}
          isLoadingBudget={crudOperations.createBudgetExpense.isPending || crudOperations.updateBudgetExpense.isPending}
          isLoadingPhase={crudOperations.createPhase.isPending || crudOperations.updatePhase.isPending}
          isLoadingTeam={crudOperations.createTeamMember.isPending || crudOperations.updateTeamMember.isPending}
          isLoadingUpdate={updateProject.isPending}
        />
      </div>
    </div>
  );
}
