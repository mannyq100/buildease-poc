import React from 'react';
import type { Task } from '@/types/schedule';
import { TaskCard as SharedTaskCard } from '@/components/shared/TaskCard';

/**
 * Schedule-specific TaskCard component that uses the unified TaskCard implementation.
 * Follows Buildese UI design principles:
 * - Card-based UI with subtle shadows for depth
 * - Clear visual feedback for interactions
 * - Consistent spacing system
 * - Modern, aesthetic look with warm blue accents
 * - Progressive disclosure for complex tasks
 */
export function TaskCard({ 
  task, 
  onClick 
}: {
  task: Task;
  onClick?: (task: Task) => void;
}) {
  const handleClick = () => {
    if (onClick) {
      onClick(task);
    }
  };

  return (
    <SharedTaskCard
      task={task}
      onClick={handleClick}
      animate={true}
      className="hover:shadow-md transition-shadow cursor-pointer"
    />
  );
}