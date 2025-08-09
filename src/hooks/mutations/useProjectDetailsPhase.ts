import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'sonner';
import * as activityService from '@/services/activityService';

// Types for ProjectDetails phase mutations
export interface ProjectDetailsPhase {
  id?: string;
  project_id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  category?: string;
  progress_percentage?: number;
}

export interface CreateProjectDetailsPhaseData {
  project_id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  status?: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  category?: string;
}

export interface UpdateProjectDetailsPhaseData {
  id: string;
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  category?: string;
  progress_percentage?: number;
}

/**
 * Hook to create a new phase for ProjectDetails
 */
export function useCreateProjectDetailsPhase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProjectDetailsPhaseData) => {
      const { data: phase, error } = await supabase
        .from('be_phase')
        .insert([{
          project_id: data.project_id,
          name: data.name,
          description: data.description || '',
          category: data.category || 'CONSTRUCTION',
          status: data.status === 'pending' ? 'PLANNING' : 
                  data.status === 'in-progress' ? 'IN_PROGRESS' : 
                  data.status === 'completed' ? 'COMPLETED' : 'PAUSED',
          timeline: {
            planned_start: data.start_date,
            planned_end: data.end_date,
            actual_start: null,
            actual_end: null
          },
          budget: {
            allocated: 0,
            spent: 0,
            currency: 'GHS'
          },
          details: {}
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Transform to match UI expectations
      return {
        id: phase.id,
        project_id: phase.project_id,
        name: phase.name,
        description: phase.description,
        start_date: phase.timeline?.planned_start || data.start_date,
        end_date: phase.timeline?.planned_end || data.end_date,
        status: phase.status === 'PLANNING' ? 'pending' :
                phase.status === 'IN_PROGRESS' ? 'in-progress' :
                phase.status === 'COMPLETED' ? 'completed' : 'on-hold',
        category: phase.category,
        progress_percentage: 0
      };
    },
    onSuccess: async (newPhase, variables) => {
      console.log('[ACTIVITY_DEBUG] [useCreateProjectDetailsPhase] onSuccess called', {
        phaseId: newPhase.id,
        phaseName: newPhase.name,
        projectId: variables.project_id,
        timestamp: new Date().toISOString()
      });
      
      // Invalidate project queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.projects.detail(variables.project_id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.phases.byProject(variables.project_id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['timeline', variables.project_id] 
      });
      
      // Fire-and-forget activity logging with comprehensive debug logging
      console.log('[ACTIVITY_DEBUG] [useCreateProjectDetailsPhase] Starting activity logging for phase creation');
      
      (async () => {
        try {
          console.log('[ACTIVITY_DEBUG] [useCreateProjectDetailsPhase] Fetching auth user');
          const { data: auth, error: authError } = await supabase.auth.getUser();
          
          if (authError) {
            console.error('[ACTIVITY_DEBUG] [useCreateProjectDetailsPhase] Auth error:', authError);
            return;
          }
          
          console.log('[ACTIVITY_DEBUG] [useCreateProjectDetailsPhase] Auth user fetched successfully', {
            userId: auth?.user?.id,
            hasUser: !!auth?.user,
            userMetadata: auth?.user?.user_metadata
          });
          
          const userName = (auth?.user?.user_metadata?.full_name as string | undefined) ||
              (auth?.user?.user_metadata?.name as string | undefined) ||
              (auth?.user?.email as string | undefined);
              
          console.log('[ACTIVITY_DEBUG] [useCreateProjectDetailsPhase] Calling activityService.createActivity', {
            project_id: variables.project_id,
            activity_type: 'phase_create',
            title: `New phase created: ${newPhase.name}`,
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'phase',
            entity_id: newPhase.id
          });
          
          const result = await activityService.createActivity({
            project_id: variables.project_id,
            activity_type: 'phase_create',
            title: `New phase created: ${newPhase.name}`,
            description: `Project phase "${newPhase.name}" was added to the project`,
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'phase',
            entity_id: newPhase.id,
            metadata: {
              phaseName: newPhase.name,
              category: newPhase.category,
              status: newPhase.status,
              timeline: {
                planned_start: newPhase.start_date,
                planned_end: newPhase.end_date
              }
            },
            status: 'success'
          });
          
          console.log('[ACTIVITY_DEBUG] [useCreateProjectDetailsPhase] Activity created successfully', {
            success: !!result,
            activityId: result?.id,
            result
          });
          
        } catch (e) {
          console.error('[ACTIVITY_DEBUG] [useCreateProjectDetailsPhase] Activity logging failed:', {
            error: e,
            errorMessage: e instanceof Error ? e.message : String(e),
            errorStack: e instanceof Error ? e.stack : undefined,
            phaseId: newPhase.id,
            phaseName: newPhase.name,
            projectId: variables.project_id,
            timestamp: new Date().toISOString()
          });
        }
      })();
      
      toast.success('Phase added successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to add phase: ${error.message}`);
    },
  });
}

/**
 * Hook to update a phase for ProjectDetails
 */
export function useUpdateProjectDetailsPhase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProjectDetailsPhaseData) => {
      const { id, ...updateData } = data;
      
      // Build update payload
      const updatePayload: any = {};
      
      if (updateData.name) updatePayload.name = updateData.name;
      if (updateData.description !== undefined) updatePayload.description = updateData.description;
      if (updateData.category) updatePayload.category = updateData.category;
      
      if (updateData.status) {
        updatePayload.status = updateData.status === 'pending' ? 'PLANNING' : 
                              updateData.status === 'in-progress' ? 'IN_PROGRESS' : 
                              updateData.status === 'completed' ? 'COMPLETED' : 'PAUSED';
      }

      // Handle timeline updates
      if (updateData.start_date || updateData.end_date) {
        // First get current timeline
        const { data: currentPhase } = await supabase
          .from('be_phase')
          .select('timeline')
          .eq('id', id)
          .single();

        const currentTimeline = currentPhase?.timeline || {};
        
        updatePayload.timeline = {
          ...currentTimeline,
          ...(updateData.start_date && { planned_start: updateData.start_date }),
          ...(updateData.end_date && { planned_end: updateData.end_date })
        };
      }

      const { data: phase, error } = await supabase
        .from('be_phase')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Transform to match UI expectations
      return {
        id: phase.id,
        project_id: phase.project_id,
        name: phase.name,
        description: phase.description,
        start_date: phase.timeline?.planned_start,
        end_date: phase.timeline?.planned_end,
        status: phase.status === 'PLANNING' ? 'pending' :
                phase.status === 'IN_PROGRESS' ? 'in-progress' :
                phase.status === 'COMPLETED' ? 'completed' : 'on-hold',
        category: phase.category,
        progress_percentage: updateData.progress_percentage || 0
      };
    },
    onSuccess: async (updatedPhase, variables) => {
      console.log('[ACTIVITY_DEBUG] [useUpdateProjectDetailsPhase] onSuccess called', {
        phaseId: updatedPhase.id,
        phaseName: updatedPhase.name,
        projectId: updatedPhase.project_id,
        updates: variables,
        timestamp: new Date().toISOString()
      });
      
      // Invalidate project queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.projects.detail(updatedPhase.project_id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.phases.byProject(updatedPhase.project_id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['timeline', updatedPhase.project_id] 
      });
      
      // Fire-and-forget activity logging with comprehensive debug logging
      console.log('[ACTIVITY_DEBUG] [useUpdateProjectDetailsPhase] Starting activity logging for phase update');
      
      (async () => {
        try {
          console.log('[ACTIVITY_DEBUG] [useUpdateProjectDetailsPhase] Fetching auth user');
          const { data: auth, error: authError } = await supabase.auth.getUser();
          
          if (authError) {
            console.error('[ACTIVITY_DEBUG] [useUpdateProjectDetailsPhase] Auth error:', authError);
            return;
          }
          
          console.log('[ACTIVITY_DEBUG] [useUpdateProjectDetailsPhase] Auth user fetched successfully', {
            userId: auth?.user?.id,
            hasUser: !!auth?.user,
            userMetadata: auth?.user?.user_metadata
          });
          
          const userName = (auth?.user?.user_metadata?.full_name as string | undefined) ||
              (auth?.user?.user_metadata?.name as string | undefined) ||
              (auth?.user?.email as string | undefined);
              
          const wasCompleted = variables.status === 'completed';
          const title = wasCompleted
            ? `Phase completed: ${updatedPhase.name}`
            : `Phase updated: ${updatedPhase.name}`;
          const description = wasCompleted
            ? `Project phase "${updatedPhase.name}" was marked as completed`
            : `Project phase "${updatedPhase.name}" was modified`;
              
          console.log('[ACTIVITY_DEBUG] [useUpdateProjectDetailsPhase] Calling activityService.createActivity', {
            project_id: updatedPhase.project_id,
            activity_type: 'phase_update',
            title,
            description,
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'phase',
            entity_id: updatedPhase.id
          });
          
          const result = await activityService.createActivity({
            project_id: updatedPhase.project_id,
            activity_type: 'phase_update',
            title,
            description,
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'phase',
            entity_id: updatedPhase.id,
            metadata: {
              phaseName: updatedPhase.name,
              status: updatedPhase.status,
              updates: variables
            },
            status: wasCompleted ? 'success' : 'info'
          });
          
          console.log('[ACTIVITY_DEBUG] [useUpdateProjectDetailsPhase] Activity created successfully', {
            success: !!result,
            activityId: result?.id,
            result
          });
          
        } catch (e) {
          console.error('[ACTIVITY_DEBUG] [useUpdateProjectDetailsPhase] Activity logging failed:', {
            error: e,
            errorMessage: e instanceof Error ? e.message : String(e),
            errorStack: e instanceof Error ? e.stack : undefined,
            phaseId: updatedPhase.id,
            phaseName: updatedPhase.name,
            projectId: updatedPhase.project_id,
            timestamp: new Date().toISOString()
          });
        }
      })();
      
      toast.success('Phase updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update phase: ${error.message}`);
    },
  });
}

/**
 * Hook to delete a phase for ProjectDetails
 */
export function useDeleteProjectDetailsPhase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (phaseId: string) => {
      // First get the project_id for cache invalidation
      const { data: phase } = await supabase
        .from('be_phase')
        .select('project_id')
        .eq('id', phaseId)
        .single();

      const { error } = await supabase
        .from('be_phase')
        .delete()
        .eq('id', phaseId);

      if (error) throw error;
      return { phaseId, projectId: phase?.project_id };
    },
    onSuccess: async (result, variables) => {
      console.log('[ACTIVITY_DEBUG] [useDeleteProjectDetailsPhase] onSuccess called', {
        phaseId: result.phaseId,
        projectId: result.projectId,
        timestamp: new Date().toISOString()
      });
      
      if (result.projectId) {
        // Invalidate project queries
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.projects.detail(result.projectId) 
        });
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.phases.byProject(result.projectId) 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['timeline', result.projectId] 
        });
      }
      
      // Fire-and-forget activity logging with comprehensive debug logging
      console.log('[ACTIVITY_DEBUG] [useDeleteProjectDetailsPhase] Starting activity logging for phase deletion');
      
      (async () => {
        try {
          console.log('[ACTIVITY_DEBUG] [useDeleteProjectDetailsPhase] Fetching auth user');
          const { data: auth, error: authError } = await supabase.auth.getUser();
          
          if (authError) {
            console.error('[ACTIVITY_DEBUG] [useDeleteProjectDetailsPhase] Auth error:', authError);
            return;
          }
          
          console.log('[ACTIVITY_DEBUG] [useDeleteProjectDetailsPhase] Auth user fetched successfully', {
            userId: auth?.user?.id,
            hasUser: !!auth?.user,
            userMetadata: auth?.user?.user_metadata
          });
          
          if (!result.projectId) {
            console.warn('[ACTIVITY_DEBUG] [useDeleteProjectDetailsPhase] No projectId available for activity logging');
            return;
          }
          
          const userName = (auth?.user?.user_metadata?.full_name as string | undefined) ||
              (auth?.user?.user_metadata?.name as string | undefined) ||
              (auth?.user?.email as string | undefined);
              
          console.log('[ACTIVITY_DEBUG] [useDeleteProjectDetailsPhase] Calling activityService.createActivity', {
            project_id: result.projectId,
            activity_type: 'phase_delete',
            title: `Phase removed: ${result.phaseId}`,
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'phase',
            entity_id: result.phaseId
          });
          
          const activityResult = await activityService.createActivity({
            project_id: result.projectId,
            activity_type: 'phase_delete',
            title: `Phase removed: ${result.phaseId}`,
            description: 'Project phase was deleted',
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'phase',
            entity_id: result.phaseId,
            metadata: { phaseId: result.phaseId },
            status: 'warning'
          });
          
          console.log('[ACTIVITY_DEBUG] [useDeleteProjectDetailsPhase] Activity created successfully', {
            success: !!activityResult,
            activityId: activityResult?.id,
            result: activityResult
          });
          
        } catch (e) {
          console.error('[ACTIVITY_DEBUG] [useDeleteProjectDetailsPhase] Activity logging failed:', {
            error: e,
            errorMessage: e instanceof Error ? e.message : String(e),
            errorStack: e instanceof Error ? e.stack : undefined,
            phaseId: result.phaseId,
            projectId: result.projectId,
            timestamp: new Date().toISOString()
          });
        }
      })();
      
      toast.success('Phase deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete phase: ${error.message}`);
    },
  });
}

/**
 * Hook to get phases for ProjectDetails timeline
 */
export function useProjectDetailsPhases(projectId: string) {
  return {
    queryKey: ['timeline', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('be_phase')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Transform data to match ProjectDetails UI expectations
      return data.map(phase => ({
        id: phase.id,
        project_id: phase.project_id,
        name: phase.name,
        description: phase.description || '',
        start_date: phase.timeline?.planned_start || '',
        end_date: phase.timeline?.planned_end || '',
        status: phase.status === 'PLANNING' ? 'pending' :
                phase.status === 'IN_PROGRESS' ? 'in-progress' :
                phase.status === 'COMPLETED' ? 'completed' : 'on-hold',
        category: phase.category,
        progress_percentage: 0 // Calculate based on tasks if needed
      }));
    }
  };
}
