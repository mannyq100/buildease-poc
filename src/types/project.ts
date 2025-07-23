import { TaskStatus } from './common';
import { Activity } from './activity';

export type ProjectStatus = 'active' | 'planning' | 'completed' | 'upcoming' | 'on-hold';
export type PriorityLevel = 'High' | 'Medium' | 'Low';
export type ViewMode = 'grid' | 'list';

export interface ProjectBudget {
  allocated?: number;
  spent?: number;
  currency?: string;
}

export interface ProjectImage {
  id: string;
  url: string;
  caption?: string;
  uploadedAt: Date;
  type: 'profile' | 'inspiration' | 'progress';
}

export interface Project {
  // Core project information (matches view)
  id: string;
  name: string;
  description: string;
  owner_id: string;
  status: ProjectStatus;
  
  // Visual assets (matches view)
  profile_image?: string;
  inspiration_images?: string[];
  inspirationalImages?: ProjectImage[]; // Transformed in service
  
  // Project details (matches view)
  client: string;
  location: string;
  project_type: string;
  
  // Timeline (raw strings from database)
  start_date: string;
  end_date: string;
  
  // Financial (matches view)
  budget: number;
  spent: number;
  currency: string;
  spent_percentage: number;
  remaining: number;
  
  // Progress and health (matches view)
  progress: number;
  health: 'excellent' | 'good' | 'fair' | 'poor';
  
  // Owner (matches view)
  owner_name: string;
  
  // Counts (matches view)
  phases: number;
  materials: number;
  documents: number;
  members: number;
  transactions: number;
  
  // UI-only fields (populated by transform service)
  teamMembers: TeamMember[];
  activities: Activity[];
  tags: string[];
  
  // Audit (matches view)
  created_at: string;
  updated_at: string;
  
  // Extended data (only in project_details view)
  details?: any;
  timeline?: any;
  budget_data?: any;
  location_data?: any;
  specs?: any;
  materials_config?: any;
  features?: any;
  constraints?: any;
  owner_info?: any;
  recent_phases?: any[];
  recent_transactions?: any[];
  
}

export interface Phase {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  budget: string;
  description: string;
  status: string;
  completion: number;
  tasks: Task[];
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  status: TaskStatus;
  startDate?: Date;
  endDate?: Date;
  assignedTo?: string;
  progress?: number;
  phaseId: string;
  priority: PriorityLevel;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status?: 'active' | 'inactive' | 'pending';
}

export interface MaterialItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
  deliveryDate: string;
  status: string;
} 