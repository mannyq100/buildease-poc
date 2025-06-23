/**
 * Lazy loaded project management components for better performance
 * Complex project components are only loaded when needed
 */
import { lazy } from 'react';

// Lazy load large project management components
export const PhaseDetailsPanel = lazy(() => import('./PhaseDetailsPanel').then(module => ({ default: module.PhaseDetailsPanel })));

// Component loading fallback for project components
export const ProjectLoader = () => (
  <div className="flex items-center justify-center h-48">
    <div className="flex flex-col items-center gap-2">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#2B6CB0]"></div>
      <p className="text-xs text-slate-500">Loading project details...</p>
    </div>
  </div>
);