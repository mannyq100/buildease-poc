/**
 * Mock Data Service - Simulates real API calls for UI development
 * Designed for easy replacement with real Supabase integration
 */

import type { 
  TeamMember,
  ProjectActivity,
  ProjectMetrics,
  BudgetData,
  ProjectExpense,
  ProjectDocument,
  ProjectSettings
} from '@/types';

// Mock delay to simulate network calls
const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Sample team members data
const mockTeamMembers: TeamMember[] = [
  {
    id: 'tm-1',
    userId: 'user-1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@buildease.com',
    role: 'Project Manager',
    avatar: '/api/placeholder/32/32',
    status: 'active',
    joinedDate: '2024-01-15',
    permissions: ['manage_team', 'edit_project', 'view_finances'],
    tasksAssigned: 12,
    tasksCompleted: 8,
    lastActive: '2024-01-20T14:30:00Z'
  },
  {
    id: 'tm-2',
    userId: 'user-2',
    name: 'Mike Chen',
    email: 'mike.chen@contractor.com',
    role: 'Site Supervisor',
    avatar: '/api/placeholder/32/32',
    status: 'active',
    joinedDate: '2024-01-18',
    permissions: ['manage_tasks', 'view_project'],
    tasksAssigned: 8,
    tasksCompleted: 6,
    lastActive: '2024-01-20T16:45:00Z'
  },
  {
    id: 'tm-3',
    userId: 'user-3',
    name: 'Emma Rodriguez',
    email: 'emma.rodriguez@buildease.com',
    role: 'Architect',
    avatar: '/api/placeholder/32/32',
    status: 'active',
    joinedDate: '2024-01-20',
    permissions: ['edit_plans', 'view_project'],
    tasksAssigned: 5,
    tasksCompleted: 3,
    lastActive: '2024-01-20T11:20:00Z'
  },
  {
    id: 'tm-4',
    userId: 'user-4',
    name: 'David Kumar',
    email: 'david.kumar@electrician.com',
    role: 'Electrician',
    avatar: '/api/placeholder/32/32',
    status: 'active',
    joinedDate: '2024-01-22',
    permissions: ['view_project'],
    tasksAssigned: 6,
    tasksCompleted: 4,
    lastActive: '2024-01-20T13:15:00Z'
  }
];

// Sample project expenses
const mockExpenses: ProjectExpense[] = [
  {
    id: 'exp-1',
    projectId: 'proj-1',
    category: 'materials',
    amount: 15420.50,
    description: 'Concrete and steel for foundation',
    date: '2024-01-15',
    createdBy: 'user-1',
    receipt: '/receipts/foundation-materials.pdf',
    approved: true,
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'exp-2',
    projectId: 'proj-1',
    category: 'labor',
    amount: 8750.00,
    description: 'Foundation crew - 5 days',
    date: '2024-01-18',
    createdBy: 'user-2',
    approved: true,
    createdAt: '2024-01-18T16:20:00Z'
  },
  {
    id: 'exp-3',
    projectId: 'proj-1',
    category: 'equipment',
    amount: 2100.00,
    description: 'Excavator rental - 3 days',
    date: '2024-01-16',
    createdBy: 'user-2',
    approved: true,
    createdAt: '2024-01-16T14:45:00Z'
  },
  {
    id: 'exp-4',
    projectId: 'proj-1',
    category: 'materials',
    amount: 5680.75,
    description: 'Framing lumber delivery',
    date: '2024-01-20',
    createdBy: 'user-1',
    approved: false,
    createdAt: '2024-01-20T09:15:00Z'
  }
];

// Sample project documents
const mockDocuments: ProjectDocument[] = [
  {
    id: 'doc-1',
    projectId: 'proj-1',
    fileName: 'architectural-plans-v2.pdf',
    filePath: '/documents/architectural-plans-v2.pdf',
    fileSize: 5242880, // 5MB
    mimeType: 'application/pdf',
    category: 'plans',
    uploadedBy: 'user-3',
    uploadedAt: '2024-01-10T14:30:00Z',
    version: 2,
    tags: ['architecture', 'floor-plan', 'updated']
  },
  {
    id: 'doc-2',
    projectId: 'proj-1',
    fileName: 'building-permit.pdf',
    filePath: '/documents/building-permit.pdf',
    fileSize: 1048576, // 1MB
    mimeType: 'application/pdf',
    category: 'permits',
    uploadedBy: 'user-1',
    uploadedAt: '2024-01-05T10:15:00Z',
    version: 1,
    tags: ['permit', 'legal', 'approved']
  },
  {
    id: 'doc-3',
    projectId: 'proj-1',
    fileName: 'site-photos-week1.zip',
    filePath: '/documents/site-photos-week1.zip',
    fileSize: 15728640, // 15MB
    mimeType: 'application/zip',
    category: 'photos',
    uploadedBy: 'user-2',
    uploadedAt: '2024-01-20T17:45:00Z',
    version: 1,
    tags: ['progress', 'week1', 'foundation']
  },
  {
    id: 'doc-4',
    projectId: 'proj-1',
    fileName: 'safety-report-jan.pdf',
    filePath: '/documents/safety-report-jan.pdf',
    fileSize: 524288, // 512KB
    mimeType: 'application/pdf',
    category: 'safety',
    uploadedBy: 'user-2',
    uploadedAt: '2024-01-18T12:00:00Z',
    version: 1,
    tags: ['safety', 'monthly', 'compliance']
  }
];

// Sample project activity
const mockActivity: ProjectActivity[] = [
  {
    id: 'act-1',
    projectId: 'proj-1',
    userId: 'user-1',
    userName: 'Sarah Johnson',
    action: 'updated',
    entityType: 'project',
    entityId: 'proj-1',
    description: 'Updated project timeline',
    details: { field: 'endDate', oldValue: '2024-03-15', newValue: '2024-03-20' },
    createdAt: '2024-01-20T16:30:00Z'
  },
  {
    id: 'act-2',
    projectId: 'proj-1',
    userId: 'user-2',
    userName: 'Mike Chen',
    action: 'completed',
    entityType: 'task',
    entityId: 'task-1',
    description: 'Completed foundation excavation',
    details: { taskName: 'Foundation Excavation', progress: 100 },
    createdAt: '2024-01-20T14:15:00Z'
  },
  {
    id: 'act-3',
    projectId: 'proj-1',
    userId: 'user-3',
    userName: 'Emma Rodriguez',
    action: 'uploaded',
    entityType: 'document',
    entityId: 'doc-1',
    description: 'Uploaded updated architectural plans',
    details: { fileName: 'architectural-plans-v2.pdf', version: 2 },
    createdAt: '2024-01-20T10:30:00Z'
  }
];

// Sample project settings
const mockProjectSettings: ProjectSettings = {
  projectId: 'proj-1',
  notifications: {
    email: {
      taskUpdates: true,
      budgetAlerts: true,
      teamChanges: true,
      documentUploads: false
    },
    sms: {
      urgentAlerts: true,
      dailyDigest: false
    },
    inApp: {
      allUpdates: true,
      mentions: true,
      deadlines: true
    }
  },
  permissions: {
    teamManagement: ['Project Manager', 'Site Supervisor'],
    budgetAccess: ['Project Manager'],
    documentManagement: ['Project Manager', 'Architect'],
    taskAssignment: ['Project Manager', 'Site Supervisor']
  },
  integrations: {
    calendar: {
      enabled: true,
      provider: 'google',
      syncDeadlines: true
    },
    accounting: {
      enabled: false,
      provider: null
    },
    weatherApi: {
      enabled: true,
      alerts: true
    }
  },
  updatedAt: '2024-01-15T10:00:00Z'
};

/**
 * Mock Data Service Class
 * Implements the same interface that will be used for real Supabase integration
 */
export class MockDataService {
  // Team Management
  static async getProjectTeamMembers(projectId: string): Promise<TeamMember[]> {
    await mockDelay();
    return mockTeamMembers;
  }

  static async addTeamMember(projectId: string, userId: string, role: string): Promise<TeamMember> {
    await mockDelay();
    const newMember: TeamMember = {
      id: `tm-${Date.now()}`,
      userId,
      name: `New Member ${userId}`,
      email: `${userId}@example.com`,
      role,
      avatar: '/api/placeholder/32/32',
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
      permissions: role === 'Project Manager' ? ['manage_team', 'edit_project'] : ['view_project'],
      tasksAssigned: 0,
      tasksCompleted: 0,
      lastActive: new Date().toISOString()
    };
    mockTeamMembers.push(newMember);
    return newMember;
  }

  static async removeTeamMember(projectId: string, userId: string): Promise<void> {
    await mockDelay();
    const index = mockTeamMembers.findIndex(member => member.userId === userId);
    if (index > -1) {
      mockTeamMembers.splice(index, 1);
    }
  }

  static async updateTeamMemberRole(projectId: string, userId: string, role: string): Promise<TeamMember> {
    await mockDelay();
    const member = mockTeamMembers.find(member => member.userId === userId);
    if (member) {
      member.role = role;
      member.permissions = role === 'Project Manager' ? ['manage_team', 'edit_project'] : ['view_project'];
    }
    return member!;
  }

  // Budget & Expenses
  static async getProjectBudget(projectId: string): Promise<BudgetData> {
    await mockDelay();
    const totalExpenses = mockExpenses
      .filter(exp => exp.projectId === projectId && exp.approved)
      .reduce((sum, exp) => sum + exp.amount, 0);

    return {
      projectId,
      totalBudget: 150000,
      totalExpenses,
      remainingBudget: 150000 - totalExpenses,
      categories: {
        materials: {
          budgeted: 60000,
          spent: mockExpenses.filter(e => e.category === 'materials' && e.approved).reduce((s, e) => s + e.amount, 0)
        },
        labor: {
          budgeted: 50000,
          spent: mockExpenses.filter(e => e.category === 'labor' && e.approved).reduce((s, e) => s + e.amount, 0)
        },
        equipment: {
          budgeted: 25000,
          spent: mockExpenses.filter(e => e.category === 'equipment' && e.approved).reduce((s, e) => s + e.amount, 0)
        },
        miscellaneous: {
          budgeted: 15000,
          spent: mockExpenses.filter(e => e.category === 'misc' && e.approved).reduce((s, e) => s + e.amount, 0)
        }
      },
      updatedAt: new Date().toISOString()
    };
  }

  static async getProjectExpenses(projectId: string): Promise<ProjectExpense[]> {
    await mockDelay();
    return mockExpenses.filter(expense => expense.projectId === projectId);
  }

  static async addExpense(projectId: string, expense: Omit<ProjectExpense, 'id' | 'projectId' | 'createdAt'>): Promise<ProjectExpense> {
    await mockDelay();
    const newExpense: ProjectExpense = {
      ...expense,
      id: `exp-${Date.now()}`,
      projectId,
      createdAt: new Date().toISOString()
    };
    mockExpenses.push(newExpense);
    return newExpense;
  }

  static async updateExpense(expenseId: string, updates: Partial<ProjectExpense>): Promise<ProjectExpense> {
    await mockDelay();
    const expense = mockExpenses.find(exp => exp.id === expenseId);
    if (expense) {
      Object.assign(expense, updates);
    }
    return expense!;
  }

  static async deleteExpense(expenseId: string): Promise<void> {
    await mockDelay();
    const index = mockExpenses.findIndex(exp => exp.id === expenseId);
    if (index > -1) {
      mockExpenses.splice(index, 1);
    }
  }

  // Document Management
  static async getProjectDocuments(projectId: string): Promise<ProjectDocument[]> {
    await mockDelay();
    return mockDocuments.filter(doc => doc.projectId === projectId);
  }

  static async uploadDocument(projectId: string, file: File, category: string): Promise<ProjectDocument> {
    await mockDelay(1500); // Longer delay to simulate upload
    const newDocument: ProjectDocument = {
      id: `doc-${Date.now()}`,
      projectId,
      fileName: file.name,
      filePath: `/documents/${file.name}`,
      fileSize: file.size,
      mimeType: file.type,
      category,
      uploadedBy: 'current-user',
      uploadedAt: new Date().toISOString(),
      version: 1,
      tags: []
    };
    mockDocuments.push(newDocument);
    return newDocument;
  }

  static async deleteDocument(documentId: string): Promise<void> {
    await mockDelay();
    const index = mockDocuments.findIndex(doc => doc.id === documentId);
    if (index > -1) {
      mockDocuments.splice(index, 1);
    }
  }

  static async updateDocumentMetadata(documentId: string, metadata: Partial<ProjectDocument>): Promise<ProjectDocument> {
    await mockDelay();
    const document = mockDocuments.find(doc => doc.id === documentId);
    if (document) {
      Object.assign(document, metadata);
    }
    return document!;
  }

  // Project Activity
  static async getProjectActivity(projectId: string): Promise<ProjectActivity[]> {
    await mockDelay();
    return mockActivity
      .filter(activity => activity.projectId === projectId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Project Settings
  static async getProjectSettings(projectId: string): Promise<ProjectSettings> {
    await mockDelay();
    return mockProjectSettings;
  }

  static async updateProjectSettings(projectId: string, settings: Partial<ProjectSettings>): Promise<ProjectSettings> {
    await mockDelay();
    Object.assign(mockProjectSettings, settings, { updatedAt: new Date().toISOString() });
    return mockProjectSettings;
  }

  // Project Metrics
  static async getProjectMetrics(projectId: string): Promise<ProjectMetrics> {
    await mockDelay();
    return {
      projectId,
      progressMetrics: {
        overallProgress: 35,
        phasesCompleted: 2,
        totalPhases: 8,
        tasksCompleted: 18,
        totalTasks: 45,
        milestonesHit: 3,
        totalMilestones: 8
      },
      teamMetrics: {
        totalMembers: mockTeamMembers.length,
        activeMembers: mockTeamMembers.filter(m => m.status === 'active').length,
        averageTasksPerMember: 8.5,
        topPerformer: 'Sarah Johnson'
      },
      budgetMetrics: {
        budgetUtilization: 0.35,
        spendingRate: 1200, // per day
        projectedOverrun: 0,
        costPerPhase: 18750
      },
      timeMetrics: {
        daysElapsed: 15,
        totalProjectDays: 90,
        averageDaysPerPhase: 11.25,
        projectedCompletion: '2024-03-20'
      },
      riskFactors: [
        { type: 'weather', severity: 'low', description: 'Rain forecast next week' },
        { type: 'budget', severity: 'medium', description: 'Material costs trending up' },
        { type: 'schedule', severity: 'low', description: 'Minor delays in permit approval' }
      ],
      updatedAt: new Date().toISOString()
    };
  }
}

// Export service interface that matches what real Supabase service will implement
export const projectDataService = MockDataService;