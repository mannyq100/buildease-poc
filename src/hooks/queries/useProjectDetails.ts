import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useProjectBudgetExpenses } from '../mutations/useBudget';
import { useProjectTeamMembers } from '../mutations/useTeamMember';
import { useProjectDetailsPhases } from '../mutations/useProjectDetailsPhase';

/**
 * Hook to get comprehensive project details data for ProjectDetails page
 */
export function useProjectDetailsData(projectId: string) {
  // Main project data
  const projectQuery = useQuery({
    queryKey: ['projects', 'detail', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
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

      if (error) throw error;
      return data;
    },
    enabled: !!projectId
  });

  // Budget expenses data
  const budgetQuery = useQuery({
    ...useProjectBudgetExpenses(projectId),
    enabled: !!projectId
  });

  // Team members data
  const teamQuery = useQuery({
    ...useProjectTeamMembers(projectId),
    enabled: !!projectId
  });

  // Timeline/phases data
  const phasesQuery = useQuery({
    ...useProjectDetailsPhases(projectId),
    enabled: !!projectId
  });

  return {
    // Main project data
    project: projectQuery.data,
    isProjectLoading: projectQuery.isLoading,
    projectError: projectQuery.error,

    // Budget data
    budgetExpenses: budgetQuery.data || [],
    isBudgetLoading: budgetQuery.isLoading,
    budgetError: budgetQuery.error,

    // Team data
    teamMembers: teamQuery.data || [],
    isTeamLoading: teamQuery.isLoading,
    teamError: teamQuery.error,

    // Timeline/phases data
    phases: phasesQuery.data || [],
    isPhasesLoading: phasesQuery.isLoading,
    phasesError: phasesQuery.error,

    // Combined loading and error states
    isLoading: projectQuery.isLoading || budgetQuery.isLoading || teamQuery.isLoading || phasesQuery.isLoading,
    error: projectQuery.error || budgetQuery.error || teamQuery.error || phasesQuery.error,

    // Refetch functions
    refetchProject: projectQuery.refetch,
    refetchBudget: budgetQuery.refetch,
    refetchTeam: teamQuery.refetch,
    refetchPhases: phasesQuery.refetch,
    refetchAll: () => {
      projectQuery.refetch();
      budgetQuery.refetch();
      teamQuery.refetch();
      phasesQuery.refetch();
    }
  };
}

/**
 * Hook to get project budget summary
 */
export function useProjectBudgetSummary(projectId: string) {
  return useQuery({
    queryKey: ['budget-summary', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_transaction')
        .select('amount, payment_status, category')
        .eq('project_id', projectId)
        .eq('transaction_type', 'OTHER');

      if (error) throw error;

      // Calculate budget summary
      const totalBudget = data.reduce((sum, expense) => sum + expense.amount, 0);
      const spentAmount = data
        .filter(expense => expense.payment_status === 'PAID')
        .reduce((sum, expense) => sum + expense.amount, 0);
      const pendingAmount = data
        .filter(expense => expense.payment_status === 'PENDING')
        .reduce((sum, expense) => sum + expense.amount, 0);
      const plannedAmount = data
        .filter(expense => expense.payment_status === 'PLANNED')
        .reduce((sum, expense) => sum + expense.amount, 0);

      // Category breakdown
      const categoryBreakdown = data.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalBudget,
        spentAmount,
        pendingAmount,
        plannedAmount,
        remainingBudget: totalBudget - spentAmount,
        categoryBreakdown,
        expenseCount: data.length
      };
    },
    enabled: !!projectId
  });
}

/**
 * Hook to get project timeline summary
 */
export function useProjectTimelineSummary(projectId: string) {
  return useQuery({
    queryKey: ['timeline-summary', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('be_phase')
        .select('id, status, timeline, name')
        .eq('project_id', projectId);

      if (error) throw error;

      const totalPhases = data.length;
      const completedPhases = data.filter(phase => phase.status === 'COMPLETED').length;
      const inProgressPhases = data.filter(phase => phase.status === 'IN_PROGRESS').length;
      const pendingPhases = data.filter(phase => phase.status === 'PLANNING').length;

      // Calculate overall progress
      const overallProgress = totalPhases > 0 ? (completedPhases / totalPhases) * 100 : 0;

      // Find current phase (first in-progress or pending phase)
      const currentPhase = data.find(phase => 
        phase.status === 'IN_PROGRESS' || phase.status === 'PLANNING'
      );

      // Calculate project timeline
      const startDates = data
        .map(phase => phase.timeline?.planned_start)
        .filter(Boolean)
        .sort();
      const endDates = data
        .map(phase => phase.timeline?.planned_end)
        .filter(Boolean)
        .sort();

      const projectStartDate = startDates[0];
      const projectEndDate = endDates[endDates.length - 1];

      return {
        totalPhases,
        completedPhases,
        inProgressPhases,
        pendingPhases,
        overallProgress,
        currentPhase: currentPhase ? {
          id: currentPhase.id,
          name: currentPhase.name,
          status: currentPhase.status
        } : null,
        projectStartDate,
        projectEndDate,
        phases: data.map(phase => ({
          id: phase.id,
          name: phase.name,
          status: phase.status,
          startDate: phase.timeline?.planned_start,
          endDate: phase.timeline?.planned_end
        }))
      };
    },
    enabled: !!projectId
  });
}

/**
 * Hook to get project team summary
 */
export function useProjectTeamSummary(projectId: string) {
  return useQuery({
    queryKey: ['team-summary', projectId],
    queryFn: async () => {
      // Get registered team members
      const { data: registeredMembers } = await supabase
        .from('be_project_member')
        .select(`
          role,
          user:be_user!user_id(
            id,
            first_name,
            last_name
          )
        `)
        .eq('project_id', projectId);

      // Get team members from project details
      const { data: project } = await supabase
        .from('be_project')
        .select('details')
        .eq('id', projectId)
        .single();

      const detailsMembers = project?.details?.team_members || [];
      const allMembers = [...(registeredMembers || []), ...detailsMembers];

      // Calculate role distribution
      const roleDistribution = allMembers.reduce((acc, member) => {
        const role = member.role || 'Unknown';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const totalMembers = allMembers.length;
      const activeMembers = allMembers.filter(member => 
        member.status !== 'inactive'
      ).length;

      return {
        totalMembers,
        activeMembers,
        roleDistribution,
        members: allMembers.slice(0, 6) // First 6 for preview
      };
    },
    enabled: !!projectId
  });
}
