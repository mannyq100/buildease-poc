/**
 * Project Layout Component
 * Handles the main UI layout and structure for ProjectDetails
 * Follows BuildEase standards for mobile-first responsive design
 */

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BudgetOverviewCard, BudgetExpensesList } from '../Budget';
import { PhaseTimelineCard } from '../Phases';
import {
  ProjectDocumentsSection,
  ProjectSettingsSection,
  TeamMembersList,
  ProjectCommentsSection,
} from '../LazyComponents';
import { TodaysFocusCard } from '../TodaysFocusCard';
import { RecentUpdatesCard } from '../Updates/RecentUpdatesCard';
import { UnifiedProjectHeader } from '../ProjectHeader/UnifiedProjectHeader';
import { FloatingActionBar } from '../FloatingActionBar';
import { ModalManager } from '../Modals/ModalManager';
import { useProjectDetailsState } from '../../hooks/useProjectDetailsState';
import type { TaskItem, ProjectUpdateFormData } from '../../types';
import type { Project } from '@/types/project';
import type { BudgetExpense, ProjectPhase, TeamMember } from '@/types/projectDetails';
import type { UseMutationResult } from '@tanstack/react-query';

// Helper interfaces for type safety
interface EditingItem {
  type: 'budget' | 'phase' | 'team';
  data: Record<string, unknown>;
}

interface TaskModal {
  isOpen: boolean;
  mode: 'create' | 'edit';
  task?: Record<string, unknown>;
  phaseId?: string;
}

interface ProjectLayoutProps {
  // Data
  project: Project;
  projectData: Record<string, unknown>;
  budgetExpenses?: BudgetExpense[];
  teamMembers: TeamMember[];
  phases: ProjectPhase[];
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
    handleBudgetSubmit: (data: Record<string, unknown>, modalMode: 'create' | 'edit', editingItem?: EditingItem) => Promise<void>;
    handlePhaseSubmit: (data: Record<string, unknown>, modalMode: 'create' | 'edit', editingItem?: EditingItem, selectedTaskIds?: string[]) => Promise<void>;
    handleTeamMemberSubmit: (data: Record<string, unknown>, modalMode: 'create' | 'edit', editingItem?: EditingItem) => Promise<void>;
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
    taskModal: TaskModal;
    openCreateTaskModal: (phaseId: string) => void;
    openEditTaskModal: (task: Record<string, unknown>, phaseId: string) => void;
    closeTaskModal: () => void;
    handleCreateTask: (taskData: Record<string, unknown>, phaseId: string, projectId: string) => Promise<void>;
    handleUpdateTask: (taskId: string, taskData: Record<string, unknown>) => Promise<void>;
    handleDeleteTask: (taskId: string) => Promise<void>;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
  };
  
  // Project update
  updateProject: UseMutationResult<unknown, Error, Record<string, unknown>, unknown>;
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
  // Controlled Tabs state to allow programmatic switching
  const [activeTab, setActiveTab] = useState<'overview' | 'budget' | 'timeline' | 'team' | 'comments' | 'documents' | 'settings'>('overview');
  
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

  // Smooth scroll helper to section anchors and ensure correct tab is active
  const scrollToSection = (section: string) => {
    const sectionMap: Record<string, typeof activeTab> = {
      overview: 'overview',
      todaysFocus: 'overview',
      recentUpdates: 'overview',
      budget: 'budget',
      timeline: 'timeline',
      phases: 'timeline',
      team: 'team',
      comments: 'comments',
      documents: 'documents',
      settings: 'settings'
    };
    const targetTab = sectionMap[section] || 'overview';
    setActiveTab(targetTab);
    // Defer scroll slightly to allow tab content to mount
    requestAnimationFrame(() => {
      const el = document.getElementById(`section-${targetTab}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Subtle grid pattern overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] dark:opacity-[0.08]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(15,23,42,0.4) 1px, transparent 0)",
          backgroundSize: '24px 24px',
        }}
      />
      {/* Ultra-light noise overlay for depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0, rgba(0,0,0,0.06) 1px, transparent 1px, transparent 2px)',
        }}
      />
      {/* Vignette to focus content subtly */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(120% 60% at 50% -10%, transparent 60%, rgba(0,0,0,0.06) 100%)'
        }}
      />
      <div className="container mx-auto px-4 py-2 md:py-6  md:space-y-6">
        {/* Unified Project Header + Recent Updates */}
        <div className="space-y-3 md:space-y-4">
          <UnifiedProjectHeader
            project={project}
            phases={phases}
            activeTeamMembers={teamMembers || []}
            onOpenCreateBudget={() => modalManagement.openCreateModal('budget')}
            onOpenCreatePhase={() => modalManagement.openCreateModal('phase')}
            onAddTeamMember={() => modalManagement.openCreateModal('team')}
            onNavigateToDocuments={() => scrollToSection('documents')}
            onScrollToSection={(section: string) => scrollToSection(section)}
            onUpdateProject={() => setShowUpdateModal(true)}
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
          <TabsList className="sticky top-4 z-30 grid w-full grid-cols-7 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm ring-1 ring-black/5 relative overflow-hidden">
            {(() => {
              const order = ['overview','budget','timeline','team','comments','documents','settings'] as const;
              const index = order.indexOf(activeTab);
              const segmentWidth = 100 / 7; // percent
              return (
                <div
                  aria-hidden
                  className="absolute bottom-0 h-0.5 bg-slate-900/20 dark:bg-white/30 transition-[left,width] duration-300 ease-out"
                  style={{ left: `calc(${segmentWidth}% * ${index < 0 ? 0 : index})`, width: `calc(${segmentWidth}%)` }}
                />
              );
            })()}
            <TabsTrigger value="overview" className="text-sm rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:text-slate-900 transition-colors" style={{ '--tw-bg-opacity': activeTab === 'overview' ? '1' : '0' } as CSSProperties}>Overview</TabsTrigger>
            <TabsTrigger value="budget" className="text-sm rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:text-slate-900 transition-colors" style={{ '--tw-bg-opacity': activeTab === 'budget' ? '1' : '0' } as CSSProperties}>Budget</TabsTrigger>
            <TabsTrigger value="timeline" className="text-sm rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:text-slate-900 transition-colors" style={{ '--tw-bg-opacity': activeTab === 'timeline' ? '1' : '0' } as CSSProperties}>Timeline</TabsTrigger>
            <TabsTrigger value="team" className="text-sm rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:text-slate-900 transition-colors" style={{ '--tw-bg-opacity': activeTab === 'team' ? '1' : '0' } as CSSProperties}>Team</TabsTrigger>
            <TabsTrigger value="comments" className="text-sm rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:text-slate-900 transition-colors" style={{ '--tw-bg-opacity': activeTab === 'comments' ? '1' : '0' } as CSSProperties}>Comments</TabsTrigger>
            <TabsTrigger value="documents" className="text-sm rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:text-slate-900 transition-colors" style={{ '--tw-bg-opacity': activeTab === 'documents' ? '1' : '0' } as CSSProperties}>Media</TabsTrigger>
            <TabsTrigger value="settings" className="text-sm rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:text-slate-900 transition-colors" style={{ '--tw-bg-opacity': activeTab === 'settings' ? '1' : '0' } as CSSProperties}>Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6" id="section-overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TodaysFocusCard 
                tasks={todaysFocus}
                phases={phases}
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
                teamMembers={teamMembers}
                projectId={project.id}
                onAddPhase={() => modalManagement.openCreateModal('phase')}
                onEditPhase={(phase) => modalManagement.openEditModal('phase', phase)}
                onCreateTask={taskOperations.openCreateTaskModal}
                onDeletePhase={(phaseId) => crudOperations.handleDelete('phase', phaseId)}
                onEditTask={taskOperations.openEditTaskModal}
                onDeleteTask={(taskId) => taskOperations.handleDeleteTask(taskId)}
              />
            </div>
          </TabsContent>

          {/* Budget Tab */}
          <TabsContent value="budget" className="space-y-6 mt-6" id="section-budget">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <BudgetOverviewCard 
                  project={project}
                  onAddExpense={() => modalManagement.openCreateModal('budget')}
                />
              </div>
              <div className="lg:col-span-2">
                <BudgetExpensesList 
                  budgetExpenses={budgetExpenses}
                  onEditExpense={(expense) => modalManagement.openEditModal('budget', expense as unknown as Record<string, unknown>)}
                  onDeleteExpense={(id) => crudOperations.handleDelete('budget', id)}
                  onAddExpense={() => modalManagement.openCreateModal('budget')}
                  projectId={projectId}
                />
              </div>
            </div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6 mt-6" id="section-timeline">
            <PhaseTimelineCard 
              phases={phases}
              teamMembers={teamMembers}
              projectId={project.id}
              onAddPhase={() => modalManagement.openCreateModal('phase')}
              onEditPhase={(phase) => modalManagement.openEditModal('phase', phase as unknown as Record<string, unknown>)}
              onCreateTask={taskOperations.openCreateTaskModal}
              onDeletePhase={(phaseId) => crudOperations.handleDelete('phase', phaseId)}
              onEditTask={(task, phaseId) => taskOperations.openEditTaskModal(task as unknown as Record<string, unknown>, phaseId)}
              onDeleteTask={(taskId) => taskOperations.handleDeleteTask(taskId)}
            />
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6 mt-6" id="section-team">
            <TeamMembersList 
              teamMembers={teamMembers as unknown as import('@/types/project').TeamMember[]}
              onEditMember={(member) => modalManagement.openEditModal('team', member as unknown as Record<string, unknown>)}
              onDeleteMember={(id) => crudOperations.handleDelete('team', id)}
              onCreateMember={() => modalManagement.openCreateModal('team')}
            />
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="space-y-6 mt-6" id="section-comments">
            <ProjectCommentsSection projectId={projectId} />
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6 mt-6" id="section-documents">
            <ProjectDocumentsSection 
              project={project}
              uploadModalState={uploadModalState}
              onUpdateProject={async (updates: Record<string, unknown>) => {
                // Update project using mutation
                try {
                  await updateProject.mutateAsync({
                    id: project.id,
                    ...updates
                  });
                  console.log('✅ Project updated successfully:', updates);
                } catch (error) {
                  console.error('❌ Failed to update project:', error);
                  throw error; // Re-throw so calling code can handle the error
                }
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
          <TabsContent value="settings" className="space-y-6 mt-6" id="section-settings">
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
          teamMembers={teamMembers}
          onCloseModals={modalManagement.closeModals}
          onCloseUpdateModal={handleCloseUpdateModal}
          onBudgetSubmit={(data, mode, editingItem) => 
            crudOperations.handleBudgetSubmit(
              data, 
              (mode as 'create' | 'edit'), 
              editingItem || undefined
            )
          }
          onPhaseSubmit={(data, mode, editingItem, selectedTaskIds) => 
            crudOperations.handlePhaseSubmit(
              data, 
              (mode as 'create' | 'edit'), 
              editingItem || undefined,
              selectedTaskIds
            )
          }
          onTeamMemberSubmit={(data, mode, editingItem) => 
            crudOperations.handleTeamMemberSubmit(
              data, 
              (mode as 'create' | 'edit'), 
              editingItem || undefined
            )
          }
          onUpdateProject={handleUpdateProject}
          taskModal={taskOperations.taskModal}
          onCloseTaskModal={taskOperations.closeTaskModal}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onCreateTask={(...args: any[]) => {
            // Expecting (taskData, phaseId, projectId) from TaskFormModal
            const taskData = args[0];
            const phaseId = args[1] as string;
            const projId = (args[2] as string) || projectId;
            return taskOperations.handleCreateTask(taskData, phaseId, projId);
          }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onUpdateTask={(...args: any[]) => {
            // Expecting (taskId, taskData) from TaskFormModal
            const taskId = args[0] as string;
            const taskData = args[1] as Record<string, unknown>;
            return taskOperations.handleUpdateTask(taskId, taskData);
          }}
          isCreatingTask={taskOperations.isCreating}
          isUpdatingTask={taskOperations.isUpdating}
          isLoadingBudget={crudOperations.createBudgetExpense.isPending || crudOperations.updateBudgetExpense.isPending}
          isLoadingPhase={crudOperations.createPhase.isPending || crudOperations.updatePhase.isPending}
          isLoadingTeam={crudOperations.createTeamMember.isPending || crudOperations.updateTeamMember.isPending}
          isLoadingUpdate={updateProject.isPending}
          projectPhases={phases?.map(phase => ({ id: phase.id, name: phase.name })) || []}
        />

        {/* Floating quick actions for mobile productivity */}
        <FloatingActionBar
          projectId={projectId}
          onUpdateProgress={() => setShowUpdateModal(true)}
          onContactTeam={() => console.log('Contact Team')}
          onTakePhoto={() => console.log('Take Photo')}
          onAddNote={() => console.log('Add Note')}
          onReportIssue={() => console.log('Report Issue')}
        />
      </div>
    </div>
  );
}
