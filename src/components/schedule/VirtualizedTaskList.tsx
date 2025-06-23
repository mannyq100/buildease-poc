/**
 * VirtualizedTaskList Component
 * High-performance list for large task datasets using react-window
 * Supports both table and grid layouts with smooth scrolling
 */

import React, { useMemo, useCallback } from 'react';
import { FixedSizeList as List, FixedSizeGrid as Grid } from 'react-window';
import { Task, TaskViewLayout } from '@/types/schedule';
import { TaskCard } from '@/components/shared/TaskCard';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatDate } from '@/utils/core/date';
import { getTaskStatusColor, getTaskPriorityColor } from '@/utils/scheduleUtils';

interface VirtualizedTaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  viewLayout?: TaskViewLayout;
  height?: number;
  itemHeight?: number;
  gridItemWidth?: number;
  gridItemHeight?: number;
  columnsCount?: number;
}

interface ListRowData {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

interface GridItemData {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  columnsCount: number;
}

// Optimized table row component for virtualization
const TaskTableRow = React.memo(({ index, style, data }: {
  index: number;
  style: React.CSSProperties;
  data: ListRowData;
}) => {
  const { tasks, onTaskClick } = data;
  const task = tasks[index];

  const statusColor = useMemo(() => getTaskStatusColor(task.status), [task.status]);
  const priorityColor = useMemo(() => getTaskPriorityColor(task.priority), [task.priority]);

  const handleClick = useCallback(() => {
    onTaskClick(task);
  }, [onTaskClick, task]);

  if (!task) {
    return <div style={style} />;
  }

  return (
    <div 
      style={style}
      className="flex items-center border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors duration-150"
      onClick={handleClick}
    >
      {/* Task */}
      <div className="flex-1 px-4 py-3 min-w-0">
        <div className="font-medium text-gray-900 dark:text-white truncate">{task.title}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
          {task.description}
        </div>
      </div>

      {/* Project / Phase */}
      <div className="flex-1 px-4 py-3 min-w-0">
        <div className="text-gray-900 dark:text-white truncate">{task.project}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{task.phase}</div>
      </div>

      {/* Date */}
      <div className="flex-1 px-4 py-3 min-w-0">
        <div className="text-xs text-gray-500 dark:text-gray-400">Start: {formatDate(task.startDate)}</div>
        <div className="text-gray-900 dark:text-white">Due: {formatDate(task.dueDate)}</div>
      </div>

      {/* Status */}
      <div className="flex-1 px-4 py-3 min-w-0">
        <Badge className={`bg-${statusColor}-500 text-white`}>
          {task.status}
        </Badge>
      </div>

      {/* Priority */}
      <div className="flex-1 px-4 py-3 min-w-0">
        <Badge variant="outline" className={`text-${priorityColor}-500 border-${priorityColor}-500`}>
          {task.priority}
        </Badge>
      </div>

      {/* Progress */}
      <div className="flex-1 px-4 py-3 min-w-0">
        <div className="flex items-center gap-2">
          <Progress value={task.completion} className="h-2 w-20" />
          <span className="text-xs text-gray-600 dark:text-gray-400">{task.completion}%</span>
        </div>
      </div>
    </div>
  );
});

TaskTableRow.displayName = 'TaskTableRow';

// Optimized grid item component for virtualization
const TaskGridItem = React.memo(({ columnIndex, rowIndex, style, data }: {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: GridItemData;
}) => {
  const { tasks, onTaskClick, columnsCount } = data;
  const index = rowIndex * columnsCount + columnIndex;
  const task = tasks[index];

  if (!task) {
    return <div style={style} />;
  }

  return (
    <div style={style} className="p-2">
      <TaskCard
        task={task}
        onClick={onTaskClick}
      />
    </div>
  );
});

TaskGridItem.displayName = 'TaskGridItem';

// Table header component
const TableHeader = React.memo(() => (
  <div className="flex items-center bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
    <div className="flex-1 px-4 py-3">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Task</div>
    </div>
    <div className="flex-1 px-4 py-3">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Project / Phase</div>
    </div>
    <div className="flex-1 px-4 py-3">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</div>
    </div>
    <div className="flex-1 px-4 py-3">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</div>
    </div>
    <div className="flex-1 px-4 py-3">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</div>
    </div>
    <div className="flex-1 px-4 py-3">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Progress</div>
    </div>
  </div>
));

TableHeader.displayName = 'TableHeader';

export const VirtualizedTaskList = React.memo(function VirtualizedTaskList({
  tasks,
  onTaskClick,
  viewLayout = 'grid',
  height = 600,
  itemHeight = 80,
  gridItemWidth = 320,
  gridItemHeight = 200,
  columnsCount = 3
}: VirtualizedTaskListProps) {
  // Memoize the data for the virtual list
  const listItemData = useMemo((): ListRowData => ({
    tasks,
    onTaskClick
  }), [tasks, onTaskClick]);

  const gridItemData = useMemo((): GridItemData => ({
    tasks,
    onTaskClick,
    columnsCount
  }), [tasks, onTaskClick, columnsCount]);

  if (tasks.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500 dark:text-gray-400">
        No tasks found
      </div>
    );
  }

  if (viewLayout === 'list') {
    return (
      <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
        <TableHeader />
        <List
          height={Math.min(height, tasks.length * itemHeight)}
          itemCount={tasks.length}
          itemSize={itemHeight}
          itemData={listItemData}
          width="100%"
          className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800"
        >
          {TaskTableRow}
        </List>
      </div>
    );
  }

  // Grid layout
  const rowCount = Math.ceil(tasks.length / columnsCount);
  
  return (
    <div className="w-full">
      <Grid
        columnCount={columnsCount}
        columnWidth={gridItemWidth}
        height={Math.min(height, rowCount * gridItemHeight)}
        rowCount={rowCount}
        rowHeight={gridItemHeight}
        itemData={gridItemData}
        className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800"
      >
        {TaskGridItem}
      </Grid>
    </div>
  );
});