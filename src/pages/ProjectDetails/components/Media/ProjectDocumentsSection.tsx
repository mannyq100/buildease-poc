/**
 * ProjectDocumentsSection - Refactored media management component
 * Implements clean separation of concerns and performance optimizations
 */

import React, { useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useMedia } from '@/hooks/useMedia';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useQueryClient } from '@tanstack/react-query';

import { Project } from '@/types/project';
import { MediaFilters, MediaItem } from './types';
import type { MediaCategory } from '@/types/database';
import { useDownloadManager } from './hooks/useMemoryManagement';
import { useMediaState } from './hooks/useMediaState';
import { useOptimizedFiltering } from './hooks/useOptimizedFiltering';
import { MEDIA_ERROR_MESSAGES, validateFile, getBatchSizeError } from '@/utils/mediaErrorMessages';
import { updateProjectProfileImage } from '@/services/projectService';

// Business logic services
import { useMediaPermissions } from './services/permissionService';

// Extracted components
import { MediaHeader } from './components/MediaHeader';
import { MediaGrid } from './components/MediaGrid';
import { UploadOptions } from './components/UploadOptions';
import { MediaModals } from './components/MediaModals';

interface ProjectDocumentsSectionProps {
  project: Project;
  onUpdateProject: (updates: Partial<Project>) => void;
  className?: string;
}

export function ProjectDocumentsSection({
  project,
  onUpdateProject: _onUpdateProject,
  className
}: ProjectDocumentsSectionProps) {
  const { toast } = useToast();
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();
  
  // Unified state management
  const { state, actions } = useMediaState(false);
  
  // Removed deletedItems state - optimistic updates handle UI removal automatically

  // Use unified media fetching from be_media_items table (all media types)
  const mediaResult = useMedia(project.id);
  const { items: projectMediaItems, isLoading: mediaLoading, upload, delete: deleteMedia, update } = mediaResult;
  
  // Convert unified media to MediaItem format for compatibility
  const allMediaItems = useMemo(() => {
    if (!projectMediaItems) return [];
    
    return projectMediaItems.map(item => {
      // Map media_type to local display types for backward compatibility
      let displayType: 'image' | 'document' | 'video';
      if (item.media_type === 'PHOTO') {
        displayType = 'image';
      } else if (item.media_type === 'VIDEO') {
        displayType = 'video';
      } else {
        displayType = 'document';
      }
      
      return {
        id: item.id,
        name: item.name,
        url: item.file_path,
        file_path: item.file_path, // Include for profile sync
        thumbnail_url: item.thumbnail_url,
        media_type: item.media_type, // Database field for proper distinction
        category: item.category, // Database field for proper categorization
        size: item.file_size_bytes,
        created_at: item.created_at,
        // Legacy compatibility fields
        type: displayType,
        documentType: item.media_type
      } as MediaItem;
    });
  }, [projectMediaItems]);
  // Use optimistic updates for automatic UI removal instead of manual filtering
  const filteredItems = useOptimizedFiltering(allMediaItems, state.search, state.filters);
  
  // Memory management
  const { downloadFile } = useDownloadManager();

  // Business logic services
  const { canDelete, canEdit } = useMediaPermissions(user, project);

  // Action handlers using unified state management
  const handleFilterChange = (newFilters: Partial<MediaFilters>) => {
    actions.updateFilters(newFilters);
  };

  const handleItemClick = useCallback((item: MediaItem, e: React.MouseEvent) => {
    e.preventDefault();
    if (item.media_type === 'PHOTO' || item.media_type === 'VIDEO') {
      actions.openPreviewModal(item.url);
    }
  }, [actions]);

  const handleDelete = useCallback(async (item: MediaItem) => {
    try {
      if (!item.id) {
        toast({
          title: "Delete Error", 
          description: "Cannot delete item - no ID found.",
          variant: "destructive",
        });
        return;
      }

      // Use unified delete operation
      await deleteMedia(item.id);
      
      toast({
        title: "Item Deleted",
        description: "Item deleted successfully.",
      });
      
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete item. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast, deleteMedia]);

  // Helper function to sync project profile image with optimistic updates
  const syncProjectProfileImage = useCallback(async (projectId: string, mediaItem: MediaItem) => {
    try {
      // Optimistically update project summary queries immediately
      
      // Update ALL project summary caches with pattern matching
      const allQueries = queryClient.getQueryCache().getAll();
      const projectSummaryQueries = allQueries.filter(query => {
        const key = query.queryKey;
        return (
          (key[0] === 'all-project-summaries') ||
          (key[0] === 'project-summary' && key[1] === projectId) ||
          (key[0] === 'project-summaries')
        );
      });
      
      console.log(`🚀 Optimistic Update: Found ${projectSummaryQueries.length} project summary queries to update`);
      
      // Update each matching query cache
      projectSummaryQueries.forEach(query => {
        const currentData = query.state.data;
        if (currentData) {
          const updatedData = queryClient.setQueryData(query.queryKey, (oldData: any) => {
            if (Array.isArray(oldData)) {
              const newData = oldData.map((project: any) => 
                project.id === projectId 
                  ? { 
                      ...project, 
                      profile_image_url: mediaItem.file_path || mediaItem.url,
                      profile_image_thumbnail_url: mediaItem.thumbnail_url || mediaItem.file_path || mediaItem.url
                    }
                  : project
              );
              return newData;
            } else if (oldData?.id === projectId) {
              const newData = {
                ...oldData,
                profile_image_url: mediaItem.file_path || mediaItem.url,
                profile_image_thumbnail_url: mediaItem.thumbnail_url || mediaItem.file_path || mediaItem.url
              };
              return newData;
            }
            return oldData;
          });
          
          // Force immediate observers notification to trigger re-renders
          if (updatedData) {
            queryClient.getQueryCache().build(queryClient, {
              queryKey: query.queryKey,
              queryFn: () => updatedData
            }).setState({ data: updatedData, status: 'success' });
          }
        }
      });

      // Perform background database sync (no await to avoid blocking UI)
      updateProjectProfileImage(projectId, mediaItem.id, {
        file_path: mediaItem.file_path || mediaItem.url,
        thumbnail_url: mediaItem.thumbnail_url || mediaItem.file_path || mediaItem.url
      }).then((result) => {
        if (result.success) {
          console.log(`Media ${mediaItem.id} set as profile image for project ${projectId}`);
          // Invalidate media queries to refresh profile category
          queryClient.invalidateQueries({ queryKey: ['documents', 'byProject', projectId] });
          // Invalidate project summary queries to refresh profile URLs from view
          queryClient.invalidateQueries({ predicate: (query) => {
            const key = query.queryKey;
            return (
              (key[0] === 'all-project-summaries') ||
              (key[0] === 'project-summary') ||
              (key[0] === 'project-summaries')
            );
          }});
        } else {
          console.warn('Profile image update returned false success');
        }
      }).catch(error => {
        console.error('Background profile sync failed:', error);
        // Revert optimistic updates on failure by invalidating all queries
        queryClient.invalidateQueries({ predicate: (query) => {
          const key = query.queryKey;
          return (
            (key[0] === 'all-project-summaries') ||
            (key[0] === 'project-summary') ||
            (key[0] === 'project-summaries') ||
            (key[0] === 'documents')
          );
        }});
      });
      
    } catch (error) {
      console.error('Failed to sync project profile image:', error);
    }
  }, [queryClient]);

  const handleSetAsProfile = useCallback(async (mediaId: string) => {
    try {
      // Find the media item by ID
      const mediaItem = projectMediaItems?.find(item => item.id === mediaId);
      
      if (!mediaItem) {
        toast({
          title: "Error",
          description: MEDIA_ERROR_MESSAGES.MEDIA_NOT_FOUND,
          variant: "destructive",
        });
        return;
      }

      // Only photos can be set as profile
      if (mediaItem.media_type !== 'PHOTO') {
        toast({
          title: "Error", 
          description: MEDIA_ERROR_MESSAGES.ONLY_PHOTOS_AS_PROFILE,
          variant: "destructive",
        });
        return;
      }

      // Check if this image is already the profile
      if (mediaItem.category === 'profile') {
        toast({
          title: "Info",
          description: MEDIA_ERROR_MESSAGES.MEDIA_ALREADY_PROFILE,
          variant: "default",
        });
        return;
      }

      // First, find any existing profile images and restore them to ORIGINAL categories
      const existingProfileImages = projectMediaItems?.filter(item => 
        item.category === 'profile' && item.media_type === 'PHOTO'
      ) || [];

      // Enhanced: Restore existing profile images to their original categories
      for (const existingProfile of existingProfileImages) {
        // Get original category from metadata, fallback to 'inspiration' if not available
        const originalCategory = existingProfile.metadata?.originalCategory || 'inspiration';
        
        await update({ 
          mediaId: existingProfile.id, 
          updates: { 
            category: originalCategory, // Restore to original, not hardcoded to 'inspiration'
            metadata: { 
              ...existingProfile.metadata,
              previousCategory: 'profile',
              isTemporaryProfile: false,
              restoredAt: new Date().toISOString(),
              categoryHistory: [
                ...(existingProfile.metadata?.categoryHistory || []),
                {
                  category: 'profile',
                  changedAt: new Date().toISOString(),
                  reason: 'profile_replacement'
                }
              ]
            }
          } 
        });
      }

      // Enhanced: Set new profile image while preserving original category
      await update({ 
        mediaId: mediaItem.id, 
        updates: { 
          category: 'profile',
          metadata: {
            ...mediaItem.metadata,
            // Preserve original category - this is the key enhancement
            originalCategory: mediaItem.metadata?.originalCategory || mediaItem.category,
            previousCategory: mediaItem.category,
            isTemporaryProfile: true, // Flag to indicate this is a temporary profile assignment
            setAsProfileAt: new Date().toISOString(),
            categoryHistory: [
              ...(mediaItem.metadata?.categoryHistory || []),
              {
                category: mediaItem.category,
                changedAt: new Date().toISOString(),
                reason: 'user_action'
              }
            ]
          }
        }
      });

      // Sync the project profile image URL in the project table (optimistic)
      await syncProjectProfileImage(project.id, mediaItem);
      
      toast({
        title: "Success",
        description: "Profile image updated successfully. Previous profile image restored to its original category.",
      });
      
    } catch (error) {
      console.error('Set as profile error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : MEDIA_ERROR_MESSAGES.PROFILE_UPDATE_FAILED,
        variant: "destructive",
      });
    }
  }, [projectMediaItems, update, toast, project.id, syncProjectProfileImage]);

  const handleRestoreOriginalCategory = useCallback(async (mediaId: string) => {
    try {
      // Find the media item by ID
      const mediaItem = projectMediaItems?.find(item => item.id === mediaId);
      
      if (!mediaItem) {
        toast({
          title: "Error",
          description: MEDIA_ERROR_MESSAGES.MEDIA_NOT_FOUND,
          variant: "destructive",
        });
        return;
      }

      const originalCategory = mediaItem.metadata?.originalCategory;
      
      // Check if there's an original category to restore to
      if (!originalCategory || originalCategory === mediaItem.category) {
        toast({
          title: "Info",
          description: "This item is already in its original category or has no original category to restore.",
          variant: "default",
        });
        return;
      }

      // Check if this is currently a profile image
      if (mediaItem.category === 'profile') {
        toast({
          title: "Warning",
          description: "Cannot restore profile image to original category. Please set a different profile image first.",
          variant: "destructive",
        });
        return;
      }

      // Restore to original category
      await update({
        mediaId,
        updates: {
          category: originalCategory,
          metadata: {
            ...mediaItem.metadata,
            previousCategory: mediaItem.category,
            isTemporaryProfile: false,
            restoredAt: new Date().toISOString(),
            categoryHistory: [
              ...(mediaItem.metadata?.categoryHistory || []),
              {
                category: mediaItem.category,
                changedAt: new Date().toISOString(),
                reason: 'user_restore'
              }
            ]
          }
        }
      });

      toast({
        title: "Success",
        description: `Item restored to original "${originalCategory}" category.`,
      });

    } catch (error) {
      console.error('Restore original category error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : MEDIA_ERROR_MESSAGES.CATEGORY_UPDATE_FAILED,
        variant: "destructive",
      });
    }
  }, [projectMediaItems, update, toast]);

  const handleDownload = useCallback(async (item: MediaItem) => {
    try {
      await downloadFile(item.url, item.name);
      toast({
        title: "Download Started",
        description: `Downloading ${item.name}...`,
      });
    } catch {
      toast({
        title: "Download Failed",
        description: "Failed to download the file. Please try again.",
        variant: "destructive",
      });
    }
  }, [downloadFile, toast]);

  // Upload handlers using unified state management and dedicated mutations
  const handleInspirationUpload = useCallback(async (files: File[]) => {
    try {
      if (!files || files.length === 0) {
        toast({
          title: "No Files",
          description: "Please select files to upload.",
          variant: "destructive",
        });
        return;
      }
      
      // Use unified media upload with inspiration category
      await upload({ files, options: { category: 'inspiration' } });
      
      actions.closeUploadModal();
      toast({
        title: "Upload Complete",
        description: `${files.length} inspiration image(s) uploaded successfully.`,
      });
    } catch {
      toast({
        title: "Upload Error",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    }
  }, [actions, toast, upload]);

  const handleProgressUpload = useCallback(async (files: File[]) => {
    try {
      if (!files || files.length === 0) {
        toast({
          title: "No Files",
          description: "Please select files to upload.",
          variant: "destructive",
        });
        return;
      }
      
      // Use unified media upload with progress category
      await upload({ files, options: { category: 'progress' } });
      
      actions.closeUploadModal();
      toast({
        title: "Upload Complete",
        description: `${files.length} progress image(s) uploaded successfully.`,
      });
    } catch {
      toast({
        title: "Upload Error",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    }
  }, [actions, toast, upload]);

  const handleDocumentUpload = useCallback(async (files: File[], metadata: Array<{ name: string; category: MediaCategory }>) => {
    try {
      if (!files || files.length === 0) {
        toast({
          title: "No Files",
          description: MEDIA_ERROR_MESSAGES.EMPTY_FILE,
          variant: "destructive",
        });
        return;
      }

      // Enhanced validation before upload
      const batchSizeError = getBatchSizeError(files);
      if (batchSizeError) {
        toast({
          title: "Upload Error",
          description: batchSizeError,
          variant: "destructive",
        });
        return;
      }

      // Validate each file before starting uploads
      const invalidFiles: string[] = [];
      files.forEach((file, index) => {
        const validation = validateFile(file);
        if (!validation.isValid) {
          invalidFiles.push(`${file.name}: ${validation.error}`);
        }
      });

      if (invalidFiles.length > 0) {
        toast({
          title: "File Validation Failed",
          description: `Invalid files detected:\n${invalidFiles.slice(0, 3).join('\n')}${invalidFiles.length > 3 ? `\n...and ${invalidFiles.length - 3} more` : ''}`,
          variant: "destructive",
        });
        return;
      }

      // Parallel upload processing with Promise.allSettled for better error handling
      const uploadPromises = files.map(async (file, index) => {
        const fileMeta = metadata[index];
        
        try {
          await upload({ 
            files: [file], 
            options: { 
              name: fileMeta.name,
              category: fileMeta.category
            } 
          });
          return { success: true, fileName: file.name };
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          return { 
            success: false, 
            fileName: file.name, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          };
        }
      });

      const results = await Promise.allSettled(uploadPromises);
      
      // Process results and provide detailed feedback
      const successful: string[] = [];
      const failed: Array<{ fileName: string; error: string }> = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          if (result.value.success) {
            successful.push(result.value.fileName);
          } else {
            failed.push({ fileName: result.value.fileName, error: result.value.error });
          }
        } else {
          failed.push({ 
            fileName: files[index].name, 
            error: result.reason instanceof Error ? result.reason.message : 'Upload failed' 
          });
        }
      });

      actions.closeUploadModal();
      
      // Provide appropriate user feedback based on results
      if (failed.length === 0) {
        toast({
          title: "Upload Complete",
          description: `${successful.length} document(s) uploaded successfully with custom names and categories.`,
        });
      } else if (successful.length === 0) {
        toast({
          title: "Upload Failed",
          description: `All ${failed.length} file(s) failed to upload. Please check file formats and sizes.`,
          variant: "destructive",
        });
      } else {
        // Partial success
        toast({
          title: "Partial Upload Success",
          description: MEDIA_ERROR_MESSAGES.BULK_OPERATION_PARTIAL_FAILURE(successful.length, failed.length),
          variant: "default",
        });
        
        // Show details of failed uploads
        if (failed.length <= 3) {
          const failedDetails = failed.map(f => `${f.fileName}: ${f.error}`).join('\n');
          setTimeout(() => {
            toast({
              title: "Failed Uploads",
              description: failedDetails,
              variant: "destructive",
            });
          }, 1000);
        }
      }
      
    } catch (error) {
      console.error('Error in document upload:', error);
      const errorMessage = error instanceof Error ? error.message : MEDIA_ERROR_MESSAGES.UNKNOWN_ERROR;
      toast({
        title: "Upload Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [actions, toast, upload]);

  // Service-based permissions (centralized business logic)
  const permissions = {
    canDelete,
    canEdit,
    canSetAsProfile: (item: MediaItem) => item.media_type === 'PHOTO'
  };

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <p className="text-slate-600">Please log in to view project media.</p>
        </CardContent>
      </Card>
    );
  }

  if (mediaLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <p className="text-slate-600">Loading project media...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Media Header with Search and Filters */}
          <MediaHeader
            search={state.search}
            filters={state.filters}
            onSearchChange={actions.setSearch}
            onFilterChange={handleFilterChange}
            onAddMedia={actions.toggleUploadOptions}
            itemCount={allMediaItems.length}
            filteredCount={filteredItems.length}
          />

          {/* Upload Options */}
          <UploadOptions
            showOptions={state.ui.showUploadOptions}
            onToggleOptions={actions.toggleUploadOptions}
            onOpenInspiration={() => actions.openUploadModal('inspiration')}
            onOpenProgress={() => actions.openUploadModal('progress')}
            onOpenDocuments={() => actions.openUploadModal('documents')}
          />

          {/* Media Grid */}
          <MediaGrid
            items={filteredItems}
            onItemClick={handleItemClick}
            onDelete={handleDelete}
            onSetAsProfile={handleSetAsProfile}
            onRestoreOriginalCategory={handleRestoreOriginalCategory}
            onDownload={handleDownload}
            permissions={permissions}
          />
        </div>

        {/* Modals */}
        <MediaModals
          uploadModal={state.modals.upload}
          previewModal={state.modals.preview}
          projectId={project.id}
          onCloseUpload={actions.closeUploadModal}
          onClosePreview={actions.closePreviewModal}
          onInspirationUpload={handleInspirationUpload}
          onProgressUpload={handleProgressUpload}
          onDocumentUpload={handleDocumentUpload}
        />
      </CardContent>
    </Card>
  );
}
