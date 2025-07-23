/**
 * Project CRUD mutation hooks for BuildEase construction management
 * Handles create, update, delete operations for projects with optimistic updates
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryClient';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from 'sonner';
import { ProjectTransformService } from '@/services/projectTransformService';
import type { Project } from '@/types/project';

/**
 * Hook to create a new project
 * Includes optimistic UI updates and proper cache invalidation
 */
export function useCreateProject() {
  const queryClient = useQueryClient();
  const { user } = useSupabaseAuth();

  return useMutation({
    mutationFn: async (projectData: Partial<Project>) => {
      if (!user) {
        throw new Error('User must be authenticated to create projects');
      }

      const supabaseData = ProjectTransformService.transformForMutation(projectData);
      
      const { data, error } = await supabase
        .from('be_project')
        .insert({
          ...supabaseData,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch projects list and metrics
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.metrics() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.byStatus() });
      
      toast.success('Project created successfully!');
    },
    onError: (error: Error) => {
      console.error('Failed to create project:', error);
      toast.error('Failed to create project. Please try again.');
    },
  });
}

/**
 * Hook to update an existing project
 * Includes optimistic UI updates for immediate feedback
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...projectData }: Partial<Project> & { id: string }) => {
      const supabaseData = ProjectTransformService.transformForMutation(projectData);
      
      const { data, error } = await supabase
        .from('be_project')
        .update({
          ...supabaseData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating project:', error);
        throw error;
      }

      return data;
    },
    onMutate: async (updatedProject) => {
      // Cancel outgoing refetches to prevent optimistic update conflicts
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.all });
      
      // Snapshot previous values for rollback
      const previousProjects = queryClient.getQueryData(queryKeys.projects.all);
      
      // Optimistically update project lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.projects.all },
        (oldData: unknown) => {
          if (!oldData || !Array.isArray(oldData)) return oldData;
          return oldData.map((project: Record<string, unknown>) =>
            project.id === updatedProject.id
              ? { ...project, ...adaptUIProjectToSupabase(updatedProject) }
              : project
          );
        }
      );
      
      return { previousProjects };
    },
    onError: (error, _updatedProject, context) => {
      // Rollback optimistic update on error
      if (context?.previousProjects) {
        queryClient.setQueryData(queryKeys.projects.all, context.previousProjects);
      }
      
      console.error('Failed to update project:', error);
      toast.error('Failed to update project. Please try again.');
    },
    onSuccess: () => {
      toast.success('Project updated successfully!');
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.metrics() });
    },
  });
}

/**
 * Hook to delete a project
 * Includes confirmation and optimistic removal
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from('be_project')
        .delete()
        .eq('id', projectId);

      if (error) {
        console.error('Error deleting project:', error);
        throw error;
      }

      return projectId;
    },
    onMutate: async (projectId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.all });
      
      // Snapshot previous values
      const previousProjects = queryClient.getQueryData(queryKeys.projects.all);
      
      // Optimistically remove project from lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.projects.all },
        (oldData: unknown) => {
          if (!oldData || !Array.isArray(oldData)) return oldData;
          return oldData.filter((project: Record<string, unknown>) => project.id !== projectId);
        }
      );
      
      return { previousProjects };
    },
    onError: (error, _projectId, context) => {
      // Rollback optimistic update on error
      if (context?.previousProjects) {
        queryClient.setQueryData(queryKeys.projects.all, context.previousProjects);
      }
      
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project. Please try again.');
    },
    onSuccess: () => {
      toast.success('Project deleted successfully!');
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.metrics() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.byStatus() });
    },
  });
}

/**
 * Hook to duplicate an existing project
 * Creates a copy with modified name and reset dates
 */
export function useDuplicateProject() {
  const queryClient = useQueryClient();
  const { user } = useSupabaseAuth();

  return useMutation({
    mutationFn: async (originalProject: Project) => {
      if (!user) {
        throw new Error('User must be authenticated to duplicate projects');
      }

      // Prepare duplicated project data
      const duplicatedData = {
        ...adaptUIProjectToSupabase(originalProject),
        name: `${originalProject.name} (Copy)`,
        owner_id: user.id,
        timeline: {
          planned_start: null,
          planned_end: null,
          actual_start: null,
          actual_end: null,
        },
        budget: {
          allocated: originalProject.budget,
          spent: 0,
          currency: 'USD',
        },
      };

      const { data, error } = await supabase
        .from('be_project')
        .insert(duplicatedData)
        .select()
        .single();

      if (error) {
        console.error('Error duplicating project:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch projects
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.metrics() });
      
      toast.success('Project duplicated successfully!');
    },
    onError: (error: Error) => {
      console.error('Failed to duplicate project:', error);
      toast.error('Failed to duplicate project. Please try again.');
    },
  });
}

/**
 * Hook to update project status
 * Optimized for quick status changes
 */
export function useUpdateProjectStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, status }: { projectId: string; status: string }) => {
      const { data, error } = await supabase
        .from('be_project')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .select()
        .single();

      if (error) {
        console.error('Error updating project status:', error);
        throw error;
      }

      return data;
    },
    onMutate: async ({ projectId, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.all });
      
      // Snapshot previous values
      const previousProjects = queryClient.getQueryData(queryKeys.projects.all);
      
      // Optimistically update project status
      queryClient.setQueriesData(
        { queryKey: queryKeys.projects.all },
        (oldData: unknown) => {
          if (!oldData || !Array.isArray(oldData)) return oldData;
          return oldData.map((project: Record<string, unknown>) =>
            project.id === projectId
              ? { ...project, status, updated_at: new Date().toISOString() }
              : project
          );
        }
      );
      
      return { previousProjects };
    },
    onError: (error, _variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousProjects) {
        queryClient.setQueryData(queryKeys.projects.all, context.previousProjects);
      }
      
      console.error('Failed to update project status:', error);
      toast.error('Failed to update project status. Please try again.');
    },
    onSuccess: () => {
      toast.success('Project status updated successfully!');
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.metrics() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.byStatus() });
    },
  });
}
