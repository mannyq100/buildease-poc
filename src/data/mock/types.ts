/**
 * Mock Data Types
 * Defines the structure of all mock data
 */

// Import actual types from the application
import { TeamMember } from '@/types/team';
import { Project } from '@/types/project';
import { Task } from '@/types/task';
import { Material } from '@/types/material';
import { 
  ProjectProgressItem, 
  BudgetItem, 
  PieChartItem,
  QuickStatCard,
  QuickAction,
  ActivityItem,
  DeadlineItem
} from '@/types/dashboard';

/**
 * Complete mock data structure
 */
export default interface MockData {
  // Team data
  team: {
    members: TeamMember[];
    departments: string[];
    statusOptions: string[];
  };
  
  // Project data
  projects: {
    list: Project[];
    statuses: string[];
    types: string[];
  };
  
  // Dashboard data
  dashboard: {
    projectProgress: ProjectProgressItem[];
    budgetData: BudgetItem[];
    materialUsage: PieChartItem[];
    taskStatus: PieChartItem[];
    quickStats: QuickStatCard[];
    quickActions: QuickAction[];
    recentActivity: ActivityItem[];
    upcomingDeadlines: DeadlineItem[];
  };
  
  // Task data
  tasks: {
    list: Task[];
    priorities: string[];
    statuses: string[];
  };
  
  // Material data
  materials: {
    list: Material[];
    categories: string[];
    units: string[];
  };
  
  // Auth data
  auth: {
    users: {
      id: string;
      email: string;
      name: string;
      role: string;
      avatar?: string;
    }[];
    roles: string[];
  };
}
