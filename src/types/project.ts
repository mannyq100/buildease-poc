import { TaskStatus } from './common';
import { Activity } from './activity';

export type ProjectStatus = 'active' | 'planning' | 'completed' | 'upcoming' | 'on-hold';
export type PriorityLevel = 'High' | 'Medium' | 'Low';
export type ViewMode = 'grid' | 'list';

export interface Project {
  id: string;
  name: string;
  client: string;
  type: string;
  location: string;
  description: string;
  budget: number;
  spent: number;
  progress: number;
  status: ProjectStatus;
  startDate: Date;
  endDate: Date;
  imageUrl: string;
  teamMembers: string[];
  tags: string[];
  phases: Phase[];
  activities: Activity[];
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