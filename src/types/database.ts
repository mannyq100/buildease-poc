/**
 * Database schema types for BuildEase construction management
 * Based on construction_mgr schema in Supabase
 */

// Enums from the database schema
export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
export type UserRole = 'OWNER' | 'CONTRACTOR' | 'ARCHITECT' | 'ENGINEER' | 'SUPPLIER' | 'INSPECTOR';
export type Currency = 'GHS' | 'USD' | 'EUR' | 'GBP' | 'NGN' | 'ZAR' | 'XOF';
export type AuthProvider = 'GOOGLE' | 'FACEBOOK' | 'EMAIL';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type UserTier = 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';

// AI Plan Generation types
export type AIPlanJobStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type PlanGenerationStatus = 'not_started' | 'requested' | 'processing' | 'completed' | 'failed';
export type AIPlanStatus = 'draft' | 'review' | 'approved' | 'rejected' | 'archived';
export type NotificationType = 'general' | 'plan_generation' | 'plan_completed' | 'plan_failed' | 'project_update' | 'system';

// Plan progress tracking types
export type ProgressStage = 
  | 'initialization'
  | 'data_analysis'
  | 'design_generation'
  | 'optimization'
  | 'validation'
  | 'finalization';

export interface ProgressStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  progress: number; // 0-100
  estimatedDuration: number; // in minutes
  actualDuration?: number; // in minutes
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

// Project related interfaces
export interface ProjectDetails {
  location: {
    street_address?: string | null;
    city?: string | null;
    region_or_state?: string | null;
    country?: string | null;
    gps_coordinates?: {
      lat: number;
      lng: number;
    } | null;
    // Additional location metadata
    terrain?: string | null;
    nearby_landmarks?: string | null;
  };
  specs: {
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
  project_type?: string;
  building_style?: string | null;
  materials?: {
    structure_type?: string | null;
    foundation_type?: string | null;
    roof_type?: string | null;
    wall_material?: string | null;
    floor_material?: string | null;
  };
  features?: {
    special_features: string[];
    sustainability_features: string[];
  };
  constraints?: {
    site_constraints?: string | null;
    local_regulations?: string | null;
    additional_notes?: string | null;
  };
  owner_info?: {
    name?: string | null;
    phone?: string | null;
    email?: string | null;
  } | null;
}

export interface ProjectTimeline {
  planned_start?: string | null;
  planned_end?: string | null;
  actual_start?: string | null;
  actual_end?: string | null;
  timeframe_months?: number | null;
}

export interface ProjectBudget {
  allocated: number;
  spent: number;
  currency: Currency;
}

// AI Plan Job interface
export interface AIPlanJob {
  id: string;
  project_id: string;
  status: AIPlanJobStatus;
  job_id?: string | null; // External AI service job ID
  progress_percentage: number;
  estimated_completion_time?: string | null;
  error_message?: string | null;
  retry_count: number;
  max_retries: number;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
}

// AI Generated Plan interface
export interface AIGeneratedPlan {
  id: string;
  project_id: string;
  plan_job_id?: string | null;
  version_number: number;
  plan_name?: string | null;
  plan_description?: string | null;
  status: AIPlanStatus;
  is_active: boolean;
  is_approved: boolean;
  plan_data: Record<string, unknown>;
  metadata: Record<string, unknown>;
  approval_notes?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  generated_at: string;
  created_at: string;
  updated_at: string;
}

// Plan progress tracking interface
export interface PlanProgress {
  jobId: string;
  projectId: string;
  currentStage: ProgressStage;
  overallProgress: number; // 0-100
  steps: ProgressStep[];
  estimatedCompletion: string;
  startedAt: string;
  completedAt?: string;
  error?: string;
}


// Enhanced notification interface
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: NotificationType;
  metadata: Record<string, unknown>;
  action_url?: string | null;
  read: boolean;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
}

// Main project interface
export interface Project {
  id: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  details: ProjectDetails;
  timeline: ProjectTimeline;
  budget: ProjectBudget;
  owner_id: string;
  profile_image?: string | null;
  inspiration_images?: string[];
  created_at: string;
  updated_at: string;
}

// User interface
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name?: string | null;
  company_name?: string | null;
  phone?: string | null;
  provider: AuthProvider;
  provider_identifier: string;
  status: UserStatus;
  tier: UserTier;
  settings: {
    picture_url?: string | null;
    email_verified: boolean;
    phone_verified: boolean;
    notifications: {
      email: boolean;
      push: boolean;
    };
    language: string;
    currency: Currency;
  };
  created_at: string;
  updated_at: string;
  version: number;
}

// Project member interface
export interface ProjectMember {
  project_id: string;
  user_id: string;
  role: UserRole;
  joined_at: string;
}

// Database table names for type safety
export const TABLE_NAMES = {
  PROJECTS: 'be_project',
  USERS: 'be_user',
  PROJECT_MEMBERS: 'be_project_member',
  PHASES: 'be_phase',
  MATERIALS: 'be_material',
  FINANCIAL_TRANSACTIONS: 'financial_transaction',
  MATERIAL_TRANSACTIONS: 'material_transaction',
  COMMENTS: 'comment',
  DOCUMENTS: 'be_document',
  NOTIFICATIONS: 'be_notification',
  AUDIT_LOG: 'be_audit_log',
  TASKS: 'be_task',
  QUALITY_INSPECTIONS: 'be_quality_inspection',
  AI_PLAN_JOBS: 'ai_plan_jobs',
  AI_GENERATED_PLANS: 'ai_generated_plan'
} as const;

// Utility type for database insertions (excludes auto-generated fields)
export type ProjectInsert = Omit<Project, 'id' | 'created_at' | 'updated_at'>;
export type UserInsert = Omit<User, 'id' | 'created_at' | 'updated_at' | 'version'>;
export type AIPlanJobInsert = Omit<AIPlanJob, 'id' | 'created_at' | 'updated_at'>;
export type NotificationInsert = Omit<Notification, 'id' | 'created_at' | 'updated_at'>;
export type AIGeneratedPlanInsert = Omit<AIGeneratedPlan, 'id' | 'created_at' | 'updated_at' | 'generated_at'>;