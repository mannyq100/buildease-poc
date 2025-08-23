/**
 * ProjectDocumentsSection - Refactored media management component
 * Implements clean separation of concerns and performance optimizations
 */

import React, { useCallback, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useProjectDocuments } from '@/hooks/queries/useDocuments';
import { useCreateDocument, useDeleteDocument } from '@/hooks/mutations/useDocumentMutations';
import { useUploadImages, useDeleteImage, useSetProfileImage } from '@/hooks/mutations/useImageMutations';
import { useProjectProgressImages } from '@/hooks/useProjectStorageImages';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

import { Project } from '@/types/project';
import { MediaFilters, MediaItem } from './types';
import { UploadResult } from '@/types/upload';
import { isDocumentType } from './utils/mediaUtils';

// Optimized hooks
import { useAllMediaItems } from './hooks/useMediaData';
import { useDownloadManager } from './hooks/useMemoryManagement';
import { useUnifiedMediaState } from './hooks/useUnifiedMediaState';
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
  onUpdateProject,
  className
}: ProjectDocumentsSectionProps) {
  const { toast } = useToast();
  const { user } = useSupabaseAuth();
  
  // Unified state management
  const { state, actions } = useUnifiedMediaState(false);
  
  // Removed deletedItems state - optimistic updates handle UI removal automatically

  // Data fetching
  const { data: documents = [] } = useProjectDocuments(project.id);
  
  // Mutations for document operations
  const createDocumentMutation = useCreateDocument();
  const deleteDocumentMutation = useDeleteDocument();
  
  // Mutations for image operations
  const uploadImagesMutation = useUploadImages();
  const deleteImageMutation = useDeleteImage();
  const setProfileImageMutation = useSetProfileImage();
  const { images: progressImages = [], refetch: refetchProgressImages } = useProjectProgressImages(project.id);

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
        // Use dedicated image mutation with proper activity logging
        await deleteImageMutation.mutateAsync({
          projectId: project.id,
          imageUrl: item.url,
          imageName: item.name,
          imageType: item.category as 'progress' | 'inspiration' | 'profile'
        });
        
        // Optimistic update will handle UI removal automatically
        
      } else if (isDocumentType(item.category as string)) {
        // CRITICAL FIX: Use optimistic mutation instead of direct Supabase calls
        
        if (item.id) {
          // Delete document using optimistic mutation (handles both storage and database)
          await deleteDocumentMutation.mutateAsync(item.id);
          
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
  }, [toast, project.id, deleteDocumentMutation, deleteImageMutation]);

  const handleSetAsProfile = useCallback(async (imageUrl: string) => {
    try {
      // Find the image name from the URL
      const mediaItem = allMediaItems.find(item => item.url === imageUrl);
      const imageName = mediaItem?.name || 'image';
      
      // Use dedicated profile image mutation with proper activity logging
      await setProfileImageMutation.mutateAsync({
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
  }, [project.id, allMediaItems, setProfileImageMutation, toast]);

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
      // Use dedicated image upload mutation with proper activity logging
      await uploadImagesMutation.mutateAsync({
        projectId: project.id,
        results,
        imageType: 'inspiration'
      });
      
      actions.closeUploadModal();
    } catch (_error) {
      toast({
        title: "Upload Error",
        description: "Images uploaded but failed to save to database. Please try again.",
        variant: "destructive",
      });
    }
  }, [actions, toast, uploadImagesMutation, project.id]);

  const handleProgressUpload = useCallback(async (results: UploadResult[]) => {
    try {
      // Use dedicated image upload mutation with proper activity logging
      await uploadImagesMutation.mutateAsync({
        projectId: project.id,
        results,
        imageType: 'progress'
      });
      
      // Also trigger storage refetch for consistency
      await refetchProgressImages();
      
      actions.closeUploadModal();
    } catch (_error) {
      toast({
        title: "Upload Error",
        description: "Images uploaded but failed to save to database. Please try again.",
        variant: "destructive",
      });
    }
  }, [actions, toast, refetchProgressImages, uploadImagesMutation, project.id]);

  const handleDocumentUpload = useCallback(async (results: UploadResult[]) => {
    try {
      // CRITICAL FIX: Batch create documents to prevent sequential optimistic update race conditions
      // Instead of sequential for-loop, create all documents in parallel with Promise.allSettled
      
      // Determine document type based on file extension
      const getDocumentType = (fileName: string) => {
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
      const documentCreationPromises = results.map(result => 
        createDocumentMutation.mutateAsync({
          name: result.name,
          document_type: getDocumentType(result.name),
          project_id: project.id,
          file_path: result.url, // Use actual SimplifiedUpload URL - mutation handles conflicts
          file_size: result.size,
          file_size_bytes: result.size,
          mime_type: result.type === 'documents' ? 'application/pdf' : 'image/jpeg', // Best guess based on type
          metadata: {
            original_filename: result.name,
            upload_timestamp: result.uploadedAt?.toISOString() || new Date().toISOString(),
            upload_type: result.type,
            storage_bucket: 'project-documents'
          },
          processing_status: 'completed'
        })
      );

      // Execute all document creations in parallel to avoid race conditions
      const documentResults = await Promise.allSettled(documentCreationPromises);
      
      // Check for any failures
      const failedCount = documentResults.filter(result => result.status === 'rejected').length;
      const successCount = documentResults.filter(result => result.status === 'fulfilled').length;

      actions.closeUploadModal();
      
      if (failedCount > 0) {
        toast({
          title: "Partial Upload Success",
          description: `${successCount} documents uploaded successfully, ${failedCount} failed. Check console for details.`,
          variant: "destructive",
        });
        
        // Log failed results for debugging
        documentResults.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`Document upload failed for ${results[index].name}:`, result.reason);
          }
        });
      } else {
        toast({
          title: "Upload Complete",
          description: `${successCount} document(s) uploaded and saved successfully.`,
        });
      }

      // The useProjectDocuments hook will automatically show the new documents via optimistic updates
      
    } catch (error) {
      console.error('Error creating document database entries:', error);
      toast({
        title: "Upload Error",
        description: "Failed to process document uploads. Please try again.",
        variant: "destructive",
      });
    }
  }, [actions, toast, createDocumentMutation, project.id]);

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
