/**
 * Sortable Phase Card Component
 * Wraps PhaseCard with drag-and-drop functionality using @dnd-kit
 * Provides visual feedback and accessibility for phase reordering
 */

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PhaseCard } from './PhaseCard';
import { Phase } from '@/data/mock/generatedPlan/planData';
import { LoadingState } from '@/hooks/usePlanLoading';
import { GripVertical } from 'lucide-react';

interface SortablePhaseCardProps {
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
  isDragDisabled?: boolean;
}

export const SortablePhaseCard = React.memo(function SortablePhaseCard({
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
  loadingState,
  isDragDisabled = false
}: SortablePhaseCardProps) {
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
  const cardClasses = `
    relative transition-all duration-200
    ${isDragging ? 'shadow-xl scale-105' : ''}
    ${isOver && !isDragging ? 'ring-2 ring-buildease-orange-400 ring-opacity-50' : ''}
  `;

  return (
    <div ref={setNodeRef} style={style} className={cardClasses}>
      {/* Mobile-optimized drag handle */}
      {!isDragDisabled && (
        <div 
          className="absolute left-2 top-4 z-10 opacity-50 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 touch-manipulation"
          {...attributes}
          {...listeners}
        >
          <div className="flex items-center justify-center w-10 h-10 sm:w-8 sm:h-8 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 shadow-sm cursor-grab active:cursor-grabbing hover:bg-gray-50 dark:hover:bg-gray-700 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0">
            <GripVertical className="h-5 w-5 sm:h-4 sm:w-4 text-gray-500 dark:text-gray-400" />
          </div>
        </div>
      )}
      
      {/* Phase Card with increased left padding when drag is enabled */}
      <div className={`group ${!isDragDisabled ? 'pl-12 sm:pl-12' : ''}`}>
        <PhaseCard
          phase={phase}
          onDelete={onDelete}
          onEdit={onEdit}
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
    </div>
  );
});

export default SortablePhaseCard;