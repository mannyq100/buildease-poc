/**
 * Hook for fetching project summary data from construction_mgr.project_summary view
 * Provides comprehensive project metrics and metadata in a single query
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ProjectSummary } from '@/types/projectSummary';

export function useProjectSummary(projectId: string | undefined) {
  return useQuery({
    queryKey: ['project-summary', projectId],
    queryFn: async (): Promise<ProjectSummary | null> => {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      const { data, error } = await supabase
        .from('project_summary')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Helper hook for multiple project summaries
export function useProjectSummaries(projectIds: string[] = []) {
  return useQuery({
    queryKey: ['project-summaries', projectIds.sort()],
    queryFn: async (): Promise<ProjectSummary[]> => {
      if (projectIds.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from('project_summary')
        .select('*')
        .in('id', projectIds)
        .order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    },
    enabled: projectIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}