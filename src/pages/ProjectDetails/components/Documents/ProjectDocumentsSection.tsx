/**
 * ProjectDocumentsSection - Refactored media management component
 * Implements clean separation of concerns and performance optimizations
 */

import React, { useCallback, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useProjectDocuments } from '@/hooks/queries/useDocuments';
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
import { updateProjectImageArray } from '@/services/projectImageService';

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
  uploadModalState?: Record<string, unknown>; // Legacy prop from ProjectLayout
  onSetImageUploadState?: (key: string, value: unknown) => void; // Legacy prop from ProjectLayout
  className?: string;
}

export function ProjectDocumentsSection({
  project,
  onUpdateProject,
  uploadModalState: _uploadModalState, // Legacy prop - not used in refactored version
  onSetImageUploadState: _onSetImageUploadState, // Legacy prop - not used in refactored version
  className
}: ProjectDocumentsSectionProps) {
  const { toast } = useToast();
  const { user } = useSupabaseAuth();
  
  // Unified state management
  const { state, actions } = useUnifiedMediaState(false);
  
  // Local state to track deleted items for immediate UI updates
  const [deletedItems, setDeletedItems] = useState<Set<string>>(new Set());

  // Data fetching
  const { data: documents = [], refetch: refetchDocuments } = useProjectDocuments(project.id);
  const { images: progressImages = [], refetch: refetchProgressImages } = useProjectProgressImages(project.id);

  // Optimized data processing with unified state
  const allMediaItems = useAllMediaItems({ project, documents, progressImages });
  // Filter out deleted items for immediate UI feedback
  const itemsWithoutDeleted = allMediaItems.filter(item => !deletedItems.has(item.id));
  const filteredItems = useOptimizedFiltering(itemsWithoutDeleted, state.search, state.filters);
  
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
      if (item.category === 'progress') {
        // Delete progress image from Supabase storage
        
        const fileName = item.name;
        const { error: deleteError } = await supabase.storage
          .from('progress-images')
          .remove([`${project.id}/${fileName}`]);
        
        if (deleteError) {
          throw new Error(`Failed to delete progress image: ${deleteError.message}`);
        }
        
        // Also update database to remove from progress_images array
        const updatedProgressImages = (project.progress_images || [])
          .filter(url => !url.includes(fileName));
        
        await onUpdateProject({
          id: project.id,
          progress_images: updatedProgressImages
        });
        
        // Refetch progress images to update UI immediately
        await refetchProgressImages();
        
        toast({
          title: "Image Deleted",
          description: "Progress image deleted successfully.",
        });
        
      } else if (item.category === 'inspiration') {
        // Delete inspiration image from project array and storage
        
        // Delete from storage first
        const fileName = item.name;
        const { error: storageError } = await supabase.storage
          .from('project-inspiration')
          .remove([`${project.id}/${fileName}`]);
        
        if (storageError) {
          // Continue with database deletion even if storage fails
        }
        
        // Update project database
        const updatedInspirationImages = (project.inspiration_images || [])
          .filter(url => url !== item.url);
        
        await onUpdateProject({
          id: project.id,
          inspiration_images: updatedInspirationImages
        });
        
        // Immediately remove from UI by adding to deleted items set
        setDeletedItems(prev => new Set(prev).add(item.id));
        
        toast({
          title: "Image Deleted",
          description: "Inspiration image deleted successfully.",
        });
        
      } else if (item.category === 'profile') {
        // Delete profile image from project and storage
        
        // Delete from storage first
        const fileName = item.name;
        const { error: storageError } = await supabase.storage
          .from('profiles')
          .remove([`${project.id}/${fileName}`]);
        
        if (storageError) {
          // Continue with database deletion even if storage fails
        }
        
        // Update project database
        await onUpdateProject({
          id: project.id,
          profile_image: undefined
        });
        
        // Immediately remove from UI by adding to deleted items set
        setDeletedItems(prev => new Set(prev).add(item.id));
        
        toast({
          title: "Image Deleted",
          description: "Profile image deleted successfully.",
        });
        
      } else if (isDocumentType(item.category as string)) {
        // Validate that this is a document category
        
        // Delete document from both storage and database
        
        // First, delete from Supabase storage
        const fileName = item.name;
        const { error: storageError } = await supabase.storage
          .from('project-documents')
          .remove([`${project.id}/${fileName}`]);
        
        if (storageError) {
          // Continue with database deletion even if storage fails
        }
        
        // Then, delete from database using document ID
        if (item.id) {
          const { error: dbError } = await supabase
            .from('be_document')
            .delete()
            .eq('id', item.id);
          
          if (dbError) {
            throw new Error(`Failed to delete document from database: ${dbError.message}`);
          }
        }
        
        // Refetch documents to update UI immediately
        await refetchDocuments();
        
        toast({
          title: "Document Deleted",
          description: "Document deleted successfully from storage and database.",
        });
        
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
  }, [toast, project.id, project.inspiration_images, project.progress_images, refetchProgressImages, refetchDocuments, onUpdateProject, setDeletedItems]);

  const handleSetAsProfile = useCallback(async (imageUrl: string) => {
    try {
      // Update the profile image in the database
      const result = await updateProjectImageArray(project.id, [imageUrl], 'profile');
      
      if (result.success) {
        // Add to deleted items for immediate UI feedback (remove from current position)
        const mediaItem = allMediaItems.find(item => item.url === imageUrl);
        if (mediaItem) {
          setDeletedItems(prev => new Set([...prev, mediaItem.id]));
        }
        
        // Update local project state to reflect the change
        try {
          await onUpdateProject({ profile_image: imageUrl });
        } catch (updateError) {
          // Don't throw here since the DB update succeeded
        }
        
        toast({
          title: "Profile Image Updated",
          description: "This image has been set as your project's profile image.",
        });
      } else {
        throw new Error(result.error || 'Failed to update profile image');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to set profile image. Please try again.",
        variant: "destructive",
      });
    }
  }, [project, onUpdateProject, allMediaItems, setDeletedItems, toast]);

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

  // Upload handlers using unified state management
  const handleInspirationUpload = useCallback(async (results: UploadResult[]) => {
    
    try {
      // Update project state with new inspiration images
      const newInspirationImages = results.map(result => result.url);
      const updatedInspirationImages = [...(project.inspiration_images || []), ...newInspirationImages];
      
      
      // Call the database update
      await onUpdateProject({
        id: project.id,
        inspiration_images: updatedInspirationImages
      });
      
      
      actions.closeUploadModal();
      toast({
        title: "Upload Complete",
        description: `${results.length} inspiration image(s) uploaded and saved to database.`,
      });
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Images uploaded but failed to save to database. Please try again.",
        variant: "destructive",
      });
    }
  }, [actions, toast, onUpdateProject, project.inspiration_images, project.id]);

  const handleProgressUpload = useCallback(async (results: UploadResult[]) => {
    
    try {
      // Progress images need to be stored in BOTH Supabase storage AND database
      // This ensures consistency with inspiration images and proper data persistence
      
      
      // Update project state with new progress images (database persistence)
      const newProgressImages = results.map(result => result.url);
      const updatedProgressImages = [...(project.progress_images || []), ...newProgressImages];
      
      await onUpdateProject({
        id: project.id,
        progress_images: updatedProgressImages
      });
      
      
      // Also trigger storage refetch for consistency
      await refetchProgressImages();
      
      
      actions.closeUploadModal();
      toast({
        title: "Upload Complete",
        description: `${results.length} progress image(s) uploaded and saved to database.`,
      });
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Images uploaded but failed to save to database. Please try again.",
        variant: "destructive",
      });
    }
  }, [actions, toast, refetchProgressImages, onUpdateProject, project.progress_images, project.id]);

  const handleDocumentUpload = useCallback((results: UploadResult[]) => {
    
    // Documents are stored in the database via useProjectDocuments hook
    // The upload process should have already created database entries
    // No need to update project state as documents are fetched separately
    
    actions.closeUploadModal();
    toast({
      title: "Upload Complete",
      description: `${results.length} document(s) uploaded successfully.`,
    });
    
    // The useProjectDocuments hook will automatically refetch and update the UI
  }, [actions, toast]);

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
