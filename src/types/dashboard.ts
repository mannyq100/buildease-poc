/**
 * Dashboard-related type definitions
 * Used for data visualization, statistics, and UI components
 */

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
  icon: React.ReactNode
  color: 'blue' | 'green' | 'amber' | 'purple' | 'red'
  trend?: {
    value: number
    isPositive: boolean
  }
}

export interface QuickAction {
  title: string
  icon: React.ReactNode
  color: string
  route: string
  description?: string
}

export interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
  badge?: {
    text: string
    color: string
  }
} 