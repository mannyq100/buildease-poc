import type { Project } from '@/types/project';
import type { ProjectPhase, TeamMember as DetailsTeamMember, PaymentMethod, PaymentStatus, TransactionType } from '@/types/projectDetails';

export interface OwnerInfo {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface CategoryTotals {
  material_costs: number;
  labor_costs: number;
  equipment_costs: number;
  permit_costs: number;
  design_costs: number;
  other_costs: number;
}

export interface ConsolidatedExpense {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  amount: number;
  base_amount: number;
  currency: string;
  base_currency?: string;
  exchange_rate?: number;
  category: string;
  payment_status: PaymentStatus | string;
  payment_date?: string;
  payment_method?: PaymentMethod | string;
  transaction_type: TransactionType | string;
  reference_number?: string;
  notes?: string;
  details: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  created_by: string;
  phase_id?: string;
  receipt_url?: string;
}

// Single, comprehensive shape returned by useProjectData
// Base project fields from Project, but replace conflicting collections
type BaseProjectForConsolidated = Omit<Project, 'phases' | 'teamMembers' | 'activities'>;

export type ConsolidatedProjectData = BaseProjectForConsolidated & {
  // Calculated/summary financials
  remainingBudget: number; // budget - spent
  utilization: number; // 0-100 percentage (spent_percentage)
  totalExpenses: number; // sum of expenses (base)
  paidAmount: number;
  pendingAmount: number;
  approvedAmount: number;
  plannedAmount: number;
  categoryTotals: CategoryTotals;
  transactionCount: number;

  // Server-provided aggregate counts from project_summary
  phaseCount: number;
  openTasks: number;
  materialCount: number;
  documentCount: number;
  memberCount: number;

  // Owner info
  owner: OwnerInfo;

  // Detailed collections
  expenses: ConsolidatedExpense[];
  teamMembers: DetailsTeamMember[];
  phases: ProjectPhase[];
};
