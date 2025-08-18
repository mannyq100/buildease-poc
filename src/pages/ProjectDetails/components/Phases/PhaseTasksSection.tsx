/**
 * PhaseTasksSection - Task management component within phases
 * Mobile-optimized task list with add/edit/delete actions
 * Integrates with useTaskCRUD hook for task operations
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  CheckCircle2,
  Clock,
  Edit3,
  Trash2,
  MoreVertical,
  AlertCircle
} from 'lucide-react';
import { ProjectPhase, EnhancedTask, TeamMember } from '@/types/projectDetails';
import { getTaskStatusColor, getTaskStatusIconColor, getTaskPriorityBadgeVariant, getTaskPriorityColor } from '@/utils/core/taskColors';
import { usePhaseStatusManager } from '@/hooks/usePhaseStatusManager';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { usePhaseNotifications } from '@/hooks/usePhaseNotifications';
import { ToastContainer } from '@/components/ToastContainer';
import { TaskListSkeleton, OptimisticTaskCard } from '@/components/LoadingSkeletons';
import { AssigneeSelect } from '@/components/ui/AssigneeSelect';
import { useTaskAssignment, useBulkAssignTasks } from '@/hooks/mutations';
import { useAutoTransitionSafe } from '@/contexts/AutoTransitionContext';
import { AutoTransitionIndicator } from '@/components/ui/AutoTransitionIndicator';
import React from 'react';

interface PhaseTasksSectionProps {
  phase: ProjectPhase;
  tasks: EnhancedTask[];
  teamMembers: TeamMember[];
  projectId: string;
  isLoading: boolean;
  onCreateTask: (phaseId: string) => void;
  onEditTask: (task: EnhancedTask, phaseId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

// Use centralized color utilities - removed duplicate functions

function PhaseTasksSectionContent({
  phase,
  tasks,
  teamMembers,
  projectId,
  isLoading,
  onCreateTask,
  onEditTask,
  onDeleteTask
}: PhaseTasksSectionProps) {
  // Task selection state for bulk operations
  const [selectedTasks, setSelectedTasks] = React.useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = React.useState(false);

  // Task selection helpers
  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(taskId)) {
        newSelection.delete(taskId);
      } else {
        newSelection.add(taskId);
      }
      return newSelection;
    });
  };

  const selectAllTasks = () => {
    setSelectedTasks(new Set(tasks.map(task => task.id)));
  };

  const clearSelection = () => {
    setSelectedTasks(new Set());
    setSelectionMode(false);
  };

  const isTaskSelected = (taskId: string) => selectedTasks.has(taskId);

  // Bulk assignment mutation
  const bulkAssignMutation = useBulkAssignTasks();

  // Handle bulk assignment
  const handleBulkAssign = async (assigneeId: string | null) => {
    try {
      await bulkAssignMutation.mutateAsync({
        taskIds: Array.from(selectedTasks),
        assignedTo: assigneeId,
        projectId
      });
      clearSelection();
      
      // Show success notification  
      const memberName = assigneeId ? 
        bulkAssignMembers.find(m => m.id === assigneeId)?.name || 'team member' :
        'No one';
      notifications.success(
        'Bulk Assignment Complete',
        `${selectedTasks.size} task${selectedTasks.size > 1 ? 's' : ''} assigned to ${memberName}`
      );
    } catch (error) {
      console.error('Failed to bulk assign tasks:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const friendlyMessage = getFriendlyErrorMessage(errorMessage, 'bulk_assignment');
      
      notifications.onPhaseUpdateError(friendlyMessage, () => handleBulkAssign(assigneeId));
    }
  };

  // Calculate workload for each team member based on assigned tasks
  const calculateMemberWorkload = React.useCallback((memberId: string) => {
    const assignedTasks = tasks.filter(task => 
      task.assigned_to === memberId && 
      task.status !== 'COMPLETED' && 
      task.status !== 'CANCELLED'
    );
    
    // Calculate workload based on task count and priority
    const workloadScore = assignedTasks.reduce((score, task) => {
      const priorityWeight = {
        'URGENT': 4,
        'HIGH': 3, 
        'MEDIUM': 2,
        'LOW': 1
      }[task.priority] || 2;
      return score + priorityWeight;
    }, 0);
    
    // Convert to percentage (assuming max healthy workload is 12 points)
    return Math.min(Math.round((workloadScore / 12) * 100), 100);
  }, [tasks]);

  // Transform team members for bulk assignment (consistent with task cards)
  const bulkAssignMembers = React.useMemo(() => {
    return teamMembers
      .filter(member => member.user_id || member.id) // Include all members with valid IDs
      .map(member => {
        const memberId = member.user_id || member.id || '';
        const workload = calculateMemberWorkload(memberId);
        
        return {
          id: memberId,
          name: member.name,
          role: member.role,
          email: member.email,
          avatar: member.avatar,
          status: member.status === 'active' ? 'active' as const : 
                 member.status === 'on-break' ? 'inactive' as const : 
                 'inactive' as const, // Map team member status to AssigneeSelect status
          workload
        };
      })
      .filter(member => member.id.length > 0);
  }, [teamMembers, calculateMemberWorkload]);

  // Helper function to convert technical errors to user-friendly messages
  const getFriendlyErrorMessage = React.useCallback((error: string, context: string) => {
    const lowerError = error.toLowerCase();
    
    // UUID errors
    if (lowerError.includes('invalid input syntax for type uuid')) {
      return 'Unable to assign task. Please try selecting the team member again.';
    }
    
    // Network errors
    if (lowerError.includes('network') || lowerError.includes('connection')) {
      return 'Connection issue. Please check your internet and try again.';
    }
    
    // Permission errors
    if (lowerError.includes('permission') || lowerError.includes('unauthorized')) {
      return 'You don\'t have permission to perform this action.';
    }
    
    // Validation errors
    if (lowerError.includes('validation') || lowerError.includes('invalid')) {
      return context === 'bulk_assignment' 
        ? 'Some selected tasks couldn\'t be assigned. Please try again.'
        : 'Task assignment failed. Please check the task details and try again.';
    }
    
    // Database errors
    if (lowerError.includes('database') || lowerError.includes('constraint')) {
      return 'Unable to save changes. Please try again in a moment.';
    }
    
    // Timeout errors
    if (lowerError.includes('timeout') || lowerError.includes('slow')) {
      return 'Request timed out. Please try again.';
    }
    
    // Generic fallback with context
    switch (context) {
      case 'bulk_assignment':
        return 'Failed to assign multiple tasks. Please try again.';
      case 'individual_assignment':
        return 'Failed to assign task. Please try again.';
      case 'phase_update':
        return 'Failed to update phase. Please try again.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }, []);

  // Phase notifications
  const notifications = usePhaseNotifications();

  // Auto-transition visual indicators
  const autoTransition = useAutoTransitionSafe();
  const currentTransition = autoTransition.getTransition(phase.id);

  // Use consolidated phase status manager with notifications
  const {
    state: { showCompletePrompt, showReopenPrompt },
    actions: {
      handleConfirmComplete,
      handleConfirmReopen,
      setShowCompletePrompt,
      setShowReopenPrompt
    },
    // taskMetrics,
    isUpdating,
    error,
    retryLastOperation
  } = usePhaseStatusManager(phase, tasks, {
    onPhaseAutoTransition: notifications.onPhaseAutoTransition,
    onTimelineUpdate: notifications.onTimelineUpdate
  }, {
    showTransition: autoTransition.showTransition
  });

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
        {/* Auto-transition Indicator */}
        {currentTransition && (
          <AutoTransitionIndicator
            isVisible={true}
            transitionType={currentTransition.type}
            onAnimationComplete={() => autoTransition.hideTransition(phase.id)}
            className="mb-3"
          />
        )}

        {/* Error Display */}
        {error && <ErrorDisplay error={error} onRetry={retryLastOperation} />}
        
        {/* Selection Toolbar */}
        {selectionMode && (
          <div className="flex items-center justify-between p-3 bg-buildease-blue-50 border border-buildease-blue-200 rounded-lg mb-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-buildease-blue-900">
                {selectedTasks.size} of {tasks.length} selected
              </span>
              {selectedTasks.size < tasks.length && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={selectAllTasks}
                  className="text-xs text-buildease-blue-700 border-buildease-blue-300"
                >
                  Select All
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={clearSelection}
                className="text-xs min-h-[40px] active:scale-[0.98] touch-manipulation"
              >
                Cancel
              </Button>
              {selectedTasks.size > 0 && (
                <>
                  {/* Bulk Assignment */}
                  <AssigneeSelect
                    value={null}
                    onValueChange={handleBulkAssign}
                    teamMembers={bulkAssignMembers}
                    placeholder="Bulk assign..."
                    variant="compact"
                    className="min-w-[140px]"
                    disabled={bulkAssignMutation.isPending}
                    showWorkload={true}
                    showClearButton={false}
                  />
                  
                  {/* Mark Complete */}
                  <Button 
                    size="sm" 
                    className="text-xs min-h-[40px] bg-green-600 hover:bg-green-700 active:bg-green-800 active:scale-[0.98] touch-manipulation"
                    onClick={() => console.log('Mark selected as complete:', Array.from(selectedTasks))}
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Mark Complete
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
        
        {tasks.map((task, index) => (
          <OptimisticTaskCard
            key={task.id}
            isPending={isUpdating}
            operation="updating"
          >
            <TaskCard
              task={task}
              teamMembers={teamMembers}
              projectId={projectId}
              phaseId={phase.id}
              index={index}
              onEdit={() => onEditTask(task, phase.id)}
              onDelete={() => onDeleteTask(task.id)}
              selectionMode={selectionMode}
              isSelected={isTaskSelected(task.id)}
              onToggleSelection={() => toggleTaskSelection(task.id)}
              calculateMemberWorkload={calculateMemberWorkload}
              getFriendlyErrorMessage={getFriendlyErrorMessage}
              notifications={notifications}
            />
          </OptimisticTaskCard>
        ))}
      
      <div className="flex gap-2 pt-2 border-t border-slate-200/40">
        {!selectionMode ? (
          <>
            <Button 
              size="sm" 
              className="flex-1 min-h-[44px] bg-buildease-blue-600 hover:bg-buildease-blue-700 active:bg-buildease-blue-800 active:scale-[0.98] touch-manipulation"
              onClick={() => onCreateTask(phase.id)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
            {tasks.length > 0 && (
              <Button 
                size="sm" 
                variant="outline"
                className="flex-shrink-0 min-h-[44px] active:scale-[0.98] touch-manipulation"
                onClick={() => setSelectionMode(true)}
              >
                Select Tasks
              </Button>
            )}
          </>
        ) : (
          <div className="flex-1 text-center text-sm text-slate-600">
            Click tasks to select them for bulk operations
          </div>
        )}
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
  teamMembers: TeamMember[];
  projectId: string;
  phaseId: string;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: () => void;
  calculateMemberWorkload: (memberId: string) => number;
  getFriendlyErrorMessage: (error: string, context: string) => string;
  notifications: ReturnType<typeof usePhaseNotifications>;
}

function TaskCard({ 
  task, 
  teamMembers, 
  projectId, 
  // phaseId, // Currently unused
  index, 
  onEdit, 
  onDelete, 
  selectionMode = false,
  isSelected = false,
  onToggleSelection,
  calculateMemberWorkload,
  getFriendlyErrorMessage,
  notifications
}: TaskCardProps) {
  
  // Task assignment mutation for quick assignment
  const assignTaskMutation = useTaskAssignment();

  // Handle quick assignment
  const handleQuickAssignment = async (assignedTo: string | null) => {
    try {
      await assignTaskMutation.mutateAsync({
        taskId: task.id,
        assignedTo,
        projectId,
        taskTitle: task.title
      });
      
      // Show success notification
      const memberName = assignedTo ? 
        selectableMembers.find(m => m.id === assignedTo)?.name || 'team member' :
        'No one';
      notifications.success(
        'Task Assigned',
        `"${task.title}" assigned to ${memberName}`
      );
    } catch (error) {
      console.error('Failed to assign task:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const friendlyMessage = getFriendlyErrorMessage(errorMessage, 'individual_assignment');
      
      notifications.onPhaseUpdateError(friendlyMessage, () => handleQuickAssignment(assignedTo));
    }
  };

  // Find assigned team member with proper ID mapping and validation
  const assignedMember = React.useMemo(() => {
    if (!task.assigned_to) return null;
    
    // Find member by user_id (primary) or fallback to id
    const member = teamMembers.find(member => 
      member.user_id === task.assigned_to || member.id === task.assigned_to
    );
    
    // Validate member exists and is active
    if (!member) {
      console.warn(`Assigned member ${task.assigned_to} not found in team members`);
      return null;
    }
    
    if (member.status !== 'active') {
      console.warn(`Assigned member ${member.name} is not active (status: ${member.status})`);
      // Still return the member but with warning - UI will handle inactive state
    }
    
    return member;
  }, [teamMembers, task.assigned_to]);

  // Transform team members for AssigneeSelect with consistent ID mapping
  const selectableMembers = React.useMemo(() => {
    return teamMembers
      .filter(member => member.user_id || member.id) // Include all members with valid IDs (not just active)
      .map(member => {
        const memberId = member.user_id || member.id || '';
        const workload = calculateMemberWorkload(memberId);
        
        return {
          id: memberId, // Use user_id for database operations
          name: member.name,
          role: member.role,
          email: member.email,
          avatar: member.avatar,
          status: member.status === 'active' ? 'active' as const : 
                 member.status === 'on-break' ? 'inactive' as const : 
                 'inactive' as const, // Map team member status to AssigneeSelect status
          workload
        };
      })
      .filter(member => member.id.length > 0); // Filter out members without valid IDs
  }, [teamMembers, calculateMemberWorkload]);
  return (
    <div
      className={`flex items-center justify-between p-4 bg-white rounded-lg border transition-all duration-200 group shadow-sm min-h-[56px] ${
        index === 0 ? 'animate-in fade-in slide-in-from-left-2' : ''
      } ${
        selectionMode 
          ? `cursor-pointer active:scale-[0.98] active:bg-buildease-blue-100 ${isSelected ? 'border-buildease-blue-500 bg-buildease-blue-50' : 'border-slate-200/40 hover:border-buildease-blue-300 active:border-buildease-blue-400'}`
          : 'border-slate-200/40 hover:bg-slate-50/50 hover:shadow-md active:bg-slate-100/50 active:scale-[0.995]'
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={selectionMode ? onToggleSelection : undefined}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex-shrink-0 flex items-center gap-3">
          {/* Selection Checkbox (when in selection mode) */}
          {selectionMode && (
            <div className="flex items-center justify-center w-11 h-11">
              <Checkbox
                checked={isSelected}
                onCheckedChange={onToggleSelection}
                className="w-5 h-5"
                aria-label={`Select task: ${task.title}`}
              />
            </div>
          )}
          {/* Status Icon */}
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
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Priority Badge */}
              <Badge 
                variant={getTaskPriorityBadgeVariant(task.priority)} 
                className={`text-xs ${getTaskPriorityColor(task.priority)}`}
              >
                {task.priority}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            {task.due_date && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(task.due_date).toLocaleDateString()}
              </span>
            )}
            
            {/* Assignee Avatar or Quick Assignment Interface */}
            {!selectionMode && (
              <div className="flex items-center gap-2">
                {task.assigned_to && assignedMember ? (
                  // Show assignee avatar with name
                  <div className="flex items-center gap-2">
                    <div 
                      className={`w-6 h-6 rounded-full transition-all duration-200 shadow-sm relative overflow-hidden ${
                        assignedMember.status === 'active' 
                          ? 'ring-1 ring-buildease-blue-500' 
                          : 'ring-1 ring-yellow-500'
                      } cursor-pointer hover:ring-2 active:ring-3 active:scale-110 touch-manipulation`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                      }}
                      title={`Assigned to ${assignedMember.name} - Click to edit`}
                    >
                      {assignedMember.avatar ? (
                        <img 
                          src={assignedMember.avatar} 
                          alt={assignedMember.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="w-full h-full bg-buildease-blue-500 text-white text-xs font-medium flex items-center justify-center">
                                  ${assignedMember.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                </div>
                              `;
                            }
                          }}
                        />
                      ) : (
                        <div className={`w-full h-full text-white text-xs font-medium flex items-center justify-center ${
                          assignedMember.status === 'active' 
                            ? 'bg-buildease-blue-500' 
                            : 'bg-yellow-500'
                        }`}>
                          {assignedMember.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-700 font-medium truncate max-w-[100px]">
                      {assignedMember.name}
                    </span>
                  </div>
                ) : (
                  // Show quick assignment for unassigned tasks - direct AssigneeSelect
                  <AssigneeSelect
                    value={null}
                    onValueChange={handleQuickAssignment}
                    teamMembers={selectableMembers}
                    placeholder="🏷️ Assign"
                    variant="compact"
                    className="min-w-[120px]"
                    disabled={assignTaskMutation.isPending}
                    showWorkload={true}
                    showClearButton={false}
                  />
                )}
              </div>
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
      
      {/* Task Actions (hidden in selection mode) */}
      {!selectionMode && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 md:opacity-0 touch:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-11 w-11 p-0 active:scale-95 active:bg-slate-200 touch-manipulation"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[140px]">
              <DropdownMenuItem 
                onClick={onEdit}
                className="py-3 px-4 text-base font-medium active:bg-slate-100 cursor-pointer touch-manipulation"
              >
                <Edit3 className="h-5 w-5 mr-3" />
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={onDelete}
                className="py-3 px-4 text-base font-medium text-red-600 focus:text-red-600 active:bg-red-50 cursor-pointer touch-manipulation"
              >
                <Trash2 className="h-5 w-5 mr-3" />
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}