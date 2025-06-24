/**
 * Plan View Renderer Component
 * Handles dynamic view rendering with lazy loading and error boundaries
 * Provides consistent props mapping for all plan views
 */

import React, { useMemo, useCallback } from 'react';
import { VIEW_COMPONENTS } from './LazyViews';
import { ViewLoadingBoundary } from './LoadingBoundary';
import { useConfirmation } from '@/hooks/useConfirmation';
import { PlanViewRendererProps } from '@/types/plan/views';

export const PlanViewRenderer = React.memo(function PlanViewRenderer({
  activeView,
  plan,
  modalHandlersRef,
  loadingState,
  loadingActions
}: PlanViewRendererProps) {
  const { confirmDelete } = useConfirmation();
  
  // Memoized callback handlers to prevent recreation on every render
  const handleAddPhase = useCallback((_planId?: string) => {
    if (!modalHandlersRef?.current) {
      console.error('PlanViewRenderer: Modal handlers ref is not initialized');
      return;
    }
    try {
      modalHandlersRef.current.openPhaseModal(undefined, true);
    } catch (error) {
      console.error('PlanViewRenderer: Error opening phase modal:', error);
    }
  }, [modalHandlersRef]);

  const handleEditPhase = useCallback((phaseId: string) => {
    if (!modalHandlersRef?.current) {
      console.error('PlanViewRenderer: Modal handlers ref is not initialized');
      return;
    }
    try {
      modalHandlersRef.current.openPhaseModal(phaseId, false);
    } catch (error) {
      console.error('PlanViewRenderer: Error opening phase modal for edit:', error);
    }
  }, [modalHandlersRef]);

  const handleDeletePhase = useCallback(async (phaseId: string) => {
    const phase = plan.phases.find((p) => p.id === phaseId);
    const phaseName = phase?.name || 'this phase';
    
    const confirmed = await confirmDelete(phaseName, 'phase');
    if (confirmed) {
      // Set loading state for this specific phase
      loadingActions?.setPhaseLoading(phaseId, true);
      
      try {
        // This will be handled by the parent component's plan state
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
      } finally {
        loadingActions?.setPhaseLoading(phaseId, false);
      }
    }
  }, [confirmDelete, plan.phases, loadingActions]);

  const handleReorderPhase = useCallback((oldIndex: number, newIndex: number) => {
    // For now, just log the reorder - the actual implementation would need to be
    // connected to the plan state management in the parent component
    console.log('Reorder phase:', { oldIndex, newIndex });
  }, []);

  const handleAddTask = useCallback((phaseId: string) => {
    modalHandlersRef?.current?.openTaskModal(phaseId, undefined, true);
  }, [modalHandlersRef]);

  const handleEditTask = useCallback((phaseId: string, taskId: string) => {
    modalHandlersRef?.current?.openTaskModal(phaseId, taskId, false);
  }, [modalHandlersRef]);

  const handleDeleteTask = useCallback(async (phaseId: string, taskId: string) => {
    const phase = plan.phases.find((p: { id: string }) => p.id === phaseId);
    const task = phase?.tasks.find((t: { id: string }) => t.id === taskId);
    const taskName = task?.name || 'this task';
    
    const confirmed = await confirmDelete(taskName, 'task');
    if (confirmed) {
      // Set loading state for this specific task
      loadingActions?.setTaskLoading(taskId, true);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
      } finally {
        loadingActions?.setTaskLoading(taskId, false);
      }
    }
  }, [confirmDelete, plan.phases, loadingActions]);

  const handleAddMaterial = useCallback((phaseId: string) => {
    modalHandlersRef?.current?.openMaterialModal(phaseId, undefined, true);
  }, [modalHandlersRef]);

  const handleEditMaterial = useCallback((phaseId: string, materialId: string) => {
    modalHandlersRef?.current?.openMaterialModal(phaseId, materialId, false);
  }, [modalHandlersRef]);

  const handleDeleteMaterial = useCallback(async (phaseId: string, materialId: string) => {
    const phase = plan.phases.find((p: { id: string }) => p.id === phaseId);
    const material = phase?.materials?.find((m: { id: string }) => m.id === materialId);
    const materialName = material?.name || 'this material';
    
    const confirmed = await confirmDelete(materialName, 'material');
    if (confirmed) {
      // Set loading state for this specific material
      loadingActions?.setMaterialLoading(materialId, true);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 600));
      } finally {
        loadingActions?.setMaterialLoading(materialId, false);
      }
    }
  }, [confirmDelete, plan.phases, loadingActions]);

  const handleEditProjectDates = useCallback(() => {
    if (!modalHandlersRef?.current) {
      console.error('PlanViewRenderer: Modal handlers ref is not initialized');
      return;
    }
    try {
      modalHandlersRef.current.openDateModal('project');
    } catch (error) {
      console.error('PlanViewRenderer: Error opening date modal:', error);
    }
  }, [modalHandlersRef]);

  const handleEditPhaseDates = useCallback((phaseId: string) => {
    if (!modalHandlersRef?.current) {
      console.error('PlanViewRenderer: Modal handlers ref is not initialized');
      return;
    }
    try {
      modalHandlersRef.current.openDateModal('phase', phaseId);
    } catch (error) {
      console.error('PlanViewRenderer: Error opening date modal for phase:', error);
    }
  }, [modalHandlersRef]);

  // Memoized view-specific props to prevent unnecessary re-renders
  const viewProps = useMemo(() => {
    const baseProps = { plan, loadingState };

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
        return {
          ...baseProps,
          onEditPhase: handleEditPhase,
          onAddTask: handleAddTask,
          onEditTask: handleEditTask,
          onEditDates: handleEditPhaseDates,
          onReorderPhase: handleReorderPhase
        };

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
  }, [activeView, plan, loadingState, handleAddPhase, handleEditPhase, handleDeletePhase, handleReorderPhase, handleAddTask, handleEditTask, handleDeleteTask, handleAddMaterial, handleEditMaterial, handleDeleteMaterial, handleEditProjectDates, handleEditPhaseDates]);

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