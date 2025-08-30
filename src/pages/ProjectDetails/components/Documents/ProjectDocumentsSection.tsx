/**
 * ProjectDocumentsSection - Refactored media management component
 * Implements clean separation of concerns and performance optimizations
 */

import React, { useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useMediaOperations } from '@/hooks/useMediaOperations';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

import { Project } from '@/types/project';
import { MediaFilters, MediaItem } from './types';
import { UploadResult } from '@/types/upload';

// Optimized hooks
import { useProjectMedia } from '@/hooks/useProjectMedia';
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

  // Consolidated media operations
  const mediaOps = useMediaOperations({ 
    projectId: project.id
  });
  
  // Use unified media fetching from be_document table
  const projectMediaResult = useProjectMedia({ projectId: project.id });
  const { data: projectMediaItems, isLoading: mediaLoading } = projectMediaResult;
  
  // Convert unified media to MediaItem format for compatibility
  const allMediaItems = useMemo(() => {
    if (!projectMediaItems) return [];
    
    return projectMediaItems.map(item => {
      // Use document_type to determine if it's an image/video (preview) or document (download)
      const documentType = item.metadata?.documentType as string;
      const isImageOrVideo = documentType === 'PHOTO' || documentType === 'VIDEO';
      
      return {
        id: item.id,
        name: item.fileName,
        url: item.filePath,
        type: isImageOrVideo ? 'image' as const : 'document' as const,
        category: item.category.replace('_image', '') as any, // Convert profile_image -> profile
        size: item.fileSize,
        createdAt: item.createdAt,
        documentType: documentType // Add document_type for better logic
      };
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
    if (item.type === 'image' || item.type === 'progress-image') {
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

      // All media now stored in documents table - unified delete
      await mediaOps.documents.delete.mutateAsync(item.id);
      
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
  }, [toast, mediaOps]);

  const handleSetAsProfile = useCallback(async (imageUrl: string) => {
    try {
      // Find the media item by URL
      const imageDoc = projectMediaItems?.find((item: any) => item.filePath === imageUrl);
      
      if (!imageDoc?.id) {
        toast({
          title: "Error",
          description: "Cannot find image to set as profile.",
          variant: "destructive",
        });
        return;
      }
      
      // Use unified media operations
      await mediaOps.media.setAsProfile(imageDoc.id);
      
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
  }, [projectMediaItems, mediaOps, toast]);

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
  const handleInspirationUpload = useCallback(async (results: UploadResult[]) => {
    try {
      // Use unified media operations - images stored as documents
      await mediaOps.upload.uploadImages(results, 'inspiration');
      
      actions.closeUploadModal();
      toast({
        title: "Upload Complete",
        description: `${results.length} inspiration image(s) uploaded successfully.`,
      });
    } catch (_error) {
      toast({
        title: "Upload Error",
        description: "Images uploaded but failed to save to database. Please try again.",
        variant: "destructive",
      });
    }
  }, [actions, toast, mediaOps]);

  const handleProgressUpload = useCallback(async (results: UploadResult[]) => {
    try {
      // Use unified media operations - images stored as documents
      await mediaOps.upload.uploadImages(results, 'progress');
      
      actions.closeUploadModal();
      toast({
        title: "Upload Complete",
        description: `${results.length} progress image(s) uploaded successfully.`,
      });
    } catch (_error) {
      toast({
        title: "Upload Error",
        description: "Images uploaded but failed to save to database. Please try again.",
        variant: "destructive",
      });
    }
  }, [actions, toast, mediaOps]);

  const handleDocumentUpload = useCallback(async (results: UploadResult[]) => {
    try {
      // Use unified media operations for document upload
      await mediaOps.upload.uploadDocuments(results);

      actions.closeUploadModal();
      
      toast({
        title: "Upload Complete",
        description: `${results.length} document(s) uploaded and saved successfully.`,
      });
      
    } catch (error) {
      console.error('Error creating document database entries:', error);
      toast({
        title: "Upload Error",
        description: "Failed to process document uploads. Please try again.",
        variant: "destructive",
      });
    }
  }, [actions, toast, mediaOps]);

  // Service-based permissions (centralized business logic)
  const permissions = {
    canDelete,
    canEdit,
    canSetAsProfile: (item: MediaItem) => ['image', 'progress-image'].includes(item.type)
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
