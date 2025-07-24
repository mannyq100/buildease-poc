/**
 * ProjectErrorFallback - Error boundary fallback component
 * Extracted from ProjectDetailsContent.tsx for better organization
 * Mobile-first responsive error display with recovery options
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ProjectErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ProjectErrorFallback({ error, resetErrorBoundary }: ProjectErrorFallbackProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-6">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          Something went wrong
        </h2>
        <p className="text-slate-600 mb-4">
          {error.message || 'Failed to load project details'}
        </p>
        <Button onClick={resetErrorBoundary} className="bg-blue-600 hover:bg-blue-700">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    </div>
  );
}