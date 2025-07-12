import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useParams } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProjectStatusHero } from "@/components/project/ProjectStatusHero";
import { CurrentPhaseCard } from "@/components/project/CurrentPhaseCard";
import { AIAssistantCard } from "@/components/project/AIAssistantCard";
import { DetailsAccordion } from "@/components/project/DetailsAccordion";
import { QuickActionBar } from "@/components/project/QuickActionBar";
import { projectData } from "@/data/projectData";
import { TeamMembersSection } from "@/components/project/TeamMembersSection";
import { PlusCircle, Edit, Calendar, Users, DollarSign, Settings, FileText, Clock } from "lucide-react";

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
  // Mock data for now
  const project = projectData.find((p) => p.id === projectId);

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
      content: <div className="text-sm text-gray-600">Complete project timeline with all phases, milestones, and dependencies.</div>,
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
    },
    {
      id: "edit-project",
      label: "Edit Project",
      icon: <Edit className="h-4 w-4" />,
      priority: "medium" as const,
      variant: "outline" as const,
    },
    {
      id: "schedule-meeting",
      label: "Schedule Meeting",
      icon: <Calendar className="h-4 w-4" />,
      priority: "low" as const,
      variant: "ghost" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-buildease-blue-50/20 via-white to-white dark:from-buildease-blue-950/20 dark:via-gray-950 dark:to-gray-950">
      {/* Hero Section - Full width at top */}
      <ProjectStatusHero
        project={project}
        progress={50} // Mock progress
        healthStatus="healthy"
        variant="compact"
        className="mx-4 sm:mx-6 lg:mx-8 mt-4 mb-4 sm:mb-6 shadow-xl hover:shadow-2xl transition-all duration-300"
      />
      
      <PageContainer maxWidth="7xl" padding="md" className="pt-0">
        {/* Mobile-first single column layout */}
        <div className="space-y-4 sm:space-y-6">
        
        {/* Primary Information - Current focus */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="group transform hover:scale-[1.02] transition-all duration-300">
            <CurrentPhaseCard
              phase={activePhase}
              tasks={urgentTasks}
              onQuickAction={() => {}}
              showTimeline={true}
              className="shadow-lg hover:shadow-xl transition-all duration-300"
            />
          </div>
          
          <div className="group transform hover:scale-[1.02] transition-all duration-300">
            <AIAssistantCard
              projectId={project.id}
              insights={aiInsights}
              onAcceptRecommendation={() => {}}
              compact={false}
              className="shadow-lg hover:shadow-xl transition-all duration-300"
            />
          </div>
        </div>
        
        {/* Quick Actions - Contextual actions */}
        <div className="group transform hover:scale-[1.01] transition-all duration-300">
          <QuickActionBar 
            actions={quickActions} 
            layout="horizontal"
            className="sm:justify-center -mt-2 transition-all duration-300"
          />
        </div>
        
        {/* Secondary Information - Progressive disclosure */}
        <div className="group transform hover:scale-[1.005] transition-all duration-300">
          <DetailsAccordion 
            sections={accordionSections}
            variant="default"
            allowMultiple={false}
            defaultExpanded="all-phases"
            className="shadow-lg hover:shadow-xl transition-all duration-300"
          />
        </div>
        </div>
      </PageContainer>
    </div>
  );
}
