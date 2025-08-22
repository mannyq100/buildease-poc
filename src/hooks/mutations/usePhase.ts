/**
 * Unified Phase Mutation Hooks for BuildEase Construction Management
 * Combines functionality from usePhase.ts and useProjectDetailsPhase.ts
 * Supports both raw database operations and UI-transformed data
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'sonner';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import * as activityService from '@/services/activityService';
import { PhaseStatusDB, PhaseStatusUI, toDbPhaseStatus, toUiPhaseStatus, type PhaseStatus } from '@/utils/core/phaseStatus';
import { useProjectStore } from '@/stores/projectStore';

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'An error occurred';
}

// Base types for phase data (database schema)
export interface PhaseTimeline {
  planned_start?: string | null;
  planned_end?: string | null;
  actual_start?: string | null;
  actual_end?: string | null;
}

export interface PhaseBudget {
  allocated?: number;
  spent?: number;
  currency?: string;
}

// Database-oriented interfaces (comprehensive)
export interface CreatePhaseData {
  name: string;
  description?: string;
  category: string;
  project_id: string;
  status?: PhaseStatus;
  timeline?: PhaseTimeline;
  budget?: PhaseBudget;
  details?: Record<string, unknown>;
}

export interface UpdatePhaseData {
  id: string;
  name?: string;
  description?: string;
  category?: string;
  status?: PhaseStatus;
  timeline?: PhaseTimeline;
  budget?: PhaseBudget;
  details?: Record<string, unknown>;
}

// UI-oriented interfaces (simplified, backwards compatible)
export interface CreatePhaseUIData {
  project_id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  status?: PhaseStatusUI;
  category?: string;
  actual_start?: string | null;
  actual_end?: string | null;
}

export interface UpdatePhaseUIData {
  id: string;
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: PhaseStatusUI;
  category?: string;
  progress_percentage?: number;
  actual_start?: string | null;
  actual_end?: string | null;
}

// Unified phase response that works for both use cases
export interface PhaseResponse {
  id: string;
  project_id: string;
  name: string;
  description: string;
  category: string;
  status: PhaseStatus;
  timeline: PhaseTimeline;
  budget: PhaseBudget;
  details: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Transform UI data to database format
function transformUIToDatabase(data: CreatePhaseUIData | UpdatePhaseUIData): Partial<CreatePhaseData> & { id?: string } {
  const result: Partial<CreatePhaseData> & { id?: string } = {};
  
  // Always preserve ID for updates
  if ('id' in data && data.id !== undefined) result.id = data.id;
  
  if ('name' in data && data.name !== undefined) result.name = data.name;
  if ('description' in data && data.description !== undefined) result.description = data.description;
  if ('category' in data && data.category !== undefined) result.category = data.category;
  // Only include project_id for creates, not updates
  if ('project_id' in data && data.project_id !== undefined) {
    result.project_id = data.project_id;
  }
  
  if (data.status) {
    result.status = toDbPhaseStatus(data.status);
  }
  
  // Transform flat dates to timeline object
  if ('start_date' in data || 'end_date' in data || 'actual_start' in data || 'actual_end' in data) {
    result.timeline = {};
    if ('start_date' in data && data.start_date !== undefined) {
      result.timeline.planned_start = data.start_date === '' ? null : data.start_date;
    }
    if ('end_date' in data && data.end_date !== undefined) {
      result.timeline.planned_end = data.end_date === '' ? null : data.end_date;
    }
    if ('actual_start' in data && data.actual_start !== undefined) {
      result.timeline.actual_start = data.actual_start === '' ? null : data.actual_start;
    }
    if ('actual_end' in data && data.actual_end !== undefined) {
      result.timeline.actual_end = data.actual_end === '' ? null : data.actual_end;
    }
  }
  
  return result;
}

// Transform database response to UI format (for backwards compatibility)
function transformDatabaseToUI(phase: PhaseResponse): {
  id: string;
  project_id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: PhaseStatusUI;
  category: string;
  progress_percentage: number;
} {
  return {
    id: phase.id,
    project_id: phase.project_id,
    name: phase.name,
    description: phase.description,
    start_date: phase.timeline?.planned_start || '',
    end_date: phase.timeline?.planned_end || '',
    status: toUiPhaseStatus(phase.status),
    category: phase.category,
    progress_percentage: 0 // Calculate based on tasks if needed
  };
}

/**
 * Hook to create a new phase (supports both database and UI formats)
 */
export function useCreatePhase(options?: { 
  uiFormat?: boolean; 
  currency?: string;
  invalidateTimeline?: boolean;
}) {
  const queryClient = useQueryClient();
  const { user } = useSupabaseAuth();
  const addOptimisticUpdate = useProjectStore(state => state.addOptimisticUpdate);
  const currency = options?.currency || 'USD';
  const uiFormat = options?.uiFormat || false;
  const invalidateTimeline = options?.invalidateTimeline || false;

  return useMutation({
    mutationFn: async (data: CreatePhaseData | CreatePhaseUIData) => {
      // Transform UI format to database format if needed
      const dbData = uiFormat ? transformUIToDatabase(data as CreatePhaseUIData) : data as CreatePhaseData;
      
      // Prepare data for database insertion
      const insertData = {
        name: dbData.name!,
        description: dbData.description || '',
        category: dbData.category!,
        project_id: dbData.project_id!,
        status: dbData.status || PhaseStatusDB.PLANNING,
        timeline: dbData.timeline || {
          planned_start: null,
          planned_end: null,
          actual_start: null,
          actual_end: null
        },
        budget: dbData.budget || {
          allocated: 0,
          spent: 0,
          currency
        },
        details: dbData.details || {}
      };

      const { data: phase, error } = await supabase
        .from('be_phase')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      
      // Return in requested format
      return uiFormat ? transformDatabaseToUI(phase) : phase;
    },
    // Optimistic update - show phase immediately
    onMutate: async (newPhaseData) => {
      const projectId = 'project_id' in newPhaseData ? newPhaseData.project_id : (newPhaseData as CreatePhaseData).project_id;
      const optimisticId = `temp_phase_${Date.now()}`;
      
      // Create optimistic phase data
      const dbData = uiFormat ? transformUIToDatabase(newPhaseData as CreatePhaseUIData) : newPhaseData as CreatePhaseData;
      const optimisticPhase = {
        id: optimisticId,
        name: dbData.name!,
        description: dbData.description || '',
        category: dbData.category!,
        project_id: projectId,
        status: dbData.status || PhaseStatusDB.PLANNING,
        timeline: dbData.timeline || {
          planned_start: null,
          planned_end: null,
          actual_start: null,
          actual_end: null
        },
        budget: dbData.budget || {
          allocated: 0,
          spent: 0,
          currency
        },
        details: dbData.details || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.phases.byProject(projectId) 
      });

      if (invalidateTimeline) {
        await queryClient.cancelQueries({ 
          queryKey: ['timeline', projectId] 
        });
      }

      // Snapshot the previous values
      const previousPhases = queryClient.getQueryData(queryKeys.phases.byProject(projectId));
      const previousTimeline = invalidateTimeline ? queryClient.getQueryData(['timeline', projectId]) : undefined;

      // Optimistically update phases list
      queryClient.setQueryData(queryKeys.phases.byProject(projectId), (old: any) => {
        if (!old) return [uiFormat ? transformDatabaseToUI(optimisticPhase) : optimisticPhase];
        return [...old, uiFormat ? transformDatabaseToUI(optimisticPhase) : optimisticPhase];
      });

      // Optimistically update timeline if needed
      if (invalidateTimeline) {
        queryClient.setQueryData(['timeline', projectId], (old: any) => {
          if (!old) return [uiFormat ? transformDatabaseToUI(optimisticPhase) : optimisticPhase];
          return [...old, uiFormat ? transformDatabaseToUI(optimisticPhase) : optimisticPhase];
        });
      }

      // Track optimistic update
      addOptimisticUpdate(`create_phase_${optimisticId}`, {
        type: 'create',
        entity: 'phase',
        data: optimisticPhase,
        timestamp: Date.now()
      });

      return { 
        previousPhases, 
        previousTimeline, 
        optimisticId,
        optimisticPhase,
        projectId
      };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      const projectId = 'project_id' in variables ? variables.project_id : (variables as CreatePhaseData).project_id;
      
      if (context?.previousPhases) {
        queryClient.setQueryData(queryKeys.phases.byProject(projectId), context.previousPhases);
      }
      if (context?.previousTimeline && invalidateTimeline) {
        queryClient.setQueryData(['timeline', projectId], context.previousTimeline);
      }
      
      console.error('Error creating phase:', error);
      toast.error(toErrorMessage(error) || 'Failed to create phase');
    },
    onSuccess: async (newPhase, variables, context) => {
      const projectId = 'project_id' in variables ? variables.project_id : (variables as CreatePhaseData).project_id;
      
      // Replace optimistic phase with real server data
      queryClient.setQueryData(queryKeys.phases.byProject(projectId), (old: any) => {
        if (!old) return [newPhase];
        return old.map((phase: any) => 
          phase.id === context?.optimisticId ? newPhase : phase
        );
      });

      if (invalidateTimeline) {
        queryClient.setQueryData(['timeline', projectId], (old: any) => {
          if (!old) return [newPhase];
          return old.map((phase: any) => 
            phase.id === context?.optimisticId ? newPhase : phase
          );
        });
      }

      // Remove optimistic update tracking
      const removeOptimisticUpdate = useProjectStore.getState().removeOptimisticUpdate;
      removeOptimisticUpdate(`create_phase_${context?.optimisticId}`);

      // Invalidate related queries for other components
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.projects.detail(projectId) 
      });

      // CRITICAL: Invalidate consolidated project query for real-time updates
      queryClient.invalidateQueries({
        queryKey: ['project-consolidated', projectId]
      });

      toast.success('Phase created successfully');

      // Track activity
      const phaseName = 'name' in newPhase ? newPhase.name : (newPhase as PhaseResponse).name;
      const phaseId = 'id' in newPhase ? newPhase.id : (newPhase as PhaseResponse).id;
      
      try {
        const userName = user?.user_metadata
          ? [user.user_metadata.first_name, user.user_metadata.last_name].filter(Boolean).join(' ') || undefined
          : undefined;
        
        const result = await activityService.createActivity({
          project_id: projectId,
          activity_type: 'phase_create',
          title: `New phase created: ${phaseName}`,
          description: `Project phase "${phaseName}" was added to the project`,
          user_id: user?.id,
          user_name: userName,
          entity_type: 'phase',
          entity_id: phaseId,
          metadata: {
            phaseName,
            category: 'category' in newPhase ? newPhase.category : (newPhase as PhaseResponse).category,
            status: 'status' in newPhase ? newPhase.status : (newPhase as PhaseResponse).status,
            timeline: uiFormat 
              ? { planned_start: (newPhase as { start_date: string }).start_date, planned_end: (newPhase as { end_date: string }).end_date }
              : (newPhase as PhaseResponse).timeline
          },
          status: 'success'
        });
        
      } catch (err) {
        console.error('Failed to create activity for phase creation:', err);
      }
    }
  });
}

/**
 * Hook to update an existing phase (supports both database and UI formats)
 */
export function useUpdatePhase(options?: { 
  uiFormat?: boolean;
  optimistic?: boolean;
  invalidateTimeline?: boolean;
}) {
  const queryClient = useQueryClient();
  const { user } = useSupabaseAuth();
  const uiFormat = options?.uiFormat || false;
  const optimistic = options?.optimistic || false;
  const invalidateTimeline = options?.invalidateTimeline || false;

  return useMutation({
    mutationFn: async (data: UpdatePhaseData | UpdatePhaseUIData) => {
      // Transform UI format to database format if needed
      const dbData = uiFormat ? transformUIToDatabase(data as UpdatePhaseUIData) : data as UpdatePhaseData;
      
      const { id, ...updateData } = dbData as UpdatePhaseData & { id: string };
      
      // Filter out undefined values to prevent UUID errors
      const cleanUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined && value !== 'undefined')
      );
      
      // Handle timeline updates for UI format
      if (uiFormat && ('start_date' in data || 'end_date' in data || 'actual_start' in data || 'actual_end' in data)) {
        // Get current timeline and merge updates
        const { data: currentPhase } = await supabase
          .from('be_phase')
          .select('timeline')
          .eq('id', id)
          .single();

        const currentTimeline = currentPhase?.timeline || {};
        const timeline: PhaseTimeline = { ...currentTimeline };
        
        const uiData = data as UpdatePhaseUIData;
        if (uiData.start_date !== undefined) timeline.planned_start = uiData.start_date === '' ? null : uiData.start_date;
        if (uiData.end_date !== undefined) timeline.planned_end = uiData.end_date === '' ? null : uiData.end_date;
        if (uiData.actual_start !== undefined) timeline.actual_start = uiData.actual_start === '' ? null : uiData.actual_start;
        if (uiData.actual_end !== undefined) timeline.actual_end = uiData.actual_end === '' ? null : uiData.actual_end;
        
        updateData.timeline = timeline;
      }
      
      const { data: phase, error } = await supabase
        .from('be_phase')
        .update(cleanUpdateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Handle optimistic actual_end date when phase is marked as completed
      if (uiFormat && 'status' in data && data.status === 'COMPLETED') {
        await handlePhaseCompletionTimelineUpdate(id);
      }
      
      // Return in requested format
      return uiFormat ? transformDatabaseToUI(phase) : phase;
    },
    // Optimistic updates (only for non-UI format to maintain compatibility)
    onMutate: optimistic && !uiFormat ? async (variables) => {
      const phaseId = variables.id;
      const detailKey = queryKeys.phases.detail(phaseId);

      await queryClient.cancelQueries({ queryKey: detailKey });

      const prevDetail = queryClient.getQueryData(detailKey) as unknown;
      const projectId: string | undefined = (prevDetail as { project_id?: string } | undefined)?.project_id;
      const listKey = projectId ? queryKeys.phases.byProject(projectId) : undefined;
      if (listKey) await queryClient.cancelQueries({ queryKey: listKey });
      const prevList = listKey ? (queryClient.getQueryData(listKey) as unknown[]) : undefined;

      if (prevDetail) {
        const optimisticDetail = {
          ...prevDetail,
          ...(variables.name !== undefined ? { name: variables.name } : {}),
          ...(variables.description !== undefined ? { description: variables.description } : {}),
          ...(variables.category !== undefined ? { category: variables.category } : {}),
          ...(variables.status !== undefined ? { status: variables.status } : {}),
          ...('details' in variables && variables.details !== undefined ? { details: variables.details } : {}),
          ...('timeline' in variables && variables.timeline !== undefined
            ? { timeline: { ...(prevDetail as { timeline?: { [key: string]: unknown } } | undefined)?.timeline, ...variables.timeline } }
            : {}),
          ...('budget' in variables && variables.budget !== undefined
            ? { budget: { ...(prevDetail as { budget?: { [key: string]: unknown } } | undefined)?.budget, ...variables.budget } }
            : {}),
        };
        queryClient.setQueryData(detailKey, optimisticDetail);

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
    } : undefined,
    onSuccess: async (updatedPhase, variables) => {
      const projectId = 'project_id' in updatedPhase ? updatedPhase.project_id : (updatedPhase as PhaseResponse).project_id;
      const phaseId = 'id' in updatedPhase ? updatedPhase.id : (updatedPhase as PhaseResponse).id;
      
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.phases.byProject(projectId) 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.phases.detail(phaseId) 
      });

      // CRITICAL: Invalidate consolidated project query for real-time updates
      queryClient.invalidateQueries({
        queryKey: ['project-consolidated', projectId]
      });

      // Invalidate timeline query if requested (for ProjectDetails)
      if (invalidateTimeline) {
        queryClient.invalidateQueries({ 
          queryKey: ['timeline', projectId] 
        });
      }

      toast.success('Phase updated successfully');

      // Enhanced activity tracking
      const phaseName = 'name' in updatedPhase ? updatedPhase.name : (updatedPhase as PhaseResponse).name;
      const wasCompleted = 'status' in variables ? variables.status === 'COMPLETED' || variables.status === 'completed' : false;
      const hasTimelineChange = 'timeline' in variables ? !!(variables.timeline && Object.keys(variables.timeline).length > 0) : false;
      
      try {
        const title = wasCompleted
          ? `Phase completed: ${phaseName}`
          : hasTimelineChange
          ? `Phase timeline updated: ${phaseName}`
          : `Phase updated: ${phaseName}`;

        const description = wasCompleted
          ? `Project phase "${phaseName}" was marked as completed`
          : hasTimelineChange
          ? `Timeline dates were updated for phase "${phaseName}"`
          : `Project phase "${phaseName}" was modified`;
          
        const userName = user?.user_metadata
          ? [user.user_metadata.first_name, user.user_metadata.last_name].filter(Boolean).join(' ') || undefined
          : undefined;
        const activityStatus = wasCompleted ? 'success' : 'info';

        const result = await activityService.createActivity({
          project_id: projectId,
          activity_type: 'phase_update',
          title,
          description,
          user_id: user?.id,
          user_name: userName,
          entity_type: 'phase',
          entity_id: phaseId,
          metadata: {
            phaseName,
            status: 'status' in variables ? variables.status : undefined,
            updates: variables
          },
          status: activityStatus
        });
        
      } catch (err) {
        console.error('Failed to create activity for phase update:', err);
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
    onSettled: optimistic && !uiFormat ? async (_data, _error, variables, _context) => {
      const phaseId = variables?.id;
      if (phaseId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.phases.detail(phaseId) });
      }
      if (phaseId) {
        const detail = queryClient.getQueryData(queryKeys.phases.detail(phaseId)) as unknown;
        const projectId = (detail as { project_id?: string } | undefined)?.project_id as string | undefined;
        if (projectId) {
          queryClient.invalidateQueries({ queryKey: queryKeys.phases.byProject(projectId) });
        }
      }
    } : undefined
  });
}

/**
 * Helper function to set actual_end when phase is marked as completed
 */
async function handlePhaseCompletionTimelineUpdate(phaseId: string) {
  try {
    // Get current phase timeline
    const { data: phase, error } = await supabase
      .from('be_phase')
      .select('timeline')
      .eq('id', phaseId)
      .single();

    if (error) {
      console.warn('[PHASE_COMPLETION] Could not fetch phase for completion update:', error);
      return;
    }

    const currentTimeline = phase.timeline || {};
    
    // Only set actual_end if not already set
    if (!currentTimeline.actual_end) {
      const now = new Date().toISOString().split('T')[0];
      const updatedTimeline = {
        ...currentTimeline,
        actual_end: now
      };

      const { error: updateError } = await supabase
        .from('be_phase')
        .update({ timeline: updatedTimeline })
        .eq('id', phaseId);

      if (updateError) {
        console.error('[PHASE_COMPLETION] Failed to update phase completion timeline:', updateError);
      } else {
        console.log('[PHASE_COMPLETION] Phase actual_end set on completion:', {
          phaseId,
          actualEnd: now
        });
      }
    }
  } catch (error) {
    console.error('[PHASE_COMPLETION] Error in handlePhaseCompletionTimelineUpdate:', error);
  }
}

/**
 * Hook to delete a phase
 */
export function useDeletePhase(options?: { invalidateTimeline?: boolean }) {
  const queryClient = useQueryClient();
  const { user } = useSupabaseAuth();
  const invalidateTimeline = options?.invalidateTimeline || false;

  return useMutation({
    mutationFn: async (phaseId: string) => {
      // First get the phase details for cache invalidation and activity logging
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
      return { phaseId, projectId: phase?.project_id, phaseName: phase?.name };
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

        // CRITICAL: Invalidate consolidated project query for real-time updates
        queryClient.invalidateQueries({
          queryKey: ['project-consolidated', projectId]
        });

        // Invalidate timeline query if requested (for ProjectDetails)
        if (invalidateTimeline) {
          queryClient.invalidateQueries({ 
            queryKey: ['timeline', projectId] 
          });
        }
      }

      // Remove the specific phase from cache
      queryClient.removeQueries({ 
        queryKey: queryKeys.phases.detail(phaseId) 
      });

      toast.success('Phase deleted successfully');

      // Track activity
      try {
        if (projectId) {
          const userName = user?.user_metadata
            ? [user.user_metadata.first_name, user.user_metadata.last_name].filter(Boolean).join(' ') || undefined
            : undefined;
          
          const result = await activityService.createActivity({
            project_id: projectId,
            activity_type: 'phase_delete',
            title: `Phase removed: ${phaseName || phaseId}`,
            description: `Project phase "${phaseName || 'Unknown Phase'}" was deleted`,
            user_id: user?.id,
            user_name: userName,
            entity_type: 'phase',
            entity_id: phaseId,
            metadata: { phaseId, phaseName: phaseName || null },
            status: 'warning'
          });
          
        }
      } catch (err) {
        console.error('Failed to create activity for phase deletion:', err);
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

      // CRITICAL: Invalidate consolidated project query for real-time updates
      queryClient.invalidateQueries({
        queryKey: ['project-consolidated', variables.projectId]
      });

      toast.success('Phases reordered successfully');

      // Track activity
      try {
        const userName = user?.user_metadata
          ? [user.user_metadata.first_name, user.user_metadata.last_name].filter(Boolean).join(' ') || undefined
          : undefined;
        
        await activityService.createActivity({
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
        
      } catch (err) {
        console.error('[ACTIVITY_DEBUG] Failed to create activity for phase reorder:', {
          error: err,
          projectId: variables.projectId,
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

/**
 * Hook to get phases with flexible query configuration
 */
export function useProjectPhases(projectId: string, options?: { 
  uiFormat?: boolean;
  queryKey?: (string | number)[];
}) {
  const uiFormat = options?.uiFormat || false;
  const queryKey = options?.queryKey || queryKeys.phases.byProject(projectId);
  
  return {
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('be_phase')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Transform data if UI format requested
      return uiFormat 
        ? data.map(phase => transformDatabaseToUI(phase))
        : data;
    }
  };
}

// Backwards compatibility exports
export const useCreateProjectDetailsPhase = () => useCreatePhase({ uiFormat: true, currency: 'GHS', invalidateTimeline: true });
export const useUpdateProjectDetailsPhase = () => useUpdatePhase({ uiFormat: true, invalidateTimeline: true });
export const useDeleteProjectDetailsPhase = () => useDeletePhase({ invalidateTimeline: true });
export const useProjectDetailsPhases = (projectId: string) => useProjectPhases(projectId, { 
  uiFormat: true, 
  queryKey: ['timeline', projectId] 
});

// Type aliases for backwards compatibility
export type ProjectDetailsPhase = CreatePhaseUIData & {
  id: string;
  timeline?: PhaseTimeline;
  budget?: PhaseBudget;
  details?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
};