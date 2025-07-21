/**
 * Phase query hooks for BuildEase construction management
 * Handles fetching phase data from Supabase with mobile-first optimization
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryClient';

/**
 * Hook to fetch all phases for a specific project
 * Returns phases ordered by creation date
 */
export const useProjectPhases = (projectId: string) => {
  return useQuery({
    queryKey: queryKeys.phases.byProject(projectId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('be_phase')
        .select(`
          id,
          name,
          description,
          category,
          status,
          project_id,
          details,
          timeline,
          budget,
          created_at,
          updated_at
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching project phases:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!projectId,
    staleTime: 3 * 60 * 1000, // 3 minutes - phases change moderately
  });
};

/**
 * Hook to fetch a single phase by ID
 * Returns detailed phase information
 */
export const usePhase = (phaseId: string) => {
  return useQuery({
    queryKey: queryKeys.phases.detail(phaseId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('be_phase')
        .select(`
          id,
          name,
          description,
          category,
          status,
          project_id,
          details,
          timeline,
          budget,
          created_at,
          updated_at
        `)
        .eq('id', phaseId)
        .single();
      
      if (error) {
        console.error('Error fetching phase:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!phaseId,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

/**
 * Hook to get the current active phase for a project
 * Returns the phase with status 'IN_PROGRESS' or the first 'PLANNING' phase
 */
export const useCurrentPhase = (projectId: string) => {
  return useQuery({
    queryKey: [...queryKeys.phases.byProject(projectId), 'current'],
    queryFn: async () => {
      // First try to get an IN_PROGRESS phase
      const { data: inProgressPhase, error: inProgressError } = await supabase
        .from('be_phase')
        .select(`
          id,
          name,
          description,
          category,
          status,
          project_id,
          details,
          timeline,
          budget,
          created_at,
          updated_at
        `)
        .eq('project_id', projectId)
        .eq('status', 'IN_PROGRESS')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (inProgressError) {
        console.error('Error fetching in-progress phase:', inProgressError);
        throw inProgressError;
      }

      // If we have an in-progress phase, return it
      if (inProgressPhase) {
        return inProgressPhase;
      }

      // Otherwise, get the first planning phase
      const { data: planningPhase, error: planningError } = await supabase
        .from('be_phase')
        .select(`
          id,
          name,
          description,
          category,
          status,
          project_id,
          details,
          timeline,
          budget,
          created_at,
          updated_at
        `)
        .eq('project_id', projectId)
        .eq('status', 'PLANNING')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (planningError) {
        console.error('Error fetching planning phase:', planningError);
        throw planningError;
      }

      return planningPhase;
    },
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000, // 2 minutes - current phase is important for UI
  });
};
