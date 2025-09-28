/**
 * GanttMiniMap Component
 * Overview miniature map showing all phases
 */
import React from 'react';
import { cn } from '@/utils/core/ui';
import { 
  TimelinePhase, 
  TimelinePosition,
  TimelineScale,
  getPhaseTimelineColor 
} from '@/utils/timeline/timelineUtils';

interface GanttMiniMapProps {
  timelinePhases: TimelinePhase[];
  phasePositions: Map<string, TimelinePosition>;
  timelineScale: TimelineScale;
}

export function GanttMiniMap({
  timelinePhases,
  phasePositions,
  timelineScale
}: GanttMiniMapProps) {
  if (timelinePhases.length === 0) return null;

  return (
    <div className="absolute bottom-0 right-0 w-48 h-16 bg-white border border-slate-200 rounded-tl-lg m-2 overflow-hidden">
      <div className="relative w-full h-full">
        <div className="text-xs text-slate-600 p-1 bg-slate-50 border-b">
          Overview
        </div>
        <div className="relative w-full h-10 bg-slate-50">
          {timelinePhases.map(phase => {
            const position = phasePositions.get(phase.id);
            if (!position) return null;
            
            const miniScale = 180 / timelineScale.viewportWidth;
            const colors = getPhaseTimelineColor(phase.status);
            
            return (
              <div
                key={phase.id}
                className={cn('absolute h-2 rounded-sm', colors.bg)}
                style={{
                  left: position.x * miniScale,
                  top: position.row * 8 + 4,
                  width: Math.max(2, position.width * miniScale)
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}