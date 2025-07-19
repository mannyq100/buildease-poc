import React, { useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, Package, CheckSquare, Layers, FileText, Plus, Calendar, BarChart } from 'lucide-react';
import { PhaseCard } from './PhaseCard';
import { LazyPhaseList } from './LazyPhaseList';
import { MobileStickyActionBar } from './MobileStickyActionBar';
import { MobileFloatingActionButton } from './MobileFloatingActionButton';
import { motion } from 'framer-motion';
import { formatDate, containerVariants, itemVariants } from '@/utils/plan-helpers';
import { OverviewViewProps } from '@/types/plan/views';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';

export const OverviewView = React.memo(function OverviewView({ 
  plan, 
  onEditPhase, 
  onDeletePhase, 
  onAddTask,
  onEditTask,
  onDeleteTask,
  onAddMaterial,
  onEditMaterial,
  onDeleteMaterial,
  onReorderPhase,
  onAddPhase,
  onEditProjectDates,
  onEditPhaseDates,
  onUpdateProgress,
  viewMode: _viewMode, // Prefix with underscore to indicate intentionally unused parameter
  loadingState
}: OverviewViewProps) {
  // Drag and drop state
  const [activePhaseId, setActivePhaseId] = React.useState<string | null>(null);
  
  // Configure sensors for drag and drop with mobile optimization
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Start drag after 8px movement
        delay: 100, // Small delay for better mobile UX
        tolerance: 5, // Tolerance for slight finger movement
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Memoized computed values for performance with specific dependencies
  const { totalTasks, totalMaterials, completedTasks, overallProgress } = useMemo(() => {
    const totalTasks = plan.phases.reduce((sum: number, phase) => sum + phase.tasks.length, 0);
    const totalMaterials = plan.phases.reduce((sum: number, phase) => sum + phase.materials.length, 0);
    const completedTasks = plan.phases.reduce((sum: number, phase) => sum + phase.tasks.filter((task) => task.status === 'completed').length, 0);
    const overallProgress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return { totalTasks, totalMaterials, completedTasks, overallProgress };
  }, [plan.phases]); // This dependency is correct as we're looking at the entire phases array
  
  // Memoized formatted dates
  const formattedStartDate = useMemo(() => formatDate(plan.startDate), [plan.startDate]);
  const formattedEndDate = useMemo(() => formatDate(plan.endDate), [plan.endDate]);
  const formattedLastUpdated = useMemo(() => formatDate(plan.lastUpdated), [plan.lastUpdated]);
  
  // Memoized callbacks
  // Ensure all callbacks are properly memoized
  const handleAddPhase = useCallback(() => {
    onAddPhase?.(plan.id);
  }, [onAddPhase, plan.id]);
  
  const handleEditProjectDates = useCallback(() => {
    onEditProjectDates?.();
  }, [onEditProjectDates]);
  
  // Drag and drop handlers with mobile haptic feedback
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActivePhaseId(event.active.id as string);
    
    // Haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50); // Short vibration for drag start
    }
  }, []);
  
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    setActivePhaseId(null);
    
    if (over && active.id !== over.id) {
      // Find the indices of the phases being reordered
      const oldIndex = plan.phases.findIndex((phase) => phase.id === active.id);
      const newIndex = plan.phases.findIndex((phase) => phase.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        // Haptic feedback for successful reorder on mobile
        if ('vibrate' in navigator) {
          navigator.vibrate([30, 10, 30]); // Double pulse for success
        }
        
        // Call the reorder callback with the indices
        onReorderPhase?.(oldIndex, newIndex);
      }
    } else {
      // Light haptic feedback for canceled drag
      if ('vibrate' in navigator) {
        navigator.vibrate(20);
      }
    }
  }, [plan.phases, onReorderPhase]);
  
  // Get the active phase for drag overlay
  const activePhase = useMemo(() => {
    return activePhaseId ? plan.phases.find((phase) => phase.id === activePhaseId) : null;
  }, [activePhaseId, plan.phases]);

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Project Overview Card */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
          <div className="bg-gradient-to-r from-slate-50/50 via-white to-slate-50/50 dark:from-slate-900/50 dark:via-gray-900 dark:to-slate-900/50 border-b px-6 py-5">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{plan.name}</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-sm mt-2 max-w-2xl line-clamp-2 leading-relaxed">{plan.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleEditProjectDates} 
                  variant="outline" 
                  size="sm" 
                  className="h-11 px-4 sm:h-8 sm:px-3"
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Edit Dates
                </Button>
                <Button 
                  onClick={onUpdateProgress} 
                  size="sm" 
                  className="h-11 px-4 sm:h-8 sm:px-3 bg-buildease-orange-600 hover:bg-buildease-orange-700 text-white"
                >
                  <BarChart className="h-4 w-4 mr-1" />
                  Update Progress
                </Button>
              </div>
            </div>
          </div>
          
          <CardContent className="p-0">
            {/* Enhanced Project Stats */}
            <div className="bg-slate-50/30 dark:bg-slate-900/30">
              {/* Main Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-b">
                {/* Enhanced Progress Circle */}
                <div className="p-6 flex flex-col items-center justify-center border-r last:border-r-0">
                  <div className="relative mb-4">
                    <div className="flex items-center justify-center w-24 h-24 rounded-full bg-white dark:bg-gray-800 shadow-md border">
                      <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{overallProgress}%</span>
                      <svg className="absolute inset-0" width="80" height="80" viewBox="0 0 80 80">
                        <circle 
                          cx="40" 
                          cy="40" 
                          r="35" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="4" 
                          className="text-slate-200 dark:text-slate-700"
                        />
                        <circle 
                          cx="40" 
                          cy="40" 
                          r="35" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="4" 
                          strokeDasharray="219.9" 
                          strokeDashoffset={219.9 - (219.9 * overallProgress / 100)} 
                          strokeLinecap="round" 
                          transform="rotate(-90 40 40)" 
                          className="text-slate-900 dark:text-slate-100 transition-all duration-700 ease-out"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Overall Progress</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">{completedTasks} of {totalTasks} tasks completed</p>
                  </div>
                </div>

                {/* Enhanced Key Metrics */}
                <div className="p-6 border-r last:border-r-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm border hover:shadow-md transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                          <Layers className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">Phases</span>
                      </div>
                      <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{plan.phases.length}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm border hover:shadow-md transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                          <CheckSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="font-medium text-slate-700 dark:text-slate-300">Tasks</span>
                      </div>
                      <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{completedTasks}/{totalTasks}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm border hover:shadow-md transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                          <Package className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </div>
                        <span className="font-medium text-slate-700 dark:text-slate-300">Materials</span>
                      </div>
                      <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{totalMaterials}</span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Timeline Information */}
                <div className="p-6 border-r last:border-r-0">
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">Project Timeline</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-2 rounded-md bg-slate-50 dark:bg-slate-800">
                        <div className="w-6 h-6 rounded-full bg-slate-600 dark:bg-slate-400 flex items-center justify-center">
                          <Calendar className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Start Date</p>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{formattedStartDate}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-2 rounded-md bg-slate-50 dark:bg-slate-800">
                        <div className="w-6 h-6 rounded-full bg-slate-600 dark:bg-slate-400 flex items-center justify-center">
                          <CalendarDays className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">End Date</p>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{formattedEndDate}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-2 rounded-md bg-slate-50 dark:bg-slate-800">
                        <div className="w-6 h-6 rounded-full bg-slate-600 dark:bg-slate-400 flex items-center justify-center">
                          <Clock className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Last Updated</p>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{formattedLastUpdated}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Project Description */}
                <div className="p-6">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                      <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Project Description</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-4">
                      {plan.description || 'No description available for this construction project.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Phases Header with Add Phase Button */}
      <motion.div variants={itemVariants} className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
            <BarChart className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <span>Construction Phases</span>
          </h2>
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
            {plan.phases.length} {plan.phases.length === 1 ? 'phase' : 'phases'}
          </div>
        </div>
        
        {/* Add Phase button with accent color */}
        <Button
          onClick={handleAddPhase}
          size="sm"
          className="bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900 h-11 px-4 sm:h-8 sm:px-3 shadow-sm"
          disabled={!onAddPhase}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Phase
        </Button>
      </motion.div>

      {/* Phases List - Enhanced with drag-and-drop functionality */}
      <motion.div variants={itemVariants}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={plan.phases.map((phase) => phase.id)}
            strategy={verticalListSortingStrategy}
          >
            <LazyPhaseList
              phases={plan.phases}
              onDelete={onDeletePhase}
              onEdit={onEditPhase}
              onAddTask={onAddTask}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              onAddMaterial={onAddMaterial}
              onEditMaterial={onEditMaterial}
              onDeleteMaterial={onDeleteMaterial}
              onEditPhaseDates={onEditPhaseDates}
              loadingState={loadingState}
              isDragDisabled={!onReorderPhase}
              batchSize={5}
              threshold={200}
            />
          </SortableContext>
          
          {/* Enhanced Drag Overlay for mobile-friendly visual feedback */}
          <DragOverlay>
            {activePhase && (
              <div className="opacity-95 transform rotate-2 sm:rotate-3 shadow-2xl ring-2 ring-buildease-orange-400 ring-opacity-50 scale-105 sm:scale-100">
                <PhaseCard 
                  phase={activePhase} 
                  onDelete={onDeletePhase}
                  onEdit={onEditPhase}
                  onAddTask={onAddTask}
                  onEditTask={onEditTask}
                  onDeleteTask={onDeleteTask}
                  onAddMaterial={onAddMaterial}
                  onEditMaterial={onEditMaterial}
                  onDeleteMaterial={onDeleteMaterial}
                  onEditPhaseDates={onEditPhaseDates}
                  loadingState={loadingState}
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
        
        {plan.phases.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/20 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
              <Layers className="h-8 w-8 text-gray-400 dark:text-gray-600" />
            </div>
            <p className="font-medium text-lg sm:text-base mb-2 sm:mb-1">No phases have been defined</p>
            <p className="text-base sm:text-sm mb-4 sm:mb-3">Start by adding your first construction phase</p>
            <Button
              onClick={onAddPhase ? () => onAddPhase(plan.id) : undefined}
              size="sm"
              className="bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900 h-11 px-4 sm:h-8 sm:px-3 shadow-sm"
              disabled={!onAddPhase}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Your First Phase
            </Button>
          </div>
        )}
      </motion.div>

      {/* Mobile Navigation Enhancements */}
      <MobileStickyActionBar
        primaryAction={{
          label: 'Add Phase',
          icon: Plus,
          onClick: handleAddPhase,
          disabled: !onAddPhase
        }}
        secondaryActions={[
          {
            label: 'Edit Dates',
            icon: Calendar,
            onClick: handleEditProjectDates,
            disabled: !onEditProjectDates,
            variant: 'outline'
          }
        ]}
        viewContext="overview"
        visible={true}
      />

      <MobileFloatingActionButton
        primaryAction={{
          label: 'Quick Actions',
          icon: Plus,
          onClick: () => {}, // Handled by speed dial
          color: 'orange'
        }}
        secondaryActions={[
          {
            label: 'Add Phase',
            icon: Layers,
            onClick: handleAddPhase,
            disabled: !onAddPhase,
            color: 'blue'
          },
          {
            label: 'Edit Project',
            icon: Calendar,
            onClick: handleEditProjectDates,
            disabled: !onEditProjectDates,
            color: 'green'
          }
        ]}
        visible={true}
        offset={{ bottom: 100, right: 16 }} // Account for sticky action bar
      />
    </motion.div>
  );
});
