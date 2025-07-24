/**
 * PhaseTimelineCard - Individual phase timeline display component
 * Mobile-first design for construction phase management
 * Displays phase information with collapsible task sections
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePhaseTasks } from '@/hooks/queries/useTask';
import { PhaseTasksSection } from './PhaseTasksSection';
import { 
  Calendar,
  Plus,
  ChevronDown,
  Edit3,
  Trash2
} from 'lucide-react';
import { ProjectPhase } from '@/types/projectDetails';

interface PhaseTimelineCardProps {
  phases: ProjectPhase[];
  expandedPhases: Record<string, boolean>;
  onTogglePhase: (phaseId: string) => void;
  onEditPhase: (phase: ProjectPhase) => void;
  onDeletePhase: (phaseId: string) => void;
  onCreateTask: (phaseId: string) => void;
  onEditTask: (task: any, phaseId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenCreateModal: (type: 'phase') => void;
  isExpanded: boolean;
  onToggleSection: () => void;
}

// Helper function for phase status colors
function getPhaseStatusColor(status: string): string {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'IN_PROGRESS': 
      return 'bg-buildease-blue-100 text-buildease-blue-700 border-buildease-blue-200';
    case 'PLANNING':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'ON_HOLD':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'CANCELLED':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export function PhaseTimelineCard({
  phases,
  expandedPhases,
  onTogglePhase,
  onEditPhase,
  onDeletePhase,
  onCreateTask,
  onEditTask,
  onDeleteTask,
  onOpenCreateModal,
  isExpanded,
  onToggleSection
}: PhaseTimelineCardProps) {
  return (
    <Card className="border-buildease-orange-200/60 shadow-xl bg-gradient-to-br from-buildease-orange-50/30 to-white backdrop-blur-md rounded-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={onToggleSection}
            className="flex items-center gap-2 hover:text-buildease-orange-600 transition-colors"
          >
            <Calendar className="h-5 w-5 text-buildease-orange-600" />
            <CardTitle className="text-lg font-bold text-slate-900">
              Timeline & Phases
            </CardTitle>
            <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`} />
          </button>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              onClick={() => onOpenCreateModal('phase')}
              className="bg-buildease-orange-600 hover:bg-buildease-orange-700 text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Phase
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          {phases && phases.length > 0 ? (
            phases.map((phase) => (
              <PhaseCard
                key={phase.id}
                phase={phase}
                isExpanded={expandedPhases[phase.id] || false}
                onToggle={() => onTogglePhase(phase.id)}
                onEdit={() => onEditPhase(phase)}
                onDelete={() => onDeletePhase(phase.id)}
                onCreateTask={onCreateTask}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
              />
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-medium text-slate-700 mb-2">No Phases Defined</h3>
            <p className="text-sm mb-4">Start building your project timeline by adding phases</p>
            <Button 
              onClick={() => onOpenCreateModal('phase')}
              className="bg-buildease-orange-600 hover:bg-buildease-orange-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Phase
            </Button>
          </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// Individual Phase Card Component
interface PhaseCardProps {
  phase: ProjectPhase;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCreateTask: (phaseId: string) => void;
  onEditTask: (task: any, phaseId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

function PhaseCard({
  phase,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onCreateTask,
  onEditTask,
  onDeleteTask
}: PhaseCardProps) {
  const { data: tasks = [], isLoading: tasksLoading } = usePhaseTasks(phase.id);
  
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="bg-slate-50/50 rounded-xl border border-slate-200/60 overflow-hidden transition-all duration-300 hover:shadow-md group">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-100/50 transition-colors duration-200 min-h-[44px]"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4 flex-1">
          <div className={`w-3 h-3 rounded-full ${
            phase.status === 'COMPLETED' ? 'bg-green-500' :
            phase.status === 'IN_PROGRESS' ? 'bg-buildease-blue-500' :
            phase.status === 'ON_HOLD' ? 'bg-amber-500' :
            phase.status === 'CANCELLED' ? 'bg-red-500' :
            'bg-slate-400'
          }`} />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-slate-900">{phase.name}</h4>
              <div className="flex items-center gap-2">
                <Badge className={`px-2 py-1 rounded-full text-xs font-medium border ${getPhaseStatusColor(phase.status)}`}>
                  {phase.status.replace('_', ' ')}
                </Badge>
                {totalTasks > 0 && (
                  <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded-full">
                    {completedTasks}/{totalTasks} tasks
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
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-buildease-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
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
            tasks={tasks}
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