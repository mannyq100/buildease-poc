export type ProjectStatus = 'active' | 'planning' | 'completed' | 'upcoming' | 'on-hold';
export type TaskStatus = 'Completed' | 'In Progress' | 'Not Started' | 'Delayed';
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
  startDate: string;
  endDate: string;
  imageUrl: string;
  teamMembers: string[];
  tags: string[];
  phases?: Phase[];
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
  tasks?: Task[];
}

export interface Task {
  id: string;
  title: string;
  phaseId: number;
  startDate: Date;
  endDate: Date;
  priority: PriorityLevel;
  assignee: string;
  description: string;
  status: TaskStatus;
  completion: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
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