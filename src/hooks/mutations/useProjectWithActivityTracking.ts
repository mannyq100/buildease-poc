/**
 * Enhanced Project Mutation Hooks with Integrated Activity Tracking
 * These hooks combine project operations with comprehensive activity logging
 * Designed for BuildEase construction project management workflows
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'sonner';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { ProjectTransformService } from '@/services/projectTransformService';
import type { ProjectStatus } from '@/types/project';

// Enhanced interfaces for activity tracking
export interface UpdateProjectWithTrackingData {
  id: string;
  name?: string;
  description?: string;
  status?: ProjectStatus;
  previousStatus?: ProjectStatus;
  client?: string;
  project_type?: string;
  location?: string;
  budget?: number;
  currency?: string;
  start_date?: string;
  end_date?: string;
  details?: any;
  timeline?: any;
  profile_image?: string;
  inspiration_images?: string[];
  progress_images?: string[];
}

/**
 * Hook to update project status with integrated activity tracking
 */
export function useUpdateProjectStatusWithTracking(projectId: string) {
  const queryClient = useQueryClient();
  const { user } = useSupabaseAuth();
  const activityTracker = useActivityTracker({ projectId });

  return useMutation({
    mutationFn: async ({ 
      status, 
      previousStatus,
      projectName 
    }: { 
      status: ProjectStatus;
      previousStatus?: ProjectStatus;
      projectName?: string;
    }) => {
      const dbStatus = ProjectTransformService.mapUIStatusToDBStatus(status);
      
      const { data: project, error } = await supabase
        .from('be_project')
        .update({ status: dbStatus })
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;
      return { project, previousStatus, newStatus: status, projectName };
    },
    // Optimistic update
    onMutate: async ({ status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.detail(projectId) });
      const previousProject = queryClient.getQueryData(queryKeys.projects.detail(projectId));

      queryClient.setQueryData(queryKeys.projects.detail(projectId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          status: ProjectTransformService.mapUIStatusToDBStatus(status)
        };
      });

      return { previousProject };
    },
    onError: (error, variables, context) => {
      if (context?.previousProject) {
        queryClient.setQueryData(queryKeys.projects.detail(projectId), context.previousProject);
      }
      console.error('Error updating project status:', error);
      toast.error(error.message || 'Failed to update project status');
    },
    onSuccess: async ({ project, previousStatus, newStatus, projectName }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.projects.detail(projectId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.projects.all 
      });

      // Track status change activity
      try {
        const displayName = projectName || project.name || 'Project';
        
        let activityStatus: 'success' | 'info' | 'warning' | 'error' = 'info';
        let activityDescription = `Project status changed from ${previousStatus || 'unknown'} to ${newStatus}`;

        // Special handling for different status transitions
        switch (newStatus) {
          case 'COMPLETED':
            activityStatus = 'success';
            activityDescription = `Project "${displayName}" has been completed! 🎉`;
            break;
          case 'IN_PROGRESS':
            activityStatus = 'success';
            activityDescription = `Project "${displayName}" is now in progress`;
            break;
          case 'PAUSED':
            activityStatus = 'warning';
            activityDescription = `Project "${displayName}" has been paused`;
            break;
          case 'CANCELLED':
            activityStatus = 'error';
            activityDescription = `Project "${displayName}" has been cancelled`;
            break;
          case 'PLANNING':
            activityDescription = `Project "${displayName}" is back in planning phase`;
            break;
        }

        await activityTracker.trackStatusChange(
          `Project status: ${newStatus.toLowerCase().replace('_', ' ')}`,
          activityDescription,
          activityStatus,
          {
            projectId,
            projectName: displayName,
            previousStatus,
            newStatus,
            statusChangeType: 'project_status',
            timestamp: new Date().toISOString()
          }
        );
      } catch (error) {
        console.error('Failed to track project status change activity:', error);
      }

      const statusDisplayName = newStatus.toLowerCase().replace('_', ' ');
      toast.success(`Project status updated to ${statusDisplayName}`);
    }
  });
}

/**
 * Hook to update project details with integrated activity tracking
 */
export function useUpdateProjectWithTracking(projectId: string) {
  const queryClient = useQueryClient();
  const activityTracker = useActivityTracker({ projectId });

  return useMutation({
    mutationFn: async (data: UpdateProjectWithTrackingData) => {
      const { 
        id, 
        client, 
        project_type, 
        location, 
        budget, 
        currency, 
        start_date, 
        end_date,
        previousStatus,
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
        const existingDetails = directFields.details || {};
        updateData.details = {
          ...existingDetails,
          ...(client !== undefined && { client }),
          ...(project_type !== undefined && { project_type }),
          ...(location !== undefined && { location })
        };
      }

      // Update budget JSONB field if budget/currency provided
      if (budget !== undefined || currency !== undefined) {
        const existingBudget = directFields.budget || {};
        updateData.budget = {
          ...existingBudget,
          ...(budget !== undefined && { allocated: budget }),
          ...(currency !== undefined && { currency })
        };
      }

      // Update timeline JSONB field if dates provided
      if (start_date !== undefined || end_date !== undefined) {
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
      return { project, updateData: data };
    },
    onSuccess: async ({ project, updateData }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.projects.detail(project.id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.projects.all 
      });

      // Track project update activity
      try {
        const projectName = project.name || 'Project';
        const changedFields = Object.keys(updateData).filter(key => 
          !['id', 'previousStatus'].includes(key) && updateData[key] !== undefined
        );

        // Special handling for status changes (use dedicated status tracking)
        if (updateData.status && updateData.status !== updateData.previousStatus) {
          // This will be handled by useUpdateProjectStatusWithTracking
          return;
        }

        // Track general project updates
        let activityTitle = `Project updated: ${projectName}`;
        let activityDescription = `Project "${projectName}" details were modified`;
        let activityStatus: 'success' | 'info' | 'warning' | 'error' = 'info';

        // Provide more specific descriptions for common updates
        if (changedFields.length === 1) {
          const field = changedFields[0];
          switch (field) {
            case 'name':
              activityTitle = `Project renamed: ${updateData.name}`;
              activityDescription = `Project name changed to "${updateData.name}"`;
              break;
            case 'description':
              activityTitle = 'Project description updated';
              activityDescription = `Project description was modified`;
              break;
            case 'budget':
              activityTitle = 'Project budget updated';
              activityDescription = `Project budget was adjusted`;
              break;
            case 'client':
              activityTitle = 'Project client updated';
              activityDescription = `Project client information was updated`;
              break;
            case 'profile_image':
              activityTitle = 'Profile photo updated';
              activityDescription = `Project profile photo was changed for "${projectName}"`;
              activityStatus = 'success';
              break;
            case 'inspiration_images':
              activityTitle = 'Inspiration photos updated';
              activityDescription = `Project inspiration gallery was updated for "${projectName}"`;
              activityStatus = 'success';
              break;
            case 'progress_images':
              activityTitle = 'Progress photos updated';
              activityDescription = `Project progress photos were updated for "${projectName}"`;
              activityStatus = 'success';
              break;
          }
        } else if (changedFields.length > 1) {
          activityDescription = `Multiple project fields were updated: ${changedFields.join(', ')}`;
        }

        await activityTracker.trackActivity(
          'project_update',
          activityTitle,
          activityDescription,
          {
            entityType: 'project',
            entityId: project.id,
            metadata: {
              projectName,
              changedFields,
              hasNameChange: changedFields.includes('name'),
              hasDescriptionChange: changedFields.includes('description'),
              hasBudgetChange: changedFields.includes('budget') || changedFields.includes('currency'),
              hasTimelineChange: changedFields.includes('start_date') || changedFields.includes('end_date'),
              hasImageChange: changedFields.includes('profile_image') || changedFields.includes('inspiration_images'),
              fieldCount: changedFields.length
            },
            status: activityStatus
          }
        );
      } catch (error) {
        console.error('Failed to track project update activity:', error);
      }

      toast.success('Project updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating project:', error);
      toast.error(error.message || 'Failed to update project');
    }
  });
}

/**
 * Hook to delete a project with integrated activity tracking
 */
export function useDeleteProjectWithTracking(projectId: string) {
  const queryClient = useQueryClient();
  const activityTracker = useActivityTracker({ projectId });

  return useMutation({
    mutationFn: async ({ projectName }: { projectName: string }) => {
      const { error } = await supabase
        .from('be_project')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      return { projectId, projectName };
    },
    onSuccess: async ({ projectId, projectName }) => {
      // Remove from all caches
      queryClient.removeQueries({ 
        queryKey: queryKeys.projects.detail(projectId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.projects.all 
      });

      // Track project deletion activity
      try {
        await activityTracker.trackActivity(
          'project_delete',
          `Project deleted: ${projectName}`,
          `Project "${projectName}" was permanently deleted`,
          {
            entityType: 'project',
            entityId: projectId,
            metadata: {
              projectName,
              deletedAt: new Date().toISOString()
            },
            status: 'error'
          }
        );
      } catch (error) {
        console.error('Failed to track project deletion activity:', error);
      }

      toast.success('Project deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting project:', error);
      toast.error(error.message || 'Failed to delete project');
    }
  });
}

/**
 * Hook to add project images with activity tracking
 */
export function useUpdateProjectImagesWithTracking(projectId: string) {
  const queryClient = useQueryClient();
  const activityTracker = useActivityTracker({ projectId });

  return useMutation({
    mutationFn: async ({
      imageType,
      imageUrls,
      projectName
    }: {
      imageType: 'profile' | 'inspiration' | 'progress';
      imageUrls: string | string[];
      projectName?: string;
    }) => {
      const updateData: any = {};
      
      if (imageType === 'profile') {
        updateData.profile_image = Array.isArray(imageUrls) ? imageUrls[0] : imageUrls;
      } else if (imageType === 'inspiration') {
        updateData.inspiration_images = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
      } else if (imageType === 'progress') {
        updateData.progress_images = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
      }

      const { data: project, error } = await supabase
        .from('be_project')
        .update(updateData)
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;
      return { project, imageType, imageCount: Array.isArray(imageUrls) ? imageUrls.length : 1, projectName };
    },
    onSuccess: async ({ project, imageType, imageCount, projectName }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.projects.detail(projectId) 
      });

      // Track image update activity
      try {
        const displayProjectName = projectName || project.name || 'Project';
        let activityTitle: string;
        let activityDescription: string;

        if (imageType === 'profile') {
          activityTitle = 'Profile photo updated';
          activityDescription = `New project profile photo uploaded for "${displayProjectName}"`;
        } else if (imageType === 'inspiration') {
          const imageText = imageCount === 1 ? 'inspiration photo' : `${imageCount} inspiration photos`;
          activityTitle = `${imageCount} inspiration ${imageCount === 1 ? 'photo' : 'photos'} added`;
          activityDescription = `${imageText.charAt(0).toUpperCase() + imageText.slice(1)} uploaded to "${displayProjectName}" inspiration gallery`;
        } else {
          const imageText = imageCount === 1 ? 'progress photo' : `${imageCount} progress photos`;
          activityTitle = `${imageCount} progress ${imageCount === 1 ? 'photo' : 'photos'} uploaded`;
          activityDescription = `${imageText.charAt(0).toUpperCase() + imageText.slice(1)} added to "${displayProjectName}" progress documentation`;
        }

        await activityTracker.trackActivity(
          'image_upload',
          activityTitle,
          activityDescription,
          {
            entityType: 'project',
            entityId: projectId,
            metadata: {
              projectName: displayProjectName,
              imageType,
              imageCount,
              uploadType: 'project_images'
            },
            status: 'success'
          }
        );
      } catch (error) {
        console.error('Failed to track project image update activity:', error);
      }

      toast.success(`Project ${imageType} image${imageCount > 1 ? 's' : ''} updated successfully`);
    },
    onError: (error: any) => {
      console.error('Error updating project images:', error);
      toast.error(error.message || 'Failed to update project images');
    }
  });
}