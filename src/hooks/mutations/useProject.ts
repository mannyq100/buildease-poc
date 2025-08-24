import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'sonner';
import { ProjectTransformService } from '@/services/projectTransformService';
import type { ProjectStatus } from '@/types/project';
import * as activityService from '@/services/activityService';

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
    onSuccess: async (newProject, variables) => {
      console.log('[ACTIVITY_DEBUG] [useCreateProject] onSuccess called', {
        projectId: newProject.id,
        projectName: newProject.name,
        timestamp: new Date().toISOString()
      });
      
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

      // Fire-and-forget activity logging with comprehensive debug logging
      console.log('[ACTIVITY_DEBUG] [useCreateProject] Starting activity logging for project creation');
      
      (async () => {
        try {
          console.log('[ACTIVITY_DEBUG] [useCreateProject] Fetching auth user');
          const { data: auth, error: authError } = await supabase.auth.getUser();
          
          if (authError) {
            console.error('[ACTIVITY_DEBUG] [useCreateProject] Auth error:', authError);
            return;
          }
          
          console.log('[ACTIVITY_DEBUG] [useCreateProject] Auth user fetched successfully', {
            userId: auth?.user?.id,
            hasUser: !!auth?.user,
            userMetadata: auth?.user?.user_metadata
          });
          
          const userName = (auth?.user?.user_metadata?.full_name as string | undefined) ||
              (auth?.user?.user_metadata?.name as string | undefined) ||
              (auth?.user?.email as string | undefined);
              
          console.log('[ACTIVITY_DEBUG] [useCreateProject] Calling activityService.createActivity', {
            project_id: newProject.id,
            activity_type: 'project_create',
            title: `Project created: ${variables.name}`,
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'project',
            entity_id: newProject.id
          });
          
          const result = await activityService.createActivity({
            project_id: newProject.id,
            activity_type: 'project_create',
            title: `New project created: ${variables.name}`,
            description: `Project "${variables.name}" was successfully created${variables.client_name ? ` for client ${variables.client_name}` : ''}${variables.project_type ? ` (${variables.project_type})` : ''}`,
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'project',
            entity_id: newProject.id,
            metadata: {
              projectName: variables.name,
              description: variables.description,
              client: variables.client_name,
              projectType: variables.project_type,
              location: variables.location,
              budget: variables.budget,
              startDate: variables.start_date,
              endDate: variables.end_date,
              status: variables.status
            },
            status: 'success'
          });
          
          console.log('[ACTIVITY_DEBUG] [useCreateProject] Activity created successfully', {
            success: !!result,
            activityId: result?.id,
            result
          });
          
        } catch (e) {
          console.error('[ACTIVITY_DEBUG] [useCreateProject] Activity logging failed:', {
            error: e,
            errorMessage: e instanceof Error ? e.message : String(e),
            errorStack: e instanceof Error ? e.stack : undefined,
            projectId: newProject.id,
            projectName: variables.name,
            timestamp: new Date().toISOString()
          });
        }
      })();

      toast.success('Project created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating project:', error);
      toast.error(error.message || 'Failed to create project');
    }
  });
}

/**
 * Hook to update an existing project with optimistic updates
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
        ...directFields,
        updated_at: new Date().toISOString()
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
    // Optimistic update
    onMutate: async (variables) => {
      const projectId = variables.id;
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.detail(projectId) });

      // Snapshot the previous value
      const previousProject = queryClient.getQueryData(queryKeys.projects.detail(projectId));

      // Create optimistic update data
      const optimisticUpdate: any = {
        ...variables,
        updated_at: new Date().toISOString()
      };

      // Handle JSONB fields for optimistic update
      if (variables.client !== undefined || variables.project_type !== undefined || variables.location !== undefined) {
        const existingDetails = (previousProject as any)?.details || {};
        optimisticUpdate.details = {
          ...existingDetails,
          ...(variables.client !== undefined && { client: variables.client }),
          ...(variables.project_type !== undefined && { project_type: variables.project_type }),
          ...(variables.location !== undefined && { location: variables.location })
        };
      }

      if (variables.budget !== undefined || variables.currency !== undefined) {
        const existingBudget = (previousProject as any)?.budget || {};
        optimisticUpdate.budget = {
          ...existingBudget,
          ...(variables.budget !== undefined && { allocated: variables.budget }),
          ...(variables.currency !== undefined && { currency: variables.currency })
        };
      }

      if (variables.start_date !== undefined || variables.end_date !== undefined) {
        const existingTimeline = (previousProject as any)?.timeline || {};
        optimisticUpdate.timeline = {
          ...existingTimeline,
          ...(variables.start_date !== undefined && { planned_start: variables.start_date }),
          ...(variables.end_date !== undefined && { planned_end: variables.end_date })
        };
      }

      // Optimistically update to the new value
      queryClient.setQueryData(queryKeys.projects.detail(projectId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          ...optimisticUpdate
        };
      });

      return { previousProject, projectId };
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousProject && context?.projectId) {
        queryClient.setQueryData(
          queryKeys.projects.detail(context.projectId), 
          context.previousProject
        );
      }
      console.error('Error updating project:', error);
      toast.error(error.message || 'Failed to update project');
    },
    onSuccess: async (updatedProject, variables) => {
      // Update the project in cache (optimistic update already applied, this ensures server data)
      queryClient.setQueryData(
        queryKeys.projects.detail(updatedProject.id), 
        updatedProject
      );
      
      // Invalidate related queries to reflect changes elsewhere
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.projects.all 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.projects.list({}) 
      });

      // Use standardized activity logging
      const { logProjectActivity } = await import('@/utils/activityLogging');
      
      // Determine activity type based on what was updated
      const wasStatusUpdate = variables.status !== undefined;
      const activityType = wasStatusUpdate ? 'project_status_update' : 'project_update';
      
      // Create metadata for activity logging
      const updateTypes: string[] = [];
      if (variables.name !== undefined) updateTypes.push('name');
      if (variables.budget !== undefined) updateTypes.push('budget');
      if (variables.description !== undefined) updateTypes.push('description');
      if (variables.client !== undefined) updateTypes.push('client');
      if (variables.project_type !== undefined) updateTypes.push('type');
      if (variables.location !== undefined) updateTypes.push('location');
      if (variables.start_date !== undefined || variables.end_date !== undefined) updateTypes.push('timeline');
      if (variables.currency !== undefined) updateTypes.push('currency');
      
      const activityMetadata = {
        updates: updateTypes,
        status: variables.status,
        progress: variables.progress_percentage,
        budget: variables.budget,
        currency: variables.currency,
        client: variables.client,
        project_type: variables.project_type,
        location: variables.location
      };

      // Fire-and-forget activity logging
      logProjectActivity(
        updatedProject.id,
        activityType,
        updatedProject.name,
        activityMetadata
      ).catch(error => {
        console.error('Activity logging failed:', error);
      });

      toast.success('Project updated successfully');
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
    },
    onSuccess: async (updatedProject, variables) => {
      // Use standardized activity logging
      const { logProjectActivity } = await import('@/utils/activityLogging');
      
      const activityMetadata = {
        status: variables.status,
        progress: variables.progress
      };

      // Fire-and-forget activity logging
      logProjectActivity(
        updatedProject.id,
        'project_status_update',
        updatedProject.name,
        activityMetadata
      ).catch(error => {
        console.error('Activity logging failed:', error);
      });

      toast.success(`Project status updated to ${variables.status}`);
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
    onSuccess: async (projectId, variables) => {
      console.log('[ACTIVITY_DEBUG] [useDeleteProject] onSuccess called', {
        projectId,
        timestamp: new Date().toISOString()
      });
      
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

      // Fire-and-forget activity logging with comprehensive debug logging
      console.log('[ACTIVITY_DEBUG] [useDeleteProject] Starting activity logging for project deletion');
      
      (async () => {
        try {
          console.log('[ACTIVITY_DEBUG] [useDeleteProject] Fetching auth user');
          const { data: auth, error: authError } = await supabase.auth.getUser();
          
          if (authError) {
            console.error('[ACTIVITY_DEBUG] [useDeleteProject] Auth error:', authError);
            return;
          }
          
          console.log('[ACTIVITY_DEBUG] [useDeleteProject] Auth user fetched successfully', {
            userId: auth?.user?.id,
            hasUser: !!auth?.user,
            userMetadata: auth?.user?.user_metadata
          });
          
          const userName = (auth?.user?.user_metadata?.full_name as string | undefined) ||
              (auth?.user?.user_metadata?.name as string | undefined) ||
              (auth?.user?.email as string | undefined);
              
          console.log('[ACTIVITY_DEBUG] [useDeleteProject] Calling activityService.createActivity', {
            project_id: projectId,
            activity_type: 'project_delete',
            title: `Project deleted: ${projectId}`,
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'project',
            entity_id: projectId
          });
          
          const result = await activityService.createActivity({
            project_id: projectId,
            activity_type: 'project_delete',
            title: `Project permanently deleted`,
            description: `Project (ID: ${projectId}) was permanently removed from the system`,
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'project',
            entity_id: projectId,
            metadata: { projectId },
            status: 'warning'
          });
          
          console.log('[ACTIVITY_DEBUG] [useDeleteProject] Activity created successfully', {
            success: !!result,
            activityId: result?.id,
            result
          });
          
        } catch (e) {
          console.error('[ACTIVITY_DEBUG] [useDeleteProject] Activity logging failed:', {
            error: e,
            errorMessage: e instanceof Error ? e.message : String(e),
            errorStack: e instanceof Error ? e.stack : undefined,
            projectId,
            timestamp: new Date().toISOString()
          });
        }
      })();

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
    onSuccess: async (newMember, variables) => {
      console.log('[ACTIVITY_DEBUG] [useAddProjectMember] onSuccess called', {
        memberId: newMember.id,
        projectId: variables.projectId,
        userId: variables.userId,
        role: variables.role,
        timestamp: new Date().toISOString()
      });
      
      // Invalidate project members query
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.projects.members(variables.projectId) 
      });

      // Fire-and-forget activity logging with comprehensive debug logging
      console.log('[ACTIVITY_DEBUG] [useAddProjectMember] Starting activity logging for project member addition');
      
      (async () => {
        try {
          console.log('[ACTIVITY_DEBUG] [useAddProjectMember] Fetching auth user');
          const { data: auth, error: authError } = await supabase.auth.getUser();
          
          if (authError) {
            console.error('[ACTIVITY_DEBUG] [useAddProjectMember] Auth error:', authError);
            return;
          }
          
          console.log('[ACTIVITY_DEBUG] [useAddProjectMember] Auth user fetched successfully', {
            userId: auth?.user?.id,
            hasUser: !!auth?.user,
            userMetadata: auth?.user?.user_metadata
          });
          
          const userName = (auth?.user?.user_metadata?.full_name as string | undefined) ||
              (auth?.user?.user_metadata?.name as string | undefined) ||
              (auth?.user?.email as string | undefined);
              
          const memberName = newMember.user ? 
            `${newMember.user.first_name || ''} ${newMember.user.last_name || ''}`.trim() || 'Team Member'
            : 'Team Member';
              
          console.log('[ACTIVITY_DEBUG] [useAddProjectMember] Calling activityService.createActivity', {
            project_id: variables.projectId,
            activity_type: 'project_member_add',
            title: `Team member added: ${memberName}`,
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'project_member',
            entity_id: newMember.id
          });
          
          const result = await activityService.createActivity({
            project_id: variables.projectId,
            activity_type: 'project_member_add',
            title: `New ${variables.role} added: ${memberName}`,
            description: `${memberName} was added to the project team with ${variables.role} permissions`,
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'project_member',
            entity_id: newMember.id,
            metadata: {
              memberName,
              role: variables.role,
              addedUserId: variables.userId
            },
            status: 'success'
          });
          
          console.log('[ACTIVITY_DEBUG] [useAddProjectMember] Activity created successfully', {
            success: !!result,
            activityId: result?.id,
            result
          });
          
        } catch (e) {
          console.error('[ACTIVITY_DEBUG] [useAddProjectMember] Activity logging failed:', {
            error: e,
            errorMessage: e instanceof Error ? e.message : String(e),
            errorStack: e instanceof Error ? e.stack : undefined,
            memberId: newMember.id,
            projectId: variables.projectId,
            timestamp: new Date().toISOString()
          });
        }
      })();

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
    onSuccess: async (variables) => {
      console.log('[ACTIVITY_DEBUG] [useRemoveProjectMember] onSuccess called', {
        projectId: variables.projectId,
        userId: variables.userId,
        timestamp: new Date().toISOString()
      });
      
      // Invalidate project members query
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.projects.members(variables.projectId) 
      });

      // Fire-and-forget activity logging with comprehensive debug logging
      console.log('[ACTIVITY_DEBUG] [useRemoveProjectMember] Starting activity logging for project member removal');
      
      (async () => {
        try {
          console.log('[ACTIVITY_DEBUG] [useRemoveProjectMember] Fetching auth user');
          const { data: auth, error: authError } = await supabase.auth.getUser();
          
          if (authError) {
            console.error('[ACTIVITY_DEBUG] [useRemoveProjectMember] Auth error:', authError);
            return;
          }
          
          console.log('[ACTIVITY_DEBUG] [useRemoveProjectMember] Auth user fetched successfully', {
            userId: auth?.user?.id,
            hasUser: !!auth?.user,
            userMetadata: auth?.user?.user_metadata
          });
          
          const userName = (auth?.user?.user_metadata?.full_name as string | undefined) ||
              (auth?.user?.user_metadata?.name as string | undefined) ||
              (auth?.user?.email as string | undefined);
              
          console.log('[ACTIVITY_DEBUG] [useRemoveProjectMember] Calling activityService.createActivity', {
            project_id: variables.projectId,
            activity_type: 'project_member_remove',
            title: `Team member removed: ${variables.userId}`,
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'project_member',
            entity_id: variables.userId
          });
          
          const result = await activityService.createActivity({
            project_id: variables.projectId,
            activity_type: 'project_member_remove',
            title: `Team member removed from project`,
            description: `Team member (ID: ${variables.userId}) was removed from the project team`,
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'project_member',
            entity_id: variables.userId,
            metadata: {
              removedUserId: variables.userId
            },
            status: 'warning'
          });
          
          console.log('[ACTIVITY_DEBUG] [useRemoveProjectMember] Activity created successfully', {
            success: !!result,
            activityId: result?.id,
            result
          });
          
        } catch (e) {
          console.error('[ACTIVITY_DEBUG] [useRemoveProjectMember] Activity logging failed:', {
            error: e,
            errorMessage: e instanceof Error ? e.message : String(e),
            errorStack: e instanceof Error ? e.stack : undefined,
            projectId: variables.projectId,
            userId: variables.userId,
            timestamp: new Date().toISOString()
          });
        }
      })();

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
    onSuccess: async (updatedMember, variables) => {
      console.log('[ACTIVITY_DEBUG] [useUpdateProjectMemberRole] onSuccess called', {
        memberId: updatedMember.id,
        projectId: variables.projectId,
        userId: variables.userId,
        newRole: variables.role,
        timestamp: new Date().toISOString()
      });
      
      // Invalidate project members query
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.projects.members(variables.projectId) 
      });

      // Fire-and-forget activity logging with comprehensive debug logging
      console.log('[ACTIVITY_DEBUG] [useUpdateProjectMemberRole] Starting activity logging for project member role update');
      
      (async () => {
        try {
          console.log('[ACTIVITY_DEBUG] [useUpdateProjectMemberRole] Fetching auth user');
          const { data: auth, error: authError } = await supabase.auth.getUser();
          
          if (authError) {
            console.error('[ACTIVITY_DEBUG] [useUpdateProjectMemberRole] Auth error:', authError);
            return;
          }
          
          console.log('[ACTIVITY_DEBUG] [useUpdateProjectMemberRole] Auth user fetched successfully', {
            userId: auth?.user?.id,
            hasUser: !!auth?.user,
            userMetadata: auth?.user?.user_metadata
          });
          
          const userName = (auth?.user?.user_metadata?.full_name as string | undefined) ||
              (auth?.user?.user_metadata?.name as string | undefined) ||
              (auth?.user?.email as string | undefined);
              
          const memberName = updatedMember.user ? 
            `${updatedMember.user.first_name || ''} ${updatedMember.user.last_name || ''}`.trim() || 'Team Member'
            : 'Team Member';
              
          console.log('[ACTIVITY_DEBUG] [useUpdateProjectMemberRole] Calling activityService.createActivity', {
            project_id: variables.projectId,
            activity_type: 'project_member_role_update',
            title: `Member role updated: ${memberName}`,
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'project_member',
            entity_id: updatedMember.id
          });
          
          const result = await activityService.createActivity({
            project_id: variables.projectId,
            activity_type: 'project_member_role_update',
            title: `Role changed to ${variables.role}: ${memberName}`,
            description: `${memberName}'s project permissions were updated to ${variables.role} level access`,
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'project_member',
            entity_id: updatedMember.id,
            metadata: {
              memberName,
              newRole: variables.role,
              updatedUserId: variables.userId
            },
            status: 'info'
          });
          
          console.log('[ACTIVITY_DEBUG] [useUpdateProjectMemberRole] Activity created successfully', {
            success: !!result,
            activityId: result?.id,
            result
          });
          
        } catch (e) {
          console.error('[ACTIVITY_DEBUG] [useUpdateProjectMemberRole] Activity logging failed:', {
            error: e,
            errorMessage: e instanceof Error ? e.message : String(e),
            errorStack: e instanceof Error ? e.stack : undefined,
            memberId: updatedMember.id,
            projectId: variables.projectId,
            timestamp: new Date().toISOString()
          });
        }
      })();

      toast.success('Member role updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating member role:', error);
      toast.error(error.message || 'Failed to update member role');
    }
  });
}
