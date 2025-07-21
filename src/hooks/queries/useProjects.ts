/**
 * Projects page query hooks for BuildEase construction management
 * Handles fetching project lists, metrics, and filtering with mobile-first optimization
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryClient';
import type { ProjectStatus } from '@/types/project';

export interface ProjectFilters {
  status?: ProjectStatus | 'all';
  search?: string;
  type?: string;
  client?: string;
}

export interface ProjectMetrics {
  totalProjects: number;
  completedProjects: number;
  activeProjects: number;
  totalBudget: number;
  totalSpent: number;
  spentPercentage: number;
}

/**
 * Hook to fetch filtered project list for Projects page
 * Supports server-side filtering and search for optimal performance
 */
export const useProjects = (filters?: ProjectFilters) => {
  return useQuery({
    queryKey: queryKeys.projects.list(filters || {}),
    queryFn: async () => {
      let query = supabase
        .from('be_project')
        .select(`
          id,
          name,
          description,
          status,
          details,
          timeline,
          budget,
          profile_image,
          created_at,
          updated_at,
          be_project_member!inner (
            user_id,
            role
          )
        `)
        .order('updated_at', { ascending: false });

      // Apply status filter
      if (filters?.status && filters.status !== 'all') {
        // Map UI status to database status
        const dbStatus = mapUIStatusToDBStatus(filters.status);
        query = query.eq('status', dbStatus);
      }

      // Apply search filter
      if (filters?.search && filters.search.trim()) {
        const searchTerm = filters.search.trim();
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,details->>client_name.ilike.%${searchTerm}%,details->>location.ilike.%${searchTerm}%,details->>project_type.ilike.%${searchTerm}%`);
      }

      // Apply type filter
      if (filters?.type) {
        query = query.eq('details->>project_type', filters.type);
      }

      // Apply client filter
      if (filters?.client) {
        query = query.eq('details->>client_name', filters.client);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }

      return data;
    },
    staleTime: 30 * 1000, // 30 seconds - project list changes frequently
    gcTime: 5 * 60 * 1000, // 5 minutes cache time
  });
};

/**
 * Hook to fetch project metrics for dashboard
 * Optimized single query for aggregate data
 */
export const useProjectMetrics = () => {
  return useQuery({
    queryKey: queryKeys.projects.metrics(),
    queryFn: async () => {
      // Get all projects for current user with budget info
      const { data, error } = await supabase
        .from('be_project')
        .select(`
          id,
          status,
          budget,
          be_project_member!inner (
            user_id,
            role
          )
        `);

      if (error) {
        console.error('Error fetching project metrics:', error);
        throw error;
      }

      // Calculate metrics client-side for now (can be optimized with DB functions later)
      const totalProjects = data.length;
      const completedProjects = data.filter(p => p.status === 'COMPLETED').length;
      const activeProjects = data.filter(p => p.status === 'IN_PROGRESS').length;
      
      const totalBudget = data.reduce((acc, project) => {
        const budget = project.budget as { allocated?: number; spent?: number; currency?: string };
        return acc + (budget?.allocated || 0);
      }, 0);
      
      const totalSpent = data.reduce((acc, project) => {
        const budget = project.budget as { allocated?: number; spent?: number; currency?: string };
        return acc + (budget?.spent || 0);
      }, 0);
      
      const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

      const metrics: ProjectMetrics = {
        totalProjects,
        completedProjects,
        activeProjects,
        totalBudget,
        totalSpent,
        spentPercentage,
      };

      return metrics;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - metrics change less frequently
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
  });
};

/**
 * Hook to fetch projects grouped by status for tab counts
 * Efficient query for status-based filtering
 */
export const useProjectsByStatus = () => {
  return useQuery({
    queryKey: queryKeys.projects.byStatus(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('be_project')
        .select(`
          status,
          be_project_member!inner (
            user_id,
            role
          )
        `);

      if (error) {
        console.error('Error fetching projects by status:', error);
        throw error;
      }

      // Group by status and map to UI format
      const statusCounts = data.reduce((acc, project) => {
        const uiStatus = mapDBStatusToUIStatus(project.status);
        acc[uiStatus] = (acc[uiStatus] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        all: data.length,
        active: statusCounts.active || 0,
        planning: statusCounts.planning || 0,
        completed: statusCounts.completed || 0,
        upcoming: statusCounts.upcoming || 0,
        'on-hold': statusCounts['on-hold'] || 0,
      };
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes cache time
  });
};

/**
 * Hook for project search with debouncing
 * Optimized for real-time search functionality
 */
export const useProjectSearch = (searchTerm: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.projects.search(searchTerm),
    queryFn: async () => {
      if (!searchTerm.trim()) return [];

      const { data, error } = await supabase
        .from('be_project')
        .select(`
          id,
          name,
          description,
          details,
          profile_image,
          be_project_member!inner (
            user_id,
            role
          )
        `)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,details->>client_name.ilike.%${searchTerm}%,details->>location.ilike.%${searchTerm}%`)
        .limit(10); // Limit search results for performance

      if (error) {
        console.error('Error searching projects:', error);
        throw error;
      }

      return data;
    },
    enabled: enabled && searchTerm.trim().length >= 2, // Only search with 2+ characters
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes cache time
  });
};

/**
 * Map UI status values to database status values
 */
function mapUIStatusToDBStatus(uiStatus: ProjectStatus): string {
  switch (uiStatus) {
    case 'active':
      return 'IN_PROGRESS';
    case 'planning':
      return 'PLANNING';
    case 'completed':
      return 'COMPLETED';
    case 'upcoming':
      return 'PLANNING'; // Map upcoming to planning for now
    case 'on-hold':
      return 'ON_HOLD';
    default:
      return 'PLANNING';
  }
}

/**
 * Map database status values to UI status values
 */
function mapDBStatusToUIStatus(dbStatus: string): ProjectStatus {
  switch (dbStatus) {
    case 'IN_PROGRESS':
      return 'active';
    case 'PLANNING':
      return 'planning';
    case 'COMPLETED':
      return 'completed';
    case 'ON_HOLD':
      return 'on-hold';
    default:
      return 'planning';
  }
}
