/**
 * Virtual Media Grid Example - Phase 3.3 Demo
 * Shows how to use the VirtualMediaGrid for construction site media management
 * Ready for integration into project pages
 */

import React, { useState } from 'react';
import { VirtualMediaGrid } from './VirtualMediaGrid';
import { useVirtualizedMedia, useInfiniteMedia } from '@/hooks/useMedia';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Zap, 
  Eye, 
  Download, 
  Settings,
  Monitor,
  Smartphone,
  Tablet 
} from 'lucide-react';
import type { MediaItem } from '@/hooks/useMedia';

export interface VirtualMediaGridExampleProps {
  projectId: string;
  className?: string;
}

export function VirtualMediaGridExample({ 
  projectId, 
  className 
}: VirtualMediaGridExampleProps) {
  const [selectedItems, setSelectedItems] = useState<MediaItem[]>([]);
  const [viewMode, setViewMode] = useState<'virtualized' | 'infinite'>('virtualized');
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState(process.env.NODE_ENV === 'development');

  // Virtualized media for large datasets
  const virtualizedMedia = useVirtualizedMedia(projectId, {
    virtualization: {
      pageSize: 50,
      enabled: true,
      prefetchPages: 2,
      infiniteScroll: false,
    },
  });

  // Infinite scroll media for mobile
  const infiniteMedia = useInfiniteMedia(projectId);

  const currentMedia = viewMode === 'virtualized' ? virtualizedMedia : infiniteMedia;

  // Handle item selection
  const handleItemClick = (item: MediaItem) => {
    console.log('Clicked item:', item);
    // In real implementation, this would open a preview modal
  };

  const handleItemSelection = (items: MediaItem[]) => {
    setSelectedItems(items);
  };

  // Performance metrics display
  const renderPerformanceMetrics = () => {
    if (!showPerformanceMetrics || viewMode !== 'virtualized') return null;

    const { performance } = virtualizedMedia.virtualization;
    
    return (
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            Performance Metrics
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPerformanceMetrics(false)}
          >
            ×
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="space-y-1">
            <div className="text-muted-foreground">Total Items</div>
            <div className="font-mono">{performance.totalItems}</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Loaded</div>
            <div className="font-mono">{performance.loadedItems}</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Cache Hit Rate</div>
            <div className="font-mono">{performance.cacheHitRate}%</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Avg Load Time</div>
            <div className="font-mono">{performance.averageLoadTime}ms</div>
          </div>
        </div>
        
        {/* Performance indicators */}
        <div className="flex space-x-2">
          {performance.cacheHitRate > 80 && (
            <Badge variant="secondary" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              High Cache Efficiency
            </Badge>
          )}
          {performance.averageLoadTime < 200 && (
            <Badge variant="secondary" className="text-xs">
              Fast Loading
            </Badge>
          )}
          {performance.loadedItems > 100 && (
            <Badge variant="outline" className="text-xs">
              Large Dataset
            </Badge>
          )}
        </div>
      </Card>
    );
  };

  // Infinite scroll metrics for mobile view
  const renderInfiniteMetrics = () => {
    if (viewMode !== 'infinite') return null;
    
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium">Infinite Scroll Progress</h4>
          <Badge variant="outline">
            {infiniteMedia.loadedCount} / {infiniteMedia.totalCount}
          </Badge>
        </div>
        
        <div className="w-full bg-muted rounded-full h-2 mb-2">
          <div 
            className="bg-primary rounded-full h-2 transition-all duration-300"
            style={{ width: `${infiniteMedia.progress * 100}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progress: {Math.round(infiniteMedia.progress * 100)}%</span>
          {infiniteMedia.hasMore && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={infiniteMedia.loadMore}
              disabled={infiniteMedia.isLoadingMore}
            >
              {infiniteMedia.isLoadingMore ? 'Loading...' : 'Load More'}
            </Button>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Construction Site Media</h2>
          <p className="text-muted-foreground">
            Virtual grid optimized for {currentMedia.stats?.total || 0} media items
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPerformanceMetrics(!showPerformanceMetrics)}
          >
            <Monitor className="h-4 w-4 mr-2" />
            Metrics
          </Button>
          
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'virtualized' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('virtualized')}
              className="rounded-r-none"
            >
              <Tablet className="h-4 w-4 mr-1" />
              Desktop
            </Button>
            <Button
              variant={viewMode === 'infinite' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('infinite')}
              className="rounded-l-none"
            >
              <Smartphone className="h-4 w-4 mr-1" />
              Mobile
            </Button>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      {renderPerformanceMetrics()}
      {renderInfiniteMetrics()}

      {/* Selection Summary */}
      {selectedItems.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span className="font-medium">
                {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Actions
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Network Quality Indicator */}
      {currentMedia.networkQuality && (
        <Card className="p-3 bg-muted/50">
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${
              currentMedia.networkQuality === 'excellent' ? 'bg-green-500' :
              currentMedia.networkQuality === 'good' ? 'bg-blue-500' :
              currentMedia.networkQuality === 'poor' ? 'bg-amber-500' : 'bg-red-500'
            }`} />
            <span>
              Connection: <strong className="capitalize">{currentMedia.networkQuality}</strong>
            </span>
            {currentMedia.networkQuality === 'poor' && (
              <Badge variant="secondary" className="text-xs">
                Images optimized for low bandwidth
              </Badge>
            )}
          </div>
        </Card>
      )}

      {/* Virtualization Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as typeof viewMode)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="virtualized">Virtualized Grid</TabsTrigger>
          <TabsTrigger value="infinite">Infinite Scroll</TabsTrigger>
        </TabsList>
        
        <TabsContent value="virtualized" className="space-y-4">
          <VirtualMediaGrid
            projectId={projectId}
            onItemClick={handleItemClick}
            onItemSelect={handleItemSelection}
            selectable={true}
            filterOptions={{
              showSearch: true,
              showCategoryFilter: true,
              showTypeFilter: true,
            }}
            viewOptions={{
              defaultView: 'grid',
              allowViewToggle: true,
            }}
            gridConfig={{
              minItemWidth: 200,
              maxItemWidth: 300,
              itemSpacing: 16,
              overscan: 5,
            }}
          />
        </TabsContent>
        
        <TabsContent value="infinite" className="space-y-4">
          <div className="text-center p-8 border-2 border-dashed border-muted rounded-lg">
            <Smartphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Infinite Scroll View</h3>
            <p className="text-muted-foreground mb-4">
              Optimized for mobile construction site usage with work glove-friendly interactions
            </p>
            <div className="space-y-2 text-sm text-left max-w-md mx-auto">
              <div>• Loaded: {infiniteMedia.loadedCount} items</div>
              <div>• Total: {infiniteMedia.totalCount} items</div>
              <div>• Has more: {infiniteMedia.hasMore ? 'Yes' : 'No'}</div>
              <div>• Progress: {Math.round(infiniteMedia.progress * 100)}%</div>
            </div>
            {infiniteMedia.hasMore && (
              <Button 
                className="mt-4" 
                onClick={infiniteMedia.loadMore}
                disabled={infiniteMedia.isLoadingMore}
              >
                {infiniteMedia.isLoadingMore ? 'Loading...' : 'Load More Items'}
              </Button>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Implementation Notes for Development */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Phase 3.3 Implementation Notes</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✅ Virtual grid with react-window for 500+ items</li>
            <li>✅ Lazy loading with intersection observer</li>
            <li>✅ Network-aware image quality optimization</li>
            <li>✅ Construction site work glove-friendly interactions</li>
            <li>✅ Mobile-first responsive design</li>
            <li>✅ Smart caching integration</li>
            <li>✅ Performance monitoring and optimization</li>
            <li>✅ Infinite scroll variant for mobile</li>
            <li>✅ Keyboard navigation accessibility</li>
            <li>✅ Progressive image loading</li>
          </ul>
        </Card>
      )}
    </div>
  );
}