import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'sonner';
import { ProjectTransformService } from '@/services/projectTransformService';
import type { ProjectStatus } from '@/types/project';

// Types for project mutations
export interface CreateProjectData {
  name: string;
  description?: string;
  client_name?: string;
  project_type?: string;
  location?: string;
  budget?: number;
  start_date?: string;
  end_date?: string;
  status?: ProjectStatus;
  details?: any;
  profile_image?: string;
  inspiration_images?: string[];
  progress_images?: string[];
}

export interface UpdateProjectData {
  id: string;
  name?: string;
  description?: string;
  client?: string;
  project_type?: string;
  location?: string; // Street address portion can be updated
  budget?: number;
  currency?: string;
  start_date?: string;
  end_date?: string;
  status?: ProjectStatus;
  progress_percentage?: number;
  spent_amount?: number;
  details?: any;
  profile_image?: string;
  inspiration_images?: string[];
  progress_images?: string[];
}

/**
 * Hook to create a new project
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProjectData) => {
      // Map UI status to database status if provided
      const createData = {
        ...data,
        ...(data.status && { status: ProjectTransformService.mapUIStatusToDBStatus(data.status) })
      };

      const { data: project, error } = await supabase
        .from('be_project')
        .insert([createData])
        .select()
        .single();

      if (error) throw error;
      return project;
    },
    onSuccess: (newProject) => {
      // Invalidate and refetch user projects list
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.projects.all 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.projects.list({}) 
      });
      
      // Add the new project to the cache
      queryClient.setQueryData(
        queryKeys.projects.detail(newProject.id), 
        newProject
      );

      toast.success('Project created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating project:', error);
      toast.error(error.message || 'Failed to create project');
    }
  });
}

/**
 * Hook to update an existing project
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProjectData) => {
      const { 
        id, 
        client, 
        project_type, 
        location, 
        budget, 
        currency, 
        start_date, 
        end_date,
        ...directFields 
      } = data;
      
      // Structure the update data to match the database schema
      const updateData: any = {
        ...directFields
      };

      // Map UI status to database status if status is being updated
      if (directFields.status) {
        updateData.status = ProjectTransformService.mapUIStatusToDBStatus(directFields.status);
      }

      // Update details JSONB field if any related fields are provided
      if (client !== undefined || project_type !== undefined || location !== undefined) {
        // Get existing details first to preserve other fields
        const existingDetails = directFields.details || {};
        updateData.details = {
          ...existingDetails,
          ...(client !== undefined && { client }),
          ...(project_type !== undefined && { project_type }),
          ...(location !== undefined && { location }) // Location can now be updated (street address only)
        };
      }

      // Update budget JSONB field if budget/currency provided
      if (budget !== undefined || currency !== undefined) {
        // Get existing budget first to preserve other fields
        const existingBudget = directFields.budget || {};
        updateData.budget = {
          ...existingBudget,
          ...(budget !== undefined && { allocated: budget }),
          ...(currency !== undefined && { currency })
        };
      }

      // Update timeline JSONB field if dates provided
      if (start_date !== undefined || end_date !== undefined) {
        // Get existing timeline first to preserve other fields
        const existingTimeline = directFields.timeline || {};
        updateData.timeline = {
          ...existingTimeline,
          ...(start_date !== undefined && { planned_start: start_date }),
          ...(end_date !== undefined && { planned_end: end_date })
        };
      }
      
      const { data: project, error } = await supabase
        .from('be_project')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return project;
    },
    onSuccess: (updatedProject) => {
      // Update the project in cache
      queryClient.setQueryData(
        queryKeys.projects.detail(updatedProject.id), 
        updatedProject
      );
      
      // Invalidate user projects list to reflect changes
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.projects.all 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.projects.list({}) 
      });

      toast.success('Project updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating project:', error);
      toast.error(error.message || 'Failed to update project');
    }
  });
}

/**
 * Hook to update project status with optimistic updates
 */
export function useUpdateProjectStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      projectId, 
      status, 
      progress 
    }: { 
      projectId: string; 
      status: ProjectStatus;
      progress?: number;
    }) => {
      const updateData: any = { 
        status: ProjectTransformService.mapUIStatusToDBStatus(status) 
      };
      if (progress !== undefined) {
        updateData.progress_percentage = progress;
      }

      const { data: project, error } = await supabase
        .from('be_project')
        .update(updateData)
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;
      return project;
    },
    // Optimistic update
    onMutate: async ({ projectId, status, progress }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.detail(projectId) });

      // Snapshot the previous value
      const previousProject = queryClient.getQueryData(queryKeys.projects.detail(projectId));

      // Optimistically update to the new value
      queryClient.setQueryData(queryKeys.projects.detail(projectId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          status,
          ...(progress !== undefined && { progress_percentage: progress })
        };
      });

      return { previousProject };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousProject) {
        queryClient.setQueryData(queryKeys.projects.detail(variables.projectId), context.previousProject);
      }
      console.error('Error updating project status:', error);
      toast.error(error.message || 'Failed to update project status');
    },
    onSettled: (updatedProject) => {
      // Always refetch after error or success
      if (updatedProject) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.projects.detail(updatedProject.id) 
        });
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.projects.all 
        });
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.projects.list({}) 
        });
      }
    }
  });
}

/**
 * Hook to delete a project
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from('be_project')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      return projectId;
    },
    onSuccess: (projectId) => {
      // Remove the project from cache
      queryClient.removeQueries({ 
        queryKey: queryKeys.projects.detail(projectId) 
      });
      
      // Invalidate user projects list
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.projects.all 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.projects.list({}) 
      });

      // Remove all related data from cache
      queryClient.removeQueries({ 
        queryKey: queryKeys.phases.byProject(projectId) 
      });
      
      queryClient.removeQueries({ 
        queryKey: queryKeys.tasks.byProject(projectId) 
      });
      
      queryClient.removeQueries({ 
        queryKey: queryKeys.materials.byProject(projectId) 
      });

      toast.success('Project deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting project:', error);
      toast.error(error.message || 'Failed to delete project');
    }
  });
}

/**
 * Hook to add a team member to a project
 */
export function useAddProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      projectId, 
      userId, 
      role 
    }: { 
      projectId: string; 
      userId: string; 
      role: 'owner' | 'manager' | 'member' | 'viewer';
    }) => {
      const { data: member, error } = await supabase
        .from('be_project_member')
        .insert([{
          project_id: projectId,
          user_id: userId,
          role,
          joined_at: new Date().toISOString()
        }])
        .select(`
          *,
          user:be_user_profile(*)
        `)
        .single();

      if (error) throw error;
      return member;
    },
    onSuccess: (newMember, variables) => {
      // Invalidate project members query
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.projects.members(variables.projectId) 
      });

      toast.success('Team member added successfully');
    },
    onError: (error: any) => {
      console.error('Error adding project member:', error);
      toast.error(error.message || 'Failed to add team member');
    }
  });
}

/**
 * Hook to remove a team member from a project
 */
export function useRemoveProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      projectId, 
      userId 
    }: { 
      projectId: string; 
      userId: string;
    }) => {
      const { error } = await supabase
        .from('be_project_member')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId);

      if (error) throw error;
      return { projectId, userId };
    },
    onSuccess: (variables) => {
      // Invalidate project members query
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.projects.members(variables.projectId) 
      });

      toast.success('Team member removed successfully');
    },
    onError: (error: any) => {
      console.error('Error removing project member:', error);
      toast.error(error.message || 'Failed to remove team member');
    }
  });
}

/**
 * Hook to update project member role
 */
export function useUpdateProjectMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      projectId, 
      userId, 
      role 
    }: { 
      projectId: string; 
      userId: string; 
      role: 'owner' | 'manager' | 'member' | 'viewer';
    }) => {
      const { data: member, error } = await supabase
        .from('be_project_member')
        .update({ role })
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .select(`
          *,
          user:be_user_profile(*)
        `)
        .single();

      if (error) throw error;
      return member;
    },
    onSuccess: (updatedMember, variables) => {
      // Invalidate project members query
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.projects.members(variables.projectId) 
      });

      toast.success('Member role updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating member role:', error);
      toast.error(error.message || 'Failed to update member role');
    }
  });
}
