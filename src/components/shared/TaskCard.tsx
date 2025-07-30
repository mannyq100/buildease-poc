/**
 * Unified TaskCard component for displaying task details across the application
 * This component consolidates functionality from separate task cards in phases and schedule
 */
import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import {
  Calendar,
  MessageSquare,
  Paperclip,
  ArrowRight
} from 'lucide-react';

import { Task, TeamMember } from '@/types/schedule';
import { cn } from '@/utils/core/ui';
import { format, parseISO, differenceInDays } from 'date-fns';
import { getTaskStatusColor, getTaskStatusIconColor, getTaskPriorityColor } from '@/utils/core/taskColors';

// Interface for assignees if passed directly (not via Task object)
export interface Assignee {
  id: number | string;
  name: string;
  avatar?: string | null;
}

// Phase-specific task type that matches the structure used in phases
export interface PhaseTask {
  title: string;
  description: string;
  dueDate: string;
  status: 'completed' | 'in-progress' | 'pending' | 'delayed' | 'Not Started' | 'In Progress' | 'Completed' | 'Delayed' | 'Blocked';
  priority: 'high' | 'medium' | 'low';
  progress?: number;
  completion?: number;
  assignees?: Assignee[];
  comments?: number;
  attachments?: number;
  dependencies?: number;
  project?: string;
  phase?: string;
}

// Consolidated TaskCard props that support both use cases
export interface TaskCardProps {
  /** Task object for schedule view */
  task?: Task;
  
  /** Individual task properties for phase view */
  title?: string;
  description?: string;
  dueDate?: string;
  status?: PhaseTask['status'];
  priority?: PhaseTask['priority'];
  progress?: number;
  completion?: number;
  assignees?: Assignee[];
  assignedTo?: TeamMember[];
  comments?: number;
  attachments?: number;
  dependencies?: number;
  project?: string;
  phase?: string;
  
  /** Additional styling and behavior */
  className?: string;
  onClick?: (task: Task | PhaseTask) => void;
  animate?: boolean;
}

/**
 * Enhanced TaskCard component that works for both phase and schedule views.
 * Follows BuildEase UI design principles:
 * - Card-based UI with subtle shadows
 * - Clear visual feedback
 * - Consistent spacing
 * - Modern, aesthetic look with warm blue primary color (#2B6CB0)
 */
export function TaskCard({
  task,
  title,
  description,
  dueDate,
  status,
  priority = 'medium',
  progress,
  completion,
  assignees = [],
  assignedTo = [],
  comments = 0,
  attachments = 0,
  dependencies = 0,
  project,
  phase,
  className,
  onClick,
  animate = true
}: TaskCardProps) {
  // Determine if we're using a Task object or individual props
  const usingTaskObject = !!task;
  
  // Extract values from task object if provided with useMemo to prevent recalculations
  const taskValues = useMemo(() => {
    return {
      title: usingTaskObject ? task.title : title,
      description: usingTaskObject ? task.description : description,
      dueDate: usingTaskObject ? task.dueDate : dueDate,
      status: usingTaskObject ? task.status : status,
      priority: usingTaskObject ? task.priority : priority,
      completion: usingTaskObject ? task.completion : (completion ?? progress),
      assignees: usingTaskObject ? 
        (task.assignedTo?.map(member => ({
          id: member.id,
          name: member.name,
          avatar: member.avatar
        })) || []) : 
        assignees,
      commentsCount: usingTaskObject ? (typeof task.comments === 'number' ? task.comments : 0) : comments,
      attachmentsCount: usingTaskObject ? (typeof task.attachments === 'number' ? task.attachments : 0) : attachments,
      dependenciesCount: usingTaskObject ? (task.dependencies?.length || 0) : dependencies,
      project: usingTaskObject ? task.project : project,
      phase: usingTaskObject ? task.phase : phase
    };
  }, [
    task, 
    title, 
    description, 
    dueDate, 
    status, 
    priority, 
    progress, 
    completion, 
    assignees, 
    assignedTo, 
    comments, 
    attachments, 
    dependencies,
    project,
    phase,
    usingTaskObject
  ]);

  // Use centralized color utilities - removed duplicate functions

  // Format due date as a more readable string
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

  // Calculate days remaining or overdue
  const getDaysRemaining = (dateString?: string) => {
    if (!dateString) return null;
    
    try {
      const dueDate = parseISO(dateString);
      const today = new Date();
      return differenceInDays(dueDate, today);
    } catch (error) {
      console.error('Error calculating days remaining:', error);
      return null;
    }
  };

  // Calculate overdue days for display
  const getOverdueDays = (dateString?: string) => {
    const daysRemaining = getDaysRemaining(dateString);
    if (daysRemaining === null) return '';
    if (daysRemaining >= 0) return '';
    return `${Math.abs(daysRemaining)}d overdue`;
  };

  // Event handler for card click
  const handleClick = () => {
    if (!onClick) return;
    
    if (usingTaskObject && task) {
      onClick(task);
    } else {
      // Create a synthetic task/phase task object from props
      const syntheticTask: PhaseTask = {
        title: taskValues.title || '',
        description: taskValues.description || '',
        dueDate: taskValues.dueDate || '',
        status: (taskValues.status as PhaseTask['status']) || 'pending',
        priority: (taskValues.priority as PhaseTask['priority']) || 'medium',
        progress: taskValues.completion,
        assignees: taskValues.assignees,
        comments: taskValues.commentsCount,
        attachments: taskValues.attachmentsCount,
        dependencies: taskValues.dependenciesCount,
        project: taskValues.project,
        phase: taskValues.phase
      };
      
      onClick(syntheticTask);
    }
  };

  // Get status and priority colors using centralized utilities
  const statusIconColor = getTaskStatusIconColor(taskValues.status || '');
  const statusBadgeClass = getTaskStatusColor(taskValues.status || '');
  const priorityBadgeClass = getTaskPriorityColor(taskValues.priority || '');
  
  // Format date and calculate days remaining
  const formattedDueDate = formatDate(taskValues.dueDate);
  const daysRemaining = getDaysRemaining(taskValues.dueDate);
  const overdueDays = getOverdueDays(taskValues.dueDate);
  
  // Card content
  const cardContent = (
    <Card 
      className={cn(
        'overflow-hidden border border-blue-200 hover:border-blue-300 dark:border-blue-800/30 dark:hover:border-blue-700/50',
        'transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-blue-200/50 dark:hover:shadow-blue-900/30 cursor-pointer',
        'hover:scale-[1.02] active:scale-[0.98] hover:-translate-y-1 active:translate-y-0',
        'focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:outline-none',
        'group relative',
        className
      )}
      onClick={handleClick}
    >
      <CardContent className="p-0">
        {/* Status badge at top */}
        <div className="flex justify-between items-center relative">
          {/* Hover indicator line */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          
          <Badge className={cn(
            'rounded-none rounded-tr-none rounded-bl-none px-3 py-1 text-xs font-medium relative z-10',
            'transition-all duration-200 group-hover:shadow-sm',
            statusBadgeClass
          )}>
            <div className="flex items-center gap-1">
              <div className={cn('w-2 h-2 rounded-full', statusIconColor)} />
              {taskValues.status}
            </div>
          </Badge>
          
          {taskValues.priority && (
            <Badge variant="outline" className={cn(
              'rounded-none rounded-tl-none rounded-br-none border-t-0 border-r-0 px-3 py-1 text-xs font-medium',
              priorityBadgeClass
            )}>
              {taskValues.priority.charAt(0).toUpperCase() + taskValues.priority.slice(1)} Priority
            </Badge>
          )}
        </div>
        
        <div className="p-4 pt-3">
          {/* Title and project/phase */}
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {taskValues.title}
            </h3>
            
            {(taskValues.project || taskValues.phase) && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                {taskValues.project && <span>{taskValues.project}</span>}
                {taskValues.project && taskValues.phase && (
                  <ArrowRight className="h-3 w-3 mx-1" />
                )}
                {taskValues.phase && <span>{taskValues.phase}</span>}
              </div>
            )}
          </div>
          
          {/* Description */}
          {taskValues.description && (
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
              {taskValues.description}
            </p>
          )}
          
          {/* Progress bar with enhanced styling */}
          <div className="mb-2">
            <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span className="font-medium">{taskValues.completion || 0}%</span>
            </div>
            <div className="relative">
              <Progress 
                value={taskValues.completion || 0} 
                className="h-2 bg-gray-100 dark:bg-gray-700 transition-all duration-300 group-hover:h-2.5" 
              />
              {/* Completion celebration effect */}
              {(taskValues.completion || 0) >= 100 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1 h-1 bg-green-400 rounded-full animate-ping" />
                </div>
              )}
            </div>
          </div>
          
          {/* Due date and metadata */}
          <div className="flex justify-between items-end mt-3">
            {/* Due date with enhanced visual feedback */}
            <div className="flex items-center text-sm">
              <Calendar className={cn(
                "h-4 w-4 mr-2 transition-colors duration-200",
                daysRemaining !== null && daysRemaining < 0 ? "text-red-500" : 
                daysRemaining !== null && daysRemaining <= 3 ? "text-amber-500" : 
                "text-gray-500 group-hover:text-blue-500"
              )} />
              <span className={cn(
                "transition-colors duration-200",
                daysRemaining !== null && daysRemaining < 0 ? "text-red-600" : 
                daysRemaining !== null && daysRemaining <= 3 ? "text-amber-600" : 
                "text-gray-700 dark:text-gray-300"
              )}>
                {formattedDueDate}
              </span>
              {overdueDays && (
                <span className="ml-2 text-xs text-red-600 font-medium bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full animate-pulse">
                  {overdueDays}
                </span>
              )}
              {daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 3 && (
                <span className="ml-2 text-xs text-amber-600 font-medium bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                  {daysRemaining}d left
                </span>
              )}
            </div>
            
            {/* Comments and attachments with hover effects */}
            <div className="flex items-center space-x-3 text-gray-500">
              {taskValues.commentsCount > 0 && (
                <div className="flex items-center text-xs transition-all duration-200 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-110 cursor-pointer">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  <span>{taskValues.commentsCount}</span>
                </div>
              )}
              
              {taskValues.attachmentsCount > 0 && (
                <div className="flex items-center text-xs transition-all duration-200 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-110 cursor-pointer">
                  <Paperclip className="h-4 w-4 mr-1" />
                  <span>{taskValues.attachmentsCount}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Assignees with enhanced hover effects */}
          {taskValues.assignees && taskValues.assignees.length > 0 && (
            <div className="flex justify-end mt-3">
              <div className="flex -space-x-2 group-hover:space-x-1 transition-all duration-300">
                {taskValues.assignees.slice(0, 3).map((assignee, index) => (
                  <Avatar 
                    key={typeof assignee.id === 'string' ? assignee.id : `assignee-${index}`} 
                    className="h-6 w-6 border-2 border-white dark:border-slate-800 transition-all duration-200 hover:scale-125 hover:z-10 cursor-pointer shadow-sm hover:shadow-md"
                    title={assignee.name}
                  >
                    {assignee.avatar ? (
                      <AvatarImage src={assignee.avatar} alt={assignee.name} />
                    ) : (
                      <AvatarFallback className="text-xs bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200">
                        {assignee.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    )}
                  </Avatar>
                ))}
                
                {taskValues.assignees.length > 3 && (
                  <Avatar className="h-6 w-6 border-2 border-white dark:border-slate-800 bg-gray-200 dark:bg-slate-700 transition-all duration-200 hover:scale-125 hover:z-10 cursor-pointer shadow-sm hover:shadow-md hover:bg-gray-300 dark:hover:bg-slate-600">
                    <AvatarFallback className="text-xs">+{taskValues.assignees.length - 3}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
  
  // Apply animation if enabled
  return animate ? (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ 
          y: -4, 
          scale: 1.02,
          transition: { duration: 0.2, ease: "easeOut" } 
        }}
        whileTap={{ 
          scale: 0.98, 
          transition: { duration: 0.1 } 
        }}
      >
        {cardContent}
      </m.div>
    </LazyMotion>
  ) : cardContent;
}
