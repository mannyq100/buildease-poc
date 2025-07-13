import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useParams } from "react-router-dom";
import { useRef, useMemo, useCallback, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProjectStatusHero } from "@/components/project/ProjectStatusHero";
import { CurrentPhaseCard } from "@/components/project/CurrentPhaseCard";
import { AIAssistantCard } from "@/components/project/AIAssistantCard";
import { DetailsAccordion } from "@/components/project/DetailsAccordion";
import { QuickActionBar } from "@/components/project/QuickActionBar";
import { EditProjectModal } from "@/components/project/EditProjectModal";
import { UpdateStatusModal } from "@/components/project/UpdateStatusModal";
import { PlanModalManager, PlanModalManagerHandlers, TimelineView } from "@/components/plan";
import { adaptProjectToPlan } from "@/utils/projectDataAdapter";
import { projectData } from "@/data/projectData";
import { TeamMembersSection } from "@/components/project/TeamMembersSection";
import { toast } from "sonner";
import { PlusCircle, Edit, Calendar, Users, DollarSign, Settings, FileText, Clock, TrendingUp } from "lucide-react";
import type { Project, ProjectStatus } from "@/types/project";

export function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  if (!id) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Project ID is missing.</p>
      </div>
    );
  }
  return (
    <DndProvider backend={HTML5Backend}>
      <ProjectDetails projectId={id} />
    </DndProvider>
  );
}

function ProjectDetails({ projectId }: { projectId: string }) {
  // Modal handlers ref for accessing modal functionality
  const modalHandlersRef = useRef<PlanModalManagerHandlers>({} as PlanModalManagerHandlers);
  
  // Modal state management
  const [editProjectModalOpen, setEditProjectModalOpen] = useState(false);
  const [updateStatusModalOpen, setUpdateStatusModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Mock data for now
  const [project, setProject] = useState(() => projectData.find((p) => p.id === projectId));
  
  // Convert project data to plan format for modal compatibility
  const adaptedProject = useMemo(() => {
    return project ? adaptProjectToPlan(project) : null;
  }, [project]);
  
  // Save handler functions
  const handleSavePhase = useCallback((phaseData: any) => {
    console.log('Saving phase:', phaseData);
    // TODO: Implement actual save logic
    toast.success('Phase saved successfully');
  }, []);

  const handleSaveTask = useCallback((taskData: any) => {
    console.log('Saving task:', taskData);
    // TODO: Implement actual save logic  
    toast.success('Task saved successfully');
  }, []);

  const handleSaveMaterial = useCallback((materialData: any) => {
    console.log('Saving material:', materialData);
    // TODO: Implement actual save logic
    toast.success('Material saved successfully');
  }, []);

  const handleSaveDates = useCallback((dateRange: any) => {
    console.log('Saving dates:', dateRange);
    // TODO: Implement actual save logic
    toast.success('Dates updated successfully');
  }, []);

  const handleDistribute = useCallback(() => {
    console.log('Distributing plan');
    // TODO: Implement actual distribute logic
    toast.success('Plan distributed successfully');
  }, []);

  // Project-specific save handlers
  const handleSaveProject = useCallback(async (projectData: Partial<Project>) => {
    setIsSaving(true);
    try {
      console.log('Saving project:', projectData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state (in real app, this would come from API response)
      if (project) {
        setProject({ ...project, ...projectData });
      }
      
      toast.success('Project updated successfully');
      setEditProjectModalOpen(false);
    } catch (error) {
      toast.error('Failed to update project');
    } finally {
      setIsSaving(false);
    }
  }, [project]);

  const handleUpdateStatus = useCallback(async (statusData: { status: ProjectStatus; progress: number; notes?: string }) => {
    setIsSaving(true);
    try {
      console.log('Updating status:', statusData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state (in real app, this would come from API response)
      if (project) {
        setProject({ ...project, status: statusData.status, progress: statusData.progress });
      }
      
      toast.success('Project status updated successfully');
      setUpdateStatusModalOpen(false);
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setIsSaving(false);
    }
  }, [project]);

  // Current phase card action handlers
  const handleCurrentPhaseAction = useCallback((action: string) => {
    const activePhase = project?.phases?.[0];
    if (!activePhase) return;

    switch (action) {
      case 'add_task':
        modalHandlersRef.current?.openTaskModal(activePhase.id, '', true);
        break;
      case 'update_status':
        setUpdateStatusModalOpen(true);
        break;
      default:
        console.log('Unknown action:', action);
    }
  }, [project]);

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Project not found.</p>
      </div>
    );
  }

  const activePhase = project.phases[0];
  const urgentTasks = activePhase.tasks.slice(0, 3);
  const aiInsights = [
    {
      id: "1",
      type: "optimization",
      title: "Material Optimization",
      recommendation: "Consider ordering drywall ahead of schedule to avoid delays.",
    },
    {
      id: "2", 
      type: "budget",
      title: "Budget Alert",
      recommendation: "Electrical phase is trending 15% over budget. Review contractor estimates.",
    },
  ];

  const accordionSections = [
    {
      id: "all-phases",
      title: "All Phases & Timeline",
      badge: project.phases.length,
      icon: <Clock className="h-4 w-4" />,
      priority: "high" as const,
      content: adaptedProject ? (
        <TimelineView
          plan={adaptedProject}
          onEditPhase={(phaseId) => modalHandlersRef.current?.openPhaseModal(phaseId)}
          onAddTask={(phaseId) => modalHandlersRef.current?.openTaskModal(phaseId, '', true)}
          onEditTask={(phaseId, taskId) => modalHandlersRef.current?.openTaskModal(phaseId, taskId)}
          onEditDates={(type, phaseId) => modalHandlersRef.current?.openDateModal(type, phaseId)}
          onReorderPhase={(activeId, overId) => console.log('Reorder:', activeId, overId)}
        />
      ) : (
        <div className="text-sm text-gray-600">Loading timeline...</div>
      ),
    },
    {
      id: "team-documents",
      title: "Team & Documents",
      badge: project.teamMembers.length,
      icon: <Users className="h-4 w-4" />,
      priority: "medium" as const,
      content: <TeamMembersSection members={project.teamMembers} />,
    },
    {
      id: "budget-breakdown", 
      title: "Budget & Financial Tracking",
      badge: `$${project.budget?.allocated?.toLocaleString() ?? 'N/A'}`,
      badgeVariant: "outline" as const,
      icon: <DollarSign className="h-4 w-4" />,
      priority: "high" as const,
      content: <div className="text-sm text-gray-600">Detailed cost breakdown, expense tracking, and budget variance analysis.</div>,
    },
    {
      id: "documents",
      title: "Project Documents & Files",
      badge: "12",
      icon: <FileText className="h-4 w-4" />,
      priority: "medium" as const,
      content: <div className="text-sm text-gray-600">Contracts, permits, plans, photos, and other project documentation.</div>,
    },
    {
      id: "project-settings",
      title: "Project Settings & Preferences",
      icon: <Settings className="h-4 w-4" />,
      priority: "low" as const,
      content: <div className="text-sm text-gray-600">Project configuration, notification settings, and access permissions.</div>,
    },
  ];

  const quickActions = [
    {
      id: "add-phase",
      label: "Add Phase",
      icon: <PlusCircle className="h-4 w-4" />,
      priority: "high" as const,
      onClick: () => modalHandlersRef.current?.openPhaseModal('', true)
    },
    {
      id: "edit-project",
      label: "Edit Project",
      icon: <Edit className="h-4 w-4" />,
      priority: "medium" as const,
      variant: "outline" as const,
      onClick: () => setEditProjectModalOpen(true)
    },
    {
      id: "update-status",
      label: "Update Status",
      icon: <TrendingUp className="h-4 w-4" />,
      priority: "medium" as const,
      variant: "outline" as const,
      onClick: () => setUpdateStatusModalOpen(true)
    },
    {
      id: "schedule-meeting",
      label: "Schedule Meeting",
      icon: <Calendar className="h-4 w-4" />,
      priority: "low" as const,
      variant: "ghost" as const,
      onClick: () => console.log('Schedule meeting') // TODO: implement
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-buildease-blue-50/30 via-white to-buildease-orange-50/20 dark:from-buildease-blue-950/20 dark:via-gray-900 dark:to-buildease-orange-950/10">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section - Full width at top */}
        <div className="px-4 sm:px-6 lg:px-8 pb-8">
          <ProjectStatusHero
            project={project}
            progress={project.progress} 
            healthStatus="healthy"
            variant="compact"
            className="w-full transform hover:scale-[1.01] transition-transform duration-300"
          />
        </div>
        
        {/* Main Content Area */}
        <div className="px-4 sm:px-6 lg:px-8 pb-12">
          <div className="space-y-8">
            
            {/* Primary Information Section */}
            <section className="animate-in fade-in duration-500">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                  <CurrentPhaseCard
                    phase={activePhase}
                    tasks={urgentTasks}
                    onQuickAction={handleCurrentPhaseAction}
                    showTimeline={true}
                    className="h-full transform hover:scale-[1.005] transition-all duration-300"
                  />
                </div>
                
                <div className="xl:col-span-1">
                  <AIAssistantCard
                    projectId={project.id}
                    insights={aiInsights}
                    onAcceptRecommendation={() => {}}
                    compact={true}
                    className="h-full transform hover:scale-[1.005] transition-all duration-300"
                  />
                </div>
              </div>
            </section>
            
            {/* Quick Actions Section */}
            <section className="animate-in slide-in-from-bottom-4 duration-700">
              <QuickActionBar 
                actions={quickActions} 
                layout="horizontal"
                className="justify-center transform hover:scale-[1.02] transition-all duration-300"
              />
            </section>
            
            {/* Detailed Information Section */}
            <section className="animate-in slide-in-from-bottom-6 duration-1000">
              <DetailsAccordion 
                sections={accordionSections}
                variant="minimal"
                allowMultiple={false}
                defaultExpanded="all-phases"
                className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200/50 dark:border-slate-800/50"
              />
            </section>
            
          </div>
        </div>
      </div>
      
      {/* Project-specific Modals */}
      <EditProjectModal
        isOpen={editProjectModalOpen}
        onClose={() => setEditProjectModalOpen(false)}
        onSave={handleSaveProject}
        project={project}
        isSaving={isSaving}
      />
      
      <UpdateStatusModal
        isOpen={updateStatusModalOpen}
        onClose={() => setUpdateStatusModalOpen(false)}
        onSave={handleUpdateStatus}
        project={project}
        isSaving={isSaving}
      />
      
      {/* Plan Modal Manager */}
      {adaptedProject && (
        <PlanModalManager
          plan={adaptedProject}
          isSaving={false}
          onSavePhase={handleSavePhase}
          onSaveTask={handleSaveTask}
          onSaveMaterial={handleSaveMaterial}
          onSaveDates={handleSaveDates}
          onDistribute={handleDistribute}
          modalHandlersRef={modalHandlersRef}
        />
      )}
    </div>
  );
}
