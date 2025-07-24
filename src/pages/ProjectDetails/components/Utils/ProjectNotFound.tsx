/**
 * ProjectNotFound - Project not found component
 * Extracted from ProjectDetailsContent.tsx for better organization
 * Mobile-first responsive not found state with navigation options
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ProjectNotFoundProps {
  projectId: string;
}

export function ProjectNotFound({ projectId }: ProjectNotFoundProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-6">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          Project Not Found
        </h2>
        <p className="text-slate-600 mb-4">
          The project with ID "{projectId}" could not be found.
        </p>
        <Button onClick={() => window.history.back()} variant="outline">
          Go Back
        </Button>
      </div>
    </div>
  );
}