/**
 * Media Components - BuildEase Advanced Media Management
 * Export all media management components for easy importing
 */

export { MediaGallery } from './MediaGallery';
export { MediaUpload } from './MediaUpload';
export { MediaMetadataEditor } from './MediaMetadataEditor';
export { AdvancedMediaSearch } from './AdvancedMediaSearch';
export { BulkOperationsToolbar } from './BulkOperationsToolbar';

// Re-export types for convenience
export type {
  MediaSearchFilters,
  MediaSearchResult,
  MediaCollection,
  ProjectMediaStats,
  BulkMediaOperation,
  BulkOperationResult
} from '@/types/database';