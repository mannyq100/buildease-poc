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

      // Calculate expense summary from actual financial data
      // IMPORTANT: Use actual project budget allocation, NOT sum of expenses
      const projectAllocatedBudget = projectData.budget || 0;
      const totalExpenses = expensesData?.reduce((sum, expense) => 
        sum + (expense.base_amount || expense.amount), 0) || 0;
      const spentAmount = expensesData
        ?.filter(expense => expense.payment_status === 'PAID' || expense.payment_status === 'COMPLETED')
        ?.reduce((sum, expense) => sum + (expense.base_amount || expense.amount), 0) || 0;
      const pendingAmount = expensesData
        ?.filter(expense => expense.payment_status === 'PENDING')
        ?.reduce((sum, expense) => sum + (expense.base_amount || expense.amount), 0) || 0;
      const approvedAmount = expensesData
        ?.filter(expense => expense.payment_status === 'APPROVED')
        ?.reduce((sum, expense) => sum + (expense.base_amount || expense.amount), 0) || 0;

      // Normalize team members data
      const detailsMembers = projectMembersData?.details?.team_members || [];
      const normalizedRegisteredMembers = registeredMembers?.map((member, index) => ({
        id: member.user_id || member.user?.id || `fallback-${index}`, // Use actual user ID for database operations
        user_id: member.user_id || member.user?.id, // Keep user_id for reference
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
        budget: projectAllocatedBudget || transformedProject.budget,
        spent: spentAmount,
        owner: {
          id: projectData.owner?.id || '',
          name: projectData.owner ? `${projectData.owner.first_name} ${projectData.owner.last_name}`.trim() : 'Unknown',
          email: projectData.owner?.email || ''
        },
        
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