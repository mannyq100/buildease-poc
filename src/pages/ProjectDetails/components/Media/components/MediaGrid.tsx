/**
 * Enhanced MediaGrid component with virtual scrolling and performance optimizations
 * Supports both regular grid and virtualized grid based on collection size
 * Optimized for BuildEase construction media management
 */

import React, { memo, useMemo } from 'react';
import { MediaItem } from '../types';
import { MediaItemCard } from './MediaItemCard';
import { VirtualizedMediaGrid } from '@/components/VirtualizedMediaGrid';
import { useViewportWidth } from '@/hooks/useViewportWidth';

interface MediaGridProps {
  items: MediaItem[];
  onItemClick: (item: MediaItem, e: React.MouseEvent) => void;
  onDelete: (item: MediaItem) => Promise<void>;
  onSetAsProfile: (mediaId: string) => void;
  onRestoreOriginalCategory?: (mediaId: string) => void;
  onDownload: (item: MediaItem) => Promise<void>;
  permissions: {
    canDelete: (item: MediaItem) => boolean;
    canEdit: (item: MediaItem) => boolean;
    canSetAsProfile: (item: MediaItem) => boolean;
  };
  /** Enable virtual scrolling (default: auto-detect based on item count) */
  virtualized?: boolean;
  /** Threshold for enabling virtualization (default: 50) */
  virtualizationThreshold?: number;
  /** Loading state */
  isLoading?: boolean;
  /** Container height for virtualized mode */
  containerHeight?: number;
}

export const MediaGrid = memo<MediaGridProps>(({
  items,
  onItemClick,
  onDelete,
  onSetAsProfile,
  onRestoreOriginalCategory,
  onDownload,
  permissions,
  virtualized,
  virtualizationThreshold = 50,
  isLoading = false,
  containerHeight = 600
}) => {
  const { breakpoint, isMobile } = useViewportWidth();

  // Determine if virtualization should be used
  const shouldVirtualize = useMemo(() => {
    if (virtualized !== undefined) return virtualized;
    return items.length >= virtualizationThreshold;
  }, [virtualized, items.length, virtualizationThreshold]);

  // Calculate responsive grid parameters
  const gridConfig = useMemo(() => {
    const columnMap = {
      xs: 2,
      sm: 3,
      md: 4,
      lg: 5,
      xl: 6,
      '2xl': 6
    };
    
    const itemsPerRow = columnMap[breakpoint] || 4;
    const rowHeight = isMobile ? 320 : 350; // Slightly smaller on mobile
    
    return { itemsPerRow, rowHeight };
  }, [breakpoint, isMobile]);

  // Render individual media item
  const renderMediaItem = useMemo(() => (item: MediaItem, index: number) => (
    <MediaItemCard
      key={item.id || index}
      item={item}
      onClick={onItemClick}
      onDelete={onDelete}
      onSetAsProfile={onSetAsProfile}
      onRestoreOriginalCategory={onRestoreOriginalCategory}
      onDownload={onDownload}
      permissions={permissions}
    />
  ), [onItemClick, onDelete, onSetAsProfile, onRestoreOriginalCategory, onDownload, permissions]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Show skeleton loading grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-slate-200 rounded-t-2xl" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
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
        {/* Optional: Add upload button here */}
      </div>
    );
  }

  // Use virtualized grid for large collections
  if (shouldVirtualize) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
          <span>
            Displaying {items.length} items 
            {shouldVirtualize && <span className="ml-2 text-xs">(Performance mode)</span>}
          </span>
          <span className="text-xs">
            Grid: {gridConfig.itemsPerRow} columns
          </span>
        </div>
        
        <VirtualizedMediaGrid
          items={items}
          itemsPerRow={gridConfig.itemsPerRow}
          rowHeight={gridConfig.rowHeight}
          height={containerHeight}
          renderItem={renderMediaItem}
          virtualizationThreshold={virtualizationThreshold}
          className="media-grid-virtualized"
          emptyMessage="No media items found"
        />
      </div>
    );
  }

  // Use regular grid for smaller collections
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
        <span>Displaying {items.length} items</span>
        <span className="text-xs">
          Grid: {gridConfig.itemsPerRow} columns
        </span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {items.map((item, index) => renderMediaItem(item, index))}
      </div>
    </div>
  );
});

MediaGrid.displayName = 'MediaGrid';
