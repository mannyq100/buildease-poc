import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Calendar, 
  DollarSign, 
  Users, 
  Package, 
  ListTodo, 
  Edit2, 
  ChevronDown, 
  ChevronUp, 
  ChevronRight,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Define interfaces for team members and tasks
interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

interface TaskItem {
  id: string;
  name: string;
  duration?: string;
  status?: 'pending' | 'in-progress' | 'completed';
  assignedTo?: string;
}

interface MaterialItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
}

interface PhaseCardProps {
  name: string;
  progress: number;
  startDate?: string;
  endDate?: string;
  status: 'completed' | 'in-progress' | 'upcoming' | 'warning' | 'optimized';
  budget?: string;
  spent?: string;
  duration?: string;
  onClick?: () => void;
  className?: string;
  simplified?: boolean;
  // Extended properties from ProjectPlan/PhaseCard
  expanded?: boolean;
  onToggleExpand?: () => void;
  tasks?: TaskItem[];
  materials?: MaterialItem[];
  team?: TeamMember[];
  onAddTask?: () => void;
  onAddMaterial?: () => void;
  onEditPhase?: () => void;
  editable?: boolean;
}

export const PhaseCard: React.FC<PhaseCardProps> = ({ 
  name, 
  progress, 
  startDate, 
  endDate, 
  status,
  budget,
  spent,
  duration,
  onClick,
  className,
  simplified = false,
  // Extended properties
  expanded = false,
  onToggleExpand,
  tasks = [],
  materials = [],
  team = [],
  onAddTask,
  onAddMaterial,
  onEditPhase,
  editable = false
}) => {
  const statusConfig = {
    'completed': { 
      bg: 'bg-green-100', 
      text: 'text-green-600', 
      label: 'Completed',
      border: 'border-green-200',
      darkBg: 'dark:bg-green-900/30',
      darkText: 'dark:text-green-400',
      darkBorder: 'dark:border-green-800/50',
      icon: '✓'
    },
    'in-progress': { 
      bg: 'bg-blue-100', 
      text: 'text-blue-600', 
      label: 'In Progress',
      border: 'border-blue-200',
      darkBg: 'dark:bg-blue-900/30',
      darkText: 'dark:text-blue-400',
      darkBorder: 'dark:border-blue-800/50',
      icon: '→'
    },
    'upcoming': { 
      bg: 'bg-gray-100', 
      text: 'text-gray-600', 
      label: 'Upcoming',
      border: 'border-gray-200',
      darkBg: 'dark:bg-gray-900/30',
      darkText: 'dark:text-gray-400',
      darkBorder: 'dark:border-gray-800/50',
      icon: '○'
    },
    'warning': { 
      bg: 'bg-yellow-100', 
      text: 'text-yellow-600', 
      label: 'Needs Attention',
      border: 'border-yellow-200',
      darkBg: 'dark:bg-yellow-900/30',
      darkText: 'dark:text-yellow-400',
      darkBorder: 'dark:border-yellow-800/50',
      icon: '⚠'
    },
    'optimized': { 
      bg: 'bg-purple-100', 
      text: 'text-purple-600', 
      label: 'AI Optimized',
      border: 'border-purple-200',
      darkBg: 'dark:bg-purple-900/30',
      darkText: 'dark:text-purple-400',
      darkBorder: 'dark:border-purple-800/50',
      icon: '★'
    }
  };

  const getProgressColor = () => {
    if (progress >= 100) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (progress >= 75) return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    if (progress >= 50) return 'bg-gradient-to-r from-indigo-500 to-blue-500';
    if (progress >= 25) return 'bg-gradient-to-r from-purple-500 to-indigo-500';
    return 'bg-gradient-to-r from-slate-500 to-gray-500';
  };

  // Simplified version for list views
  if (simplified) {
    return (
      <div className={cn(
        "flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all", 
        className,
        statusConfig[status].border,
        statusConfig[status].darkBorder
      )}>
        <div className="space-y-2 flex-1">
          <div className="flex justify-between">
            <h3 className="font-medium flex items-center">
              <span className="mr-1.5">
                {statusConfig[status].icon}
              </span>
              {name}
            </h3>
            <Badge className={cn(
              statusConfig[status].bg, 
              statusConfig[status].text,
              statusConfig[status].darkBg,
              statusConfig[status].darkText
            )}>
              {statusConfig[status].label}
            </Badge>
          </div>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            {startDate && endDate && <span>{startDate} - {endDate}</span>}
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={cn("h-full rounded-full", getProgressColor())} 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  // Expandable version with detailed content
  return (
    <LazyMotion features={domAnimation}>
      <m.div 
        whileHover={!expanded ? { y: -2 } : {}}
        className={cn(
          "border rounded-lg p-4 transition-all duration-300", 
          !expanded && "hover:shadow-md",
          className,
          statusConfig[status].border,
          statusConfig[status].darkBorder
        )}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium flex items-center">
              <span className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center mr-2 text-xs font-bold",
                statusConfig[status].bg,
                statusConfig[status].text,
                statusConfig[status].darkBg,
                statusConfig[status].darkText
              )}>
                {statusConfig[status].icon}
              </span>
              {name}
            </h3>
            <div className="flex items-center flex-wrap gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
              {duration && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{duration}</span>
                </div>
              )}
              {(startDate && endDate) && (
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{startDate} - {endDate}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {editable && onEditPhase && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={onEditPhase}
              >
                <Edit2 className="h-4 w-4" />
                <span className="sr-only">Edit Phase</span>
              </Button>
            )}
            <Badge className={cn(
              statusConfig[status].bg, 
              statusConfig[status].text,
              statusConfig[status].darkBg,
              statusConfig[status].darkText
            )}>
              {statusConfig[status].label}
            </Badge>
            {onToggleExpand && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={onToggleExpand}
              >
                {expanded ? 
                  <ChevronUp className="h-4 w-4" /> : 
                  <ChevronDown className="h-4 w-4" />
                }
                <span className="sr-only">
                  {expanded ? 'Collapse' : 'Expand'}
                </span>
              </Button>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full", getProgressColor())} 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{progress}% Complete</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {(budget && spent) && (
            <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-md">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1 text-green-600 dark:text-green-400" />
                  <span className="text-gray-700 dark:text-gray-300">Budget</span>
                </div>
                <span className="font-medium">{budget}</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-gray-600 dark:text-gray-400 ml-5">Spent</span>
                <span className="text-gray-600 dark:text-gray-400">{spent}</span>
              </div>
            </div>
          )}
        </div>

        {/* Expandable content */}
        {expanded && (
          <div className="mt-4 space-y-4">
            {/* Team section */}
            {team && team.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium flex items-center">
                    <Users className="w-4 h-4 mr-1.5" />
                    Team Members
                  </h4>
                  <span className="text-xs text-gray-500">{team.length} members</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {team.map(member => (
                    <TooltipProvider key={member.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Avatar className="h-8 w-8 border-2 border-white dark:border-gray-800">
                            {member.avatar ? (
                              <AvatarImage src={member.avatar} alt={member.name} />
                            ) : (
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            )}
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.role}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>
            )}

            {/* Tasks section */}
            {tasks && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium flex items-center">
                    <ListTodo className="w-4 h-4 mr-1.5" />
                    Tasks
                  </h4>
                  {editable && onAddTask && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2 text-xs"
                      onClick={onAddTask}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Task
                    </Button>
                  )}
                </div>
                {tasks.length > 0 ? (
                  <div className="space-y-2">
                    {tasks.map(task => (
                      <div 
                        key={task.id} 
                        className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-md text-sm flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium">{task.name}</div>
                          {task.duration && (
                            <div className="text-xs text-gray-500 flex items-center mt-0.5">
                              <Clock className="w-3 h-3 mr-1" />
                              {task.duration}
                            </div>
                          )}
                        </div>
                        {task.status && (
                          <Badge 
                            variant="outline" 
                            className={cn(
                              task.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              task.status === 'in-progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                              'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                            )}
                          >
                            {task.status === 'completed' ? 'Completed' : 
                             task.status === 'in-progress' ? 'In Progress' : 'Pending'}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">No tasks added yet</div>
                )}
              </div>
            )}

            {/* Materials section */}
            {materials && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium flex items-center">
                    <Package className="w-4 h-4 mr-1.5" />
                    Materials
                  </h4>
                  {editable && onAddMaterial && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2 text-xs"
                      onClick={onAddMaterial}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Material
                    </Button>
                  )}
                </div>
                {materials.length > 0 ? (
                  <div className="space-y-2">
                    {materials.map(material => (
                      <div 
                        key={material.id} 
                        className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-md text-sm flex justify-between items-center"
                      >
                        <div className="font-medium">{material.name}</div>
                        <div className="text-gray-600 dark:text-gray-400">
                          {material.quantity} {material.unit}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">No materials added yet</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        {onClick && !expanded && (
          <div className="mt-4 flex justify-end">
            <Button 
              variant="ghost" 
              className="text-primary hover:bg-primary/10 transition-colors" 
              onClick={onClick}
            >
              View Details
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </m.div>
    </LazyMotion>
  );
};

export default PhaseCard; 