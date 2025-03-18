/**
 * Dashboard-related type definitions
 * Used for data visualization, statistics, and UI components
 */

import { ReactNode } from 'react'

export interface ProjectProgressItem {
  name: string
  completed: number
  total: number
}

export interface BudgetItem {
  name: string
  Planned: number
  Actual: number
}

export interface PieChartItem {
  name: string
  value: number
}

export interface QuickStatCard {
  title: string
  value: string | number
  color: 'blue' | 'green' | 'amber' | 'purple' | 'red'
  icon: ReactNode
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

export interface QuickAction {
  title: string
  color: string
  route: string
  description?: string
  icon: ReactNode
}

export interface NavItem {
  label: string
  path: string
  icon: ReactNode
  badge?: {
    text: string
    color: string
  }
}

export interface TeamMemberPerformance {
  id: string | number
  name: string
  position: string
  avatar?: string
  completedTasks: number
  totalTasks: number
  performance: number
  isTopPerformer?: boolean
}

export interface ActivityItem {
  text: string
  time: string
  icon: ReactNode
  link?: string
}

export interface DeadlineItem {
  id: string | number
  title: string
  dueDate: string
  project: string
  projectId: string | number
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in-progress' | 'completed'
} 