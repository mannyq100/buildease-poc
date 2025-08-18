/**
 * GanttChart - Enhanced visual timeline component for project phases
 * Beautiful, intuitive Gantt chart with improved aesthetics and usability
 * Mobile-first design with clear visual hierarchy
 */

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { cn } from '@/utils/core/ui';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Calendar, 
  ZoomIn, 
  ZoomOut,
  Maximize2,
  Edit3,
  Plus
} from 'lucide-react';
import {
  TimelinePhase,
  TimelineScale,
  TimelinePosition,
  calculateTimelineScale,
  calculatePhasePosition,
  generateTimeMarkers,
  assignPhaseRows,
  formatDuration,
  getTodayMarkerPosition,
  getPhaseTimelineColor,
  generateMilestones,
  calculateMilestonePosition,
  getMilestoneStyle,
  calculateDependencyArrows,
  generateDependencyPath,
  calculateCriticalPath
} from '@/utils/timeline/timelineUtils';
import { ProjectPhase } from '@/types/projectDetails';

interface GanttChartProps {
  phases: ProjectPhase[];
  onPhaseClick?: (phase: ProjectPhase) => void;
  onPhaseEdit?: (phase: ProjectPhase) => void;
  onAddPhase?: () => void;
  className?: string;
  height?: number;
  showMiniMap?: boolean;
}

const ROW_HEIGHT = 64;
const HEADER_HEIGHT = 90;
const PHASE_BAR_HEIGHT = 42;
const MINIMAP_HEIGHT = 80;
const PHASE_NAME_WIDTH = 240;

export function GanttChart({
  phases,
  onPhaseClick,
  onPhaseEdit,
  onAddPhase,
  className,
  height = 400,
  showMiniMap = true
}: GanttChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(800);
  const [zoom, setZoom] = useState(1);
  const [scrollX, setScrollX] = useState(0);
  const [hoveredPhase, setHoveredPhase] = useState<string | null>(null);

  // Convert ProjectPhase to TimelinePhase with progress calculation
  const timelinePhases = useMemo((): TimelinePhase[] => {
    return phases.map(phase => {
      // Calculate progress from tasks if available
      const phaseTasks = phase.tasks || [];
      const completedTasks = phaseTasks.filter(task => 
        task.status?.toUpperCase() === 'COMPLETED'
      ).length;
      const totalTasks = phaseTasks.length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        id: phase.id,
        name: phase.name,
        status: phase.status,
        startDate: new Date(phase.timeline?.planned_start || new Date()),
        endDate: new Date(phase.timeline?.planned_end || new Date()),
        actualStart: phase.timeline?.actual_start ? new Date(phase.timeline.actual_start) : undefined,
        actualEnd: phase.timeline?.actual_end ? new Date(phase.timeline.actual_end) : undefined,
        progress,
        dependencies: phase.dependencies || [],
        tasks: phaseTasks
      };
    });
  }, [phases]);

  // Update viewport width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        // Account for phase name column + padding
        setViewportWidth(containerRef.current.clientWidth - PHASE_NAME_WIDTH - 40);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Calculate timeline scale with zoom
  const timelineScale = useMemo((): TimelineScale => {
    return calculateTimelineScale(timelinePhases, viewportWidth * zoom);
  }, [timelinePhases, viewportWidth, zoom]);

  // Assign rows to phases to avoid overlaps
  const phaseRows = useMemo(() => {
    return assignPhaseRows(timelinePhases);
  }, [timelinePhases]);

  // Calculate positions for all phases
  const phasePositions = useMemo(() => {
    const positions = new Map<string, TimelinePosition>();
    timelinePhases.forEach(phase => {
      const row = phaseRows.get(phase.id) || 0;
      const position = calculatePhasePosition(phase, timelineScale, row);
      positions.set(phase.id, position);
    });
    return positions;
  }, [timelinePhases, phaseRows, timelineScale]);

  // Generate time markers
  const timeMarkers = useMemo(() => {
    return generateTimeMarkers(timelineScale);
  }, [timelineScale]);

  // Generate milestones
  const milestones = useMemo(() => {
    return generateMilestones(timelinePhases);
  }, [timelinePhases]);

  // Calculate milestone positions
  const milestonePositions = useMemo(() => {
    return milestones
      .map(milestone => ({
        milestone,
        position: calculateMilestonePosition(milestone, timelineScale)
      }))
      .filter(({ position }) => position.isVisible);
  }, [milestones, timelineScale]);

  // Calculate dependency arrows
  const dependencyArrows = useMemo(() => {
    return calculateDependencyArrows(
      timelinePhases,
      phasePositions,
      phaseRows,
      ROW_HEIGHT,
      PHASE_BAR_HEIGHT
    );
  }, [timelinePhases, phasePositions, phaseRows]);

  // Calculate critical path
  const criticalPath = useMemo(() => {
    return calculateCriticalPath(timelinePhases);
  }, [timelinePhases]);

  // Calculate chart dimensions
  const maxRow = Math.max(...Array.from(phaseRows.values()), 0);
  const chartHeight = Math.max((maxRow + 1) * ROW_HEIGHT + HEADER_HEIGHT, height);
  const todayPosition = getTodayMarkerPosition(timelineScale);

  // Enhanced zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.5, 5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.5, 0.25));
  const handleResetZoom = () => setZoom(1);
  const handleZoomToFit = () => {
    // Calculate zoom to fit all phases in viewport
    if (timelinePhases.length > 0) {
      const totalDays = timelineScale.totalDays;
      const idealZoom = viewportWidth / (totalDays * 4); // 4px per day minimum
      setZoom(Math.max(Math.min(idealZoom, 5), 0.25));
    }
  };

  // Scroll to today
  const scrollToToday = () => {
    if (todayPosition && containerRef.current) {
      const scrollContainer = containerRef.current.querySelector('.timeline-scroll');
      if (scrollContainer) {
        scrollContainer.scrollLeft = Math.max(0, todayPosition - viewportWidth / 2);
      }
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when timeline is focused or no input is focused
      if (e.target && (e.target as HTMLElement).tagName === 'INPUT') return;
      
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '+':
          case '=':
            e.preventDefault();
            handleZoomIn();
            break;
          case '-':
            e.preventDefault();
            handleZoomOut();
            break;
          case '0':
            e.preventDefault();
            handleResetZoom();
            break;
          case 'f':
            e.preventDefault();
            handleZoomToFit();
            break;
          case 't':
            e.preventDefault();
            scrollToToday();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleZoomIn, handleZoomOut, handleResetZoom, handleZoomToFit, scrollToToday]);

  return (
    <Card className={cn('overflow-hidden shadow-lg border-0', className)}>
      {/* Simplified Header */}
      <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/60 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-buildease-blue-500/10 text-buildease-blue-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Timeline View</h3>
              <p className="text-sm text-slate-500">Visual project schedule</p>
            </div>
          </div>
          
          {/* Enhanced Timeline Controls */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleZoomOut}
                className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100"
                title="Zoom Out (Ctrl + -)"
              >
                <ZoomOut className="h-3.5 w-3.5 text-slate-600" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleZoomToFit}
                className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100"
                title="Fit to View (Ctrl + F)"
              >
                <Maximize2 className="h-3.5 w-3.5 text-slate-600" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleZoomIn}
                className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100"
                title="Zoom In (Ctrl + +)"
              >
                <ZoomIn className="h-3.5 w-3.5 text-slate-600" />
              </Button>
            </div>
            
            <Button
              size="sm"
              variant="outline"
              onClick={scrollToToday}
              className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm"
            >
              <span className="hidden sm:inline">Today</span>
              <span className="sm:hidden">📅</span>
            </Button>
            
            {onAddPhase && (
              <Button
                size="sm"
                onClick={onAddPhase}
                className="bg-gradient-to-r from-buildease-blue-600 to-buildease-blue-700 hover:from-buildease-blue-700 hover:to-buildease-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Add Phase</span>
                <span className="sm:hidden">Add</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div 
          ref={containerRef}
          className="relative"
          style={{ height: chartHeight }}
        >
          {/* Enhanced Timeline Header */}
          <div 
            className="sticky top-0 z-20 bg-gradient-to-b from-slate-50 to-slate-100/80 border-b border-slate-300/60 flex shadow-sm"
            style={{ height: HEADER_HEIGHT }}
          >
            {/* Phase Names Header */}
            <div 
              className="flex-shrink-0 bg-gradient-to-r from-slate-100 to-slate-50 border-r border-slate-300/60 flex items-center justify-center shadow-sm"
              style={{ width: PHASE_NAME_WIDTH }}
            >
              <div className="text-center">
                <span className="text-sm font-bold text-slate-800">Project Phases</span>
                <div className="text-xs text-slate-500 mt-1">{timelinePhases.length} total</div>
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

          {/* Phase Rows */}
          <div className="flex">
            {/* Enhanced Phase Names Column */}
            <div 
              className="flex-shrink-0 bg-gradient-to-b from-slate-50 to-slate-100/50 border-r border-slate-300/60 flex flex-col shadow-inner"
              style={{ width: PHASE_NAME_WIDTH }}
            >
              {timelinePhases.map((phase, index) => {
                const position = phasePositions.get(phase.id);
                if (!position) return null;

                const colors = getPhaseTimelineColor(phase.status);
                const originalPhase = phases.find(p => p.id === phase.id);
                const isEvenRow = index % 2 === 0;
                
                return (
                  <div
                    key={`name-${phase.id}`}
                    className={cn(
                      'flex items-center px-4 border-b border-slate-200/40 cursor-pointer group transition-all duration-200',
                      'hover:bg-gradient-to-r hover:from-buildease-blue-50 hover:to-white hover:shadow-sm',
                      isEvenRow ? 'bg-white/60' : 'bg-slate-50/40'
                    )}
                    style={{ height: ROW_HEIGHT }}
                    onClick={() => originalPhase && onPhaseClick?.(originalPhase)}
                  >
                    {/* Enhanced Status Indicator */}
                    <div className="flex items-center mr-3">
                      <div className={cn(
                        'w-4 h-4 rounded-full border-2 border-white shadow-sm transition-all duration-200',
                        colors.bg,
                        'group-hover:scale-110'
                      )}>
                        {phase.status === 'COMPLETED' && (
                          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                          </div>
                        )}
                        {phase.status === 'IN_PROGRESS' && (
                          <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-500 animate-pulse" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate group-hover:text-buildease-blue-700 transition-colors">
                        {phase.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full font-medium',
                          phase.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          phase.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                          phase.status === 'PLANNING' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-600'
                        )}>
                          {phase.status.toLowerCase().replace('_', ' ')}
                        </span>
                        {phase.progress > 0 && (
                          <span className="text-xs text-slate-500 font-medium">
                            {phase.progress}%
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {onPhaseEdit && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 w-8 h-8 p-0 rounded-lg hover:bg-buildease-blue-100 transition-all duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          originalPhase && onPhaseEdit(originalPhase);
                        }}
                      >
                        <Edit3 className="h-3.5 w-3.5 text-buildease-blue-600" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Enhanced Timeline Chart Area */}
            <div className="flex-1 timeline-scroll overflow-x-auto overflow-y-hidden bg-gradient-to-br from-white via-slate-50/30 to-slate-100/20">
              <div 
                className="relative"
                style={{ 
                  width: timelineScale.viewportWidth,
                  height: Math.max(timelinePhases.length * ROW_HEIGHT, 300)
                }}
              >
                {/* Enhanced Grid Lines */}
                {timeMarkers
                  .filter(m => m.type === 'major')
                  .map((marker, index) => (
                    <div
                      key={index}
                      className="absolute top-0 w-px bg-gradient-to-b from-slate-300/80 to-slate-200/40"
                      style={{ 
                        left: marker.x,
                        height: '100%'
                      }}
                    />
                  ))}

                {/* Enhanced Row Separators */}
                {timelinePhases.map((_, index) => {
                  const isEvenRow = index % 2 === 0;
                  return (
                    <div
                      key={`row-${index}`}
                      className={cn(
                        'absolute left-0 w-full',
                        isEvenRow ? 'bg-white/40' : 'bg-slate-50/60'
                      )}
                      style={{ 
                        top: index * ROW_HEIGHT,
                        height: ROW_HEIGHT
                      }}
                    />
                  );
                })}

                {/* Enhanced Today Line */}
                {todayPosition && (
                  <div
                    className="absolute top-0 w-1 bg-gradient-to-b from-red-500/80 to-red-400/60 z-20 rounded-full shadow-lg"
                    style={{ 
                      left: todayPosition - 2,
                      height: '100%'
                    }}
                  >
                    <div className="absolute inset-0 w-1 bg-gradient-to-b from-red-400/30 to-transparent rounded-full animate-pulse" />
                  </div>
                )}

                {/* Milestones */}
                {milestonePositions.map(({ milestone, position }) => {
                  const style = getMilestoneStyle(milestone);
                  return (
                    <div
                      key={milestone.id}
                      className="absolute top-0 z-30 group"
                      style={{ left: position.x }}
                    >
                      {/* Milestone line */}
                      <div 
                        className={cn(
                          'w-0.5 h-full transition-all duration-200',
                          milestone.isCompleted ? 'bg-green-500' : 'bg-red-400',
                          'group-hover:w-1'
                        )}
                      />
                      
                      {/* Milestone marker */}
                      <div 
                        className={cn(
                          'absolute -top-2 -left-3 w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs transition-all duration-200',
                          style.bgColor,
                          style.color,
                          'group-hover:scale-110 cursor-pointer'
                        )}
                        title={milestone.description}
                      >
                        <span className="text-xs">{style.icon}</span>
                      </div>
                      
                      {/* Milestone tooltip */}
                      <div className="absolute -top-16 -left-12 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        <div className={cn(
                          'px-3 py-2 rounded-lg shadow-xl text-xs whitespace-nowrap',
                          style.bgColor,
                          style.color,
                          'border border-current/20'
                        )}>
                          <div className="font-semibold">{milestone.name}</div>
                          <div className="text-xs opacity-75">
                            {milestone.date.toLocaleDateString()}
                          </div>
                          {milestone.description && (
                            <div className="text-xs opacity-60 mt-1">
                              {milestone.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Dependency Arrows */}
                {dependencyArrows.length > 0 && (
                  <svg
                    className="absolute inset-0 pointer-events-none z-15"
                    style={{ width: '100%', height: '100%' }}
                  >
                    {dependencyArrows.map((arrow, index) => (
                      <path
                        key={`${arrow.fromPhaseId}-${arrow.toPhaseId}-${index}`}
                        d={generateDependencyPath(arrow)}
                        fill="none"
                        stroke="#64748b"
                        strokeWidth="2"
                        strokeDasharray="4,4"
                        className="opacity-60 hover:opacity-100 transition-opacity"
                        markerEnd="url(#arrowhead)"
                      />
                    ))}
                    
                    {/* Arrow marker definition */}
                    <defs>
                      <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="7"
                        refX="9"
                        refY="3.5"
                        orient="auto"
                      >
                        <polygon
                          points="0 0, 10 3.5, 0 7"
                          fill="#64748b"
                        />
                      </marker>
                    </defs>
                  </svg>
                )}

                {/* Enhanced Phase Bars */}
                {timelinePhases.map((phase, phaseIndex) => {
                  const position = phasePositions.get(phase.id);
                  if (!position) return null;

                  const colors = getPhaseTimelineColor(phase.status);
                  const originalPhase = phases.find(p => p.id === phase.id);
                  const isOnCriticalPath = criticalPath.includes(phase.id);
                  const isEvenRow = phaseIndex % 2 === 0;
                  
                  return (
                    <div
                      key={phase.id}
                      className={cn(
                        'absolute cursor-pointer group transition-all duration-300',
                        'hover:z-30',
                        isOnCriticalPath && 'z-20'
                      )}
                      style={{
                        left: position.x,
                        top: phaseIndex * ROW_HEIGHT + (ROW_HEIGHT - PHASE_BAR_HEIGHT) / 2,
                        width: Math.max(position.width, 80), // Increased minimum width
                        height: PHASE_BAR_HEIGHT
                      }}
                      onClick={() => originalPhase && onPhaseClick?.(originalPhase)}
                      onMouseEnter={() => setHoveredPhase(phase.id)}
                      onMouseLeave={() => setHoveredPhase(null)}
                    >
                      {/* Critical Path Glow */}
                      {isOnCriticalPath && (
                        <div className="absolute -inset-2 bg-orange-400/20 rounded-xl blur-sm animate-pulse" />
                      )}
                      
                      {/* Phase Bar */}
                      <div
                        className={cn(
                          'h-full rounded-xl relative overflow-hidden transition-all duration-300 shadow-md',
                          'border border-white/50 backdrop-blur-sm',
                          'group-hover:shadow-xl group-hover:scale-105 group-hover:-translate-y-1',
                          phase.status === 'COMPLETED' 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                            : phase.status === 'IN_PROGRESS'
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                            : phase.status === 'PLANNING'
                            ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                            : 'bg-gradient-to-r from-slate-400 to-slate-500 text-white',
                          isOnCriticalPath && 'ring-2 ring-orange-400/60 ring-offset-1'
                        )}
                      >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer" />
                        
                        {/* Progress Background */}
                        {phase.progress > 0 && (
                          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/20 to-white/10 rounded-xl">
                            <div
                              className="h-full bg-gradient-to-r from-white/30 to-white/20 rounded-xl transition-all duration-500"
                              style={{ width: `${phase.progress}%` }}
                            />
                          </div>
                        )}

                        {/* Phase Content */}
                        <div className="relative flex items-center h-full px-4 z-10">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold truncate drop-shadow-sm">
                              {position.width > 100 ? phase.name : phase.name.split(' ')[0]}
                            </div>
                            {/* Progress and duration info */}
                            {position.width > 140 && (
                              <div className="flex items-center gap-2 mt-0.5">
                                {phase.progress > 0 && (
                                  <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                                    {phase.progress}%
                                  </span>
                                )}
                                <span className="text-xs opacity-90">
                                  {formatDuration(phase.startDate, phase.endDate)}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Enhanced Status Indicators */}
                          <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                            {isOnCriticalPath && (
                              <div className="flex items-center">
                                <div className="w-2 h-2 rounded-full bg-orange-300 animate-ping absolute" />
                                <div className="w-2 h-2 rounded-full bg-orange-400" />
                              </div>
                            )}
                            {phase.actualStart && phase.actualEnd && (
                              <div className="w-3 h-3 rounded-full bg-green-300 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                              </div>
                            )}
                            {phase.tasks && phase.tasks.length > 0 && position.width > 160 && (
                              <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded font-medium">
                                {phase.tasks.length}
                              </span>
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
                })}

                {/* Empty State */}
                {timelinePhases.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-slate-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                      <p className="text-lg font-medium mb-2">No phases to display</p>
                      <p className="text-sm mb-4">Add phases to see your project timeline</p>
                      {onAddPhase && (
                        <Button onClick={onAddPhase} className="bg-buildease-blue-600 hover:bg-buildease-blue-700">
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Phase
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mini Map */}
          {showMiniMap && timelinePhases.length > 0 && (
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
          )}
        </div>
      </div>
    </Card>
  );
}