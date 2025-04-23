/**
 * Dashboard Service
 * Provides methods for working with dashboard data
 */
import {
  ProjectProgressItem,
  BudgetItem,
  PieChartItem,
  QuickStatCard,
  QuickAction,
  ActivityItem,
  DeadlineItem
} from '@/types/dashboard'

import {
  getProjectProgressData as getMockProgressData,
  getBudgetData as getMockBudgetData,
  getMaterialUsageData as getMockMaterialData,
  getTaskStatusData as getMockTaskData,
  getQuickStats as getMockStats,
  getQuickActions as getMockActions
} from '@/data/mock/dashboard/dashboardService'

/**
 * Get project progress data for dashboard
 * @returns Promise that resolves to project progress data
 */
export async function getProjectProgressData(): Promise<ProjectProgressItem[]> {
  // In a real app, this would be an API call
  return Promise.resolve(getMockProgressData())
}

/**
 * Get budget data for dashboard
 * @returns Promise that resolves to budget data
 */
export async function getBudgetData(): Promise<BudgetItem[]> {
  // In a real app, this would be an API call
  return Promise.resolve(getMockBudgetData())
}

/**
 * Get material usage data for dashboard
 * @returns Promise that resolves to material usage data
 */
export async function getMaterialUsageData(): Promise<PieChartItem[]> {
  // In a real app, this would be an API call
  return Promise.resolve(getMockMaterialData())
}

/**
 * Get task status data for dashboard
 * @returns Promise that resolves to task status data
 */
export async function getTaskStatusData(): Promise<PieChartItem[]> {
  // In a real app, this would be an API call
  return Promise.resolve(getMockTaskData())
}

/**
 * Get quick stats for dashboard
 * @returns Promise that resolves to quick stats data
 */
export async function getQuickStats(): Promise<QuickStatCard[]> {
  // In a real app, this would be an API call
  return Promise.resolve(getMockStats())
}

/**
 * Get quick actions for dashboard
 * @returns Promise that resolves to quick actions data
 */
export async function getQuickActions(): Promise<QuickAction[]> {
  // In a real app, this would be an API call
  return Promise.resolve(getMockActions())
}

// Mock activity data for the dashboard
const mockActivityItems: ActivityItem[] = [
  { 
    text: "Budget for Main St. project updated", 
    time: "1h ago", 
    icon: "dollar",
    link: "/projects/1"
  },
  { 
    text: "3 new tasks assigned to team", 
    time: "3h ago", 
    icon: "task",
    link: "/tasks"
  },
  { 
    text: "Meeting scheduled with contractors", 
    time: "5h ago", 
    icon: "calendar",
    link: "/calendar"
  },
  { 
    text: "New material order placed", 
    time: "Yesterday", 
    icon: "package",
    link: "/materials"
  }
]

/**
 * Get recent activity data for dashboard
 * @returns Promise that resolves to activity data
 */
export async function getRecentActivity(): Promise<ActivityItem[]> {
  // In a real app, this would be an API call
  return Promise.resolve(mockActivityItems)
}

// Mock deadline data for the dashboard
const mockDeadlines: DeadlineItem[] = [
  {
    id: "1",
    title: "Foundation inspection",
    dueDate: "Tomorrow",
    project: "Villa Construction",
    projectId: "1",
    priority: "high",
    status: "pending"
  },
  {
    id: "2",
    title: "Electrical wiring planning",
    dueDate: "May 15, 2024",
    project: "Office Building",
    projectId: "2",
    priority: "medium",
    status: "in-progress"
  },
  {
    id: "3",
    title: "Material delivery",
    dueDate: "May 18, 2024",
    project: "Villa Construction",
    projectId: "1",
    priority: "medium",
    status: "pending"
  }
]

/**
 * Get upcoming deadlines for dashboard
 * @returns Promise that resolves to deadlines data
 */
export async function getUpcomingDeadlines(): Promise<DeadlineItem[]> {
  // In a real app, this would be an API call
  return Promise.resolve(mockDeadlines)
}

/**
 * Get all dashboard data in a single call
 * @returns Promise that resolves to all dashboard data
 */
export async function getDashboardData() {
  // In a real app, this would be an optimized API call
  const [progress, budget, materials, tasks, stats, actions, activity, deadlines] = await Promise.all([
    getProjectProgressData(),
    getBudgetData(),
    getMaterialUsageData(),
    getTaskStatusData(),
    getQuickStats(),
    getQuickActions(),
    getRecentActivity(),
    getUpcomingDeadlines()
  ])
  
  return {
    projectProgress: progress,
    budget,
    materialUsage: materials,
    taskStatus: tasks,
    quickStats: stats,
    quickActions: actions,
    recentActivity: activity,
    upcomingDeadlines: deadlines,
    lastUpdated: new Date()
  }
}
