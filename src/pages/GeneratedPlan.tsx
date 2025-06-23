import { useEffect, useState, useCallback, useRef } from 'react'
// import { useNavigate } from 'react-router-dom' // Reserved for future use
import { Helmet } from 'react-helmet-async'
import { motion as m } from 'framer-motion'
import { FileText, Loader2 } from 'lucide-react'

import { preloadCommonViews } from '@/components/plan/LazyViews'
import { PlanTabNavigation } from '@/components/plan/PlanTabNavigation'
import { PlanActionBar } from '@/components/plan/PlanActionBar'
import { PlanModalManager, PlanModalManagerHandlers } from '@/components/plan'
import { PlanViewRenderer } from '@/components/plan/PlanViewRenderer'
import { mockConstructionPlan } from '@/data/mock/generatedPlan/planData'
import { usePlanState } from '@/hooks/usePlanState'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { PageHeader } from '@/components/shared/PageHeader'
import { Phase as ModalPhase, Task as ModalTask } from '@/components/shared/modals'
import { Material, Phase as PlanPhase, Task as PlanTask } from '@/data/mock/generatedPlan/planData'
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

  // Modal save handlers that use plan state actions  
  const handleSavePhase = useCallback((phaseData: Partial<ModalPhase>) => {
    if (!phaseData.id) {
      // Add new phase - convert modal phase to plan phase
      const planPhase: Omit<PlanPhase, 'id' | 'tasks' | 'materials'> = {
        name: phaseData.name || '',
        description: phaseData.description || '',
        order: phaseData.order || 1,
        duration: '1 week', // Default duration
        startDate: phaseData.startDate,
        endDate: phaseData.endDate,
        status: (phaseData.status as PlanPhase['status']) || 'pending',
        progress: phaseData.progress || 0
      }
      actions.addPhase(planPhase)
      toast.success(`Phase "${planPhase.name}" added successfully`)
    } else {
      // Update existing phase - convert modal phase to plan phase
      const planPhaseUpdate: Partial<PlanPhase> = {
        name: phaseData.name,
        description: phaseData.description,
        order: phaseData.order,
        startDate: phaseData.startDate,
        endDate: phaseData.endDate,
        status: phaseData.status as PlanPhase['status'],
        progress: phaseData.progress
      }
      actions.updatePhase(phaseData.id, planPhaseUpdate)
      toast.success('Phase updated successfully')
    }
  }, [actions])

  const handleSaveTask = useCallback((taskData: Partial<ModalTask>) => {
    if (!taskData.phaseId) return
    
    if (!taskData.id) {
      // Add new task - convert modal task to plan task
      const planTask: Omit<PlanTask, 'id'> = {
        name: taskData.name || '',
        description: taskData.description || '',
        duration: String(taskData.duration || '1 day'),
        startDate: taskData.startDate,
        endDate: taskData.endDate,
        status: (taskData.status as PlanTask['status']) || 'pending',
        assignedTo: taskData.assignedTo,
        dependencies: (taskData as { dependencies?: string[] }).dependencies || [],
        progress: taskData.progress || 0
      }
      actions.addTask(taskData.phaseId, planTask)
      toast.success(`Task "${planTask.name}" added successfully`)
    } else {
      // Update existing task - convert modal task to plan task
      const planTaskUpdate: Partial<PlanTask> = {
        name: taskData.name,
        description: taskData.description,
        duration: typeof taskData.duration === 'number' ? String(taskData.duration) : taskData.duration,
        startDate: taskData.startDate,
        endDate: taskData.endDate,
        status: taskData.status as PlanTask['status'],
        assignedTo: taskData.assignedTo,
        dependencies: (taskData as { dependencies?: string[] }).dependencies,
        progress: taskData.progress
      }
      actions.updateTask(taskData.phaseId, taskData.id, planTaskUpdate)
      toast.success('Task updated successfully')
    }
  }, [actions])

  const handleSaveMaterial = useCallback((materialData: Partial<Material>) => {
    const phaseId = (materialData as { phaseId?: string }).phaseId
    if (!phaseId) return
    
    if (!materialData.id) {
      // Add new material
      actions.addMaterial(phaseId, materialData as Omit<Material, 'id'>)
      toast.success(`Material "${materialData.name || 'New Material'}" added successfully`)
    } else {
      // Update existing material
      actions.updateMaterial(phaseId, materialData.id, materialData)
      toast.success('Material updated successfully')
    }
  }, [actions])

  const handleSaveDates = useCallback((dateRange: { startDate: string; endDate: string }) => {
    // Validate date range
    const startDate = new Date(dateRange.startDate)
    const endDate = new Date(dateRange.endDate)
    
    if (startDate >= endDate) {
      toast.error('End date must be after start date')
      return
    }
    
    // Check if dates are in the past (optional warning)
    const today = new Date()
    if (startDate < today) {
      toast.warning('Start date is in the past')
    }
    
    actions.updatePlanDates(dateRange.startDate, dateRange.endDate)
    toast.success('Project timeline updated')
  }, [actions])

  // Guard against null plan
  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#2B6CB0]" />
      </div>
    )
  }

  return (
    <ErrorProvider onError={(error, context) => handleError(error, { context })}>
      <PageErrorBoundary name="GeneratedPlan">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Helmet>
            <title>Generated Plan | BuildEase</title>
          </Helmet>
          
          {/* Page Header */}
          <SectionErrorBoundary name="PageHeader">
            <PageHeader
              title={plan.name}
              description="AI generated construction phases with timeline, tasks, and material requirements."
              icon={<FileText className="h-6 w-6" />}
              status={plan.status}
              actions={
                <ComponentErrorBoundary name="PlanActionBar">
                  <PlanActionBar
                    isGenerating={isGenerating}
                    isSaving={isSaving}
                    onSave={handleSavePlan}
                    onRegenerate={handleRegenerate}
                    onDistribute={() => modalHandlersRef.current?.openDistributeModal()}
                    onPrint={() => {}}
                    onExportPDF={() => {}}
                  />
                </ComponentErrorBoundary>
              }
            />
          </SectionErrorBoundary>

          {/* Tab Navigation */}
          <SectionErrorBoundary name="TabNavigation">
            <PlanTabNavigation
              activeView={state.activeView}
              onViewChange={actions.setActiveView}
            />
          </SectionErrorBoundary>

          {/* Main Content */}
          <SectionErrorBoundary name="MainContent" resetKeys={[state.activeView, plan?.id]}>
            <div className="container mx-auto px-4 sm:px-6 py-6">
              {isGenerating ? (
                <m.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-10 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
                >
                  <Loader2 className="h-10 w-10 text-[#2B6CB0] animate-spin mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Regenerating your construction plan...</p>
                </m.div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6">
                  <ComponentErrorBoundary name="PlanViewRenderer">
                    <PlanViewRenderer
                      activeView={state.activeView}
                      plan={plan}
                      modalHandlersRef={modalHandlersRef}
                    />
                  </ComponentErrorBoundary>
                </div>
              )}
            </div>
          </SectionErrorBoundary>

          {/* Modal Manager */}
          <ComponentErrorBoundary name="PlanModalManager">
            <PlanModalManager
              plan={plan}
              isSaving={isSaving || isDistributing}
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