export type ProjectStatus = 'active' | 'planning' | 'completed' | 'upcoming' | 'on-hold';

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
} 