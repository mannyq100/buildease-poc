/**
 * TodaysFocusCard - Today's focus section for current phase tasks
 * Extracted from ProjectDetailsContent.tsx for better organization
 * Mobile-first responsive design with task management functionality
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared';
import { 
  Plus,
  RefreshCw,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { formatTaskCount, getTaskPriorityColor, getTaskStatusIconColor } from '@/utils/core/taskColors';

interface TaskItem {
  id: string;
  title: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  due_date?: string;
  phase_id?: string;
}

interface Phase {
  id: string;
  name: string;
  status: string;
}

interface TodaysFocusCardProps {
  tasks?: TaskItem[];
  phases?: any[]; // Add phases to map phase_id to phase names
  currentPhase?: Phase;
  currentTasks?: TaskItem[];
  onCreateTask?: (phaseId: string) => void;
  onEditTask?: (task: any, phaseId: string) => void;
  onAddTask?: () => void;
  onUpdateTasks?: () => void;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}

// Helper functions for task display
const getStatusVariant = (status: TaskItem['status']) => {
  switch (status) {
    case 'COMPLETED':
      return 'success';
    case 'IN_PROGRESS':
      return 'warning';
    case 'BLOCKED':
      return 'destructive';
    case 'CANCELLED':
      return 'secondary';
    default:
      return 'default';
  }
};

// Use centralized color utility - removed duplicate function

export function TodaysFocusCard({ 
  tasks = [],
  phases = [],
  currentPhase, 
  currentTasks = [],
  onCreateTask,
  onEditTask,
  onAddTask,
  onUpdateTasks,
  isExpanded = true,
  onToggleExpanded
}: TodaysFocusCardProps) {
  // Helper function to get phase name by phase_id
  const getPhaseName = (phaseId: string): string => {
    const phase = phases.find(p => p.id === phaseId);
    return phase ? phase.name : 'Unknown Phase';
  };
  // Use tasks prop if provided, otherwise fall back to currentTasks
  const allTasks = tasks && tasks.length > 0 ? tasks : currentTasks;
  
  // Filter out completed and cancelled tasks - Today's Focus should only show active tasks
  // Handle both uppercase and lowercase status values for robustness
  const displayTasks = allTasks.filter(task => {
    const status = task.status?.toUpperCase();
    return status !== 'COMPLETED' && status !== 'CANCELLED';
  });
  
  const completedTasks = allTasks.filter(task => 
    task.status?.toUpperCase() === 'COMPLETED'
  );
  
  // Show a collapsed preview if not expanded
  if (!isExpanded) {
    return (
      <Card className="border-slate-200/40 shadow-xl bg-gradient-to-br from-white via-slate-50/30 to-buildease-blue-50/20 backdrop-blur-md rounded-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <button 
              onClick={onToggleExpanded}
              className="flex items-center gap-2 hover:text-emerald-600 transition-colors flex-1 text-left"
            >
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <CardTitle className="text-lg font-bold text-slate-900">
                Today's Focus
              </CardTitle>
              <ChevronDown className="h-4 w-4 text-slate-500 ml-auto" />
            </button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-slate-600">
              {formatTaskCount(completedTasks.length, allTasks.length)}
            </p>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
              {Math.round((completedTasks.length / Math.max(allTasks.length, 1)) * 100)}% Done
            </Badge>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200/40 shadow-xl bg-gradient-to-br from-white via-slate-50/30 to-buildease-blue-50/20 backdrop-blur-md rounded-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={onToggleExpanded}
            className="flex items-center gap-2 hover:text-emerald-600 transition-colors flex-1 text-left"
          >
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">
                Today's Focus
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">Priority tasks from all phases</p>
            </div>
            <ChevronUp className="h-4 w-4 text-slate-500 ml-auto" />
          </button>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            {formatTaskCount(completedTasks.length, allTasks.length)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayTasks.length > 0 ? (
          displayTasks.map((task: TaskItem) => (
            <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/40 hover:bg-slate-50/50 transition-all duration-200">
              <button className="flex-shrink-0">
                <CheckCircle2 className={`h-5 w-5 transition-colors ${
                  task.status?.toUpperCase() === 'COMPLETED' ? getTaskStatusIconColor('COMPLETED') : 'text-slate-400 hover:text-buildease-blue-500'
                }`} />
              </button>
              <div className="flex-1 min-w-0">
                <span className={`block text-sm font-medium truncate ${
                  task.status?.toUpperCase() === 'COMPLETED' ? 'line-through text-slate-500' : 'text-slate-900'
                }`}>
                  {task.title}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  {task.phase_id && (
                    <Badge 
                      variant="outline" 
                      className="text-xs bg-buildease-blue-50 text-buildease-blue-700 border-buildease-blue-200"
                    >
                      {getPhaseName(task.phase_id)}
                    </Badge>
                  )}
                  {task.priority && task.priority !== 'LOW' && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getTaskPriorityColor(task.priority)}`}
                    >
                      {task.priority}
                    </Badge>
                  )}
                </div>
              </div>
              <StatusBadge status={task.status.toLowerCase()} size="sm" variant="outline" />
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-slate-500">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-medium mb-1">No priority tasks found</p>
            <p className="text-xs text-slate-400">High-priority tasks from all phases will appear here</p>
          </div>
        )}
        
        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            className="flex-1 bg-buildease-blue-600 hover:bg-buildease-blue-700"
            onClick={onAddTask || (() => onCreateTask?.(currentPhase?.id || ''))}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={onUpdateTasks}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Update
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}