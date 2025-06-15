/**
 * Lazy loaded schedule components for better performance
 * Complex form and detail components are only loaded when needed
 */
import { lazy } from 'react';

// Lazy load large schedule components
export const TaskForm = lazy(() => import('./TaskForm'));
export const TaskDetail = lazy(() => import('./TaskDetail'));

// Component loading fallback for schedule components
export const ScheduleLoader = () => (
  <div className="flex items-center justify-center h-40">
    <div className="flex flex-col items-center gap-2">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#2B6CB0]"></div>
      <p className="text-xs text-slate-500">Loading schedule...</p>
    </div>
  </div>
);