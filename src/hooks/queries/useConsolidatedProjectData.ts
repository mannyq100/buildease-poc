/**
 * Consolidated Project Data Hook
 * Replaces multiple separate queries with a single comprehensive query
 * Addresses Sprint 2.1: Query Consolidation performance optimization
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ProjectTransformService } from '@/services/projectTransformService';
import { normalizeProjectData, toDbPhaseStatus, toDbTaskStatus } from '@/utils/core/dataNormalization';
import type { ConsolidatedProjectData } from '@/types/consolidatedProject';

// Using shared ConsolidatedProjectData type from '@/types/consolidatedProject'

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

      // Normalize team members data using enhanced project_members view
      const detailsMembers = projectMembersData?.details?.team_members || [];
      const normalizedRegisteredMembers = registeredMembers?.map((member, index) => ({
        id: member.user_id || `fallback-${index}`, // Use actual user ID for database operations
        user_id: member.user_id, // Keep user_id for reference
        name: member.user_name || 'Unknown',
        role: member.role,
        email: member.email,
        phone: member.phone,
        // NEW: Profile picture from enhanced view
        avatar: member.profile_picture_url,
        profile_picture_url: member.profile_picture_url,
        // Additional fields from enhanced view
        company_name: member.company_name,
        user_status: member.user_status,
        email_verified: member.email_verified,
        phone_verified: member.phone_verified,
        joined_at: member.joined_at,
        status: 'active' as const // Default status for registered members
      })) || [];
      
      const normalizedDetailsMembers = detailsMembers.map((member: Record<string, unknown>, index: number) => {
        const memberStatus = (member.status as string) || 'active';
        const validStatus = ['active', 'on-break', 'off-site'].includes(memberStatus) 
          ? memberStatus as 'active' | 'on-break' | 'off-site'
          : 'active' as const;
        
        return {
          id: (member.user_id as string) || (member.id as string) || `detail-${index}`,
          user_id: member.user_id as string,
          name: (member.name as string) || 'Unknown',
          role: (member.role as string) || 'Unknown',
          email: (member.contactInfo as Record<string, unknown>)?.email as string || (member.email as string),
          phone: (member.contactInfo as Record<string, unknown>)?.phone as string || (member.phone as string),
          // Profile picture support for details members (legacy format)
          avatar: (member.avatar as string) || (member.profile_picture_url as string),
          profile_picture_url: (member.profile_picture_url as string) || (member.avatar as string),
          status: validStatus
        };
      });

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
          created_by: '', // TODO: Add from database if available
          assigned_to: task.assigned_to,
          start_date: undefined, // TODO: Add from database if available  
          due_date: task.due_date,
          completed_at: undefined, // TODO: Add from database if available
          completed_by: undefined,
          completion_notes: undefined,
          dependencies: [], // TODO: Add from database if available
          tags: [], // TODO: Add from database if available
          comments: [], // TODO: Add from database if available
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
          details: {}, // TODO: Add from database if available
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
        // Server-provided aggregate counts from project_summary
        phaseCount: projectSummary.phases || 0,
        openTasks: projectSummary.open_tasks || 0,
        materialCount: projectSummary.materials || 0,
        documentCount: projectSummary.documents || 0,
        memberCount: projectSummary.members || 0,
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
          project_id: projectId, // Add required field
          created_by: '', // Add required field (placeholder)
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
      active: data.teamMembers.filter(m => m.status === 'active').length,
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
      const tasks = phase.tasks ?? [];
      acc.total += tasks.length;
      acc.completed += tasks.filter(t => toDbTaskStatus(t.status) === 'COMPLETED').length;
      acc.inProgress += tasks.filter(t => toDbTaskStatus(t.status) === 'IN_PROGRESS').length;
      acc.pending += tasks.filter(t => toDbTaskStatus(t.status) === 'PENDING').length;
      return acc;
    }, { total: 0, completed: 0, inProgress: 0, pending: 0 })
  } : undefined;
  
  return {
    ...rest,
    data: derivedData
  };
}