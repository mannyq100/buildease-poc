/**
 * Sortable Timeline Phase Component
 * Wraps timeline phase items with drag-and-drop functionality
 * Maintains timeline visual integrity during reordering
 */

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion as m } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Clock, Edit, Plus, CalendarDays, CheckCircle, Circle, AlertCircle, Pause, GripVertical } from 'lucide-react';
import { getTimelineStatusColor, getTimelineTextColor, getStatusText } from '@/utils/plan-helpers';
import { Phase } from '@/data/mock/generatedPlan/planData';

interface SortableTimelinePhaseProps {
  phase: Phase;
  index: number;
  onEditPhase?: (phaseId: string) => void;
  onAddTask?: (phaseId: string) => void;
  onEditTask?: (phaseId: string, taskId: string) => void;
  onEditDates?: (phaseId: string) => void;
  isDragDisabled?: boolean;
}

// Status icon selector
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return CheckCircle;
    case 'in-progress':
      return Circle;
    case 'delayed':
      return AlertCircle;
    case 'on-hold':
      return Pause;
    default:
      return Circle;
  }
};

export const SortableTimelinePhase = React.memo(function SortableTimelinePhase({
  phase,
  index,
  onEditPhase,
  onAddTask,
  onEditTask,
  onEditDates,
  isDragDisabled = false
}: SortableTimelinePhaseProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver
  } = useSortable({
    id: phase.id,
    disabled: isDragDisabled
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto'
  };

  // Enhanced visual feedback for drag states
  const containerClasses = `
    flex relative transition-all duration-200
    ${isDragging ? 'scale-105' : ''}
    ${isOver && !isDragging ? 'ring-2 ring-slate-400 ring-opacity-50 rounded-lg' : ''}
  `;

  const handleEditPhase = () => onEditPhase?.(phase.id.toString());
  const handleEditTask = (phaseId: string, taskId: string) => onEditTask?.(phaseId, taskId);
  const handleEditDates = () => onEditDates?.(phase.id.toString());
  const handleAddTask = () => onAddTask?.(phase.id.toString());

  return (
    <m.div 
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={containerClasses}
    >
      <div className="flex-shrink-0 relative">
        {/* Mobile-optimized drag handle for Timeline Bubble */}
        {!isDragDisabled && (
          <div 
            className="absolute -left-8 sm:-left-6 top-1/2 transform -translate-y-1/2 opacity-50 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 z-20 touch-manipulation"
            {...attributes}
            {...listeners}
          >
            <div className="flex items-center justify-center w-8 h-8 sm:w-6 sm:h-6 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 shadow-sm cursor-grab active:cursor-grabbing hover:bg-gray-50 dark:hover:bg-gray-700 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0">
              <GripVertical className="h-4 w-4 sm:h-3 sm:w-3 text-gray-500 dark:text-gray-400" />
            </div>
          </div>
        )}
        
        {/* Timeline Bubble */}
        <div className="h-16 w-16 rounded-full bg-white dark:bg-gray-800 border-4 border-slate-200 dark:border-slate-600 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center relative z-10 group">
          <div className="flex flex-col items-center">
            <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{phase.order}</span>
            {React.createElement(getStatusIcon(phase.status), {
              className: "h-4 w-4 text-slate-600 dark:text-slate-400 mt-0.5"
            })}
          </div>
        </div>
      </div>
      
      <div className="ml-6 mt-1 w-full group">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center mb-1">
                {phase.name}
                <span className="ml-3 px-3 py-1 text-xs font-medium rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200">
                  {getStatusText(phase.status)}
                </span>
              </h3>
            </div>
            <div className="flex space-x-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleEditPhase}
                className="h-11 px-4 sm:h-8 sm:px-3"
              >
                <Edit className="h-4 w-4 sm:h-3.5 sm:w-3.5 mr-1" />
                <span className="hidden sm:inline text-xs">Edit</span>
              </Button>
            </div>
          </div>
          <p className="text-sm text-secondary dark:text-muted-foreground mb-4 leading-relaxed">{phase.description}</p>
          
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="flex items-center bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-lg">
              <Clock className="h-4 w-4 mr-2 text-slate-600 dark:text-slate-400" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{phase.duration}</span>
            </div>
            {phase.startDate && phase.endDate && (
              <div className="flex items-center bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-lg group cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200" onClick={handleEditDates}>
                <CalendarDays className="h-4 w-4 mr-2 text-slate-600 dark:text-slate-400" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {new Date(phase.startDate).toLocaleDateString()} - {new Date(phase.endDate).toLocaleDateString()}
                </span>
              </div>
            )}
            <div className="flex items-center bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg">
              <CheckCircle className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{phase.tasks.filter(t => t.status === 'completed').length}/{phase.tasks.length} tasks</span>
            </div>
          </div>

          {/* Enhanced Tasks preview */}
          {phase.tasks.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-slate-600 dark:text-slate-400" />
                  Phase Tasks ({phase.tasks.length})
                </h4>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddTask}
                  className="h-11 px-4 sm:h-7 sm:px-3 text-xs"
                >
                  <Plus className="h-4 w-4 sm:h-3 sm:w-3 mr-1" />
                  <span className="hidden sm:inline">Add Task</span>
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {phase.tasks.slice(0, 6).map(task => (
                  <div
                    key={task.id} 
                    className="text-xs px-3 py-2 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-all duration-200 border group"
                    onClick={() => handleEditTask(phase.id.toString(), task.id.toString())}
                  >
                    <span className="font-medium truncate flex-1">{task.name}</span>
                    <div className="flex items-center gap-1 ml-2">
                      <span className={`w-2 h-2 rounded-full ${
                        task.status === 'completed' ? 'bg-green-500' :
                        task.status === 'in-progress' ? 'bg-blue-500' :
                        'bg-gray-400'
                      }`}></span>
                      <Edit className="h-3 w-3 opacity-0 group-hover:opacity-70 transition-opacity duration-200" />
                    </div>
                  </div>
                ))}
                {phase.tasks.length > 6 && (
                  <div className="text-xs px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg flex items-center justify-center border border-dashed">
                    +{phase.tasks.length - 6} more tasks
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </m.div>
  );
});

export default SortableTimelinePhase;