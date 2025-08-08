/**
 * Enhanced ProjectDetails Page with Progressive Loading and React 19 patterns
 * Optimized for construction workers using mobile devices
 */

import { Suspense } from 'react';
import { useParams } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ProjectDetailsContent } from './ProjectDetailsContent';
import { ProjectDetailsSkeleton } from '@/components/ui/skeletons';

export function ProjectDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  
  // Resolve slug -> project UUID (unconditional hook; gate with enabled)
  const { data: projectId, isLoading, isError } = useQuery({
    queryKey: ['projects', 'slug-lookup', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('be_project')
        .select('id')
        .ilike('slug', slug as string)
        .single();
      if (error || !data) throw error ?? new Error('Project not found');
      return data.id as string;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!slug,
  });

  // Early UI for missing slug
  if (!slug) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Project Slug Missing</h2>
          <p className="text-slate-600">No project slug was provided in the URL.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <ProjectDetailsSkeleton />;
  }

  if (isError || !projectId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Project Not Found</h2>
          <p className="text-slate-600">We couldn\'t find a project with slug "{slug}".</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<ProjectDetailsSkeleton />}>
      <ProjectDetailsContent projectId={projectId} />
    </Suspense>
  );
}

// Export for backward compatibility
export { ProjectDetailsPage as ProjectDetails };