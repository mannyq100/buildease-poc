import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
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
  MessageSquare,
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
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

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
const formatMessageDate = (timestamp: string | Date) => {
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
const MessageGroup: React.FC<MessageGroupProps> = ({
  messages,
  showAvatar,
  isCurrentUser,
  senderName,
  senderAvatar,
  isDarkMode = false,
  onReplyToMessage,
  onAddReaction
}) => {
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  
  return (
    <div className={cn(
      "flex items-end mb-4 group",
      isCurrentUser ? "justify-end" : "justify-start"
    )}>
      {!isCurrentUser && showAvatar && (
        <div className="flex-shrink-0 mr-2">
          <Avatar className="h-8 w-8 border-2 border-white dark:border-slate-800 shadow-sm">
            <AvatarImage src={senderAvatar} />
            <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 text-xs font-medium">
              {senderName.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
      )}
      
      <div className={cn(
        "flex flex-col max-w-[85%] md:max-w-[70%]",
        isCurrentUser ? "items-end" : "items-start"
      )}>
        {!isCurrentUser && showAvatar && (
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 ml-1">
            {senderName}
          </div>
        )}
        
        <div className="space-y-1">
          {messages.map((message, index) => {
            const isFirst = index === 0;
            const isLast = index === messages.length - 1;
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
                      isCurrentUser
                        ? "bg-blue-500 text-white dark:bg-blue-600 rounded-br-sm"
                        : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-sm",
                      isFirst && !isLast && isCurrentUser ? "rounded-br-lg" : "",
                      isFirst && !isLast && !isCurrentUser ? "rounded-bl-lg" : ""
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
                          isCurrentUser ? "right-full mr-2" : "left-full ml-2"
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
                          <DropdownMenuContent align={isCurrentUser ? "end" : "start"} className="flex flex-wrap min-w-[120px] p-1">
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
                          <DropdownMenuContent align={isCurrentUser ? "end" : "start"} className="w-40">
                            <DropdownMenuItem className="cursor-pointer">
                              <Copy className="h-4 w-4 mr-2" />
                              Copy text
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem className="cursor-pointer">
                              <Bookmark className="h-4 w-4 mr-2" />
                              Save message
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400">
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Report message
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
                    isCurrentUser ? "justify-end" : "justify-start"
                  )}>
                    {message.reactions?.map((reaction, i) => (
                      <Badge
                        key={`${reaction.emoji}-${i}`}
                        variant="outline"
                        className={cn(
                          "text-xs px-1.5 py-0.5 rounded-full",
                          "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm"
                        )}
                      >
                        <span className="mr-1">{reaction.emoji}</span>
                        <span className="text-xs text-slate-600 dark:text-slate-400">1</span>
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* Message timestamp and status */}
                {showTimestamp && (
                  <div className={cn(
                    "flex items-center text-xs text-slate-500 mt-1",
                    isCurrentUser ? "justify-end" : "justify-start"
                  )}>
                    <span className="text-[10px]">
                      {formatMessageTime(message.timestamp)}
                    </span>
                    
                    {isCurrentUser && (
                      <span className="ml-1">
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
};

// DateSeparator component
const DateSeparator: React.FC<{ date: string }> = ({ date }) => (
  <div className="flex items-center justify-center my-4">
    <div className="px-2 py-1 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-full">
      {date}
    </div>
  </div>
);

// System Message component
const SystemMessage: React.FC<{ content: string; timestamp: string | Date }> = ({ content, timestamp }) => (
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
  
  // Group messages by same sender in sequence - memoized for performance
  const groupedMessages = useMemo(() => {
    const groups: { sender: ChatParticipant | undefined, messages: Message[], date: Date }[] = [];
    let currentSender: string | null = null;
    let currentGroup: Message[] = [];
    let currentDate: Date | null = null;
    
    messages.forEach((message) => {
      const messageDate = new Date(message.timestamp);
      const messageDay = new Date(messageDate).setHours(0, 0, 0, 0);
      
      // Start a new group if sender changes or date changes
      if (message.senderId !== currentSender || 
          (currentDate && messageDay !== new Date(currentDate).setHours(0, 0, 0, 0))) {
        
        if (currentSender && currentGroup.length > 0) {
          groups.push({
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
      groups.push({
        sender: getParticipant(currentSender),
        messages: [...currentGroup],
        date: currentDate!
      });
    }
    
    return groups;
  }, [messages, getParticipant]);
  
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
    <ScrollArea ref={scrollRef} className={cn("h-full pb-4", className)}>
      <div className="px-4 py-2">
        {messages.length === 0 ? (
          <m.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-10 text-center"
          >
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-slate-500 dark:text-slate-400 font-medium">No messages yet</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[250px]">
              Send a message to start the conversation
            </p>
          </m.div>
        ) : (
          Object.entries(messagesByDate).map(([dateStr, groups]) => {
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
                  const isCurrentUser = group.sender?.id === currentUser.id;
                  
                  return (
                    <div key={`group-${groupIndex}`} className="mb-6">
                      {!isCurrentUser && !group.messages[0].isSystemMessage && (
                        <m.div 
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center gap-2 mb-1.5"
                        >
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
                        </m.div>
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
                          
                          const isFirst = messageIndex === 0;
                          const isLast = messageIndex === group.messages.length - 1;
                          
                          return (
                            <m.div 
                              key={message.id}
                              initial={{ opacity: 0, scale: 0.95, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              transition={{ 
                                duration: 0.2, 
                                delay: messageIndex * 0.05,
                                type: "spring",
                                damping: 25,
                                stiffness: 500
                              }}
                              className={cn(
                                "group relative max-w-[85%]",
                                isCurrentUser ? "ml-auto" : "mr-auto"
                              )}
                              onMouseEnter={() => setHoveredMessageId(message.id)}
                              onMouseLeave={() => setHoveredMessageId(null)}
                            >
                              <div className="flex items-end">
                                <div
                                  className={cn(
                                    "px-3.5 py-2.5 rounded-2xl shadow-sm max-w-full",
                                    isCurrentUser
                                      ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white dark:from-blue-600 dark:to-blue-700 rounded-br-sm"
                                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-sm",
                                    isFirst && !isLast && isCurrentUser ? "rounded-br-lg" : "",
                                    isFirst && !isLast && !isCurrentUser ? "rounded-bl-lg" : ""
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
                                        isCurrentUser ? "right-full mr-2" : "left-full ml-2"
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
                                        <DropdownMenuContent align={isCurrentUser ? "end" : "start"} className="flex flex-wrap min-w-[120px] p-1">
                                          {REACTIONS.map(reaction => (
                                            <m.button
                                              key={reaction.name}
                                              whileHover={{ scale: 1.2 }}
                                              whileTap={{ scale: 0.9 }}
                                              className="h-8 w-8 p-0 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700"
                                              onClick={() => onAddReaction && onAddReaction(message.id, reaction.emoji)}
                                            >
                                              {reaction.emoji_only ? (
                                                <span className="text-lg">{reaction.emoji}</span>
                                              ) : (
                                                reaction.icon || <span className="text-lg">{reaction.emoji}</span>
                                              )}
                                            </m.button>
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
                                        <DropdownMenuContent align={isCurrentUser ? "end" : "start"} className="w-40">
                                          <DropdownMenuItem className="cursor-pointer">
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy text
                                          </DropdownMenuItem>
                                          
                                          <DropdownMenuItem className="cursor-pointer">
                                            <Bookmark className="h-4 w-4 mr-2" />
                                            Save message
                                          </DropdownMenuItem>
                                          
                                          <DropdownMenuSeparator />
                                          
                                          <DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400">
                                            <AlertTriangle className="h-4 w-4 mr-2" />
                                            Report message
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </m.div>
                                  )}
                                </AnimatePresence>
                              </div>
                              
                              {/* Message reactions */}
                              {message.reactions && message.reactions.length > 0 && (
                                <m.div 
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={cn(
                                    "flex flex-wrap gap-1 mt-1",
                                    isCurrentUser ? "justify-end" : "justify-start"
                                  )}
                                >
                                  {message.reactions.map((reaction, i) => (
                                    <Badge
                                      key={`${reaction.emoji}-${i}`}
                                      variant="outline"
                                      className={cn(
                                        "text-xs px-1.5 py-0.5 rounded-full",
                                        "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                                      )}
                                    >
                                      <span className="mr-1">{reaction.emoji}</span>
                                      <span className="text-xs text-slate-600 dark:text-slate-400">1</span>
                                    </Badge>
                                  ))}
                                </m.div>
                              )}
                              
                              {/* Message timestamp and status */}
                              {isLast && (
                                <div className={cn(
                                  "flex items-center text-xs text-slate-500 mt-1",
                                  isCurrentUser ? "justify-end" : "justify-start"
                                )}>
                                  <span className="text-[10px]">
                                    {formatMessageTime(message.timestamp)}
                                  </span>
                                  
                                  {isCurrentUser && (
                                    <span className="ml-1">
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
                  );
                })}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}; 