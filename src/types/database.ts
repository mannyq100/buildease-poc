/**
 * Database schema types for BuildEase construction management
 * Based on construction_mgr schema in Supabase
 */
import type { PhaseStatus as DBPhaseStatus } from '@/utils/core/phaseStatus';

// Enums from the database schema
// Project status aligns with construction_mgr.project_status and centralized PhaseStatus
export type ProjectStatus = DBPhaseStatus;
export type UserRole = 'OWNER' | 'CONTRACTOR' | 'SUPPLIER' | 'WORKER' | 'ADMIN' | 'USER';
export type Currency = 'GHS' | 'USD' | 'EUR';
export type AuthProvider = 'GOOGLE' | 'FACEBOOK' | 'LINKEDIN' | 'AUTH0' | 'EMAIL';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type UserTier = 'BASIC' | 'PREMIUM' | 'PROFESSIONAL';
export type MediaCategory = 'profile' | 'inspiration' | 'progress' | 'progress_video' | 'receipt' | 'report' | 'contract' | 'permit' | 'invoice' | 'specification' | 'schedule' | 'drawing' | 'manual' | 'certificate' | 'other_document';

// AI Plan Generation types
export type AIPlanJobStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type PlanGenerationStatus = 'not_started' | 'requested' | 'processing' | 'completed' | 'failed';
export type AIPlanStatus = 'draft' | 'review' | 'approved' | 'rejected' | 'archived';
export type NotificationType = 'general' | 'plan_generation' | 'plan_completed' | 'plan_failed' | 'project_update' | 'system';
export type ActivityType =
  | 'document_upload'
  | 'document_delete'
  | 'project_update'
  | 'status_change'
  | 'image_upload'
  | 'budget_update'
  | 'expense_create'
  | 'expense_update'
  | 'expense_delete'
  | 'phase_create'
  | 'phase_update'
  | 'phase_delete'
  | 'task_create'
  | 'task_update'
  | 'task_complete'
  | 'task_delete'
  | 'task_assign'
  | 'task_unassign'
  | 'team_member_add'
  | 'team_member_remove'
  | 'material_add'
  | 'material_update'
  | 'system'
  | 'inspection'
  | 'delivery'
  | 'weather_delay';

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


// Financial Transaction types
export type TransactionType = 'MATERIAL_PURCHASE' | 'LABOR' | 'EQUIPMENT_RENTAL' | 'PERMIT_FEE' | 'DESIGN_FEE' | 'OTHER';
export type PaymentStatus = 'PENDING' | 'PAID' | 'COMPLETED' | 'APPROVED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'MOBILE_MONEY' | 'BANK_TRANSFER' | 'CHEQUE';

export interface FinancialTransaction {
  id: string;
  title: string;
  description?: string;
  amount: number;
  currency: Currency;
  transaction_type: TransactionType;
  category?: string;
  project_id: string;
  phase_id?: string;
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod;
  payment_date?: string;
  base_currency?: Currency;
  exchange_rate?: number;
  base_amount?: number;
  reference_number?: string;
  approved_by?: string;
  approved_at?: string;
  notes?: string;
  details: Record<string, unknown>;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Material Management types
export interface Material {
  id: string;
  name: string;
  description?: string;
  category?: string;
  unit: string;
  project_id: string;
  specs: Record<string, unknown>;
  currency?: Currency;
  current_quantity?: number;
  min_required_quantity?: number;
  unit_price?: number;
  supplier_id?: string;
  supplier_info?: Record<string, unknown>;
  last_ordered?: string;
  lead_time_days?: number;
  created_at: string;
  updated_at: string;
}

export interface MaterialTransaction {
  id: string;
  material_id: string;
  project_id?: string;
  quantity: number;
  transaction_type: 'PURCHASE' | 'USAGE' | 'ADJUSTMENT' | 'RETURN';
  reference_id?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
}

// Standardized Media types matching database schema
export type MediaType = 'PHOTO' | 'VIDEO' | 'DOCUMENT';
export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type CollectionType = 'album' | 'progress' | 'inspection' | 'before_after' | 'custom';
export type MediaProcessingType = 'thumbnail' | 'compress' | 'watermark' | 'ocr' | 'virus_scan';

// Legacy type alias for backward compatibility during migration
export type DocumentType = MediaType;

export interface Document {
  id: string;
  name: string;
  description?: string;
  media_type: DocumentType;
  category: MediaCategory;
  project_id: string;
  phase_id?: string;
  file_path: string;
  file_size_bytes?: number;
  mime_type?: string;
  metadata: Record<string, unknown>;
  // Enhanced media management fields
  tags?: string[];
  caption?: string;
  thumbnail_url?: string;
  processing_status?: ProcessingStatus;
  created_at: string;
  updated_at: string;
}

// Media Collection interfaces
export interface MediaCollection {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  cover_image_url?: string;
  is_public: boolean;
  collection_type: CollectionType;
  metadata: Record<string, unknown>;
  created_by?: string;
  created_at: string;
  updated_at: string;
  
  // Joined data
  document_count?: number;
  documents?: Document[];
}

export interface CollectionDocument {
  collection_id: string;
  document_id: string;
  sort_order: number;
  added_at: string;
  added_by?: string;
  
  // Joined document data
  document?: Document;
}

export interface MediaProcessingQueue {
  id: string;
  document_id: string;
  processing_type: MediaProcessingType;
  status: ProcessingStatus;
  priority: number;
  attempt_count: number;
  max_attempts: number;
  error_message?: string;
  processing_data: Record<string, unknown>;
  result_data: Record<string, unknown>;
  scheduled_for: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  
  // Joined document data
  document?: Document;
}

// Media search and statistics interfaces
export interface MediaSearchFilters {
  searchTerm?: string;
  tags?: string[];
  documentTypes?: DocumentType[];
  collectionId?: string;
  dateFrom?: string;
  dateTo?: string;
  minFileSize?: number;
  maxFileSize?: number;
  processingStatus?: ProcessingStatus[];
}

export interface MediaSearchResult {
  id: string;
  name: string;
  media_type: DocumentType;
  file_path: string;
  caption?: string;
  description?: string;
  tags?: string[];
  file_size_bytes?: number;
  mime_type?: string;
  created_at: string;
  relevance_score?: number;
}

export interface ProjectMediaStats {
  total_documents: number;
  total_size_bytes: number;
  total_size_mb: number;
  document_types: Record<string, number>;
  recent_uploads: number;
}

// Bulk operation interfaces
export interface BulkMediaOperation {
  operation: 'delete' | 'tag' | 'move_to_collection' | 'update_metadata';
  documentIds: string[];
  data?: Record<string, unknown>;
}

export interface BulkOperationResult {
  success: number;
  failed: number;
  errors: Array<{
    documentId: string;
    error: string;
  }>;
}

// Permission system types
export type PermissionType = 
  | 'VIEW_BUDGET' | 'EDIT_BUDGET' | 'VIEW_FINANCIALS' | 'EDIT_FINANCIALS'
  | 'MANAGE_USERS' | 'MANAGE_PHASES' | 'MANAGE_MATERIALS' | 'MANAGE_DOCUMENTS'
  | 'SUPER_EDIT' | 'VIEW_PROJECT' | 'EDIT_PROJECT' | 'DELETE_PROJECT'
  | 'VIEW_PHASES' | 'EDIT_PHASES' | 'DELETE_PHASES'
  | 'VIEW_MATERIALS' | 'EDIT_MATERIALS' | 'DELETE_MATERIALS'
  | 'VIEW_EXPENSES' | 'EDIT_EXPENSES' | 'DELETE_EXPENSES' | 'APPROVE_EXPENSES'
  | 'VIEW_DOCUMENTS' | 'UPLOAD_DOCUMENTS' | 'DELETE_DOCUMENTS'
  | 'VIEW_WORKERS' | 'MANAGE_WORKERS' | 'VIEW_CONTRACTORS' | 'MANAGE_CONTRACTORS'
  | 'VIEW_SUPPLIERS' | 'MANAGE_SUPPLIERS' | 'GENERATE_REPORTS';

export interface ProjectPermission {
  id: string;
  project_id: string;
  user_id: string;
  permission: PermissionType;
  granted_at: string;
  granted_by: string;
  active: boolean;
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

// Project activity audit log interface
export interface ProjectActivity {
  id: string;
  project_id: string;
  activity_type: ActivityType;
  title: string;
  description?: string | null;
  user_id?: string | null;
  user_name?: string | null;
  entity_type?: string | null; // 'document', 'expense', 'phase', etc.
  entity_id?: string | null;
  metadata: Record<string, unknown>;
  status: 'success' | 'info' | 'warning' | 'error';
  created_at: string;
  updated_at: string;
}

// Comment interface for project, task, and phase comments
export interface Comment {
  id: string;
  entity_type: 'project' | 'task' | 'phase';
  entity_id: string;
  user_id: string;
  content: string;
  parent_comment_id?: string | null; // For threaded comments
  created_at: string;
  updated_at: string;
  
  // Joined user information
  user?: {
    id: string;
    first_name: string;
    last_name?: string | null;
    email: string;
    settings?: {
      picture_url?: string | null;
    };
  };
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
  slug?: string | null;
  // Media files now stored in be_document table with categories
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
  DOCUMENTS: 'be_media_items',
  NOTIFICATIONS: 'be_notification',
  AUDIT_LOG: 'be_audit_log',
  PROJECT_ACTIVITIES: 'be_project_activity',
  TASKS: 'be_task',
  QUALITY_INSPECTIONS: 'be_quality_inspection',
  AI_PLAN_JOBS: 'ai_plan_jobs',
  AI_GENERATED_PLANS: 'ai_generated_plan',
  // Advanced media management tables
  MEDIA_COLLECTIONS: 'media_collection',
  COLLECTION_DOCUMENTS: 'collection_document',
  MEDIA_PROCESSING_QUEUE: 'media_processing_queue'
} as const;

// Utility type for database insertions (excludes auto-generated fields)
export type ProjectInsert = Omit<Project, 'id' | 'created_at' | 'updated_at'>;
export type UserInsert = Omit<User, 'id' | 'created_at' | 'updated_at' | 'version'>;
export type AIPlanJobInsert = Omit<AIPlanJob, 'id' | 'created_at' | 'updated_at'>;
export type NotificationInsert = Omit<Notification, 'id' | 'created_at' | 'updated_at'>;
export type AIGeneratedPlanInsert = Omit<AIGeneratedPlan, 'id' | 'created_at' | 'updated_at' | 'generated_at'>;
export type ProjectActivityInsert = Omit<ProjectActivity, 'id' | 'created_at' | 'updated_at'>;
export type CommentInsert = Omit<Comment, 'id' | 'created_at' | 'updated_at' | 'user'>;
export type DocumentInsert = Omit<Document, 'id' | 'created_at' | 'updated_at'>;
export type MediaCollectionInsert = Omit<MediaCollection, 'id' | 'created_at' | 'updated_at' | 'document_count' | 'documents'>;
export type CollectionDocumentInsert = Omit<CollectionDocument, 'added_at' | 'document'>;
export type MediaProcessingQueueInsert = Omit<MediaProcessingQueue, 'id' | 'created_at' | 'updated_at' | 'document'>;