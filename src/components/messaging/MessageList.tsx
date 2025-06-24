import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message, ChatParticipant } from "@/types/messaging";
import { format, isToday, isYesterday } from "date-fns";

import { 
  CheckCheck, 
  Check,
  Clock,
  Smile,
  Heart,
  ThumbsUp,
  Reply,
  MoreHorizontal,
  Copy,
  Bookmark,
  AlertTriangle
} from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";


import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/utils/core/ui';

interface MessageListProps {
  messages: Message[];
  participants: ChatParticipant[];
  currentUser: ChatParticipant;
  className?: string;
  isDarkMode?: boolean;
  onReplyToMessage?: (messageId: string) => void;
  onAddReaction?: (messageId: string, reaction: string) => void;
}

// Quick reactions
const REACTIONS = [
  { emoji: "👍", name: "thumbs up", icon: <ThumbsUp className="h-3.5 w-3.5" /> },
  { emoji: "❤️", name: "heart", icon: <Heart className="h-3.5 w-3.5" /> },
  { emoji: "😂", name: "laugh", emoji_only: true },
  { emoji: "😢", name: "sad", emoji_only: true },
  { emoji: "😮", name: "wow", emoji_only: true },
  { emoji: "🎉", name: "celebrate", emoji_only: true },
];

interface MessageGroupProps {
  messages: Message[];
  showAvatar: boolean;
  isCurrentUser: boolean;
  senderName: string;
  senderAvatar?: string;
  isDarkMode?: boolean;
  onReplyToMessage?: (messageId: string) => void;
  onAddReaction?: (messageId: string, reaction: string) => void;
}

// Function to format message timestamp
const formatMessageTime = (timestamp: string | Date) => {
  const date = new Date(timestamp);
  if (isToday(date)) {
    return format(date, "h:mm a");
  } else if (isYesterday(date)) {
    return `Yesterday, ${format(date, "h:mm a")}`;
  } else {
    return format(date, "MMM d, h:mm a");
  }
};

// Function to format date for date separators
const _formatMessageDate = (timestamp: string | Date) => {
  const date = new Date(timestamp);
  if (isToday(date)) {
    return "Today";
  } else if (isYesterday(date)) {
    return "Yesterday";
  } else {
    return format(date, "MMMM d, yyyy");
  }
};

// Format date header - used for date separators in the message list
const formatDateHeader = (date: Date): string => {
  if (isToday(date)) {
    return "Today";
  } else if (isYesterday(date)) {
    return "Yesterday";
  } else {
    return format(date, "MMMM d, yyyy");
  }
};

// Function to get status icon
const getStatusIcon = (status: string, isDarkMode: boolean = false) => {
  switch (status) {
    case "read":
      return <CheckCheck className={`h-3.5 w-3.5 ${isDarkMode ? "text-blue-400" : "text-blue-500"}`} />;
    case "delivered":
      return <Check className="h-3.5 w-3.5 text-slate-400" />;
    case "sent":
      return <Check className="h-3.5 w-3.5 text-slate-400" />;
    case "failed":
      return <AlertTriangle className="h-3.5 w-3.5 text-red-500" />;
    default:
      return <Clock className="h-3.5 w-3.5 text-slate-400" />;
  }
};

// MessageGroup component for grouping messages from the same sender  
// Currently unused - may be implemented in future versions
const _MessageGroup = (_props: MessageGroupProps) => {
  // Placeholder for future message grouping functionality
  return null;
};

// Date separator component  
const DateSeparator = ({ content }: { content: string }) => (
  <div className="flex justify-center my-4">
    <div className="inline-block px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-full">
      {content}
    </div>
  </div>
);

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  participants,
  currentUser,
  className,
  isDarkMode = false,
  onReplyToMessage,
  onAddReaction
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  
  // Auto scroll to bottom when new messages arrive - optimized with useCallback
  const scrollToBottom = useCallback(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);
  
  const getParticipant = useCallback((senderId: string): ChatParticipant | undefined => {
    return participants.find(p => p.id === senderId);
  }, [participants]);
  
  // Group messages by sender and date - memoized for performance
  const groupedMessages = useMemo(() => {
    const groups: Array<{
      senderId: string;
      senderName: string;
      senderAvatar?: string;
      isCurrentUser: boolean;
      messages: Message[];
      date: Date;
    }> = [];
    
    let currentGroup: typeof groups[0] | null = null;
    let currentDate: Date | null = null;
    
    messages.forEach((message) => {
      const participant = getParticipant(message.senderId);
      const messageDate = new Date(message.timestamp);
      const messageDateKey = messageDate.setHours(0, 0, 0, 0);
      
      // Check if we need a new group (different sender or different day)
      if (!currentGroup || 
          currentGroup.senderId !== message.senderId || 
          !currentDate || 
          currentDate.getTime() !== messageDateKey) {
        
        currentGroup = {
          senderId: message.senderId,
          senderName: participant?.name || 'Unknown',
          senderAvatar: participant?.avatar,
          isCurrentUser: message.senderId === currentUser.id,
          messages: [message],
          date: new Date(messageDateKey)
        };
        groups.push(currentGroup);
        currentDate = new Date(messageDateKey);
      } else {
        currentGroup.messages.push(message);
      }
    });
    
    return groups;
  }, [messages, getParticipant, currentUser.id]);
  
  // Group messages by date - memoized for performance
  const messagesByDate = useMemo(() => {
    return groupedMessages.reduce<Record<string, typeof groupedMessages>>((acc, group) => {
      const dateStr = new Date(group.date).setHours(0, 0, 0, 0).toString();
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(group);
      return acc;
    }, {});
  }, [groupedMessages]);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        <div className="space-y-1 py-4">
          {Object.entries(messagesByDate)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([dateStr, groups]) => {
              const date = new Date(parseInt(dateStr));
              
              return (
                <div key={dateStr}>
                  <DateSeparator content={formatDateHeader(date)} />
                  
                  {groups.map((group, groupIndex) => {
                    const showAvatar = groupIndex === groups.length - 1 || 
                                     groups[groupIndex + 1]?.senderId !== group.senderId;
                    
                    return (
                      <div key={`${group.senderId}-${groupIndex}`} className={cn(
                        "flex items-end mb-4 group",
                        group.isCurrentUser ? "justify-end" : "justify-start"
                      )}>
                        {!group.isCurrentUser && showAvatar && (
                          <div className="flex-shrink-0 mr-2">
                            <Avatar className="h-8 w-8 border-2 border-white dark:border-slate-800 shadow-sm">
                              <AvatarImage src={group.senderAvatar} />
                              <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 text-xs font-medium">
                                {group.senderName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        )}
                        
                        <div className={cn(
                          "flex flex-col max-w-[85%] md:max-w-[70%]",
                          group.isCurrentUser ? "items-end" : "items-start"
                        )}>
                          {!group.isCurrentUser && showAvatar && (
                            <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 ml-1">
                              {group.senderName}
                            </div>
                          )}
                          
                          <div className="space-y-1">
                            {group.messages.map((message, index) => {
                              const isFirst = index === 0;
                              const isLast = index === group.messages.length - 1;
                              const showTimestamp = isLast;
                              
                              // Check if message has reactions
                              const hasReactions = message.reactions && message.reactions.length > 0;
                              
                              return (
                                <m.div 
                                  key={message.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="group relative"
                                  onMouseEnter={() => setHoveredMessageId(message.id)}
                                  onMouseLeave={() => setHoveredMessageId(null)}
                                >
                                  <div className="flex items-end">
                                    <div
                                      className={cn(
                                        "px-3.5 py-2.5 rounded-2xl shadow-sm max-w-full",
                                        group.isCurrentUser
                                          ? "bg-blue-500 text-white dark:bg-blue-600 rounded-br-sm"
                                          : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-sm",
                                        isFirst && !isLast && group.isCurrentUser ? "rounded-br-lg" : "",
                                        isFirst && !isLast && !group.isCurrentUser ? "rounded-bl-lg" : ""
                                      )}
                                    >
                                      <div className="text-sm whitespace-pre-wrap break-words">
                                        {message.content}
                                      </div>
                                    </div>
                                    
                                    {/* Message actions - visible on hover */}
                                    <AnimatePresence>
                                      {hoveredMessageId === message.id && (
                                        <m.div
                                          initial={{ opacity: 0, scale: 0.8 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          exit={{ opacity: 0, scale: 0.8 }}
                                          transition={{ duration: 0.15 }}
                                          className={cn(
                                            "absolute flex items-center bg-white dark:bg-slate-800 shadow-md rounded-full py-0.5 px-1 border border-slate-200 dark:border-slate-700 space-x-0.5",
                                            group.isCurrentUser ? "right-full mr-2" : "left-full ml-2"
                                          )}
                                        >
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-7 w-7 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                                                  onClick={() => onReplyToMessage && onReplyToMessage(message.id)}
                                                >
                                                  <Reply className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                                                </Button>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p>Reply</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                          
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                                              >
                                                <Smile className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align={group.isCurrentUser ? "end" : "start"} className="flex flex-wrap min-w-[120px] p-1">
                                              {REACTIONS.map(reaction => (
                                                <Button
                                                  key={reaction.name}
                                                  variant="ghost"
                                                  className="h-8 w-8 p-0 rounded-full"
                                                  onClick={() => onAddReaction && onAddReaction(message.id, reaction.emoji)}
                                                >
                                                  {reaction.emoji_only ? (
                                                    <span className="text-lg">{reaction.emoji}</span>
                                                  ) : (
                                                    reaction.icon || <span className="text-lg">{reaction.emoji}</span>
                                                  )}
                                                </Button>
                                              ))}
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                          
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                                              >
                                                <MoreHorizontal className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align={group.isCurrentUser ? "end" : "start"}>
                                              <DropdownMenuItem>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy
                                              </DropdownMenuItem>
                                              <DropdownMenuItem>
                                                <Bookmark className="h-4 w-4 mr-2" />
                                                Save
                                              </DropdownMenuItem>
                                              <DropdownMenuSeparator />
                                              <DropdownMenuItem className="text-red-600 dark:text-red-400">
                                                <AlertTriangle className="h-4 w-4 mr-2" />
                                                Report
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </m.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                  
                                  {/* Message reactions */}
                                  {hasReactions && (
                                    <div className={cn(
                                      "flex flex-wrap gap-1 mt-1",
                                      group.isCurrentUser ? "justify-end" : "justify-start"
                                    )}>
                                      {message.reactions?.map((reaction, reactionIndex) => (
                                        <Badge 
                                          key={reactionIndex}
                                          variant="secondary" 
                                          className="text-xs px-2 py-0.5 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                          onClick={() => onAddReaction && onAddReaction(message.id, reaction.emoji)}
                                        >
                                          {reaction.emoji} {reaction.count}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                  
                                  {/* Timestamp and status */}
                                  {showTimestamp && (
                                    <div className={cn(
                                      "flex items-center gap-1 mt-1 text-xs text-slate-500 dark:text-slate-400",
                                      group.isCurrentUser ? "justify-end" : "justify-start"
                                    )}>
                                      <span>{formatMessageTime(message.timestamp)}</span>
                                      {group.isCurrentUser && message.status && (
                                        <span className="flex items-center">
                                          {getStatusIcon(message.status, isDarkMode)}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </m.div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
        </div>
        <div ref={bottomRef} />
      </ScrollArea>
    </div>
  );
};

export default MessageList;