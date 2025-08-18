/**
 * TimelineSection - Clean timeline section for project details
 * Prioritizes List View with optional Gantt View
 * Mobile-first design with BuildEase styling
 */

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3,
  List,
  Eye,
  EyeOff
} from 'lucide-react';
import { GanttChart } from '@/components/timeline/GanttChart';
import { PhaseTimelineCard } from '../Phases/PhaseTimelineCard';
import { ProjectPhase, TeamMember } from '@/types/projectDetails';
import { cn } from '@/utils/core/ui';

interface TimelineSectionProps {
  phases: ProjectPhase[];
  teamMembers: TeamMember[];
  projectId: string;
  onAddPhase?: () => void;
  onEditPhase: (phase: ProjectPhase) => void;
  onDeletePhase?: (phaseId: string) => void;
  onCreateTask: (phaseId: string) => void;
  onEditTask?: (task: any, phaseId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  className?: string;
}

type ViewMode = 'list' | 'gantt';

export function TimelineSection({
  phases,
  teamMembers,
  projectId,
  onAddPhase,
  onEditPhase,
  onDeletePhase,
  onCreateTask,
  onEditTask,
  onDeleteTask,
  className
}: TimelineSectionProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showCompleted, setShowCompleted] = useState(true);

  // Filter phases based on visibility settings
  const filteredPhases = React.useMemo(() => {
    if (showCompleted) return phases;
    return phases.filter(phase => phase.status !== 'COMPLETED');
  }, [phases, showCompleted]);


  const handlePhaseClick = (phase: ProjectPhase) => {
    // For now, just edit the phase when clicked
    onEditPhase(phase);
  };


  return (
    <div className={cn('space-y-4', className)}>
      <Card>
        <CardContent className="p-4">
          {/* Simple View Controls */}
          <div className="flex items-center justify-between mb-4">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
              <TabsList className="grid w-full grid-cols-2 sm:w-auto">
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">List View</span>
                  <span className="sm:hidden">List</span>
                </TabsTrigger>
                <TabsTrigger value="gantt" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Gantt View</span>
                  <span className="sm:hidden">Chart</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center gap-2"
            >
              {showCompleted ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {showCompleted ? 'Hide' : 'Show'} Completed
              </span>
            </Button>
          </div>

          {/* Timeline Views */}
          {viewMode === 'list' ? (
            <PhaseTimelineCard
              phases={filteredPhases}
              teamMembers={teamMembers}
              projectId={projectId}
              onAddPhase={onAddPhase}
              onEditPhase={onEditPhase}
              onDeletePhase={onDeletePhase}
              onCreateTask={onCreateTask}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
            />
          ) : (
            <GanttChart
              phases={filteredPhases}
              onPhaseClick={handlePhaseClick}
              onPhaseEdit={onEditPhase}
              onAddPhase={onAddPhase}
              height={400}
              showMiniMap={false}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}