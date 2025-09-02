/**
 * Virtual Media Grid Component - Phase 3.3
 * High-performance virtualized grid for displaying large media collections
 * Optimized for construction sites with hundreds of images and documents
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { VariableSizeGrid as Grid } from 'react-window';
import { cn } from '@/lib/utils';
import { LazyMediaItem } from './LazyMediaItem';
import { GridViewport } from './GridViewport';
import { useMedia } from '@/hooks/useMedia';
import type { MediaItem } from '@/hooks/useMedia';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Grid3X3, List, Filter } from 'lucide-react';

export interface VirtualMediaGridProps {
  projectId: string;
  className?: string;
  onItemClick?: (item: MediaItem) => void;
  onItemSelect?: (items: MediaItem[]) => void;
  selectable?: boolean;
  filterOptions?: {
    showSearch?: boolean;
    showCategoryFilter?: boolean;
    showTypeFilter?: boolean;
  };
  viewOptions?: {
    defaultView?: 'grid' | 'list';
    allowViewToggle?: boolean;
  };
  gridConfig?: {
    minItemWidth?: number;
    maxItemWidth?: number;
    itemSpacing?: number;
    overscan?: number;
  };
}

interface GridItemData {
  items: MediaItem[];
  columnCount: number;
  columnWidth: number;
  itemHeight: number;
  itemSpacing: number;
  onItemClick?: (item: MediaItem) => void;
  selectedItems: Set<string>;
  onItemSelect?: (item: MediaItem, selected: boolean) => void;
  networkQuality: string;
}

// Grid cell component
const GridCell = React.memo<{
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: GridItemData;
}>(({ columnIndex, rowIndex, style, data }) => {
  const {
    items,
    columnCount,
    itemSpacing,
    onItemClick,
    selectedItems,
    onItemSelect,
    networkQuality
  } = data;
  
  const itemIndex = rowIndex * columnCount + columnIndex;
  const item = items[itemIndex];
  
  if (!item) {
    return <div style={style} />; // Empty cell
  }
  
  const isSelected = selectedItems.has(item.id);
  
  return (
    <div
      style={{
        ...style,
        left: (style.left as number) + itemSpacing / 2,
        top: (style.top as number) + itemSpacing / 2,
        width: (style.width as number) - itemSpacing,
        height: (style.height as number) - itemSpacing,
      }}
    >
      <LazyMediaItem
        item={item}
        onClick={() => onItemClick?.(item)}
        onSelect={onItemSelect ? (selected) => onItemSelect(item, selected) : undefined}
        selected={isSelected}
        networkQuality={networkQuality as 'excellent' | 'good' | 'poor' | 'offline'}
        className="h-full w-full"
      />
    </div>
  );
});

GridCell.displayName = 'GridCell';

export function VirtualMediaGrid({
  projectId,
  className,
  onItemClick,
  onItemSelect,
  selectable = false,
  filterOptions = {
    showSearch: true,
    showCategoryFilter: true,
    showTypeFilter: true,
  },
  viewOptions = {
    defaultView: 'grid',
    allowViewToggle: true,
  },
  gridConfig = {
    minItemWidth: 200,
    maxItemWidth: 300,
    itemSpacing: 16,
    overscan: 5,
  },
}: VirtualMediaGridProps) {
  const gridRef = useRef<Grid>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [viewMode, setViewMode] = useState(viewOptions.defaultView || 'grid');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Enhanced useMedia hook with virtualization support
  const {
    items,
    stats,
    isLoading,
    error,
    networkQuality,
    filters,
    setFilters,
  } = useMedia(projectId, {
    filters: {
      search: searchQuery || undefined,
    },
  });

  // Container size observer
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Grid calculations optimized for construction site usage
  const gridLayout = useMemo(() => {
    const { width } = containerSize;
    if (width === 0) return { columnCount: 1, columnWidth: 200, rowCount: 0 };

    const { minItemWidth = 200, maxItemWidth = 300, itemSpacing = 16 } = gridConfig;
    const availableWidth = width - itemSpacing;
    
    // Calculate optimal column count based on screen size
    let columnCount: number;
    if (width <= 640) {
      // Mobile: 1-2 columns
      columnCount = width < 480 ? 1 : 2;
    } else if (width <= 1024) {
      // Tablet: 2-3 columns  
      columnCount = Math.floor(availableWidth / (minItemWidth + itemSpacing)) || 2;
      columnCount = Math.min(columnCount, 3);
    } else {
      // Desktop: 3-5 columns
      columnCount = Math.floor(availableWidth / (minItemWidth + itemSpacing)) || 3;
      columnCount = Math.min(columnCount, 5);
    }

    const columnWidth = (availableWidth - (columnCount - 1) * itemSpacing) / columnCount;
    const clampedColumnWidth = Math.min(Math.max(columnWidth, minItemWidth), maxItemWidth);
    
    const rowCount = Math.ceil(items.length / columnCount);

    return {
      columnCount,
      columnWidth: clampedColumnWidth,
      rowCount,
    };
  }, [containerSize, items.length, gridConfig]);

  // Item height calculation based on content type and network quality
  const getItemHeight = useCallback((rowIndex: number) => {
    // Base height calculation - responsive based on screen size
    const baseHeight = containerSize.width <= 640 ? 180 : 200;
    
    // Adjust based on network quality for construction sites
    const networkMultiplier = {
      excellent: 1.0,
      good: 1.0, 
      poor: 0.8, // Smaller images on poor connections
      offline: 0.8,
    }[networkQuality as keyof typeof networkMultiplier] || 1.0;

    return Math.floor(baseHeight * networkMultiplier);
  }, [containerSize.width, networkQuality]);

  const getColumnWidth = useCallback(() => gridLayout.columnWidth, [gridLayout.columnWidth]);

  // Grid data for virtualization
  const gridData: GridItemData = useMemo(() => ({
    items,
    columnCount: gridLayout.columnCount,
    columnWidth: gridLayout.columnWidth,
    itemHeight: getItemHeight(0),
    itemSpacing: gridConfig.itemSpacing || 16,
    onItemClick,
    selectedItems,
    onItemSelect: selectable ? (item: MediaItem, selected: boolean) => {
      const newSelectedItems = new Set(selectedItems);
      if (selected) {
        newSelectedItems.add(item.id);
      } else {
        newSelectedItems.delete(item.id);
      }
      setSelectedItems(newSelectedItems);
      onItemSelect?.(Array.from(newSelectedItems).map(id => items.find(item => item.id === id)!).filter(Boolean));
    } : undefined,
    networkQuality: networkQuality,
  }), [items, gridLayout, selectedItems, onItemClick, onItemSelect, selectable, networkQuality, gridConfig.itemSpacing]);

  // Keyboard navigation for accessibility
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!gridRef.current) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          gridRef.current.scrollBy({ scrollTop: 200 });
          break;
        case 'ArrowUp':
          event.preventDefault();
          gridRef.current.scrollBy({ scrollTop: -200 });
          break;
        case 'Home':
          event.preventDefault();
          gridRef.current.scrollTo({ scrollTop: 0 });
          break;
        case 'End':
          event.preventDefault();
          gridRef.current.scrollTo({ scrollTop: Number.MAX_SAFE_INTEGER });
          break;
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('keydown', handleKeyDown);
      return () => container.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  // Handle search with debouncing
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  if (error) {
    return (
      <Card className="flex items-center justify-center p-8 text-center">
        <div className="space-y-2">
          <p className="text-lg font-medium text-destructive">Failed to load media</p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold">
            Media Library ({stats?.total || 0} items)
          </h3>
          {networkQuality && (
            <span className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              networkQuality === 'excellent' && "bg-green-100 text-green-800",
              networkQuality === 'good' && "bg-blue-100 text-blue-800",
              networkQuality === 'poor' && "bg-amber-100 text-amber-800",
              networkQuality === 'offline' && "bg-gray-100 text-gray-800",
            )}>
              {networkQuality}
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search */}
          {filterOptions.showSearch && (
            <div className="relative min-w-[200px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search media..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8"
              />
            </div>
          )}

          {/* View toggle */}
          {viewOptions.allowViewToggle && (
            <div className="flex rounded-md border">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Selected items indicator */}
      {selectable && selectedItems.size > 0 && (
        <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
          <span className="text-sm font-medium">
            {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''} selected
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedItems(new Set())}
          >
            Clear selection
          </Button>
        </div>
      )}

      {/* Virtual Grid */}
      <div
        ref={containerRef}
        className="flex-1 border rounded-lg overflow-hidden bg-background"
        style={{ minHeight: 400 }}
        tabIndex={0}
        role="grid"
        aria-label="Media grid"
      >
        {containerSize.width > 0 && (
          <>
            {isLoading && items.length === 0 ? (
              <GridViewport
                width={containerSize.width}
                height={Math.min(containerSize.height, 400)}
                loading={true}
              />
            ) : items.length === 0 ? (
              <div className="flex items-center justify-center h-full p-8">
                <div className="text-center space-y-2">
                  <Filter className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-lg font-medium">No media found</p>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery 
                      ? `No results for "${searchQuery}"`
                      : "Upload some files to get started"
                    }
                  </p>
                </div>
              </div>
            ) : (
              <Grid
                ref={gridRef}
                className="virtual-grid"
                height={Math.min(containerSize.height, 600)}
                width={containerSize.width}
                columnCount={gridLayout.columnCount}
                columnWidth={getColumnWidth}
                rowCount={gridLayout.rowCount}
                rowHeight={getItemHeight}
                itemData={gridData}
                overscanRowCount={gridConfig.overscan || 5}
                overscanColumnCount={1}
                useIsScrolling={true}
              >
                {GridCell}
              </Grid>
            )}
          </>
        )}
      </div>

      {/* Performance stats for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
          Grid: {gridLayout.columnCount} cols × {gridLayout.rowCount} rows | 
          Items: {items.length} | 
          Network: {networkQuality} |
          Container: {Math.round(containerSize.width)}×{Math.round(containerSize.height)}
        </div>
      )}
    </div>
  );
}