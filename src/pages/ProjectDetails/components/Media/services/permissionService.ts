/**
 * Permission service for ProjectDocumentsSection
 * Centralizes all permission logic and access control
 */

import { MediaItem } from '../types';
import { Project } from '@/types/project';
import { User } from '@supabase/supabase-js';

export interface PermissionContext {
  user: User | null;
  project: Project;
  isOwner: boolean;
  isTeamMember: boolean;
}

/**
 * Permission service class for media operations
 * Provides centralized permission checking for all media actions
 */
export class MediaPermissionService {
  private context: PermissionContext;

  constructor(context: PermissionContext) {
    this.context = context;
  }

  /**
   * Check if user can delete a media item
   */
  canDelete(item: MediaItem): boolean {
    if (!this.context.user) return false;
    
    // Owner can delete anything
    if (this.context.isOwner) return true;
    
    // Team members can delete their own uploads
    if (this.context.isTeamMember) {
      // TODO: Add logic to check if user uploaded this item
      // For now, allow team members to delete non-profile items
      return item.category !== 'profile';
    }
    
    return false;
  }

  /**
   * Check if user can edit a media item
   */
  canEdit(item: MediaItem): boolean {
    if (!this.context.user) return false;
    
    // Owner can edit anything
    if (this.context.isOwner) return true;
    
    // Team members can edit metadata of their own uploads
    if (this.context.isTeamMember) {
      // TODO: Add logic to check if user uploaded this item
      return item.category !== 'profile';
    }
    
    return false;
  }

  /**
   * Check if user can set an image as profile
   */
  canSetAsProfile(item: MediaItem): boolean {
    if (!this.context.user) return false;
    
    // Only photos can be set as profile (use database media_type field)
    if (item.media_type !== 'PHOTO') return false;
    
    // Owner can set any photo as profile
    if (this.context.isOwner) return true;
    
    // Team members cannot set profile images
    return false;
  }

  /**
   * Check if user can download a media item
   */
  canDownload(_item: MediaItem): boolean {
    if (!this.context.user) return false;
    
    // All authenticated project members can download
    return this.context.isOwner || this.context.isTeamMember;
  }

  /**
   * Check if user can upload media
   */
  canUpload(type: 'inspiration' | 'progress' | 'progress_video' | 'documents'): boolean {
    if (!this.context.user) return false;
    
    // Owner can upload anything
    if (this.context.isOwner) return true;
    
    // Team members can upload progress images/videos and documents
    if (this.context.isTeamMember) {
      return type === 'progress' || type === 'progress_video' || type === 'documents';
    }
    
    return false;
  }

  /**
   * Check if user can view media
   */
  canView(): boolean {
    if (!this.context.user) return false;
    
    // All authenticated project members can view
    return this.context.isOwner || this.context.isTeamMember;
  }

  /**
   * Get permission summary for UI display
   */
  getPermissionSummary() {
    return {
      canView: this.canView(),
      canUploadInspiration: this.canUpload('inspiration'),
      canUploadProgress: this.canUpload('progress'),
      canUploadProgressVideo: this.canUpload('progress_video'),
      canUploadDocuments: this.canUpload('documents'),
      isOwner: this.context.isOwner,
      isTeamMember: this.context.isTeamMember
    };
  }
}

/**
 * Factory function to create permission service instance
 */
export const createPermissionService = (
  user: User | null,
  project: Project
): MediaPermissionService => {
  // Determine user's role in the project
  const isOwner = user?.id === project.owner_id;
  const isTeamMember = project.teamMembers?.some(
    (member: any) => member.user_id === user?.id
  ) || false;

  const context: PermissionContext = {
    user,
    project,
    isOwner,
    isTeamMember: isOwner || isTeamMember // Owner is also a team member
  };

  return new MediaPermissionService(context);
};

/**
 * Hook for using permission service in React components
 */
export const useMediaPermissions = (
  user: User | null,
  project: Project
) => {
  const service = createPermissionService(user, project);
  
  return {
    service,
    permissions: service.getPermissionSummary(),
    canDelete: (item: MediaItem) => service.canDelete(item),
    canEdit: (item: MediaItem) => service.canEdit(item),
    canSetAsProfile: (item: MediaItem) => service.canSetAsProfile(item),
    canDownload: (item: MediaItem) => service.canDownload(item),
    canUpload: (type: 'inspiration' | 'progress' | 'progress_video' | 'documents') => service.canUpload(type)
  };
};
