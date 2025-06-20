/**
 * ProjectDetails.tsx - Detailed view of a construction project with phases, tasks and insights
 */
import { format } from 'date-fns'
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { cn } from '@/utils/core/ui';

// Icons
import { 
  Calendar,
  DollarSign,
  Package,
  Settings,
  Users,
  ChartPie,
  FileBarChart,
  Calendar as CalendarIcon,
  Download,
  MapPin
} from 'lucide-react'

// UI Components
import { Button } from '@/components/ui/button'


import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'


import { Badge } from '@/components/ui/badge'

// Shared Components
import {
  PageHeader,
  StatCard
} from '@/components/shared'
import { 
  PhaseFormModal,
  TaskFormModal
} from '@/components/shared/modals'
import { 
  ProjectPhasesSection,
  ProjectActivitySection,
  ProjectInsightsSection,
  ProjectInspirationSection,
  QuickActionsSection,
  ProjectEditDialog
} from '@/components/project'

// Import types
import { Phase } from '@/types/phase'
import { Task } from '@/types/task'
import { Phase as ModalPhase, Task as ModalTask } from '@/components/shared/modals'

// Mock data
import { INITIAL_PHASES, RECENT_ACTIVITY } from '@/data/projectData'

/**
 * Main component for project details page
 */
export function ProjectDetails() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  
  // State management
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [phases, setPhases] = useState<Phase[]>(INITIAL_PHASES)
  const [tasks, setTasks] = useState<Task[]>([])
  const [showPhaseModal, setShowPhaseModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [currentPhase, setCurrentPhase] = useState<ModalPhase | null>(null)
  const [currentTask, setCurrentTask] = useState<ModalTask | null>(null)
  const [isNewItem, setIsNewItem] = useState(true)
  const [currentPhaseId, setCurrentPhaseId] = useState<number>(0)
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null)
  const [projectInfo, setProjectInfo] = useState({
    id: id || '1',
    name: 'Villa Construction',
    description: 'Residential property construction project with modern design and eco-friendly features.',
    status: 'in-progress' as const,
    startDate: '2025-01-15',
    endDate: '2025-12-31',
    budget: '1,500,000',
    teamSize: '24',
    location: 'Los Angeles, CA'
  });
  const [activities, setActivities] = useState(RECENT_ACTIVITY);
  const [editProjectDialogOpen, setEditProjectDialogOpen] = useState(false);

  // Check dark mode on component mount and whenever it might change
  useEffect(() => {
    function checkDarkMode() {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }
    
    // Check on mount
    checkDarkMode()
    
    // Set up a mutation observer to watch for dark mode changes
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    
    // Clean up observer on unmount
    return () => observer.disconnect()
  }, [])
  
  useEffect(() => {
    // Reset expanded phase when project changes
    setExpandedPhase(null);
  }, [id]);

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  /**
   * Format status for display
   */
  const formatStatus = (status: string) => {
    const statusMap = {
      'planning': 'Planning',
      'in-progress': 'In Progress',
      'on-hold': 'On Hold',
      'completed': 'Completed'
    };
    return statusMap[status] || status;
  };

  /**
   * Handle exporting project data
   */
  const handleExportProject = () => {
    console.log('Exporting project data...');
    // In a real app, this would generate and download a project report
    alert('Project export functionality would be implemented here');
  };

  /**
   * Handle adding a new phase to the project
   */
  function handleAddPhase() {
    setCurrentPhase({
      id: '',
      name: '',
      description: '',
      status: 'planning',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      order: (phases.length + 1).toString(),
      tasks: []
    })
    setIsNewItem(true)
    setShowPhaseModal(true)
  }
  
  /**
   * Save a new phase to the project
   */
  function handleSavePhase(phaseData: Partial<ModalPhase>) {
    if (isNewItem) {
      const newPhaseObj: Phase = {
        id: phases.length + 1,
        name: phaseData.name || '',
        progress: 0,
        startDate: phaseData.startDate ? format(new Date(phaseData.startDate), 'MMM d, yyyy') : '',
        endDate: phaseData.endDate ? format(new Date(phaseData.endDate), 'MMM d, yyyy') : '',
        status: phaseData.status === 'planning' ? 'upcoming' : 'upcoming',
        budget: '$50,000', // Default budget
        spent: '$0',
        description: phaseData.description || ''
      }
      
      setPhases([...phases, newPhaseObj])
    }
    setShowPhaseModal(false)
    setCurrentPhase(null)
  }
  
  /**
   * Handle adding a new task to a phase
   */
  function handleAddTask(phaseId: number) {
    setCurrentTask({
      id: '',
      name: '',
      description: '',
      status: 'pending',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      assignedTo: [],
      phaseId: phaseId.toString(),
      progress: 0,
      dependencies: []
    })
    setCurrentPhaseId(phaseId)
    setIsNewItem(true)
    setShowTaskModal(true)
  }
  
  /**
   * Save a new task to a phase
   */
  function handleSaveTask(taskData: Partial<ModalTask>) {
    // In a real implementation, this would update the tasks for the specific phase
    // For now, just close the modal
    setShowTaskModal(false)
    setCurrentTask(null)
  }
  
  /**
   * Toggle expansion of a phase card
   */
  function togglePhaseExpand(phaseId: number) {
    setExpandedPhase(expandedPhase === phaseId ? null : phaseId)
  }
  
  /**
   * Navigate to a specific phase
   */
  function handlePhaseClick(phaseId: number) {
    navigate(`/projects/${id}/phases/${phaseId}`)
  }
  
  /**
   * View all activities
   */
  function handleViewAllActivities() {
    console.log('View all activities');
    // In a real app, this would navigate to an activities page
    alert('This would navigate to a full activity log page');
  }
  
  /**
   * Handle quick action click
   */
  function handleQuickActionClick(action: string) {
    // This would typically handle the specific action
    console.log(`Quick action clicked: ${action}`)
  }

  /**
   * Handle updating project information
   */
  const handleProjectUpdate = (updatedProject) => {
    setProjectInfo({
      ...projectInfo,
      ...updatedProject
    });
    
    // Add activity log entry for the update
    const newActivity = {
      id: `activity-${Date.now()}`,
      date: new Date().toISOString(),
      title: 'Project Details Updated',
      description: `Project details were updated by ${localStorage.getItem('userName') || 'a team member'}.`,
      type: 'project_update',
      icon: <FileBarChart className="h-4 w-4" />,
      user: {
        name: localStorage.getItem('userName') || 'Team Member',
        avatar: null
      }
    };
    
    setActivities([newActivity, ...activities]);
    setEditProjectDialogOpen(false);
  };

  // Calculate total progress across all phases
  const totalProgress = Math.round(
    phases.reduce((sum, phase) => sum + phase.progress, 0) / phases.length
  )
  
  // Calculate total budget across all phases
  const totalBudget = phases.reduce((sum, phase) => {
    const budget = parseFloat(phase.budget.replace(/[$,]/g, ''))
    return sum + budget
  }, 0)
  
  // Calculate total spent across all phases
  const totalSpent = phases.reduce((sum, phase) => {
    const spent = parseFloat(phase.spent.replace(/[$,]/g, ''))
    return sum + spent
  }, 0)
  
  // Project insights data
  const projectInsights = [
    {
      title: "Budget Forecast",
      description: "Project is currently 5% under budget. Most savings from efficient material sourcing.",
      type: "success" as const,
      icon: <DollarSign className="h-5 w-5" />
    },
    {
      title: "Schedule Analysis",
      description: "Current pace suggests completion 2 weeks ahead of schedule if weather permits.",
      type: "default" as const,
      icon: <CalendarIcon className="h-5 w-5" />
    },
    {
      title: "Risk Detection",
      description: "Material delivery delays possible in May due to supplier capacity constraints.",
      type: "warning" as const,
      icon: <FileBarChart className="h-5 w-5" />
    }
  ];

  return (
    <div className="container mx-auto py-6 max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Header and navigation */}
      <PageHeader
        title={projectInfo.name}
        description={projectInfo.description}
        icon={<Package className="h-8 w-8 text-white" />}
        actions={
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
              onClick={handleExportProject}
            >
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
            <Button 
              variant="default"
              size="sm"
              className="bg-white hover:bg-gray-50 text-blue-700 border border-white/20 shadow-sm"
              onClick={() => setEditProjectDialogOpen(true)}
            >
              <Settings className="h-4 w-4 mr-2" /> Update Project
            </Button>
          </div>
        }
      />
      
      {/* Project metadata badges */}
      <div className="flex flex-wrap items-center gap-3 mt-2 mb-6">
        <Badge className={cn(
          "capitalize", 
          projectInfo.status === 'in-progress' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
          projectInfo.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
          projectInfo.status === 'planning' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
        )}>
          {formatStatus(projectInfo.status)}
        </Badge>
        <div className="text-sm text-gray-600 dark:text-gray-300 flex flex-wrap gap-3">
          <span className="flex items-center"><Calendar className="h-4 w-4 mr-2 text-blue-500" /> {formatDate(projectInfo.startDate)} - {formatDate(projectInfo.endDate)}</span>
          <span className="flex items-center"><DollarSign className="h-4 w-4 mr-2 text-blue-500" /> ${projectInfo.budget}</span>
          <span className="flex items-center"><Users className="h-4 w-4 mr-2 text-blue-500" /> {projectInfo.teamSize} team members</span>
          <span className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-blue-500" /> {projectInfo.location}</span>
        </div>
      </div>
      
      {/* Project Overview Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Column 1 and 2 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              title="Overall Progress" 
              value={`${totalProgress}%`}
              trend={{
                value: totalProgress > 50 ? 5 : 0,
                isPositive: totalProgress > 50
              }}
              icon={<ChartPie className="h-5 w-5 text-blue-500" />}
              description={totalProgress > 0 ? `${phases.filter(p => p.progress === 100).length} phases completed` : 'Not started'}
            />
            <StatCard 
              title="Budget" 
              value={`$${totalBudget.toLocaleString()}`}
              trend={{
                value: 0,
                isPositive: true
              }}
              icon={<DollarSign className="h-5 w-5 text-green-500" />}
              description={`$${totalSpent.toLocaleString()} spent so far`}
            />
            <StatCard 
              title="Timeframe" 
              value="180 days"
              trend={{
                value: totalProgress > 50 ? 2 : 1,
                isPositive: totalProgress <= 50
              }}
              icon={<Calendar className="h-5 w-5 text-purple-500" />}
              description="Jan 10 - Jul 10, 2024"
            />
          </div>
          
          {/* Project Phases */}
          <ProjectPhasesSection
            phases={phases}
            expandedPhase={expandedPhase}
            onToggleExpand={togglePhaseExpand}
            onPhaseClick={handlePhaseClick}
            onAddTask={(phaseId, e) => {
              e.stopPropagation()
              handleAddTask(phaseId)
            }}
            onAddPhase={handleAddPhase}
          />
        </div>
        
        {/* Sidebar - Column 3 */}
        <div className="space-y-6">
          {/* Project Inspiration Images */}
          <ProjectInspirationSection 
            projectId={projectInfo.id}
          />
          
          {/* Quick Actions */}
          <QuickActionsSection 
            actions={[
              {
                label: "Generate Progress Report",
                icon: <ChartPie className="h-4 w-4 mr-2" />,
                onClick: () => handleQuickActionClick("Generate Progress Report")
              },
              {
                label: "Schedule Team Meeting",
                icon: <Users className="h-4 w-4 mr-2" />,
                onClick: () => handleQuickActionClick("Schedule Team Meeting")
              },
              {
                label: "Review Material Orders",
                icon: <Package className="h-4 w-4 mr-2" />,
                onClick: () => handleQuickActionClick("Review Material Orders")
              }
            ]}
          />
          
          {/* Project Insights */}
          <ProjectInsightsSection 
            insights={projectInsights} 
          />
          
          {/* Recent Activity Section - Moved to sidebar */}
          <ProjectActivitySection
            activities={activities}
            onViewAll={handleViewAllActivities}
            className="hidden lg:block" // Hide on mobile, will show at bottom
          />
        </div>
      </div>
      
      {/* Recent Activity Section - For mobile view at bottom */}
      <div className="mt-6 lg:hidden">
        <ProjectActivitySection
          activities={activities}
          onViewAll={handleViewAllActivities}
        />
      </div>
      
      {/* Phase Modal */}
      {currentPhase && (
        <PhaseFormModal
          show={showPhaseModal}
          onClose={() => {
            setShowPhaseModal(false)
            setCurrentPhase(null)
          }}
          onSave={handleSavePhase}
          phase={currentPhase}
          isNew={isNewItem}
          currentOrder={phases.length}
          statuses={['planning', 'in-progress', 'on-hold', 'completed']}
        />
      )}
      
      {/* Task Modal */}
      {currentTask && (
        <TaskFormModal
          show={showTaskModal}
          onClose={() => {
            setShowTaskModal(false)
            setCurrentTask(null)
          }}
          onSave={handleSaveTask}
          task={currentTask}
          isNew={isNewItem}
          teamMembers={['John Smith', 'Jane Doe', 'Mike Johnson']} // Mock team members
          phaseId={currentPhaseId.toString()}
        />
      )}
      
      {/* Project Edit Dialog */}
      <ProjectEditDialog 
        open={editProjectDialogOpen}
        onOpenChange={setEditProjectDialogOpen}
        projectData={projectInfo}
        onProjectUpdate={handleProjectUpdate}
      />
    </div>
  )
}