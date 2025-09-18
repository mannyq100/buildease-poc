/**
 * VirtualizedMediaGrid - High-performance virtualized grid for large media collections
 * Optimized for BuildEase construction project media management
 */

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { cn } from '@/utils/core/ui';
import type { MediaItem } from '@/types/media';

interface VirtualizedMediaGridProps {
  /** Array of media items to display */
  items: MediaItem[];
  /** Number of items per row (responsive) */
  itemsPerRow?: number;
  /** Height of each row in pixels */
  rowHeight?: number;
  /** Width of each column in pixels */
  columnWidth?: number;
  /** Container height in pixels */
  height?: number;
  /** Container width (defaults to 100%) */
  width?: string | number;
  /** Grid gap between items */
  gap?: number;
  /** Threshold for enabling virtualization */
  virtualizationThreshold?: number;
  /** Render function for individual items */
  renderItem: (item: MediaItem, index: number) => React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Loading state */
  isLoading?: boolean;
  /** No items message */
  emptyMessage?: string;
  /** Overscan count for better scrolling performance */
  overscan?: number;
}

interface GridItemData {
  items: MediaItem[];
  itemsPerRow: number;
  renderItem: (item: MediaItem, index: number) => React.ReactNode;
  columnWidth: number;
  gap: number;
}

/**
 * Individual cell renderer for the virtualized grid
 */
const GridCell = React.memo<{
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: GridItemData;
}>(({ columnIndex, rowIndex, style, data }) => {
  const { items, itemsPerRow, renderItem, columnWidth, gap } = data;
  const itemIndex = rowIndex * itemsPerRow + columnIndex;
  const item = items[itemIndex];

  // Don't render if no item exists at this position
  if (!item) {
    return <div style={style} />;
  }

  return (
    <div
      style={{
        ...style,
        left: Number(style.left) + gap / 2,
        top: Number(style.top) + gap / 2,
        width: columnWidth - gap,
        height: Number(style.height) - gap,
      }}
      className="flex items-center justify-center"
    >
      {renderItem(item, itemIndex)}
    </div>
  );
});

GridCell.displayName = 'GridCell';

/**
 * Hook to calculate responsive grid dimensions
 */
function useResponsiveGrid(containerWidth: number, minColumnWidth: number = 280) {
  return useMemo(() => {
    if (containerWidth <= 0) return { itemsPerRow: 2, columnWidth: 300 };

    // Calculate optimal number of columns based on container width
    const maxColumns = Math.floor(containerWidth / minColumnWidth);
    const itemsPerRow = Math.max(1, Math.min(maxColumns, 6)); // Cap at 6 columns
    const columnWidth = Math.floor(containerWidth / itemsPerRow);

    return { itemsPerRow, columnWidth };
  }, [containerWidth, minColumnWidth]);
}

/**
 * Hook to detect container width for responsive behavior
 */
function useContainerWidth(containerRef: React.RefObject<HTMLDivElement>) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [containerRef]);

  return width;
}

/**
 * Loading skeleton for virtualized grid
 */
const VirtualizedGridSkeleton: React.FC<{ 
  itemsPerRow: number; 
  rowHeight: number; 
  height: number; 
}> = ({ itemsPerRow, rowHeight, height }) => {
  const skeletonRows = Math.ceil(height / rowHeight);
  
  return (
    <div className="space-y-4">
      {Array.from({ length: skeletonRows }, (_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: itemsPerRow }, (_, colIndex) => (
            <div
              key={colIndex}
              className="animate-pulse bg-slate-200 rounded-2xl"
              style={{ height: rowHeight - 16, flex: 1 }}
            >
              <div className="aspect-square bg-slate-300 rounded-t-2xl" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-slate-300 rounded w-3/4" />
                <div className="h-3 bg-slate-300 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * VirtualizedMediaGrid Component
 * 
 * Automatically switches between regular grid and virtualized grid
 * based on the number of items and performance requirements
 */
export function VirtualizedMediaGrid({
  items,
  itemsPerRow: propItemsPerRow,
  rowHeight = 350,
  columnWidth: propColumnWidth,
  height = 600,
  width = '100%',
  gap = 16,
  virtualizationThreshold = 50,
  renderItem,
  className,
  isLoading = false,
  emptyMessage = 'No media items found',
  overscan = 5
}: VirtualizedMediaGridProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const containerWidth = useContainerWidth(containerRef);
  const { itemsPerRow: responsiveItemsPerRow, columnWidth: responsiveColumnWidth } = useResponsiveGrid(containerWidth);

  // Use provided values or responsive calculations
  const finalItemsPerRow = propItemsPerRow || responsiveItemsPerRow;
  const finalColumnWidth = propColumnWidth || responsiveColumnWidth;

  // Calculate grid dimensions
  const totalRows = Math.ceil(items.length / finalItemsPerRow);
  const shouldVirtualize = items.length >= virtualizationThreshold;

  // Memoize grid data for performance
  const gridData = useMemo<GridItemData>(() => ({
    items,
    itemsPerRow: finalItemsPerRow,
    renderItem,
    columnWidth: finalColumnWidth,
    gap
  }), [items, finalItemsPerRow, renderItem, finalColumnWidth, gap]);

  const handleItemsRendered = useCallback(({
    visibleRowStartIndex,
    visibleRowStopIndex,
  }: {
    visibleRowStartIndex: number;
    visibleRowStopIndex: number;
  }) => {
    // Optional: Add analytics or performance monitoring
    const visibleItemsCount = (visibleRowStopIndex - visibleRowStartIndex + 1) * finalItemsPerRow;
    console.debug(`Virtualized grid rendering ${visibleItemsCount} items (rows ${visibleRowStartIndex}-${visibleRowStopIndex})`);
  }, [finalItemsPerRow]);

  // Show loading skeleton
  if (isLoading) {
    return (
      <div ref={containerRef} className={cn('w-full', className)}>
        <VirtualizedGridSkeleton 
          itemsPerRow={finalItemsPerRow}
          rowHeight={rowHeight}
          height={height}
        />
      </div>
    );
  }

  // Show empty message
  if (items.length === 0) {
    return (
      <div ref={containerRef} className={cn('w-full flex items-center justify-center', className)} style={{ height }}>
        <div className="text-center text-slate-500">
          <div className="text-6xl mb-4">📁</div>
          <p className="text-lg font-medium">{emptyMessage}</p>
          <p className="text-sm text-slate-400 mt-2">Upload some media to get started</p>
        </div>
      </div>
    );
  }

  // Use regular grid for small collections (better performance for small sets)
  if (!shouldVirtualize) {
    return (
      <div ref={containerRef} className={cn('w-full', className)}>
        <div 
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${finalItemsPerRow}, 1fr)`,
          }}
        >
          {items.map((item, index) => (
            <div key={item.id || index}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Use virtualized grid for large collections
  return (
    <div ref={containerRef} className={cn('w-full', className)}>
      <div className="text-xs text-slate-500 mb-2 flex items-center justify-between">
        <span>Showing {items.length} items (virtualized)</span>
        <span className="text-xs text-slate-400">
          Performance mode: {finalItemsPerRow} columns
        </span>
      </div>
      
      <Grid
        columnCount={finalItemsPerRow}
        columnWidth={finalColumnWidth}
        height={height}
        rowCount={totalRows}
        rowHeight={rowHeight}
        width={typeof width === 'string' ? containerWidth || '100%' : width}
        itemData={gridData}
        overscanRowCount={overscan}
        onItemsRendered={handleItemsRendered}
        className="virtualized-media-grid"
      >
        {GridCell}
      </Grid>
      
      {/* Performance info for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-slate-400 mt-2 p-2 bg-slate-50 rounded">
          <strong>Grid Performance:</strong> {items.length} items, {totalRows} rows, 
          {finalItemsPerRow} columns, {rowHeight}px row height
        </div>
      )}
    </div>
  );
}

/**
 * Hook for managing virtualized grid state
 */
export function useVirtualizedGrid<T>(
  items: T[],
  options: {
    threshold?: number;
    itemsPerRow?: number;
    rowHeight?: number;
  } = {}
) {
  const { threshold = 50, itemsPerRow = 4, rowHeight = 350 } = options;
  
  const shouldVirtualize = items.length >= threshold;
  const totalRows = Math.ceil(items.length / itemsPerRow);
  
  return {
    shouldVirtualize,
    totalRows,
    gridConfig: {
      itemsPerRow,
      rowHeight,
      columnWidth: Math.floor(1200 / itemsPerRow), // Assume 1200px container
    },
    performance: {
      itemCount: items.length,
      memoryEstimate: `~${Math.round((items.length * 0.5) / 1024)}KB`, // Rough estimate
      renderingMode: shouldVirtualize ? 'virtualized' : 'standard'
    }
  };
}

export default VirtualizedMediaGrid;