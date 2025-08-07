/**
 * PresenceIndicator Component
 * Shows online users, typing indicators, and collaboration status
 * Mobile-optimized for construction site usage
 */

import { useState } from 'react';
import { useRealTimeCollaboration } from '@/hooks/useRealTimeCollaboration';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Users, 
  Wifi, 
  WifiOff, 
  Circle, 
  Edit3,
  Eye,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { UserPresence } from '@/services/websocketService';

interface PresenceIndicatorProps {
  roomId: string;
  roomType: 'project' | 'document' | 'phase' | 'task';
  entityId: string;
  className?: string;
  showTypingIndicators?: boolean;
  maxAvatars?: number;
}

export function PresenceIndicator({
  roomId,
  roomType,
  entityId,
  className = '',
  showTypingIndicators = true,
  maxAvatars = 5
}: PresenceIndicatorProps) {
  const [showAllUsers, setShowAllUsers] = useState(false);
  
  const {
    isConnected,
    isJoined,
    users,
    otherUsers,
    onlineCount,
    typingUsers,
    connectionError
  } = useRealTimeCollaboration({
    roomId,
    roomType,
    entityId,
    enabled: true
  });

  // Get user avatar and initials
  const getUserAvatar = (user: UserPresence) => {
    return user.user_avatar || null;
  };

  const getUserInitials = (user: UserPresence) => {
    return user.user_name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get status color
  const getStatusColor = (status: UserPresence['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  // Format last seen time
  const formatLastSeen = (lastSeen: string) => {
    try {
      return formatDistanceToNow(new Date(lastSeen), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  // Display users (limit for avatar display)
  const displayUsers = otherUsers.slice(0, maxAvatars);
  const hiddenUsersCount = Math.max(0, otherUsers.length - maxAvatars);

  if (!isConnected && !connectionError) {
    return null; // Still connecting
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Connection Status */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {isConnected ? 'Connected to real-time collaboration' : 'Disconnected from collaboration'}
            {connectionError && <div className="text-red-500 text-xs mt-1">{connectionError}</div>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* User Avatars */}
      {isJoined && otherUsers.length > 0 && (
        <Popover open={showAllUsers} onOpenChange={setShowAllUsers}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 px-2 py-1 h-auto touch-manipulation"
            >
              {/* Avatar Stack */}
              <div className="flex -space-x-2">
                {displayUsers.map((user) => (
                  <TooltipProvider key={user.user_id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative">
                          <Avatar className="h-6 w-6 border-2 border-background">
                            <AvatarImage src={getUserAvatar(user) || undefined} />
                            <AvatarFallback className="text-xs">
                              {getUserInitials(user)}
                            </AvatarFallback>
                          </Avatar>
                          {/* Status indicator */}
                          <div 
                            className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-background ${getStatusColor(user.status)}`}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <div className="text-center">
                          <div className="font-medium">{user.user_name}</div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {user.status}
                          </div>
                          {user.status !== 'online' && (
                            <div className="text-xs text-muted-foreground">
                              {formatLastSeen(user.last_seen)}
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
                
                {/* Hidden users count */}
                {hiddenUsersCount > 0 && (
                  <div className="flex items-center justify-center h-6 w-6 bg-muted border-2 border-background rounded-full">
                    <span className="text-xs font-medium">+{hiddenUsersCount}</span>
                  </div>
                )}
              </div>

              {/* Online count */}
              <div className="flex items-center gap-1 ml-1">
                <Users className="h-3 w-3" />
                <span className="text-xs font-medium">{onlineCount}</span>
              </div>
            </Button>
          </PopoverTrigger>

          {/* User List Popover */}
          <PopoverContent className="w-80 p-0" align="end">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Online Users ({onlineCount})
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {isConnected ? 'Connected' : 'Offline'}
                  </Badge>
                </div>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {users.map((user) => (
                    <div key={user.user_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={getUserAvatar(user) || undefined} />
                          <AvatarFallback className="text-xs">
                            {getUserInitials(user)}
                          </AvatarFallback>
                        </Avatar>
                        <div 
                          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-background ${getStatusColor(user.status)}`}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">{user.user_name}</p>
                          {user.is_typing && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                              <Edit3 className="h-2.5 w-2.5 mr-1" />
                              typing
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Circle className={`h-2 w-2 fill-current ${getStatusColor(user.status).replace('bg-', 'text-')}`} />
                          <span className="capitalize">{user.status}</span>
                          {user.status !== 'online' && (
                            <>
                              <span>•</span>
                              <Clock className="h-2.5 w-2.5" />
                              <span>{formatLastSeen(user.last_seen)}</span>
                            </>
                          )}
                        </div>
                        
                        {user.current_page && (
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            <Eye className="h-2.5 w-2.5 inline mr-1" />
                            {user.current_page}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {users.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No other users online</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>
      )}

      {/* Typing Indicators */}
      {showTypingIndicators && typingUsers.length > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-full">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <span className="text-xs text-muted-foreground ml-1">
                  {typingUsers.length}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div>
                {typingUsers.length === 1 ? (
                  <span>{typingUsers[0].user_name} is typing...</span>
                ) : (
                  <span>{typingUsers.length} people are typing...</span>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* No users indicator when joined but no other users */}
      {isJoined && otherUsers.length === 0 && !connectionError && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="text-xs">Only you</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              You're the only one here right now
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}