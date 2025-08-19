/**
 * Optimized Today's Focus Hook
 * Uses server-side urgency calculations from database views
 * Eliminates client-side heavy computations
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface TodaysFocusTask {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  project_id: string;
  project_name: string;
  phase_id?: string;
  phase_name?: string;
  assigned_to?: string;
  assigned_user_name?: string;
  urgency_score: number; // Server-calculated
  focus_category: 'overdue' | 'due_today' | 'urgent' | 'high_priority' | 'important';
  created_at: string;
  updated_at: string;
}

/**
 * Hook to get today's focus tasks with server-side urgency scoring
 * Replaces client-side urgency calculations with database view
 */
export function useTodaysFocusOptimized(projectId?: string, limit: number = 5) {
  return useQuery({
    queryKey: ['todays-focus-optimized', projectId, limit],
    queryFn: async (): Promise<TodaysFocusTask[]> => {
      // Don't make query if projectId is empty/undefined
      if (!projectId) {
        return [];
      }

      const query = supabase
        .from('todays_focus_tasks')
        .select('*')
        .eq('project_id', projectId)
        .limit(limit);

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    },
    enabled: !!projectId, // Only run query if projectId is provided
    staleTime: 1 * 60 * 1000, // 1 minute - fresh data for today's focus
    gcTime: 2 * 60 * 1000, // 2 minutes cache
  });
}

/**
 * Hook specifically for project-level today's focus
 * Returns tasks with server-calculated urgency scores
 */
export function useProjectTodaysFocus(projectId: string, limit: number = 5) {
  return useTodaysFocusOptimized(projectId, limit);
}

/**
 * Hook for global today's focus (all projects)
 */
export function useGlobalTodaysFocus(limit: number = 10) {
  return useTodaysFocusOptimized(undefined, limit);
}