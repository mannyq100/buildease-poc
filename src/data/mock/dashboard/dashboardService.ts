/**
 * Dashboard data service
 * Loads dashboard data from JSON and maps icons to data
 */
import React from 'react';
import { 
  Briefcase, 
  DollarSign, 
  ListTodo, 
  Users, 
  Calendar, 
  Package 
} from 'lucide-react';

import { 
  ProjectProgressItem, 
  BudgetItem, 
  PieChartItem, 
  QuickStatCard, 
  QuickAction,
  NavItem
} from '@/types/dashboard';

import dashboardData from './json/dashboard.json';

// Define interfaces for the JSON data structure
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
    value: string | number;
    color: string;
    iconType: string;
    trend?: {
      value: number;
      isPositive: boolean;
    };
  }>;
  quickActions: Array<{
    title: string;
    color: string;
    route: string;
    description?: string;
    iconType: string;
  }>;
  navItems: Array<{
    label: string;
    path: string;
    iconType: string;
    badge?: {
      text: string;
      color: string;
    };
  }>;
}

// Type assertion for the imported JSON
const typedDashboardData = dashboardData as DashboardDataJson;

// Map to convert icon type strings to actual React components
const iconMap = {
  Briefcase,
  DollarSign,
  ListTodo,
  Users,
  Calendar,
  Package
};

/**
 * Get project progress data
 */
export function getProjectProgressData(): ProjectProgressItem[] {
  return typedDashboardData.projectProgress;
}

/**
 * Get budget data
 */
export function getBudgetData(): BudgetItem[] {
  return typedDashboardData.budgetData;
}

/**
 * Get material usage data
 */
export function getMaterialUsageData(): PieChartItem[] {
  return typedDashboardData.materialUsage;
}

/**
 * Get task status data
 */
export function getTaskStatusData(): PieChartItem[] {
  return typedDashboardData.taskStatus;
}

/**
 * Get quick stats with mapped icons
 */
export function getQuickStats(): QuickStatCard[] {
  return typedDashboardData.quickStats.map(stat => {
    // Ensure color is one of the allowed values in QuickStatCard
    const color = stat.color as 'blue' | 'green' | 'amber' | 'purple' | 'red';
    
    // Create a properly typed QuickStatCard object
    const result: QuickStatCard = {
      title: stat.title,
      value: stat.value,
      color: color,
      icon: stat.iconType && iconMap[stat.iconType as keyof typeof iconMap] ? 
        React.createElement(iconMap[stat.iconType as keyof typeof iconMap], { 
          className: `h-5 w-5 text-${color}-500` 
        }) : null
    };
    
    // Add trend if it exists
    if (stat.trend) {
      result.trend = stat.trend;
    }
    
    return result;
  });
}

/**
 * Get quick actions with mapped icons
 */
export function getQuickActions(): QuickAction[] {
  return typedDashboardData.quickActions.map(action => ({
    title: action.title,
    color: action.color,
    route: action.route,
    description: action.description,
    icon: action.iconType && iconMap[action.iconType as keyof typeof iconMap] ? 
      React.createElement(iconMap[action.iconType as keyof typeof iconMap], { 
        className: `h-6 w-6 text-${action.color}-600` 
      }) : null
  }));
}

/**
 * Get navigation items with mapped icons
 */
export function getNavItems(): NavItem[] {
  return typedDashboardData.navItems.map(item => ({
    label: item.label,
    path: item.path,
    badge: item.badge,
    icon: item.iconType && iconMap[item.iconType as keyof typeof iconMap] ? 
      React.createElement(iconMap[item.iconType as keyof typeof iconMap], { 
        className: 'w-5 h-5' 
      }) : null
  }));
}
