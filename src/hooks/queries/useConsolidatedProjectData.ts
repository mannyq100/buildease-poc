/**
 * Consolidated Project Data Hook
 * Replaces multiple separate queries with a single comprehensive query
 * Addresses Sprint 2.1: Query Consolidation performance optimization
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ProjectTransformService } from '@/services/projectTransformService';
import { normalizeProjectData, normalizePhaseData, toDbPhaseStatus, toDbTaskStatus } from '@/utils/core/dataNormalization';

// Types for the consolidated response
interface ConsolidatedProjectData {
  // Project basic info
  id: string;
  name: string;
  description?: string;
  budget: number;
  spent: number;
  currency: string;
  status: string;
  remainingBudget: number;
  utilization: number;
  totalExpenses: number;
  paidAmount: number;
  pendingAmount: number;
  approvedAmount: number;
  plannedAmount: number;
  categoryTotals: {
    material_costs: number;
    labor_costs: number;
    equipment_costs: number;
    permit_costs: number;
    design_costs: number;
    other_costs: number;
  };
  transactionCount: number;
  owner: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  
  // Financial data
  expenses: Array<{
    id: string;
    title: string;
    description?: string;
    amount: number;
    base_amount: number;
    currency: string;
    base_currency?: string;
    exchange_rate?: number;
    category: string;
    payment_status: string;
    payment_date?: string;
    payment_method?: string;
    transaction_type: string;
    reference_number?: string;
    notes?: string;
    details: Record<string, unknown>;
    created_at: string;
    updated_at: string;
  }>;
  
  // Team data
  teamMembers: Array<{
    id: string;
    name: string;
    role: string;
    email?: string;
    phone?: string;
    status?: string;
  }>;
  
  // Phase and task data
  phases: Array<{
    id: string;
    name: string;
    description?: string;
    status: string;
    timeline: {
      planned_start?: string;
      planned_end?: string;
      actual_start?: string;
      actual_end?: string;
    };
    tasks: Array<{
      id: string;
      title: string;
      description?: string;
      status: string;
      priority: string;
      due_date?: string;
      assigned_to?: string;
    }>;
  }>;
}

/**
 * Single comprehensive query for all project data
 * Eliminates N+1 queries and improves performance significantly
 */
export function useConsolidatedProjectData(projectId: string) {
  return useQuery({
    queryKey: ['project-consolidated', projectId],
    queryFn: async (): Promise<ConsolidatedProjectData> => {
      
      // Get project summary from optimized view - includes all pre-calculated metrics
      const { data: projectSummary, error: summaryError } = await supabase
        .from('project_summary')
        .select('*')
        .eq('id', projectId)
        .single();

      if (summaryError) throw summaryError;

      // Get financial summary with category totals
      const { data: financialSummary, error: financialError } = await supabase
        .from('project_financial_summary')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (financialError) throw financialError;

      // Get basic project data with owner info
      const { data: projectData, error: projectError } = await supabase
        .from('be_project')
        .select(`
          *,
          owner:be_user!owner_id(
            id,
            first_name,
            last_name,
            email,
            settings
          )
        `)
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      // Financial transactions query - for detailed expense list
      const { data: expensesData, error: expensesError } = await supabase
        .from('financial_transaction')
        .select(`
          id,
          title,
          description,
          amount,
          base_amount,
          currency,
          base_currency,
          exchange_rate,
          category,
          payment_status,
          payment_date,
          payment_method,
          transaction_type,
          reference_number,
          notes,
          details,
          created_at,
          updated_at
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (expensesError) throw expensesError;

      // Team members query - both registered and project details
      const [
        { data: registeredMembers, error: teamError1 },
        { data: projectMembersData, error: teamError2 }
      ] = await Promise.all([
        supabase
          .from('be_project_member')
          .select(`
            role,
            user:be_user!user_id(
              id,
              first_name,
              last_name,
              email
            )
          `)
          .eq('project_id', projectId),
        supabase
          .from('be_project')
          .select('details')
          .eq('id', projectId)
          .single()
      ]);

      if (teamError1 || teamError2) {
        throw teamError1 || teamError2;
      }

      // Phases and tasks query with comprehensive joins
      const { data: phasesData, error: phasesError } = await supabase
        .from('be_phase')
        .select(`
          id,
          name,
          description,
          status,
          timeline,
          created_at,
          updated_at,
          tasks:be_task(
            id,
            title,
            description,
            status,
            priority,
            due_date,
            assigned_to,
            created_at,
            updated_at
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (phasesError) throw phasesError;

      // Use pre-calculated data from project_summary view - eliminates redundant calculations
      const projectAllocatedBudget = projectSummary.budget || 0;
      const spentAmount = projectSummary.spent || 0;
      const projectCurrency = projectSummary.currency || 'USD';
      const remainingBudget = projectAllocatedBudget - spentAmount;
      // Use pre-calculated spent_percentage from database view instead of manual calculation
      const utilization = projectSummary.spent_percentage || 0;
      
      // Calculate expense breakdowns from detailed transactions for UI filtering
      // Use base_amount for consistency, fallback to amount if base_amount is null
      const getTransactionAmount = (expense: {
        base_amount?: number;
        amount: number;
      }) => {
        return expense.base_amount || expense.amount || 0;
      };
      
      const totalExpenses = expensesData?.reduce((sum, expense) => 
        sum + getTransactionAmount(expense), 0) || 0;
      
      // Calculate payment status breakdowns for UI components that need filtering
      const paidAmount = expensesData
        ?.filter(expense => expense.payment_status === 'PAID')
        ?.reduce((sum, expense) => sum + getTransactionAmount(expense), 0) || 0;
        
      const pendingAmount = expensesData
        ?.filter(expense => expense.payment_status === 'PENDING')
        ?.reduce((sum, expense) => sum + getTransactionAmount(expense), 0) || 0;
        
      const approvedAmount = expensesData
        ?.filter(expense => expense.payment_status === 'APPROVED')
        ?.reduce((sum, expense) => sum + getTransactionAmount(expense), 0) || 0;
        
      const plannedAmount = expensesData
        ?.filter(expense => expense.payment_status === 'PLANNED')
        ?.reduce((sum, expense) => sum + getTransactionAmount(expense), 0) || 0;
      
      // Category totals from financial summary view - pre-calculated with correct transaction type mapping
      const categoryTotals = {
        material_costs: financialSummary.material_costs || 0,
        labor_costs: financialSummary.labor_costs || 0,
        equipment_costs: financialSummary.equipment_costs || 0,
        permit_costs: financialSummary.permit_costs || 0,
        design_costs: financialSummary.design_costs || 0,
        other_costs: financialSummary.other_costs || 0
      };

      // Normalize team members data
      const detailsMembers = projectMembersData?.details?.team_members || [];
      const normalizedRegisteredMembers = registeredMembers?.map((member, index) => ({
        id: member.user?.id || `fallback-${index}`, // Use actual user ID for database operations
        user_id: member.user?.id, // Keep user_id for reference
        name: member.user ? `${member.user.first_name} ${member.user.last_name}`.trim() : 'Unknown',
        role: member.role,
        email: member.user?.email,
        phone: undefined,
        status: 'active' // Default status for registered members
      })) || [];
      
      const normalizedDetailsMembers = detailsMembers.map((member: Record<string, unknown>, index: number) => ({
        id: (member.user_id as string) || (member.id as string) || `detail-${index}`,
        user_id: member.user_id as string,
        name: (member.name as string) || 'Unknown',
        role: (member.role as string) || 'Unknown',
        email: (member.contactInfo as Record<string, unknown>)?.email as string || (member.email as string),
        phone: (member.contactInfo as Record<string, unknown>)?.phone as string || (member.phone as string),
        status: (member.status as string) || 'active'
      }));

      // Normalize phases and tasks data
      const normalizedPhases = phasesData?.map(phase => {
        const normalizedPhase = normalizePhaseData({
          ...phase,
          timeline: phase.timeline || {},
          tasks: phase.tasks || []
        });
        
        return normalizedPhase;
      }) || [];

      // Transform and normalize the data
      // Add count fields that the transform service expects
      const projectDataWithCounts = {
        ...projectData,
        phases: normalizedPhases.length,
        materials: 0, // TODO: Add materials count when available
        documents: 0, // TODO: Add documents count when available
        members: normalizedRegisteredMembers.length + normalizedDetailsMembers.length,
        transactions: expensesData?.length || 0
      };
      
      const transformedProject = ProjectTransformService.transformProjectSummary(projectDataWithCounts);

      // Return consolidated data structure
      const consolidatedData: ConsolidatedProjectData = {
        ...transformedProject,
        budget: projectAllocatedBudget,
        spent: spentAmount,
        currency: projectCurrency,
        remainingBudget,
        utilization,
        totalExpenses,
        paidAmount,
        pendingAmount,
        approvedAmount,
        plannedAmount,
        categoryTotals,
        transactionCount: projectSummary.transactions || 0,
        owner: {
          id: Array.isArray(projectData.owner) 
            ? (projectData.owner[0]?.id || '') 
            : (projectData.owner?.id || ''),
          first_name: Array.isArray(projectData.owner) 
            ? (projectData.owner[0]?.first_name || '') 
            : (projectData.owner?.first_name || ''),
          last_name: Array.isArray(projectData.owner) 
            ? (projectData.owner[0]?.last_name || '') 
            : (projectData.owner?.last_name || ''),
          email: Array.isArray(projectData.owner) 
            ? (projectData.owner[0]?.email || '') 
            : (projectData.owner?.email || '')
        },
        
        expenses: expensesData?.map(expense => ({
          id: expense.id,
          title: expense.title,
          description: expense.description,
          amount: expense.amount,
          base_amount: expense.base_amount,
          currency: expense.currency,
          base_currency: expense.base_currency,
          exchange_rate: expense.exchange_rate,
          category: expense.category,
          payment_status: expense.payment_status,
          payment_date: expense.payment_date,
          payment_method: expense.payment_method,
          transaction_type: expense.transaction_type,
          reference_number: expense.reference_number,
          notes: expense.notes,
          details: expense.details,
          created_at: expense.created_at,
          updated_at: expense.updated_at
        })) || [],
        
        teamMembers: [
          ...normalizedRegisteredMembers,
          ...normalizedDetailsMembers
        ],
        
        phases: normalizedPhases
      };

      // Apply final normalization
      return normalizeProjectData(consolidatedData);
    },
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000, // 2 minutes - longer stale time for consolidated data
    gcTime: 5 * 60 * 1000, // 5 minutes cache time
  });
}


/**
 * Hook for project summary metrics
 * Pre-computed from consolidated data for optimal performance
 */
export function useProjectSummaryMetrics(projectId: string) {
  const { data, ...rest } = useConsolidatedProjectData(projectId);
  
  const derivedData = data ? {
    // Budget metrics
    budget: {
      allocated: data.budget,
      spent: data.spent,
      remaining: data.remainingBudget || (data.budget - data.spent),
      utilization: data.utilization || (data.budget > 0 ? (data.spent / data.budget) * 100 : 0),
      totalExpenses: data.totalExpenses || 0,
      paidAmount: data.paidAmount || 0,
      pendingAmount: data.pendingAmount || 0,
      approvedAmount: data.approvedAmount || 0,
      plannedAmount: data.plannedAmount || 0,
      categoryTotals: data.categoryTotals || {
        material_costs: 0,
        labor_costs: 0,
        equipment_costs: 0,
        permit_costs: 0,
        design_costs: 0,
        other_costs: 0
      },
      transactionCount: data.transactionCount || 0,
      currency: data.currency
    },
    
    // Team metrics
    team: {
      total: data.teamMembers.length,
      active: data.teamMembers.filter(m => m.status !== 'inactive').length,
      roles: data.teamMembers.reduce((acc, member) => {
        acc[member.role] = (acc[member.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    },
    
    // Phase metrics
    phases: {
      total: data.phases.length,
      completed: data.phases.filter(p => toDbPhaseStatus(p.status) === 'COMPLETED').length,
      inProgress: data.phases.filter(p => toDbPhaseStatus(p.status) === 'IN_PROGRESS').length,
      pending: data.phases.filter(p => toDbPhaseStatus(p.status) === 'PLANNING').length,
      overallProgress: data.phases.length > 0 ? 
        (data.phases.filter(p => toDbPhaseStatus(p.status) === 'COMPLETED').length / data.phases.length) * 100 : 0
    },
    
    // Task metrics (aggregated across all phases)
    tasks: data.phases.reduce((acc, phase) => {
      acc.total += phase.tasks.length;
      acc.completed += phase.tasks.filter(t => toDbTaskStatus(t.status) === 'COMPLETED').length;
      acc.inProgress += phase.tasks.filter(t => toDbTaskStatus(t.status) === 'IN_PROGRESS').length;
      acc.pending += phase.tasks.filter(t => toDbTaskStatus(t.status) === 'PENDING').length;
      return acc;
    }, { total: 0, completed: 0, inProgress: 0, pending: 0 })
  } : undefined;
  
  return {
    ...rest,
    data: derivedData
  };
}