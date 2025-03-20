import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Calendar, Image as ImageIcon, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export interface TeamMember {
  id: string | number;
  name: string;
  avatar?: string;
  role?: string;
}

export interface ProjectCardProps {
  /** Project details */
  title: string;
  description?: string;
  client: string;
  status: 'active' | 'completed' | 'pending' | 'delayed';
  progress?: number;
  imageUrl?: string;
  budget?: {
    total: number;
    spent: number;
    currency?: string;
  };
  startDate?: string;
  endDate?: string;
  team?: TeamMember[];
  documents?: number;
  phases?: number;
  
  /** Additional styling and behavior */
  className?: string;
  onClick?: () => void;
  animate?: boolean;
}

/**
 * ProjectCard component for displaying project information.
 * Follows Buildese UI design principles:
 * - Card-based UI with subtle shadows for depth
 * - Clear visual feedback for interactions
 * - Consistent spacing system
 * - Modern, aesthetic look with warm blue accents
 * - Progressive disclosure for complex tasks
 */
export function ProjectCard({
  title,
  client,
  status,
  progress = 0,
  imageUrl,
  startDate,
  endDate,
  team = [],
  className,
  onClick,
  animate = true
}: ProjectCardProps) {
  const statusConfig = {
    active: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-400',
      indicator: 'bg-blue-500'
    },
    completed: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-400',
      indicator: 'bg-green-500'
    },
    pending: {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-700 dark:text-amber-400',
      indicator: 'bg-amber-500'
    },
    delayed: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-400',
      indicator: 'bg-red-500'
    }
  };

  return (
    <Card 
      className={cn(
        'overflow-hidden transition-all duration-300 h-full flex flex-col',
        'hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 cursor-pointer',
        'border-2 border-transparent',
        className
      )}
      onClick={onClick}
    >
      {/* Project Image */}
      <div className="relative w-full h-48 overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-slate-400 dark:text-slate-600" />
          </div>
        )}
        
        {/* Status Badge Overlay */}
        <Badge 
          className={cn(
            'absolute top-3 right-3',
            statusConfig[status].bg,
            statusConfig[status].text
          )}
        >
          <div className={cn('w-2 h-2 rounded-full mr-1.5', statusConfig[status].indicator)} />
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        {/* Title */}
        <h3 className="text-lg font-semibold line-clamp-1 mb-1">{title}</h3>
        
        {/* Client */}
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <Building2 className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="line-clamp-1">{client}</span>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-auto space-y-2">
          {/* Timeline */}
          {startDate && endDate && (
            <div className="flex items-center text-xs text-muted-foreground mb-2">
              <Calendar className="h-3 w-3 mr-1.5 flex-shrink-0" />
              <span className="truncate">{startDate} - {endDate}</span>
            </div>
          )}
          
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
          
          {/* Team Count */}
          {team.length > 0 && (
            <div className="flex items-center justify-end text-xs text-muted-foreground mt-2">
              <Users className="h-3 w-3 mr-1.5" />
              <span>{team.length} member{team.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
