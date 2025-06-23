/**
 * Plan View Renderer Component
 * Handles dynamic view rendering with lazy loading and error boundaries
 * Provides consistent props mapping for all plan views
 */

import React, { useMemo, useCallback } from 'react';
import { ConstructionPlan } from '@/data/mock/generatedPlan/planData';
import { VIEW_COMPONENTS } from './LazyViews';
import { ViewLoadingBoundary } from './LoadingBoundary';

import { PlanModalManagerHandlers } from './PlanModalManager';

interface PlanViewRendererProps {
  activeView: string;
  plan: ConstructionPlan;
  modalHandlersRef?: React.RefObject<PlanModalManagerHandlers>;
}

export const PlanViewRenderer = React.memo(function PlanViewRenderer({
  activeView,
  plan,
  modalHandlersRef
}: PlanViewRendererProps) {
  // Memoized callback handlers to prevent recreation on every render
  const handleAddPhase = useCallback((_planId?: string) => {
    console.log('PlanViewRenderer: Add Phase button clicked');
    if (!modalHandlersRef?.current) {
      console.error('PlanViewRenderer: Modal handlers ref is not initialized');
      return;
    }
    try {
      console.log('PlanViewRenderer: Calling openPhaseModal with:', { isNew: true });
      modalHandlersRef.current.openPhaseModal(undefined, true);
    } catch (error) {
      console.error('PlanViewRenderer: Error opening phase modal:', error);
    }
  }, [modalHandlersRef]);

  const handleEditPhase = useCallback((phaseId: string) => {
    console.log('PlanViewRenderer: Edit Phase button clicked', { phaseId });
    if (!modalHandlersRef?.current) {
      console.error('PlanViewRenderer: Modal handlers ref is not initialized');
      return;
    }
    try {
      console.log('PlanViewRenderer: Calling openPhaseModal with:', { phaseId, isNew: false });
      modalHandlersRef.current.openPhaseModal(phaseId, false);
    } catch (error) {
      console.error('PlanViewRenderer: Error opening phase modal for edit:', error);
    }
  }, [modalHandlersRef]);

  const handleDeletePhase = useCallback((phaseId: string) => {
    if (window.confirm('Are you sure you want to delete this phase?')) {
      // This will be handled by the parent component's plan state
      console.log('Delete phase:', phaseId);
    }
  }, []);

  const handleReorderPhase = useCallback((phaseId: string, direction: 'up' | 'down') => {
    // This will be handled by the parent component's plan state
    console.log('Reorder phase:', phaseId, direction);
  }, []);

  const handleAddTask = useCallback((phaseId: string) => {
    modalHandlersRef?.current?.openTaskModal(phaseId, undefined, true);
  }, [modalHandlersRef]);

  const handleEditTask = useCallback((phaseId: string, taskId: string) => {
    modalHandlersRef?.current?.openTaskModal(phaseId, taskId, false);
  }, [modalHandlersRef]);

  const handleDeleteTask = useCallback((phaseId: string, taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      console.log('Delete task:', phaseId, taskId);
    }
  }, []);

  const handleAddMaterial = useCallback((phaseId: string) => {
    modalHandlersRef?.current?.openMaterialModal(phaseId, undefined, true);
  }, [modalHandlersRef]);

  const handleEditMaterial = useCallback((phaseId: string, materialId: string) => {
    modalHandlersRef?.current?.openMaterialModal(phaseId, materialId, false);
  }, [modalHandlersRef]);

  const handleDeleteMaterial = useCallback((phaseId: string, materialId: string) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      console.log('Delete material:', phaseId, materialId);
    }
  }, []);

  const handleEditProjectDates = useCallback(() => {
    console.log('PlanViewRenderer: Edit Project Dates button clicked');
    if (!modalHandlersRef?.current) {
      console.error('PlanViewRenderer: Modal handlers ref is not initialized');
      return;
    }
    try {
      console.log('PlanViewRenderer: Calling openDateModal with type: project');
      modalHandlersRef.current.openDateModal('project');
    } catch (error) {
      console.error('PlanViewRenderer: Error opening date modal:', error);
    }
  }, [modalHandlersRef]);

  const handleEditPhaseDates = useCallback((phaseId: string) => {
    console.log('PlanViewRenderer: Edit Phase Dates button clicked', { phaseId });
    if (!modalHandlersRef?.current) {
      console.error('PlanViewRenderer: Modal handlers ref is not initialized');
      return;
    }
    try {
      console.log('PlanViewRenderer: Calling openDateModal with:', { type: 'phase', phaseId });
      modalHandlersRef.current.openDateModal('phase', phaseId);
    } catch (error) {
      console.error('PlanViewRenderer: Error opening date modal for phase:', error);
    }
  }, [modalHandlersRef]);

  // Memoized view-specific props to prevent unnecessary re-renders
  const viewProps = useMemo(() => {
    const baseProps = { plan };

    switch (activeView) {
      case 'overview':
        return {
          ...baseProps,
          onAddPhase: handleAddPhase,
          onEditPhase: handleEditPhase,
          onDeletePhase: handleDeletePhase,
          onReorderPhase: handleReorderPhase,
          onAddTask: handleAddTask,
          onEditTask: handleEditTask,
          onDeleteTask: handleDeleteTask,
          onAddMaterial: handleAddMaterial,
          onEditMaterial: handleEditMaterial,
          onDeleteMaterial: handleDeleteMaterial,
          onEditProjectDates: handleEditProjectDates,
          onEditPhaseDates: handleEditPhaseDates
        };

      case 'timeline':
        return baseProps;

      case 'materials':
        return {
          ...baseProps,
          onAddMaterial: handleAddMaterial,
          onEditMaterial: handleEditMaterial,
          onDeleteMaterial: handleDeleteMaterial
        };

      case 'budget':
      case 'team':
      case 'documents':
      default:
        return baseProps;
    }
  }, [activeView, plan, handleAddPhase, handleEditPhase, handleDeletePhase, handleReorderPhase, handleAddTask, handleEditTask, handleDeleteTask, handleAddMaterial, handleEditMaterial, handleDeleteMaterial, handleEditProjectDates, handleEditPhaseDates]);

  // Get the appropriate view component
  const ViewComponent = useMemo(() => {
    const viewKey = activeView as keyof typeof VIEW_COMPONENTS;
    return VIEW_COMPONENTS[viewKey] || VIEW_COMPONENTS.overview;
  }, [activeView]);

  return (
    <ViewLoadingBoundary viewType={activeView}>
      <ViewComponent {...viewProps} />
    </ViewLoadingBoundary>
  );
});

export default PlanViewRenderer;