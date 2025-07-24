/**
 * Streamlined ProjectDetailsContent - Single page layout focused on essential features
 * Optimized for construction workers using mobile devices with minimal clutter
 * Mobile-first layout with only the most critical information and actions
 */

import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useNavigate } from 'react-router-dom';
import { useProjectDetailsData } from '@/hooks/queries/useProjectDetails';
import { useProjectTasks } from '@/hooks/queries/useTask';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

import { TaskFormModal } from './components/Modals';
import { BudgetOverviewCard, BudgetExpensesList } from './components/Budget';
import { TeamMembersList } from './components/Team';
import { PhaseTimelineCard } from './components/Phases';
import { 
  ProjectDocumentsSection, 
  ProjectSettingsSection,
  BudgetExpenseForm,
  PhaseForm, 
  TeamMemberForm
} from './components/LazyComponents';
import { TodaysFocusCard } from './components/TodaysFocusCard';
import { ProjectErrorFallback, ProjectDetailsLoading, ProjectNotFound } from './components/Utils';
import { useTaskCRUD, useCRUDOperations, useModalManagement, useProjectDetailsState } from './hooks';
import { BaseModal } from '@/components/ui/BaseModal';
import { ProjectTransformService } from '@/services/projectTransformService';
import { ProjectStatusHero, ProjectQuickActions } from './components/ProjectHeader';
import type { TeamMember } from '@/types/projectDetails';

interface ProjectDetailsContentProps {
  projectId: string;
}

interface TaskItem {
  id: string;
  title: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  due_date?: string;
  phase_id?: string;
}

// Utility components have been extracted to separate files


// Phase management components have been extracted to separate files

// Streamlined Project Details Content
function ProjectDetailsMain({ projectId }: ProjectDetailsContentProps) {
  const navigate = useNavigate();
  const { user: _user } = useSupabaseAuth();
  
  // Use comprehensive project details data with Supabase integration
  const {
    project: projectData,
    budgetExpenses,
    teamMembers: _teamMembers,
    phases,
    isLoading: projectLoading,
    error: projectError
  } = useProjectDetailsData(projectId);
  
  // Fetch all project tasks for today's focus calculation
  const { data: allProjectTasks = [], isLoading: tasksLoading } = useProjectTasks(projectId);
  
  // Modal management
  const {
    showBudgetModal,
    showPhaseModal,
    showTeamModal,
    editingItem,
    modalMode,
    openCreateModal,
    openEditModal,
    closeModals
  } = useModalManagement();
  
  // CRUD operations
  const {
    createBudgetExpense,
    updateBudgetExpense,
    createTeamMember,
    updateTeamMember,
    createPhase,
    updatePhase,
    handleDelete,
    handleBudgetSubmit,
    handlePhaseSubmit,
    handleTeamMemberSubmit
  } = useCRUDOperations({ projectId, phases, onCloseModals: closeModals });
  
  // Task CRUD operations using custom hook
  const {
    taskModal,
    openCreateTaskModal,
    openEditTaskModal,
    closeTaskModal,
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    isCreating: isCreatingTask,
    isUpdating: isUpdatingTask,
    isDeleting: _isDeletingTask
  } = useTaskCRUD();
  

  // Centralized UI state management with localStorage persistence
  const {
    expandedSections,
    expandedPhases,
    imageUploadStates,
    toggleSection,
    togglePhase,
    setImageUploadState
  } = useProjectDetailsState(projectId);
  
  // Memoized transformations for performance (called before early returns)
  const project = React.useMemo(() => 
    projectData ? ProjectTransformService.transformProjectDetails(projectData) : null, 
    [projectData]
  );
  
  const currentPhase = React.useMemo(() => 
    phases?.find(p => p.status === 'in-progress') || phases?.[0], 
    [phases]
  );
  
  // Derive today's focus tasks - top 5 tasks that need attention
  const todaysFocusTasks: TaskItem[] = React.useMemo(() => {
    if (!allProjectTasks || allProjectTasks.length === 0) return [];
    
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    // Filter out completed and cancelled tasks, focus on actionable items
    const actionableTasks = allProjectTasks
      .filter(task => {
        // Exclude completed and cancelled tasks
        return task.status !== 'COMPLETED' && task.status !== 'CANCELLED';
      })
      // Sort by priority and urgency factors
      .sort((a, b) => {
        const priorityOrder = { 'URGENT': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
        const aPriority = priorityOrder[a.priority] || 1;
        const bPriority = priorityOrder[b.priority] || 1;
        
        // Calculate urgency score based on multiple factors
        const getUrgencyScore = (task: typeof allProjectTasks[0]) => {
          let score = 0;
          
          // Base priority score
          score += priorityOrder[task.priority] || 1;
          
          // Status bonus
          if (task.status === 'IN_PROGRESS') score += 2;
          if (task.status === 'BLOCKED') score += 3; // Blocked tasks need immediate attention
          
          // Due date urgency
          if (task.due_date) {
            const dueDate = new Date(task.due_date);
            const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysDiff < 0) score += 5; // Overdue
            else if (daysDiff === 0) score += 4; // Due today
            else if (daysDiff === 1) score += 3; // Due tomorrow
            else if (daysDiff <= 3) score += 2; // Due this week
            else if (daysDiff <= 7) score += 1; // Due next week
          }
          
          // Prefer tasks from active phases
          if (currentPhase && task.phase_id === currentPhase.id) {
            score += 2;
          }
          
          return score;
        };
        
        const aScore = getUrgencyScore(a);
        const bScore = getUrgencyScore(b);
        
        // Sort by urgency score (highest first)
        if (aScore !== bScore) {
          return bScore - aScore;
        }
        
        // Then by priority
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        // Finally by due date (earliest first)
        if (a.due_date && b.due_date) {
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        }
        if (a.due_date && !b.due_date) return -1;
        if (!a.due_date && b.due_date) return 1;
        
        return 0;
      })
      // Limit to top 5 tasks for focus
      .slice(0, 5)
      // Map to TaskItem interface
      .map(task => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        due_date: task.due_date,
        phase_id: task.phase_id
      }));
    
    // Fallback: if no actionable tasks found, show any pending/in-progress tasks
    if (actionableTasks.length === 0) {
      const fallbackTasks = allProjectTasks
        .filter(task => task.status === 'PENDING' || task.status === 'IN_PROGRESS')
        .slice(0, 5)
        .map(task => ({
          id: task.id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          due_date: task.due_date,
          phase_id: task.phase_id
        }));
      
      return fallbackTasks;
    }
    
    return actionableTasks;
  }, [allProjectTasks, currentPhase]);
  
  const activeTeamMembers: TeamMember[] = React.useMemo(() => 
    project?.teamMembers && Array.isArray(project.teamMembers) 
      ? (project.teamMembers as TeamMember[]).filter((m: TeamMember) => m.status === 'active')
      : [], 
    [project?.teamMembers]
  );

  // Memoized event handlers to prevent unnecessary re-renders
  const handleToggleSection = React.useCallback((section: string) => {
    toggleSection(section as 'phases' | 'budget' | 'team' | 'documents' | 'settings');
  }, [toggleSection]);

  const handleTogglePhase = React.useCallback((phaseId: string) => {
    togglePhase(phaseId);
  }, [togglePhase]);

  const handleSetImageUploadState = React.useCallback((stateKey: string, value: unknown) => {
    setImageUploadState(stateKey, value);
  }, [setImageUploadState]);
  
  // Additional event handlers
  const handleAddTask = React.useCallback(() => {
    console.log('Add task');
  }, []);
  
  const handleUpdateTasks = React.useCallback(() => {
    console.log('Update tasks');
  }, []);
  
  const handleSaveSettings = React.useCallback(async (settings: unknown) => {
    console.log('Save settings:', settings);
    // TODO: Implement settings save functionality
  }, []);
  
  // Handle loading states
  if (projectLoading || tasksLoading) {
    return <ProjectDetailsLoading />;
  }

  // Handle error states
  if (projectError) {
    throw projectError;
  }

  // Handle missing project
  if (!projectData || !project) {
    return <ProjectNotFound projectId={projectId} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Project Status Hero - Extracted Component */}
        <ProjectStatusHero 
          project={project}
          activeTeamMembers={activeTeamMembers}
          toggleSection={handleToggleSection}
          onUpdateProject={() => navigate(`/projects/${projectId}/edit`)}
        />

        {/* Main Content Sections - Ordered by ProjectHeader menu items */}
        {/* Budget Section */}
        <BudgetOverviewCard
          project={project}
          expandedSections={expandedSections}
          onToggleSection={handleToggleSection}
          onOpenCreateModal={openCreateModal}
        />
        {expandedSections.budget && (
          <div className="space-y-4">
            <BudgetExpensesList
              budgetExpenses={budgetExpenses}
              onEditExpense={(expense) => openEditModal('budget', expense)}
              onDeleteExpense={(expenseId) => handleDelete('budget', expenseId)}
            />
          </div>
        )}

        {/* Timeline & Phases Section */}
        <PhaseTimelineCard
          phases={phases || []}
          expandedPhases={expandedPhases}
          onTogglePhase={handleTogglePhase}
          onEditPhase={(phase) => openEditModal('phase', phase)}
          onDeletePhase={(phaseId) => handleDelete('phase', phaseId)}
          onCreateTask={openCreateTaskModal}
          onEditTask={openEditTaskModal}
          onDeleteTask={handleDeleteTask}
          onOpenCreateModal={openCreateModal}
          isExpanded={expandedSections.phases}
          onToggleSection={() => handleToggleSection('phases')}
        />

        {/* Team Management Section */}
        <TeamMembersList
          teamMembers={activeTeamMembers}
          onEditMember={(member) => openEditModal('team', member)}
          onDeleteMember={(memberId) => handleDelete('team', memberId)}
          onCreateMember={() => openCreateModal('team')}
          isExpanded={expandedSections.team}
          onToggleExpanded={() => handleToggleSection('team')}
        />

        {/* Additional Sections */}
        {/* Project Documents Section */}
        <ProjectDocumentsSection
          project={project}
          expandedSections={expandedSections}
          onToggleSection={handleToggleSection}
          imageUploadStates={imageUploadStates}
          onSetImageUploadState={handleSetImageUploadState}
        />

        {/* Today's Focus - Extracted Component */}
        <TodaysFocusCard 
          currentPhase={currentPhase}
          currentTasks={todaysFocusTasks}
          onAddTask={handleAddTask}
          onUpdateTasks={handleUpdateTasks}
        />

        {/* Project Settings Section */}
        {expandedSections.settings && (
          <ProjectSettingsSection
            project={project}
            onSaveSettings={handleSaveSettings}
          />
        )}

        {/* Project Quick Actions - Extracted Component */}
        <ProjectQuickActions navigate={navigate} />

        
        {/* CRUD Modals */}
        {/* Budget Modal */}
        <BaseModal
          isOpen={showBudgetModal}
          onClose={closeModals}
          title={modalMode === 'create' ? 'Add Budget Expense' : 'Edit Budget Expense'}
          description="Manage project budget expenses with detailed tracking"
          size="md"
        >
          <BudgetExpenseForm
            mode={modalMode}
            initialData={editingItem?.type === 'budget' ? editingItem.data as any : undefined}
            onSubmit={(data) => handleBudgetSubmit(data, modalMode, editingItem)}
            isLoading={createBudgetExpense.isPending || updateBudgetExpense.isPending}
          />
        </BaseModal>
        
        {/* Phase Modal */}
        <BaseModal
          isOpen={showPhaseModal}
          onClose={closeModals}
          title={modalMode === 'create' ? 'Create New Phase' : 'Edit Phase'}
          description="Build your project timeline with precision and style"
          size="lg"
        >
          <PhaseForm
            mode={modalMode}
            initialData={editingItem?.type === 'phase' ? {
              name: editingItem.data.name,
              category: editingItem.data.category,
              description: editingItem.data.description,
              startDate: editingItem.data.timeline?.planned_start || '',
              endDate: editingItem.data.timeline?.planned_end || ''
            } : undefined}
            projectType={projectData?.type}
            projectId={projectId}
            onSubmit={(data, selectedTaskIds) => handlePhaseSubmit(data, modalMode, editingItem, selectedTaskIds)}
            isLoading={createPhase.isPending || updatePhase.isPending}
          />
        </BaseModal>
        
        {/* Team Modal */}
        <BaseModal
          isOpen={showTeamModal}
          onClose={closeModals}
          title={modalMode === 'create' ? 'Add Team Member' : 'Edit Team Member'}
          description="Manage project team members"
          size="md"
        >
          <TeamMemberForm
            mode={modalMode}
            initialData={editingItem?.type === 'team' ? {
              name: (editingItem.data as Record<string, unknown>).name,
              role: (editingItem.data as Record<string, unknown>).role,
              status: (editingItem.data as Record<string, unknown>).status,
              phone: ((editingItem.data as Record<string, unknown>).contactInfo as Record<string, unknown>)?.phone as string || (editingItem.data as Record<string, unknown>).phone as string,
              email: ((editingItem.data as Record<string, unknown>).contactInfo as Record<string, unknown>)?.email as string || (editingItem.data as Record<string, unknown>).email as string
            } : undefined}
            onSubmit={(data: unknown) => handleTeamMemberSubmit(data, modalMode, editingItem)}
            isLoading={createTeamMember.isPending || updateTeamMember.isPending}
          />
        </BaseModal>
        
        {/* Task Modal */}
        <TaskFormModal
          isOpen={taskModal.isOpen}
          onClose={closeTaskModal}
          phaseId={taskModal.phaseId || ''}
          projectId={projectId}
          task={taskModal.task}
          onCreateTask={handleCreateTask}
          onUpdateTask={handleUpdateTask}
          isLoading={isCreatingTask || isUpdatingTask}
          onSuccess={() => {
            // Optional: refresh tasks or show success message
          }}
        />
      </div>
    </div>
  );
}

// Main Export with Error Boundary and Suspense
export function ProjectDetailsContent({ projectId }: ProjectDetailsContentProps) {
  return (
    <ErrorBoundary
      FallbackComponent={ProjectErrorFallback}
      onReset={() => window.location.reload()}
    >
      <Suspense fallback={<ProjectDetailsLoading />}>
        <ProjectDetailsMain projectId={projectId} />
      </Suspense>
    </ErrorBoundary>
  );
}
