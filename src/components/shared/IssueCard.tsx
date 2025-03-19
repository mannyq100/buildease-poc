import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  AlertTriangle,
  Calendar,
  Clock,
  Tag,
  MessageSquare,
  Link2,
  ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface IssueRelation {
  id: string | number;
  type: 'blocks' | 'blocked-by' | 'related' | 'duplicates' | 'duplicated-by';
  issueId: string | number;
  issueTitle: string;
}

export interface IssueDetails {
  id: string | number;
  title: string;
  description: string;
  type: 'bug' | 'feature' | 'improvement' | 'task' | 'epic';
  status: 'open' | 'in-progress' | 'review' | 'resolved' | 'closed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  assignee?: {
    id: string | number;
    name: string;
    avatar?: string;
    role?: string;
  };
  reporter: {
    id: string | number;
    name: string;
    avatar?: string;
    role?: string;
  };
  labels?: string[];
  project?: string;
  component?: string;
  milestone?: string;
  comments?: number;
  relations?: IssueRelation[];
  estimatedTime?: string;
  timeSpent?: string;
}

export interface IssueCardProps {
  /** Issue details */
  issue: IssueDetails;
  /** Additional styling and behavior */
  className?: string;
  onClick?: () => void;
  showRelations?: boolean;
  animate?: boolean;
}

/**
 * IssueCard component for displaying issue information.
 * Follows Buildese UI design principles:
 * - Card-based UI with subtle shadows for depth
 * - Clear visual feedback for interactions
 * - Consistent spacing system
 * - Modern, aesthetic look with warm blue (#2B6CB0) accents
 * - Progressive disclosure for complex information
 */
export function IssueCard({
  issue,
  className,
  onClick,
  showRelations = false,
  animate = true
}: IssueCardProps) {
  const typeConfig = {
    'bug': {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-400',
      indicator: 'bg-red-500'
    },
    'feature': {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-400',
      indicator: 'bg-green-500'
    },
    'improvement': {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-400',
      indicator: 'bg-blue-500'
    },
    'task': {
      bg: 'bg-slate-100 dark:bg-slate-900/30',
      text: 'text-slate-700 dark:text-slate-400',
      indicator: 'bg-slate-500'
    },
    'epic': {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-700 dark:text-purple-400',
      indicator: 'bg-purple-500'
    }
  };

  const statusConfig = {
    'open': {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-400',
      indicator: 'bg-blue-500'
    },
    'in-progress': {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-700 dark:text-amber-400',
      indicator: 'bg-amber-500'
    },
    'review': {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-700 dark:text-purple-400',
      indicator: 'bg-purple-500'
    },
    'resolved': {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-400',
      indicator: 'bg-green-500'
    },
    'closed': {
      bg: 'bg-slate-100 dark:bg-slate-900/30',
      text: 'text-slate-700 dark:text-slate-400',
      indicator: 'bg-slate-500'
    }
  };

  const priorityConfig = {
    'critical': {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-400',
      indicator: 'bg-red-500'
    },
    'high': {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-700 dark:text-amber-400',
      indicator: 'bg-amber-500'
    },
    'medium': {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-400',
      indicator: 'bg-blue-500'
    },
    'low': {
      bg: 'bg-slate-100 dark:bg-slate-900/30',
      text: 'text-slate-700 dark:text-slate-400',
      indicator: 'bg-slate-500'
    }
  };

  return (
    <Card 
      className={cn(
        'overflow-hidden transition-all duration-300',
        'hover:shadow-md',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="p-4 space-y-3">
        {/* Header with ID, Title, and Type */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono bg-slate-100 dark:bg-slate-900/30 px-1.5 py-0.5 rounded">
                #{issue.id}
              </span>
              <h3 className="text-base font-semibold">{issue.title}</h3>
            </div>
            {issue.project && (
              <p className="text-xs text-muted-foreground">
                Project: {issue.project}
                {issue.component && ` / ${issue.component}`}
              </p>
            )}
          </div>
          <Badge 
            className={cn(
              'flex items-center',
              typeConfig[issue.type].bg,
              typeConfig[issue.type].text
            )}
          >
            <div className={cn('w-2 h-2 rounded-full mr-1.5', typeConfig[issue.type].indicator)} />
            {issue.type.charAt(0).toUpperCase() + issue.type.slice(1)}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-sm line-clamp-2">{issue.description}</p>

        {/* Status, Priority, and Dates */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center space-x-2">
            <Badge 
              className={cn(
                'flex items-center',
                statusConfig[issue.status].bg,
                statusConfig[issue.status].text
              )}
            >
              <div className={cn('w-2 h-2 rounded-full mr-1.5', statusConfig[issue.status].indicator)} />
              {issue.status.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </Badge>
            <Badge 
              className={cn(
                'flex items-center',
                priorityConfig[issue.priority].bg,
                priorityConfig[issue.priority].text
              )}
            >
              {issue.priority === 'critical' && <AlertTriangle className="h-3 w-3 mr-1" />}
              {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)}
            </Badge>
          </div>
          <div className="flex items-center justify-end text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            <span>{issue.updatedAt}</span>
          </div>
        </div>

        {/* Labels */}
        {issue.labels && issue.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {issue.labels.map((label, index) => (
              <div 
                key={index}
                className="flex items-center text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400"
              >
                <Tag className="h-3 w-3 mr-1" />
                {label}
              </div>
            ))}
          </div>
        )}

        {/* Footer with Assignee, Time, and Comments */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-3">
            {issue.assignee ? (
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={issue.assignee.avatar} alt={issue.assignee.name} />
                  <AvatarFallback className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    {issue.assignee.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">{issue.assignee.name}</span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">Unassigned</span>
            )}
            {issue.estimatedTime && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5 mr-1" />
                {issue.timeSpent ? `${issue.timeSpent} / ${issue.estimatedTime}` : issue.estimatedTime}
              </div>
            )}
          </div>
          {issue.comments !== undefined && issue.comments > 0 && (
            <div className="flex items-center text-xs text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5 mr-1" />
              {issue.comments}
            </div>
          )}
        </div>

        {/* Relations */}
        {showRelations && issue.relations && issue.relations.length > 0 && (
          <div className="pt-2 border-t space-y-1">
            <h4 className="text-xs font-medium">Relations</h4>
            <div className="space-y-1">
              {issue.relations.map((relation) => (
                <div 
                  key={relation.id}
                  className="flex items-center justify-between text-xs p-1.5 bg-slate-50 dark:bg-slate-900/30 rounded"
                >
                  <div className="flex items-center space-x-1.5">
                    <span className={cn(
                      'capitalize',
                      relation.type.includes('block') ? 'text-red-600 dark:text-red-400' : 
                      relation.type.includes('duplicate') ? 'text-amber-600 dark:text-amber-400' : 
                      'text-blue-600 dark:text-blue-400'
                    )}>
                      {relation.type.split('-').join(' ')}:
                    </span>
                    <span className="font-mono">#{relation.issueId}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="truncate max-w-[120px]">{relation.issueTitle}</span>
                    <Link2 className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Milestone if available */}
        {issue.milestone && (
          <div className="flex items-center justify-between text-xs pt-2 border-t">
            <span className="text-muted-foreground">Milestone:</span>
            <div className="flex items-center text-blue-600 dark:text-blue-400">
              {issue.milestone}
              <ArrowUpRight className="h-3 w-3 ml-1" />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
