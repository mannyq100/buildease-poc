/**
 * Enhanced ProjectDetails Page with Progressive Loading and React 19 patterns
 * Optimized for construction workers using mobile devices
 */

import { Suspense } from 'react';
import { useParams } from "react-router-dom";
import { ProjectDetailsContent } from './ProjectDetailsContent';
import { ProjectDetailsSkeleton } from '@/components/ui/skeletons';

export function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  
  // Early return for missing project ID
  if (!id) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Project ID Missing
          </h2>
          <p className="text-slate-600">
            No project ID was provided in the URL.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <Suspense fallback={<ProjectDetailsSkeleton />}>
      <ProjectDetailsContent projectId={id} />
    </Suspense>
  );
}

// Export for backward compatibility
export { ProjectDetailsPage as ProjectDetails };