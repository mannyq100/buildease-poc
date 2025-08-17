/**
 * TypeScript interfaces for ProjectDetails components
 * Following BuildEase standards for centralized type definitions
 */
import type { ProjectStatus } from '@/types/database';

// Task-related interfaces
export interface TaskFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'blocked' | 'cancelled';
  due_date: string;
  assigned_to: string;
}

export interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  phaseId: string;
  projectId: string;
  task?: Record<string, unknown>;
  onSuccess?: () => void;
  onCreateTask?: (taskData: Record<string, unknown>, phaseId: string, projectId: string) => Promise<void>;
  onUpdateTask?: (taskId: string, taskData: Record<string, unknown>) => Promise<void>;
  isLoading?: boolean;
}

// Financial Transaction Payment Status enum (matches database)
export type PaymentStatus = 'PENDING' | 'PAID' | 'COMPLETED' | 'APPROVED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';

// Transaction Type enum (matches database)
export type TransactionType = 'MATERIAL_PURCHASE' | 'LABOR' | 'EQUIPMENT_RENTAL' | 'PERMIT_FEE' | 'DESIGN_FEE' | 'OTHER';

// Payment Method enum (matches database)
export type PaymentMethod = 'CASH' | 'CHECK' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'OTHER';

// Currency enum (popular currencies)
export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CNY' | 'INR' | 'BRL' | 'MXN' | 'ZAR' | 'CHF' | 'SEK' | 'NOK' | 'DKK';

// Budget-related interfaces (aligned with financial_transaction table)
export interface BudgetExpense {
  id: string;
  project_id: string;
  phase_id?: string;
  transaction_type: TransactionType;
  amount: number;
  currency: Currency;
  base_amount: number; // Amount in USD for consistent calculations
  description?: string;
  category: string;
  payment_date?: string;
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod;
  receipt_url?: string;
  approved_by?: string;
  approved_at?: string;
  details?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface BudgetSummary {
  allocated: number;
  spent: number;
  currency: string;
}

export interface BudgetOverviewProps {
  project: {
    budget?: number | BudgetSummary;
  };
  expandedSections: {
    budget: boolean;
  };
  onToggleSection: (section: 'budget') => void;
  onOpenCreateModal: (type: 'budget') => void;
}

export interface BudgetExpensesListProps {
  budgetExpenses?: BudgetExpense[];
  onEditExpense: (expense: BudgetExpense) => void;
  onDeleteExpense: (expenseId: string) => void;
}

// Team member interfaces
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'on-break' | 'off-site';
  email?: string;
  phone?: string;
  contactInfo?: {
    phone?: string;
    email?: string;
  };
  avatar?: string;
  isOnline?: boolean;
  availability?: 'available' | 'busy' | 'offline';
}

// Team-related component props
export interface TeamMembersListProps {
  teamMembers: TeamMember[];
  onEditMember: (member: TeamMember) => void;
  onDeleteMember: (memberId: string) => void;
  onCreateMember: () => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

export interface TeamMemberCardProps {
  member: TeamMember;
  onEdit: (member: TeamMember) => void;
  onDelete: (memberId: string) => void;
  variant?: 'full' | 'compact';
  showActions?: boolean;
}

// Modal state interfaces
export interface ModalState {
  isOpen: boolean;
  mode: 'create' | 'edit';
  data?: Record<string, unknown>;
}

// CRUD operations interface
export interface CRUDOperations<T> {
  onCreate: (data: T) => void;
  onUpdate: (id: string, data: T) => void;
  onDelete: (id: string) => void;
}

// Project Details Content Props
export interface ProjectDetailsContentProps {
  projectId: string;
}

// Project Phase interface (aligned with database schema)
export interface ProjectPhase {
  id: string;
  name: string;
  description?: string;
  category: string;
  status: ProjectStatus;
  project_id: string;
  details: Record<string, unknown>;
  timeline: {
    planned_start?: string;
    planned_end?: string;
    actual_start?: string;
    actual_end?: string;
  };
  budget: {
    allocated: number;
    spent: number;
    currency: string;
  };
  created_at: string;
  updated_at: string;
}

// Enhanced Task interface (aligned with database schema)
export interface EnhancedTask {
  id: string;
  project_id: string;
  phase_id?: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  created_by: string;
  assigned_to?: string;
  start_date?: string;
  due_date?: string;
  completed_at?: string;
  completed_by?: string;
  completion_notes?: string;
  dependencies: string[];
  tags: string[];
  comments: Record<string, unknown>[];
  created_at: string;
  updated_at: string;
}

// Priority and Status option types
export interface SelectOption {
  value: string;
  label: string;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'blocked' | 'cancelled';
// For compatibility, re-export the centralized DB phase status as PhaseStatus
export type PhaseStatus = ProjectStatus;

// New interface for PhaseTimelineCard component
export interface PhaseTimelineCardProps {
  phases: ProjectPhase[];
  expandedPhases: Record<string, boolean>;
  onTogglePhase: (phaseId: string) => void;
  onEditPhase: (phase: ProjectPhase) => void;
  onDeletePhase: (phaseId: string) => void;
  onCreateTask: (phaseId: string) => void;
  onEditTask: (task: EnhancedTask, phaseId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenCreateModal: (type: 'phase') => void;
}

// New interface for PhaseTasksSection component
export interface PhaseTasksSectionProps {
  phase: ProjectPhase;
  tasks: EnhancedTask[];
  isLoading: boolean;
  onCreateTask: (phaseId: string) => void;
  onEditTask: (task: EnhancedTask, phaseId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

// Form Data interfaces for standardized CRUD forms
export interface BudgetFormData {
  transaction_type: TransactionType;
  amount: number;
  currency: Currency;
  description?: string;
  category: string;
  payment_date?: string;
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod;
  phase_id?: string;
}

export interface PhaseFormData {
  name: string;
  category: string;
  description: string;
  startDate: string;
  endDate: string;
  status?: PhaseStatus; // only used in edit mode to allow changing phase status
  actualStart?: string | null; // optional manual actual start date (ISO yyyy-mm-dd)
  actualEnd?: string | null;   // optional manual actual end date (ISO yyyy-mm-dd)
}

export interface TeamMemberFormData {
  name: string;
  role: string;
  status: 'active' | 'on-break' | 'off-site';
  phone?: string;
  email?: string;
}

// Form Props interfaces
export interface BudgetExpenseFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<BudgetFormData>;
  onSubmit: (data: BudgetFormData) => Promise<void>;
  isLoading?: boolean;
}

export interface PhaseFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<PhaseFormData>;
  projectType?: string;
  projectId: string;
  onSubmit: (data: PhaseFormData, selectedTasks?: string[]) => Promise<void>;
  isLoading?: boolean;
}

export interface TeamMemberFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<TeamMemberFormData>;
  onSubmit: (data: TeamMemberFormData) => Promise<void>;
  isLoading?: boolean;
}

// Form Modal wrapper interface
export interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

// Form validation errors interface
export interface FormErrors {
  [key: string]: string;
}