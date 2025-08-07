/**
 * Comment Header Component
 * Header section for the RealTimeComments component
 */

import { MessageCircle, Users, Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CardHeader, CardTitle } from '@/components/ui/card';

interface CommentHeaderProps {
  commentCount: number;
  isJoined: boolean;
  onlineCount: number;
  notifications: boolean;
  onToggleNotifications: () => void;
}

export function CommentHeader({
  commentCount,
  isJoined,
  onlineCount,
  notifications,
  onToggleNotifications
}: CommentHeaderProps) {
  return (
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Comments ({commentCount})
        </CardTitle>
        
        <div className="flex items-center gap-2">
          {/* Online users indicator */}
          {isJoined && onlineCount > 1 && (
            <Badge variant="secondary" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              {onlineCount} online
            </Badge>
          )}
          
          {/* Notification toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleNotifications}
            className="h-8 w-8 p-0"
            title={notifications ? 'Disable notifications' : 'Enable notifications'}
          >
            {notifications ? (
              <Bell className="h-3 w-3" />
            ) : (
              <BellOff className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>
    </CardHeader>
  );
}