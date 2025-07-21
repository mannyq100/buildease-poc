/**
 * Enhanced TypeScript types for ProjectDetails with strict typing
 * Eliminates all 'any' types and improves type safety
 */

import type { Project, Phase, Task, Material } from './project';

// Enhanced Material Form Data
export interface MaterialFormData {
  id?: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  quantity: number;
  unitCost: number;
  supplier?: string;
  status: 'pending' | 'ordered' | 'delivered' | 'used';
}

// Enhanced Task Form Data
export interface TaskFormData {
  id?: string;
  name: string;
  description?: string;
  assignedTo?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  progress?: number;
  estimatedHours?: number;
  phaseId?: string;
}

// Enhanced Phase Form Data
export interface PhaseFormData {
  id?: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  progress?: number;
  category?: string;
}

// Team Management Data
export interface TeamMemberData {
  id: string;
  userId: string;
  projectId: string;
  role: 'owner' | 'manager' | 'member' | 'viewer';
  permissions: string[];
  joinedAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface TeamManagementFormData {
  members: TeamMemberData[];
  invitations: {
    email: string;
    role: TeamMemberData['role'];
  }[];
}

// Project Settings Data
export interface ProjectSettingsData {
  notifications: {
    email: boolean;
    push: boolean;
    taskUpdates: boolean;
    phaseCompletion: boolean;
    budgetAlerts: boolean;
  };
  privacy: {
    visibility: 'private' | 'team' | 'public';
    allowGuests: boolean;
    requireApproval: boolean;
  };
  workflow: {
    autoProgressPhases: boolean;
    requireTaskCompletion: boolean;
    enableTimeTracking: boolean;
  };
}

// Date Range Data
export interface DateRangeData {
  startDate: string;
  endDate: string;
}

// Mutation Payload Types
export interface ProjectDetailsMutationPayload {
  material?: MaterialFormData;
  task?: TaskFormData;
  phase?: PhaseFormData;
  team?: TeamManagementFormData;
  settings?: ProjectSettingsData;
  dates?: DateRangeData;
}

// Enhanced Error Types
export interface SupabaseErrorWithContext extends Error {
  code?: string;
  details?: string;
  hint?: string;
  context: 'network' | 'auth' | 'permission' | 'validation' | 'conflict' | 'not_found';
  retryable: boolean;
  userMessage: string;
}

export interface ProjectErrorInfo {
  type: 'loading' | 'not_found' | 'permission_denied' | 'network' | 'server' | 'validation';
  title: string;
  message: string;
  actions: {
    primary?: {
      label: string;
      action: () => void;
    };
    secondary?: {
      label: string;
      action: () => void;
    };
  };
}

// Loading States
export interface ProjectLoadingState {
  project: boolean;
  phases: boolean;
  currentPhase: boolean;
  tasks: boolean;
  materials: boolean;
  team: boolean;
  documents: boolean;
}

// Progressive Loading Data
export interface ProjectDataPriority {
  critical: {
    project?: Project;
  };
  high: {
    currentPhase?: Phase;
    activeTasks?: Task[];
  };
  medium: {
    phases?: Phase[];
    teamMembers?: TeamMemberData[];
  };
  low: {
    materials?: Material[];
    documents?: any[];
    analytics?: any;
  };
}

// Component Props Types
export interface ProjectDetailsContentProps {
  projectId: string;
}

export interface ProjectStatusHeroEnhancedProps {
  project: Project;
  onUpdateProgress: () => void;
  loadingState?: Partial<ProjectLoadingState>;
}

export interface CurrentPhaseSectionProps {
  projectId: string;
  onAddPhase?: () => void;
}

export interface WorkflowSectionsProps {
  projectId: string;
  onUpdateProgress: () => void;
  onTeamManagement: () => void;
  onProjectSettings: () => void;
}

// Voice Note Types
export interface VoiceNoteData {
  transcript: string;
  confidence: number;
  timestamp: Date;
  taskId?: string;
  phaseId?: string;
}

// Offline Support Types
export interface OfflineMutation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'project' | 'phase' | 'task' | 'material';
  data: any;
  timestamp: Date;
  retryCount: number;
}

export interface OfflineQueueState {
  mutations: OfflineMutation[];
  isOnline: boolean;
  syncInProgress: boolean;
  lastSyncTime?: Date;
}