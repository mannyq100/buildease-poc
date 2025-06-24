/**
 * LazyTaskList Component
 * Implements lazy loading for large task lists within phase cards
 * Optimized for mobile performance with virtual scrolling for very large lists
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Task } from '@/data/mock/generatedPlan/planData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash, Users, CheckCircle } from 'lucide-react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { getStatusColor } from '@/utils/plan-helpers';

interface LazyTaskListProps {
  tasks: Task[];
  phaseId: string;
  onEditTask?: (phaseId: string, taskId: string) => void;
  onDeleteTask?: (phaseId: string, taskId: string) => void;
  initialDisplayCount?: number;
  batchSize?: number;
}

export const LazyTaskList = React.memo(function LazyTaskList({
  tasks,
  phaseId,
  onEditTask,
  onDeleteTask,
  initialDisplayCount = 3, // Show first 3 tasks initially
  batchSize = 5 // Load 5 more at a time
}: LazyTaskListProps) {
  const [displayCount, setDisplayCount] = useState(initialDisplayCount);
  const [isExpanding, setIsExpanding] = useState(false);

  // Memoize visible tasks
  const visibleTasks = useMemo(() => {
    return tasks.slice(0, displayCount);
  }, [tasks, displayCount]);

  const hasMoreTasks = displayCount < tasks.length;
  const hiddenTasksCount = tasks.length - displayCount;

  // Load more tasks
  const loadMoreTasks = useCallback(() => {
    if (isExpanding) return;
    
    setIsExpanding(true);
    setTimeout(() => {
      setDisplayCount(prev => Math.min(prev + batchSize, tasks.length));
      setIsExpanding(false);
    }, 150); // Small delay for smooth animation
  }, [isExpanding, batchSize, tasks.length]);

  // Show all tasks
  const showAllTasks = useCallback(() => {
    if (isExpanding) return;
    
    setIsExpanding(true);
    setTimeout(() => {
      setDisplayCount(tasks.length);
      setIsExpanding(false);
    }, 150);
  }, [isExpanding, tasks.length]);

  // Collapse to initial count
  const collapseToInitial = useCallback(() => {
    setDisplayCount(initialDisplayCount);
  }, [initialDisplayCount]);

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-construction-body text-buildease-earth-600 dark:text-buildease-earth-400 bg-gradient-to-br from-buildease-blue-50/40 to-white/60 dark:from-buildease-blue-950/20 dark:to-gray-800/40 rounded-xl border border-dashed border-buildease-blue-300/60 dark:border-buildease-blue-700/60 backdrop-blur-sm">
        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-buildease-blue-400 dark:text-buildease-blue-500" />
        <p className="font-medium">No tasks added yet</p>
        <p className="text-xs mt-1 text-buildease-earth-500 dark:text-buildease-earth-500">Click "Add Task" to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {visibleTasks.map((task, index) => (
          <m.div 
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ 
              duration: 0.2, 
              delay: index >= initialDisplayCount ? index * 0.03 : 0,
              ease: "easeOut"
            }}
            layout
            className="p-5 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-buildease-blue-200/50 dark:border-buildease-blue-800/50 shadow-md hover:border-buildease-blue-300/70 dark:hover:border-buildease-blue-700/70 transition-all duration-200 hover:shadow-lg backdrop-blur-md ring-1 ring-buildease-blue-100/20 dark:ring-buildease-blue-900/20 hover:ring-buildease-blue-200/30 dark:hover:ring-buildease-blue-800/30"
          >
            <div className="flex justify-between">
              <span className="font-semibold text-buildease-earth-800 dark:text-buildease-earth-200 text-construction-body">
                {task.name}
              </span>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(task.status)} variant="outline">
                  {task.status}
                </Badge>
                <div className="flex gap-2 sm:gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 sm:h-6 sm:w-6 p-0 opacity-70 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditTask?.(phaseId, task.id);
                    }}
                  >
                    <Edit className="h-4 w-4 sm:h-3 sm:w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 sm:h-6 sm:w-6 p-0 text-red-600 opacity-70 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTask?.(phaseId, task.id);
                    }}
                  >
                    <Trash className="h-4 w-4 sm:h-3 sm:w-3" />
                  </Button>
                </div>
              </div>
            </div>
            {task.assignedTo && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-buildease-earth-600 dark:text-buildease-earth-400 bg-buildease-earth-50 dark:bg-buildease-earth-900/30 px-2 py-1 rounded-md border border-buildease-earth-200 dark:border-buildease-earth-800">
                  <Users className="h-3 w-3" />
                  <span className="font-medium">Assigned to: {task.assignedTo}</span>
                </div>
              </div>
            )}
          </m.div>
        ))}
      </AnimatePresence>

      {/* Load More Controls */}
      {hasMoreTasks && (
        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 py-4"
        >
          {isExpanding ? (
            <div className="flex items-center gap-2 text-buildease-blue-600 dark:text-buildease-blue-400">
              <div className="w-4 h-4 border-2 border-buildease-blue-600/30 border-t-buildease-blue-600 rounded-full animate-spin" />
              <span className="text-sm font-medium">Loading tasks...</span>
            </div>
          ) : (
            <>
              <button
                onClick={loadMoreTasks}
                className="px-4 py-2 bg-buildease-blue-50/80 dark:bg-buildease-blue-950/40 hover:bg-buildease-blue-100/80 dark:hover:bg-buildease-blue-900/40 text-buildease-blue-700 dark:text-buildease-blue-300 rounded-lg border border-buildease-blue-200/50 dark:border-buildease-blue-800/50 transition-all duration-200 hover:shadow-sm backdrop-blur-sm font-medium text-xs"
              >
                Load {Math.min(batchSize, hiddenTasksCount)} more
              </button>
              
              {hiddenTasksCount > batchSize && (
                <button
                  onClick={showAllTasks}
                  className="px-4 py-2 bg-buildease-orange-50/80 dark:bg-buildease-orange-950/40 hover:bg-buildease-orange-100/80 dark:hover:bg-buildease-orange-900/40 text-buildease-orange-700 dark:text-buildease-orange-300 rounded-lg border border-buildease-orange-200/50 dark:border-buildease-orange-800/50 transition-all duration-200 hover:shadow-sm backdrop-blur-sm font-medium text-xs"
                >
                  Show all {tasks.length}
                </button>
              )}
            </>
          )}
        </m.div>
      )}

      {/* Collapse control when showing all */}
      {!hasMoreTasks && tasks.length > initialDisplayCount && (
        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center py-2"
        >
          <button
            onClick={collapseToInitial}
            className="px-4 py-2 bg-gray-50/80 dark:bg-gray-800/80 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200/50 dark:border-gray-700/50 transition-all duration-200 hover:shadow-sm backdrop-blur-sm font-medium text-xs"
          >
            Show less
          </button>
        </m.div>
      )}

      {/* Performance indicator for development */}
      {process.env.NODE_ENV === 'development' && tasks.length > 10 && (
        <div className="mt-2 p-2 bg-yellow-50/80 dark:bg-yellow-900/20 border border-yellow-200/50 dark:border-yellow-800/50 rounded">
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            Showing {visibleTasks.length}/{tasks.length} tasks
          </p>
        </div>
      )}
    </div>
  );
});

export default LazyTaskList;