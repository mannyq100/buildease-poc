import { useEffect, useState, useCallback, useRef } from 'react'
// import { useNavigate } from 'react-router-dom' // Reserved for future use
import { Helmet } from 'react-helmet-async'
import { motion as m } from 'framer-motion'
import { Loader2 } from 'lucide-react'

import { preloadCommonViews } from '@/components/plan/LazyViews'
import { PlanTabNavigation } from '@/components/plan/PlanTabNavigation'
import { PlanModalManager, PlanModalManagerHandlers } from '@/components/plan'
import { PlanViewRenderer } from '@/components/plan/PlanViewRenderer'
import { mockConstructionPlan } from '@/data/mock/generatedPlan/planData'
import { usePlanState } from '@/hooks/usePlanState'
import { usePlanLoading } from '@/hooks/usePlanLoading'
import { usePlanActions } from '@/hooks/usePlanActions'
import { usePlanActionsOptimistic } from '@/hooks/usePlanActionsOptimistic'
import { PlanApiMock } from '@/services/planApiMock'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { Phase as ModalPhase, Task as ModalTask, Material as ModalMaterial } from '@/components/shared/modals'
import { 
  PageErrorBoundary, 
  SectionErrorBoundary, 
  ComponentErrorBoundary,
  ErrorProvider 
} from '@/components/shared/ErrorBoundarySystem'
import { toast } from 'sonner'

export default function GeneratedPlan() {
  // const navigate = useNavigate() // Keeping for future use
  const { handleError, handleAsyncError, createSafeAsyncWrapper } = useErrorHandler()
  
  // Plan state management using our custom hook
  const {
    state,
    actions,
    plan,
    isGenerating,
    isSaving
  } = usePlanState(mockConstructionPlan)
  
  // Enhanced loading state management
  const { loadingState, actions: loadingActions } = usePlanLoading()
  
  // Unified plan actions
  const planActions = usePlanActions({
    ...actions,
    setPhaseLoading: loadingActions.setPhaseLoading,
    setTaskLoading: loadingActions.setTaskLoading,
    setMaterialLoading: loadingActions.setMaterialLoading,
    setOperationLoading: loadingActions.setOperationLoading
  })

  // Enhanced plan actions with optimistic updates
  const optimisticActions = usePlanActionsOptimistic({
    phases: plan?.phases || [],
    apiActions: {
      addPhase: PlanApiMock.addPhase,
      updatePhase: PlanApiMock.updatePhase,
      deletePhase: PlanApiMock.deletePhase,
      reorderPhase: PlanApiMock.reorderPhase,
      addTask: PlanApiMock.addTask,
      updateTask: PlanApiMock.updateTask,
      deleteTask: PlanApiMock.deleteTask,
      addMaterial: PlanApiMock.addMaterial,
      updateMaterial: PlanApiMock.updateMaterial,
      deleteMaterial: PlanApiMock.deleteMaterial,
      updatePlanDates: PlanApiMock.updatePlanDates
    },
    setPhaseLoading: loadingActions.setPhaseLoading,
    setTaskLoading: loadingActions.setTaskLoading,
    setMaterialLoading: loadingActions.setMaterialLoading,
    setOperationLoading: loadingActions.setOperationLoading
  }, {
    enableOptimisticUpdates: true,
    enableToasts: true,
    rollbackDelay: 3000
  })
  
  // Local state for UI
  const [isDistributing, setIsDistributing] = useState(false)
  
  // Modal handlers ref - using MutableRefObject as required by PlanModalManager
  // Reference used to access modal handlers from other components
  const modalHandlersRef = useRef<PlanModalManagerHandlers>({} as PlanModalManagerHandlers);
  
  
  // Track when modalHandlersRef.current changes
  useEffect(() => {
  }, [modalHandlersRef.current?.openPhaseModal, modalHandlersRef.current?.openTaskModal]);
  
  
  // Preload views on component mount
  useEffect(() => {
    // Preload commonly used views for better performance
    preloadCommonViews()
  }, [])


  // Plan action handlers using the usePlanState actions with error handling
  const handleRegenerate = useCallback(async () => {
    try {
      actions.setGenerating(true)
      
      // Wrap async operation with error handling
      await handleAsyncError(
        async () => {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 2000))
          // Create a stable object reference to avoid unnecessary rerenders
          actions.setPlan({...mockConstructionPlan})
          toast.success('Plan regenerated successfully')
        },
        { 
          context: { operation: 'regenerate_plan' },
          retries: 2,
          retryDelay: 1000
        }
      )
    } catch {
      // Error already handled by handleAsyncError
    } finally {
      actions.setGenerating(false)
    }
  }, [actions, handleAsyncError])

  const handleSavePlan = useCallback(async (status: 'draft' | 'final' = 'draft') => {
    const safeSave = createSafeAsyncWrapper(
      async () => {
        actions.setSaving(true)
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500))
        actions.updatePlanStatus(status)
        return status
      },
      { context: { operation: 'save_plan', status } }
    )

    try {
      await safeSave()
    } finally {
      actions.setSaving(false)
    }
  }, [actions, createSafeAsyncWrapper])

  const handleDistribute = useCallback(async () => {
    try {
      setIsDistributing(true)
      
      await handleAsyncError(
        async () => {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 2000))
          toast.success('Plan distributed to team members')
        },
        { 
          context: { operation: 'distribute_plan' },
          fallbackMessage: 'Failed to distribute plan to team members'
        }
      )
    } catch {
      // Error already handled
    } finally {
      setIsDistributing(false)
    }
  }, [handleAsyncError])

  // Modal save handlers using optimistic plan actions
  const handleSavePhase = useCallback((phaseData: Partial<ModalPhase>) => {
    optimisticActions.handleSavePhase(phaseData);
  }, [optimisticActions])

  const handleSaveTask = useCallback((taskData: Partial<ModalTask>) => {
    optimisticActions.handleSaveTask(taskData);
  }, [optimisticActions])

  const handleSaveMaterial = useCallback((materialData: Partial<ModalMaterial>) => {
    optimisticActions.handleSaveMaterial(materialData);
  }, [optimisticActions])

  const handleSaveDates = useCallback((dateRange: { startDate: string; endDate: string }) => {
    optimisticActions.handleUpdatePlanDates(dateRange);
  }, [optimisticActions])

  // Create enhanced plan with optimistic data
  const enhancedPlan = plan ? {
    ...plan,
    phases: optimisticActions.phases
  } : null;

  // Guard against null plan
  if (!enhancedPlan) {
    return (
      <div className="min-h-screen bg-buildease-blue-50/30 dark:bg-buildease-blue-950/20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#2B6CB0]" />
      </div>
    )
  }

  return (
    <ErrorProvider onError={(error, context) => handleError(error, { context })}>
      <PageErrorBoundary name="GeneratedPlan">
        <div className="min-h-screen bg-buildease-blue-50/30 dark:bg-buildease-blue-950/20 flex flex-col">
          <Helmet>
            <title>Generated Plan | BuildEase</title>
          </Helmet>
          
          {/* Tab Navigation with integrated plan actions */}
          <SectionErrorBoundary name="TabNavigation">
            <PlanTabNavigation
              activeView={state.activeView}
              onViewChange={actions.setActiveView}
              isGenerating={isGenerating}
              isSaving={isSaving || optimisticActions.hasPendingActions}
              onSave={handleSavePlan}
              onRegenerate={handleRegenerate}
              onDistribute={() => modalHandlersRef.current?.openDistributeModal()}
              onPrint={() => {}}
              onExportPDF={() => {}}
            />
          </SectionErrorBoundary>

          {/* Main Content */}
          <SectionErrorBoundary name="MainContent" resetKeys={[state.activeView, plan?.id]}>
            <div className="container mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col">
              {isGenerating ? (
                <m.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-10 bg-white dark:bg-buildease-blue-950/40 rounded-xl shadow-md p-6"
                >
                  <Loader2 className="h-10 w-10 text-[#2B6CB0] animate-spin mb-4" />
                  <p className="text-buildease-earth-600 dark:text-buildease-earth-400">Regenerating your construction plan...</p>
                </m.div>
              ) : (
                <div className="bg-white dark:bg-buildease-blue-950/40 rounded-xl shadow-md p-4 sm:p-6 flex-1 flex flex-col overflow-hidden">
                  <ComponentErrorBoundary name="PlanViewRenderer">
                    <PlanViewRenderer
                      activeView={state.activeView}
                      plan={enhancedPlan}
                      modalHandlersRef={modalHandlersRef}
                      loadingState={loadingState}
                      loadingActions={loadingActions}
                    />
                  </ComponentErrorBoundary>
                </div>
              )}
            </div>
          </SectionErrorBoundary>

          {/* Modal Manager */}
          <ComponentErrorBoundary name="PlanModalManager">
            <PlanModalManager
              plan={enhancedPlan}
              isSaving={isSaving || isDistributing || optimisticActions.hasPendingActions}
              onSavePhase={handleSavePhase}
              onSaveTask={handleSaveTask}
              onSaveMaterial={handleSaveMaterial}
              onSaveDates={handleSaveDates}
              onDistribute={handleDistribute}
              modalHandlersRef={modalHandlersRef as React.MutableRefObject<PlanModalManagerHandlers>}
            />
          </ComponentErrorBoundary>
        </div>
      </PageErrorBoundary>
    </ErrorProvider>
  )
}