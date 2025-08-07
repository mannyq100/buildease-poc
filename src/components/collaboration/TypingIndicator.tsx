/**
 * Typing Indicator Component
 * Shows who is currently typing in the comments section
 */

import type { UserPresence } from '@/services/websocketService';

interface TypingIndicatorProps {
  typingUsers: UserPresence[];
}

export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
      <div className="flex space-x-1">
        <div 
          className="w-1 h-1 bg-primary rounded-full animate-bounce" 
          style={{ animationDelay: '0s' }} 
        />
        <div 
          className="w-1 h-1 bg-primary rounded-full animate-bounce" 
          style={{ animationDelay: '0.1s' }} 
        />
        <div 
          className="w-1 h-1 bg-primary rounded-full animate-bounce" 
          style={{ animationDelay: '0.2s' }} 
        />
      </div>
      <span>
        {typingUsers.length === 1 
          ? `${typingUsers[0].user_name} is typing...`
          : `${typingUsers.length} people are typing...`
        }
      </span>
    </div>
  );
}