import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'sonner';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import * as activityService from '@/services/activityService';
import type { PhaseStatus } from '@/utils/core/phaseStatus';

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'An error occurred';
}

// Types for phase mutations
export interface CreatePhaseData {
  name: string;
  description?: string;
  category: string;
  project_id: string;
  status?: PhaseStatus;
  timeline?: {
    planned_start?: string | null;
    planned_end?: string | null;
    actual_start?: string | null;
    actual_end?: string | null;
  };
  budget?: {
    allocated?: number;
    spent?: number;
    currency?: string;
  };
  details?: Record<string, unknown>;
}

export interface UpdatePhaseData {
  id: string;
  name?: string;
  description?: string;
  category?: string;
  status?: PhaseStatus;
  timeline?: {
    planned_start?: string | null;
    planned_end?: string | null;
    actual_start?: string | null;
    actual_end?: string | null;
  };
  budget?: {
    allocated?: number;
    spent?: number;
    currency?: string;
  };
  details?: Record<string, unknown>;
}

/**
 * Hook to create a new phase
 */
export function useCreatePhase() {
  const queryClient = useQueryClient();
  const { user } = useSupabaseAuth();

  return useMutation({
    mutationFn: async (data: CreatePhaseData) => {
      // Prepare data for database insertion
      const insertData = {
        name: data.name,
        description: data.description || '',
        category: data.category,
        project_id: data.project_id,
        status: data.status || 'PLANNING',
        timeline: data.timeline || {
          planned_start: null,
          planned_end: null,
          actual_start: null,
          actual_end: null
        },
        budget: data.budget || {
          allocated: 0,
          spent: 0,
          currency: 'USD'
        },
        details: data.details || {}
      };

      const { data: phase, error } = await supabase
        .from('be_phase')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      return phase;
    },
    onSuccess: async (newPhase, variables) => {
      // Invalidate and refetch project phases
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.phases.byProject(variables.project_id) 
      });
      
      // Invalidate project query to update phase count
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.projects.detail(variables.project_id) 
      });

      toast.success('Phase created successfully');

      // Track activity: phase created with comprehensive debug logging
      console.log('[ACTIVITY_DEBUG] Starting phase create activity logging', {
        phaseId: newPhase.id,
        phaseName: newPhase.name,
        projectId: variables.project_id,
        category: newPhase.category,
        status: newPhase.status,
        userId: user?.id,
        hasUser: !!user,
        timestamp: new Date().toISOString()
      });
      
      try {
        const userName = user?.user_metadata
          ? [user.user_metadata.first_name, user.user_metadata.last_name].filter(Boolean).join(' ') || undefined
          : undefined;
        
        console.log('[ACTIVITY_DEBUG] Calling activityService.createActivity for phase create with params:', {
          project_id: variables.project_id,
          activity_type: 'phase_create',
          title: `New phase created: ${newPhase.name}`,
          user_id: user?.id,
          user_name: userName,
          entity_type: 'phase',
          entity_id: newPhase.id
        });
        
        const result = await activityService.createActivity({
          project_id: variables.project_id,
          activity_type: 'phase_create',
          title: `New phase created: ${newPhase.name}`,
          description: `Project phase "${newPhase.name}" was added to the project`,
          user_id: user?.id,
          user_name: userName,
          entity_type: 'phase',
          entity_id: newPhase.id,
          metadata: {
            phaseName: newPhase.name,
            category: newPhase.category,
            status: newPhase.status,
            timeline: newPhase.timeline ?? null
          },
          status: 'success'
        });
        
        console.log('[ACTIVITY_DEBUG] Phase create activity result:', {
          success: !!result,
          activityId: result?.id,
          result
        });
        
      } catch (err) {
        console.error('[ACTIVITY_DEBUG] Failed to create activity for phase creation with full error:', {
          error: err,
          errorMessage: err instanceof Error ? err.message : String(err),
          errorStack: err instanceof Error ? err.stack : undefined,
          phaseId: newPhase.id,
          phaseName: newPhase.name,
          projectId: variables.project_id,
          timestamp: new Date().toISOString()
        });
      }
    },
    onError: (error: unknown) => {
      console.error('Error creating phase:', error);
      toast.error(toErrorMessage(error) || 'Failed to create phase');
    }
  });
}

/**
 * Hook to update an existing phase
 */
export function useUpdatePhase() {
  const queryClient = useQueryClient();
  const { user } = useSupabaseAuth();

  return useMutation({
    mutationFn: async (data: UpdatePhaseData) => {
      const { id, ...updateData } = data;
      
      const { data: phase, error } = await supabase
        .from('be_phase')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return phase;
    },
    // Optimistic update: reflect status/timeline instantly
    onMutate: async (variables) => {
      const phaseId = variables.id;
      const detailKey = queryKeys.phases.detail(phaseId);

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: detailKey });

      // Snapshot previous cache
      const prevDetail = queryClient.getQueryData(detailKey) as unknown;
      const projectId: string | undefined = (prevDetail as { project_id?: string } | undefined)?.project_id;
      const listKey = projectId ? queryKeys.phases.byProject(projectId) : undefined;
      if (listKey) await queryClient.cancelQueries({ queryKey: listKey });
      const prevList = listKey ? (queryClient.getQueryData(listKey) as unknown[]) : undefined;

      // Build optimistic detail by shallow-merging and deep-merging timeline/budget
      if (prevDetail) {
        const optimisticDetail = {
          ...prevDetail,
          ...(variables.name !== undefined ? { name: variables.name } : {}),
          ...(variables.description !== undefined ? { description: variables.description } : {}),
          ...(variables.category !== undefined ? { category: variables.category } : {}),
          ...(variables.status !== undefined ? { status: variables.status } : {}),
          ...(variables.details !== undefined ? { details: variables.details } : {}),
          ...(variables.timeline !== undefined
            ? { timeline: { ...(prevDetail as { timeline?: { [key: string]: unknown } } | undefined)?.timeline, ...variables.timeline } }
            : {}),
          ...(variables.budget !== undefined
            ? { budget: { ...(prevDetail as { budget?: { [key: string]: unknown } } | undefined)?.budget, ...variables.budget } }
            : {}),
        };
        queryClient.setQueryData(detailKey, optimisticDetail);

        // Update list cache if present
        if (listKey && prevList) {
          const nextList = prevList.map((p) => {
            if (p && typeof p === 'object' && 'id' in (p as Record<string, unknown>)) {
              return (p as { id?: string }).id === phaseId ? { ...(p as object), ...optimisticDetail } : p;
            }
            return p;
          });
          queryClient.setQueryData(listKey, nextList);
        }
      }

      return { prevDetail, prevList, detailKey, listKey } as const;
    },
    onSuccess: async (updatedPhase, variables) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.phases.byProject(updatedPhase.project_id) 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.phases.detail(updatedPhase.id) 
      });
      
      // Note: no phases.current key exists; byProject + detail invalidations above suffice

      toast.success('Phase updated successfully');

      // Track activity: phase updated / completed / timeline change with comprehensive debug logging
      const wasCompleted = (variables as UpdatePhaseData | undefined)?.status === 'COMPLETED';
      const timelineUpdate = (variables as UpdatePhaseData | undefined)?.timeline;
      const hasTimelineChange = !!(timelineUpdate && (
        timelineUpdate.planned_start !== undefined ||
        timelineUpdate.planned_end !== undefined ||
        timelineUpdate.actual_start !== undefined ||
        timelineUpdate.actual_end !== undefined
      ));
      
      console.log('[ACTIVITY_DEBUG] Starting phase update activity logging', {
        phaseId: updatedPhase.id,
        phaseName: updatedPhase.name,
        projectId: updatedPhase.project_id,
        wasCompleted,
        hasTimelineChange,
        timelineUpdate,
        variables: variables as UpdatePhaseData | undefined,
        userId: user?.id,
        hasUser: !!user,
        timestamp: new Date().toISOString()
      });
      
      try {
        const title = wasCompleted
          ? `Phase completed: ${updatedPhase.name}`
          : hasTimelineChange
          ? `Phase timeline updated: ${updatedPhase.name}`
          : `Phase updated: ${updatedPhase.name}`;

        const description = wasCompleted
          ? `Project phase "${updatedPhase.name}" was marked as completed`
          : hasTimelineChange
          ? `Timeline dates were updated for phase "${updatedPhase.name}"`
          : `Project phase "${updatedPhase.name}" was modified`;
          
        const userName = user?.user_metadata
          ? [user.user_metadata.first_name, user.user_metadata.last_name].filter(Boolean).join(' ') || undefined
          : undefined;
        const activityStatus = wasCompleted ? 'success' : 'info';
        
        console.log('[ACTIVITY_DEBUG] Calling activityService.createActivity for phase update with params:', {
          project_id: updatedPhase.project_id,
          activity_type: 'phase_update',
          title,
          description,
          user_id: user?.id,
          user_name: userName,
          entity_type: 'phase',
          entity_id: updatedPhase.id,
          status: activityStatus
        });

        const result = await activityService.createActivity({
          project_id: updatedPhase.project_id,
          activity_type: 'phase_update',
          title,
          description,
          user_id: user?.id,
          user_name: userName,
          entity_type: 'phase',
          entity_id: updatedPhase.id,
          metadata: {
            phaseName: updatedPhase.name,
            status: (variables as UpdatePhaseData | undefined)?.status,
            timelineUpdate: timelineUpdate ?? null
          },
          status: activityStatus
        });
        
        console.log('[ACTIVITY_DEBUG] Phase update activity result:', {
          success: !!result,
          activityId: result?.id,
          result
        });
        
      } catch (err) {
        console.error('[ACTIVITY_DEBUG] Failed to create activity for phase update with full error:', {
          error: err,
          errorMessage: err instanceof Error ? err.message : String(err),
          errorStack: err instanceof Error ? err.stack : undefined,
          phaseId: updatedPhase.id,
          phaseName: updatedPhase.name,
          projectId: updatedPhase.project_id,
          timestamp: new Date().toISOString()
        });
      }
    },
    onError: (error: unknown, _variables, context) => {
      console.error('Error updating phase:', error);
      // Rollback optimistic caches
      if (context?.detailKey && context?.prevDetail !== undefined) {
        queryClient.setQueryData(context.detailKey, context.prevDetail);
      }
      if (context?.listKey && context?.prevList !== undefined) {
        queryClient.setQueryData(context.listKey, context.prevList);
      }
      toast.error(toErrorMessage(error) || 'Failed to update phase');
    },
    onSettled: async (_data, _error, variables, _context) => {
      // Ensure caches are up-to-date after mutation settles
      const phaseId = variables?.id;
      if (phaseId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.phases.detail(phaseId) });
      }
      // Try to infer projectId from cached detail (post-mutation)
      if (phaseId) {
        const detail = queryClient.getQueryData(queryKeys.phases.detail(phaseId)) as unknown;
        const projectId = (detail as { project_id?: string } | undefined)?.project_id as string | undefined;
        if (projectId) {
          queryClient.invalidateQueries({ queryKey: queryKeys.phases.byProject(projectId) });
        }
      }
    }
  });
}

/**
 * Hook to delete a phase
 */
export function useDeletePhase() {
  const queryClient = useQueryClient();
  const { user } = useSupabaseAuth();

  return useMutation({
    mutationFn: async (phaseId: string) => {
      // First get the phase to know which project to invalidate
      const { data: phase } = await supabase
        .from('be_phase')
        .select('project_id, name')
        .eq('id', phaseId)
        .single();

      const { error } = await supabase
        .from('be_phase')
        .delete()
        .eq('id', phaseId);

      if (error) throw error;
      return { phaseId, projectId: phase?.project_id, phaseName: phase?.name as string | undefined };
    },
    onSuccess: async ({ phaseId, projectId, phaseName }) => {
      if (projectId) {
        // Invalidate and refetch related queries
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.phases.byProject(projectId) 
        });
        
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.projects.detail(projectId) 
        });
      }

      // Remove the specific phase from cache
      queryClient.removeQueries({ 
        queryKey: queryKeys.phases.detail(phaseId) 
      });

      toast.success('Phase deleted successfully');

      // Track activity: phase deleted with comprehensive debug logging
      console.log('[ACTIVITY_DEBUG] Starting phase delete activity logging', {
        phaseId,
        phaseName,
        projectId,
        hasProjectId: !!projectId,
        userId: user?.id,
        hasUser: !!user,
        timestamp: new Date().toISOString()
      });
      
      try {
        if (projectId) {
          const userName = user?.user_metadata
            ? [user.user_metadata.first_name, user.user_metadata.last_name].filter(Boolean).join(' ') || undefined
            : undefined;
          
          console.log('[ACTIVITY_DEBUG] Calling activityService.createActivity for phase delete with params:', {
            project_id: projectId,
            activity_type: 'phase_delete',
            title: `Phase removed: ${phaseName || phaseId}`,
            user_id: user?.id,
            user_name: userName,
            entity_type: 'phase',
            entity_id: phaseId
          });
          
          const result = await activityService.createActivity({
            project_id: projectId,
            activity_type: 'phase_delete',
            title: `Phase removed: ${phaseName || phaseId}`,
            description: 'Project phase was deleted',
            user_id: user?.id,
            user_name: userName,
            entity_type: 'phase',
            entity_id: phaseId,
            metadata: { phaseName: phaseName || null },
            status: 'warning'
          });
          
          console.log('[ACTIVITY_DEBUG] Phase delete activity result:', {
            success: !!result,
            activityId: result?.id,
            result
          });
          
        } else {
          console.warn('[ACTIVITY_DEBUG] Skipping phase delete activity logging - no projectId');
        }
      } catch (err) {
        console.error('[ACTIVITY_DEBUG] Failed to create activity for phase deletion with full error:', {
          error: err,
          errorMessage: err instanceof Error ? err.message : String(err),
          errorStack: err instanceof Error ? err.stack : undefined,
          phaseId,
          phaseName,
          projectId,
          timestamp: new Date().toISOString()
        });
      }
    },
    onError: (error: unknown) => {
      console.error('Error deleting phase:', error);
      toast.error(toErrorMessage(error) || 'Failed to delete phase');
    }
  });
}

/**
 * Hook to reorder phases
 */
export function useReorderPhases() {
  const queryClient = useQueryClient();
  const { user } = useSupabaseAuth();

  return useMutation({
    mutationFn: async ({ 
      projectId: _projectId, 
      phaseOrders 
    }: { 
      projectId: string; 
      phaseOrders: { id: string; order_index: number }[] 
    }) => {
      const updates = phaseOrders.map(({ id, order_index }) =>
        supabase
          .from('be_phase')
          .update({ order_index })
          .eq('id', id)
      );

      const results = await Promise.all(updates);
      
      // Check for any errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error('Failed to reorder some phases');
      }

      return phaseOrders;
    },
    onSuccess: async (_, variables) => {
      // Invalidate and refetch project phases
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.phases.byProject(variables.projectId) 
      });

      toast.success('Phases reordered successfully');

      // Track activity: phases reordered with comprehensive debug logging
      console.log('[ACTIVITY_DEBUG] Starting phase reorder activity logging', {
        projectId: variables.projectId,
        phaseOrders: variables.phaseOrders,
        phaseCount: variables.phaseOrders.length,
        userId: user?.id,
        hasUser: !!user,
        timestamp: new Date().toISOString()
      });
      
      try {
        const userName = user?.user_metadata
          ? [user.user_metadata.first_name, user.user_metadata.last_name].filter(Boolean).join(' ') || undefined
          : undefined;
        
        console.log('[ACTIVITY_DEBUG] Calling activityService.createActivity for phase reorder with params:', {
          project_id: variables.projectId,
          activity_type: 'phase_update',
          title: 'Phases reordered',
          user_id: user?.id,
          user_name: userName,
          entity_type: 'phase',
          entity_id: undefined
        });
        
        const result = await activityService.createActivity({
          project_id: variables.projectId,
          activity_type: 'phase_update',
          title: 'Phases reordered',
          description: 'The order of phases was updated',
          user_id: user?.id,
          user_name: userName,
          entity_type: 'phase',
          entity_id: undefined,
          metadata: { orders: variables.phaseOrders },
          status: 'info'
        });
        
        console.log('[ACTIVITY_DEBUG] Phase reorder activity result:', {
          success: !!result,
          activityId: result?.id,
          result
        });
        
      } catch (err) {
        console.error('[ACTIVITY_DEBUG] Failed to create activity for phase reorder with full error:', {
          error: err,
          errorMessage: err instanceof Error ? err.message : String(err),
          errorStack: err instanceof Error ? err.stack : undefined,
          projectId: variables.projectId,
          phaseOrders: variables.phaseOrders,
          timestamp: new Date().toISOString()
        });
      }
    },
    onError: (error: unknown) => {
      console.error('Error reordering phases:', error);
      toast.error(toErrorMessage(error) || 'Failed to reorder phases');
    }
  });
}
