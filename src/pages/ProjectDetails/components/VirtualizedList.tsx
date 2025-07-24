/**
 * VirtualizedList - Simple virtualization for mobile performance
 * Only renders visible items with a buffer for smooth scrolling
 * Lightweight alternative to full virtual scrolling libraries
 */

import React, { useState, useRef, useCallback } from 'react';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number; // Number of items to render outside visible area
  className?: string;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = ''
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight),
    items.length - 1
  );

  // Add overscan buffer
  const startIndex = Math.max(0, visibleStart - overscan);
  const endIndex = Math.min(items.length - 1, visibleEnd + overscan);

  // Handle scroll events
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Calculate total height and visible items
  const totalHeight = items.length * itemHeight;
  const visibleItems = items.slice(startIndex, endIndex + 1);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${startIndex * itemHeight}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Hook to determine if virtualization is needed
export function useVirtualizationThreshold(itemCount: number, threshold = 50) {
  return itemCount > threshold;
}

// Mobile-optimized list wrapper that conditionally uses virtualization
interface SmartListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight?: number;
  maxHeight?: number;
  className?: string;
}

export function SmartList<T>({
  items,
  renderItem,
  itemHeight = 80,
  maxHeight = 400,
  className = ''
}: SmartListProps<T>) {
  const shouldVirtualize = useVirtualizationThreshold(items.length);

  if (!shouldVirtualize) {
    // Render normal list for small datasets
    return (
      <div className={`space-y-2 ${className}`}>
        {items.map((item, index) => (
          <div key={index}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    );
  }

  // Use virtualization for large datasets
  return (
    <VirtualizedList
      items={items}
      itemHeight={itemHeight}
      containerHeight={maxHeight}
      renderItem={renderItem}
      className={className}
    />
  );
}