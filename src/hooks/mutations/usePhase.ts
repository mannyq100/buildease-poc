import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'sonner';

// Types for phase mutations
export interface CreatePhaseData {
  name: string;
  description?: string;
  category: string;
  project_id: string;
  status?: 'PLANNING' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED';
  timeline?: {
    planned_start?: string;
    planned_end?: string;
    actual_start?: string;
    actual_end?: string;
  };
  budget?: {
    allocated?: number;
    spent?: number;
    currency?: string;
  };
  details?: Record<string, any>;
}

export interface UpdatePhaseData {
  id: string;
  name?: string;
  description?: string;
  category?: string;
  status?: 'PLANNING' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED';
  timeline?: {
    planned_start?: string;
    planned_end?: string;
    actual_start?: string;
    actual_end?: string;
  };
  budget?: {
    allocated?: number;
    spent?: number;
    currency?: string;
  };
  details?: Record<string, any>;
}

/**
 * Hook to create a new phase
 */
export function useCreatePhase() {
  const queryClient = useQueryClient();

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
    onSuccess: (newPhase, variables) => {
      // Invalidate and refetch project phases
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.phases.byProject(variables.project_id) 
      });
      
      // Invalidate current phase query
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.phases.current(variables.project_id) 
      });
      
      // Invalidate project query to update phase count
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.projects.detail(variables.project_id) 
      });

      toast.success('Phase created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating phase:', error);
      toast.error(error.message || 'Failed to create phase');
    }
  });
}

/**
 * Hook to update an existing phase
 */
export function useUpdatePhase() {
  const queryClient = useQueryClient();

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
    onSuccess: (updatedPhase) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.phases.byProject(updatedPhase.project_id) 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.phases.detail(updatedPhase.id) 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.phases.current(updatedPhase.project_id) 
      });

      toast.success('Phase updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating phase:', error);
      toast.error(error.message || 'Failed to update phase');
    }
  });
}

/**
 * Hook to delete a phase
 */
export function useDeletePhase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (phaseId: string) => {
      // First get the phase to know which project to invalidate
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
    onSuccess: ({ phaseId, projectId }) => {
      if (projectId) {
        // Invalidate and refetch related queries
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.phases.byProject(projectId) 
        });
        
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.phases.current(projectId) 
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
    },
    onError: (error: any) => {
      console.error('Error deleting phase:', error);
      toast.error(error.message || 'Failed to delete phase');
    }
  });
}

/**
 * Hook to reorder phases
 */
export function useReorderPhases() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      projectId, 
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
    onSuccess: (_, variables) => {
      // Invalidate and refetch project phases
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.phases.byProject(variables.projectId) 
      });

      toast.success('Phases reordered successfully');
    },
    onError: (error: any) => {
      console.error('Error reordering phases:', error);
      toast.error(error.message || 'Failed to reorder phases');
    }
  });
}
