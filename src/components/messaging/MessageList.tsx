import React, { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message, ChatParticipant } from "@/types/messaging";
import { format, isToday, isYesterday } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  CheckCheck, 
  Check, 
  Image as ImageIcon, 
  Paperclip, 
  FileText,
  Clock,
  Smile,
  Send,
  Heart,
  ThumbsUp,
  MessageSquare
} from "lucide-react";
import { m } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";

interface MessageListProps {
  messages: Message[];
  participants: ChatParticipant[];
  currentUserId: string;
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

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  participants,
  currentUserId,
  className,
  isDarkMode = false,
  onReplyToMessage,
  onAddReaction
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  
  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  const getParticipant = (senderId: string): ChatParticipant | undefined => {
    return participants.find(p => p.id === senderId);
  };
  
  const renderMessageStatus = (status: Message["status"]) => {
    switch (status) {
      case "sent":
        return <Send className="h-3.5 w-3.5 text-slate-400" />;
      case "delivered":
        return <Check className="h-3.5 w-3.5 text-slate-400" />;
      case "read":
        return <CheckCheck className="h-3.5 w-3.5 text-blue-500" />;
      case "failed":
        return <Clock className="h-3.5 w-3.5 text-red-500" />;
      default:
        return null;
    }
  };

  // Group messages by same sender in sequence
  const groupedMessages: { sender: ChatParticipant | undefined, messages: Message[], date: Date }[] = [];
  let currentSender: string | null = null;
  let currentGroup: Message[] = [];
  let currentDate: Date | null = null;
  
  messages.forEach((message) => {
    const messageDate = new Date(message.timestamp);
    const messageDay = messageDate.setHours(0, 0, 0, 0);
    
    // Start a new group if sender changes or date changes
    if (message.senderId !== currentSender || 
        (currentDate && messageDay !== currentDate.setHours(0, 0, 0, 0))) {
      
      if (currentSender && currentGroup.length > 0) {
        groupedMessages.push({
          sender: getParticipant(currentSender),
          messages: [...currentGroup],
          date: currentDate!
        });
      }
      
      currentSender = message.senderId;
      currentGroup = [message];
      currentDate = messageDate;
    } else {
      currentGroup.push(message);
    }
  });
  
  // Add the last group
  if (currentSender && currentGroup.length > 0) {
    groupedMessages.push({
      sender: getParticipant(currentSender),
      messages: [...currentGroup],
      date: currentDate!
    });
  }
  
  // Format message time
  const formatMessageTime = (timestamp: string | Date): string => {
    const date = new Date(timestamp);
    return format(date, "h:mm a");
  };
  
  // Format date header
  const formatDateHeader = (date: Date): string => {
    if (isToday(date)) {
      return "Today";
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else {
      return format(date, "MMMM d, yyyy");
    }
  };
  
  // Group messages by date
  const messagesByDate = groupedMessages.reduce<Record<string, typeof groupedMessages>>((acc, group) => {
    const dateStr = new Date(group.date).setHours(0, 0, 0, 0).toString();
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(group);
    return acc;
  }, {});
  
  // Handle message reaction
  const handleReaction = (messageId: string, reaction: string) => {
    if (onAddReaction) {
      onAddReaction(messageId, reaction);
    }
  };
  
  // Handle reply to message
  const handleReplyToMessage = (messageId: string) => {
    if (onReplyToMessage) {
      onReplyToMessage(messageId);
    }
  };
  
  return (
    <ScrollArea ref={scrollRef} className={cn("h-full pb-4", className)}>
      <div className="px-4 py-2">
        {Object.entries(messagesByDate).map(([dateStr, groups]) => {
          const date = new Date(parseInt(dateStr));
          
          return (
            <div key={dateStr} className="mb-6">
              <div className="flex justify-center mb-4">
                <m.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs shadow-sm", 
                    isDarkMode ? "bg-slate-800 text-slate-300 shadow-black/10" : "bg-white text-slate-600 shadow-black/5"
                  )}
                >
                  {formatDateHeader(date)}
                </m.div>
              </div>
              
              {groups.map((group, groupIndex) => {
                const isCurrentUser = group.sender?.id === currentUserId;
                
                return (
                  <div key={`group-${groupIndex}`} className="mb-6">
                    {!isCurrentUser && !group.messages[0].isSystemMessage && (
                      <div className="flex items-center gap-2 mb-1.5">
                        <Avatar className="h-6 w-6 ring-2 ring-offset-1 ring-blue-500/20 dark:ring-blue-600/20">
                          <AvatarImage src={group.sender?.avatar} />
                          <AvatarFallback className={isDarkMode ? "bg-slate-700 text-slate-200" : ""}>
                            {group.sender?.name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className={cn(
                            "text-sm font-medium", 
                            isDarkMode ? "text-slate-200" : "text-slate-800"
                          )}>
                            {group.sender?.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            {group.sender?.role || "Team Member"}
                          </span>
                        </div>
                        {group.sender?.isOnline && (
                          <span className="h-2 w-2 rounded-full bg-green-500 ring-1 ring-white dark:ring-slate-700"></span>
                        )}
                      </div>
                    )}
                    
                    <div className={cn(
                      "flex flex-col gap-1",
                      isCurrentUser ? "items-end" : "items-start"
                    )}>
                      {group.messages.map((message, messageIndex) => {
                        if (message.isSystemMessage) {
                          return (
                            <m.div 
                              key={message.id} 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                              className={cn(
                                "py-1.5 px-3 mx-auto rounded-full text-xs shadow-sm",
                                isDarkMode ? "bg-slate-800/80 text-slate-400 shadow-black/10" : "bg-slate-100 text-slate-500 shadow-black/5"
                              )}
                            >
                              {message.content}
                            </m.div>
                          );
                        }
                        
                        return (
                          <m.div 
                            key={message.id} 
                            initial={{ opacity: 0, scale: 0.95, x: isCurrentUser ? 10 : -10 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: messageIndex * 0.05 }}
                            className={cn(
                              "relative max-w-[80%] break-words group",
                              isCurrentUser && "text-right"
                            )}
                            onMouseEnter={() => setHoveredMessageId(message.id)}
                            onMouseLeave={() => setHoveredMessageId(null)}
                          >
                            {/* Message actions that appear on hover */}
                            {hoveredMessageId === message.id && (
                              <div 
                                className={cn(
                                  "absolute -top-8 rounded-full bg-white shadow-md border border-slate-200 p-0.5 flex items-center gap-1 z-10",
                                  isCurrentUser ? "right-0" : "left-0"
                                )}
                              >
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-7 w-7 rounded-full hover:bg-slate-100"
                                    >
                                      <Smile className="h-4 w-4 text-slate-600" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-1.5 flex gap-1">
                                    {REACTIONS.map(reaction => (
                                      <Button
                                        key={reaction.name}
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-full hover:bg-slate-100"
                                        onClick={() => handleReaction(message.id, reaction.emoji)}
                                      >
                                        {reaction.emoji_only ? (
                                          <span className="text-lg">{reaction.emoji}</span>
                                        ) : (
                                          reaction.icon || <span className="text-lg">{reaction.emoji}</span>
                                        )}
                                      </Button>
                                    ))}
                                  </PopoverContent>
                                </Popover>
                                
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-7 w-7 rounded-full hover:bg-slate-100"
                                        onClick={() => handleReplyToMessage(message.id)}
                                      >
                                        <MessageSquare className="h-4 w-4 text-slate-600" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Reply</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            )}
                            
                            <div className={cn(
                              "inline-block py-2 px-3 rounded-lg shadow-sm",
                              isCurrentUser
                                ? (isDarkMode 
                                  ? "bg-gradient-to-br from-blue-700 to-blue-900 text-blue-50 shadow-black/20" 
                                  : "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-black/10")
                                : (isDarkMode 
                                  ? "bg-slate-800 text-slate-200 shadow-black/20" 
                                  : "bg-white text-slate-800 shadow-black/5 border border-slate-200/50")
                            )}>
                              {/* Reply to message */}
                              {message.replyToId && (
                                <div className={cn(
                                  "text-xs border-l-2 px-2 py-1 mb-1.5 opacity-80 max-w-56 truncate",
                                  isCurrentUser 
                                    ? "border-white/30 bg-blue-600/30" 
                                    : isDarkMode 
                                      ? "border-slate-600 bg-slate-700/50" 
                                      : "border-slate-300 bg-slate-100"
                                )}>
                                  <div className="font-medium">
                                    {messages.find(m => m.id === message.replyToId)?.senderId === currentUserId 
                                      ? "You" 
                                      : getParticipant(messages.find(m => m.id === message.replyToId)?.senderId || "")?.name || "Unknown"}
                                  </div>
                                  <div className="truncate">
                                    {messages.find(m => m.id === message.replyToId)?.content || "Message not found"}
                                  </div>
                                </div>
                              )}
                              
                              {message.content}
                              
                              {message.attachments && message.attachments.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-blue-400/20 dark:border-slate-700/50">
                                  {message.attachments.map(attachment => (
                                    <div key={attachment.id} className="flex items-center gap-2 text-xs">
                                      {attachment.type === 'image' ? (
                                        <ImageIcon className="h-3.5 w-3.5 opacity-70" />
                                      ) : attachment.type === 'document' ? (
                                        <FileText className="h-3.5 w-3.5 opacity-70" />
                                      ) : (
                                        <Paperclip className="h-3.5 w-3.5 opacity-70" />
                                      )}
                                      <span className="flex-1 truncate">{attachment.name}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {/* Message reactions */}
                              {message.reactions && message.reactions.length > 0 && (
                                <div className={cn(
                                  "flex flex-wrap gap-1 mt-1.5",
                                  isCurrentUser ? "justify-start" : "justify-start"
                                )}>
                                  {Object.entries(
                                    message.reactions.reduce<Record<string, number>>((acc, reaction) => {
                                      acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
                                      return acc;
                                    }, {})
                                  ).map(([emoji, count]) => (
                                    <span 
                                      key={emoji}
                                      className={cn(
                                        "inline-flex items-center px-1.5 py-0.5 rounded-full text-xs",
                                        isCurrentUser 
                                          ? "bg-blue-600/40 text-white" 
                                          : isDarkMode 
                                            ? "bg-slate-700 text-slate-200"
                                            : "bg-slate-100 text-slate-800"
                                      )}
                                    >
                                      <span className="mr-1">{emoji}</span>
                                      <span>{count}</span>
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1 mt-1 text-xs">
                              <span className={isDarkMode ? "text-slate-400" : "text-slate-500"}>
                                {formatMessageTime(message.timestamp)}
                              </span>
                              
                              {isCurrentUser && (
                                <span className="ml-1">
                                  {renderMessageStatus(message.status)}
                                </span>
                              )}
                            </div>
                          </m.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}; 