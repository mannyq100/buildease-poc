/**
 * Hook for fetching project summary data from construction_mgr.project_summary view
 * Provides comprehensive project metrics and metadata in a single query
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryClient';
import type { ProjectSummary } from '@/types/projectSummary';

export interface ProjectMetrics {
  totalProjects: number;
  completedProjects: number;
  activeProjects: number;
  planningProjects: number;
  onHoldProjects: number;
  totalBudget: number;
  totalSpent: number;
  spentPercentage: number;
  averageProgress: number;
  projectsThisMonth: number;
  completedThisMonth: number;
}

export function useProjectSummary(projectId: string | undefined) {
  return useQuery<ProjectSummary | null>({
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
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Helper hook for multiple project summaries
export function useProjectSummaries(projectIds: string[] = []) {
  return useQuery<ProjectSummary[]>({
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
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for fetching all project summaries with filtering
export interface ProjectSummaryFilters {
  status?: 'active' | 'planning' | 'completed' | 'on-hold' | 'all';
  search?: string;
  type?: string;
  client?: string;
}

export function useAllProjectSummaries(filters?: ProjectSummaryFilters) {
  return useQuery<ProjectSummary[]>({
    queryKey: ['all-project-summaries', filters],
    queryFn: async (): Promise<ProjectSummary[]> => {
      let query = supabase
        .from('project_summary')
        .select('*')
        .order('updated_at', { ascending: false });

      // Apply status filter
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      // Apply search filter
      if (filters?.search && filters.search.trim()) {
        const searchTerm = filters.search.trim();
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,client.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,project_type.ilike.%${searchTerm}%`);
      }

      // Apply type filter
      if (filters?.type) {
        query = query.eq('project_type', filters.type);
      }

      // Apply client filter
      if (filters?.client) {
        query = query.eq('client', filters.client);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch project metrics for dashboard
 * Uses project_summary view for optimized aggregate data
 */
export const useProjectMetrics = () => {
  return useQuery<ProjectMetrics>({
    queryKey: queryKeys.aggregations.metrics(),
    queryFn: async () => {
      // Use project_summary view for better performance
      const { data, error } = await supabase
        .from('project_summary')
        .select(`
          id,
          status,
          budget,
          spent,
          progress,
          created_at,
          updated_at
        `);

      if (error) {
        console.error('Error fetching project metrics:', error);
        throw error;
      }

      // Calculate metrics from project_summary data
      const totalProjects = data.length;
      const completedProjects = data.filter(p => p.status === 'completed').length;
      const activeProjects = data.filter(p => p.status === 'active').length;
      const planningProjects = data.filter(p => p.status === 'planning').length;
      const onHoldProjects = data.filter(p => p.status === 'on-hold').length;
      
      const totalBudget = data.reduce((acc, project) => acc + (project.budget || 0), 0);
      const totalSpent = data.reduce((acc, project) => acc + (project.spent || 0), 0);
      const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
      const averageProgress = totalProjects > 0 ? data.reduce((acc, project) => acc + (project.progress || 0), 0) / totalProjects : 0;
      
      // Calculate projects from this month
      const currentMonth = new Date();
      const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const projectsThisMonth = data.filter(p => new Date(p.created_at) >= currentMonthStart).length;
      const completedThisMonth = data.filter(p => 
        p.status === 'completed' && new Date(p.updated_at) >= currentMonthStart
      ).length;

      const metrics: ProjectMetrics = {
        totalProjects,
        completedProjects,
        activeProjects,
        planningProjects,
        onHoldProjects,
        totalBudget,
        totalSpent,
        spentPercentage,
        averageProgress,
        projectsThisMonth,
        completedThisMonth,
      };

      return metrics;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - metrics change less frequently
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
  });
};