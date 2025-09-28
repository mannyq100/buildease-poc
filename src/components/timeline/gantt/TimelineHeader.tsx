/**
 * TimelineHeader Component
 * The header row with time markers and today indicator
 */
import React from 'react';
import { cn } from '@/utils/core/ui';
import { TimeMarker, TimelineScale } from '@/utils/timeline/timelineUtils';

interface TimelineHeaderProps {
  timeMarkers: TimeMarker[];
  timelineScale: TimelineScale;
  todayPosition: number | null;
  phaseNameWidth: number;
  headerHeight: number;
  phasesCount: number;
}

export function TimelineHeader({
  timeMarkers,
  timelineScale,
  todayPosition,
  phaseNameWidth,
  headerHeight,
  phasesCount
}: TimelineHeaderProps) {
  return (
    <div 
      className="sticky top-0 z-20 bg-gradient-to-b from-slate-50 to-slate-100/80 border-b border-slate-300/60 flex shadow-sm"
      style={{ height: headerHeight }}
    >
      {/* Phase Names Header */}
      <div 
        className="flex-shrink-0 bg-gradient-to-r from-slate-100 to-slate-50 border-r border-slate-300/60 flex items-center justify-center shadow-sm"
        style={{ width: phaseNameWidth }}
      >
        <div className="text-center">
          <span className="text-sm font-bold text-slate-800">Project Phases</span>
          <div className="text-xs text-slate-500 mt-1">{phasesCount} total</div>
        </div>
      </div>
      
      {/* Timeline Scale Header */}
      <div className="flex-1 timeline-scroll overflow-x-auto">
        <div 
          className="relative h-full bg-gradient-to-b from-white/50 to-transparent"
          style={{ width: timelineScale.viewportWidth }}
        >
          {/* Enhanced Time Markers */}
          {timeMarkers.map((marker, index) => (
            <div
              key={index}
              className="absolute flex flex-col items-center justify-center h-full group"
              style={{ left: marker.x }}
            >
              <div className={cn(
                'text-xs font-semibold mb-2 px-2 py-1 rounded-md transition-colors',
                marker.type === 'major' 
                  ? 'text-slate-800 bg-white/80 shadow-sm' 
                  : 'text-slate-600 bg-slate-100/60'
              )}>
                {marker.label}
              </div>
              <div className={cn(
                'transition-all duration-200',
                marker.type === 'major' 
                  ? 'w-0.5 h-8 bg-slate-400 group-hover:bg-buildease-blue-500' 
                  : 'w-px h-4 bg-slate-300 group-hover:bg-slate-400'
              )} />
            </div>
          ))}
          
          {/* Enhanced Today Marker in Header */}
          {todayPosition && (
            <div
              className="absolute top-0 w-1 bg-gradient-to-b from-red-500 to-red-600 z-10 h-full rounded-full shadow-lg"
              style={{ left: todayPosition - 2 }}
            >
              <div className="absolute -top-1 -left-8 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-3 py-1.5 rounded-full shadow-lg font-semibold">
                Today
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}