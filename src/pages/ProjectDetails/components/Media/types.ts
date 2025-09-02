/**
 * Strict type definitions for ProjectDocumentsSection
 * Following BuildEase coding standards for type safety
 */

export type MediaType = 'image' | 'document' | 'video';

export type DocumentType = 'contract' | 'permit' | 'invoice' | 'blueprint' | 'other';

export type MediaCategory = 'profile' | 'inspiration' | 'progress' | 'progress_video' | DocumentType;

export interface MediaItem {
  readonly id: string;
  readonly name: string;
  readonly url: string;
  readonly media_type: 'PHOTO' | 'VIDEO' | 'DOCUMENT'; // Database field
  readonly category: MediaCategory; // Database field
  readonly size?: number;
  readonly created_at: string; // Database field
  readonly uploaded_at?: Date;
  // Legacy compatibility fields
  readonly type: MediaType; // Computed display type for backward compatibility
  readonly documentType?: string;
}

export interface MediaFilters {
  readonly media_type?: 'all' | 'PHOTO' | 'VIDEO' | 'DOCUMENT';
  readonly category?: 'all' | string;
  readonly phase_id?: 'all' | string;
  readonly search?: string;
}

export interface MediaState {
  readonly search: string;
  readonly filters: MediaFilters;
  readonly modals: {
    readonly upload: { readonly type: 'inspiration' | 'progress' | 'documents' | null };
    readonly preview: { readonly url: string | null };
  };
  readonly ui: { 
    readonly showUploadOptions: boolean;
    readonly isLoading: boolean;
  };
}

export interface MediaActions {
  readonly onDelete: (item: MediaItem) => Promise<void>;
  readonly onEdit: (item: MediaItem) => Promise<void>;
  readonly onDownload: (item: MediaItem) => Promise<void>;
  readonly onSetAsProfile: (item: MediaItem) => Promise<void>;
}

export interface MediaPermissions {
  readonly canDelete: (item: MediaItem) => boolean;
  readonly canEdit: (item: MediaItem) => boolean;
  readonly canSetAsProfile: (item: MediaItem) => boolean;
}

import type { UploadResult } from '@/types/upload';

// Upload-related types
export interface UploadModalProps {
  readonly isOpen: boolean;
  readonly type: 'inspiration' | 'progress' | 'documents';
  readonly projectId: string;
  readonly onClose: () => void;
  readonly onUploadComplete: (results: UploadResult[]) => void;
}
