/**
 * RealTimeNotifications Component
 * Real-time notification system with toast notifications and in-app alerts
 * Integrates with collaboration events and user presence
 */

import { useState, useCallback } from 'react';
import { useRealTimeCollaboration } from '@/hooks/useRealTimeCollaboration';
import { useNotifications } from '@/hooks/queries/useNotifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Bell, 
  BellRing,
  X, 
  Check,
  MessageCircle,
  UserPlus,
  FileText,
  Settings,
  Volume2,
  VolumeX,
  Trash2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import type { CollaborationEvent, UserPresence } from '@/services/websocketService';

interface RealTimeNotificationsProps {
  projectId: string;
  className?: string;
  showUnreadCount?: boolean;
  enableSounds?: boolean;
  maxNotifications?: number;
}

interface LiveNotification {
  id: string;
  type: 'collaboration' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: 'comment' | 'user_activity' | 'document' | 'system';
  metadata?: Record<string, unknown>;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

// Notification sounds (using Web Audio API)
const playNotificationSound = (type: 'comment' | 'join' | 'leave' | 'system' = 'system') => {
  if (!window.AudioContext && !window.webkitAudioContext) return;
  
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different sounds for different notification types
    switch (type) {
      case 'comment':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
        break;
      case 'join':
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.15);
        break;
      case 'leave':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.15);
        break;
      default:
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    }

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.warn('Could not play notification sound:', error);
  }
};

export function RealTimeNotifications({
  projectId,
  className = '',
  showUnreadCount = true,
  enableSounds = true,
  maxNotifications = 50
}: RealTimeNotificationsProps) {
  const [liveNotifications, setLiveNotifications] = useState<LiveNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(enableSounds);
  const [filter, setFilter] = useState<'all' | 'unread' | 'comments' | 'activity'>('all');

  // Real-time collaboration for the project
  const {
    isJoined,
    users,
    onlineCount
  } = useRealTimeCollaboration({
    roomId: `project-${projectId}`,
    roomType: 'project',
    entityId: projectId,
    enabled: true,
    onEvent: handleCollaborationEvent,
    onUserJoin: handleUserJoin,
    onUserLeave: handleUserLeave
  });

  // System notifications from database
  const { data: systemNotifications = [] } = useNotifications();

  // Handle collaboration events
  function handleCollaborationEvent(event: CollaborationEvent) {
    const notification: LiveNotification = {
      id: `collab-${Date.now()}-${Math.random()}`,
      type: 'collaboration',
      title: getEventTitle(event),
      message: getEventMessage(event),
      timestamp: event.timestamp,
      read: false,
      category: getEventCategory(event.type),
      metadata: event.payload,
      user: {
        id: event.user_id,
        name: event.user_name || 'Unknown User'
      }
    };

    addLiveNotification(notification);

    // Play sound for important events
    if (soundEnabled) {
      switch (event.type) {
        case 'comment_added':
          playNotificationSound('comment');
          break;
        case 'user_joined':
          playNotificationSound('join');
          break;
        case 'user_left':
          playNotificationSound('leave');
          break;
        default:
          playNotificationSound('system');
      }
    }

    // Show toast notification
    showToastNotification(notification);
  }

  // Handle user join events
  function handleUserJoin(user: UserPresence) {
    const notification: LiveNotification = {
      id: `join-${user.user_id}-${Date.now()}`,
      type: 'collaboration',
      title: 'User Joined',
      message: `${user.user_name} joined the collaboration`,
      timestamp: new Date().toISOString(),
      read: false,
      category: 'user_activity',
      user: {
        id: user.user_id,
        name: user.user_name,
        avatar: user.user_avatar
      }
    };

    addLiveNotification(notification);
    
    if (soundEnabled) {
      playNotificationSound('join');
    }
  }

  // Handle user leave events
  function handleUserLeave(user: UserPresence) {
    const notification: LiveNotification = {
      id: `leave-${user.user_id}-${Date.now()}`,
      type: 'collaboration',
      title: 'User Left',
      message: `${user.user_name} left the collaboration`,
      timestamp: new Date().toISOString(),
      read: false,
      category: 'user_activity',
      user: {
        id: user.user_id,
        name: user.user_name,
        avatar: user.user_avatar
      }
    };

    addLiveNotification(notification);
    
    if (soundEnabled) {
      playNotificationSound('leave');
    }
  }

  // Add live notification
  const addLiveNotification = useCallback((notification: LiveNotification) => {
    setLiveNotifications(prev => {
      const updated = [notification, ...prev];
      // Keep only the most recent notifications
      return updated.slice(0, maxNotifications);
    });
  }, [maxNotifications]);

  // Show toast notification
  const showToastNotification = (notification: LiveNotification) => {
    if (notification.category === 'user_activity' && !isOpen) {
      // Only show user activity toasts when notifications panel is closed
      toast.info(notification.message, {
        duration: 3000
      });
    } else if (notification.category === 'comment') {
      toast.success(notification.message, {
        duration: 4000,
        action: {
          label: 'View',
          onClick: () => setIsOpen(true)
        }
      });
    }
  };

  // Get event title
  const getEventTitle = (event: CollaborationEvent): string => {
    switch (event.type) {
      case 'comment_added': return 'New Comment';
      case 'comment_updated': return 'Comment Updated';
      case 'comment_deleted': return 'Comment Deleted';
      case 'document_updated': return 'Document Updated';
      case 'project_activity': return 'Project Activity';
      default: return 'Collaboration Event';
    }
  };

  // Get event message
  const getEventMessage = (event: CollaborationEvent): string => {
    const userName = event.user_name || 'Someone';
    
    switch (event.type) {
      case 'comment_added': 
        return `${userName} added a comment`;
      case 'comment_updated': 
        return `${userName} updated a comment`;
      case 'comment_deleted': 
        return `${userName} deleted a comment`;
      case 'document_updated': 
        return `${userName} updated a document`;
      case 'project_activity': 
        return `${userName} performed an action`;
      default: 
        return `${userName} performed an action`;
    }
  };

  // Get event category
  const getEventCategory = (eventType: CollaborationEvent['type']): LiveNotification['category'] => {
    if (eventType.includes('comment')) return 'comment';
    if (eventType.includes('user')) return 'user_activity';
    if (eventType.includes('document')) return 'document';
    return 'system';
  };

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setLiveNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setLiveNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  // Remove notification
  const removeNotification = (notificationId: string) => {
    setLiveNotifications(prev =>
      prev.filter(n => n.id !== notificationId)
    );
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setLiveNotifications([]);
  };

  // Filter notifications
  const filteredNotifications = liveNotifications.filter(notification => {
    switch (filter) {
      case 'unread': return !notification.read;
      case 'comments': return notification.category === 'comment';
      case 'activity': return notification.category === 'user_activity';
      default: return true;
    }
  });

  // Get unread count
  const unreadCount = liveNotifications.filter(n => !n.read).length;

  // Get notification icon
  const getNotificationIcon = (category: LiveNotification['category']) => {
    switch (category) {
      case 'comment': return MessageCircle;
      case 'user_activity': return UserPlus;
      case 'document': return FileText;
      default: return Bell;
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Just now';
    }
  };

  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="relative touch-manipulation">
            {unreadCount > 0 ? (
              <BellRing className="h-4 w-4" />
            ) : (
              <Bell className="h-4 w-4" />
            )}
            
            {showUnreadCount && unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-96 p-0" align="end">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                  {unreadCount > 0 && (
                    <Badge variant="secondary">{unreadCount} new</Badge>
                  )}
                </CardTitle>

                <div className="flex items-center gap-1">
                  {/* Sound toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="h-8 w-8 p-0"
                  >
                    {soundEnabled ? (
                      <Volume2 className="h-3 w-3" />
                    ) : (
                      <VolumeX className="h-3 w-3" />
                    )}
                  </Button>

                  {/* Settings menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={markAllAsRead}>
                        <Check className="h-3 w-3 mr-2" />
                        Mark all as read
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={clearAllNotifications}>
                        <Trash2 className="h-3 w-3 mr-2" />
                        Clear all
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Filter tabs */}
              <div className="flex gap-1 mt-2">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'unread', label: 'Unread' },
                  { key: 'comments', label: 'Comments' },
                  { key: 'activity', label: 'Activity' }
                ].map((tab) => (
                  <Button
                    key={tab.key}
                    variant={filter === tab.key ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter(tab.key as any)}
                    className="text-xs h-7"
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* Collaboration status */}
              {isJoined && (
                <div className="px-4 py-2 bg-muted/50 border-b">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Live collaboration active • {onlineCount} online</span>
                  </div>
                </div>
              )}

              {/* Notifications list */}
              <ScrollArea className="h-96">
                {filteredNotifications.length > 0 ? (
                  <div className="divide-y">
                    {filteredNotifications.map((notification) => {
                      const IconComponent = getNotificationIcon(notification.category);
                      return (
                        <div
                          key={notification.id}
                          className={`
                            p-3 hover:bg-muted/50 transition-colors cursor-pointer
                            ${!notification.read ? 'bg-primary/5 border-l-2 border-primary' : ''}
                          `}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`
                              mt-0.5 p-1 rounded-full
                              ${notification.category === 'comment' ? 'bg-blue-100 text-blue-600' :
                                notification.category === 'user_activity' ? 'bg-green-100 text-green-600' :
                                notification.category === 'document' ? 'bg-purple-100 text-purple-600' :
                                'bg-gray-100 text-gray-600'}
                            `}>
                              <IconComponent className="h-3 w-3" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-sm">{notification.title}</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeNotification(notification.id);
                                  }}
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {notification.message}
                              </p>
                              
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-muted-foreground">
                                  {formatTimestamp(notification.timestamp)}
                                </span>
                                
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-primary rounded-full" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No notifications</p>
                    <p className="text-xs">
                      {filter === 'all' 
                        ? "You're all caught up!"
                        : `No ${filter} notifications`
                      }
                    </p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
}