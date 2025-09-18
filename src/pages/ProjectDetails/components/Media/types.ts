/**
 * Type definitions for ProjectDocumentsSection
 * Uses global MediaItem type and defines local component-specific types
 */

import type { MediaItem } from '@/types/media';
import type { MediaCategory } from '@/types/database';

// Local display types for legacy compatibility
export type MediaType = 'image' | 'document' | 'video';

// Re-export MediaItem from global types for consistency
export type { MediaItem };

import type { UploadResult } from '@/types/upload';

// Component-specific filter interface
export interface MediaFilters {
  readonly media_type?: 'all' | 'PHOTO' | 'VIDEO' | 'DOCUMENT';
  readonly category?: 'all' | MediaCategory;
  readonly phase_id?: 'all' | string;
  readonly search?: string;
}

// Component state management
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

// Component action handlers
export interface MediaActions {
  readonly onDelete: (item: MediaItem) => Promise<void>;
  readonly onEdit: (item: MediaItem) => Promise<void>;
  readonly onDownload: (item: MediaItem) => Promise<void>;
  readonly onSetAsProfile: (item: MediaItem) => Promise<void>;
}

// Permission checking interface
export interface MediaPermissions {
  readonly canDelete: (item: MediaItem) => boolean;
  readonly canEdit: (item: MediaItem) => boolean;
  readonly canSetAsProfile: (item: MediaItem) => boolean;
}

// Upload modal props
export interface UploadModalProps {
  readonly isOpen: boolean;
  readonly type: 'inspiration' | 'progress' | 'documents';
  readonly projectId: string;
  readonly onClose: () => void;
  readonly onUploadComplete: (results: UploadResult[]) => void;
}
