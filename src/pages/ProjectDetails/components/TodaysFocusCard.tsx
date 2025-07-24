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
  CheckCircle2
} from 'lucide-react';

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
  currentPhase?: Phase;
  currentTasks?: TaskItem[];
  onAddTask?: () => void;
  onUpdateTasks?: () => void;
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

const getPriorityColor = (priority: TaskItem['priority']) => {
  switch (priority) {
    case 'URGENT':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'HIGH':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'MEDIUM':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'LOW':
      return 'text-green-600 bg-green-50 border-green-200';
    default:
      return 'text-slate-600 bg-slate-50 border-slate-200';
  }
};

export function TodaysFocusCard({ 
  currentPhase, 
  currentTasks = [],
  onAddTask,
  onUpdateTasks
}: TodaysFocusCardProps) {
  if (!currentPhase) {
    return null;
  }

  const completedTasks = currentTasks.filter(task => task.status === 'COMPLETED');

  return (
    <Card className="border-slate-200/40 shadow-xl bg-gradient-to-br from-white via-slate-50/30 to-buildease-blue-50/20 backdrop-blur-md rounded-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Today's Focus
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">{currentPhase.name}</p>
          </div>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            {completedTasks.length}/{currentTasks.length} Done
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {currentTasks.length > 0 ? (
          currentTasks.map((task: TaskItem) => (
            <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/40 hover:bg-slate-50/50 transition-all duration-200">
              <button className="flex-shrink-0">
                <CheckCircle2 className={`h-5 w-5 transition-colors ${
                  task.status === 'COMPLETED' ? 'text-emerald-600' : 'text-slate-400 hover:text-buildease-blue-500'
                }`} />
              </button>
              <div className="flex-1 min-w-0">
                <span className={`block text-sm font-medium truncate ${
                  task.status === 'COMPLETED' ? 'line-through text-slate-500' : 'text-slate-900'
                }`}>
                  {task.title}
                </span>
                {task.priority && task.priority !== 'LOW' && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs mt-1 ${getPriorityColor(task.priority)}`}
                  >
                    {task.priority}
                  </Badge>
                )}
              </div>
              <StatusBadge status={task.status.toLowerCase()} size="sm" variant="outline" />
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-slate-500">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-medium mb-1">No tasks requiring attention</p>
            <p className="text-xs text-slate-400">Create tasks in project phases to see them here</p>
          </div>
        )}
        
        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            className="flex-1 bg-buildease-blue-600 hover:bg-buildease-blue-700"
            onClick={onAddTask}
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