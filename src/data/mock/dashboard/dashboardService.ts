/**
 * Mock Dashboard Service
 * Contains mock data for the dashboard components
 */
import type {
  ProjectProgressItem,
  BudgetItem,
  PieChartItem,
  QuickStatCard,
  QuickAction,
  NavItem,
  ActivityItem,
  DeadlineItem
} from '@/types/dashboard';

import dashboardData from './json/dashboard.json';

// Define interface for the JSON data structure
interface DashboardDataJson {
  projectProgress: Array<{
    name: string;
    completed: number;
    total: number;
  }>;
  budgetData: Array<{
    name: string;
    Planned: number;
    Actual: number;
  }>;
  materialUsage: Array<{
    name: string;
    value: number;
  }>;
  taskStatus: Array<{
    name: string;
    value: number;
  }>;
  quickStats: Array<{
    title: string;
    value: number;
    change: number;
    icon: string;
  }>;
  quickActions: Array<{
    title: string;
    icon: string;
  }>;
  recentActivity: Array<{
    text: string;
    time: string;
    icon: string;
    link?: string;
  }>;
  upcomingDeadlines: Array<{
    id: string;
    title: string;
    dueDate: string;
    project: string;
    projectId: string;
    priority: string;
    status: string;
  }>;
}

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

// Default nav items since our JSON doesn't have this property
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
 * Get mock project progress data for the dashboard
 * @returns Array of project progress items
 */
export function getProjectProgressData(): ProjectProgressItem[] {
  const data = dashboardData as unknown as DashboardDataJson;
  return data.projectProgress;
}

/**
 * Get mock budget data for the dashboard
 * @returns Array of budget items
 */
export function getBudgetData(): BudgetItem[] {
  const data = dashboardData as unknown as DashboardDataJson;
  return data.budgetData;
}

/**
 * Get mock material usage data for the dashboard
 * @returns Array of pie chart items representing material usage
 */
export function getMaterialUsageData(): PieChartItem[] {
  const data = dashboardData as unknown as DashboardDataJson;
  return data.materialUsage;
}

/**
 * Get mock task status data for the dashboard
 * @returns Array of pie chart items representing task status
 */
export function getTaskStatusData(): PieChartItem[] {
  const data = dashboardData as unknown as DashboardDataJson;
  return data.taskStatus;
}

/**
 * Get mock quick stats for the dashboard
 * @returns Array of quick stat cards
 */
export function getQuickStats(): QuickStatCard[] {
  const data = dashboardData as unknown as DashboardDataJson;
  return data.quickStats.map((stat, index) => ({
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
  }));
}

/**
 * Get mock quick actions for the dashboard
 * @returns Array of quick actions
 */
export function getQuickActions(): QuickAction[] {
  const data = dashboardData as unknown as DashboardDataJson;
  return data.quickActions.map((action, index) => ({
    title: action.title,
    // Add required properties
    color: getColorForStat(index),
    route: `/${action.title.toLowerCase().replace(/\s+/g, '-')}`,
    // Convert string icon name to string for component handling
    icon: iconMap[action.icon] || iconMap['default']
  }));
}

/**
 * Get mock navigation items
 * @returns Array of navigation items
 */
export function getNavItems(): NavItem[] {
  // Just return the default nav items since our JSON doesn't have this property
  return defaultNavItems;
}

/**
 * Get recent activity
 * @returns Array of activity items
 */
export function getRecentActivity(): ActivityItem[] {
  const data = dashboardData as unknown as DashboardDataJson;
  return data.recentActivity.map(item => ({
    text: item.text,
    time: item.time,
    icon: item.icon,
    link: item.link
  }));
}

/**
 * Get upcoming deadlines
 * @returns Array of deadline items
 */
export function getUpcomingDeadlines(): DeadlineItem[] {
  const data = dashboardData as unknown as DashboardDataJson;
  return data.upcomingDeadlines.map(item => ({
    id: item.id,
    title: item.title,
    dueDate: item.dueDate,
    project: item.project,
    projectId: item.projectId,
    // Ensure these values match the expected enum types
    priority: (item.priority as 'high' | 'medium' | 'low'),
    status: (item.status as 'pending' | 'in-progress' | 'completed')
  }));
}
