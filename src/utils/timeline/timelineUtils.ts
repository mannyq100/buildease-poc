/**
 * Timeline Utilities for Gantt Chart Implementation
 * Handles date calculations, phase positioning, and timeline rendering logic
 */

export interface TimelinePhase {
  id: string;
  name: string;
  status: string;
  startDate: Date;
  endDate: Date;
  actualStart?: Date;
  actualEnd?: Date;
  progress: number;
  dependencies?: string[];
  color?: string;
  tasks?: Array<{
    id: string;
    title: string;
    status: string;
    due_date?: string;
  }>;
}

export interface Milestone {
  id: string;
  name: string;
  date: Date;
  type: 'project_start' | 'phase_completion' | 'deadline' | 'custom';
  description?: string;
  isCompleted?: boolean;
}

export interface TimelineScale {
  startDate: Date;
  endDate: Date;
  totalDays: number;
  pixelsPerDay: number;
  viewportWidth: number;
}

export interface TimelinePosition {
  x: number;
  width: number;
  row: number;
}

/**
 * Calculate the timeline scale based on project phases
 */
export function calculateTimelineScale(
  phases: TimelinePhase[], 
  viewportWidth: number,
  padding = 14 // days padding on each side
): TimelineScale {
  if (phases.length === 0) {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(now.getDate() + 30);
    
    return {
      startDate: now,
      endDate,
      totalDays: 30,
      pixelsPerDay: Math.max(viewportWidth / 30, 4),
      viewportWidth: Math.max(viewportWidth, 800)
    };
  }

  const allDates = phases.flatMap(phase => [
    phase.startDate,
    phase.endDate,
    phase.actualStart,
    phase.actualEnd
  ]).filter(Boolean) as Date[];

  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

  // Add padding
  const startDate = new Date(minDate);
  startDate.setDate(startDate.getDate() - padding);
  
  const endDate = new Date(maxDate);
  endDate.setDate(endDate.getDate() + padding);

  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Ensure minimum pixels per day for visibility
  const minPixelsPerDay = 4;
  const calculatedPixelsPerDay = viewportWidth / totalDays;
  const pixelsPerDay = Math.max(calculatedPixelsPerDay, minPixelsPerDay);
  
  // Adjust viewport width if needed
  const adjustedViewportWidth = Math.max(viewportWidth, totalDays * minPixelsPerDay);

  return {
    startDate,
    endDate,
    totalDays,
    pixelsPerDay,
    viewportWidth: adjustedViewportWidth
  };
}

/**
 * Calculate position for a phase in the timeline
 */
export function calculatePhasePosition(
  phase: TimelinePhase,
  scale: TimelineScale,
  row: number = 0
): TimelinePosition {
  const phaseStartTime = phase.startDate.getTime();
  const phaseEndTime = phase.endDate.getTime();
  const scaleStartTime = scale.startDate.getTime();
  
  const startDays = (phaseStartTime - scaleStartTime) / (1000 * 60 * 60 * 24);
  const durationDays = Math.max(1, (phaseEndTime - phaseStartTime) / (1000 * 60 * 60 * 24)); // Minimum 1 day
  
  const x = Math.max(0, startDays * scale.pixelsPerDay);
  const width = Math.max(40, durationDays * scale.pixelsPerDay); // Minimum 40px width for better visibility
  
  return { x, width, row };
}

/**
 * Generate time markers for the timeline
 */
export interface TimeMarker {
  date: Date;
  x: number;
  label: string;
  type: 'major' | 'minor';
}

export function generateTimeMarkers(scale: TimelineScale): TimeMarker[] {
  const markers: TimeMarker[] = [];
  const { startDate, endDate, pixelsPerDay } = scale;
  
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);
  
  while (current <= endDate) {
    const x = ((current.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) * pixelsPerDay;
    
    const isMonthStart = current.getDate() === 1;
    const isWeekStart = current.getDay() === 1; // Monday
    
    let type: 'major' | 'minor' = 'minor';
    let label = '';
    
    if (isMonthStart) {
      type = 'major';
      label = current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } else if (isWeekStart && pixelsPerDay > 5) {
      type = 'minor';
      label = current.toLocaleDateString('en-US', { day: 'numeric' });
    } else if (pixelsPerDay > 15) {
      type = 'minor';
      label = current.toLocaleDateString('en-US', { day: 'numeric' });
    }
    
    if (type === 'major' || (type === 'minor' && label)) {
      markers.push({ date: new Date(current), x, label, type });
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  return markers;
}

/**
 * Check if two phases overlap in time
 */
export function phasesOverlap(phase1: TimelinePhase, phase2: TimelinePhase): boolean {
  return phase1.startDate <= phase2.endDate && phase2.startDate <= phase1.endDate;
}

/**
 * Assign row positions to phases to avoid overlaps
 */
export function assignPhaseRows(phases: TimelinePhase[]): Map<string, number> {
  const rowAssignments = new Map<string, number>();
  const rowEndTimes: Date[] = [];
  
  // Sort phases by start date
  const sortedPhases = [...phases].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  
  for (const phase of sortedPhases) {
    let assignedRow = 0;
    
    // Find the first available row
    while (assignedRow < rowEndTimes.length && rowEndTimes[assignedRow] >= phase.startDate) {
      assignedRow++;
    }
    
    // Ensure we have enough rows
    while (rowEndTimes.length <= assignedRow) {
      rowEndTimes.push(new Date(0));
    }
    
    // Assign the phase to this row
    rowAssignments.set(phase.id, assignedRow);
    rowEndTimes[assignedRow] = phase.endDate;
  }
  
  return rowAssignments;
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(startDate: Date, endDate: Date): string {
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    if (remainingDays === 0) return `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
    return `${weeks}w ${remainingDays}d`;
  }
  
  const months = Math.floor(days / 30);
  const remainingDays = days % 30;
  if (remainingDays === 0) return `${months} ${months === 1 ? 'month' : 'months'}`;
  return `${months}m ${Math.floor(remainingDays / 7)}w`;
}

/**
 * Get today marker position
 */
export function getTodayMarkerPosition(scale: TimelineScale): number | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (today < scale.startDate || today > scale.endDate) {
    return null;
  }
  
  const daysSinceStart = (today.getTime() - scale.startDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceStart * scale.pixelsPerDay;
}

/**
 * Phase status color mapping
 */
export function getPhaseTimelineColor(status: string): { bg: string; border: string; text: string } {
  switch (status.toUpperCase()) {
    case 'COMPLETED':
      return {
        bg: 'bg-green-500',
        border: 'border-green-600',
        text: 'text-white'
      };
    case 'IN_PROGRESS':
      return {
        bg: 'bg-buildease-blue-500',
        border: 'border-buildease-blue-600', 
        text: 'text-white'
      };
    case 'PAUSED':
      return {
        bg: 'bg-yellow-500',
        border: 'border-yellow-600',
        text: 'text-white'
      };
    case 'PLANNING':
    default:
      return {
        bg: 'bg-slate-400',
        border: 'border-slate-500',
        text: 'text-white'
      };
  }
}

/**
 * Generate milestones from phases
 */
export function generateMilestones(phases: TimelinePhase[]): Milestone[] {
  const milestones: Milestone[] = [];
  
  // Add project start milestone
  if (phases.length > 0) {
    const earliestStart = new Date(Math.min(...phases.map(p => p.startDate.getTime())));
    milestones.push({
      id: 'project-start',
      name: 'Project Start',
      date: earliestStart,
      type: 'project_start',
      description: 'Project begins',
      isCompleted: true
    });
  }
  
  // Add phase completion milestones
  phases.forEach(phase => {
    if (phase.status === 'COMPLETED' || phase.actualEnd) {
      milestones.push({
        id: `${phase.id}-completion`,
        name: `${phase.name} Complete`,
        date: phase.actualEnd || phase.endDate,
        type: 'phase_completion',
        description: `${phase.name} phase completed`,
        isCompleted: phase.status === 'COMPLETED'
      });
    }
  });
  
  // Add critical deadlines (phases with important end dates)
  phases
    .filter(phase => phase.endDate && phase.status !== 'COMPLETED')
    .forEach(phase => {
      milestones.push({
        id: `${phase.id}-deadline`,
        name: `${phase.name} Due`,
        date: phase.endDate,
        type: 'deadline',
        description: `${phase.name} phase deadline`,
        isCompleted: false
      });
    });
  
  return milestones.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Calculate milestone position on timeline
 */
export function calculateMilestonePosition(
  milestone: Milestone,
  scale: TimelineScale
): { x: number; isVisible: boolean } {
  const milestoneTime = milestone.date.getTime();
  const scaleStartTime = scale.startDate.getTime();
  const scaleEndTime = scale.endDate.getTime();
  
  // Check if milestone is within visible range
  const isVisible = milestoneTime >= scaleStartTime && milestoneTime <= scaleEndTime;
  
  if (!isVisible) {
    return { x: -1, isVisible: false };
  }
  
  const daysSinceStart = (milestoneTime - scaleStartTime) / (1000 * 60 * 60 * 24);
  const x = daysSinceStart * scale.pixelsPerDay;
  
  return { x, isVisible: true };
}

/**
 * Get milestone display style
 */
export function getMilestoneStyle(milestone: Milestone): {
  color: string;
  bgColor: string;
  icon: string;
} {
  switch (milestone.type) {
    case 'project_start':
      return {
        color: 'text-buildease-blue-600',
        bgColor: 'bg-buildease-blue-100',
        icon: '🚀'
      };
    case 'phase_completion':
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        icon: '✅'
      };
    case 'deadline':
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: '⏰'
      };
    case 'custom':
    default:
      return {
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        icon: '📍'
      };
  }
}

/**
 * Dependency arrow interface
 */
export interface DependencyArrow {
  fromPhaseId: string;
  toPhaseId: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
}

/**
 * Calculate dependency arrows between phases
 */
export function calculateDependencyArrows(
  phases: TimelinePhase[],
  phasePositions: Map<string, TimelinePosition>,
  phaseRows: Map<string, number>,
  rowHeight: number,
  phaseBarHeight: number
): DependencyArrow[] {
  const arrows: DependencyArrow[] = [];
  
  phases.forEach(phase => {
    if (phase.dependencies && phase.dependencies.length > 0) {
      phase.dependencies.forEach(depId => {
        const dependentPhase = phases.find(p => p.id === depId);
        if (!dependentPhase) return;
        
        const fromPosition = phasePositions.get(depId);
        const toPosition = phasePositions.get(phase.id);
        const fromRow = phaseRows.get(depId);
        const toRow = phaseRows.get(phase.id);
        
        if (!fromPosition || !toPosition || fromRow === undefined || toRow === undefined) return;
        
        // Calculate arrow coordinates (finish-to-start dependency)
        const fromX = fromPosition.x + fromPosition.width;
        const fromY = fromRow * rowHeight + rowHeight / 2;
        const toX = toPosition.x;
        const toY = toRow * rowHeight + rowHeight / 2;
        
        arrows.push({
          fromPhaseId: depId,
          toPhaseId: phase.id,
          fromX,
          fromY,
          toX,
          toY,
          type: 'finish-to-start'
        });
      });
    }
  });
  
  return arrows;
}

/**
 * Generate SVG path for dependency arrow
 */
export function generateDependencyPath(arrow: DependencyArrow): string {
  const { fromX, fromY, toX, toY } = arrow;
  const midX = fromX + (toX - fromX) / 2;
  
  // Create a curved path for better visibility
  return `M ${fromX} ${fromY} 
          C ${midX} ${fromY}, ${midX} ${toY}, ${toX - 8} ${toY}
          L ${toX - 3} ${toY - 3}
          L ${toX} ${toY}
          L ${toX - 3} ${toY + 3}
          L ${toX - 8} ${toY}`;
}

/**
 * Calculate critical path through phases
 */
export function calculateCriticalPath(phases: TimelinePhase[]): string[] {
  // Simple critical path calculation based on longest duration path
  const phaseMap = new Map(phases.map(p => [p.id, p]));
  const visited = new Set<string>();
  const criticalPath: string[] = [];
  
  // Find phases with no dependencies (start points)
  const startPhases = phases.filter(p => !p.dependencies || p.dependencies.length === 0);
  
  // Calculate the longest path from each start phase
  let longestPath: string[] = [];
  let longestDuration = 0;
  
  function calculatePathDuration(path: string[]): number {
    return path.reduce((total, phaseId) => {
      const phase = phaseMap.get(phaseId);
      if (!phase) return total;
      const duration = (phase.endDate.getTime() - phase.startDate.getTime()) / (1000 * 60 * 60 * 24);
      return total + duration;
    }, 0);
  }
  
  function findLongestPath(phaseId: string, currentPath: string[]): void {
    if (visited.has(phaseId)) return;
    
    visited.add(phaseId);
    const newPath = [...currentPath, phaseId];
    
    // Find dependent phases
    const dependentPhases = phases.filter(p => 
      p.dependencies && p.dependencies.includes(phaseId)
    );
    
    if (dependentPhases.length === 0) {
      // End of path
      const duration = calculatePathDuration(newPath);
      if (duration > longestDuration) {
        longestDuration = duration;
        longestPath = [...newPath];
      }
    } else {
      dependentPhases.forEach(dep => {
        findLongestPath(dep.id, newPath);
      });
    }
    
    visited.delete(phaseId);
  }
  
  startPhases.forEach(phase => {
    findLongestPath(phase.id, []);
  });
  
  return longestPath;
}