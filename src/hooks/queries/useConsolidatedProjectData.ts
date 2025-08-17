/**
 * Consolidated Project Data Hook
 * Replaces multiple separate queries with a single comprehensive query
 * Addresses Sprint 2.1: Query Consolidation performance optimization
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ProjectTransformService } from '@/services/projectTransformService';
import { normalizeProjectData, normalizePhaseData } from '@/utils/core/dataNormalization';

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
  owner: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  
  // Financial data
  expenses: Array<{
    id: string;
    amount: number;
    currency: string;
    description?: string;
    category: string;
    payment_status: string;
    payment_date?: string;
    transaction_type: string;
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
      console.time('ConsolidatedQuery');
      
      // Single comprehensive query with all joins
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

      // Financial transactions query
      const { data: expensesData, error: expensesError } = await supabase
        .from('financial_transaction')
        .select(`
          id,
          amount,
          base_amount,
          currency,
          description,
          category,
          payment_status,
          payment_date,
          transaction_type,
          details,
          created_at
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

      console.timeEnd('ConsolidatedQuery');

      // Calculate budget summary from actual financial data
      const totalBudget = expensesData?.reduce((sum, expense) => 
        sum + (expense.base_amount || expense.amount), 0) || 0;
      const spentAmount = expensesData
        ?.filter(expense => expense.payment_status === 'PAID' || expense.payment_status === 'COMPLETED')
        ?.reduce((sum, expense) => sum + (expense.base_amount || expense.amount), 0) || 0;

      // Normalize team members data
      const detailsMembers = projectMembersData?.details?.team_members || [];
      const normalizedRegisteredMembers = registeredMembers?.map((member, index) => ({
        id: `registered-${member.user?.id || index}`, // Use user ID or index as fallback
        name: member.user ? `${member.user.first_name} ${member.user.last_name}`.trim() : 'Unknown',
        role: member.role,
        email: member.user?.email,
        phone: undefined,
        status: 'active' // Default status for registered members
      })) || [];
      
      const normalizedDetailsMembers = detailsMembers.map((member: any, index: number) => ({
        id: `detail-${index}`,
        name: member.name || 'Unknown',
        role: member.role || 'Unknown',
        email: member.contactInfo?.email,
        phone: member.contactInfo?.phone,
        status: member.status
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
        budget: totalBudget || transformedProject.budget,
        spent: spentAmount,
        
        expenses: expensesData?.map(expense => ({
          id: expense.id,
          amount: expense.amount,
          currency: expense.currency,
          description: expense.description,
          category: expense.category,
          payment_status: expense.payment_status,
          payment_date: expense.payment_date,
          transaction_type: expense.transaction_type
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
 * Derived data hooks for backwards compatibility
 * These extract specific data from the consolidated query
 */
export function useConsolidatedProjectBudget(projectId: string) {
  const { data, ...rest } = useConsolidatedProjectData(projectId);
  
  return {
    ...rest,
    data: data ? {
      expenses: data.expenses,
      totalBudget: data.budget,
      spentAmount: data.spent,
      remainingBudget: data.budget - data.spent,
      currency: data.currency
    } : undefined
  };
}

export function useConsolidatedProjectTeam(projectId: string) {
  const { data, ...rest } = useConsolidatedProjectData(projectId);
  
  return {
    ...rest,
    data: data?.teamMembers || []
  };
}

export function useConsolidatedProjectPhases(projectId: string) {
  const { data, ...rest } = useConsolidatedProjectData(projectId);
  
  return {
    ...rest,
    data: data?.phases || []
  };
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
      remaining: data.budget - data.spent,
      utilization: data.budget > 0 ? (data.spent / data.budget) * 100 : 0,
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
      completed: data.phases.filter(p => p.status === 'completed').length,
      inProgress: data.phases.filter(p => p.status === 'in-progress').length,
      pending: data.phases.filter(p => p.status === 'pending').length,
      overallProgress: data.phases.length > 0 ? 
        (data.phases.filter(p => p.status === 'completed').length / data.phases.length) * 100 : 0
    },
    
    // Task metrics (aggregated across all phases)
    tasks: data.phases.reduce((acc, phase) => {
      acc.total += phase.tasks.length;
      acc.completed += phase.tasks.filter(t => t.status === 'completed').length;
      acc.inProgress += phase.tasks.filter(t => t.status === 'in-progress').length;
      acc.pending += phase.tasks.filter(t => t.status === 'pending').length;
      return acc;
    }, { total: 0, completed: 0, inProgress: 0, pending: 0 })
  } : undefined;
  
  return {
    ...rest,
    data: derivedData
  };
}