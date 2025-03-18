/**
 * ProjectDetails.tsx - Detailed view of a construction project with phases, tasks and insights
 */
import { format } from 'date-fns'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
  ArrowRight,
  Clock,
  Activity,
  ChartPie,
  FileBarChart,
  Calendar as CalendarIcon,
  LayoutDashboard
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
  ActivityItem,
  InsightItem,
  PageHeader,
  PhaseCard,
  StatCard,
  DocumentItem
} from '@/components/shared'
import { 
  AddPhaseDialog, 
  AddTaskDialog, 
  ProjectStatGrid, 
  ProjectPhasesSection, 
  ProjectActivitySection,
  ProjectInsightsSection,
  QuickActionsSection,
  RecentDocumentsSection
} from '@/components/project'
import { cn } from '@/lib/utils'
import { ContentSection } from '@/components/shared/ContentSection'

/**
 * Main component for project details page
 */
export function ProjectDetails() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  
  // State management
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [phases, setPhases] = useState<Phase[]>(INITIAL_PHASES)
  const [tasks, setTasks] = useState<Task[]>([])
  const [showPhaseDialog, setShowPhaseDialog] = useState(false)
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [newPhase, setNewPhase] = useState<NewPhase>(INITIAL_NEW_PHASE)
  const [newTask, setNewTask] = useState<NewTask>(INITIAL_NEW_TASK)
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null)
  
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
      spent: '$0'
    }
    
    setPhases([...phases, newPhaseObj])
    setShowPhaseDialog(false)
  }
  
  /**
   * Handle adding a new task
   */
  function handleAddTask() {
    setShowTaskDialog(true)
    setNewTask(INITIAL_NEW_TASK)
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
    navigate(`/phases/${phaseId}`)
  }
  
  /**
   * View all activities
   */
  function handleViewAllActivities() {
    // This would typically navigate to a page showing all activities
    console.log('View all activities')
  }
  
  /**
   * View all documents
   */
  function handleViewAllDocuments() {
    // This would typically navigate to a page showing all documents
    console.log('View all documents')
  }
  
  /**
   * Handle quick action click
   */
  function handleQuickActionClick(action: string) {
    // This would typically handle the specific action
    console.log(`Quick action clicked: ${action}`)
  }
  
  /**
   * Calculate total progress across all phases
   */
  const totalProgress = Math.round(
    phases.reduce((sum, phase) => sum + phase.progress, 0) / phases.length
  )
  
  /**
   * Calculate total budget across all phases
   */
  const totalBudget = phases.reduce((acc, phase) => {
    const budget = parseInt(phase.budget.replace(/\D/g, ''))
    return acc + (isNaN(budget) ? 0 : budget)
  }, 0)
  
  /**
   * Calculate total spent across all phases
   */
  const totalSpent = phases.reduce((acc, phase) => {
    const spent = parseInt(phase.spent.replace(/\D/g, ''))
    return acc + (isNaN(spent) ? 0 : spent);
  }, 0);

  // Animation variants for metric cards
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  // Animation variants for content sections
  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

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

  // Quick actions data
  const quickActions = [
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
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900/95">
      <PageHeader
        title={`Residential Renovation #${id}`}
        description="Modern home renovation project with eco-friendly materials"
        icon={<Building className="h-8 w-8 text-blue-600 dark:text-blue-400" />}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="bg-white/20 backdrop-blur-sm border-white/10 hover:bg-white/30 text-white"
              onClick={() => navigate(`/project/${id}/settings`)}
            >
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Button>
            <Button
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/10"
              onClick={() => navigate(`/project/${id}/documents`)}
            >
              <FileText className="mr-2 h-4 w-4" /> Documents
            </Button>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Project Stats */}
        <ProjectStatGrid 
          timelineValue="7 months"
          timelineSubtitle={`${phases[0]?.startDate || 'Jan 2023'} - ${phases[phases.length-1]?.endDate || 'Jul 2023'}`}
          budgetValue={`$${totalBudget.toLocaleString()}`}
          budgetSubtitle={`$${totalSpent.toLocaleString()} spent (${Math.round((totalSpent/totalBudget) * 100)}%)`}
          teamSizeValue="12"
          teamSizeSubtitle="active members"
          progressValue={`${totalProgress}%`}
          progressSubtitle="overall completion"
          className="mb-8"
        />

        {/* Project Navigation */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden sticky top-16 z-30 mb-8 border border-gray-100 dark:border-slate-700">
          <div className="border-b border-gray-200 dark:border-slate-700">
            <HorizontalNav
              items={PROJECT_NAV_ITEMS(id)}
              variant="underlined"
              showIcons={true}
              className="py-2 px-2"
              itemClassName="font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              animated={true}
              showTooltips={true}
            />
          </div>
        </div>

        {/* Tab Content */}
        <LazyMotion features={domAnimation}>
          <m.div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Main Content Area */}
            <m.div 
              className="lg:col-span-2 space-y-8"
              variants={sectionVariants}
            >
              {/* Project Phases */}
              <ProjectPhasesSection
                phases={phases}
                expandedPhase={expandedPhase}
                onToggleExpand={togglePhaseExpand}
                onPhaseClick={handlePhaseClick}
                onAddTask={handleAddTask}
                onAddPhase={handleAddPhase}
              />

              {/* Recent Activity */}
              <ProjectActivitySection
                activities={RECENT_ACTIVITY}
                onViewAll={handleViewAllActivities}
                limit={4}
              />
            </m.div>
            
            <m.div 
              className="space-y-8"
              variants={sectionVariants}
            >
              {/* Project Insights */}
              <ProjectInsightsSection
                insights={projectInsights}
                isDarkMode={isDarkMode}
              />
        
              {/* Quick Actions */}
              <QuickActionsSection
                actions={quickActions}
              />
              
              {/* Recent Documents */}
              <RecentDocumentsSection
                documents={RECENT_DOCUMENTS}
                onViewAll={handleViewAllDocuments}
              />
            </m.div>
          </m.div>
        </LazyMotion>
      </div>
      
      {/* Add Phase Dialog */}
      <AddPhaseDialog
        isOpen={showPhaseDialog}
        onClose={() => setShowPhaseDialog(false)}
        onAddPhase={handleSavePhase}
        projectId={id}
        phase={newPhase}
        setPhase={setNewPhase}
      />

      {/* Add Task Dialog */}
      <AddTaskDialog
        isOpen={showTaskDialog}
        onClose={() => setShowTaskDialog(false)}
        projectId={id}
        phases={phases}
      />
    </div>
  )
}

// Navigation items for the project
const PROJECT_NAV_ITEMS = (id?: string) => [
  {
    label: 'Overview',
    value: 'overview',
    icon: <LayoutDashboard className="h-4 w-4" />,
    tooltip: 'Project overview',
    href: `/project/${id}`
  },
  {
    label: 'Tasks',
    value: 'tasks',
    icon: <CheckSquare className="h-4 w-4" />,
    tooltip: 'Project tasks',
    href: `/project/${id}/tasks`
  },
  {
    label: 'Calendar',
    value: 'calendar',
    icon: <Calendar className="h-4 w-4" />,
    tooltip: 'Project calendar',
    href: `/project/${id}/calendar`
  },
  {
    label: 'Team',
    value: 'team',
    icon: <Users className="h-4 w-4" />,
    tooltip: 'Project team',
    href: `/project/${id}/team`
  },
  {
    label: 'Materials',
    value: 'materials',
    icon: <Package className="h-4 w-4" />,
    tooltip: 'Project materials',
    href: `/project/${id}/materials`
  },
  {
    label: 'Documents',
    value: 'documents',
    icon: <FileText className="h-4 w-4" />,
    tooltip: 'Project documents',
    href: `/project/${id}/documents`
  },
  {
    label: 'Photos',
    value: 'photos',
    icon: <Image className="h-4 w-4" />,
    tooltip: 'Project photos',
    href: `/project/${id}/photos`
  },
  {
    label: 'Discussions',
    value: 'discussions',
    icon: <MessageSquare className="h-4 w-4" />,
    tooltip: 'Project discussions',
    href: `/project/${id}/discussions`
  }
]

// Breadcrumb items for the project
const BREADCRUMB_ITEMS = (id?: string) => [
  {
    label: 'Home',
    icon: <Home className="h-4 w-4" />,
    href: '/'
  },
  {
    label: 'Projects',
    href: '/projects'
  },
  {
    label: `Project ${id}`,
    href: `/project/${id}`,
    active: true
  }
]

// Mock data for recent activity
const RECENT_ACTIVITY = [
  {
    date: 'Today, 10:30 AM',
    title: 'Material Order Placed',
    description: 'Order #123456 for kitchen cabinets was placed with supplier',
    icon: <Package className="h-5 w-5 text-blue-500" />,
    user: {
      name: 'John Smith',
      avatar: ''
    }
  },
  {
    date: 'Yesterday, 3:45 PM',
    title: 'Phase Completed',
    description: 'Demolition phase marked as completed',
    icon: <CheckSquare className="h-5 w-5 text-green-500" />,
    user: {
      name: 'Sarah Johnson',
      avatar: ''
    }
  },
  {
    date: 'Yesterday, 11:15 AM',
    title: 'Document Uploaded',
    description: 'New electrical blueprints uploaded to documents',
    icon: <FileText className="h-5 w-5 text-purple-500" />,
    user: {
      name: 'Mike Richards',
      avatar: ''
    }
  },
  {
    date: '2 days ago',
    title: 'Team Meeting Scheduled',
    description: 'Weekly progress meeting scheduled for Friday at 2PM',
    icon: <Calendar className="h-5 w-5 text-amber-500" />,
    user: {
      name: 'Amanda Peterson',
      avatar: ''
    }
  }
]

// Mock data for recent documents
const RECENT_DOCUMENTS = [
  {
    title: 'Architectural Blueprints v2.1',
    type: 'PDF',
    size: '4.2 MB',
    date: '2 days ago'
  },
  {
    title: 'Material Specifications',
    type: 'XLSX',
    size: '1.8 MB',
    date: '3 days ago'
  },
  {
    title: 'Contractor Agreement',
    type: 'DOC',
    size: '320 KB',
    date: '1 week ago'
  },
  {
    title: 'Budget Forecast Q2',
    type: 'XLSX',
    size: '980 KB',
    date: '1 week ago'
  }
]

interface Phase {
  id: number
  name: string
  progress: number
  startDate: string
  endDate: string
  status: 'completed' | 'in-progress' | 'upcoming' | 'warning'
  budget: string
  spent: string
}

interface Task {
  id: number
  name: string
  description?: string
  dueDate: string
  assignee?: string
  status: 'completed' | 'in-progress' | 'pending'
}

interface NewPhase {
  name: string
  startDate: Date
  endDate: Date
  budget: string
  description: string
}

interface NewTask {
  name: string
  description: string
  dueDate: Date
  assigneeId?: string
}

// Initial mock data for phases
const INITIAL_PHASES: Phase[] = [
  {
    id: 1,
    name: 'Demolition & Site Preparation',
    progress: 100,
    startDate: 'Jan 15, 2023',
    endDate: 'Feb 5, 2023',
    status: 'completed',
    budget: '$12,000',
    spent: '$11,450'
  },
  {
    id: 2,
    name: 'Foundation & Framing',
    progress: 85,
    startDate: 'Feb 6, 2023',
    endDate: 'Mar 20, 2023',
    status: 'in-progress',
    budget: '$45,000',
    spent: '$38,500'
  },
  {
    id: 3,
    name: 'Electrical & Plumbing',
    progress: 10,
    startDate: 'Mar 15, 2023',
    endDate: 'Apr 30, 2023',
    status: 'in-progress',
    budget: '$28,000',
    spent: '$4,200'
  },
  {
    id: 4,
    name: 'Interior Finishing',
    progress: 0,
    startDate: 'May 1, 2023',
    endDate: 'Jun 15, 2023',
    status: 'upcoming',
    budget: '$35,000',
    spent: '$0'
  },
  {
    id: 5,
    name: 'Final Inspection & Handover',
    progress: 0,
    startDate: 'Jun 16, 2023',
    endDate: 'Jul 1, 2023',
    status: 'upcoming',
    budget: '$8,000',
    spent: '$0'
  }
]

// Initial new phase data
const INITIAL_NEW_PHASE: NewPhase = {
  name: '',
  startDate: new Date(),
  endDate: new Date(),
  budget: '',
  description: ''
}

// Initial new task data
const INITIAL_NEW_TASK: NewTask = {
  name: '',
  description: '',
  dueDate: new Date(),
  assigneeId: undefined
} 