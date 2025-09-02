/**
 * ProjectDocumentsSection - Refactored media management component
 * Implements clean separation of concerns and performance optimizations
 */

import React, { useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useMedia } from '@/hooks/useMedia';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

import { Project } from '@/types/project';
import { MediaFilters, MediaItem } from './types';
import type { MediaCategory } from '@/types/database';
import { useDownloadManager } from './hooks/useMemoryManagement';
import { useMediaState } from './hooks/useMediaState';
import { useOptimizedFiltering } from './hooks/useOptimizedFiltering';

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

  const handleSetAsProfile = useCallback(async (imageUrl: string) => {
    try {
      // Find the media item by URL
      const imageDoc = projectMediaItems?.find((item) => item.file_path === imageUrl);
      
      if (!imageDoc?.id) {
        toast({
          title: "Error",
          description: "Cannot find image to set as profile.",
          variant: "destructive",
        });
        return;
      }
      
      // Update media item to set as profile
      await update({ mediaId: imageDoc.id, updates: { metadata: { isProfile: true } } });
      
      toast({
        title: "Success",
        description: "Profile image updated successfully.",
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to set profile image. Please try again.",
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
          description: "Please select files to upload.",
          variant: "destructive",
        });
        return;
      }

      // Upload each file with its custom metadata
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileMeta = metadata[i];
        
        await upload({ 
          files: [file], 
          options: { 
            name: fileMeta.name,
            category: fileMeta.category
          } 
        });
      }

      actions.closeUploadModal();
      
      toast({
        title: "Upload Complete",
        description: `${files.length} document(s) uploaded successfully with custom names and categories.`,
      });
      
    } catch (error) {
      console.error('Error uploading documents:', error);
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "Failed to upload documents.",
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
