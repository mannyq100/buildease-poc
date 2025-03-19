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
  Plus,
  Save,
  XCircle,
  User,
  AlertCircle,
  CheckSquare,
  Shield,
  Clock3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { TeamMember, MaterialItem } from '@/types/project';

// Local version of task item
interface TaskItem {
  id: string;
  name: string;
  duration?: string;
  status?: 'pending' | 'in-progress' | 'completed';
  assignedTo?: string;
}

/**
 * Phase card component for displaying phase information.
 * Follows Buildese UI design principles for consistent visual hierarchy.
 */
export function PhaseCard({ 
  name, 
  progress = 0, 
  startDate, 
  endDate, 
  status,
  budget,
  spent,
  duration,
  team = [],
  tasks = [],
  warning,
  onClick,
  className,
  simplified = false,
  expanded = false,
  onToggleExpand,
  materials = [],
  materialItems, // Alias for backward compatibility
  taskItems, // Alias for backward compatibility
  onAddTask,
  onAddMaterial,
  onEditPhase,
  editable = false
}: PhaseCardProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [isEditing, setIsEditing] = useState(false);
  
  // Handle backward compatibility for team
  const teamArray = Array.isArray(team) ? team : [];
  const teamCount = typeof team === 'number' ? team : (Array.isArray(team) ? team.length : 0);
  
  // Handle backward compatibility for tasks
  const processedTaskItems = taskItems || (Array.isArray(tasks) ? tasks : []);
  const taskCount = typeof tasks === 'number' ? tasks : (Array.isArray(tasks) ? tasks.length : 0);
  
  // Handle backward compatibility for materials
  const processedMaterialItems = materialItems || materials || [];
  
  // Toggle expanded state
  const toggleExpanded = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    if (onToggleExpand) {
      onToggleExpand();
    }
  };
  
  // Handle editing
  const startEditing = () => {
    setIsEditing(true);
  };
  
  const cancelEditing = () => {
    setIsEditing(false);
  };
  
  const saveEdits = () => {
    // Save logic would go here
    setIsEditing(false);
  };
  
  // Get status badge classes based on status
  const getStatusClasses = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'upcoming':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'warning':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'optimized':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };
  
  // Get status text
  const getStatusText = () => {
    switch (status) {
      case 'optimized':
        return 'Optimized';
      case 'warning':
        return 'Needs Attention';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
    }
  };
  
  // Get progress color
  const getProgressColor = () => {
    if (status === 'warning') return 'bg-amber-500 dark:bg-amber-600';
    if (status === 'completed') return 'bg-green-500 dark:bg-green-600';
    if (status === 'optimized') return 'bg-purple-500 dark:bg-purple-600';
    return 'bg-blue-500 dark:bg-blue-600';
  };
  
  // Render task item
  const renderTaskItem = (task: TaskItem, index: number) => {
    const statusClasses = {
      'completed': 'text-green-600 dark:text-green-400',
      'in-progress': 'text-blue-600 dark:text-blue-400',
      'pending': 'text-gray-600 dark:text-gray-400'
    };
    
    const statusClass = task.status ? statusClasses[task.status] : statusClasses.pending;
    
    return (
      <div key={task.id || index} className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full", statusClass)} />
          <span className="font-medium text-sm">{task.name}</span>
        </div>
        <div className="flex items-center gap-3">
          {task.duration && (
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Clock className="h-3 w-3" /> {task.duration}
            </span>
          )}
          {task.assignedTo && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {getInitials(task.assignedTo)}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{task.assignedTo}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    );
  };
  
  // Render material item
  const renderMaterialItem = (material: MaterialItem, index: number) => {
    return (
      <div key={material.id || index} className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span className="font-medium text-sm">{material.name}</span>
        </div>
        <div className="flex items-center gap-3">
          {material.quantity && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {material.quantity} {material.unit || 'pcs'}
            </span>
          )}
          {material.cost && (
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <DollarSign className="h-3 w-3" /> {material.cost}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div 
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden',
        'transition-all duration-200',
        onClick ? 'cursor-pointer hover:shadow-md' : '',
        className
      )}
      onClick={onClick}
    >
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-medium text-lg">{name}</h3>
            
            {/* Status Badge */}
            <Badge variant="outline" className={cn(getStatusClasses(), 'text-xs font-medium')}>
              {getStatusText()}
            </Badge>
          </div>
          
          {/* Warning icon if warning exists */}
          {warning && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-amber-500 dark:text-amber-400">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">{warning}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {/* Edit button if editable */}
          {editable && !isEditing && (
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); startEditing(); }}>
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
          
          {/* Save/Cancel buttons if editing */}
          {isEditing && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); saveEdits(); }}>
                <Save className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); cancelEditing(); }}>
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        {/* Progress bar if progress is provided */}
        {typeof progress === 'number' && (
          <div className="mt-3">
            <Progress value={progress} className="h-1.5" indicatorClassName={getProgressColor()} />
          </div>
        )}
        
        {/* Metrics row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          {/* Duration */}
          {duration && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{duration}</span>
            </div>
          )}
          
          {/* Date range */}
          {(startDate || endDate) && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {startDate && endDate ? `${startDate} - ${endDate}` : startDate || endDate}
              </span>
            </div>
          )}
          
          {/* Budget */}
          {budget && (
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {spent ? `${spent} / ${budget}` : budget}
              </span>
            </div>
          )}
          
          {/* Team */}
          {(teamCount > 0 || teamArray.length > 0) && (
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {teamCount || teamArray.length} team members
              </span>
            </div>
          )}
          
          {/* Tasks */}
          {(taskCount > 0 || processedTaskItems.length > 0) && (
            <div className="flex items-center gap-1.5">
              <ListTodo className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {taskCount || processedTaskItems.length} tasks
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Expandable sections */}
      {(!simplified && (processedTaskItems.length > 0 || processedMaterialItems.length > 0 || teamArray.length > 0)) && (
        <div className="px-4 pb-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs w-full justify-between mt-2 py-1 h-auto" 
            onClick={(e) => { e.stopPropagation(); toggleExpanded(); }}
          >
            Details
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      )}
      
      {/* Expanded details */}
      {isExpanded && (
        <div className="px-4 pb-4 animate-in slide-in-from-top duration-300 ease-in-out">
          {/* Tasks section */}
          {processedTaskItems.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Tasks</h4>
                {onAddTask && (
                  <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); onAddTask(); }}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <Separator className="mb-2" />
              <div className="space-y-1">
                {processedTaskItems.map(renderTaskItem)}
              </div>
            </div>
          )}
          
          {/* Materials section */}
          {processedMaterialItems.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Materials</h4>
                {onAddMaterial && (
                  <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); onAddMaterial(); }}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <Separator className="mb-2" />
              <div className="space-y-1">
                {processedMaterialItems.map(renderMaterialItem)}
              </div>
            </div>
          )}
          
          {/* Team section */}
          {teamArray.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Team</h4>
              </div>
              <Separator className="mb-2" />
              <div className="flex flex-wrap gap-2">
                {teamArray.map((member, index) => (
                  <TooltipProvider key={member.id || index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Avatar className="h-8 w-8">
                          {member.avatar && <AvatarImage src={member.avatar} alt={member.name} />}
                          <AvatarFallback className="text-xs">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-sm">
                          <p className="font-medium">{member.name}</p>
                          {member.role && <p className="text-xs text-gray-500 dark:text-gray-400">{member.role}</p>}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Phase card component props.
 */
export interface PhaseCardProps {
  name: string;
  progress?: number;
  startDate?: string;
  endDate?: string;
  // Extended status options to support both implementations
  status: 'completed' | 'in-progress' | 'upcoming' | 'warning' | 'optimized';
  budget?: string;
  spent?: string;
  duration?: string;
  team?: TeamMember[] | number; // Support both team members array and team count
  tasks?: TaskItem[] | number; // Support both task items array and task count
  warning?: string; // From ProjectPlan implementation
  onClick?: () => void;
  className?: string;
  simplified?: boolean;
  expanded?: boolean;
  onToggleExpand?: () => void;
  materials?: MaterialItem[];
  materialItems?: MaterialItem[]; // Alias for backward compatibility
  taskItems?: TaskItem[]; // Alias for backward compatibility
  onAddTask?: () => void;
  onAddMaterial?: () => void;
  onEditPhase?: () => void;
  editable?: boolean;
}

/**
 * Helper to get initials from a name.
 * @param name The name to get initials from.
 * @returns The initials of the name.
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
}