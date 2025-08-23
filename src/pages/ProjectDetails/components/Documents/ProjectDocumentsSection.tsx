/**
 * ProjectDocumentsSection - Refactored media management component
 * Implements clean separation of concerns and performance optimizations
 */

import React, { useCallback, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useMediaOperations } from '@/hooks/useMediaOperations';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

import { Project } from '@/types/project';
import { MediaFilters, MediaItem } from './types';
import { UploadResult } from '@/types/upload';
import { isDocumentType } from './utils/mediaUtils';

// Optimized hooks
import { useAllMediaItems } from './hooks/useMediaData';
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
  
  // Extract data from consolidated operations
  const documents = mediaOps.documents.query.data || [];
  const progressImages = mediaOps.images.query.images || [];

  // Optimized data processing with unified state
  const allMediaItems = useAllMediaItems({ project, documents, progressImages });
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
      if (item.category === 'progress' || item.category === 'inspiration' || item.category === 'profile') {
        // Use consolidated media operations
        await mediaOps.images.delete.mutateAsync({
          projectId: project.id,
          imageUrl: item.url,
          imageName: item.name,
          imageType: item.category as 'progress' | 'inspiration' | 'profile'
        });
        
        // Optimistic update will handle UI removal automatically
        
      } else if (isDocumentType(item.category as string)) {
        // CRITICAL FIX: Use optimistic mutation instead of direct Supabase calls
        
        if (item.id) {
          // Delete document using consolidated operations
          await mediaOps.documents.delete.mutateAsync(item.id);
          
          toast({
            title: "Document Deleted",
            description: "Document deleted successfully.",
          });
        } else {
          toast({
            title: "Delete Error", 
            description: "Cannot delete document - no ID found.",
            variant: "destructive",
          });
        }
        
      } else {
        // Handle unknown item types
        toast({
          title: "Delete Error",
          description: "Cannot delete this type of item.",
          variant: "destructive",
        });
      }
      
      
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete item. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast, project.id, mediaOps]);

  const handleSetAsProfile = useCallback(async (imageUrl: string) => {
    try {
      // Find the image name from the URL
      const mediaItem = allMediaItems.find(item => item.url === imageUrl);
      const imageName = mediaItem?.name || 'image';
      
      // Use consolidated media operations
      await mediaOps.images.setProfile.mutateAsync({
        projectId: project.id,
        imageUrl,
        imageName
      });
      
      // Optimistic update will handle UI changes automatically
      
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to set profile image. Please try again.",
        variant: "destructive",
      });
    }
  }, [project.id, allMediaItems, mediaOps, toast]);

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
      // Use consolidated media operations
      await mediaOps.upload.uploadImages(results, 'inspiration');
      
      actions.closeUploadModal();
    } catch (_error) {
      toast({
        title: "Upload Error",
        description: "Images uploaded but failed to save to database. Please try again.",
        variant: "destructive",
      });
    }
  }, [actions, toast, mediaOps, project.id]);

  const handleProgressUpload = useCallback(async (results: UploadResult[]) => {
    try {
      // Use consolidated media operations
      await mediaOps.upload.uploadImages(results, 'progress');
      
      actions.closeUploadModal();
    } catch (_error) {
      toast({
        title: "Upload Error",
        description: "Images uploaded but failed to save to database. Please try again.",
        variant: "destructive",
      });
    }
  }, [actions, toast, mediaOps, project.id]);

  const handleDocumentUpload = useCallback(async (results: UploadResult[]) => {
    try {
      // CRITICAL FIX: Batch create documents to prevent sequential optimistic update race conditions
      // Instead of sequential for-loop, create all documents in parallel with Promise.allSettled
      
      // Determine document type based on file extension
      const _getDocumentType = (fileName: string) => {
        const ext = fileName.toLowerCase().split('.').pop();
        switch (ext) {
          case 'pdf': return 'REPORT';
          case 'doc':
          case 'docx': return 'CONTRACT';
          case 'xls':
          case 'xlsx': return 'INVOICE';
          case 'jpg':
          case 'jpeg':
          case 'png':
          case 'gif':
          case 'webp': return 'PHOTO';
          case 'mp4':
          case 'mov':
          case 'avi': return 'VIDEO';
          default: return 'OTHER';
        }
      };

      // Create document payloads for batch processing using actual storage URLs
      // Use SimplifiedUpload URLs directly but let the database mutation handle conflicts with retry logic
      // Use consolidated media operations for document upload
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
  }, [actions, toast, mediaOps, project.id]);

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
