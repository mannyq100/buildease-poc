/**
 * PhaseNameRow Component
 * The left column showing phase names and status
 */
import React from 'react';
import { cn } from '@/utils/core/ui';
import { Edit3 } from 'lucide-react';
import { 
  TimelinePhase, 
  getPhaseTimelineColor 
} from '@/utils/timeline/timelineUtils';
import { ProjectPhase } from '@/types/projectDetails';

interface PhaseNameRowProps {
  phase: TimelinePhase;
  originalPhase: ProjectPhase;
  index: number;
  rowHeight: number;
  onPhaseClick?: (phase: ProjectPhase) => void;
  onPhaseEdit?: (phase: ProjectPhase) => void;
}

export function PhaseNameRow({
  phase,
  originalPhase,
  index,
  rowHeight,
  onPhaseClick,
  onPhaseEdit
}: PhaseNameRowProps) {
  const colors = getPhaseTimelineColor(phase.status);
  const isEvenRow = index % 2 === 0;

  return (
    <div
      className={cn(
        'flex items-center px-4 border-b border-slate-200/40 cursor-pointer group transition-all duration-200',
        'hover:bg-gradient-to-r hover:from-buildease-blue-50 hover:to-white hover:shadow-sm',
        isEvenRow ? 'bg-white/60' : 'bg-slate-50/40'
      )}
      style={{ height: rowHeight }}
      onClick={() => onPhaseClick?.(originalPhase)}
    >
      {/* Enhanced Status Indicator */}
      <div 
        className={cn('w-3 h-3 rounded-full mr-3 shadow-sm transition-all', colors.bg)}
      >
        {phase.status === 'COMPLETED' && (
          <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
            <div className="w-1 h-1 bg-white rounded-full" />
          </div>
        )}
        {phase.status === 'IN_PROGRESS' && (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-full animate-pulse" />
        )}
        {phase.status === 'PLANNING' && (
          <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 rounded-full" />
        )}
        {!['COMPLETED', 'IN_PROGRESS', 'PLANNING'].includes(phase.status) && (
          <div className="w-full h-full bg-gradient-to-br from-slate-300 to-slate-400 rounded-full" />
        )}
      </div>
      
      {/* Phase Details */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-slate-900 text-sm leading-tight truncate group-hover:text-buildease-blue-700 transition-colors">
          {phase.name}
        </div>
        <div className="flex items-center mt-1 space-x-3">
          <span className={cn(
            'text-xs px-2 py-0.5 rounded-full font-medium capitalize transition-colors',
            colors.text,
            colors.bg.replace('bg-', 'bg-').replace('-500', '-100')
          )}>
            {phase.status?.toLowerCase().replace('_', ' ')}
          </span>
          
          {phase.progress > 0 && (
            <div className="flex items-center">
              <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-buildease-blue-500 to-buildease-blue-600 transition-all duration-500"
                  style={{ width: `${phase.progress}%` }}
                />
              </div>
              <span className="text-xs text-slate-600 ml-2 font-medium">{phase.progress}%</span>
            </div>
          )}
          
          {phase.tasks && phase.tasks.length > 0 && (
            <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              {phase.tasks.length} task{phase.tasks.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
      
      {/* Action Button */}
      {onPhaseEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPhaseEdit(originalPhase);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-buildease-blue-100 ml-2"
          title="Edit Phase"
        >
          <Edit3 className="h-4 w-4 text-buildease-blue-600" />
        </button>
      )}
    </div>
  );
}