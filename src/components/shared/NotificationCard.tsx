import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Bell,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'destructive';
}

export interface NotificationDetails {
  id: string | number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  sender?: {
    id: string | number;
    name: string;
    avatar?: string;
  };
  project?: string;
  actions?: NotificationAction[];
}

export interface NotificationCardProps {
  /** Notification details */
  notification: NotificationDetails;
  /** Additional styling and behavior */
  className?: string;
  onClick?: () => void;
  onMarkAsRead?: (id: string | number) => void;
  onDismiss?: (id: string | number) => void;
  animate?: boolean;
}

/**
 * NotificationCard component for displaying notification information.
 * Follows Buildese UI design principles:
 * - Card-based UI with subtle shadows for depth
 * - Clear visual feedback for interactions
 * - Consistent spacing system
 * - Modern, aesthetic look with warm blue (#2B6CB0) accents
 * - Progressive disclosure for complex information
 */
export function NotificationCard({
  notification,
  className,
  onClick,
  onMarkAsRead,
  onDismiss,
  animate = true
}: NotificationCardProps) {
  const typeConfig = {
    'info': {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-400',
      icon: <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
    },
    'success': {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-400',
      icon: <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
    },
    'warning': {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-700 dark:text-amber-400',
      icon: <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
    },
    'error': {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-400',
      icon: <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
    }
  };

  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    // This is a placeholder - in a real app, you would use a proper date library
    // like date-fns or dayjs to calculate the relative time
    return timestamp;
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDismiss) {
      onDismiss(notification.id);
    }
  };

  return (
    <Card 
      className={cn(
        'overflow-hidden transition-all duration-300',
        'hover:shadow-md',
        onClick && 'cursor-pointer',
        !notification.read && 'border-l-4 border-l-blue-500',
        className
      )}
      onClick={onClick}
    >
      <div className="p-4 space-y-3">
        {/* Header with Type and Timestamp */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div className={cn(
              'p-1.5 rounded-full',
              typeConfig[notification.type].bg
            )}>
              {typeConfig[notification.type].icon}
            </div>
            <div>
              <h3 className="text-base font-semibold">{notification.title}</h3>
              {notification.project && (
                <p className="text-xs text-muted-foreground">
                  Project: {notification.project}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(notification.timestamp)}
            </span>
            {!notification.read && (
              <div className="w-2 h-2 rounded-full bg-blue-500 ml-1"></div>
            )}
          </div>
        </div>

        {/* Message */}
        <p className="text-sm">
          {notification.message}
        </p>

        {/* Sender if available */}
        {notification.sender && (
          <div className="flex items-center space-x-2 text-sm">
            <Avatar className="h-6 w-6">
              <AvatarImage src={notification.sender.avatar} alt={notification.sender.name} />
              <AvatarFallback className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {notification.sender.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span className="text-muted-foreground">
              From: {notification.sender.name}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-2 text-xs">
            <button 
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              onClick={handleMarkAsRead}
            >
              {notification.read ? 'Mark as unread' : 'Mark as read'}
            </button>
            <button 
              className="text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-300 font-medium"
              onClick={handleDismiss}
            >
              Dismiss
            </button>
          </div>
          
          {/* Custom actions */}
          {notification.actions && notification.actions.length > 0 && (
            <div className="flex items-center space-x-2">
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  className={cn(
                    'text-xs px-2 py-1 rounded-md font-medium',
                    action.variant === 'primary' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-800/40' :
                    action.variant === 'destructive' ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-800/40' :
                    'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:hover:bg-slate-800/40'
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick();
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
