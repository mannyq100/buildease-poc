import { TaskStatus } from './common';
import { Activity } from './activity';

export type ProjectStatus = 'active' | 'planning' | 'completed' | 'on-hold';
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
  slug?: string; // URL-friendly identifier
  name: string;
  description: string;
  owner_id: string;
  status: ProjectStatus;
  
  // Visual assets - now handled by be_document table with media categories
  // Removed: profile_image, inspiration_images, progress_images
  // Use useProjectMedia hooks to fetch media by category
  
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
  details?: Record<string, unknown>;
  timeline?: Record<string, unknown>;
  budget_data?: Record<string, unknown>;
  location_data?: Record<string, unknown>;
  specs?: Record<string, unknown>;
  materials_config?: Record<string, unknown>;
  features?: Record<string, unknown>;
  constraints?: Record<string, unknown>;
  owner_info?: Record<string, unknown>;
  recent_phases?: Record<string, unknown>[];
  recent_transactions?: Record<string, unknown>[];
  
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