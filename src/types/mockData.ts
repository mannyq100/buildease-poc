/**
 * Additional types for mock data service
 * These will be moved to appropriate type files when implementing real integration
 */

// Team Management Types
export interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'pending';
  joinedDate: string;
  permissions: string[];
  tasksAssigned: number;
  tasksCompleted: number;
  lastActive: string;
}

// Budget and Financial Types
export interface BudgetData {
  projectId: string;
  totalBudget: number;
  totalExpenses: number;
  remainingBudget: number;
  categories: {
    materials: BudgetCategory;
    labor: BudgetCategory;
    equipment: BudgetCategory;
    miscellaneous: BudgetCategory;
  };
  updatedAt: string;
}

export interface BudgetCategory {
  budgeted: number;
  spent: number;
}

export interface ProjectExpense {
  id: string;
  projectId: string;
  category: 'materials' | 'labor' | 'equipment' | 'misc';
  amount: number;
  description: string;
  date: string;
  createdBy: string;
  receipt?: string;
  approved: boolean;
  createdAt: string;
}

// Document Management Types
export interface ProjectDocument {
  id: string;
  projectId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  category: 'plans' | 'permits' | 'reports' | 'photos' | 'contracts' | 'safety';
  uploadedBy: string;
  uploadedAt: string;
  version: number;
  tags: string[];
}

// Activity and Analytics Types
export interface ProjectActivity {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  action: 'created' | 'updated' | 'deleted' | 'completed' | 'uploaded' | 'assigned';
  entityType: 'project' | 'phase' | 'task' | 'document' | 'expense' | 'team';
  entityId: string;
  description: string;
  details: Record<string, unknown>;
  createdAt: string;
}

export interface ProjectMetrics {
  projectId: string;
  progressMetrics: {
    overallProgress: number;
    phasesCompleted: number;
    totalPhases: number;
    tasksCompleted: number;
    totalTasks: number;
    milestonesHit: number;
    totalMilestones: number;
  };
  teamMetrics: {
    totalMembers: number;
    activeMembers: number;
    averageTasksPerMember: number;
    topPerformer: string;
  };
  budgetMetrics: {
    budgetUtilization: number;
    spendingRate: number;
    projectedOverrun: number;
    costPerPhase: number;
  };
  timeMetrics: {
    daysElapsed: number;
    totalProjectDays: number;
    averageDaysPerPhase: number;
    projectedCompletion: string;
  };
  riskFactors: RiskFactor[];
  updatedAt: string;
}

export interface RiskFactor {
  type: 'weather' | 'budget' | 'schedule' | 'safety' | 'quality' | 'resource';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

// Project Settings Types
export interface ProjectSettings {
  projectId: string;
  notifications: {
    email: {
      taskUpdates: boolean;
      budgetAlerts: boolean;
      teamChanges: boolean;
      documentUploads: boolean;
    };
    sms: {
      urgentAlerts: boolean;
      dailyDigest: boolean;
    };
    inApp: {
      allUpdates: boolean;
      mentions: boolean;
      deadlines: boolean;
    };
  };
  permissions: {
    teamManagement: string[];
    budgetAccess: string[];
    documentManagement: string[];
    taskAssignment: string[];
  };
  integrations: {
    calendar: {
      enabled: boolean;
      provider: string | null;
      syncDeadlines: boolean;
    };
    accounting: {
      enabled: boolean;
      provider: string | null;
    };
    weatherApi: {
      enabled: boolean;
      alerts: boolean;
    };
  };
  updatedAt: string;
}