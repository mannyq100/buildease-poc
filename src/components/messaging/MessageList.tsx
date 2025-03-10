import React, { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message, ChatParticipant } from "@/types/messaging";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CheckCheck, Check } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  participants: ChatParticipant[];
  currentUserId: string;
  className?: string;
  isDarkMode?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  participants,
  currentUserId,
  className,
  isDarkMode = false
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  
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
      case "delivered":
        return <Check className="h-3.5 w-3.5 text-slate-400" />;
      case "read":
        return <CheckCheck className="h-3.5 w-3.5 text-blue-500" />;
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
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0)) {
      return "Today";
    } else if (date.setHours(0, 0, 0, 0) === yesterday.setHours(0, 0, 0, 0)) {
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
  
  return (
    <ScrollArea ref={scrollRef} className={cn("h-full pb-4", className)}>
      <div className="px-4 py-2">
        {Object.entries(messagesByDate).map(([dateStr, groups]) => {
          const date = new Date(parseInt(dateStr));
          
          return (
            <div key={dateStr} className="mb-6">
              <div className="flex justify-center mb-4">
                <div className={cn(
                  "px-3 py-1 rounded-full text-xs", 
                  isDarkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"
                )}>
                  {formatDateHeader(date)}
                </div>
              </div>
              
              {groups.map((group, groupIndex) => {
                const isCurrentUser = group.sender?.id === currentUserId;
                
                return (
                  <div key={`group-${groupIndex}`} className="mb-6">
                    {!isCurrentUser && !group.messages[0].isSystemMessage && (
                      <div className="flex items-center gap-2 mb-1.5">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={group.sender?.avatar} />
                          <AvatarFallback className={isDarkMode ? "bg-slate-700 text-slate-200" : ""}>
                            {group.sender?.name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className={cn(
                          "text-sm font-medium", 
                          isDarkMode ? "text-slate-200" : "text-slate-800"
                        )}>
                          {group.sender?.name}
                        </span>
                      </div>
                    )}
                    
                    <div className={cn(
                      "flex flex-col gap-1",
                      isCurrentUser ? "items-end" : "items-start"
                    )}>
                      {group.messages.map((message, messageIndex) => {
                        if (message.isSystemMessage) {
                          return (
                            <div 
                              key={message.id} 
                              className={cn(
                                "py-1.5 px-3 mx-auto rounded-full text-xs",
                                isDarkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"
                              )}
                            >
                              {message.content}
                            </div>
                          );
                        }
                        
                        return (
                          <div 
                            key={message.id} 
                            className={cn(
                              "max-w-[80%] break-words",
                              isCurrentUser && "text-right"
                            )}
                          >
                            <div className={cn(
                              "inline-block py-2 px-3 rounded-lg",
                              isCurrentUser
                                ? (isDarkMode ? "bg-blue-900/50 text-blue-50" : "bg-blue-600 text-white")
                                : (isDarkMode ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-800")
                            )}>
                              {message.content}
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
                          </div>
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