import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Calendar,
  Building2,
  Users,
  FileText,
  Clock,
  BarChart2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TeamMember {
  id: string | number;
  name: string;
  avatar?: string;
  role?: string;
}

export interface ProjectCardProps {
  /** Project details */
  title: string;
  description: string;
  client: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'pending' | 'delayed';
  progress: number;
  budget?: {
    total: number;
    spent: number;
    currency?: string;
  };
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
  description,
  client,
  startDate,
  endDate,
  status,
  progress,
  budget,
  team = [],
  documents = 0,
  phases = 0,
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
        'overflow-hidden transition-all duration-300',
        'hover:shadow-md cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="p-6 space-y-4">
        {/* Header with Title and Status */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          </div>
          <Badge 
            className={cn(
              'flex items-center',
              statusConfig[status].bg,
              statusConfig[status].text
            )}
          >
            <div className={cn('w-2 h-2 rounded-full mr-1.5', statusConfig[status].indicator)} />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>

        {/* Client and Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Building2 className="h-4 w-4 mr-2" />
            {client}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{startDate} - {endDate}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Budget if available */}
        {budget && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-muted-foreground">
              <BarChart2 className="h-4 w-4 mr-2" />
              Budget
            </div>
            <div className="font-medium">
              {budget.currency || '$'}{budget.spent.toLocaleString()} / {budget.currency || '$'}{budget.total.toLocaleString()}
            </div>
          </div>
        )}

        {/* Stats and Team */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1.5" />
              {phases} Phases
            </div>
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-1.5" />
              {documents} Docs
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1.5" />
              {team.length} Members
            </div>
          </div>
          
          {/* Team Avatars */}
          {team.length > 0 && (
            <div className="flex -space-x-2">
              {team.slice(0, 3).map(member => (
                <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              ))}
              {team.length > 3 && (
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                  +{team.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
