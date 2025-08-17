/**
 * PhaseTimelineCard - Individual phase timeline display component
 * Mobile-first design for construction phase management
 * Displays phase information with collapsible task sections
 */

import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProCard } from '@/components/ui/ProCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePhaseTasks } from '@/hooks/queries/useTask';
import { PhaseTasksSection } from './PhaseTasksSection';
import { 
  Calendar,
  Plus,
  ChevronDown,
  ChevronUp,
  Edit3,
  Trash2
} from 'lucide-react';
import React from 'react';
import { ProjectPhase, EnhancedTask, TeamMember } from '@/types/projectDetails';
import { formatTaskCount } from '@/utils/core/taskColors';
import { getPhaseBadgeColor, getPhaseDotColor, formatPhaseStatusLabel } from '@/utils/core/phaseStatus';

interface PhaseTimelineCardProps {
  phases: ProjectPhase[];
  teamMembers: TeamMember[];
  projectId: string;
  onAddPhase?: () => void;
  onEditPhase: (phase: ProjectPhase) => void;
  onDeletePhase?: (phaseId: string) => void;
  onCreateTask: (phaseId: string) => void;
  onEditTask?: (task: EnhancedTask, phaseId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  className?: string;
}

export const PhaseTimelineCard = React.memo(PhaseTimelineCardBase);

// Phase status colors are centralized in utils/core/phaseStatus

function PhaseTimelineCardBase({
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
}: PhaseTimelineCardProps) {
  const [expandedPhases, setExpandedPhases] = React.useState<Record<string, boolean>>({});
  const [showAllPhases, setShowAllPhases] = React.useState(false);
  
  // Show only first 3 phases initially, unless "show more" is clicked
  const INITIAL_PHASE_LIMIT = 3;
  const displayedPhases = showAllPhases ? phases : phases.slice(0, INITIAL_PHASE_LIMIT);
  const hasMorePhases = phases.length > INITIAL_PHASE_LIMIT;
  return (
    <ProCard accent="orange" className={`${className || ''}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-buildease-orange-600" />
            <CardTitle className="text-lg font-bold text-slate-900">
              Timeline & Phases
            </CardTitle>
          </div>
          <Button 
            size="sm" 
            onClick={onAddPhase}
            className="bg-buildease-orange-600 hover:bg-buildease-orange-700 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Phase
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {phases && phases.length > 0 ? (
          <>
            {displayedPhases.map((phase) => (
              <PhaseCard
                key={phase.id}
                phase={phase}
                teamMembers={teamMembers}
                projectId={projectId}
                isExpanded={expandedPhases[phase.id] || false}
                onToggle={() => setExpandedPhases(prev => ({ ...prev, [phase.id]: !prev[phase.id] }))}
                onEdit={() => onEditPhase(phase)}
                onDelete={() => onDeletePhase?.(phase.id)}
                onCreateTask={onCreateTask}
                onEditTask={onEditTask ?? (() => {})}
                onDeleteTask={onDeleteTask ?? (() => {})}
              />
            ))}
            
            {/* Show More/Show Less Button */}
            {hasMorePhases && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllPhases(!showAllPhases)}
                  className="text-buildease-orange-600 hover:text-buildease-orange-700 hover:bg-buildease-orange-50"
                >
                  {showAllPhases ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Show More ({phases.length - INITIAL_PHASE_LIMIT} more phases)
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-medium mb-2">No Phases Defined</p>
            <p className="text-sm mb-4">Start building your project timeline by adding phases</p>
            <Button 
              onClick={onAddPhase}
              className="bg-buildease-orange-600 hover:bg-buildease-orange-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Phase
            </Button>
          </div>
        )}
      </CardContent>
    </ProCard>
  );
}

// Individual Phase Card Component
interface PhaseCardProps {
  phase: ProjectPhase;
  teamMembers: TeamMember[];
  projectId: string;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCreateTask: (phaseId: string) => void;
  onEditTask: (task: EnhancedTask, phaseId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

function PhaseCard({
  phase,
  teamMembers,
  projectId,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onCreateTask,
  onEditTask,
  onDeleteTask
}: PhaseCardProps) {
  const { data: tasks = [], isLoading: tasksLoading } = usePhaseTasks(phase.id);
  
  const completedTasks = tasks.filter(t => t.status?.toUpperCase() === 'COMPLETED').length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  // Animate progress bar on expand and data changes
  const [animatedWidth, setAnimatedWidth] = React.useState(0);
  React.useEffect(() => {
    const target = totalTasks > 0 ? progressPercentage : 0;
    const id = requestAnimationFrame(() => setAnimatedWidth(target));
    return () => cancelAnimationFrame(id);
  }, [progressPercentage, totalTasks]);

  return (
    <div className="bg-slate-50/50 rounded-xl border border-slate-200/60 overflow-hidden transition-all duration-300 hover:shadow-md group">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-100/50 transition-colors duration-200 min-h-[44px]"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4 flex-1">
          <div className={`w-3 h-3 rounded-full ${getPhaseDotColor(phase.status)}`} />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-slate-900">{phase.name}</h4>
              <div className="flex items-center gap-2">
                <Badge className={`px-2 py-1 rounded-full text-xs font-medium border ${getPhaseBadgeColor(phase.status)}`}>
                  {formatPhaseStatusLabel(phase.status)}
                </Badge>
                {totalTasks > 0 && (
                  <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded-full">
                    {formatTaskCount(completedTasks, totalTasks)}
                  </span>
                )}
              </div>
            </div>
            {phase.description && (
              <p className="text-sm text-slate-600">{phase.description}</p>
            )}
            {phase.timeline?.planned_start && phase.timeline?.planned_end && (
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(phase.timeline.planned_start).toLocaleDateString()} - {new Date(phase.timeline.planned_end).toLocaleDateString()}
              </div>
            )}
            {/* Progress bar */}
            {totalTasks > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-600">Progress</span>
                  <span className="text-xs font-medium text-buildease-blue-600">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-buildease-blue-600 h-2 rounded-full transition-[width] duration-700 ease-out will-change-[width] shadow-[0_0_6px_rgba(37,99,235,0.35)]"
                    style={{ width: `${animatedWidth}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="h-8 w-8 p-0 hover:bg-buildease-orange-100 hover:text-buildease-orange-700 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit3 className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-slate-200/60 bg-white/50 animate-in slide-in-from-top-2 duration-300">
          <PhaseTasksSection
            phase={phase}
            tasks={tasks as unknown as EnhancedTask[]}
            teamMembers={teamMembers}
            projectId={projectId}
            isLoading={tasksLoading}
            onCreateTask={onCreateTask}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
          />
        </div>
      )}
    </div>
  );
}