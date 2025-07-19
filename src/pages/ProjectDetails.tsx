import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useParams } from "react-router-dom";
import { useRef, useMemo, useCallback, useState } from "react";
import { ProjectStatusHero } from "@/components/project/ProjectStatusHero";
import { CurrentPhaseCard } from "@/components/project/CurrentPhaseCard";
import { AIAssistantCard } from "@/components/project/AIAssistantCard";
import { DetailsAccordion } from "@/components/project/DetailsAccordion";

import { EditProjectModal } from "@/components/project/EditProjectModal";
import { UpdateStatusModal } from "@/components/project/UpdateStatusModal";
import { PlanModalManager, PlanModalManagerHandlers } from "@/components/plan";
import { adaptProjectToPlan } from "@/utils/projectDataAdapter";
import { projectData } from "@/data/projectData";
import { TeamManagementModal } from "@/components/team/TeamManagementModal";
import { ProjectSettingsModal } from "@/components/project/ProjectSettingsModal";
import { ProgressAndExecution } from "@/components/project/ProgressAndExecution";
import { TeamAndResources } from "@/components/project/TeamAndResources";
import { SettingsAndConfiguration } from "@/components/project/SettingsAndConfiguration";
import { toast } from "sonner";
import { Users, Settings, Clock } from "lucide-react";
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
  const [teamManagementModalOpen, setTeamManagementModalOpen] = useState(false);
  const [projectSettingsModalOpen, setProjectSettingsModalOpen] = useState(false);
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

  const workflowSections = [
    {
      id: "progress-execution",
      title: "Progress & Execution",
      icon: <Clock className="h-4 w-4" />,
      priority: "high" as const,
      content: (
        <ProgressAndExecution 
          plan={adaptedProject}
          projectId={project.id}
          modalHandlersRef={modalHandlersRef}
          onUpdateProgress={() => setUpdateStatusModalOpen(true)}
        />
      ),
    },
    {
      id: "team-resources",
      title: "Team & Resources",
      icon: <Users className="h-4 w-4" />,
      priority: "high" as const,
      content: (
        <TeamAndResources
          projectId={project.id}
          projectName={project.name}
          teamMembers={project.teamMembers}
          budget={{ allocated: project.budget, spent: project.budget * 0.65 }}
          onManageTeam={() => setTeamManagementModalOpen(true)}
        />
      ),
    },
    {
      id: "settings-configuration",
      title: "Settings & Configuration",
      icon: <Settings className="h-4 w-4" />,
      priority: "medium" as const,
      content: (
        <SettingsAndConfiguration
          projectId={project.id}
          onOpenFullSettings={() => setProjectSettingsModalOpen(true)}
        />
      ),
    },
  ];



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-buildease-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-buildease-blue-950/30">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Hero Section */}
        <div className="px-3 sm:px-6 lg:px-8 pt-4 pb-6">
          <ProjectStatusHero
            project={project}
            progress={project.progress} 
            healthStatus="healthy"
            variant="compact"
            className="w-full transform hover:scale-[1.01] transition-transform duration-300"
          />
        </div>
        
        {/* Enhanced Main Content Area */}
        <div className="px-3 sm:px-6 lg:px-8 pb-12">
          <div className="space-y-6">
            
            {/* Primary Information Section with improved layout */}
            <section className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
                {/* Current Phase - Takes more space on larger screens */}
                <div className="lg:col-span-8">
                  <CurrentPhaseCard
                    phase={activePhase}
                    tasks={urgentTasks}
                    onQuickAction={handleCurrentPhaseAction}
                    showTimeline={true}
                    className="h-full transform hover:scale-[1.01] transition-all duration-300 hover:shadow-xl"
                  />
                </div>
                
                {/* AI Assistant - Compact on larger screens */}
                <div className="lg:col-span-4">
                  <AIAssistantCard
                    projectId={project.id}
                    insights={aiInsights}
                    onAcceptRecommendation={() => {}}
                    compact={true}
                    className="h-full transform hover:scale-[1.01] transition-all duration-300 hover:shadow-xl"
                  />
                </div>
              </div>
            </section>
            

            
            {/* Enhanced Workflow Sections */}
            <section className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-buildease-blue-500 to-buildease-orange-500 rounded-full"></div>
                  Project Details
                </h2>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Last updated: {new Date().toLocaleDateString()}
                </div>
              </div>
              
              <DetailsAccordion 
                sections={workflowSections}
                variant="default"
                allowMultiple={false}
                defaultExpanded="progress-execution"
                className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 dark:border-slate-700/60 overflow-hidden"
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
      
      <TeamManagementModal
        isOpen={teamManagementModalOpen}
        onClose={() => setTeamManagementModalOpen(false)}
        projectId={project.id}
      />
      
      <ProjectSettingsModal
        isOpen={projectSettingsModalOpen}
        onClose={() => setProjectSettingsModalOpen(false)}
        projectId={project.id}
        onSettingsUpdate={() => {
          // Refresh project data after settings update
          console.log('Settings updated for project:', project.id);
        }}
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
