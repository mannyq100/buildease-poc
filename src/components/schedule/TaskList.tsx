import { Task } from '@/types/schedule';
import { TaskCard } from './TaskCard';
import { EmptyState } from '@/components/EmptyState';
import { sortTasks } from '@/utils/scheduleUtils';

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  sortBy?: 'title' | 'project' | 'phase' | 'startDate' | 'dueDate' | 'status' | 'priority' | 'completion';
  sortDirection?: 'asc' | 'desc';
  emptyStateMessage?: string;
}

export const TaskList = ({
  tasks,
  onTaskClick,
  sortBy = 'dueDate',
  sortDirection = 'asc',
  emptyStateMessage = 'No tasks found'
}: TaskListProps) => {
  const sortedTasks = sortTasks(tasks, sortBy, sortDirection);

  if (sortedTasks.length === 0) {
    return (
      <EmptyState
        title="No tasks"
        description={emptyStateMessage}
        icon="calendar"
      />
    );
  }

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