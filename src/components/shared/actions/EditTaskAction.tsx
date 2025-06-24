/**
 * EditTaskAction Component
 * Reusable edit action for tasks across the application
 * Opens the shared TaskFormModal when clicked
 */

import React from 'react';
import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditTaskActionProps {
  /** Function to call when editing a task */
  onEditTask: (phaseId: string, taskId: string) => void;
  
  /** Phase ID containing the task */
  phaseId: string;
  
  /** Task ID to edit */
  taskId: string;
  
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

export function EditTaskAction({
  onEditTask,
  phaseId,
  taskId,
  variant = 'ghost',
  size = 'sm',
  disabled = false,
  iconOnly = true,
  className = '',
  children
}: EditTaskActionProps) {
  const handleClick = () => {
    onEditTask(phaseId, taskId);
  };

  if (iconOnly) {
    return (
      <Button
        variant={variant}
        size="icon"
        onClick={handleClick}
        disabled={disabled}
        className={`h-8 w-8 ${className}`}
        title="Edit Task"
      >
        <Edit className="h-4 w-4" />
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
      <Edit className="h-4 w-4 mr-2" />
      {children || 'Edit'}
    </Button>
  );
}