/**
 * LazyComponents - Lazy-loaded components for performance optimization
 * Mobile-first performance optimization for heavy components
 * Features loading states and error boundaries for better UX
 */

import React, { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Settings, ImageIcon } from 'lucide-react';
// Infer prop types directly from components to avoid importing non-exported types
type ProjectDocumentsSectionComponent = typeof import('./Documents/ProjectDocumentsSection')['ProjectDocumentsSection'];
type ProjectDocumentsSectionProps = React.ComponentProps<ProjectDocumentsSectionComponent>;
type ProjectSettingsSectionComponent = typeof import('./Settings/ProjectSettingsSection')['ProjectSettingsSection'];
type ProjectSettingsSectionProps = React.ComponentProps<ProjectSettingsSectionComponent>;
type PhaseFormComponent = typeof import('./Forms/PhaseForm')['PhaseForm'];
type PhaseFormProps = React.ComponentProps<PhaseFormComponent>;
type BudgetExpenseFormComponent = typeof import('./Forms/BudgetExpenseForm')['BudgetExpenseForm'];
type BudgetExpenseFormProps = React.ComponentProps<BudgetExpenseFormComponent>;
type TeamMemberFormComponent = typeof import('./Forms/TeamMemberForm')['TeamMemberForm'];
type TeamMemberFormProps = React.ComponentProps<TeamMemberFormComponent>;
type TeamMembersListComponent = typeof import('./Team/TeamMembersList')['TeamMembersList'];
type TeamMembersListProps = React.ComponentProps<TeamMembersListComponent>;
type ProjectCommentsSectionComponent = typeof import('./Comments/ProjectCommentsSection')['ProjectCommentsSection'];
type ProjectCommentsSectionProps = React.ComponentProps<ProjectCommentsSectionComponent>;

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

// Team and Comments lazy components
const LazyTeamMembersList = React.lazy(() =>
  import('./Team/TeamMembersList').then(module => ({
    default: module.TeamMembersList,
  }))
);

const LazyProjectCommentsSection = React.lazy(() =>
  import('./Comments/ProjectCommentsSection').then(module => ({
    default: module.ProjectCommentsSection,
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

// Lightweight fallbacks for Team and Comments
const TeamLoadingFallback = () => (
  <div className="p-6 flex items-center justify-center">
    <div className="flex items-center gap-2 text-slate-600">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-sm">Loading team...</span>
    </div>
  </div>
);

const CommentsLoadingFallback = () => (
  <div className="p-6 flex items-center justify-center">
    <div className="flex items-center gap-2 text-slate-600">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-sm">Loading comments...</span>
    </div>
  </div>
);

export const TeamMembersList = React.memo(function TeamMembersList(props: TeamMembersListProps) {
  return (
    <Suspense fallback={<TeamLoadingFallback />}>
      <LazyTeamMembersList {...props} />
    </Suspense>
  );
});

export const ProjectCommentsSection = React.memo(function ProjectCommentsSection(props: ProjectCommentsSectionProps) {
  return (
    <Suspense fallback={<CommentsLoadingFallback />}>
      <LazyProjectCommentsSection {...props} />
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

// Note: Keep this file exporting only components to maintain Fast Refresh