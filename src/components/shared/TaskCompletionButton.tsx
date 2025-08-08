/**
 * TaskCompletionButton - Reusable task completion toggle with activity tracking
 * Mobile-optimized component for marking tasks as complete/incomplete
 * Integrates seamlessly with BuildEase activity tracking system
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Circle, 
  Loader2 
} from 'lucide-react';
import { cn } from '@/utils/core/ui';
import { useTaskCompletion } from '@/pages/ProjectDetails/hooks/useTaskCRUDWithActivityTracking';
import { toast } from 'sonner';

interface TaskCompletionButtonProps {
  taskId: string;
  taskTitle: string;
  currentStatus: 'pending' | 'in-progress' | 'completed' | 'blocked' | 'cancelled';
  projectId: string;
  variant?: 'button' | 'icon' | 'checkbox';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  disabled?: boolean;
  onStatusChange?: (newStatus: string) => void;
}

/**
 * TaskCompletionButton Component
 * Provides a toggle interface for task completion with automatic activity tracking
 */
export function TaskCompletionButton({
  taskId,
  taskTitle,
  currentStatus,
  projectId,
  variant = 'icon',
  size = 'md',
  showLabel = false,
  className,
  disabled = false,
  onStatusChange
}: TaskCompletionButtonProps) {
  const { markAsComplete, markAsIncomplete, isUpdating } = useTaskCompletion(projectId);
  const isCompleted = currentStatus === 'completed';
  const canToggle = !disabled && !isUpdating && currentStatus !== 'cancelled' && currentStatus !== 'blocked';

  const handleToggleComplete = async () => {
    if (!canToggle) return;

    try {
      if (isCompleted) {
        await markAsIncomplete(taskId, taskTitle);
        onStatusChange?.('pending');
        toast.success(`Task "${taskTitle}" marked as incomplete`);
      } else {
        await markAsComplete(taskId, taskTitle, currentStatus);
        onStatusChange?.('completed');
        toast.success(`Task "${taskTitle}" completed! 🎉`);
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
      toast.error('Failed to update task status');
    }
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      icon: 'h-4 w-4',
      button: 'h-8 px-3 text-xs',
      text: 'text-xs'
    },
    md: {
      icon: 'h-5 w-5',
      button: 'h-10 px-4 text-sm',
      text: 'text-sm'
    },
    lg: {
      icon: 'h-6 w-6',
      button: 'h-12 px-6 text-base',
      text: 'text-base'
    }
  };

  const config = sizeConfig[size];

  // Icon selection based on status
  const getIcon = () => {
    if (isUpdating) {
      return <Loader2 className={cn(config.icon, 'animate-spin')} />;
    }
    
    if (isCompleted) {
      return <CheckCircle2 className={cn(config.icon, 'text-green-600')} />;
    }
    
    return <Circle className={cn(config.icon, 'text-slate-400')} />;
  };

  // Button variant styles
  const getVariantStyles = () => {
    if (variant === 'button') {
      return cn(
        'inline-flex items-center gap-2 font-medium transition-colors',
        config.button,
        isCompleted
          ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200',
        !canToggle && 'opacity-50 cursor-not-allowed'
      );
    }

    if (variant === 'checkbox') {
      return cn(
        'inline-flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer',
        !canToggle && 'opacity-50 cursor-not-allowed'
      );
    }

    // Icon variant (default)
    return cn(
      'inline-flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors cursor-pointer',
      size === 'sm' ? 'p-1' : size === 'lg' ? 'p-3' : 'p-2',
      !canToggle && 'opacity-50 cursor-not-allowed'
    );
  };

  // Label text
  const getLabelText = () => {
    if (isUpdating) return 'Updating...';
    if (isCompleted) return 'Completed';
    if (currentStatus === 'in-progress') return 'Mark Complete';
    if (currentStatus === 'blocked') return 'Blocked';
    if (currentStatus === 'cancelled') return 'Cancelled';
    return 'Mark Complete';
  };

  if (variant === 'button') {
    return (
      <Button
        variant="outline"
        onClick={handleToggleComplete}
        disabled={!canToggle}
        className={cn(getVariantStyles(), className)}
      >
        {getIcon()}
        {(showLabel || variant === 'button') && (
          <span className={config.text}>{getLabelText()}</span>
        )}
      </Button>
    );
  }

  return (
    <div
      role="button"
      tabIndex={canToggle ? 0 : -1}
      onClick={handleToggleComplete}
      onKeyDown={(e) => {
        if (canToggle && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleToggleComplete();
        }
      }}
      className={cn(getVariantStyles(), className)}
      title={`${isCompleted ? 'Mark incomplete' : 'Mark complete'}: ${taskTitle}`}
    >
      {getIcon()}
      {showLabel && (
        <span className={cn(config.text, 'ml-2')}>{getLabelText()}</span>
      )}
    </div>
  );
}

/**
 * TaskCompletionToggle - Simplified toggle component
 */
export function TaskCompletionToggle({
  taskId,
  taskTitle,
  currentStatus,
  projectId,
  onStatusChange,
  className
}: Pick<TaskCompletionButtonProps, 'taskId' | 'taskTitle' | 'currentStatus' | 'projectId' | 'onStatusChange' | 'className'>) {
  return (
    <TaskCompletionButton
      taskId={taskId}
      taskTitle={taskTitle}
      currentStatus={currentStatus}
      projectId={projectId}
      variant="icon"
      size="md"
      onStatusChange={onStatusChange}
      className={className}
    />
  );
}

/**
 * TaskCompletionCard - Complete task card with completion toggle
 */
interface TaskCompletionCardProps {
  task: {
    id: string;
    title: string;
    description?: string;
    status: 'pending' | 'in-progress' | 'completed' | 'blocked' | 'cancelled';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    due_date?: string;
    assigned_to?: string;
  };
  projectId: string;
  onStatusChange?: (newStatus: string) => void;
  className?: string;
}

export function TaskCompletionCard({
  task,
  projectId,
  onStatusChange,
  className
}: TaskCompletionCardProps) {
  const isCompleted = task.status === 'completed';
  
  return (
    <div className={cn(
      'p-4 rounded-lg border transition-all duration-200',
      isCompleted 
        ? 'bg-green-50 border-green-200' 
        : 'bg-white border-slate-200 hover:border-slate-300',
      className
    )}>
      <div className="flex items-start gap-3">
        <TaskCompletionButton
          taskId={task.id}
          taskTitle={task.title}
          currentStatus={task.status}
          projectId={projectId}
          variant="icon"
          size="md"
          onStatusChange={onStatusChange}
          className="mt-0.5"
        />
        
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            'font-medium transition-colors',
            isCompleted && 'text-green-800 line-through'
          )}>
            {task.title}
          </h4>
          
          {task.description && (
            <p className={cn(
              'text-sm text-slate-600 mt-1',
              isCompleted && 'text-green-700 opacity-75'
            )}>
              {task.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
            {task.priority && (
              <span className={cn(
                'px-2 py-1 rounded-full font-medium',
                task.priority === 'urgent' && 'bg-red-100 text-red-700',
                task.priority === 'high' && 'bg-orange-100 text-orange-700',
                task.priority === 'medium' && 'bg-yellow-100 text-yellow-700',
                task.priority === 'low' && 'bg-slate-100 text-slate-600'
              )}>
                {task.priority}
              </span>
            )}
            
            {task.due_date && (
              <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
            )}
            
            {task.assigned_to && (
              <span>Assigned to: {task.assigned_to}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}