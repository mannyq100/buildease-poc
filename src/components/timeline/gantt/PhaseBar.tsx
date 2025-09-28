/**
 * PhaseBar Component
 * Individual phase bar in the timeline
 */
import React from 'react';
import { cn } from '@/utils/core/ui';
import { Calendar, Edit3 } from 'lucide-react';
import { 
  TimelinePhase, 
  TimelinePosition, 
  getPhaseTimelineColor,
  formatDuration 
} from '@/utils/timeline/timelineUtils';
import { ProjectPhase } from '@/types/projectDetails';

interface PhaseBarProps {
  phase: TimelinePhase;
  position: TimelinePosition;
  originalPhase: ProjectPhase;
  isOnCriticalPath: boolean;
  hoveredPhase: string | null;
  onPhaseClick?: (phase: ProjectPhase) => void;
  onPhaseEdit?: (phase: ProjectPhase) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  rowHeight: number;
  phaseBarHeight: number;
}

export function PhaseBar({
  phase,
  position,
  originalPhase,
  isOnCriticalPath,
  hoveredPhase,
  onPhaseClick,
  onPhaseEdit,
  onMouseEnter,
  onMouseLeave,
  rowHeight,
  phaseBarHeight
}: PhaseBarProps) {
  const colors = getPhaseTimelineColor(phase.status);

  return (
    <div
      className={cn(
        'absolute rounded-xl shadow-lg border-2 transition-all duration-300 cursor-pointer group',
        'hover:shadow-xl hover:-translate-y-0.5 hover:z-10',
        colors.bg,
        colors.border,
        isOnCriticalPath && 'ring-2 ring-red-400 ring-opacity-60',
        hoveredPhase === phase.id && 'z-20 shadow-2xl scale-105'
      )}
      style={{
        left: position.x,
        top: (rowHeight - phaseBarHeight) / 2,
        width: position.width,
        height: phaseBarHeight
      }}
      onClick={() => onPhaseClick?.(originalPhase)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Phase Content */}
      <div className="relative w-full h-full flex items-center justify-between px-3 py-2 overflow-hidden">
        {/* Left Content */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white text-sm leading-tight truncate drop-shadow-sm">
            {phase.name}
          </div>
          {phase.tasks && phase.tasks.length > 0 && (
            <div className="text-xs text-white/80 truncate mt-0.5">
              <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded font-medium">
                {phase.tasks.length}
              </span>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex-shrink-0 ml-2">
          {onPhaseEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPhaseEdit(originalPhase);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/20"
              title="Edit Phase"
            >
              <Edit3 className="h-3 w-3 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Enhanced Progress Bar */}
      {phase.progress > 0 && (
        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-black/20 rounded-b-xl">
          <div
            className="h-full bg-gradient-to-r from-white/80 to-white/60 rounded-b-xl transition-all duration-500 shadow-inner"
            style={{ width: `${phase.progress}%` }}
          />
        </div>
      )}

      {/* Status Corner Badge */}
      <div className="absolute top-1 right-1">
        {phase.status === 'COMPLETED' && (
          <div className="w-3 h-3 rounded-full bg-white/30 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
        )}
        {phase.status === 'IN_PROGRESS' && (
          <div className="w-3 h-3 rounded-full bg-white/30 animate-pulse" />
        )}
      </div>

      {/* Beautiful Enhanced Tooltip */}
      {hoveredPhase === phase.id && (
        <div className="absolute -top-28 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
          <div className="bg-white/95 backdrop-blur-sm text-slate-900 rounded-2xl shadow-2xl border border-slate-200/50 overflow-hidden max-w-xs">
            {/* Header */}
            <div className={cn(
              'px-4 py-3 text-white font-semibold text-sm',
              phase.status === 'COMPLETED' 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                : phase.status === 'IN_PROGRESS'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                : phase.status === 'PLANNING'
                ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                : 'bg-gradient-to-r from-slate-400 to-slate-500'
            )}>
              <div className="flex items-center justify-between">
                <span className="truncate">{phase.name}</span>
                {isOnCriticalPath && (
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full ml-2">
                    Critical
                  </span>
                )}
              </div>
            </div>
            
            {/* Content */}
            <div className="px-4 py-3 space-y-2">
              <div className="flex items-center text-sm text-slate-600">
                <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                <span className="font-medium">{formatDuration(phase.startDate, phase.endDate)}</span>
              </div>
              
              <div className="text-xs text-slate-500">
                {phase.startDate.toLocaleDateString()} → {phase.endDate.toLocaleDateString()}
              </div>
              
              {phase.progress > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Progress</span>
                  <span className="font-bold text-slate-900">{phase.progress}%</span>
                </div>
              )}
              
              {phase.tasks && phase.tasks.length > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Tasks</span>
                  <span className="font-bold text-slate-900">{phase.tasks.length}</span>
                </div>
              )}
              
              {phase.actualStart && (
                <div className="text-xs text-green-600 font-medium">
                  ✓ Started: {phase.actualStart.toLocaleDateString()}
                </div>
              )}
              
              {phase.actualEnd && (
                <div className="text-xs text-green-600 font-medium">
                  ✓ Completed: {phase.actualEnd.toLocaleDateString()}
                </div>
              )}
            </div>
            
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white/95" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}