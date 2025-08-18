/**
 * Type definitions for project summary data from construction_mgr.project_summary view
 * Reflects the comprehensive project data structure from the database view
 */

export interface ProjectSummary {
  // Basic project info
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  status: 'active' | 'planning' | 'completed' | 'on-hold';
  
  // Visual assets
  profile_image: string | null;
  inspiration_images: string[] | null;
  
  // Project details
  client: string;
  location: string;
  project_type: string;
  
  // Timeline (raw strings from JSONB)
  start_date: string | null;
  end_date: string | null;
  
  // Financial data
  budget: number;
  spent: number;
  currency: string;
  spent_percentage: number;
  remaining: number;
  
  // Progress and health
  progress: number;
  health: 'excellent' | 'good' | 'fair' | 'poor';
  
  // Owner info
  owner_name: string;
  
  // Counts from related tables
  phases: number;
  materials: number;
  documents: number;
  members: number;
  transactions: number;
  open_tasks: number;
  
  // Audit fields
  created_at: string;
  updated_at: string;
}

export interface ProjectSummaryResponse {
  data: ProjectSummary | null;
  error: Error | null;
  isLoading: boolean;
}