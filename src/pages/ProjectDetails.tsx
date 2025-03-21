/**
 * ProjectDetails.tsx - Detailed view of a construction project with phases, tasks and insights
 */
import { format } from 'date-fns'
import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { LazyMotion, domAnimation, m } from 'framer-motion'

// Icons
import { 
  Calendar, 
  CheckSquare,
  ChevronRight,
  DollarSign,
  FileText,
  Home,
  Image,
  MessageSquare,
  Package,
  Plus,
  Settings,
  Users,
  Building,
  ChartPie,
  FileBarChart,
  Calendar as CalendarIcon,
  LayoutDashboard,
  Download,
  MapPin
} from 'lucide-react'

// UI Components
import { Button } from '@/components/ui/button'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'

// Shared Components
import { HorizontalNav } from '@/components/navigation/HorizontalNav'
import {
  PageHeader,
  StatCard
} from '@/components/shared'
import { 
  AddPhaseDialog, 
  AddTaskDialog, 
  ProjectPhasesSection,
  ProjectActivitySection,
  ProjectInsightsSection,
  QuickActionsSection,
  ProjectEditDialog
} from '@/components/project'
import { cn } from '@/lib/utils'

// Import types
import { Phase } from '@/types/phase'
import { Task } from '@/types/task'

// Mock data
import { INITIAL_PHASES, BREADCRUMB_ITEMS, PROJECT_NAV_ITEMS, RECENT_ACTIVITY } from '@/data/projectData'

// Types for new phase and task
interface NewPhase {
  name: string
  startDate: Date
  endDate: Date
  budget: string
  description?: string
}

interface NewTask {
  name: string
  description: string
  dueDate: Date
  phaseId: number
  assignee?: string
  priority?: 'low' | 'medium' | 'high'
}

// Initial values
const INITIAL_NEW_PHASE: NewPhase = {
  name: '',
  startDate: new Date(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  budget: '',
  description: ''
}

const INITIAL_NEW_TASK: NewTask = {
  name: '',
  description: '',
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  phaseId: 0, // Will be set when adding a task to a specific phase
  priority: 'medium',
  assignee: ''
}

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
  const [showPhaseDialog, setShowPhaseDialog] = useState(false)
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [newPhase, setNewPhase] = useState<NewPhase>(INITIAL_NEW_PHASE)
  const [newTask, setNewTask] = useState<NewTask>(INITIAL_NEW_TASK)
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
    setShowPhaseDialog(true)
    setNewPhase(INITIAL_NEW_PHASE)
  }
  
  /**
   * Save a new phase to the project
   */
  function handleSavePhase() {
    const newPhaseObj: Phase = {
      id: phases.length + 1,
      name: newPhase.name,
      progress: 0,
      startDate: format(newPhase.startDate, 'MMM d, yyyy'),
      endDate: format(newPhase.endDate, 'MMM d, yyyy'),
      status: 'upcoming',
      budget: newPhase.budget,
      spent: '$0',
      description: newPhase.description || ''
    }
    
    setPhases([...phases, newPhaseObj])
    setShowPhaseDialog(false)
  }
  
  /**
   * Handle adding a new task to a phase
   */
  function handleAddTask(phaseId: number) {
    setShowTaskDialog(true)
    setNewTask({
      ...INITIAL_NEW_TASK,
      phaseId
    })
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
    setProjectInfo(updatedProject);
    
    // Create a new activity entry for the project update
    const newActivity = {
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (Today)',
      title: 'Project Information Updated',
      description: `Project details were updated by ${updatedProject.name}`,
      type: 'project_update' as const,
      user: {
        name: 'Current User',
        avatar: null
      }
    };
    
    // Add the new activity to the activities list
    setActivities([newActivity, ...activities]);
    
    // In a real app, this would make an API call to update the project
    console.log('Project updated:', updatedProject);
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
            isDarkMode={isDarkMode}
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
      
      {/* Add Phase Dialog */}
      <Dialog open={showPhaseDialog} onOpenChange={setShowPhaseDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Phase</DialogTitle>
            <DialogDescription>
              Create a new phase for this construction project. Fill out the details below.
            </DialogDescription>
          </DialogHeader>
          <AddPhaseDialog
            phase={newPhase}
            setPhase={setNewPhase}
            onSave={handleSavePhase}
            isOpen={showPhaseDialog}
            onClose={() => setShowPhaseDialog(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Add Task Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Create a new task for this phase. Fill out the details below.
            </DialogDescription>
          </DialogHeader>
          <AddTaskDialog
            task={newTask}
            setTask={(task) => setNewTask(task as NewTask)} 
            onSave={() => setShowTaskDialog(false)}
            onClose={() => setShowTaskDialog(false)}
            isOpen={showTaskDialog}
            phases={phases}
          />
        </DialogContent>
      </Dialog>
      
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