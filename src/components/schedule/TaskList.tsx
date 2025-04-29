import React, { useMemo } from 'react';
import { Task, TaskViewLayout } from '@/types/schedule';
import { TaskCard } from '@/components/shared/TaskCard';
import { EmptyState } from '@/components/EmptyState';
import { sortTasks } from '@/utils/scheduleUtils';
import { formatDate } from '@/utils/dateUtils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getTaskStatusColor, getTaskPriorityColor } from '@/utils/scheduleUtils';

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  sortBy?: 'title' | 'project' | 'phase' | 'startDate' | 'dueDate' | 'status' | 'priority' | 'completion';
  sortDirection?: 'asc' | 'desc';
  emptyStateMessage?: string;
  viewLayout?: TaskViewLayout;
  isLoading?: boolean;
}

export const TaskList = ({
  tasks,
  onTaskClick,
  sortBy = 'dueDate',
  sortDirection = 'asc',
  emptyStateMessage = 'No tasks found',
  viewLayout = 'grid',
  isLoading,
}: TaskListProps) => {
  // Use useMemo to prevent unnecessary re-sorting
  const sortedTasks = useMemo(() => {
    return sortTasks(tasks, sortBy, sortDirection);
  }, [tasks, sortBy, sortDirection]);

  if (isLoading) {
    return (
      <EmptyState
        title="Loading..."
        description="Please wait while we load your tasks"
        icon="calendar"
      />
    );
  }

  if (sortedTasks.length === 0) {
    return (
      <EmptyState
        title="No tasks"
        description={emptyStateMessage}
        icon="calendar"
      />
    );
  }

  if (viewLayout === 'list') {
    return (
      <div className="overflow-hidden border rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left">Task</th>
                <th className="px-4 py-3 text-left">Project / Phase</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Priority</th>
                <th className="px-4 py-3 text-left">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedTasks.map(task => {
                // Memoize status and priority colors to prevent recalculation
                const statusColor = getTaskStatusColor(task.status);
                const priorityColor = getTaskPriorityColor(task.priority);
                
                return (
                  <tr 
                    key={task.id} 
                    className="bg-card hover:bg-muted/50 cursor-pointer"
                    onClick={() => onTaskClick(task)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{task.title}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {task.description}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{task.project}</div>
                      <div className="text-xs text-muted-foreground">{task.phase}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-muted-foreground">Start: {formatDate(task.startDate)}</div>
                      <div>Due: {formatDate(task.dueDate)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`bg-${statusColor}-500`}>
                        {task.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`text-${priorityColor}-500 border-${priorityColor}-500`}>
                        {task.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Progress value={task.completion} className="h-2 w-20" />
                        <span className="text-xs">{task.completion}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Grid layout (default)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedTasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onClick={onTaskClick}
        />
      ))}
    </div>
  );
};