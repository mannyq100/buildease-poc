/**
 * DeleteTaskAction Component
 * Reusable delete action for tasks across the application
 * Opens the shared ConfirmationModal when clicked
 */

import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConfirmation } from '@/hooks/useConfirmation';

interface DeleteTaskActionProps {
  /** Function to call when deleting a task */
  onDeleteTask: (phaseId: string, taskId: string) => void;
  
  /** Phase ID containing the task */
  phaseId: string;
  
  /** Task ID to delete */
  taskId: string;
  
  /** Task name for confirmation message */
  taskName?: string;
  
  /** Button variant */
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
  
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

export function DeleteTaskAction({
  onDeleteTask,
  phaseId,
  taskId,
  taskName,
  variant = 'ghost',
  size = 'sm',
  disabled = false,
  iconOnly = true,
  className = '',
  children
}: DeleteTaskActionProps) {
  const { confirmDelete } = useConfirmation();

  const handleClick = async () => {
    const confirmed = await confirmDelete(
      'Delete Task',
      `Are you sure you want to delete ${taskName ? `"${taskName}"` : 'this task'}? This action cannot be undone.`,
      'Delete Task'
    );
    
    if (confirmed) {
      onDeleteTask(phaseId, taskId);
    }
  };

  if (iconOnly) {
    return (
      <Button
        variant={variant}
        size="icon"
        onClick={handleClick}
        disabled={disabled}
        className={`h-11 w-11 text-red-600 hover:text-red-700 hover:bg-red-50 ${className}`}
        title="Delete Task"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled}
      className={`text-red-600 hover:text-red-700 hover:bg-red-50 ${className}`}
    >
      <Trash2 className="h-4 w-4 mr-2" />
      {children || 'Delete'}
    </Button>
  );
}