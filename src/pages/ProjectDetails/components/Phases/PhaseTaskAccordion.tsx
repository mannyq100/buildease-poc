/**
 * PhaseTaskAccordion - Mobile-first construction phase management component
 * Optimized for construction site usage with large touch targets and high contrast
 * Performance optimized with React.memo and memoized functions
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  ChevronDown,
  ChevronUp,
  Edit3,
  Trash2,
  Plus,
  MoreVertical,
  CheckCircle2,
  Clock,
  Calendar,
  MessageCircle
} from 'lucide-react';
import { PhaseTaskAccordionProps } from '@/types/projectDetails';
import { formatTaskCount, getTaskStatusColor } from '@/utils/core/taskColors';

// Phase status colors - keep these separate as they're different from task status colors
const getPhaseStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'completed': return 'bg-green-600 text-white border-green-700';
    case 'in-progress': return 'bg-buildease-blue-600 text-white border-buildease-blue-700';
    case 'on-hold': return 'bg-amber-500 text-white border-amber-600';
    case 'planning': return 'bg-slate-500 text-white border-slate-600';
    default: return 'bg-slate-400 text-white border-slate-500';
  }
};

// Use centralized task color utility - removed duplicate

function PhaseTaskAccordionComponent({ 
  phase, 
  isExpanded, 
  onToggle, 
  onEdit, 
  onDelete, 
  onCreateTask, 
  onEditTask, 
  onDeleteTask 
}: PhaseTaskAccordionProps) {
  const [showTaskActions, setShowTaskActions] = useState<string | null>(null);

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-2 border-slate-200 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggle(phase.id)}
              className="h-10 w-10 p-0 rounded-lg hover:bg-slate-100 touch-manipulation"
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-slate-600" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-600" />
              )}
            </Button>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-lg font-semibold text-slate-900 truncate">
                  {phase.name}
                </CardTitle>
                <Badge className={`px-3 py-1 text-sm font-semibold rounded-lg border-2 ${getPhaseStatusColor(phase.status)}`}>
                  {phase.status}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{phase.startDate} - {phase.endDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{formatTaskCount(phase.completedTasks || 0, phase.totalTasks || 0)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Phase Actions - Construction workflow optimized */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 rounded-lg hover:bg-slate-100 touch-manipulation"
              >
                <MoreVertical className="h-5 w-5 text-slate-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem 
                onClick={() => onEdit(phase)}
                className="flex items-center gap-2 py-3 touch-manipulation"
              >
                <Edit3 className="h-4 w-4" />
                Edit Phase
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onCreateTask(phase.id)}
                className="flex items-center gap-2 py-3 touch-manipulation"
              >
                <Plus className="h-4 w-4" />
                Add Task
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(phase.id)}
                className="flex items-center gap-2 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 touch-manipulation"
              >
                <Trash2 className="h-4 w-4" />
                Delete Phase
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          {/* Phase Description */}
          {phase.description && (
            <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm text-slate-700 leading-relaxed">
                {phase.description}
              </p>
            </div>
          )}
          
          {/* Tasks List - Mobile-first construction task management */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold text-slate-900">
                Phase Tasks ({phase.tasks?.length || 0})
              </h4>
              <Button
                onClick={() => onCreateTask(phase.id)}
                size="sm"
                className="h-10 px-4 bg-buildease-orange-500 hover:bg-buildease-orange-600 text-white font-medium rounded-lg touch-manipulation"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
            
            {phase.tasks && phase.tasks.length > 0 ? (
              <div className="space-y-2">
                {phase.tasks.map((task: any) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-white border-2 border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        {task.status === 'completed' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : task.status === 'in-progress' ? (
                          <Clock className="h-5 w-5 text-buildease-blue-600" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-slate-300" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-slate-900 truncate">
                            {task.name}
                          </span>
                          <Badge className={`px-2 py-1 text-xs font-medium rounded border ${getTaskStatusColor(task.status)}`}>
                            {task.status}
                          </Badge>
                        </div>
                        
                        {task.description && (
                          <p className="text-sm text-slate-600 truncate">
                            {task.description}
                          </p>
                        )}
                        
                        {task.dueDate && (
                          <div className="flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3 text-slate-500" />
                            <span className="text-xs text-slate-500">
                              Due: {task.dueDate}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Task Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100 touch-manipulation"
                        >
                          <MoreVertical className="h-4 w-4 text-slate-600" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem 
                          onClick={() => onEditTask(task)}
                          className="flex items-center gap-2 py-2 touch-manipulation"
                        >
                          <Edit3 className="h-3 w-3" />
                          Edit Task
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            // Open task comments modal/dialog
                            // This will be implemented in next step
                            console.log('View comments for task:', task.id);
                          }}
                          className="flex items-center gap-2 py-2 touch-manipulation"
                        >
                          <MessageCircle className="h-3 w-3" />
                          View Comments
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onDeleteTask(task.id)}
                          className="flex items-center gap-2 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 touch-manipulation"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete Task
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 px-4 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                <Clock className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-600 mb-2">
                  No tasks in this phase yet
                </p>
                <p className="text-xs text-slate-500 mb-4">
                  Add tasks to track progress and manage work
                </p>
                <Button
                  onClick={() => onCreateTask(phase.id)}
                  size="sm"
                  className="h-10 px-4 bg-buildease-orange-500 hover:bg-buildease-orange-600 text-white font-medium rounded-lg touch-manipulation"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Task
                </Button>
              </div>
            )}
          </div>
          
          {/* Phase Progress Bar */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">
                Phase Progress
              </span>
              <span className="text-sm font-semibold text-buildease-blue-600">
                {Math.round(((phase.completedTasks || 0) / Math.max(phase.totalTasks || 1, 1)) * 100)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div 
                className="bg-buildease-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.round(((phase.completedTasks || 0) / Math.max(phase.totalTasks || 1, 1)) * 100)}%` 
                }}
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// Export memoized component with custom comparison
export const PhaseTaskAccordion = React.memo(PhaseTaskAccordionComponent, (prevProps, nextProps) => {
  return (
    prevProps.phase.id === nextProps.phase.id &&
    prevProps.phase.name === nextProps.phase.name &&
    prevProps.phase.status === nextProps.phase.status &&
    prevProps.phase.completedTasks === nextProps.phase.completedTasks &&
    prevProps.phase.totalTasks === nextProps.phase.totalTasks &&
    prevProps.isExpanded === nextProps.isExpanded &&
    prevProps.onToggle === nextProps.onToggle &&
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.onDelete === nextProps.onDelete &&
    prevProps.onCreateTask === nextProps.onCreateTask &&
    prevProps.onEditTask === nextProps.onEditTask &&
    prevProps.onDeleteTask === nextProps.onDeleteTask
  );
});
