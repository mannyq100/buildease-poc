import React, { useState, useMemo, useCallback } from 'react';
import { Phase } from '@/data/mock/generatedPlan/planData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash, Plus, Edit, Calendar, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion as m } from 'framer-motion';
import { getStatusColor, formatDate, getStatusText } from '@/utils/plan-helpers';

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
  onReorderPhase?: (phaseId: string, direction: 'up' | 'down') => void;
  onEditPhaseDates?: (phaseId: string) => void;
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
  onReorderPhase,
  onEditPhaseDates
}: PhaseCardProps) {
  const [tasksExpanded, setTasksExpanded] = useState(false);
  const [materialsExpanded, setMaterialsExpanded] = useState(false);
  
  // Memoized computed values
  const statusColorClass = useMemo(() => getStatusColor(phase.status), [phase.status]);
  const statusText = useMemo(() => getStatusText(phase.status), [phase.status]);
  const formattedStartDate = useMemo(() => formatDate(phase.startDate), [phase.startDate]);
  const formattedEndDate = useMemo(() => formatDate(phase.endDate), [phase.endDate]);
  
  // Memoized callback handlers
  const handleEditPhase = useCallback(() => {
    onEdit?.(phase.id);
  }, [onEdit, phase.id]);
  
  const handleDeletePhase = useCallback(() => {
    onDelete?.(phase.id);
  }, [onDelete, phase.id]);
  
  const handleEditPhaseDates = useCallback(() => {
    console.log('PhaseCard: handleEditPhaseDates called', { onEditPhaseDates: !!onEditPhaseDates, phaseId: phase.id });
    onEditPhaseDates?.(phase.id);
  }, [onEditPhaseDates, phase.id]);
  
  const handleAddTask = useCallback(() => {
    onAddTask?.(phase.id);
  }, [onAddTask, phase.id]);
  
  const handleAddMaterial = useCallback(() => {
    console.log('PhaseCard: handleAddMaterial called', { onAddMaterial: !!onAddMaterial, phaseId: phase.id });
    onAddMaterial?.(phase.id);
  }, [onAddMaterial, phase.id]);
  
  const handleToggleTasks = useCallback(() => {
    setTasksExpanded(prev => !prev);
  }, []);
  
  const handleToggleMaterials = useCallback(() => {
    setMaterialsExpanded(prev => !prev);
  }, []);
  
  // Memoized task and material handlers
  const createTaskEditHandler = useCallback((taskId: string) => () => {
    onEditTask?.(phase.id, taskId);
  }, [onEditTask, phase.id]);
  
  const createTaskDeleteHandler = useCallback((taskId: string) => () => {
    onDeleteTask?.(phase.id, taskId);
  }, [onDeleteTask, phase.id]);
  
  const createMaterialEditHandler = useCallback((materialId: string) => () => {
    onEditMaterial?.(phase.id, materialId);
  }, [onEditMaterial, phase.id]);
  
  const createMaterialDeleteHandler = useCallback((materialId: string) => () => {
    onDeleteMaterial?.(phase.id, materialId);
  }, [onDeleteMaterial, phase.id]);
  
  // Using shared utility functions from @/utils/plan-helpers

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-4"
    >
      <Card className="border border-gray-200 hover:border-gray-300 dark:border-gray-800 shadow-sm hover:shadow-md overflow-hidden rounded-lg bg-white dark:bg-gray-800/20 transition-all duration-300">
        <CardContent className="p-0">
          <div className="flex flex-col">
            {/* Phase Header */}
            <div className="p-5 bg-gradient-to-r from-blue-50 to-white dark:from-blue-950/20 dark:to-gray-800/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-[#2B6CB0] dark:text-[#93C5FD] font-semibold text-lg">
                    Phase {phase.order}: {phase.name}
                  </h3>
                  <Badge className={statusColorClass}>
                    {statusText}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {onEditPhaseDates && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 p-1 text-gray-500 hover:text-[#2B6CB0] hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-1"
                      onClick={handleEditPhaseDates}
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="text-xs">Dates</span>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-500 hover:text-[#2B6CB0] hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    onClick={handleEditPhase}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={handleDeletePhase}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-4 bg-white/70 dark:bg-gray-800/30 p-3 rounded-md border border-gray-100 dark:border-gray-700">
                {phase.description}
              </div>
              
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <div className="flex items-center bg-blue-50 dark:bg-blue-900/20 p-1.5 px-3 rounded-full">
                  <Calendar className="h-3.5 w-3.5 mr-2 text-[#2B6CB0]" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Duration: {phase.duration}</span>
                </div>
                
                <div className="flex items-center bg-gray-50 dark:bg-gray-800/40 p-1.5 px-3 rounded-full">
                  <Clock className="h-3.5 w-3.5 mr-2 text-gray-500" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {phase.startDate && phase.endDate ? 
                      `${formattedStartDate} - ${formattedEndDate}` : 
                      'Dates not set'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Tasks Section */}
            <div className="border-t border-gray-200 dark:border-gray-700">
              <div 
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors duration-200"
                onClick={handleToggleTasks}
              >
                <div className="flex items-center gap-1">
                  {tasksExpanded ? 
                    <ChevronDown className="h-4 w-4 text-[#2B6CB0]" /> : 
                    <ChevronRight className="h-4 w-4 text-[#2B6CB0]" />}
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                    Tasks ({phase.tasks.length})
                  </h4>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs border-[#2B6CB0] text-[#2B6CB0] hover:bg-blue-50 dark:text-[#93C5FD] dark:border-blue-700 dark:hover:bg-blue-900/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddTask();
                  }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Task
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
                        <div key={task.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-sm">
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700 dark:text-gray-300">{task.name}</span>
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
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 p-1.5 bg-white dark:bg-gray-700/30 rounded border border-gray-200 dark:border-gray-700 inline-block">
                              Assigned to: {task.assignedTo}
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {phase.tasks.length === 0 && (
                        <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                          No tasks added yet
                        </div>
                      )}
                    </div>
                  </m.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Materials Section */}
            <div className="border-t border-gray-200 dark:border-gray-700">
              <div 
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors duration-200"
                onClick={() => setMaterialsExpanded(!materialsExpanded)}
              >
                <div className="flex items-center gap-1">
                  {materialsExpanded ? 
                    <ChevronDown className="h-4 w-4 text-[#2B6CB0]" /> : 
                    <ChevronRight className="h-4 w-4 text-[#2B6CB0]" />}
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                    Materials ({phase.materials.length})
                  </h4>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs border-[#2B6CB0] text-[#2B6CB0] hover:bg-blue-50 dark:text-[#93C5FD] dark:border-blue-700 dark:hover:bg-blue-900/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddMaterial?.(phase.id);
                  }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Material
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
                        <div key={material.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-sm">
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700 dark:text-gray-300">{material.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full text-xs">
                                ${material.totalPrice.toLocaleString()}
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
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center">
                            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded mr-2">{material.quantity} {material.unit}</span> × 
                            <span className="ml-1 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">${material.unitPrice} each</span>
                          </div>
                        </div>
                      ))}
                      
                      {phase.materials.length === 0 && (
                        <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                          No materials added yet
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
