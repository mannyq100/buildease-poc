/**
 * PhaseTasksSection - Task management component within phases
 * Mobile-optimized task list with add/edit/delete actions
 * Integrates with useTaskCRUD hook for task operations
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  Edit3,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { ProjectPhase, EnhancedTask } from '@/types/projectDetails';

interface PhaseTasksSectionProps {
  phase: ProjectPhase;
  tasks: EnhancedTask[];
  isLoading: boolean;
  onCreateTask: (phaseId: string) => void;
  onEditTask: (task: EnhancedTask, phaseId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

// Helper function for task status colors
function getTaskStatusColor(status: string): string {
  switch (status) {
    case 'COMPLETED':
      return 'text-green-600';
    case 'IN_PROGRESS':
      return 'text-buildease-blue-600';
    case 'PENDING':
      return 'text-orange-600';
    case 'BLOCKED':
      return 'text-red-600';
    case 'CANCELLED':
      return 'text-slate-500';
    default:
      return 'text-slate-600';
  }
}

// Helper function for priority badge styling
function getPriorityBadgeVariant(priority: string): 'destructive' | 'default' | 'secondary' {
  switch (priority) {
    case 'HIGH':
    case 'URGENT':
      return 'destructive';
    case 'MEDIUM':
      return 'default';
    case 'LOW':
    default:
      return 'secondary';
  }
}

export function PhaseTasksSection({
  phase,
  tasks,
  isLoading,
  onCreateTask,
  onEditTask,
  onDeleteTask
}: PhaseTasksSectionProps) {
  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-5 w-5 animate-spin text-buildease-blue-500" />
          <span className="ml-2 text-sm text-slate-600">Loading tasks...</span>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500">
        <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-slate-300" />
        <p className="text-sm">No tasks defined for this phase</p>
        <Button 
          size="sm" 
          className="mt-2 bg-buildease-blue-600 hover:bg-buildease-blue-700"
          onClick={() => onCreateTask(phase.id)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add First Task
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2">
      {tasks.map((task, index) => (
        <TaskCard
          key={task.id}
          task={task}
          index={index}
          onEdit={() => onEditTask(task, phase.id)}
          onDelete={() => onDeleteTask(task.id)}
        />
      ))}
      
      <div className="flex gap-2 pt-2 border-t border-slate-200/40">
        <Button 
          size="sm" 
          className="flex-1 bg-buildease-blue-600 hover:bg-buildease-blue-700"
          onClick={() => onCreateTask(phase.id)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
        <Button size="sm" variant="outline" className="flex-1">
          <RefreshCw className="h-4 w-4 mr-2" />
          Update Progress
        </Button>
      </div>
    </div>
  );
}

// Individual Task Card Component
interface TaskCardProps {
  task: EnhancedTask;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

function TaskCard({ task, index, onEdit, onDelete }: TaskCardProps) {
  return (
    <div
      className={`flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200/40 hover:bg-slate-50/50 transition-all duration-200 group shadow-sm hover:shadow-md min-h-[56px] ${
        index === 0 ? 'animate-in fade-in slide-in-from-left-2' : ''
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex-shrink-0">
          <CheckCircle2 
            className={`h-5 w-5 ${getTaskStatusColor(task.status)} ${
              task.status === 'COMPLETED' ? 'fill-current' : ''
            } transition-colors duration-200`} 
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <span className={`text-sm font-medium leading-5 ${
              task.status === 'COMPLETED' ? 'line-through text-slate-500' : 'text-slate-900'
            }`}>
              {task.title}
            </span>
            <div className="flex-shrink-0">
              <Badge 
                variant={getPriorityBadgeVariant(task.priority)} 
                className="text-xs"
              >
                {task.priority}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            {task.assigned_to && (
              <span className="bg-buildease-blue-100 text-buildease-blue-700 px-2 py-1 rounded-full font-medium">
                Assigned
              </span>
            )}
            {task.due_date && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(task.due_date).toLocaleDateString()}
              </span>
            )}
            {task.status && (
              <Badge 
                variant="outline" 
                className="text-xs bg-slate-50"
              >
                {task.status.replace('_', ' ').toLowerCase()}
              </Badge>
            )}
          </div>
          {task.description && (
            <p className="text-xs text-slate-600 mt-2 line-clamp-2">{task.description}</p>
          )}
        </div>
      </div>
      
      {/* Task Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Task
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={onDelete}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}