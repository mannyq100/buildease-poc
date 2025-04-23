/**
 * Mock Dashboard Service
 * Provides mock implementations of dashboard-related services
 */
import {
  ProjectProgressItem,
  BudgetItem,
  PieChartItem,
  QuickStatCard,
  QuickAction,
  ActivityItem,
  DeadlineItem,
  NavItem
} from '@/types/dashboard';

import dashboardData from '../json/dashboard.json';

// Map icon names to string identifiers that components can use
const iconMap: Record<string, string> = {
  'Briefcase': 'briefcase',
  'DollarSign': 'dollar',
  'ListTodo': 'task',
  'Users': 'users',
  'Calendar': 'calendar',
  'Package': 'package',
  'default': 'chart' // Default icon
};

// Default nav items 
const defaultNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { label: 'Projects', path: '/projects', icon: 'briefcase' },
  { label: 'Tasks', path: '/tasks', icon: 'task' },
  { label: 'Team', path: '/team', icon: 'users' },
  { label: 'Materials', path: '/materials', icon: 'package' },
  { label: 'Calendar', path: '/calendar', icon: 'calendar' },
  { label: 'Reports', path: '/reports', icon: 'chart' }
];

// Default colors for stats and actions
const getColorForStat = (index: number): 'blue' | 'green' | 'amber' | 'purple' | 'red' => {
  const colors: Array<'blue' | 'green' | 'amber' | 'purple' | 'red'> = ['blue', 'green', 'amber', 'purple', 'red'];
  return colors[index % colors.length];
};

/**
 * Get project progress data for the dashboard
 * @returns Promise that resolves to project progress data
 */
export function getProjectProgressData(): Promise<ProjectProgressItem[]> {
  return Promise.resolve(dashboardData.projectProgress);
}

/**
 * Get budget data for the dashboard
 * @returns Promise that resolves to budget data
 */
export function getBudgetData(): Promise<BudgetItem[]> {
  return Promise.resolve(dashboardData.budgetData);
}

/**
 * Get material usage data for the dashboard
 * @returns Promise that resolves to material usage data
 */
export function getMaterialUsageData(): Promise<PieChartItem[]> {
  return Promise.resolve(dashboardData.materialUsage);
}

/**
 * Get task status data for the dashboard
 * @returns Promise that resolves to task status data
 */
export function getTaskStatusData(): Promise<PieChartItem[]> {
  return Promise.resolve(dashboardData.taskStatus);
}

/**
 * Get quick stats for the dashboard
 * @returns Promise that resolves to quick stat cards
 */
export function getQuickStats(): Promise<QuickStatCard[]> {
  return Promise.resolve(dashboardData.quickStats.map((stat, index) => ({
    title: stat.title,
    value: stat.value,
    // Add the required color property
    color: getColorForStat(index),
    // Convert string icon name to string identifier for component handling
    icon: iconMap[stat.icon] || iconMap['default'],
    trend: stat.change ? {
      value: Math.abs(stat.change),
      isPositive: stat.change > 0
    } : undefined
  })));
}

/**
 * Get quick actions for the dashboard
 * @returns Promise that resolves to quick actions
 */
export function getQuickActions(): Promise<QuickAction[]> {
  return Promise.resolve(dashboardData.quickActions.map((action, index) => ({
    title: action.title,
    // Add required properties
    color: getColorForStat(index),
    route: `/${action.title.toLowerCase().replace(/\s+/g, '-')}`,
    // Convert string icon name to string for component handling
    icon: iconMap[action.icon] || iconMap['default']
  })));
}

/**
 * Get navigation items for the dashboard
 * @returns Promise that resolves to navigation items
 */
export function getNavItems(): Promise<NavItem[]> {
  // Just return the default nav items
  return Promise.resolve(defaultNavItems);
}

/**
 * Get recent activity for the dashboard
 * @returns Promise that resolves to activity items
 */
export function getRecentActivity(): Promise<ActivityItem[]> {
  return Promise.resolve(dashboardData.recentActivity.map(item => ({
    text: item.text,
    time: item.time,
    icon: item.icon,
    link: item.link
  })));
}

/**
 * Get upcoming deadlines for the dashboard
 * @returns Promise that resolves to deadline items
 */
export function getUpcomingDeadlines(): Promise<DeadlineItem[]> {
  return Promise.resolve(dashboardData.upcomingDeadlines.map(item => ({
    id: item.id,
    title: item.title,
    dueDate: item.dueDate,
    project: item.project,
    projectId: item.projectId,
    // Ensure these values match the expected enum types
    priority: (item.priority as 'high' | 'medium' | 'low'),
    status: (item.status as 'pending' | 'in-progress' | 'completed' | 'not-started')
  })));
}
