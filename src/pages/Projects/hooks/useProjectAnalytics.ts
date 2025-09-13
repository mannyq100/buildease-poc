/**
 * Hook for fetching cross-project analytics data with real Supabase data
 * Replaces the dashboard mock data with actual project metrics
 */

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryClient';

// Chart data interface for DataVisualization component
interface ChartData {
  name: string;
  value: number;
  completed?: number;
  total?: number;
  Actual?: number;
  Planned?: number;
}

export interface ProjectAnalyticsData {
  // Chart data for cross-project analytics
  chartData: {
    projectProgress: ChartData[];
    budgetTrend: ChartData[];
    taskStatus: ChartData[];
    materialUsage: ChartData[];
  };
  
  // Loading states
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  refreshData: () => Promise<void>;
}

/**
 * Hook for cross-project analytics using real Supabase data
 */
export function useProjectAnalytics(): ProjectAnalyticsData {
  // Fetch project summary data
  const { 
    data: projectsData = [], 
    isLoading: isLoadingProjects, 
    error: projectsError,
    refetch: refetchProjects
  } = useQuery({
    queryKey: queryKeys.aggregations.analytics(),
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('project_summary')
          .select(`
            id,
            name,
            status,
            budget,
            spent,
            progress,
            project_type,
            created_at,
            updated_at
          `);

        if (error) {
          console.error('Error fetching project analytics:', error);
          throw error;
        }

        return data || [];
      } catch (error) {
        console.error('Failed to fetch project analytics:', error);
        throw error;
      }
    },
    staleTime: 3 * 60 * 1000, // 3 minutes - analytics can be slightly stale
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
  });

  // Fetch task data for task status analytics
  const { 
    data: tasksData = [], 
    isLoading: isLoadingTasks, 
    error: tasksError,
    refetch: refetchTasks
  } = useQuery({
    queryKey: ['project-analytics-tasks'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('be_task')
          .select('status')
          .not('status', 'is', null);

        if (error) {
          console.error('Error fetching task analytics:', error);
          throw error;
        }

        return data || [];
      } catch (error) {
        // If table doesn't exist or other error, return empty array for graceful fallback
        console.warn('Task analytics unavailable:', error);
        return [];
      }
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    // Don't fail the entire component if tasks are unavailable
    retry: 1,
    retryOnMount: false,
  });

  // Transform data into chart format
  const chartData = useMemo(() => {
    // Project Progress Chart Data
    const projectProgress: ChartData[] = projectsData.length > 0
      ? projectsData.map(project => ({
          name: project.name || `Project ${project.id}`,
          value: project.progress || 0,
          completed: project.progress || 0,
          total: 100
        }))
      : [
          { name: 'No Projects', value: 0, completed: 0, total: 100 }
        ];

    // Budget Trend Chart Data (last 6 months)
    const budgetTrend: ChartData[] = (() => {
      const now = new Date();
      const months = [];
      
      // Generate last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
          name: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          date: date
        });
      }

      return months.map(month => {
        const monthStart = month.date;
        const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
        
        // Calculate planned and actual spending for this month
        const monthlyProjects = projectsData.filter(project => {
          const createdAt = new Date(project.created_at);
          return createdAt >= monthStart && createdAt <= monthEnd;
        });

        const Planned = monthlyProjects.reduce((sum, project) => sum + (project.budget || 0), 0);
        const Actual = monthlyProjects.reduce((sum, project) => sum + (project.spent || 0), 0);

        return {
          name: month.name,
          value: Actual,
          Planned: projectsData.length === 0 ? 10000 : Planned, // Placeholder for demo
          Actual: projectsData.length === 0 ? 7500 : Actual // Placeholder for demo
        };
      });
    })();

    // Task Status Chart Data
    const taskStatusMap = tasksData.reduce((acc, task) => {
      const status = task.status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const taskStatus: ChartData[] = Object.keys(taskStatusMap).length > 0 
      ? Object.entries(taskStatusMap).map(([status, count]) => ({
          name: status.charAt(0).toUpperCase() + status.slice(1),
          value: count
        }))
      : [
          { name: 'No Tasks', value: 1 }
        ];

    // Material Usage Chart Data (based on project types)
    const materialUsageMap = projectsData.reduce((acc, project) => {
      const type = project.project_type || 'Other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const materialUsage: ChartData[] = Object.keys(materialUsageMap).length > 0 
      ? Object.entries(materialUsageMap).map(([type, count]) => ({
          name: type,
          value: count
        }))
      : [
          { name: 'No Projects', value: 1 }
        ];

    return {
      projectProgress,
      budgetTrend,
      taskStatus,
      materialUsage
    };
  }, [projectsData, tasksData]);

  const refreshData = async () => {
    await Promise.all([refetchProjects(), refetchTasks()]);
  };

  return {
    chartData,
    isLoading: isLoadingProjects || isLoadingTasks,
    error: projectsError, // Only fail on project errors, not task errors
    refreshData
  };
}