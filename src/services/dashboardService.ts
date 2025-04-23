/**
 * Dashboard Service
 * Provides methods for working with dashboard data
 */
import { ProjectProgressItem, BudgetItem, PieChartItem, QuickStatCard, QuickAction, NavItem, ActivityItem, DeadlineItem } from '@/types/dashboard'
import apiClient from '@/lib/api-client'
import { createService } from './serviceFactory'
import * as mockDashboardService from '@/data/mock/services/dashboardService'

// Real API implementation
const realDashboardService = {
  /**
   * Get project progress data for dashboard
   * @returns Promise that resolves to project progress data
   */
  getProjectProgressData: async (): Promise<ProjectProgressItem[]> => {
    const response = await apiClient.get<ProjectProgressItem[]>('/dashboard/project-progress')
    return response
  },

  /**
   * Get budget data for dashboard
   * @returns Promise that resolves to budget data
   */
  getBudgetData: async (): Promise<BudgetItem[]> => {
    const response = await apiClient.get<BudgetItem[]>('/dashboard/budget')
    return response
  },

  /**
   * Get material usage data for dashboard
   * @returns Promise that resolves to material usage data
   */
  getMaterialUsageData: async (): Promise<PieChartItem[]> => {
    const response = await apiClient.get<PieChartItem[]>('/dashboard/material-usage')
    return response
  },
  
  /**
   * Get task status data for dashboard
   * @returns Promise that resolves to task status data
   */
  getTaskStatusData: async (): Promise<PieChartItem[]> => {
    const response = await apiClient.get<PieChartItem[]>('/dashboard/task-status')
    return response
  },
  
  /**
   * Get quick stats for dashboard
   * @returns Promise that resolves to quick stats data
   */
  getQuickStats: async (): Promise<QuickStatCard[]> => {
    const response = await apiClient.get<QuickStatCard[]>('/dashboard/quick-stats')
    return response
  },
  
  /**
   * Get quick actions for dashboard
   * @returns Promise that resolves to quick actions data
   */
  getQuickActions: async (): Promise<QuickAction[]> => {
    const response = await apiClient.get<QuickAction[]>('/dashboard/quick-actions')
    return response
  },
  
  /**
   * Get navigation items
   * @returns Promise that resolves to navigation items
   */
  getNavItems: async (): Promise<NavItem[]> => {
    const response = await apiClient.get<NavItem[]>('/dashboard/nav-items')
    return response
  },
  
  /**
   * Get recent activity for dashboard
   * @returns Promise that resolves to activity items
   */
  getRecentActivity: async (): Promise<ActivityItem[]> => {
    const response = await apiClient.get<ActivityItem[]>('/dashboard/recent-activity')
    return response
  },
  
  /**
   * Get upcoming deadlines for dashboard
   * @returns Promise that resolves to deadline items
   */
  getUpcomingDeadlines: async (): Promise<DeadlineItem[]> => {
    const response = await apiClient.get<DeadlineItem[]>('/dashboard/upcoming-deadlines')
    return response
  }
}

// Export the appropriate implementation based on configuration
export const {
  getProjectProgressData,
  getBudgetData,
  getMaterialUsageData,
  getTaskStatusData,
  getQuickStats,
  getQuickActions,
  getNavItems,
  getRecentActivity,
  getUpcomingDeadlines
} = createService<typeof realDashboardService>(
  'dashboard',
  mockDashboardService,
  realDashboardService
)
