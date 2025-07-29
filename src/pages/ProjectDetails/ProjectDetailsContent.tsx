/**
 * ProjectDetailsContent - Refactored to meet BuildEase coding standards
 * Mobile-first layout optimized for construction workers
 * Clean architecture with proper separation of concerns
 */

import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ProjectDataProvider } from './components/Providers/ProjectDataProvider';
import { ProjectLayout } from './components/Layout/ProjectLayout';
import { ProjectErrorFallback, ProjectDetailsLoading, ProjectNotFound } from './components/Utils';
import type { ProjectDetailsContentProps } from './types';

// Main Component - Focused only on high-level orchestration
function ProjectDetailsMain({ projectId }: ProjectDetailsContentProps) {
  return (
    <ProjectDataProvider projectId={projectId}>
      {(data) => {
        // Error handling
        if (data.projectError) {
          return (
            <ProjectErrorFallback 
              error={data.projectError} 
              resetErrorBoundary={() => window.location.reload()} 
            />
          );
        }
        
        // Loading state
        if (data.isLoading) {
          return <ProjectDetailsLoading />;
        }
        
        // Not found state
        if (!data.project) {
          return <ProjectNotFound projectId={projectId} />;
        }

        // Render main layout with all data and operations
        return (
          <ProjectLayout
            project={data.project}
            projectData={data.projectData}
            budgetExpenses={data.budgetExpenses}
            teamMembers={data.teamMembers}
            phases={data.phases}
            todaysFocus={data.todaysFocus}
            showUpdateModal={data.showUpdateModal}
            setShowUpdateModal={data.setShowUpdateModal}
            modalManagement={data.modalManagement}
            crudOperations={data.crudOperations}
            taskOperations={data.taskOperations}
            updateProject={data.updateProject}
            handleUpdateProject={data.handleUpdateProject}
            handleCloseUpdateModal={data.handleCloseUpdateModal}
            projectId={projectId}
          />
        );
      }}
    </ProjectDataProvider>
  );
}

// Main Export with Error Boundary and Suspense
export function ProjectDetailsContent({ projectId }: ProjectDetailsContentProps) {
  return (
    <ErrorBoundary
      FallbackComponent={ProjectErrorFallback}
      onReset={() => window.location.reload()}
    >
      <Suspense fallback={<ProjectDetailsLoading />}>
        <ProjectDetailsMain projectId={projectId} />
      </Suspense>
    </ErrorBoundary>
  );
}
