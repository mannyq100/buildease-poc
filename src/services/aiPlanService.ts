import { 
  AIPlanJob, 
  AIPlanJobInsert, 
  AIPlanJobStatus, 
  PlanGenerationStatus 
} from '@/types/database';

/**
 * AI Plan Generation Service
 * Handles communication with AI service and manages plan generation jobs
 */

export interface AIPlanJobStatusResponse {
  id: string;
  status: AIPlanJobStatus;
  progress: number;
  estimatedCompletion?: Date;
  error?: string;
}

export interface AIPlanGenerationRequest {
  projectId: string;
  projectDetails: {
    name: string;
    description?: string;
    type: string;
    location: string;
    budget: number;
    specs: Record<string, unknown>;
    features: string[];
    materials: Record<string, unknown>;
  };
}

export interface AIPlanGenerationResponse {
  jobId: string;
  estimatedDuration: number; // in minutes
  status: AIPlanJobStatus;
}

export class AIPlanService {
  private static readonly API_BASE_URL = '/api/ai-plan';
  private static readonly POLL_INTERVAL = 5000; // 5 seconds
  private static readonly MAX_POLL_ATTEMPTS = 240; // 20 minutes max

  /**
   * Request AI plan generation for a project
   */
  static async requestPlanGeneration(
    request: AIPlanGenerationRequest
  ): Promise<string> {
    try {
      // For now, simulate the API call with a mock response
      // In production, this would make an actual API call to the AI service
      const mockJobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create AI plan job record in database
      const jobData: AIPlanJobInsert = {
        project_id: request.projectId,
        status: 'pending',
        job_id: mockJobId,
        progress_percentage: 0,
        estimated_completion_time: new Date(Date.now() + 2 * 60 * 1000).toISOString(), // 2 minutes
        retry_count: 0,
        max_retries: 3
      };

      // In a real implementation, this would use Supabase client
      await this.createPlanJob(jobData);

      // Simulate starting the AI generation process
      setTimeout(() => {
        this.simulateJobProgress(mockJobId);
      }, 1000);

      return mockJobId;
    } catch (error) {
      console.error('Failed to request plan generation:', error);
      throw new Error('Failed to start plan generation. Please try again.');
    }
  }

  /**
   * Get current status of a plan generation job
   */
  static async getPlanJobStatus(jobId: string): Promise<AIPlanJobStatusResponse> {
    try {
      // In production, this would query the database
      const job = await this.getJobFromDatabase(jobId);
      
      return {
        id: job.id,
        status: job.status,
        progress: job.progress_percentage,
        estimatedCompletion: job.estimated_completion_time 
          ? new Date(job.estimated_completion_time) 
          : undefined,
        error: job.error_message || undefined
      };
    } catch (error) {
      console.error('Failed to get plan job status:', error);
      throw new Error('Failed to retrieve plan generation status.');
    }
  }

  /**
   * Poll job status with automatic updates
   */
  static async pollJobStatus(
    jobId: string,
    onUpdate: (status: AIPlanJobStatusResponse) => void
  ): Promise<AIPlanJobStatusResponse> {
    let attempts = 0;
    
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          attempts++;
          const status = await this.getPlanJobStatus(jobId);
          onUpdate(status);

          if (status.status === 'completed' || status.status === 'failed') {
            resolve(status);
            return;
          }

          if (attempts >= this.MAX_POLL_ATTEMPTS) {
            reject(new Error('Plan generation polling timeout'));
            return;
          }

          setTimeout(poll, this.POLL_INTERVAL);
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }

  /**
   * Cancel an ongoing plan generation job
   */
  static async cancelPlanGeneration(jobId: string): Promise<void> {
    try {
      // In production, this would:
      // 1. Call AI service to cancel the job
      // 2. Update database status to cancelled
      
      await this.updateJobStatus(jobId, 'failed', 0, 'Cancelled by user');
    } catch (error) {
      console.error('Failed to cancel plan generation:', error);
      throw new Error('Failed to cancel plan generation.');
    }
  }

  /**
   * Retry a failed plan generation job
   */
  static async retryPlanGeneration(jobId: string): Promise<string> {
    try {
      const job = await this.getJobFromDatabase(jobId);
      
      if (job.retry_count >= job.max_retries) {
        throw new Error('Maximum retry attempts exceeded');
      }

      // Create new job with incremented retry count
      const newJobData: AIPlanJobInsert = {
        ...job,
        status: 'pending',
        progress_percentage: 0,
        retry_count: job.retry_count + 1,
        error_message: null,
        estimated_completion_time: new Date(Date.now() + 2 * 60 * 1000).toISOString()
      };

      const newJobId = await this.createPlanJob(newJobData);
      return newJobId;
    } catch (error) {
      console.error('Failed to retry plan generation:', error);
      throw new Error('Failed to retry plan generation.');
    }
  }

  // Private helper methods

  private static async createPlanJob(jobData: AIPlanJobInsert): Promise<string> {
    // Mock implementation - in production would use Supabase
    const mockId = `job_record_${Date.now()}`;
    
    // Store in localStorage for demo purposes
    const jobs = this.getStoredJobs();
    jobs[jobData.job_id!] = {
      id: mockId,
      ...jobData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    localStorage.setItem('ai_plan_jobs', JSON.stringify(jobs));
    
    return mockId;
  }

  private static async getJobFromDatabase(jobId: string): Promise<AIPlanJob> {
    // Mock implementation - in production would query Supabase
    const jobs = this.getStoredJobs();
    const job = jobs[jobId];
    
    if (!job) {
      throw new Error('Job not found');
    }
    
    return job;
  }

  private static async updateJobStatus(
    jobId: string, 
    status: AIPlanJobStatus, 
    progress: number,
    errorMessage?: string
  ): Promise<void> {
    const jobs = this.getStoredJobs();
    if (jobs[jobId]) {
      jobs[jobId].status = status;
      jobs[jobId].progress_percentage = progress;
      jobs[jobId].updated_at = new Date().toISOString();
      
      if (errorMessage) {
        jobs[jobId].error_message = errorMessage;
      }
      
      if (status === 'completed') {
        jobs[jobId].completed_at = new Date().toISOString();
      }
      
      localStorage.setItem('ai_plan_jobs', JSON.stringify(jobs));
    }
  }

  private static getStoredJobs(): Record<string, AIPlanJob> {
    try {
      const stored = localStorage.getItem('ai_plan_jobs');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  /**
   * Simulate job progress for demo purposes
   * In production, this would be handled by webhook notifications
   */
  private static async simulateJobProgress(jobId: string): Promise<void> {
    const progressSteps = [10, 25, 40, 60, 75, 90, 100];
    
    for (const progress of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, 8000)); // 8 second intervals
      
      if (progress === 100) {
        await this.updateJobStatus(jobId, 'completed', progress);
        // In production, this would trigger a webhook or notification
        this.notifyJobCompletion(jobId);
      } else {
        await this.updateJobStatus(jobId, 'processing', progress);
      }
    }
  }

  private static notifyJobCompletion(jobId: string): void {
    // In production, this would create a notification in the database
    // For now, we'll use a custom event
    window.dispatchEvent(new CustomEvent('ai-plan-completed', {
      detail: { jobId }
    }));
  }

  /**
   * Get plan generation status for a project
   */
  static async getProjectPlanStatus(projectId: string): Promise<PlanGenerationStatus> {
    // Mock implementation - in production would query project table
    const projects = JSON.parse(localStorage.getItem('project_plan_status') || '{}');
    return projects[projectId] || 'not_started';
  }

  /**
   * Update project plan generation status
   */
  static async updateProjectPlanStatus(
    projectId: string, 
    status: PlanGenerationStatus
  ): Promise<void> {
    const projects = JSON.parse(localStorage.getItem('project_plan_status') || '{}');
    projects[projectId] = status;
    localStorage.setItem('project_plan_status', JSON.stringify(projects));
  }
}

export default AIPlanService;