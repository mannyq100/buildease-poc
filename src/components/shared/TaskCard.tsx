/**
 * Unified TaskCard component for displaying task details across the application
 * This component consolidates functionality from separate task cards in phases and schedule
 */
import React from 'react';
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
  MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Task, TeamMember } from '@/types/schedule';

// Interface for assignees if passed directly (not via Task object)
interface Assignee {
  id: number | string;
  name: string;
  avatar?: string | null;
}

// Consolidated TaskCard props that support both use cases
interface TaskCardProps {
  /** Task object for schedule view */
  task?: Task;
  
  /** Individual task properties for phase view */
  title?: string;
  description?: string;
  dueDate?: string;
  status?: 'completed' | 'in-progress' | 'pending' | 'delayed';
  priority?: 'high' | 'medium' | 'low';
  progress?: number;
  completion?: number;
  assignees?: Assignee[];
  assignedTo?: TeamMember[];
  comments?: number;
  attachments?: number;
  dependencies?: number;
  project?: string;
  phase?: string;
  
  /** Additional styling */
  className?: string;
  
  /** Callback for click events */
  onClick?: (task: Task | {[key: string]: any}) => void;
  
  /** Animation enable flag */
  animate?: boolean;
}

/**
 * Enhanced TaskCard component that works for both phase and schedule views
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
  
  // Extract values from task object if provided
  const taskTitle = usingTaskObject ? task.title : title;
  const taskDescription = usingTaskObject ? task.description : description;
  const taskDueDate = usingTaskObject ? task.dueDate : dueDate;
  const taskStatus = usingTaskObject ? task.status : status;
  const taskPriority = usingTaskObject ? task.priority : priority;
  const taskProgress = usingTaskObject ? task.completion : (completion ?? progress);
  const taskProject = usingTaskObject ? task.project : project;
  const taskPhase = usingTaskObject ? task.phase : phase;
  
  // Extract assignees/team members from task if needed
  // Support both assignees and assignedTo for backward compatibility
  const taskAssignees = usingTaskObject ? task.assignedTo : (assignedTo.length > 0 ? assignedTo : assignees);
  const commentsCount = usingTaskObject ? (task.comments?.length || 0) : comments;
  const attachmentsCount = usingTaskObject ? (task.attachments?.length || 0) : attachments;
  const dependenciesCount = usingTaskObject ? (task.dependencies?.length || 0) : dependencies;
  
  // Check for dark mode
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  // Helper functions for styling
  const getStatusColor = (status?: string) => {
    if (!status) return '';
    
    const normalizedStatus = status.toLowerCase().replace(' ', '-');
    
    switch (normalizedStatus) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'in-progress':
      case 'in progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'not-started':
      case 'not started':
      case 'pending':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'delayed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'blocked':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };
  
  const getPriorityColor = (priority?: string) => {
    if (!priority) return '';
    
    const normalizedPriority = priority.toLowerCase();
    
    switch (normalizedPriority) {
      case 'high':
        return isDarkMode ? 'text-red-400' : 'text-red-600';
      case 'medium':
        return isDarkMode ? 'text-amber-400' : 'text-amber-600';
      case 'low':
        return isDarkMode ? 'text-green-400' : 'text-green-600';
      default:
        return isDarkMode ? 'text-gray-400' : 'text-gray-600';
    }
  };
  
  // Format due date as a more readable string
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', { 
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      return dateString; // Fallback to the original string if parsing fails
    }
  };
  
  // Calculate days remaining
  const getDaysRemaining = (dateString?: string) => {
    if (!dateString) return 0;
    
    try {
      const dueDate = new Date(dateString);
      const today = new Date();
      
      // Set both dates to midnight for accurate day calculation
      dueDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays;
    } catch (e) {
      return 0;
    }
  };
  
  // Event handler for card click
  const handleClick = () => {
    if (onClick) {
      onClick(usingTaskObject ? task! : {
        title: taskTitle,
        description: taskDescription,
        dueDate: taskDueDate,
        status: taskStatus,
        priority: taskPriority,
        completion: taskProgress,
        assignedTo: taskAssignees,
        comments: commentsCount,
        attachments: attachmentsCount,
        dependencies: dependenciesCount,
        project: taskProject,
        phase: taskPhase
      });
    }
  };
  
  const daysRemaining = taskDueDate ? getDaysRemaining(taskDueDate) : null;
  const formattedDueDate = taskDueDate ? formatDate(taskDueDate) : null;
  const statusColor = taskStatus ? getStatusColor(taskStatus) : '';
  const priorityColor = taskPriority ? getPriorityColor(taskPriority) : '';
  
  // Component rendering
  const cardContent = (
    <Card 
      className={cn(
        "border overflow-hidden transition-all duration-300",
        onClick ? "hover:shadow-md cursor-pointer" : "",
        className
      )}
      onClick={onClick ? handleClick : undefined}
    >
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header with Title and Status */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base md:text-lg line-clamp-2">{taskTitle}</h3>
            {taskStatus && (
              <Badge className={statusColor}>
                {taskStatus}
              </Badge>
            )}
          </div>
          
          {/* Project and Phase Info (if available) */}
          {(taskProject || taskPhase) && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              {taskProject && <span>{taskProject}</span>}
              {taskProject && taskPhase && <span className="mx-2">&#8226;</span>}
              {taskPhase && <span>{taskPhase}</span>}
            </div>
          )}
          
          {/* Description */}
          {taskDescription && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{taskDescription}</p>
          )}
          
          {/* Progress Bar (if available) */}
          {typeof taskProgress === 'number' && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Progress</span>
                <span>{taskProgress}%</span>
              </div>
              <Progress value={taskProgress} className="h-2" />
            </div>
          )}
          
          {/* Due Date and Priority */}
          <div className="flex flex-wrap items-center justify-between text-sm gap-2">
            {formattedDueDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">{formattedDueDate}</span>
                {daysRemaining !== null && (
                  <span className={cn(
                    "ml-1 text-xs",
                    daysRemaining < 0 ? 'text-red-500 dark:text-red-400' :
                    daysRemaining <= 3 ? 'text-amber-500 dark:text-amber-400' :
                    'text-green-500 dark:text-green-400'
                  )}>
                    {daysRemaining < 0 ? `${Math.abs(daysRemaining)}d overdue` :
                     daysRemaining === 0 ? 'Today' :
                     daysRemaining === 1 ? 'Tomorrow' :
                     `${daysRemaining}d left`}
                  </span>
                )}
              </div>
            )}
            
            {taskPriority && (
              <div className={cn(
                "text-xs font-medium",
                priorityColor
              )}>
                {taskPriority.charAt(0).toUpperCase() + taskPriority.slice(1)} Priority
              </div>
            )}
          </div>
          
          {/* Footer with assignees and metadata */}
          <div className="flex items-center justify-between pt-1">
            {/* Assignees */}
            <div className="flex -space-x-2">
              {taskAssignees && taskAssignees.length > 0 ? (
                taskAssignees.slice(0, 3).map((assignee, index) => (
                  <Avatar key={typeof assignee.id === 'string' ? assignee.id : `assignee-${index}`} className="h-6 w-6 border-2 border-white dark:border-slate-800">
                    {assignee.avatar ? (
                      <AvatarImage src={assignee.avatar} alt={assignee.name} />
                    ) : (
                      <AvatarFallback className="text-xs">
                        {assignee.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    )}
                  </Avatar>
                ))
              ) : (
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <UserRound className="h-4 w-4 mr-1" />
                  <span>Unassigned</span>
                </div>
              )}
              
              {taskAssignees && taskAssignees.length > 3 && (
                <Avatar className="h-6 w-6 border-2 border-white dark:border-slate-800 bg-gray-200 dark:bg-slate-700">
                  <AvatarFallback className="text-xs">+{taskAssignees.length - 3}</AvatarFallback>
                </Avatar>
              )}
            </div>
            
            {/* Metadata icons */}
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
              {attachmentsCount > 0 && (
                <div className="flex items-center text-xs">
                  <Paperclip className="h-3.5 w-3.5 mr-1" />
                  <span>{attachmentsCount}</span>
                </div>
              )}
              
              {commentsCount > 0 && (
                <div className="flex items-center text-xs">
                  <MessageSquare className="h-3.5 w-3.5 mr-1" />
                  <span>{commentsCount}</span>
                </div>
              )}
              
              {dependenciesCount > 0 && (
                <div className="flex items-center text-xs">
                  <Link2 className="h-3.5 w-3.5 mr-1" />
                  <span>{dependenciesCount}</span>
                </div>
              )}
            </div>
          </div>
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
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
      >
        {cardContent}
      </m.div>
    </LazyMotion>
  ) : cardContent;
}
