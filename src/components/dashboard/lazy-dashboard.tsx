/**
 * Lazy loaded dashboard components for better performance
 * Heavy visualization components are only loaded when needed
 */
import { lazy } from 'react';

// Lazy load heavy dashboard components with charting libraries
export const DataVisualization = lazy(() => import('./DataVisualization').then(module => ({ default: module.DataVisualization || module.default })));

// Component loading fallback
export const DashboardLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center gap-2">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#2B6CB0]"></div>
      <p className="text-xs text-slate-500">Loading charts...</p>
    </div>
  </div>
);