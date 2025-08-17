/**
 * PhaseTasksSection - Task management component within phases
 * Mobile-optimized task list with add/edit/delete actions
 * Integrates with useTaskCRUD hook for task operations
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  Edit3,
  Trash2,
  MoreVertical,
  AlertCircle
} from 'lucide-react';
import { ProjectPhase, EnhancedTask } from '@/types/projectDetails';
import { getTaskStatusColor, getTaskStatusIconColor, getTaskPriorityBadgeVariant, getTaskPriorityColor } from '@/utils/core/taskColors';
import { usePhaseStatusManager } from '@/hooks/usePhaseStatusManager';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { usePhaseNotifications } from '@/hooks/usePhaseNotifications';
import { ToastContainer } from '@/components/ToastContainer';
import { TaskListSkeleton, OptimisticTaskCard, LoadingButton } from '@/components/LoadingSkeletons';
import React from 'react';

interface PhaseTasksSectionProps {
  phase: ProjectPhase;
  tasks: EnhancedTask[];
  isLoading: boolean;
  onCreateTask: (phaseId: string) => void;
  onEditTask: (task: EnhancedTask, phaseId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

// Use centralized color utilities - removed duplicate functions

function PhaseTasksSectionContent({
  phase,
  tasks,
  isLoading,
  onCreateTask,
  onEditTask,
  onDeleteTask
}: PhaseTasksSectionProps) {
  // Use consolidated phase status manager
  const {
    state: { showCompletePrompt, showReopenPrompt },
    actions: {
      handleConfirmComplete,
      handleConfirmReopen,
      handleUpdateProgress,
      setShowCompletePrompt,
      setShowReopenPrompt
    },
    taskMetrics,
    isUpdating,
    error,
    retryLastOperation
  } = usePhaseStatusManager(phase, tasks);

  // Phase notifications
  const notifications = usePhaseNotifications();

  // Trigger notifications on error
  React.useEffect(() => {
    if (error) {
      notifications.onPhaseUpdateError(error.message, retryLastOperation);
    }
  }, [error, notifications, retryLastOperation]);

  // Error display component
  const ErrorDisplay = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-700">
            Failed to update phase: {error.message}
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onRetry}
          className="text-red-700 border-red-300 hover:bg-red-50"
        >
          Retry
        </Button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-4">
        <TaskListSkeleton count={3} />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500">
        <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-slate-300" />
        <p className="text-sm">No tasks defined for this phase</p>
        <Button 
          size="sm" 
          className="mt-2 bg-buildease-blue-600 hover:bg-buildease-blue-700"
          onClick={() => onCreateTask(phase.id)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add First Task
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 space-y-2">
        {/* Error Display */}
        {error && <ErrorDisplay error={error} onRetry={retryLastOperation} />}
        
        {tasks.map((task, index) => (
          <OptimisticTaskCard
            key={task.id}
            isPending={isUpdating}
            operation="updating"
          >
            <TaskCard
              task={task}
              index={index}
              onEdit={() => onEditTask(task, phase.id)}
              onDelete={() => onDeleteTask(task.id)}
            />
          </OptimisticTaskCard>
        ))}
      
      <div className="flex gap-2 pt-2 border-t border-slate-200/40">
        <Button 
          size="sm" 
          className="flex-1 bg-buildease-blue-600 hover:bg-buildease-blue-700"
          onClick={() => onCreateTask(phase.id)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
        <LoadingButton
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={handleUpdateProgress}
          isLoading={isUpdating}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Update Progress
        </LoadingButton>
      </div>

      <AlertDialog open={showCompletePrompt} onOpenChange={setShowCompletePrompt}>
        <AlertDialogContent className="max-w-sm sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900">Mark phase as completed?</AlertDialogTitle>
            <AlertDialogDescription>
              All tasks in the phase "{phase.name}" are marked as completed. Would you like to mark this phase as Completed and set its actual end date to today?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowCompletePrompt(false)}>Not now</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmComplete}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Mark Completed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reopen confirmation when a task is reopened after completion */}
      <AlertDialog open={showReopenPrompt} onOpenChange={setShowReopenPrompt}>
        <AlertDialogContent className="max-w-sm sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900">Reopen phase?</AlertDialogTitle>
            <AlertDialogDescription>
              A task was reopened after this phase was marked as Completed. Do you want to revert the phase to In Progress and clear its actual end date?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowReopenPrompt(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmReopen}
              className="bg-buildease-blue-600 hover:bg-buildease-blue-700 text-white"
            >
              Reopen Phase
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>

    {/* Toast Notifications */}
    <ToastContainer 
      toasts={notifications.toasts} 
      onRemove={notifications.removeToast}
      position="bottom-right"
    />
  </>
  );
}

// Wrap with ErrorBoundary
export function PhaseTasksSection(props: PhaseTasksSectionProps) {
  return (
    <ErrorBoundary
      resetKeys={[props.phase.id, props.tasks.length]}
      onError={(error) => {
        console.error('PhaseTasksSection Error:', error);
      }}
    >
      <PhaseTasksSectionContent {...props} />
    </ErrorBoundary>
  );
}

// Individual Task Card Component
interface TaskCardProps {
  task: EnhancedTask;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

function TaskCard({ task, index, onEdit, onDelete }: TaskCardProps) {
  return (
    <div
      className={`flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200/40 hover:bg-slate-50/50 transition-all duration-200 group shadow-sm hover:shadow-md min-h-[56px] ${
        index === 0 ? 'animate-in fade-in slide-in-from-left-2' : ''
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex-shrink-0">
          <CheckCircle2 
            className={`h-5 w-5 ${getTaskStatusIconColor(task.status)} ${
              task.status?.toUpperCase() === 'COMPLETED' ? 'fill-current' : ''
            } transition-colors duration-200`} 
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <span className={`text-sm font-medium leading-5 ${
              task.status?.toUpperCase() === 'COMPLETED' ? 'line-through text-slate-500' : 'text-slate-900'
            }`}>
              {task.title}
            </span>
            <div className="flex-shrink-0">
              <Badge 
                variant={getTaskPriorityBadgeVariant(task.priority)} 
                className={`text-xs ${getTaskPriorityColor(task.priority)}`}
              >
                {task.priority}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            {task.assigned_to && (
              <span className="bg-buildease-blue-100 text-buildease-blue-700 px-2 py-1 rounded-full font-medium">
                Assigned
              </span>
            )}
            {task.due_date && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(task.due_date).toLocaleDateString()}
              </span>
            )}
            {task.status && (
              <Badge 
                variant="outline" 
                className={`text-xs ${getTaskStatusColor(task.status)}`}
              >
                {task.status.replace('_', ' ').toLowerCase()}
              </Badge>
            )}
          </div>
          {task.description && (
            <p className="text-xs text-slate-600 mt-2 line-clamp-2">{task.description}</p>
          )}
        </div>
      </div>
      
      {/* Task Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Task
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={onDelete}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}