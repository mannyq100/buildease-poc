/**
 * MediaGrid component for displaying media items
 * Extracted from ProjectDocumentsSection for better maintainability
 */

import React, { memo } from 'react';
import { MediaItem } from '../types';
import { MediaItemCard } from './MediaItemCard';

interface MediaGridProps {
  items: MediaItem[];
  onItemClick: (item: MediaItem, e: React.MouseEvent) => void;
  onDelete: (item: MediaItem) => Promise<void>;
  onSetAsProfile: (mediaId: string) => void;
  onDownload: (item: MediaItem) => Promise<void>;
  permissions: {
    canDelete: (item: MediaItem) => boolean;
    canEdit: (item: MediaItem) => boolean;
    canSetAsProfile: (item: MediaItem) => boolean;
  };
}

export const MediaGrid = memo<MediaGridProps>(({
  items,
  onItemClick,
  onDelete,
  onSetAsProfile,
  onDownload,
  permissions
}) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="h-12 w-12 text-muted-foreground mx-auto mb-4">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h4 className="text-lg font-medium mb-2">No media yet</h4>
        <p className="text-muted-foreground mb-4">
          Start by uploading some images or documents for your project.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {items.map((item) => (
        <MediaItemCard
          key={item.id}
          item={item}
          onClick={onItemClick}
          onDelete={onDelete}
          onSetAsProfile={onSetAsProfile}
          onDownload={onDownload}
          permissions={permissions}
        />
      ))}
    </div>
  );
});

MediaGrid.displayName = 'MediaGrid';
