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

// Project related interfaces
export interface ProjectDetails {
  location: {
    address: string;
    country: string;
    region: string;
    terrain?: string | null;
    nearby_landmarks?: string | null;
    coordinates?: {
      lat: number;
      lng: number;
    } | null;
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
    rooms: {
      bedrooms?: number | null;
      bathrooms?: number | null;
      kitchens?: number;
      living_areas?: number;
    };
  };
  project_type: string;
  building_style?: string | null;
  materials: {
    structure_type?: string | null;
    foundation_type?: string | null;
    roof_type?: string | null;
    wall_material?: string | null;
    floor_material?: string | null;
  };
  features: {
    special_features: string[];
    sustainability_features: string[];
  };
  constraints: {
    site_constraints?: string | null;
    local_regulations?: string | null;
    additional_notes?: string | null;
  };
  owner_info?: {
    name?: string | null;
    phone?: string | null;
    email?: string | null;
  } | null;
  images: string[];
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
  images?: string[];
  ai_generated_plan?: Record<string, unknown> | null;
  plan_approved: boolean;
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
  QUALITY_INSPECTIONS: 'be_quality_inspection'
} as const;

// Utility type for database insertions (excludes auto-generated fields)
export type ProjectInsert = Omit<Project, 'id' | 'created_at' | 'updated_at'>;
export type UserInsert = Omit<User, 'id' | 'created_at' | 'updated_at' | 'version'>;