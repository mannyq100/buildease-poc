/**
 * LazyComponents - Lazy-loaded components for performance optimization
 * Mobile-first performance optimization for heavy components
 * Features loading states and error boundaries for better UX
 */

import React, { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Settings, ImageIcon } from 'lucide-react';
import type { ProjectDocumentsSectionProps } from './Documents/ProjectDocumentsSection';
import type { ProjectSettingsSectionProps } from './Settings/ProjectSettingsSection';
import type { PhaseFormProps } from './Forms/PhaseForm';
import type { BudgetExpenseFormProps } from './Forms/BudgetExpenseForm';
import type { TeamMemberFormProps } from './Forms/TeamMemberForm';

// Loading component for documents section
const DocumentsLoadingFallback = () => (
  <Card className="border-slate-200/40 shadow-xl bg-gradient-to-br from-white via-slate-50/30 to-purple-50/20 backdrop-blur-md rounded-2xl">
    <CardContent className="p-6">
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <ImageIcon className="h-8 w-8 text-slate-400" />
            <Loader2 className="h-4 w-4 text-buildease-blue-600 animate-spin absolute -top-1 -right-1" />
          </div>
          <div className="text-sm text-slate-600 font-medium">Loading documents...</div>
          <div className="text-xs text-slate-500">Preparing image galleries and file management</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Loading component for settings section
const SettingsLoadingFallback = () => (
  <Card className="border-slate-200/40 shadow-xl bg-gradient-to-br from-white via-slate-50/30 to-buildease-blue-50/20 backdrop-blur-md rounded-2xl">
    <CardContent className="p-6">
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Settings className="h-8 w-8 text-slate-400" />
            <Loader2 className="h-4 w-4 text-buildease-blue-600 animate-spin absolute -top-1 -right-1" />
          </div>
          <div className="text-sm text-slate-600 font-medium">Loading settings...</div>
          <div className="text-xs text-slate-500">Preparing project configuration</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Lazy-loaded components
const LazyProjectDocumentsSection = React.lazy(() => 
  import('./Documents/ProjectDocumentsSection').then(module => ({
    default: module.ProjectDocumentsSection
  }))
);

const LazyProjectSettingsSection = React.lazy(() => 
  import('./Settings/ProjectSettingsSection').then(module => ({
    default: module.ProjectSettingsSection
  }))
);

// Lazy-loaded forms for heavy modal content
const LazyPhaseForm = React.lazy(() => 
  import('./Forms/PhaseForm').then(module => ({
    default: module.PhaseForm
  }))
);

const LazyBudgetExpenseForm = React.lazy(() => 
  import('./Forms/BudgetExpenseForm').then(module => ({
    default: module.BudgetExpenseForm
  }))
);

const LazyTeamMemberForm = React.lazy(() => 
  import('./Forms/TeamMemberForm').then(module => ({
    default: module.TeamMemberForm
  }))
);

// Form loading fallback
const FormLoadingFallback = () => (
  <div className="flex items-center justify-center py-8">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="h-6 w-6 text-buildease-blue-600 animate-spin" />
      <div className="text-sm text-slate-600">Loading form...</div>
    </div>
  </div>
);

// Wrapped components with Suspense
export const ProjectDocumentsSection = React.memo(function ProjectDocumentsSection(props: ProjectDocumentsSectionProps) {
  return (
    <Suspense fallback={<DocumentsLoadingFallback />}>
      <LazyProjectDocumentsSection {...props} />
    </Suspense>
  );
});

export const ProjectSettingsSection = React.memo(function ProjectSettingsSection(props: ProjectSettingsSectionProps) {
  return (
    <Suspense fallback={<SettingsLoadingFallback />}>
      <LazyProjectSettingsSection {...props} />
    </Suspense>
  );
});

export const PhaseForm = React.memo(function PhaseForm(props: PhaseFormProps) {
  return (
    <Suspense fallback={<FormLoadingFallback />}>
      <LazyPhaseForm {...props} />
    </Suspense>
  );
});

export const BudgetExpenseForm = React.memo(function BudgetExpenseForm(props: BudgetExpenseFormProps) {
  return (
    <Suspense fallback={<FormLoadingFallback />}>
      <LazyBudgetExpenseForm {...props} />
    </Suspense>
  );
});

export const TeamMemberForm = React.memo(function TeamMemberForm(props: TeamMemberFormProps) {
  return (
    <Suspense fallback={<FormLoadingFallback />}>
      <LazyTeamMemberForm {...props} />
    </Suspense>
  );
});

// Performance monitoring hook for lazy components
export const useLazyComponentPerformance = (componentName: string) => {
  React.useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // Log performance metrics for mobile optimization
      if (typeof window !== 'undefined' && window.console) {
        console.log(`[Performance] ${componentName} lazy load time: ${loadTime.toFixed(2)}ms`);
        
        // Add performance marks for debugging
        if (performance.mark) {
          performance.mark(`${componentName}-lazy-load-complete`);
        }
      }
    };
  }, [componentName]);
};