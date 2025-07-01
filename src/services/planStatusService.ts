/**
 * Plan Status Service - Service for managing AI plan status and progress tracking
 * 
 * Provides functionality for:
 * - Tracking plan generation progress
 * - Managing plan versions and status
 * - Handling plan approvals
 * - Real-time status updates
 */

import { supabase } from '@/lib/supabase';
import { 
  AIGeneratedPlan, 
  AIPlanJob, 
  PlanProgress, 
  ProgressStep, 
  ProgressStage,
  AIPlanStatus,
  TABLE_NAMES 
} from '@/types/database';

export interface PlanStatusFilters {
  projectId?: string;
  status?: AIPlanStatus;
  isActive?: boolean;
  isApproved?: boolean;
}

export interface PlanStatusResponse {
  plans: AIGeneratedPlan[];
  total: number;
  activePlan?: AIGeneratedPlan;
}

export interface PlanProgressResponse {
  progress: PlanProgress;
  job: AIPlanJob;
}

export class PlanStatusService {
  
  /**
   * Fetch AI generated plans for a project with optional filtering
   */
  static async fetchPlans(
    projectId: string, 
    filters: PlanStatusFilters = {}
  ): Promise<PlanStatusResponse> {
    try {
      let query = supabase
        .from(TABLE_NAMES.AI_GENERATED_PLANS)
        .select('*')
        .eq('project_id', projectId)
        .order('version_number', { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }
      if (filters.isApproved !== undefined) {
        query = query.eq('is_approved', filters.isApproved);
      }

      const { data: plans, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch plans: ${error.message}`);
      }

      // Find active plan
      const activePlan = plans?.find(plan => plan.is_active) || undefined;

      return {
        plans: plans || [],
        total: plans?.length || 0,
        activePlan
      };
    } catch (error) {
      console.error('Error fetching plans:', error);
      throw error;
    }
  }

  /**
   * Get active plan for a project
   */
  static async getActivePlan(projectId: string): Promise<AIGeneratedPlan | null> {
    try {
      const { data: plan, error } = await supabase
        .from(TABLE_NAMES.AI_GENERATED_PLANS)
        .select('*')
        .eq('project_id', projectId)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw new Error(`Failed to fetch active plan: ${error.message}`);
      }

      return plan || null;
    } catch (error) {
      console.error('Error fetching active plan:', error);
      throw error;
    }
  }

  /**
   * Get plan progress for a specific job
   */
  static async getPlanProgress(jobId: string): Promise<PlanProgressResponse> {
    try {
      // Fetch job details
      const { data: job, error: jobError } = await supabase
        .from(TABLE_NAMES.AI_PLAN_JOBS)
        .select('*')
        .eq('job_id', jobId)
        .single();

      if (jobError) {
        throw new Error(`Failed to fetch job: ${jobError.message}`);
      }

      // Generate progress steps based on job status
      const progress = this.generateProgressFromJob(job);

      return {
        progress,
        job
      };
    } catch (error) {
      console.error('Error fetching plan progress:', error);
      throw error;
    }
  }

  /**
   * Update plan status (approve, reject, etc.)
   */
  static async updatePlanStatus(
    planId: string,
    status: AIPlanStatus,
    approvalNotes?: string,
    approvedBy?: string
  ): Promise<AIGeneratedPlan> {
    try {
      const updates: Partial<AIGeneratedPlan> = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'approved') {
        updates.is_approved = true;
        updates.approved_by = approvedBy;
        updates.approved_at = new Date().toISOString();
      } else if (status === 'rejected') {
        updates.is_approved = false;
      }

      if (approvalNotes) {
        updates.approval_notes = approvalNotes;
      }

      const { data: plan, error } = await supabase
        .from(TABLE_NAMES.AI_GENERATED_PLANS)
        .update(updates)
        .eq('id', planId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update plan status: ${error.message}`);
      }

      return plan;
    } catch (error) {
      console.error('Error updating plan status:', error);
      throw error;
    }
  }

  /**
   * Activate a specific plan version
   */
  static async activatePlan(
    projectId: string,
    versionNumber: number,
    userId: string
  ): Promise<boolean> {
    try {
      // Use the database function for activation
      const { data, error } = await supabase.rpc('activate_ai_plan_version', {
        p_project_id: projectId,
        p_version_number: versionNumber,
        p_user_id: userId
      });

      if (error) {
        throw new Error(`Failed to activate plan: ${error.message}`);
      }

      return data === true;
    } catch (error) {
      console.error('Error activating plan:', error);
      throw error;
    }
  }

  /**
   * Delete a plan version
   */
  static async deletePlan(planId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(TABLE_NAMES.AI_GENERATED_PLANS)
        .delete()
        .eq('id', planId);

      if (error) {
        throw new Error(`Failed to delete plan: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      throw error;
    }
  }

  /**
   * Get latest plan version number for a project
   */
  static async getLatestVersionNumber(projectId: string): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('get_latest_ai_plan_version', {
        p_project_id: projectId
      });

      if (error) {
        throw new Error(`Failed to get latest version: ${error.message}`);
      }

      return data || 0;
    } catch (error) {
      console.error('Error getting latest version:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time plan status updates
   */
  static subscribeToStatusUpdates(
    projectId: string,
    onUpdate: (plan: AIGeneratedPlan) => void,
    onJobUpdate: (job: AIPlanJob) => void
  ): () => void {
    // Subscribe to plan updates
    const planSubscription = supabase
      .channel(`plan_updates_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'construction_mgr',
          table: TABLE_NAMES.AI_GENERATED_PLANS,
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          if (payload.new) {
            onUpdate(payload.new as AIGeneratedPlan);
          }
        }
      )
      .subscribe();

    // Subscribe to job updates
    const jobSubscription = supabase
      .channel(`job_updates_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'construction_mgr',
          table: TABLE_NAMES.AI_PLAN_JOBS,
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          if (payload.new) {
            onJobUpdate(payload.new as AIPlanJob);
          }
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(planSubscription);
      supabase.removeChannel(jobSubscription);
    };
  }

  /**
   * Generate progress steps from job status (private helper)
   */
  private static generateProgressFromJob(job: AIPlanJob): PlanProgress {
    const steps: ProgressStep[] = [
      {
        id: 'initialization',
        name: 'Initialization',
        description: 'Setting up plan generation parameters',
        status: 'completed',
        progress: 100,
        estimatedDuration: 1,
        startedAt: job.created_at,
        completedAt: job.created_at
      },
      {
        id: 'data_analysis',
        name: 'Data Analysis',
        description: 'Analyzing project requirements and constraints',
        status: job.status === 'pending' ? 'pending' : 'completed',
        progress: job.status === 'pending' ? 0 : 100,
        estimatedDuration: 3,
        startedAt: job.status !== 'pending' ? job.created_at : undefined,
        completedAt: job.status !== 'pending' ? job.created_at : undefined
      },
      {
        id: 'design_generation',
        name: 'Design Generation',
        description: 'Creating architectural designs and plans',
        status: this.getStepStatus(job, 'design_generation'),
        progress: this.getStepProgress(job, 'design_generation'),
        estimatedDuration: 8,
        startedAt: job.status === 'processing' ? job.created_at : undefined
      },
      {
        id: 'optimization',
        name: 'Optimization',
        description: 'Optimizing design for cost and efficiency',
        status: this.getStepStatus(job, 'optimization'),
        progress: this.getStepProgress(job, 'optimization'),
        estimatedDuration: 4,
        startedAt: job.progress_percentage > 60 ? job.created_at : undefined
      },
      {
        id: 'validation',
        name: 'Validation',
        description: 'Validating design against building codes',
        status: this.getStepStatus(job, 'validation'),
        progress: this.getStepProgress(job, 'validation'),
        estimatedDuration: 3,
        startedAt: job.progress_percentage > 80 ? job.created_at : undefined
      },
      {
        id: 'finalization',
        name: 'Finalization',
        description: 'Generating final plans and documentation',
        status: this.getStepStatus(job, 'finalization'),
        progress: this.getStepProgress(job, 'finalization'),
        estimatedDuration: 2,
        startedAt: job.progress_percentage > 90 ? job.created_at : undefined,
        completedAt: job.status === 'completed' ? job.completed_at || undefined : undefined
      }
    ];

    return {
      jobId: job.job_id || job.id,
      projectId: job.project_id,
      currentStage: this.getCurrentStage(job),
      overallProgress: job.progress_percentage || 0,
      steps,
      estimatedCompletion: job.estimated_completion_time || '',
      startedAt: job.created_at,
      completedAt: job.completed_at || undefined,
      error: job.error_message || undefined
    };
  }

  /**
   * Helper to get current stage from job
   */
  private static getCurrentStage(job: AIPlanJob): ProgressStage {
    if (job.status === 'failed') return 'finalization';
    if (job.status === 'completed') return 'finalization';
    
    const progress = job.progress_percentage || 0;
    if (progress < 20) return 'initialization';
    if (progress < 40) return 'data_analysis';
    if (progress < 70) return 'design_generation';
    if (progress < 85) return 'optimization';
    if (progress < 95) return 'validation';
    return 'finalization';
  }

  /**
   * Helper to get step status from job
   */
  private static getStepStatus(
    job: AIPlanJob, 
    stepId: string
  ): 'pending' | 'in_progress' | 'completed' | 'error' {
    if (job.status === 'failed') return 'error';
    
    const currentStage = this.getCurrentStage(job);
    const stages: ProgressStage[] = [
      'initialization', 'data_analysis', 'design_generation', 
      'optimization', 'validation', 'finalization'
    ];
    
    const currentIndex = stages.indexOf(currentStage);
    const stepIndex = stages.indexOf(stepId as ProgressStage);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'in_progress';
    return 'pending';
  }

  /**
   * Helper to get step progress from job
   */
  private static getStepProgress(job: AIPlanJob, stepId: string): number {
    const status = this.getStepStatus(job, stepId);
    if (status === 'completed') return 100;
    if (status === 'pending') return 0;
    if (status === 'error') return 0;
    
    // For in_progress, calculate based on overall progress
    const progress = job.progress_percentage || 0;
    const currentStage = this.getCurrentStage(job);
    
    if (stepId === currentStage) {
      // Calculate progress within current stage
      const stageRanges = {
        initialization: [0, 20],
        data_analysis: [20, 40],
        design_generation: [40, 70],
        optimization: [70, 85],
        validation: [85, 95],
        finalization: [95, 100]
      };
      
      const range = stageRanges[stepId as ProgressStage];
      if (range) {
        const [start, end] = range;
        const stageProgress = Math.max(0, Math.min(100, ((progress - start) / (end - start)) * 100));
        return stageProgress;
      }
    }
    
    return 0;
  }
}

export default PlanStatusService;