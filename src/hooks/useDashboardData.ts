import { useState, useEffect, useMemo } from 'react'
import { 
  getProjectProgressData, 
  getBudgetData, 
  getMaterialUsageData, 
  getTaskStatusData, 
  getQuickStats, 
  getQuickActions 
} from '@/data/dashboardService'
import type { DeadlineItem, ActivityItem } from '@/types/dashboard'
import { projectsData } from '@/data/projectsData'
import { teamData } from '@/data/teamData'

// Mock recent activity data - in a real app, this would come from an API
const mockActivityItems: ActivityItem[] = [
  { 
    id: "1",
    type: "dollar",
    title: "Budget for Main St. project updated", 
    date: "1h ago", 
    user: "John Doe"
  },
  { 
    id: "2",
    type: "task",
    title: "3 new tasks assigned to team", 
    date: "3h ago", 
    user: "Jane Smith"
  },
  { 
    id: "3",
    type: "calendar",
    title: "Meeting scheduled with contractors", 
    date: "5h ago", 
    user: "Mike Johnson"
  },
  { 
    id: "4",
    type: "package",
    title: "New material order placed", 
    date: "Yesterday", 
    user: "Sarah Williams"
  }
]

// Mock upcoming deadlines data - in a real app, this would come from an API
const mockDeadlines: DeadlineItem[] = [
  {
    id: 1,
    title: "Foundation inspection",
    dueDate: "Tomorrow",
    project: "Villa Construction",
    projectId: 1,
    priority: "high",
    status: "pending"
  },
  {
    id: 2,
    title: "Electrical wiring planning",
    dueDate: "May 15, 2024",
    project: "Office Building",
    projectId: 2,
    priority: "medium",
    status: "in-progress"
  },
  {
    id: 3,
    title: "Material delivery",
    dueDate: "May 18, 2024",
    project: "Villa Construction",
    projectId: 1,
    priority: "medium",
    status: "pending"
  },
  {
    id: 4,
    title: "Weekly progress report",
    dueDate: "May 19, 2024",
    project: "Hospital Renovation",
    projectId: 3,
    priority: "low",
    status: "pending"
  },
  {
    id: 5,
    title: "Client meeting",
    dueDate: "May 22, 2024",
    project: "Office Building",
    projectId: 2,
    priority: "high",
    status: "in-progress"
  }
]

// Define proper types for the dashboard data
interface ProjectSummary {
  id: string;
  name: string;
  progress: number;
  status: string;
}

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  date: string;
  user: string;
}

interface Deadline {
  id: string;
  title: string;
  dueDate: string;
  project: string;
  priority: string;
}

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  performance: number;
}

interface ChartData {
  name: string;
  value: number;
}

interface DashboardData {
  stats: Record<string, number>;
  projectSummaries: ProjectSummary[];
  recentActivity: ActivityItem[];
  deadlines: DeadlineItem[];
  teamPerformance: TeamMember[];
  budgetData: ChartData[];
  scheduleData: ChartData[];
}

export interface DashboardDataState {
  isLoading: boolean
  projectProgressData: ChartData[]
  budgetData: ChartData[]
  materialUsageData: ChartData[]
  taskStatusData: ChartData[]
  quickStats: Record<string, number>[]
  quickActions: {id: string; title: string; icon: string}[]
  activityItems: ActivityItem[]
  upcomingDeadlines: Deadline[]
  teamData: TeamMember[]
  projectsData: ProjectSummary[]
  lastUpdated: Date | null
}

/**
 * Custom hook for managing dashboard data
 * Handles loading, refreshing, and organizing dashboard data
 */
export function useDashboardData() {
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  
  // State for chart data
  const [chartData, setChartData] = useState({
    projectProgressData: getProjectProgressData(),
    budgetData: getBudgetData(),
    materialUsageData: getMaterialUsageData(),
    taskStatusData: getTaskStatusData()
  })
  
  // State for dashboard content
  const [dashboardContent, setDashboardContent] = useState({
    quickStats: getQuickStats(),
    quickActions: getQuickActions(),
    activityItems: mockActivityItems,
    upcomingDeadlines: mockDeadlines,
  })
  
  // Simulate data loading on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Set data
      setChartData({
        projectProgressData: getProjectProgressData(),
        budgetData: getBudgetData(),
        materialUsageData: getMaterialUsageData(),
        taskStatusData: getTaskStatusData()
      })
      
      setDashboardContent({
        quickStats: getQuickStats(),
        quickActions: getQuickActions(),
        activityItems: mockActivityItems,
        upcomingDeadlines: mockDeadlines
      })
      
      setLastUpdated(new Date())
      setIsLoading(false)
    }
    
    loadData()
  }, [])
  
  /**
   * Refreshes dashboard data
   * @returns Promise that resolves when data is refreshed
   */
  const refreshData = async () => {
    setIsLoading(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Set data with updated values
    setChartData({
      projectProgressData: getProjectProgressData(),
      budgetData: getBudgetData(),
      materialUsageData: getMaterialUsageData(),
      taskStatusData: getTaskStatusData()
    })
    
    setDashboardContent({
      quickStats: getQuickStats(),
      quickActions: getQuickActions(),
      activityItems: mockActivityItems,
      upcomingDeadlines: mockDeadlines
    })
    
    setLastUpdated(new Date())
    setIsLoading(false)
    
    return true
  }
  
  // Combine all data into a single state object with memoization
  const dashboardData = useMemo<DashboardDataState>(() => ({
    isLoading,
    projectProgressData: chartData.projectProgressData,
    budgetData: chartData.budgetData,
    materialUsageData: chartData.materialUsageData,
    taskStatusData: chartData.taskStatusData,
    quickStats: dashboardContent.quickStats,
    quickActions: dashboardContent.quickActions,
    activityItems: dashboardContent.activityItems,
    upcomingDeadlines: dashboardContent.upcomingDeadlines,
    teamData,
    projectsData,
    lastUpdated
  }), [
    isLoading, 
    chartData, 
    dashboardContent, 
    lastUpdated
  ])
  
  return {
    ...dashboardData,
    refreshData
  }
} 