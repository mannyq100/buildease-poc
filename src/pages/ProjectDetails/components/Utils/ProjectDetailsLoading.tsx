/**
 * ProjectDetailsLoading - Loading skeleton component
 * Extracted from ProjectDetailsContent.tsx for better organization
 * Mobile-first responsive loading state with skeleton UI
 */

import React from 'react';
import { ProjectDetailsSkeleton } from '@/components/ui/skeletons';

export function ProjectDetailsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="container mx-auto px-4 py-6">
        <ProjectDetailsSkeleton />
      </div>
    </div>
  );
}