/**
 * Project Data Hook
 * Replaces multiple separate queries with a single comprehensive query
 * Addresses Sprint 2.1: Query Consolidation performance optimization
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { normalizeProjectData } from '@/utils/core/dataNormalization';
import { PhaseStatusDB } from '@/utils/core/phaseStatus';
import { TaskStatusDB } from '@/utils/core/taskStatus';
import type { ConsolidatedProjectData, OwnerInfo } from '@/types/projectData';

// Using shared ConsolidatedProjectData type from '@/types/projectData'

/**
 * Single comprehensive query for all project data
 * Eliminates N+1 queries and improves performance significantly
 */
export function useProjectData(projectId: string) {
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

      // Team members query - use enhanced view with profile pictures
      const [
        { data: registeredMembers, error: teamError1 },
        { data: projectMembersData, error: teamError2 }
      ] = await Promise.all([
        supabase
          .from('project_members')
          .select(`
            user_id,
            user_name,
            email,
            phone,
            role,
            profile_picture_url,
            company_name,
            user_status,
            email_verified,
            phone_verified,
            joined_at
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

      // Use enhanced phase progress view for server-side computations
      const { data: phasesData, error: phasesError } = await supabase
        .from('phase_progress_summary')
        .select(`
          id,
          name,
          description,
          status,
          timeline,
          timeline_status,
          planned_duration_days,
          actual_duration_days,
          start_variance_days,
          end_variance_days,
          budget_allocated,
          budget_spent,
          budget_utilization_percent,
          total_tasks,
          completed_tasks,
          in_progress_tasks,
          pending_tasks,
          overdue_tasks,
          due_today_tasks,
          due_soon_tasks,
          progress_percentage,
          avg_urgency_score,
          priority_level,
          health_status,
          created_at,
          updated_at
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (phasesError) throw phasesError;

      // Get tasks from enhanced priority view for server-side urgency scoring
      const { data: tasksData, error: tasksError } = await supabase
        .from('task_priority_analysis')
        .select(`
          id,
          title,
          description,
          status,
          priority,
          phase_id,
          due_date,
          assigned_to,
          assigned_user_name,
          urgency_score,
          task_status_category,
          assignee_workload_level,
          created_at,
          updated_at
        `)
        .eq('project_id', projectId)
        .order('urgency_score', { ascending: false });

      if (tasksError) throw tasksError;

      // Use pre-calculated data from project_summary view - eliminates redundant calculations
      const projectCurrency = projectSummary.currency || 'USD';
      
      // Use base_amount for consistency, fallback to amount if base_amount is null
      const getTransactionAmount = (expense: {
        base_amount?: number;
        amount: number;
      }) => {
        return expense.base_amount || expense.amount || 0;
      };
      

      // Unified team member normalization function
      const normalizeTeamMember = (member: Record<string, unknown>, index: number, isRegistered: boolean) => {
        const memberStatus = member.status || 'active';
        const validStatus = ['active', 'on-break', 'off-site'].includes(memberStatus) 
          ? memberStatus as 'active' | 'on-break' | 'off-site'
          : 'active' as const;

        return {
          id: (member.user_id as string) || (member.id as string) || `${isRegistered ? 'reg' : 'detail'}-${index}`,
          user_id: member.user_id as string,
          name: (member.user_name as string) || (member.name as string) || 'Unknown',
          role: (member.role as string) || 'Unknown',
          email: (member.email as string) || ((member.contactInfo as Record<string, unknown>)?.email as string),
          phone: (member.phone as string) || ((member.contactInfo as Record<string, unknown>)?.phone as string),
          profile_picture_url: (member.profile_picture_url as string) || (member.avatar as string),
          company_name: member.company_name as string,
          user_status: member.user_status as string,
          email_verified: member.email_verified as boolean,
          phone_verified: member.phone_verified as boolean,
          joined_at: member.joined_at as string,
          status: validStatus
        };
      };

      // Normalize all team members using unified function
      const detailsMembers = projectMembersData?.details?.team_members || [];
      const allTeamMembers = [
        ...(registeredMembers?.map((member: Record<string, unknown>, index: number) => normalizeTeamMember(member, index, true)) || []),
        ...detailsMembers.map((member: Record<string, unknown>, index: number) => normalizeTeamMember(member, index, false))
      ];

      // Group tasks by phase for normalized structure
      const tasksByPhase = tasksData?.reduce((acc, task) => {
        const phaseId = task.phase_id;
        if (!acc[phaseId]) acc[phaseId] = [];
        acc[phaseId].push(task);
        return acc;
      }, {} as Record<string, (typeof tasksData)[number][]>) || {};

      // Normalize phases with pre-calculated data from enhanced views
      const normalizedPhases = phasesData?.map(phase => {
        // Use server-side calculated data instead of client normalization
        const phaseTasks = tasksByPhase[phase.id] || [];
        
        // Map enhanced task data to EnhancedTask interface
        const enhancedTasks = phaseTasks.map(task => ({
          id: task.id,
          project_id: projectId,
          phase_id: task.phase_id || phase.id,
          title: task.title,
          description: task.description || '',
          status: task.status as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED' | 'CANCELLED',
          priority: task.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
          created_by: '', // Not available in current task_priority_analysis view
          assigned_to: task.assigned_to,
          start_date: undefined, // Not available in current task_priority_analysis view  
          due_date: task.due_date,
          completed_at: undefined, // Not available in current task_priority_analysis view
          completed_by: undefined,
          completion_notes: undefined,
          dependencies: [], // Task dependencies not implemented yet
          tags: [], // Task tagging not implemented yet
          comments: [], // Task comments loaded separately when needed
          created_at: task.created_at,
          updated_at: task.updated_at,
          // Server-calculated optimization fields
          assigned_user_name: task.assigned_user_name,
          urgency_score: task.urgency_score,
          task_status_category: task.task_status_category,
          assignee_workload_level: task.assignee_workload_level
        }));
        
        return {
          id: phase.id,
          name: phase.name,
          description: phase.description || '',
          category: 'CONSTRUCTION',
          status: phase.status,
          project_id: projectId,
          details: {}, // Phase details not implemented in current schema
          timeline: phase.timeline || {},
          budget: {
            allocated: phase.budget_allocated || 0,
            spent: phase.budget_spent || 0,
            currency: projectCurrency
          },
          created_at: phase.created_at,
          updated_at: phase.updated_at,
          tasks: enhancedTasks,
          // Server-calculated optimization fields (NEW)
          timeline_status: phase.timeline_status,
          planned_duration_days: phase.planned_duration_days,
          actual_duration_days: phase.actual_duration_days,
          start_variance_days: phase.start_variance_days,
          end_variance_days: phase.end_variance_days,
          budget_utilization_percent: phase.budget_utilization_percent,
          total_tasks: phase.total_tasks,
          completed_tasks: phase.completed_tasks,
          in_progress_tasks: phase.in_progress_tasks,
          pending_tasks: phase.pending_tasks,
          overdue_tasks: phase.overdue_tasks,
          due_today_tasks: phase.due_today_tasks,
          due_soon_tasks: phase.due_soon_tasks,
          progress_percentage: phase.progress_percentage,
          avg_urgency_score: phase.avg_urgency_score,
          priority_level: phase.priority_level,
          health_status: phase.health_status
        };
      }) || [];

      // Simplified owner extraction
      const ownerInfo: OwnerInfo = {
        id: projectData.owner?.id || '',
        first_name: projectData.owner?.first_name || '',
        last_name: projectData.owner?.last_name || '',
        email: projectData.owner?.email || ''
      };

      // Streamlined consolidated data structure - use project_summary as primary source
      const consolidatedData: ConsolidatedProjectData = {
        // Core project fields from project_summary view
        id: projectSummary.id,
        name: projectSummary.name,
        description: projectSummary.description,
        status: projectSummary.status,
        progress: projectSummary.progress,
        health: projectSummary.health,
        start_date: projectSummary.start_date,
        end_date: projectSummary.end_date,
        location: projectSummary.location || projectData.location,
        client: projectSummary.client || projectData.client,
        project_type: projectSummary.project_type || projectData.project_type,
        created_at: projectSummary.created_at,
        updated_at: projectSummary.updated_at,
        owner_id: projectSummary.owner_id,
        
        // Financial data from project_summary (pre-calculated)
        budget: projectSummary.budget || 0,
        spent: projectSummary.spent || 0,
        currency: projectCurrency,
        remainingBudget: (projectSummary.budget || 0) - (projectSummary.spent || 0),
        utilization: projectSummary.spent_percentage || 0,
        
        // Calculate client-side financial breakdowns (only when needed for UI filtering)
        totalExpenses: expensesData?.reduce((sum, expense) => sum + getTransactionAmount(expense), 0) || 0,
        paidAmount: expensesData?.filter(e => e.payment_status === 'PAID').reduce((sum, e) => sum + getTransactionAmount(e), 0) || 0,
        pendingAmount: expensesData?.filter(e => e.payment_status === 'PENDING').reduce((sum, e) => sum + getTransactionAmount(e), 0) || 0,
        approvedAmount: expensesData?.filter(e => e.payment_status === 'APPROVED').reduce((sum, e) => sum + getTransactionAmount(e), 0) || 0,
        plannedAmount: expensesData?.filter(e => e.payment_status === 'PLANNED').reduce((sum, e) => sum + getTransactionAmount(e), 0) || 0,
        
        // Category totals from financial summary
        categoryTotals: {
          material_costs: financialSummary.material_costs || 0,
          labor_costs: financialSummary.labor_costs || 0,
          equipment_costs: financialSummary.equipment_costs || 0,
          permit_costs: financialSummary.permit_costs || 0,
          design_costs: financialSummary.design_costs || 0,
          other_costs: financialSummary.other_costs || 0
        },
        
        // Server-provided aggregate counts from project_summary view
        transactionCount: projectSummary.transactions || 0,
        phaseCount: projectSummary.phases || 0,
        openTasks: projectSummary.open_tasks || 0,
        materialCount: projectSummary.materials || 0,
        documentCount: projectSummary.documents || 0,
        memberCount: projectSummary.members || 0,
        
        // Simplified owner info
        owner: ownerInfo,
        
        // Streamlined collections
        expenses: expensesData?.map(expense => ({
          ...expense,
          project_id: projectId,
          created_by: '' // Add required field
        })) || [],
        
        teamMembers: allTeamMembers,
        phases: normalizedPhases,
        
        // Add missing required fields for BaseProjectForConsolidated compatibility
        spent_percentage: projectSummary.spent_percentage || 0,
        remaining: (projectSummary.budget || 0) - (projectSummary.spent || 0),
        owner_name: `${ownerInfo.first_name} ${ownerInfo.last_name}`.trim() || 'Unknown',
        materials: 0, // Count of materials
        documents: 0, // Count of documents 
        members: allTeamMembers.length, // Count of members
        transactions: expensesData?.length || 0, // Count of transactions
        tags: [], // Project tags array
        timeline: projectData.timeline || {}
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
  const { data, ...rest } = useProjectData(projectId);
  
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
      active: data.teamMembers.filter(m => m.status === 'active').length,
      roles: data.teamMembers.reduce((acc: Record<string, number>, member) => {
        acc[member.role] = (acc[member.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    },
    
    // Phase metrics
    phases: {
      total: data.phases.length,
      completed: data.phases.filter(p => p.status === PhaseStatusDB.COMPLETED).length,
      inProgress: data.phases.filter(p => p.status === PhaseStatusDB.IN_PROGRESS).length,
      pending: data.phases.filter(p => p.status === PhaseStatusDB.PLANNING).length,
      overallProgress: data.phases.filter(p => p.status === PhaseStatusDB.COMPLETED).length / Math.max(data.phases.length, 1) * 100
    },
    
    // Task metrics (aggregated across all phases)
    tasksByPhase: data.phases.reduce((acc: Record<string, { completed: number; inProgress: number; pending: number }>, phase) => {
      const tasks = phase.tasks || [];
      const completed = tasks.filter(t => t.status === TaskStatusDB.COMPLETED).length;
      const inProgress = tasks.filter(t => t.status === TaskStatusDB.IN_PROGRESS).length;
      const pending = tasks.filter(t => t.status === TaskStatusDB.PENDING).length;
      acc[phase.name] = { completed, inProgress, pending };
      return acc;
    }, {})
  } : undefined;
  
  return {
    ...rest,
    data: derivedData
  };
}