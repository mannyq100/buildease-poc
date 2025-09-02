/**
 * Grid Viewport Component - Phase 3.3
 * Manages grid viewport states, loading indicators, and performance monitoring
 * Optimized for construction site usage patterns
 */

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Wifi, 
  WifiOff, 
  Activity, 
  Clock,
  HardDrive 
} from 'lucide-react';

export interface GridViewportProps {
  width: number;
  height: number;
  loading?: boolean;
  error?: string | null;
  networkQuality?: 'excellent' | 'good' | 'poor' | 'offline';
  itemCount?: number;
  loadedCount?: number;
  className?: string;
  showPerformanceMetrics?: boolean;
}

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  loadTime: number;
  cacheHitRate: number;
}

export function GridViewport({
  width,
  height,
  loading = false,
  error = null,
  networkQuality = 'good',
  itemCount = 0,
  loadedCount = 0,
  className,
  showPerformanceMetrics = false,
}: GridViewportProps) {
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    loadTime: 0,
    cacheHitRate: 0,
  });
  const [startTime] = useState(Date.now());

  // Monitor performance metrics for development and optimization
  useEffect(() => {
    if (!showPerformanceMetrics || typeof window === 'undefined') return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    // FPS monitoring
    const measureFPS = () => {
      const now = performance.now();
      frameCount++;
      
      if (now - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (now - lastTime));
        setPerformanceMetrics(prev => ({ ...prev, fps }));
        frameCount = 0;
        lastTime = now;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };

    // Memory monitoring (if available)
    const measureMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsage = Math.round(memory.usedJSHeapSize / (1024 * 1024)); // MB
        setPerformanceMetrics(prev => ({ ...prev, memoryUsage }));
      }
    };

    // Start monitoring
    animationId = requestAnimationFrame(measureFPS);
    const memoryInterval = setInterval(measureMemory, 2000);

    // Load time calculation
    if (!loading && itemCount > 0) {
      const loadTime = Date.now() - startTime;
      setPerformanceMetrics(prev => ({ ...prev, loadTime }));
    }

    // Cache hit rate (mock calculation for demonstration)
    const cacheHitRate = loadedCount > 0 ? Math.round((loadedCount / itemCount) * 100) : 0;
    setPerformanceMetrics(prev => ({ ...prev, cacheHitRate }));

    return () => {
      cancelAnimationFrame(animationId);
      clearInterval(memoryInterval);
    };
  }, [showPerformanceMetrics, loading, itemCount, loadedCount, startTime]);

  // Calculate grid layout for loading skeleton
  const getSkeletonGrid = () => {
    const itemWidth = 250; // Approximate item width
    const itemHeight = 280; // Approximate item height with metadata
    const spacing = 16;
    
    const columns = Math.floor(width / (itemWidth + spacing)) || 1;
    const rows = Math.min(Math.floor(height / (itemHeight + spacing)), 6); // Limit skeleton rows
    
    return { columns, rows, itemWidth, itemHeight };
  };

  // Render performance metrics overlay
  const renderPerformanceMetrics = () => {
    if (!showPerformanceMetrics) return null;

    return (
      <div className="absolute top-4 left-4 z-10">
        <Card className="p-3 bg-background/95 backdrop-blur-sm">
          <div className="text-xs space-y-1">
            <div className="font-medium">Performance Metrics</div>
            
            <div className="flex items-center space-x-2">
              <Activity className="h-3 w-3" />
              <span>FPS: {performanceMetrics.fps}</span>
              {performanceMetrics.fps < 30 && (
                <Badge variant="destructive" className="px-1 py-0 text-xs">Low</Badge>
              )}
            </div>
            
            {performanceMetrics.memoryUsage > 0 && (
              <div className="flex items-center space-x-2">
                <HardDrive className="h-3 w-3" />
                <span>Memory: {performanceMetrics.memoryUsage}MB</span>
                {performanceMetrics.memoryUsage > 100 && (
                  <Badge variant="destructive" className="px-1 py-0 text-xs">High</Badge>
                )}
              </div>
            )}
            
            {performanceMetrics.loadTime > 0 && (
              <div className="flex items-center space-x-2">
                <Clock className="h-3 w-3" />
                <span>Load: {performanceMetrics.loadTime}ms</span>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <span>Cache: {performanceMetrics.cacheHitRate}%</span>
              {performanceMetrics.cacheHitRate > 80 && (
                <Badge variant="secondary" className="px-1 py-0 text-xs">Good</Badge>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // Render network status indicator
  const renderNetworkStatus = () => {
    const getNetworkIcon = () => {
      switch (networkQuality) {
        case 'excellent':
          return <Wifi className="h-4 w-4 text-green-500" />;
        case 'good':
          return <Wifi className="h-4 w-4 text-blue-500" />;
        case 'poor':
          return <Wifi className="h-4 w-4 text-amber-500" />;
        case 'offline':
          return <WifiOff className="h-4 w-4 text-red-500" />;
        default:
          return <Wifi className="h-4 w-4 text-gray-500" />;
      }
    };

    return (
      <div className="absolute top-4 right-4 z-10">
        <Card className="p-2 bg-background/95 backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            {getNetworkIcon()}
            <span className="text-xs font-medium capitalize">
              {networkQuality}
            </span>
            {networkQuality === 'poor' && (
              <Badge variant="outline" className="px-1 py-0 text-xs">
                Reduced Quality
              </Badge>
            )}
          </div>
        </Card>
      </div>
    );
  };

  // Render loading skeleton grid
  const renderLoadingSkeleton = () => {
    const { columns, rows, itemWidth, itemHeight } = getSkeletonGrid();
    const skeletonItems = Array.from({ length: columns * rows }, (_, i) => i);

    return (
      <div 
        className="grid gap-4 p-4"
        style={{ 
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          maxHeight: height 
        }}
      >
        {skeletonItems.map((index) => (
          <Card key={index} className="overflow-hidden">
            <Skeleton 
              className="w-full aspect-square" 
              style={{ minHeight: itemWidth }}
            />
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  // Render error state
  const renderErrorState = () => (
    <div className="flex items-center justify-center h-full">
      <Card className="p-8 text-center max-w-md">
        <div className="space-y-4">
          <div className="text-destructive text-2xl">⚠️</div>
          <h3 className="text-lg font-semibold">Failed to Load Media Grid</h3>
          <p className="text-sm text-muted-foreground">
            {error || 'An unexpected error occurred while loading the media grid.'}
          </p>
          {networkQuality === 'offline' && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">
                You're currently offline. Some media may not be available.
              </p>
            </div>
          )}
          <button 
            className="text-sm text-primary hover:underline"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </Card>
    </div>
  );

  // Render loading progress
  const renderLoadingProgress = () => {
    const progress = itemCount > 0 ? (loadedCount / itemCount) * 100 : 0;
    
    return (
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <Card className="p-3 bg-background/95 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-4 w-4 animate-spin" />
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span>Loading media...</span>
                <span>{loadedCount} / {itemCount}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary rounded-full h-2 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  if (error) {
    return (
      <div 
        className={cn("relative", className)}
        style={{ width, height }}
      >
        {renderNetworkStatus()}
        {renderPerformanceMetrics()}
        {renderErrorState()}
      </div>
    );
  }

  return (
    <div 
      className={cn("relative bg-background", className)}
      style={{ width, height }}
    >
      {/* Network status indicator */}
      {renderNetworkStatus()}
      
      {/* Performance metrics overlay */}
      {renderPerformanceMetrics()}
      
      {/* Loading content */}
      {loading ? (
        <>
          {renderLoadingSkeleton()}
          {itemCount > 0 && renderLoadingProgress()}
        </>
      ) : null}
      
      {/* Construction site optimization notice */}
      {networkQuality === 'poor' && (
        <div className="absolute bottom-4 right-4 z-10">
          <Card className="p-2 bg-amber-50 border-amber-200">
            <div className="flex items-center space-x-2 text-amber-800">
              <Wifi className="h-3 w-3" />
              <span className="text-xs">
                Image quality reduced for better performance
              </span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}