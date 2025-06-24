import React, { useState, useMemo, useCallback } from 'react';
import { Phase } from '@/data/mock/generatedPlan/planData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash, Plus, Edit, Calendar, Clock, ChevronDown, ChevronRight, CheckCircle, Package, Users } from 'lucide-react';
import { AnimatePresence, motion as m } from 'framer-motion';
import { getStatusColor, formatDate, getStatusText } from '@/utils/plan-helpers';
import { LoadingState } from '@/hooks/usePlanLoading';
import { LoadingButton, ActionLoadingOverlay } from './LoadingIndicators';

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
  const statusColorClass = useMemo(() => getStatusColor(phase.status), [phase.status]);
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
      <Card className="border border-buildease-blue-200/60 hover:border-buildease-blue-400/60 dark:border-buildease-blue-800/60 dark:hover:border-buildease-blue-600/60 shadow-lg hover:shadow-xl overflow-hidden rounded-xl bg-gradient-to-br from-white via-buildease-blue-50/20 to-buildease-blue-100/30 dark:from-gray-900 dark:via-buildease-blue-950/10 dark:to-buildease-blue-900/20 transition-all duration-300 hover:transform hover:scale-[1.02] backdrop-blur-sm border-0 ring-1 ring-buildease-blue-200/40 dark:ring-buildease-blue-800/40 hover:ring-buildease-blue-300/60 dark:hover:ring-buildease-blue-600/60 relative">
        <CardContent className="p-0">
          <div className="flex flex-col">
            {/* Loading Overlay */}
            <ActionLoadingOverlay
              isLoading={isPhaseLoading}
              operation="delete"
              message={`Deleting phase "${phase.name}"...`}
            />
            {/* Enhanced Phase Header */}
            <div className="p-6 bg-gradient-to-r from-buildease-blue-50/60 via-white/90 to-buildease-earth-50/40 dark:from-buildease-blue-950/30 dark:via-gray-800/20 dark:to-buildease-earth-950/20 border-b border-buildease-blue-200/40 dark:border-buildease-blue-800/40 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-buildease-blue-600 to-buildease-blue-700 dark:from-buildease-blue-500 dark:to-buildease-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-buildease-blue-200/50 dark:ring-buildease-blue-800/50">
                      {phase.order}
                    </div>
                    <h3 className="text-buildease-blue-800 dark:text-buildease-blue-200 font-semibold text-construction-heading">
                      {phase.name}
                    </h3>
                  </div>
                  <Badge className={`${statusColorClass} shadow-md ring-1 ring-white/20 dark:ring-gray-900/20 backdrop-blur-sm`}>
                    {statusText}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {onEditPhaseDates && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-buildease-earth-600 dark:text-buildease-earth-400 hover:text-buildease-blue-700 dark:hover:text-buildease-blue-300 hover:bg-buildease-blue-50 dark:hover:bg-buildease-blue-900/20 flex items-center gap-1.5 rounded-md transition-all duration-200"
                        onClick={handleEditPhaseDates}
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium hidden sm:inline">Edit Dates</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-buildease-earth-600 dark:text-buildease-earth-400 hover:text-buildease-blue-700 dark:hover:text-buildease-blue-300 hover:bg-buildease-blue-50 dark:hover:bg-buildease-blue-900/20 rounded-md transition-all duration-200"
                      onClick={handleEditPhase}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <LoadingButton
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all duration-200"
                      onClick={handleDeletePhase}
                      isLoading={isPhaseLoading}
                      disabled={isPhaseLoading}
                    >
                      <Trash className="h-4 w-4" />
                    </LoadingButton>
                  </div>
                </div>
              </div>
              
              <div className="text-construction-body text-buildease-earth-700 dark:text-buildease-earth-300 mb-4 bg-white/80 dark:bg-gray-800/60 p-5 rounded-xl border border-buildease-blue-200/30 dark:border-buildease-blue-800/30 shadow-md backdrop-blur-md ring-1 ring-buildease-blue-100/20 dark:ring-buildease-blue-900/20">
                {phase.description}
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center bg-gradient-to-r from-buildease-blue-100/80 to-buildease-blue-50/60 dark:from-buildease-blue-900/40 dark:to-buildease-blue-950/30 px-4 py-2.5 rounded-xl shadow-md border border-buildease-blue-200/60 dark:border-buildease-blue-800/60 backdrop-blur-sm">
                  <Calendar className="h-4 w-4 mr-2 text-buildease-blue-600 dark:text-buildease-blue-400" />
                  <span className="text-xs font-semibold text-buildease-blue-800 dark:text-buildease-blue-200">Duration: {phase.duration}</span>
                </div>
                
                <div className="flex items-center bg-gradient-to-r from-buildease-earth-100/80 to-buildease-earth-50/60 dark:from-buildease-earth-900/40 dark:to-buildease-earth-950/30 px-4 py-2.5 rounded-xl shadow-md border border-buildease-earth-200/60 dark:border-buildease-earth-800/60 backdrop-blur-sm">
                  <Clock className="h-4 w-4 mr-2 text-buildease-earth-600 dark:text-buildease-earth-400" />
                  <span className="text-xs font-semibold text-buildease-earth-800 dark:text-buildease-earth-200">
                    {phase.startDate && phase.endDate ? 
                      `${formattedStartDate} - ${formattedEndDate}` : 
                      'Dates not set'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-gradient-to-r from-status-completed/15 to-green-100/20 dark:from-status-completed/25 dark:to-green-900/30 px-3 py-1.5 rounded-lg shadow-sm border border-status-completed/20 dark:border-status-completed/30 backdrop-blur-sm">
                    <CheckCircle className="h-3 w-3 mr-1 text-status-completed" />
                    <span className="text-xs font-medium text-status-completed">{phase.tasks.filter(t => t.status === 'completed').length}/{phase.tasks.length} tasks</span>
                  </div>
                  <div className="flex items-center bg-gradient-to-r from-buildease-orange-100/80 to-buildease-orange-50/60 dark:from-buildease-orange-900/40 dark:to-buildease-orange-950/30 px-3 py-1.5 rounded-lg shadow-sm border border-buildease-orange-200/50 dark:border-buildease-orange-800/50 backdrop-blur-sm">
                    <Package className="h-3 w-3 mr-1 text-buildease-orange-600 dark:text-buildease-orange-400" />
                    <span className="text-xs font-medium text-buildease-orange-700 dark:text-buildease-orange-300">{phase.materials.length} materials</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Tasks Section */}
            <div className="border-t border-buildease-blue-200/40 dark:border-buildease-blue-800/40">
              <div 
                className="p-5 flex justify-between items-center cursor-pointer hover:bg-gradient-to-r hover:from-buildease-blue-50/60 hover:to-buildease-blue-100/40 dark:hover:from-buildease-blue-950/30 dark:hover:to-buildease-blue-900/20 transition-all duration-200 group backdrop-blur-sm"
                onClick={handleToggleTasks}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-buildease-blue-100 to-buildease-blue-50 dark:from-buildease-blue-900/50 dark:to-buildease-blue-950/40 flex items-center justify-center group-hover:from-buildease-blue-200 group-hover:to-buildease-blue-100 dark:group-hover:from-buildease-blue-800/70 dark:group-hover:to-buildease-blue-900/60 transition-all duration-200 shadow-sm ring-1 ring-buildease-blue-200/30 dark:ring-buildease-blue-800/30">
                    {tasksExpanded ? 
                      <ChevronDown className="h-4 w-4 text-buildease-blue-600 dark:text-buildease-blue-400" /> : 
                      <ChevronRight className="h-4 w-4 text-buildease-blue-600 dark:text-buildease-blue-400" />}
                  </div>
                  <h4 className="font-semibold text-buildease-blue-800 dark:text-buildease-blue-200 text-construction-subtitle">
                    Tasks ({phase.tasks.length})
                  </h4>
                  <div className="w-2 h-2 rounded-full bg-status-completed animate-pulse" style={{display: phase.tasks.some(t => t.status === 'in-progress') ? 'block' : 'none'}}></div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-4 text-xs bg-white/80 dark:bg-gray-800/80 border-buildease-blue-300/60 dark:border-buildease-blue-700/60 text-buildease-blue-700 dark:text-buildease-blue-300 hover:bg-gradient-to-r hover:from-buildease-blue-50 hover:to-white dark:hover:from-buildease-blue-900/30 dark:hover:to-gray-800/60 hover:border-buildease-blue-400/80 dark:hover:border-buildease-blue-600/80 shadow-md hover:shadow-lg transition-all duration-200 backdrop-blur-sm ring-1 ring-buildease-blue-200/20 dark:ring-buildease-blue-800/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddTask();
                  }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
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
                    <div className="space-y-2">
                      {phase.tasks.map(task => (
                        <div key={task.id} className="p-5 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-buildease-blue-200/50 dark:border-buildease-blue-800/50 shadow-md hover:border-buildease-blue-300/70 dark:hover:border-buildease-blue-700/70 transition-all duration-200 hover:shadow-lg backdrop-blur-md ring-1 ring-buildease-blue-100/20 dark:ring-buildease-blue-900/20 hover:ring-buildease-blue-200/30 dark:hover:ring-buildease-blue-800/30">
                          <div className="flex justify-between">
                            <span className="font-semibold text-buildease-earth-800 dark:text-buildease-earth-200 text-construction-body">{task.name}</span>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(task.status)} variant="outline">
                                {task.status}
                              </Badge>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditTask?.(phase.id, task.id);
                                  }}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-red-600 opacity-70 hover:opacity-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteTask?.(phase.id, task.id);
                                  }}
                                >
                                  <Trash className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          {task.assignedTo && (
                            <div className="mt-3 flex items-center gap-2">
                              <div className="flex items-center gap-1.5 text-xs text-buildease-earth-600 dark:text-buildease-earth-400 bg-buildease-earth-50 dark:bg-buildease-earth-900/30 px-2 py-1 rounded-md border border-buildease-earth-200 dark:border-buildease-earth-800">
                                <Users className="h-3 w-3" />
                                <span className="font-medium">Assigned to: {task.assignedTo}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {phase.tasks.length === 0 && (
                        <div className="text-center py-8 text-construction-body text-buildease-earth-600 dark:text-buildease-earth-400 bg-gradient-to-br from-buildease-blue-50/40 to-white/60 dark:from-buildease-blue-950/20 dark:to-gray-800/40 rounded-xl border border-dashed border-buildease-blue-300/60 dark:border-buildease-blue-700/60 backdrop-blur-sm">
                          <CheckCircle className="h-8 w-8 mx-auto mb-2 text-buildease-blue-400 dark:text-buildease-blue-500" />
                          <p className="font-medium">No tasks added yet</p>
                          <p className="text-xs mt-1 text-buildease-earth-500 dark:text-buildease-earth-500">Click "Add Task" to get started</p>
                        </div>
                      )}
                    </div>
                  </m.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Enhanced Materials Section */}
            <div className="border-t border-buildease-blue-200/40 dark:border-buildease-blue-800/40">
              <div 
                className="p-5 flex justify-between items-center cursor-pointer hover:bg-gradient-to-r hover:from-buildease-orange-50/60 hover:to-buildease-orange-100/40 dark:hover:from-buildease-orange-950/30 dark:hover:to-buildease-orange-900/20 transition-all duration-200 group backdrop-blur-sm"
                onClick={() => setMaterialsExpanded(!materialsExpanded)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-buildease-orange-100 to-buildease-orange-50 dark:from-buildease-orange-900/50 dark:to-buildease-orange-950/40 flex items-center justify-center group-hover:from-buildease-orange-200 group-hover:to-buildease-orange-100 dark:group-hover:from-buildease-orange-800/70 dark:group-hover:to-buildease-orange-900/60 transition-all duration-200 shadow-sm ring-1 ring-buildease-orange-200/30 dark:ring-buildease-orange-800/30">
                    {materialsExpanded ? 
                      <ChevronDown className="h-4 w-4 text-buildease-orange-600 dark:text-buildease-orange-400" /> : 
                      <ChevronRight className="h-4 w-4 text-buildease-orange-600 dark:text-buildease-orange-400" />}
                  </div>
                  <h4 className="font-semibold text-buildease-orange-800 dark:text-buildease-orange-200 text-construction-subtitle">
                    Materials ({phase.materials.length})
                  </h4>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-4 text-xs bg-white/80 dark:bg-gray-800/80 border-buildease-orange-300/60 dark:border-buildease-orange-700/60 text-buildease-orange-700 dark:text-buildease-orange-300 hover:bg-gradient-to-r hover:from-buildease-orange-50 hover:to-white dark:hover:from-buildease-orange-900/30 dark:hover:to-gray-800/60 hover:border-buildease-orange-400/80 dark:hover:border-buildease-orange-600/80 shadow-md hover:shadow-lg transition-all duration-200 backdrop-blur-sm ring-1 ring-buildease-orange-200/20 dark:ring-buildease-orange-800/20"
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
                    <div className="space-y-2">
                      {phase.materials.map(material => (
                        <div key={material.id} className="p-5 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-buildease-orange-200/50 dark:border-buildease-orange-800/50 shadow-md hover:border-buildease-orange-300/70 dark:hover:border-buildease-orange-700/70 transition-all duration-200 hover:shadow-lg backdrop-blur-md ring-1 ring-buildease-orange-100/20 dark:ring-buildease-orange-900/20 hover:ring-buildease-orange-200/30 dark:hover:ring-buildease-orange-800/30">
                          <div className="flex justify-between">
                            <span className="font-semibold text-buildease-earth-800 dark:text-buildease-earth-200 text-construction-body">{material.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-status-completed font-bold bg-gradient-to-r from-status-completed/15 to-green-100/20 dark:from-status-completed/25 dark:to-green-900/30 px-3 py-1.5 rounded-full text-xs border border-status-completed/30 dark:border-status-completed/40 backdrop-blur-sm shadow-sm">
                                ${(material.totalPrice ?? 0).toLocaleString()}
                              </span>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditMaterial?.(phase.id, material.id);
                                  }}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-red-600 opacity-70 hover:opacity-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteMaterial?.(phase.id, material.id);
                                  }}
                                >
                                  <Trash className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-buildease-earth-600 dark:text-buildease-earth-400 mt-3 flex items-center gap-2">
                            <span className="bg-gradient-to-r from-buildease-earth-100/80 to-buildease-earth-50/60 dark:from-buildease-earth-900/40 dark:to-buildease-earth-950/30 px-3 py-1.5 rounded-lg font-medium border border-buildease-earth-200/60 dark:border-buildease-earth-800/60 shadow-sm backdrop-blur-sm">{material.quantity} {material.unit}</span>
                            <span className="text-buildease-earth-500 dark:text-buildease-earth-500">×</span>
                            <span className="bg-gradient-to-r from-buildease-earth-100/80 to-buildease-earth-50/60 dark:from-buildease-earth-900/40 dark:to-buildease-earth-950/30 px-3 py-1.5 rounded-lg font-medium border border-buildease-earth-200/60 dark:border-buildease-earth-800/60 shadow-sm backdrop-blur-sm">${material.unitPrice} each</span>
                          </div>
                        </div>
                      ))}
                      
                      {phase.materials.length === 0 && (
                        <div className="text-center py-8 text-construction-body text-buildease-earth-600 dark:text-buildease-earth-400 bg-gradient-to-br from-buildease-orange-50/40 to-white/60 dark:from-buildease-orange-950/20 dark:to-gray-800/40 rounded-xl border border-dashed border-buildease-orange-300/60 dark:border-buildease-orange-700/60 backdrop-blur-sm">
                          <Package className="h-8 w-8 mx-auto mb-2 text-buildease-orange-400 dark:text-buildease-orange-500" />
                          <p className="font-medium">No materials added yet</p>
                          <p className="text-xs mt-1 text-buildease-earth-500 dark:text-buildease-earth-500">Click "Add Material" to get started</p>
                        </div>
                      )}
                    </div>
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
