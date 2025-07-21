/**
 * Data adapters for Projects page - transform Supabase data to UI format
 * Handles conversion between database schema and frontend Project type
 */
import type { Project, ProjectStatus } from '@/types/project';

// Supabase project data structure
export interface SupabaseProject {
  id: string;
  name: string;
  description: string | null;
  status: string;
  details: {
    client_name?: string;
    project_type?: string;
    location?: string;
    plot_size?: string;
    building_size?: string;
    floors?: number;
  };
  timeline: {
    planned_start?: string;
    planned_end?: string;
    actual_start?: string;
    actual_end?: string;
  };
  budget: {
    allocated?: number;
    spent?: number;
    currency?: string;
  };
  profile_image?: string | null;
  inspiration_images?: string[] | null;
  created_at: string;
  updated_at: string;
  be_project_member?: Array<{
    user_id: string;
    role: string;
  }>;
}

/**
 * Transform Supabase project data to UI Project format
 */
export function adaptSupabaseProjectToUI(supabaseProject: SupabaseProject): Project {
  // Calculate progress based on status and timeline
  const progress = calculateProjectProgress(supabaseProject);
  
  // Extract team member IDs
  const teamMembers = supabaseProject.be_project_member?.map(member => member.user_id) || [];
  
  // Generate tags based on project data
  const tags = generateProjectTags(supabaseProject);

  return {
    id: supabaseProject.id,
    name: supabaseProject.name,
    client: (typeof supabaseProject.details?.client_name === 'string' ? supabaseProject.details.client_name : null) || 'Unknown Client',
    type: (typeof supabaseProject.details?.project_type === 'string' ? supabaseProject.details.project_type : null) || 'General',
    location: (typeof supabaseProject.details?.location === 'string' ? supabaseProject.details.location : null) || 'Unknown Location',
    description: supabaseProject.description || '',
    budget: supabaseProject.budget?.allocated || 0,
    spent: supabaseProject.budget?.spent || 0,
    progress,
    status: mapDBStatusToUIStatus(supabaseProject.status),
    startDate: new Date(supabaseProject.timeline?.planned_start || supabaseProject.created_at),
    endDate: new Date(supabaseProject.timeline?.planned_end || supabaseProject.created_at),
    imageUrl: supabaseProject.profile_image || '',
    teamMembers,
    tags,
    phases: [], // Will be populated by separate query
    activities: [], // Will be populated by separate query
  };
}

/**
 * Transform array of Supabase projects to UI format
 */
export function adaptSupabaseProjectsToUI(supabaseProjects: SupabaseProject[]): Project[] {
  return supabaseProjects.map(adaptSupabaseProjectToUI);
}

/**
 * Calculate project progress based on status and timeline
 */
function calculateProjectProgress(project: SupabaseProject): number {
  switch (project.status) {
    case 'COMPLETED':
      return 100;
    case 'IN_PROGRESS':
      // Calculate based on timeline if available
      if (project.timeline?.planned_start && project.timeline?.planned_end) {
        const start = new Date(project.timeline.planned_start).getTime();
        const end = new Date(project.timeline.planned_end).getTime();
        const now = Date.now();
        
        if (now <= start) return 0;
        if (now >= end) return 95; // Cap at 95% for in-progress projects
        
        const totalDuration = end - start;
        const elapsed = now - start;
        return Math.min(Math.round((elapsed / totalDuration) * 100), 95);
      }
      // Default progress for in-progress projects
      return Math.floor(Math.random() * 50) + 25; // 25-75%
    case 'PLANNING':
      return Math.floor(Math.random() * 25); // 0-25%
    case 'ON_HOLD':
      return Math.floor(Math.random() * 60) + 10; // 10-70%
    default:
      return 0;
  }
}

/**
 * Generate project tags based on project data
 */
function generateProjectTags(project: SupabaseProject): string[] {
  const tags: string[] = [];
  
  // Add type-based tag
  if (project.details?.project_type && typeof project.details.project_type === 'string') {
    tags.push(project.details.project_type.toLowerCase());
  }
  
  // Add status-based tag
  const uiStatus = mapDBStatusToUIStatus(project.status);
  if (uiStatus === 'completed') {
    tags.push('completed');
  }
  
  // Add scale-based tag
  const budget = project.budget?.allocated || 0;
  if (budget > 10000000) { // 10M+
    tags.push('large-scale');
  } else if (budget > 1000000) { // 1M+
    tags.push('medium-scale');
  } else if (budget > 0) {
    tags.push('small-scale');
  }
  
  // Add location-based tag if available
  if (project.details?.location && typeof project.details.location === 'string') {
    const location = project.details.location.toLowerCase();
    if (location.includes('urban') || location.includes('city')) {
      tags.push('urban');
    } else if (location.includes('rural') || location.includes('country')) {
      tags.push('rural');
    }
  }
  
  return tags;
}

/**
 * Map database status values to UI status values
 */
function mapDBStatusToUIStatus(dbStatus: string): ProjectStatus {
  switch (dbStatus) {
    case 'IN_PROGRESS':
      return 'active';
    case 'PLANNING':
      return 'planning';
    case 'COMPLETED':
      return 'completed';
    case 'ON_HOLD':
      return 'on-hold';
    default:
      return 'planning';
  }
}

/**
 * Map UI status values to database status values
 */
export function mapUIStatusToDBStatus(uiStatus: ProjectStatus): string {
  switch (uiStatus) {
    case 'active':
      return 'IN_PROGRESS';
    case 'planning':
      return 'PLANNING';
    case 'completed':
      return 'COMPLETED';
    case 'upcoming':
      return 'PLANNING'; // Map upcoming to planning for now
    case 'on-hold':
      return 'ON_HOLD';
    default:
      return 'PLANNING';
  }
}

/**
 * Transform UI Project data to Supabase format for mutations
 */
export function adaptUIProjectToSupabase(project: Partial<Project>) {
  return {
    name: project.name,
    description: project.description,
    status: project.status ? mapUIStatusToDBStatus(project.status) : undefined,
    details: {
      client_name: project.client,
      project_type: project.type,
      location: project.location,
    },
    timeline: {
      planned_start: project.startDate,
      planned_end: project.endDate,
    },
    budget: {
      allocated: project.budget,
      spent: project.spent,
      currency: 'USD', // Default currency
    },
    profile_image: project.imageUrl,
  };
}
