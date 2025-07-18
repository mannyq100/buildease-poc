import React, { useState, useMemo, useCallback } from 'react';
import { Phase } from '@/data/mock/generatedPlan/planData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash, Plus, Edit, Calendar, Clock, ChevronDown, ChevronRight, CheckCircle, Package } from 'lucide-react';
import { AnimatePresence, motion as m } from 'framer-motion';
import { getStatusColor, formatDate, getStatusText } from '@/utils/plan-helpers';
import { LoadingState } from '@/hooks/usePlanLoading';
import { LoadingButton, ActionLoadingOverlay } from './LoadingIndicators';
import { LazyTaskList } from './LazyTaskList';
import { LazyMaterialList } from './LazyMaterialList';

interface PhaseCardProps {
  phase: Phase;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onAddTask?: (phaseId: string) => void;
  onEditTask?: (phaseId: string, taskId: string) => void;
  onDeleteTask?: (phaseId: string, taskId: string) => void;
  onAddMaterial?: (phaseId: string) => void;
  onEditMaterial?: (phaseId: string, materialId: string) => void;
  onDeleteMaterial?: (phaseId: string, materialId: string) => void;
  onEditPhaseDates?: (phaseId: string) => void;
  loadingState?: LoadingState;
}

export const PhaseCard = React.memo(function PhaseCard({ 
  phase, 
  onDelete, 
  onEdit, 
  onAddTask,
  onEditTask,
  onDeleteTask,
  onAddMaterial,
  onEditMaterial,
  onDeleteMaterial,
  onEditPhaseDates,
  loadingState
}: PhaseCardProps) {
  const [tasksExpanded, setTasksExpanded] = useState(false);
  const [materialsExpanded, setMaterialsExpanded] = useState(false);
  
  // Memoized computed values
  const _statusColorClass = useMemo(() => getStatusColor(phase.status), [phase.status]);
  const statusText = useMemo(() => getStatusText(phase.status), [phase.status]);
  const formattedStartDate = useMemo(() => formatDate(phase.startDate), [phase.startDate]);
  const formattedEndDate = useMemo(() => formatDate(phase.endDate), [phase.endDate]);
  
  // Check if this phase is loading
  const isPhaseLoading = loadingState?.phases[phase.id] || false;
  
  // Memoized callback handlers
  const handleEditPhase = useCallback(() => {
    onEdit?.(phase.id);
  }, [onEdit, phase.id]);
  
  const handleDeletePhase = useCallback(() => {
    onDelete?.(phase.id);
  }, [onDelete, phase.id]);
  
  const handleEditPhaseDates = useCallback(() => {
    onEditPhaseDates?.(phase.id);
  }, [onEditPhaseDates, phase.id]);
  
  const handleAddTask = useCallback(() => {
    onAddTask?.(phase.id);
  }, [onAddTask, phase.id]);
  
  const handleToggleTasks = useCallback(() => {
    setTasksExpanded(prev => !prev);
  }, []);
  
  
  // Using shared utility functions from @/utils/plan-helpers

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-4"
    >
      <Card className="border shadow-md hover:shadow-lg overflow-hidden rounded-xl bg-white dark:bg-gray-900 transition-all duration-300 relative">
        <CardContent className="p-0">
          <div className="flex flex-col">
            {/* Loading Overlay */}
            <ActionLoadingOverlay
              isLoading={isPhaseLoading}
              operation="delete"
              message={`Deleting phase "${phase.name}"...`}
            />
            {/* Enhanced Phase Header */}
            <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-b">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-900 font-bold text-sm shadow-md">
                      {phase.order}
                    </div>
                    <h3 className="text-slate-900 dark:text-slate-100 font-semibold text-lg">
                      {phase.name}
                    </h3>
                  </div>
                  <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-700">
                    {statusText}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {onEditPhaseDates && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-11 px-4 sm:h-8 sm:px-3 flex items-center gap-1.5 rounded-md transition-all duration-200"
                        onClick={handleEditPhaseDates}
                      >
                        <Calendar className="h-5 w-5 sm:h-3.5 sm:w-3.5" />
                        <span className="text-xs font-medium hidden sm:inline">Edit Dates</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-11 w-11 sm:h-8 sm:w-8 p-0 rounded-md transition-all duration-200"
                      onClick={handleEditPhase}
                    >
                      <Edit className="h-5 w-5 sm:h-4 sm:w-4" />
                    </Button>
                    <LoadingButton
                      variant="ghost"
                      size="sm"
                      className="h-11 w-11 sm:h-8 sm:w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all duration-200"
                      onClick={handleDeletePhase}
                      isLoading={isPhaseLoading}
                      disabled={isPhaseLoading}
                    >
                      <Trash className="h-5 w-5 sm:h-4 sm:w-4" />
                    </LoadingButton>
                  </div>
                </div>
              </div>
              
              <div className="text-slate-700 dark:text-slate-300 mb-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border">
                {phase.description}
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-lg">
                  <Calendar className="h-4 w-4 mr-2 text-slate-600 dark:text-slate-400" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Duration: {phase.duration}</span>
                </div>
                
                <div className="flex items-center bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-lg">
                  <Clock className="h-4 w-4 mr-2 text-slate-600 dark:text-slate-400" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {phase.startDate && phase.endDate ? 
                      `${formattedStartDate} - ${formattedEndDate}` : 
                      'Dates not set'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg">
                    <CheckCircle className="h-3 w-3 mr-1 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">{phase.tasks.filter(t => t.status === 'completed').length}/{phase.tasks.length} tasks</span>
                  </div>
                  <div className="flex items-center bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg">
                    <Package className="h-3 w-3 mr-1 text-slate-600 dark:text-slate-400" />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{phase.materials.length} materials</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Tasks Section */}
            <div className="border-t">
              <div 
                className="p-5 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 group"
                onClick={handleToggleTasks}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-slate-600 transition-all duration-200">
                    {tasksExpanded ? 
                      <ChevronDown className="h-4 w-4 text-slate-600 dark:text-slate-400" /> : 
                      <ChevronRight className="h-4 w-4 text-slate-600 dark:text-slate-400" />}
                  </div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-base">
                    Tasks ({phase.tasks.length})
                  </h4>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" style={{display: phase.tasks.some(t => t.status === 'in-progress') ? 'block' : 'none'}}></div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-11 px-4 sm:h-9 sm:px-4 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddTask();
                  }}
                >
                  <Plus className="h-4 w-4 sm:h-3.5 sm:w-3.5 mr-1.5" />
                  <span className="hidden sm:inline">Add Task</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </div>
              
              <AnimatePresence>
                {tasksExpanded && (
                  <m.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden px-4 pb-4"
                  >
                    <LazyTaskList
                      tasks={phase.tasks}
                      phaseId={phase.id}
                      onEditTask={onEditTask}
                      onDeleteTask={onDeleteTask}
                      initialDisplayCount={3}
                      batchSize={5}
                    />
                  </m.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Enhanced Materials Section */}
            <div className="border-t">
              <div 
                className="p-5 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 group"
                onClick={() => setMaterialsExpanded(!materialsExpanded)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-slate-600 transition-all duration-200">
                    {materialsExpanded ? 
                      <ChevronDown className="h-4 w-4 text-slate-600 dark:text-slate-400" /> : 
                      <ChevronRight className="h-4 w-4 text-slate-600 dark:text-slate-400" />}
                  </div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-base">
                    Materials ({phase.materials.length})
                  </h4>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-4 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddMaterial?.(phase.id);
                  }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  <span className="hidden sm:inline">Add Material</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </div>
              
              <AnimatePresence>
                {materialsExpanded && (
                  <m.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden px-4 pb-4"
                  >
                    <LazyMaterialList
                      materials={phase.materials}
                      phaseId={phase.id}
                      onEditMaterial={onEditMaterial}
                      onDeleteMaterial={onDeleteMaterial}
                      initialDisplayCount={3}
                      batchSize={5}
                    />
                  </m.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    </m.div>
  );
});
