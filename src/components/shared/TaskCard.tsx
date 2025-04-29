/**
 * Unified TaskCard component for displaying task details across the application
 * This component consolidates functionality from separate task cards in phases and schedule
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import {
  Calendar,
  MessageSquare,
  Paperclip,
  Clock,
  Link2,
  UserRound,
  MoreVertical,
  ArrowRight
} from 'lucide-react';

import { Task, TeamMember } from '@/types/schedule';
import { cn } from '@/utils/core/ui';
import { format, parseISO, differenceInDays } from 'date-fns';

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

  // Helper functions for styling
  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-400';
    
    switch(status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500';
      case 'in progress':
        return 'bg-blue-500';
      case 'not started':
        return 'bg-gray-500';
      case 'delayed':
        return 'bg-amber-500';
      case 'blocked':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };
  
  const getStatusBadgeClass = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch(status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'not started':
        return 'bg-gray-100 text-gray-800';
      case 'delayed':
        return 'bg-amber-100 text-amber-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority?: string) => {
    if (!priority) return 'text-gray-500';
    
    switch(priority.toLowerCase()) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-amber-600 dark:text-amber-400';
      case 'low':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };
  
  const getPriorityBadgeClass = (priority?: string) => {
    if (!priority) return 'text-gray-800 border-gray-300';
    
    switch(priority.toLowerCase()) {
      case 'high':
        return 'text-red-800 border-red-300';
      case 'medium':
        return 'text-amber-800 border-amber-300';
      case 'low':
        return 'text-green-800 border-green-300';
      default:
        return 'text-gray-800 border-gray-300';
    }
  };

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

  // Get status and priority colors
  const statusColor = getStatusColor(taskValues.status);
  const statusBadgeClass = getStatusBadgeClass(taskValues.status);
  const priorityColor = getPriorityColor(taskValues.priority);
  const priorityBadgeClass = getPriorityBadgeClass(taskValues.priority);
  
  // Format date and calculate days remaining
  const formattedDueDate = formatDate(taskValues.dueDate);
  const daysRemaining = getDaysRemaining(taskValues.dueDate);
  const overdueDays = getOverdueDays(taskValues.dueDate);
  
  // Card content
  const cardContent = (
    <Card 
      className={cn(
        'overflow-hidden border border-blue-200 hover:border-blue-300 dark:border-blue-800/30 dark:hover:border-blue-700/50',
        'transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer',
        className
      )}
      onClick={handleClick}
    >
      <CardContent className="p-0">
        {/* Status badge at top */}
        <div className="flex justify-between items-center">
          <Badge className={cn(
            'rounded-none rounded-tr-none rounded-bl-none px-3 py-1 text-xs font-medium',
            statusBadgeClass
          )}>
            {taskValues.status}
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
          
          {/* Progress bar */}
          <div className="mb-2">
            <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{taskValues.completion || 0}%</span>
            </div>
            <Progress 
              value={taskValues.completion || 0} 
              className="h-2 bg-gray-100 dark:bg-gray-700" 
            />
          </div>
          
          {/* Due date and metadata */}
          <div className="flex justify-between items-end mt-3">
            {/* Due date */}
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <span>{formattedDueDate}</span>
              {overdueDays && (
                <span className="ml-2 text-xs text-red-600 font-medium">
                  {overdueDays}
                </span>
              )}
            </div>
            
            {/* Comments and attachments */}
            <div className="flex items-center space-x-3 text-gray-500">
              {taskValues.commentsCount > 0 && (
                <div className="flex items-center text-xs">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  <span>{taskValues.commentsCount}</span>
                </div>
              )}
              
              {taskValues.attachmentsCount > 0 && (
                <div className="flex items-center text-xs">
                  <Paperclip className="h-4 w-4 mr-1" />
                  <span>{taskValues.attachmentsCount}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Assignees */}
          {taskValues.assignees && taskValues.assignees.length > 0 && (
            <div className="flex justify-end mt-3">
              <div className="flex -space-x-2">
                {taskValues.assignees.slice(0, 3).map((assignee, index) => (
                  <Avatar 
                    key={typeof assignee.id === 'string' ? assignee.id : `assignee-${index}`} 
                    className="h-6 w-6 border-2 border-white dark:border-slate-800"
                  >
                    {assignee.avatar ? (
                      <AvatarImage src={assignee.avatar} alt={assignee.name} />
                    ) : (
                      <AvatarFallback className="text-xs bg-blue-500 text-white">
                        {assignee.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    )}
                  </Avatar>
                ))}
                
                {taskValues.assignees.length > 3 && (
                  <Avatar className="h-6 w-6 border-2 border-white dark:border-slate-800 bg-gray-200 dark:bg-slate-700">
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
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
      >
        {cardContent}
      </m.div>
    </LazyMotion>
  ) : cardContent;
}
