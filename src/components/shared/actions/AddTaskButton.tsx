/**
 * AddTaskButton Component
 * Reusable button for adding new tasks across the application
 * Opens the shared TaskFormModal when clicked
 */

import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddTaskButtonProps {
  /** Function to call when adding a task */
  onAddTask: (phaseId: string) => void;
  
  /** Phase ID to add the task to */
  phaseId: string;
  
  /** Button variant */
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link';
  
  /** Button size */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  
  /** Whether the button is disabled */
  disabled?: boolean;
  
  /** Whether to show only the icon (compact mode) */
  iconOnly?: boolean;
  
  /** Custom className */
  className?: string;
  
  /** Custom button text */
  children?: React.ReactNode;
}

export function AddTaskButton({
  onAddTask,
  phaseId,
  variant = 'outline',
  size = 'sm',
  disabled = false,
  iconOnly = false,
  className = '',
  children
}: AddTaskButtonProps) {
  const handleClick = () => {
    onAddTask(phaseId);
  };

  if (iconOnly) {
    return (
      <Button
        variant={variant}
        size="icon"
        onClick={handleClick}
        disabled={disabled}
        className={`h-11 w-11 ${className}`}
        title="Add Task"
      >
        <Plus className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled}
      className={`${className}`}
    >
      <Plus className="h-4 w-4 mr-2" />
      {children || 'Add Task'}
    </Button>
  );
}