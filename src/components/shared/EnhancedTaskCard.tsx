/**
 * Enhanced TaskCard with Assignment Functionality
 * Sprint 3.3.1: Individual task assignment with assignee dropdown
 * Mobile-optimized with inline assignment, team member avatars, and quick actions
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AssigneeSelect } from '@/components/ui/AssigneeSelect';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  CheckCircle2,
  Clock,
  Edit3,
  Trash2,
  MoreVertical,
  UserPlus,
  Calendar
} from 'lucide-react';

import { cn } from '@/utils/core/ui';
import { format, parseISO, differenceInDays } from 'date-fns';
import { getTaskStatusColor, getTaskStatusIconColor, getTaskPriorityColor } from '@/utils/core/taskColors';
import { useTaskAssignment, useProjectTeamMembers } from '@/hooks/mutations';
import { EnhancedTask } from '@/types/projectDetails';

interface EnhancedTaskCardProps {
  task: EnhancedTask;
  projectId: string;
  phaseId: string;
  index?: number;
  onEdit: () => void;
  onDelete: () => void;
  compact?: boolean;
  showAssignee?: boolean;
  allowAssignment?: boolean;
  className?: string;
}

/**
 * Enhanced TaskCard with inline assignment functionality
 * Features:
 * - Inline assignee dropdown with search
 * - Team member avatars with workload indicators
 * - Quick task actions (edit, delete, assign)
 * - Mobile-optimized touch targets
 * - Optimistic updates for assignments
 * - Activity tracking for assignments
 */
export function EnhancedTaskCard({
  task,
  projectId,
  phaseId,
  index = 0,
  onEdit,
  onDelete,
  compact = false,
  showAssignee = true,
  allowAssignment = true,
  className
}: EnhancedTaskCardProps) {
  const [showAssignmentDropdown, setShowAssignmentDropdown] = useState(false);
  
  // Get team members for assignment
  const teamMembersQuery = useProjectTeamMembers(projectId);
  const teamMembers = useMemo(() => {
    if (!teamMembersQuery.queryFn) return [];
    // This would be used with React Query in practice
    return []; // Placeholder - would come from actual query
  }, [teamMembersQuery]);

  // Task assignment mutation
  const assignTaskMutation = useTaskAssignment();

  // Handle assignment change
  const handleAssignmentChange = async (assignedTo: string | null) => {
    try {
      await assignTaskMutation.mutateAsync({
        taskId: task.id,
        assignedTo,
        projectId,
        taskTitle: task.title
      });
      setShowAssignmentDropdown(false);
    } catch (error) {
      console.error('Failed to assign task:', error);
    }
  };

  // Format due date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = parseISO(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Calculate days remaining
  const getDaysRemaining = (dateString?: string) => {
    if (!dateString) return null;
    try {
      const dueDate = parseISO(dateString);
      const today = new Date();
      return differenceInDays(dueDate, today);
    } catch (error) {
      return null;
    }
  };

  const daysRemaining = getDaysRemaining(task.due_date);
  const isOverdue = daysRemaining !== null && daysRemaining < 0;
  const isUrgent = daysRemaining !== null && daysRemaining <= 3 && daysRemaining >= 0;

  // Get current assignee info (mock for now)
  const currentAssignee = task.assigned_to ? {
    id: task.assigned_to,
    name: 'Team Member', // Would come from user lookup
    role: 'Worker',
    avatar: undefined
  } : null;

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200/40',
          'hover:bg-slate-50/50 transition-all duration-200 group shadow-sm hover:shadow-md',
          'min-h-[48px]',
          index === 0 && 'animate-in fade-in slide-in-from-left-2',
          className
        )}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <CheckCircle2 
            className={cn(
              'h-4 w-4 flex-shrink-0 transition-colors duration-200',
              getTaskStatusIconColor(task.status),
              task.status?.toUpperCase() === 'COMPLETED' && 'fill-current'
            )}
          />
          <div className="flex-1 min-w-0">
            <span className={cn(
              'text-sm font-medium',
              task.status?.toUpperCase() === 'COMPLETED' ? 'line-through text-slate-500' : 'text-slate-900'
            )}>
              {task.title}
            </span>
            <div className="flex items-center gap-2 mt-1">
              {task.assigned_to && currentAssignee && (
                <div className="flex items-center gap-1">
                  <Avatar className="h-4 w-4">
                    <AvatarFallback className="text-xs bg-blue-500 text-white">
                      {currentAssignee.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-buildease-blue-700">{currentAssignee.name}</span>
                </div>
              )}
              {task.due_date && (
                <span className={cn(
                  'text-xs flex items-center gap-1',
                  isOverdue ? 'text-red-600' : isUrgent ? 'text-amber-600' : 'text-slate-500'
                )}>
                  <Clock className="h-3 w-3" />
                  {formatDate(task.due_date)}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {allowAssignment && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setShowAssignmentDropdown(true)}
                  >
                    <UserPlus className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Assign task</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn(
      'overflow-hidden border border-blue-200 hover:border-blue-300',
      'transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-blue-200/50',
      'group relative',
      className
    )}>
      <CardContent className="p-0">
        {/* Status and Priority Header */}
        <div className="flex justify-between items-center relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          
          <Badge className={cn(
            'rounded-none rounded-tr-none rounded-bl-none px-3 py-1 text-xs font-medium relative z-10',
            getTaskStatusColor(task.status)
          )}>
            <div className="flex items-center gap-1">
              <div className={cn('w-2 h-2 rounded-full', getTaskStatusIconColor(task.status))} />
              {task.status?.replace('_', ' ').toLowerCase()}
            </div>
          </Badge>
          
          <Badge variant="outline" className={cn(
            'rounded-none rounded-tl-none rounded-br-none border-t-0 border-r-0 px-3 py-1 text-xs font-medium',
            getTaskPriorityColor(task.priority)
          )}>
            {task.priority} Priority
          </Badge>
        </div>
        
        <div className="p-4 pt-3">
          {/* Title and Description */}
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-gray-700 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          
          {/* Assignment Section */}
          {showAssignee && allowAssignment && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Assignee</label>
                {showAssignmentDropdown && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowAssignmentDropdown(false)}
                    className="h-6 text-xs"
                  >
                    Cancel
                  </Button>
                )}
              </div>
              
              {showAssignmentDropdown ? (
                <AssigneeSelect
                  value={task.assigned_to}
                  onValueChange={handleAssignmentChange}
                  teamMembers={teamMembers}
                  placeholder="Select team member..."
                  className="mb-2"
                  showWorkload={true}
                  showClearButton={true}
                />
              ) : (
                <div
                  className={cn(
                    'flex items-center gap-2 p-2 rounded-md border border-gray-200',
                    'hover:border-blue-300 cursor-pointer transition-colors',
                    'min-h-[40px]'
                  )}
                  onClick={() => setShowAssignmentDropdown(true)}
                >
                  {currentAssignee ? (
                    <>
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-blue-500 text-white">
                          {currentAssignee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-900">{currentAssignee.name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {currentAssignee.role}
                        </Badge>
                      </div>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">Click to assign...</span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Due Date and Metadata */}
          <div className="flex justify-between items-end">
            <div className="flex items-center text-sm">
              <Calendar className={cn(
                "h-4 w-4 mr-2 transition-colors duration-200",
                isOverdue ? "text-red-500" : isUrgent ? "text-amber-500" : "text-gray-500"
              )} />
              <span className={cn(
                "transition-colors duration-200",
                isOverdue ? "text-red-600" : isUrgent ? "text-amber-600" : "text-gray-700"
              )}>
                {formatDate(task.due_date) || 'No due date'}
              </span>
              {isOverdue && (
                <span className="ml-2 text-xs text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded-full">
                  {Math.abs(daysRemaining!)}d overdue
                </span>
              )}
              {isUrgent && (
                <span className="ml-2 text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full">
                  {daysRemaining}d left
                </span>
              )}
            </div>
            
            {/* Task Actions */}
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={onEdit}
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onDelete}
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}