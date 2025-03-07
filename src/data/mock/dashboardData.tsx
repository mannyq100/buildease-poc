/**
 * Mock data for the Dashboard
 * Used for data visualization and UI components
 */
import React from 'react'
import { 
  Briefcase, 
  DollarSign, 
  ListTodo, 
  Users, 
  Calendar, 
  Package 
} from 'lucide-react'

import { 
  ProjectProgressItem, 
  BudgetItem, 
  PieChartItem, 
  QuickStatCard, 
  QuickAction,
  NavItem
} from '@/types/dashboard'

/**
 * Data for project progress visualization
 */
export const PROJECT_PROGRESS_DATA: ProjectProgressItem[] = [
  { name: 'Foundation', completed: 100, total: 100 },
  { name: 'Framing', completed: 75, total: 100 },
  { name: 'Electrical', completed: 30, total: 100 },
  { name: 'Plumbing', completed: 25, total: 100 },
  { name: 'Interior', completed: 0, total: 100 }
]

/**
 * Data for budget overview visualization
 */
export const BUDGET_DATA: BudgetItem[] = [
  { name: 'Jan', Planned: 8000, Actual: 7200 },
  { name: 'Feb', Planned: 12000, Actual: 13100 },
  { name: 'Mar', Planned: 15000, Actual: 14800 },
  { name: 'Apr', Planned: 14000, Actual: 16500 },
  { name: 'May', Planned: 18000, Actual: 17300 },
  { name: 'Jun', Planned: 9000, Actual: 9200 }
]

/**
 * Data for material usage visualization
 */
export const MATERIAL_USAGE_DATA: PieChartItem[] = [
  { name: 'Concrete', value: 32 },
  { name: 'Steel', value: 24 },
  { name: 'Wood', value: 18 },
  { name: 'Glass', value: 12 },
  { name: 'Other', value: 14 }
]

/**
 * Data for task status visualization
 */
export const TASK_STATUS_DATA: PieChartItem[] = [
  { name: 'Completed', value: 42 },
  { name: 'In Progress', value: 18 },
  { name: 'Pending', value: 34 },
  { name: 'Delayed', value: 6 }
]

/**
 * Quick stat cards for the dashboard header
 */
export const QUICK_STATS: QuickStatCard[] = [
  {
    title: 'Active Projects',
    value: 4,
    icon: <Briefcase className="h-5 w-5 text-blue-500" />,
    color: 'blue'
  },
  {
    title: 'Total Budget',
    value: '$120K',
    icon: <DollarSign className="h-5 w-5 text-green-500" />,
    color: 'green'
  },
  {
    title: 'Open Tasks',
    value: 28,
    icon: <ListTodo className="h-5 w-5 text-amber-500" />,
    color: 'amber'
  },
  {
    title: 'Team Members',
    value: 12,
    icon: <Users className="h-5 w-5 text-purple-500" />,
    color: 'purple'
  }
]

/**
 * Quick actions for the dashboard
 */
export const QUICK_ACTIONS: QuickAction[] = [
  {
    title: 'Schedule Meeting',
    icon: <Calendar className="h-6 w-6 text-blue-600" />,
    color: 'blue',
    route: '/schedule',
    description: 'Plan and schedule meetings with your team and clients'
  },
  {
    title: 'Order Materials',
    icon: <Package className="h-6 w-6 text-green-600" />,
    color: 'green',
    route: '/materials',
    description: 'Order construction materials for your projects'
  },
  {
    title: 'Review Budget',
    icon: <DollarSign className="h-6 w-6 text-purple-600" />,
    color: 'purple',
    route: '/expenses',
    description: 'Review and manage your project budgets'
  },
  {
    title: 'Team Management',
    icon: <Users className="h-6 w-6 text-amber-600" />,
    color: 'amber',
    route: '/team',
    description: 'Manage your team members and assignments'
  }
]

/**
 * Navigation items for the dashboard
 */
export const NAV_ITEMS: NavItem[] = [
  { 
    label: 'Dashboard', 
    path: '/dashboard', 
    icon: <Briefcase className="w-5 h-5" /> 
  },
  { 
    label: 'Projects', 
    path: '/projects', 
    icon: <Briefcase className="w-5 h-5" />,
    badge: {
      text: '4',
      color: 'blue'
    }
  },
  { 
    label: 'Schedule', 
    path: '/schedule', 
    icon: <Calendar className="w-5 h-5" /> 
  },
  { 
    label: 'Materials', 
    path: '/materials', 
    icon: <Package className="w-5 h-5" /> 
  },
  { 
    label: 'Expenses', 
    path: '/expenses', 
    icon: <DollarSign className="w-5 h-5" /> 
  }
] 