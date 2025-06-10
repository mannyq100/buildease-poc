import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  getProjectProgressData,
  getBudgetData,
  getMaterialUsageData,
  getTaskStatusData,
  getQuickStats,
  getQuickActions,
  getRecentActivity,
  getUpcomingDeadlines
} from '@/services/dashboardService'
import type { QuickStatCard, QuickAction } from '@/types/dashboard'
import { getProjects } from '@/services/projectService'
import { getTeamMembers } from '@/services/teamService'

// Local interface for activity items that matches the mock data format
interface ActivityItem {
  id: string;
  type: string;
  title: string;
  date: string;
  user: string;
}

// Local interface for deadlines that matches the expected return format
interface Deadline {
  id: string;
  title: string;
  dueDate: string;
  project: string;
  priority: string;
}

// Local interface for team members with string IDs
interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  performance: number;
}

// Chart data interface used in dashboard visualizations
interface ChartData {
  name: string;
  value: number;
  completed?: number;
  total?: number;
  Actual?: number;
  Planned?: number;
}

// Dashboard data state interface
export interface DashboardDataState {
  isLoading: boolean
  projectProgressData: ChartData[]
  budgetData: ChartData[]
  materialUsageData: ChartData[]
  taskStatusData: ChartData[]
  quickStats: QuickStatCard[]
  quickActions: QuickAction[]
  activityItems: ActivityItem[]
  upcomingDeadlines: Deadline[]
  teamData: TeamMember[]
  projectsData: any[]
  lastUpdated: Date
  refreshData: () => Promise<boolean>
}

/**
 * Custom hook for managing dashboard data
 * Fetches and consolidates data from various sources
 */
export function useDashboardData() {
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  
  // Chart data state including project progress, budget, materials, and tasks
  const [chartData, setChartData] = useState({
    projectProgressData: [] as ChartData[],
    budgetData: [] as ChartData[],
    materialUsageData: [] as ChartData[],
    taskStatusData: [] as ChartData[],
  })
  
  // Dashboard content state including stats, actions, activity, and deadlines
  const [dashboardContent, setDashboardContent] = useState({
    quickStats: [] as QuickStatCard[],
    quickActions: [] as QuickAction[],
    activityItems: [] as ActivityItem[],
    upcomingDeadlines: [] as Deadline[],
  })

  // Project and team data state
  const [projectsData, setProjectsData] = useState<any[]>([])
  const [teamData, setTeamData] = useState<TeamMember[]>([])

  // Fetch and transform dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch all data in parallel
        const [
          progressData,
          budgetData,
          materialData,
          taskData,
          stats,
          actions,
          projects,
          team,
          activities,
          deadlines
        ] = await Promise.all([
          getProjectProgressData(),
          getBudgetData(),
          getMaterialUsageData(),
          getTaskStatusData(),
          getQuickStats(),
          getQuickActions(),
          getProjects(),
          getTeamMembers(),
          getRecentActivity(),
          getUpcomingDeadlines()
        ])
        
        // Transform and set project data
        setProjectsData(projects)
        
        // Transform team data
        const processedTeam = team.map(member => ({
          id: String(member.id),
          name: member.name,
          avatar: member.avatar || '/avatars/default.jpg',
          performance: member.performance
        }))
        setTeamData(processedTeam)
        
        // Transform the data to match our interfaces
        const transformedProgressData = progressData.map(item => ({
          name: item.name,
          value: Math.round((item.completed / item.total) * 100),
          completed: item.completed,
          total: item.total
        }))
        
        const transformedBudgetData = budgetData.map(item => ({
          name: item.name,
          value: item.Actual, // Using Actual spend as the value
          Actual: item.Actual,
          Planned: item.Planned
        }))
        
        // Set chart data state
        setChartData({
          projectProgressData: transformedProgressData,
          budgetData: transformedBudgetData,
          materialUsageData: materialData,
          taskStatusData: taskData,
        })
        
        // The dashboard service already returns QuickStatCard objects with the right structure
        const transformedStats = stats;
        
        const transformedActions: QuickAction[] = actions.map((action) => ({
          title: action.title,
          color: action.color,
          route: action.route,
          description: action.description,
          icon: action.icon,
        }))
        
        // Convert activity data to expected format
        const transformedActivities = activities.map((item, index) => ({
          id: String(index + 1),
          type: typeof item.icon === 'string' ? item.icon : 'default',
          title: item.text,
          date: item.time,
          user: 'User'
        }))
        
        // Convert deadline data to expected format
        const transformedDeadlines = deadlines.map(item => ({
          id: String(item.id),
          title: item.title,
          dueDate: item.dueDate,
          project: item.project,
          priority: item.priority
        }))
        
        // Set dashboard content state
        setDashboardContent({
          quickStats: transformedStats,
          quickActions: transformedActions,
          activityItems: transformedActivities,
          upcomingDeadlines: transformedDeadlines,
        })
        
        setLastUpdated(new Date())
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchDashboardData()
  }, []) // Empty dependency array means this runs once on mount

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
    lastUpdated,
    refreshData: async () => true
  }), [
    isLoading, 
    chartData, 
    dashboardContent, 
    teamData,
    projectsData,
    lastUpdated
  ])

  // Refresh data function for dashboard refresh button
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Fetch all data in parallel again
      const [
        progressData,
        budgetData,
        materialData,
        taskData,
        stats,
        actions,
        projects,
        team,
        activities,
        deadlines
      ] = await Promise.all([
        getProjectProgressData(),
        getBudgetData(),
        getMaterialUsageData(),
        getTaskStatusData(),
        getQuickStats(),
        getQuickActions(),
        getProjects(),
        getTeamMembers(),
        getRecentActivity(),
        getUpcomingDeadlines()
      ])
      
      // Apply the same transformations as in the initial load
      setProjectsData(projects)
      
      const processedTeam = team.map(member => ({
        id: String(member.id),
        name: member.name,
        avatar: member.avatar || '/avatars/default.jpg',
        performance: member.performance
      }))
      setTeamData(processedTeam)
      
      const transformedProgressData = progressData.map(item => ({
        name: item.name,
        value: Math.round((item.completed / item.total) * 100),
        completed: item.completed,
        total: item.total
      }))
      
      const transformedBudgetData = budgetData.map(item => ({
        name: item.name,
        value: item.Actual,
        Actual: item.Actual,
        Planned: item.Planned
      }))
      
      setChartData({
        projectProgressData: transformedProgressData,
        budgetData: transformedBudgetData,
        materialUsageData: materialData,
        taskStatusData: taskData,
      })
      
      // The dashboard service already returns QuickStatCard objects with the right structure
      const transformedStats = stats;
      
      const transformedActions: QuickAction[] = actions.map((action) => ({
        title: action.title,
        color: action.color,
        route: action.route,
        description: action.description,
        icon: action.icon,
      }))
      
      const transformedActivities = activities.map((item, index) => ({
        id: String(index + 1),
        type: typeof item.icon === 'string' ? item.icon : 'default',
        title: item.text,
        date: item.time,
        user: 'User'
      }))
      
      const transformedDeadlines = deadlines.map(item => ({
        id: String(item.id),
        title: item.title,
        dueDate: item.dueDate,
        project: item.project,
        priority: item.priority
      }))
      
      setDashboardContent({
        quickStats: transformedStats,
        quickActions: transformedActions,
        activityItems: transformedActivities,
        upcomingDeadlines: transformedDeadlines,
      })
      
      setLastUpdated(new Date())
      return true
    } catch (error) {
      console.error('Error refreshing dashboard data:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }, []) // No dependencies to ensure stable reference
  
  return {
    ...dashboardData,
    refreshData
  }
}