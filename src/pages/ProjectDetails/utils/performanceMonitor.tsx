/**
 * Performance Monitoring Utilities for Mobile Optimization
 * Tracks render times, component load times, and mobile-specific metrics
 */

import React from 'react';

interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  isLowEndDevice: boolean;
  memoryUsage?: number;
  timestamp: number;
}

interface MobileOptimizationMetrics {
  avgRenderTime: number;
  slowRenders: number;
  memoryPressure: boolean;
  deviceType: 'low-end' | 'mid-range' | 'high-end';
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private readonly MAX_METRICS = 100; // Keep only recent metrics for memory efficiency
  private readonly SLOW_RENDER_THRESHOLD = 16; // 60fps = 16ms per frame
  private readonly LOW_END_THRESHOLD = 2; // GB RAM

  // Detect device capabilities for mobile optimization
  private detectDeviceCapabilities(): 'low-end' | 'mid-range' | 'high-end' {
    if (typeof navigator === 'undefined') return 'mid-range';
    
    // @ts-ignore - deviceMemory is experimental but useful for mobile optimization
    const memory = navigator.deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    
    if (memory <= 2 || cores <= 2) return 'low-end';
    if (memory <= 4 || cores <= 4) return 'mid-range';
    return 'high-end';
  }

  // Start performance measurement for a component
  startMeasurement(componentName: string): () => void {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      const endMemory = this.getMemoryUsage();
      
      this.recordMetric({
        componentName,
        renderTime,
        isLowEndDevice: this.detectDeviceCapabilities() === 'low-end',
        memoryUsage: endMemory - startMemory,
        timestamp: Date.now()
      });
    };
  }

  // Record performance metric
  private recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // Keep only recent metrics to prevent memory bloat
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }

    // Log performance issues in development
    if (process.env.NODE_ENV === 'development') {
      if (metric.renderTime > this.SLOW_RENDER_THRESHOLD) {
        console.warn(`[Performance] Slow render detected: ${metric.componentName} took ${metric.renderTime.toFixed(2)}ms`);
      }
      
      if (metric.isLowEndDevice && metric.renderTime > this.SLOW_RENDER_THRESHOLD / 2) {
        console.warn(`[Performance] Performance issue on low-end device: ${metric.componentName}`);
      }
    }

    // Add performance marks for browser devtools
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${metric.componentName}-render-${metric.renderTime.toFixed(2)}ms`);
    }
  }

  // Get current memory usage (when available)
  private getMemoryUsage(): number {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      // @ts-ignore - memory is experimental
      return performance.memory?.usedJSHeapSize || 0;
    }
    return 0;
  }

  // Get optimization metrics for mobile performance
  getMobileOptimizationMetrics(): MobileOptimizationMetrics {
    if (this.metrics.length === 0) {
      return {
        avgRenderTime: 0,
        slowRenders: 0,
        memoryPressure: false,
        deviceType: this.detectDeviceCapabilities()
      };
    }

    const renderTimes = this.metrics.map(m => m.renderTime);
    const avgRenderTime = renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length;
    const slowRenders = renderTimes.filter(time => time > this.SLOW_RENDER_THRESHOLD).length;
    
    // Detect memory pressure on mobile devices
    const memoryPressure = this.detectMemoryPressure();

    return {
      avgRenderTime,
      slowRenders,
      memoryPressure,
      deviceType: this.detectDeviceCapabilities()
    };
  }

  // Detect memory pressure for mobile optimization
  private detectMemoryPressure(): boolean {
    if (typeof performance === 'undefined' || !('memory' in performance)) {
      return false;
    }

    try {
      // @ts-ignore - memory is experimental
      const memory = performance.memory;
      if (!memory) return false;

      const usedRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      return usedRatio > 0.8; // 80% memory usage indicates pressure
    } catch {
      return false;
    }
  }

  // Get performance recommendations for mobile
  getOptimizationRecommendations(): string[] {
    const metrics = this.getMobileOptimizationMetrics();
    const recommendations: string[] = [];

    if (metrics.deviceType === 'low-end') {
      recommendations.push('Consider reducing component complexity for low-end devices');
      recommendations.push('Implement more aggressive lazy loading');
    }

    if (metrics.avgRenderTime > this.SLOW_RENDER_THRESHOLD) {
      recommendations.push('Average render time is slow - consider React.memo optimizations');
    }

    if (metrics.slowRenders > metrics.slowRenders * 0.3) {
      recommendations.push('High number of slow renders - review component re-rendering');
    }

    if (metrics.memoryPressure) {
      recommendations.push('Memory pressure detected - consider component cleanup');
    }

    return recommendations;
  }

  // Clear metrics (useful for testing or memory cleanup)
  clearMetrics(): void {
    this.metrics = [];
  }
}

// Singleton instance for app-wide performance monitoring
export const performanceMonitor = new PerformanceMonitor();

// React hook for component performance monitoring
export function usePerformanceMonitoring(componentName: string) {
  React.useEffect(() => {
    const endMeasurement = performanceMonitor.startMeasurement(componentName);
    return endMeasurement;
  }, [componentName]);
}

// React hook for mobile optimization metrics
export function useMobileOptimizationMetrics() {
  const [metrics, setMetrics] = React.useState(() => 
    performanceMonitor.getMobileOptimizationMetrics()
  );

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getMobileOptimizationMetrics());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return metrics;
}

// Performance-aware component wrapper
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  const WrappedComponent = React.memo((props: P) => {
    usePerformanceMonitoring(componentName);
    return <Component {...props} />;
  });

  WrappedComponent.displayName = `withPerformanceMonitoring(${componentName})`;
  return WrappedComponent;
}

