import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  Tag,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CalendarEventAttendee {
  id: string | number;
  name: string;
  avatar?: string;
  role?: string;
  status: 'confirmed' | 'tentative' | 'declined';
}

export interface CalendarEvent {
  id: string | number;
  title: string;
  startDate: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  location?: string;
  description?: string;
  category?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  priority?: 'high' | 'medium' | 'low';
  attendees?: CalendarEventAttendee[];
  allDay?: boolean;
  recurring?: boolean;
  recurringPattern?: string;
}

export interface CalendarCardProps {
  /** Calendar event details */
  event: CalendarEvent;
  /** Additional styling and behavior */
  className?: string;
  onClick?: () => void;
  showAttendees?: boolean;
  maxAttendees?: number;
  animate?: boolean;
}

/**
 * CalendarCard component for displaying calendar events.
 * Follows Buildese UI design principles:
 * - Card-based UI with subtle shadows for depth
 * - Clear visual feedback for interactions
 * - Consistent spacing system
 * - Modern, aesthetic look with warm blue (#2B6CB0) accents
 * - Progressive disclosure for complex information
 */
export function CalendarCard({
  event,
  className,
  onClick,
  showAttendees = true,
  maxAttendees = 3,
  animate = true
}: CalendarCardProps) {
  const statusConfig = {
    'scheduled': {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-400',
      indicator: 'bg-blue-500'
    },
    'in-progress': {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-700 dark:text-amber-400',
      indicator: 'bg-amber-500'
    },
    'completed': {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-400',
      indicator: 'bg-green-500'
    },
    'cancelled': {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-400',
      indicator: 'bg-red-500'
    }
  };

  const priorityConfig = {
    'high': {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-400'
    },
    'medium': {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-700 dark:text-amber-400'
    },
    'low': {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-400'
    }
  };

  // Format date display
  const formatDateDisplay = () => {
    if (event.endDate && event.startDate !== event.endDate) {
      return `${event.startDate} - ${event.endDate}`;
    }
    return event.startDate;
  };

  // Format time display
  const formatTimeDisplay = () => {
    if (event.allDay) {
      return 'All day';
    }
    if (event.endTime && event.startTime) {
      return `${event.startTime} - ${event.endTime}`;
    }
    return event.startTime;
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
        {/* Header with Title and Status */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-semibold">{event.title}</h3>
            {event.recurring && (
              <p className="text-xs text-muted-foreground">
                Recurring: {event.recurringPattern || 'Weekly'}
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            {event.priority && (
              <Badge 
                className={cn(
                  priorityConfig[event.priority].bg,
                  priorityConfig[event.priority].text
                )}
              >
                {event.priority.charAt(0).toUpperCase() + event.priority.slice(1)}
              </Badge>
            )}
            <Badge 
              className={cn(
                'flex items-center',
                statusConfig[event.status].bg,
                statusConfig[event.status].text
              )}
            >
              <div className={cn('w-2 h-2 rounded-full mr-1.5', statusConfig[event.status].indicator)} />
              {event.status.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </Badge>
          </div>
        </div>

        {/* Date and Time */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center text-muted-foreground">
            <CalendarIcon className="h-4 w-4 mr-1.5" />
            {formatDateDisplay()}
          </div>
          {(event.startTime || event.allDay) && (
            <div className="flex items-center text-muted-foreground">
              <Clock className="h-4 w-4 mr-1.5" />
              {formatTimeDisplay()}
            </div>
          )}
        </div>

        {/* Details */}
        {(event.location || event.category) && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            {event.location && (
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1.5" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
            {event.category && (
              <div className="flex items-center text-muted-foreground">
                <Tag className="h-4 w-4 mr-1.5" />
                {event.category}
              </div>
            )}
          </div>
        )}

        {/* Description if available */}
        {event.description && (
          <p className="text-sm line-clamp-2">{event.description}</p>
        )}

        {/* Attendees */}
        {showAttendees && event.attendees && event.attendees.length > 0 && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-1.5" />
                <span>{event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}</span>
              </div>
              {event.attendees.length > maxAttendees && (
                <button className="text-xs text-blue-600 dark:text-blue-400 flex items-center">
                  View all <ChevronRight className="h-3 w-3 ml-0.5" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {event.attendees.slice(0, maxAttendees).map((attendee, index) => (
                <div 
                  key={attendee.id} 
                  className={cn(
                    'text-xs px-2 py-1 rounded-full',
                    attendee.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    attendee.status === 'tentative' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  )}
                >
                  {attendee.name}
                </div>
              ))}
              {event.attendees.length > maxAttendees && (
                <div className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400">
                  +{event.attendees.length - maxAttendees} more
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
