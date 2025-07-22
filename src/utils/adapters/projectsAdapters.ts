/**
 * Data adapters for Projects page - transform Supabase data to UI format
 * Handles conversion between database schema and frontend Project type
 */
import { Project, ProjectStatus, TeamMember } from '@/types/project';

// Supabase project data structure - updated to match actual database schema
export interface SupabaseProject {
  id: string;
  name: string;
  description: string | null;
  status: string;
  details: {
    // Location information - new structured format
    location?: {
      street_address?: string | null;
      city?: string | null;
      region_or_state?: string | null;
      country?: string | null;
      gps_coordinates?: {
        lat: number;
        lng: number;
      } | null;
      terrain?: string | null;
      nearby_landmarks?: string | null;
    };
    // Project specifications
    specs?: {
      plot_size?: {
        value: number;
        unit: string;
      } | null;
      building_size?: {
        value: number;
        unit: string;
      } | null;
      floors?: number | null;
      rooms?: {
        bedrooms?: number | null;
        bathrooms?: number | null;
        kitchens?: number;
        living_areas?: number;
      };
    };
    // Project metadata
    project_type?: string;
    building_style?: string | null;
    // Materials and construction
    materials?: {
      structure_type?: string | null;
      foundation_type?: string | null;
      roof_type?: string | null;
      wall_material?: string | null;
      floor_material?: string | null;
    };
    // Features
    features?: {
      special_features: string[];
      sustainability_features: string[];
    };
    // Additional information
    constraints?: {
      site_constraints?: string | null;
      local_regulations?: string | null;
      additional_notes?: string | null;
    };
    // Owner information if different
    owner_info?: {
      name?: string | null;
      phone?: string | null;
      email?: string | null;
    } | null;
  };
  timeline: {
    planned_start?: string | null;
    planned_end?: string | null;
    actual_start?: string | null;
    actual_end?: string | null;
    timeframe_months?: number | null;
  };
  budget: {
    allocated: number;
    spent: number;
    currency: string;
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
  
  // Extract team member data - convert to TeamMember format
  const teamMembers: TeamMember[] = supabaseProject.be_project_member?.map(member => ({
    id: member.user_id,
    name: 'Team Member', // Will be populated by separate user query
    role: member.role,
    avatar: '', // Will be populated by separate user query
    status: 'active' as const
  })) || [];
  
  // Generate tags based on project data
  const tags = generateProjectTags(supabaseProject);

  // Format location from structured data
  const formatLocation = (locationData?: SupabaseProject['details']['location']): string => {
    if (!locationData) return 'Unknown Location';
    
    const parts: string[] = [];
    if (locationData.street_address) parts.push(locationData.street_address);
    if (locationData.city) parts.push(locationData.city);
    if (locationData.region_or_state) parts.push(locationData.region_or_state);
    if (locationData.country) parts.push(locationData.country);
    
    return parts.length > 0 ? parts.join(', ') : 'Unknown Location';
  };

  // Extract client name from owner_info or use default
  const clientName = supabaseProject.details?.owner_info?.name || 'Unknown Client';

  // Transform inspiration images from database format to UI format
  const inspirationalImages = supabaseProject.inspiration_images?.map((imageUrl, index) => ({
    id: `inspiration-${index}`,
    url: imageUrl,
    caption: `Inspiration ${index + 1}`,
    uploadedAt: new Date(),
    type: 'inspiration' as const
  })) || [];

  return {
    id: supabaseProject.id,
    name: supabaseProject.name,
    client: clientName,
    type: supabaseProject.details?.project_type || 'General',
    location: formatLocation(supabaseProject.details?.location),
    description: supabaseProject.description || '',
    budget: supabaseProject.budget?.allocated || 0,
    spent: supabaseProject.budget?.spent || 0,
    progress,
    status: mapDBStatusToUIStatus(supabaseProject.status),
    startDate: new Date(supabaseProject.timeline?.planned_start || supabaseProject.created_at),
    endDate: new Date(supabaseProject.timeline?.planned_end || supabaseProject.created_at),
    imageUrl: supabaseProject.profile_image || '',
    profileImage: supabaseProject.profile_image || undefined,
    inspirationalImages,
    progressImages: [], // Will be populated when progress images are implemented
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
  if (project.details?.location) {
    const locationData = project.details.location;
    // Check city or region for urban/rural classification
    const cityName = locationData.city?.toLowerCase() || '';
    const regionName = locationData.region_or_state?.toLowerCase() || '';
    const combinedLocation = `${cityName} ${regionName}`.toLowerCase();
    
    if (combinedLocation.includes('urban') || combinedLocation.includes('city') || cityName.length > 0) {
      tags.push('urban');
    } else if (combinedLocation.includes('rural') || combinedLocation.includes('country')) {
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
