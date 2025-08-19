/**
 * Lazy Import Utilities
 * Centralized code splitting configuration for optimal bundle chunks
 * Optimized for mobile performance and construction site usage
 */

import { lazy } from 'react';

// Utility function to create lazy components with retry logic
export function lazyWithRetry<T extends React.ComponentType<Record<string, unknown>>>(
  importFunc: () => Promise<{ default: T }>,
  maxRetries = 3
) {
  return lazy(() => {
    return new Promise<{ default: T }>((resolve, reject) => {
      let retries = 0;
      
      const attemptImport = () => {
        importFunc()
          .then(resolve)
          .catch((error) => {
            console.warn(`Import failed (attempt ${retries + 1}/${maxRetries}):`, error);
            
            if (retries < maxRetries - 1) {
              retries++;
              // Exponential backoff: 1s, 2s, 4s
              setTimeout(attemptImport, Math.pow(2, retries) * 1000);
            } else {
              reject(error);
            }
          });
      };
      
      attemptImport();
    });
  });
}

// Plan View Components - Chunked by feature area
export const LazyOverviewView = lazyWithRetry(
  () => import('@/components/plan/OverviewView')
);

export const LazyTimelineView = lazyWithRetry(
  () => import('@/components/plan/TimelineView')
);

export const LazyMaterialsView = lazyWithRetry(
  () => import('@/components/plan/MaterialsView')
);

export const LazyVirtualizedMaterialsTable = lazyWithRetry(
  () => import('@/components/plan/VirtualizedMaterialsTable')
);

export const LazyVirtualizedTimelineView = lazyWithRetry(
  () => import('@/components/plan/VirtualizedTimelineView')
);

export const LazyProjectPhotoGallery = lazyWithRetry(
  () => import('@/components/plan/ProjectPhotoGallery')
);

// Modal Components - Separate chunk for dialogs
export const LazyPhaseFormModal = lazyWithRetry(
  () => import('@/components/shared/modals/PhaseFormModal')
);

export const LazyTaskFormModal = lazyWithRetry(
  () => import('@/components/shared/modals/TaskFormModal')
);

export const LazyMaterialModal = lazyWithRetry(
  () => import('@/components/shared/modals/MaterialModal')
);

export const LazyConfirmationModal = lazyWithRetry(
  () => import('@/components/shared/modals/ConfirmationModal')
);

// Performance optimized components - Only load when needed
export const LazyPhaseList = lazyWithRetry(
  () => import('@/components/plan/LazyPhaseList')
);

export const LazyTaskList = lazyWithRetry(
  () => import('@/components/plan/LazyTaskList')
);

export const LazyMaterialList = lazyWithRetry(
  () => import('@/components/plan/LazyMaterialList')
);

// Mobile-specific components
export const LazyMobileStickyActionBar = lazyWithRetry(
  () => import('@/components/plan/MobileStickyActionBar')
);


// Advanced features - Load on demand
export const LazyDragAndDropProvider = lazyWithRetry(
  () => import('@/components/shared/DragAndDropProvider').then(module => ({
    default: module.DragAndDropProvider
  }))
);

// Chart and visualization components - Heavy libraries
export const LazyProgressChart = lazyWithRetry(
  () => import('@/components/shared/charts/ProgressChart')
);

export const LazyCostChart = lazyWithRetry(
  () => import('@/components/shared/charts/CostChart')
);

export const LazyTimelineChart = lazyWithRetry(
  () => import('@/components/shared/charts/TimelineChart')
);

// Search and filtering - Separate chunk
export const LazyAdvancedSearch = lazyWithRetry(
  () => import('@/components/shared/search/AdvancedSearch')
);

export const LazySearchFilters = lazyWithRetry(
  () => import('@/components/shared/search/SearchFilters')
);

// Report generation - Heavy computation
export const LazyReportGenerator = lazyWithRetry(
  () => import('@/components/shared/reports/ReportGenerator')
);

export const LazyPDFExporter = lazyWithRetry(
  () => import('@/components/shared/export/PDFExporter')
);

// Third-party integrations - External dependencies
export const LazyCalendarIntegration = lazyWithRetry(
  () => import('@/components/integrations/CalendarIntegration')
);

export const LazyMapView = lazyWithRetry(
  () => import('@/components/shared/maps/MapView')
);

// Settings and configuration
export const LazySettingsPanel = lazyWithRetry(
  () => import('@/components/settings/SettingsPanel')
);

export const LazyUserPreferences = lazyWithRetry(
  () => import('@/components/settings/UserPreferences')
);

// Bundle analysis helpers for development
export const getBundleInfo = () => {
  if (process.env.NODE_ENV === 'development') {
    return {
      timestamp: Date.now(),
      components: {
        core: ['OverviewView', 'TimelineView', 'MaterialsView'],
        performance: ['VirtualizedMaterialsTable', 'VirtualizedTimelineView', 'LazyPhaseList'],
        mobile: ['MobileStickyActionBar'],
        modals: ['PhaseFormModal', 'TaskFormModal', 'MaterialModal'],
        advanced: ['ProgressChart', 'ReportGenerator', 'MapView'],
        integrations: ['CalendarIntegration', 'PDFExporter']
      },
      tips: [
        'Core components are loaded first for faster initial render',
        'Performance components use virtual scrolling for large datasets', 
        'Mobile components are optimized for touch interactions',
        'Modal components are lazy-loaded to reduce initial bundle size',
        'Advanced features load on-demand to improve mobile performance'
      ]
    };
  }
  return null;
};

// Preload critical components for better UX
export const preloadCriticalComponents = () => {
  // Preload commonly used components after initial load
  const componentsToPreload = [
    LazyPhaseFormModal,
    LazyTaskFormModal,
    LazyMaterialModal,
    LazyMobileStickyActionBar,
  ];

  // Use requestIdleCallback if available, otherwise setTimeout
  const schedulePreload = (callback: () => void) => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(callback, { timeout: 5000 });
    } else {
      setTimeout(callback, 2000);
    }
  };

  componentsToPreload.forEach((LazyComponent) => {
    schedulePreload(() => {
      // Trigger the lazy import
      LazyComponent.preload?.();
    });
  });
};

// Performance monitoring for code splitting
export const trackChunkLoadTime = (_chunkName: string) => {
  if (process.env.NODE_ENV === 'development') {
    const startTime = performance.now();
    
    return () => {
      const _loadTime = performance.now() - startTime;
      
      // In production, you would send this to your analytics service
      // analytics.track('chunk_load_time', { chunkName, loadTime });
    };
  }
  
  return () => {}; // No-op in production
};

export default {
  // Core views
  OverviewView: LazyOverviewView,
  TimelineView: LazyTimelineView,
  MaterialsView: LazyMaterialsView,
  
  // Performance optimized
  VirtualizedMaterialsTable: LazyVirtualizedMaterialsTable,
  VirtualizedTimelineView: LazyVirtualizedTimelineView,
  LazyPhaseList: LazyPhaseList,
  
  // Modals
  PhaseFormModal: LazyPhaseFormModal,
  TaskFormModal: LazyTaskFormModal,
  MaterialModal: LazyMaterialModal,
  ConfirmationModal: LazyConfirmationModal,
  
  // Mobile components
  MobileStickyActionBar: LazyMobileStickyActionBar,
  
  // Advanced features
  ProjectPhotoGallery: LazyProjectPhotoGallery,
  ProgressChart: LazyProgressChart,
  ReportGenerator: LazyReportGenerator,
  
  // Utilities
  preloadCriticalComponents,
  trackChunkLoadTime,
  getBundleInfo
};