/**
 * Enhanced Projects Page with Progressive Loading and React 19 patterns
 * Optimized for construction professionals using mobile devices
 */

import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ProjectsPageSkeleton } from '@/components/ui/projects-skeletons';
import { ProjectsContent } from './ProjectsContent';
import { useOnlineStatus, useAdaptiveLoading } from '@/hooks/useOnlineStatus';
import type { ProjectsFilters, ProjectsViewSettings } from '@/types/enhanced-projects';

// Lazy load heavy components for better performance
const OfflineIndicator = React.lazy(() => 
  import('@/components/mobile/OfflineIndicator').then(m => ({ default: m.OfflineIndicator }))
);

export function ProjectsPage() {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const { showConnectionIndicator } = useAdaptiveLoading();
  
  // State management
  const [filters, setFilters] = useState<ProjectsFilters>({
    status: 'all',
    search: '',
    sortBy: 'updated_at',
    sortOrder: 'desc',
  });
  
  const [viewSettings, setViewSettings] = useState<ProjectsViewSettings>({
    layout: 'grid',
    cardsPerPage: 12,
    showMetrics: true,
    showFilters: true,
    compactView: false,
    groupBy: 'none',
  });
  
  const handleCreateProject = () => {
    navigate('/create-project');
  };
  
  const handleFiltersChange = (newFilters: ProjectsFilters) => {
    setFilters(newFilters);
  };
  
  const handleViewSettingsChange = (newSettings: ProjectsViewSettings) => {
    setViewSettings(newSettings);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-orange-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Background Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-40 dark:opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f1f5f9' fill-opacity='0.4'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-0">
        {/* Connection Status Indicator */}
        {showConnectionIndicator && (
          <Suspense fallback={null}>
            <OfflineIndicator isOnline={isOnline} className="mb-4" />
          </Suspense>
        )}
        
        {/* Progressive Loading Content */}
        <Suspense fallback={<ProjectsPageSkeleton />}>
          <ProjectsContent
            filters={filters}
            onFiltersChange={handleFiltersChange}
            viewSettings={viewSettings}
            onViewSettingsChange={handleViewSettingsChange}
          />
        </Suspense>
        
      </div>
    </div>
  );
}