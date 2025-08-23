/**
 * Image Mutation Hooks
 * Dedicated mutations for inspiration and progress image operations
 * Replaces direct onUpdateProject calls with proper activity logging
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { TABLE_NAMES } from '@/types/database';
import * as activityService from '@/services/activityService';
import { logActivityAsync } from '@/utils/activityLogging';
import { toast } from 'sonner';
import { useProjectStore } from '@/stores/projectStore';
import type { Project } from '@/types/project';
import type { UploadResult } from '@/types/upload';

interface UploadImageParams {
  projectId: string;
  results: UploadResult[];
  imageType: 'inspiration' | 'progress';
}

interface DeleteImageParams {
  projectId: string;
  imageUrl: string;
  imageName: string;
  imageType: 'inspiration' | 'progress' | 'profile';
}

interface SetProfileImageParams {
  projectId: string;
  imageUrl: string;
  imageName: string;
}

/**
 * Upload inspiration or progress images
 */
export function useUploadImages() {
  const queryClient = useQueryClient();
  const addOptimisticUpdate = useProjectStore(state => state.addOptimisticUpdate);

  return useMutation({
    mutationFn: async ({ projectId, results, imageType }: UploadImageParams): Promise<Project> => {
      // Get current project data
      const { data: project, error: fetchError } = await supabase
        .from(TABLE_NAMES.PROJECTS)
        .select('inspiration_images, progress_images')
        .eq('id', projectId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch project: ${fetchError.message}`);
      }

      // Prepare updated image arrays
      const newImageUrls = results.map(result => result.url);
      const currentImages = imageType === 'inspiration' 
        ? (project.inspiration_images || [])
        : (project.progress_images || []);
      
      const updatedImages = [...currentImages, ...newImageUrls];

      // Update project in database
      const updateData = imageType === 'inspiration'
        ? { inspiration_images: updatedImages }
        : { progress_images: updatedImages };

      const { data: updatedProject, error: updateError } = await supabase
        .from(TABLE_NAMES.PROJECTS)
        .update(updateData)
        .eq('id', projectId)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to update project: ${updateError.message}`);
      }

      return updatedProject;
    },
    // Optimistic update - show uploaded images immediately
    onMutate: async ({ projectId, results, imageType }) => {
      const queryKey = ['project', projectId];
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot the previous value
      const previousProject = queryClient.getQueryData<Project>(queryKey);
      
      if (previousProject) {
        // Create optimistic project update
        const newImageUrls = results.map(result => result.url);
        const currentImages = imageType === 'inspiration' 
          ? (previousProject.inspiration_images || [])
          : (previousProject.progress_images || []);
        
        const updatedImages = [...currentImages, ...newImageUrls];
        
        const optimisticProject = {
          ...previousProject,
          [imageType === 'inspiration' ? 'inspiration_images' : 'progress_images']: updatedImages
        };

        // Optimistically update the project
        queryClient.setQueryData<Project>(queryKey, optimisticProject);

        // Track optimistic update
        const uploadId = `upload_${imageType}_${Date.now()}`;
        addOptimisticUpdate(uploadId, {
          id: uploadId,
          type: 'update',
          entity: 'project',
          data: optimisticProject,
          originalData: previousProject,
          timestamp: Date.now()
        });

        return { previousProject, uploadId };
      }

      return { previousProject: undefined, uploadId: undefined };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousProject) {
        const queryKey = ['project', variables.projectId];
        queryClient.setQueryData(queryKey, context.previousProject);
      }
      
      console.error(`${variables.imageType} image upload failed:`, error);
      toast.error(`Failed to upload ${variables.imageType} images`);
    },
    onSuccess: (updatedProject, variables, context) => {
      // Remove optimistic update tracking
      if (context?.uploadId) {
        const removeOptimisticUpdate = useProjectStore.getState().removeOptimisticUpdate;
        removeOptimisticUpdate(context.uploadId);
      }

      // Update cached project with real server data
      const queryKey = ['project', updatedProject.id];
      queryClient.setQueryData<Project>(queryKey, updatedProject);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['project-consolidated', updatedProject.id] });
      if (variables.imageType === 'progress') {
        queryClient.invalidateQueries({ queryKey: ['project-progress-images', updatedProject.id] });
      }
      
      toast.success(`${variables.results.length} ${variables.imageType} image(s) uploaded successfully`);

      // Fire-and-forget activity log for image upload using standardized utilities
      logActivityAsync({
        projectId: updatedProject.id,
        activityType: 'document_upload',
        entityType: 'document',
        entityName: `${variables.imageType} images`,
        metadata: {
          imageType: variables.imageType,
          imageCount: variables.results.length,
          imageNames: variables.results.map(r => r.name),
          totalSize: variables.results.reduce((sum, r) => sum + r.size, 0),
          fileTypeText: variables.imageType === 'inspiration' ? 'Inspiration images' : 'Progress images'
        }
      });
    }
  });
}

/**
 * Delete an image (inspiration, progress, or profile)
 */
export function useDeleteImage() {
  const queryClient = useQueryClient();
  const addOptimisticUpdate = useProjectStore(state => state.addOptimisticUpdate);

  return useMutation({
    mutationFn: async ({ projectId, imageUrl, imageName, imageType }: DeleteImageParams): Promise<Project> => {
      // Delete from storage first
      const storageBucket = imageType === 'inspiration' ? 'project-inspiration' : 
                           imageType === 'progress' ? 'progress-images' : 'profiles';
      
      const { error: storageError } = await supabase.storage
        .from(storageBucket)
        .remove([`${projectId}/${imageName}`]);

      if (storageError && imageType !== 'inspiration' && imageType !== 'profile') {
        // Only throw for progress images - inspiration and profile continue even if storage fails
        throw new Error(`Failed to delete image from storage: ${storageError.message}`);
      }

      // Get current project data
      const { data: project, error: fetchError } = await supabase
        .from(TABLE_NAMES.PROJECTS)
        .select('inspiration_images, progress_images, profile_image')
        .eq('id', projectId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch project: ${fetchError.message}`);
      }

      // Prepare updated project data
      let updateData: Partial<Project> = {};
      
      if (imageType === 'inspiration') {
        updateData.inspiration_images = (project.inspiration_images || [])
          .filter(url => url !== imageUrl);
      } else if (imageType === 'progress') {
        updateData.progress_images = (project.progress_images || [])
          .filter(url => !url.includes(imageName));
      } else if (imageType === 'profile') {
        updateData.profile_image = null;
      }

      // Update project in database
      const { data: updatedProject, error: updateError } = await supabase
        .from(TABLE_NAMES.PROJECTS)
        .update(updateData)
        .eq('id', projectId)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to update project: ${updateError.message}`);
      }

      return updatedProject;
    },
    // Optimistic update - remove image immediately
    onMutate: async ({ projectId, imageUrl, imageName, imageType }) => {
      const queryKey = ['project', projectId];
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot the previous value
      const previousProject = queryClient.getQueryData<Project>(queryKey);
      
      if (previousProject) {
        // Create optimistic project update
        let optimisticProject = { ...previousProject };
        
        if (imageType === 'inspiration') {
          optimisticProject.inspiration_images = (previousProject.inspiration_images || [])
            .filter(url => url !== imageUrl);
        } else if (imageType === 'progress') {
          optimisticProject.progress_images = (previousProject.progress_images || [])
            .filter(url => !url.includes(imageName));
        } else if (imageType === 'profile') {
          optimisticProject.profile_image = null;
        }

        // Optimistically update the project
        queryClient.setQueryData<Project>(queryKey, optimisticProject);

        // Track optimistic update
        const deleteId = `delete_${imageType}_${Date.now()}`;
        addOptimisticUpdate(deleteId, {
          id: deleteId,
          type: 'update',
          entity: 'project',
          data: optimisticProject,
          originalData: previousProject,
          timestamp: Date.now()
        });

        return { previousProject, deleteId };
      }

      return { previousProject: undefined, deleteId: undefined };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousProject) {
        const queryKey = ['project', variables.projectId];
        queryClient.setQueryData(queryKey, context.previousProject);
      }
      
      console.error(`${variables.imageType} image deletion failed:`, error);
      toast.error(`Failed to delete ${variables.imageType} image`);
    },
    onSuccess: (updatedProject, variables, context) => {
      // Remove optimistic update tracking
      if (context?.deleteId) {
        const removeOptimisticUpdate = useProjectStore.getState().removeOptimisticUpdate;
        removeOptimisticUpdate(context.deleteId);
      }

      // Update cached project with real server data
      const queryKey = ['project', updatedProject.id];
      queryClient.setQueryData<Project>(queryKey, updatedProject);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['project-consolidated', updatedProject.id] });
      if (variables.imageType === 'progress') {
        queryClient.invalidateQueries({ queryKey: ['project-progress-images', updatedProject.id] });
      }
      
      toast.success(`${variables.imageType === 'inspiration' ? 'Inspiration' : variables.imageType === 'progress' ? 'Progress' : 'Profile'} image deleted successfully`);

      // Fire-and-forget activity log for image deletion using standardized utilities
      logActivityAsync({
        projectId: updatedProject.id,
        activityType: 'document_delete',
        entityType: 'document',
        entityName: variables.imageName,
        metadata: {
          imageType: variables.imageType,
          imageName: variables.imageName,
          imageUrl: variables.imageUrl,
          fileTypeText: variables.imageType === 'inspiration' ? 'Inspiration image' : variables.imageType === 'progress' ? 'Progress image' : 'Profile image'
        }
      });
    }
  });
}

/**
 * Set an image as the project profile image
 */
export function useSetProfileImage() {
  const queryClient = useQueryClient();
  const addOptimisticUpdate = useProjectStore(state => state.addOptimisticUpdate);

  return useMutation({
    mutationFn: async ({ projectId, imageUrl, imageName }: SetProfileImageParams): Promise<Project> => {
      // Update project in database
      const { data: updatedProject, error: updateError } = await supabase
        .from(TABLE_NAMES.PROJECTS)
        .update({ profile_image: imageUrl })
        .eq('id', projectId)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to set profile image: ${updateError.message}`);
      }

      return updatedProject;
    },
    // Optimistic update - show profile image change immediately
    onMutate: async ({ projectId, imageUrl }) => {
      const queryKey = ['project', projectId];
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot the previous value
      const previousProject = queryClient.getQueryData<Project>(queryKey);
      
      if (previousProject) {
        // Create optimistic project update
        const optimisticProject = {
          ...previousProject,
          profile_image: imageUrl
        };

        // Optimistically update the project
        queryClient.setQueryData<Project>(queryKey, optimisticProject);

        // Track optimistic update
        const profileId = `set_profile_${Date.now()}`;
        addOptimisticUpdate(profileId, {
          id: profileId,
          type: 'update',
          entity: 'project',
          data: optimisticProject,
          originalData: previousProject,
          timestamp: Date.now()
        });

        return { previousProject, profileId };
      }

      return { previousProject: undefined, profileId: undefined };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousProject) {
        const queryKey = ['project', variables.projectId];
        queryClient.setQueryData(queryKey, context.previousProject);
      }
      
      console.error('Set profile image failed:', error);
      toast.error('Failed to set profile image');
    },
    onSuccess: (updatedProject, variables, context) => {
      // Remove optimistic update tracking
      if (context?.profileId) {
        const removeOptimisticUpdate = useProjectStore.getState().removeOptimisticUpdate;
        removeOptimisticUpdate(context.profileId);
      }

      // Update cached project with real server data
      const queryKey = ['project', updatedProject.id];
      queryClient.setQueryData<Project>(queryKey, updatedProject);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['project-consolidated', updatedProject.id] });
      
      toast.success('Profile image updated successfully');

      // Fire-and-forget activity log for profile image update using standardized utilities
      logActivityAsync({
        projectId: updatedProject.id,
        activityType: 'document_update',
        entityType: 'document',
        entityName: 'Profile Image',
        customTitle: 'Profile image updated',
        customDescription: `Project profile image changed to "${variables.imageName}"`,
        metadata: {
          imageType: 'profile',
          imageName: variables.imageName,
          imageUrl: variables.imageUrl
        }
      });
    }
  });
}