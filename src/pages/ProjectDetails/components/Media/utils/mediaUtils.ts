/**
 * Shared utilities for media management
 * Consolidates common logic used across media components
 */

import { MediaItem } from '../types';

/**
 * Format file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format date for media items
 */
export const formatMediaDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

/**
 * Get category badge configuration
 */
export const getCategoryBadgeConfig = (category: string) => {
  const configs = {
    profile: {
      className: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/30',
      showStar: true
    },
    inspiration: {
      className: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-500/30',
      showStar: false
    },
    progress: {
      className: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-500/30',
      showStar: false
    },
    progress_video: {
      className: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-green-600/30',
      showStar: false
    },
    // Document types
    Contract: { className: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-purple-500/30', showStar: false },
    Permit: { className: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-purple-500/30', showStar: false },
    Invoice: { className: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-purple-500/30', showStar: false },
    Drawing: { className: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-purple-500/30', showStar: false },
    Receipt: { className: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-purple-500/30', showStar: false },
    Report: { className: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-purple-500/30', showStar: false },
    Specification: { className: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-purple-500/30', showStar: false },
    Schedule: { className: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-purple-500/30', showStar: false },
    Manual: { className: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-purple-500/30', showStar: false },
    Certificate: { className: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-purple-500/30', showStar: false },
    Other: { className: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-purple-500/30', showStar: false },
    Document: { className: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-purple-500/30', showStar: false }
  };

  return configs[category as keyof typeof configs] || {
    className: 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-slate-600/30',
    showStar: false
  };
};

/**
 * Check if media item is an image (should show image preview)
 * Uses media_type field from database for accurate detection
 */
export const isImageType = (item: MediaItem): boolean => {
  return item.media_type?.toUpperCase() === 'PHOTO';
};

/**
 * Check if media item is a video (should show video preview)
 * Uses media_type field from database for accurate detection
 */
export const isVideoType = (item: MediaItem): boolean => {
  return item.media_type?.toUpperCase() === 'VIDEO';
};

/**
 * Get type badge configuration using database media_type
 */
export const getTypeBadgeConfig = (item: MediaItem) => {
  switch (item.media_type) {
    case 'PHOTO':
      return {
        className: 'bg-blue-100 text-blue-700',
        label: 'Photo'
      };
    case 'VIDEO':
      return {
        className: 'bg-green-100 text-green-700',
        label: 'Video'
      };
    case 'DOCUMENT':
    default:
      return {
        className: 'bg-purple-100 text-purple-700',
        label: 'Document'
      };
  }
};

/**
 * Document type categories for delete validation
 */
export const DOCUMENT_CATEGORIES = [
  'contract', 'permit', 'invoice', 'blueprint', 'receipt', 'report', 'other'
];

/**
 * Check if media item should be treated as a downloadable document
 * Uses media_type field from database for accurate detection
 */
export const isDownloadableDocument = (item: MediaItem): boolean => {
  return item.media_type?.toUpperCase() === 'DOCUMENT';
};
