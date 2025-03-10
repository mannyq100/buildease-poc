import React, { useState, useEffect, useCallback, useRef } from "react";
import { ConversationList } from "./ConversationList";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { 
  Conversation, 
  Message, 
  ChatParticipant 
} from "@/types/messaging";
import { 
  Phone, 
  Video, 
  MoreVertical, 
  Users, 
  Info, 
  ArrowLeft,
  ChevronRight,
  Star,
  StarOff,
  Search
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface ChatProps {
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  messages: Record<string, Message[]>;
  currentUser: ChatParticipant;
  className?: string;
  isDarkMode?: boolean;
  targetUserId?: string;
  onMessageSent?: (conversationId: string, message: Message) => void;
}

export const Chat: React.FC<ChatProps> = ({ 
  conversations,
  setConversations,
  messages,
  currentUser,
  className,
  isDarkMode = false,
  targetUserId,
  onMessageSent
}) => {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  const [showConversationList, setShowConversationList] = useState<boolean>(true);
  const [typingStatus, setTypingStatus] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState<string>('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  
  // Check if mobile view
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);
  
  // Handle targeted user conversation if targetUserId is provided
  useEffect(() => {
    if (targetUserId && conversations.length > 0) {
      // Find the conversation with the target user
      const targetConversation = conversations.find(conv => 
        conv.type === "individual" && 
        conv.participants.some(p => p.id === targetUserId)
      );
      
      if (targetConversation) {
        setActiveConversationId(targetConversation.id);
      }
    }
  }, [targetUserId, conversations]);
  
  // Handle conversation selection
  useEffect(() => {
    if (activeConversationId) {
      const conversation = conversations.find(c => c.id === activeConversationId);
      
      if (conversation) {
        setActiveConversation(conversation);
        // Make sure we're getting messages from the correct source
        const conversationMessages = messages[activeConversationId] || [];
        setConversationMessages(conversationMessages);
        
        // On mobile, hide the conversation list when a conversation is selected
        if (isMobileView) {
          setShowConversationList(false);
        }
      }
    } else if (conversations.length > 0) {
      // Auto-select the first conversation if none is selected
      setActiveConversationId(conversations[0].id);
    }
  }, [activeConversationId, conversations, messages, isMobileView]);
  
  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    
    if (activeConversation) {
      const messageContent = newMessage.trim();
      
      // Clear the input field immediately for better UX
      setNewMessage('');
      
      const message: Message = {
        id: `msg-${Date.now()}`,
        conversationId: activeConversation.id,
        senderId: currentUser.id,
        content: messageContent,
        timestamp: new Date().toISOString(),
        status: 'delivered'
      };
      
      // Update the local conversation messages (use functional update to avoid stale closures)
      setConversationMessages(prev => [...prev, message]);
      
      // Call the onMessageSent callback to update the parent component's state
      if (onMessageSent) {
        // Use setTimeout to defer this slightly and avoid any potential navigation issues
        setTimeout(() => {
          onMessageSent(activeConversation.id, message);
        }, 0);
      }
      
      // Scroll to bottom after message is sent
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };
  
  // Generate auto-reply based on message content
  const getAutoReply = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
      return "Hello! How can I help with the project today?";
    } else if (lowerMessage.includes("timeline") || lowerMessage.includes("schedule")) {
      return "We're still on track with the timeline. The foundation work should be completed by Friday.";
    } else if (lowerMessage.includes("budget") || lowerMessage.includes("cost")) {
      return "The budget is currently within our estimates. Would you like me to send you the latest expense report?";
    } else if (lowerMessage.includes("material") || lowerMessage.includes("supplies")) {
      return "All materials for the current phase have been ordered. The cement delivery is scheduled for tomorrow morning.";
    } else if (lowerMessage.includes("meeting") || lowerMessage.includes("discuss")) {
      return "I'm available for a meeting tomorrow afternoon. Does 2 PM work for you?";
    } else if (lowerMessage.includes("problem") || lowerMessage.includes("issue")) {
      return "Let's discuss this issue in detail. Can you provide more specific information so I can help resolve it?";
    } else if (lowerMessage.includes("plan") || lowerMessage.includes("design")) {
      return "I've updated the design plans based on our last discussion. I'll share the updated drawings in the project documents.";
    } else {
      return "Thanks for your message. I'll look into this and get back to you soon.";
    }
  };
  
  const handleBackToList = () => {
    if (isMobileView) {
      setShowConversationList(true);
    }
  };
  
  const getConversationName = (conversation: Conversation | null) => {
    if (!conversation) return "";
    
    if (conversation.name) return conversation.name;
    
    // For individual chats, show the other person's name
    if (conversation.type === "individual") {
      const otherParticipant = conversation.participants.find(p => p.id !== currentUser.id);
      return otherParticipant?.name || "Unknown";
    }
    
    return "Unnamed Conversation";
  };
  
  const getParticipantStatus = (conversation: Conversation | null) => {
    if (!conversation || conversation.type !== "individual") return null;
    
    const otherParticipant = conversation.participants.find(p => p.id !== currentUser.id);
    if (!otherParticipant) return null;
    
    return otherParticipant.isOnline 
      ? "Online" 
      : otherParticipant.lastSeen 
        ? `Last seen ${format(new Date(otherParticipant.lastSeen), "h:mm a")}` 
        : null;
  };
  
  const getOtherParticipant = (conversation: Conversation | null) => {
    if (!conversation || conversation.type !== "individual") return null;
    
    return conversation.participants.find(p => p.id !== currentUser.id);
  };
  
  return (
    <div className={cn("flex h-full", className)}>
      {/* Conversation List - Always visible on desktop, conditionally on mobile */}
      <AnimatePresence mode="wait">
        {(showConversationList || !isMobileView) && (
          <motion.div 
            className={cn(
              "border-r h-full",
              isDarkMode ? "border-slate-700 bg-slate-900/95" : "border-slate-200 bg-white/95",
              isMobileView ? "w-full" : "w-80"
            )}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search conversations..." 
                  className={cn(
                    "pl-9 bg-slate-100 dark:bg-slate-800 border-none",
                    "focus-visible:ring-blue-500/50 focus-visible:ring-offset-0"
                  )}
                />
              </div>
            </div>
            <ConversationList
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={setActiveConversationId}
              isDarkMode={isDarkMode}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Active Conversation */}
      <AnimatePresence mode="wait">
        {activeConversation && (!showConversationList || !isMobileView) && (
          <motion.div 
            className="flex-1 flex flex-col h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Chat Header */}
            <div className={cn(
              "border-b p-3 flex items-center justify-between",
              isDarkMode ? "border-slate-700 bg-slate-800/50" : "border-slate-200 bg-white"
            )}>
              <div className="flex items-center gap-3">
                {isMobileView && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "mr-1",
                      isDarkMode ? "text-slate-300 hover:text-slate-100 hover:bg-slate-800" : ""
                    )}
                    onClick={handleBackToList}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                
                {activeConversation.type === "individual" && (
                  <div className="relative">
                    <Avatar className="h-9 w-9 ring-2 ring-offset-2 ring-blue-500/30 dark:ring-blue-600/30 dark:ring-offset-0">
                      <AvatarImage src={getOtherParticipant(activeConversation)?.avatar} />
                      <AvatarFallback className={isDarkMode ? "bg-slate-700 text-slate-200" : ""}>
                        {getOtherParticipant(activeConversation)?.name.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    {getOtherParticipant(activeConversation)?.isOnline && (
                      <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-slate-800" />
                    )}
                  </div>
                )}
                
                {activeConversation.type !== "individual" && (
                  <div className={cn(
                    "flex items-center justify-center w-9 h-9 rounded-full",
                    activeConversation.type === "group" 
                      ? (isDarkMode ? "bg-indigo-900/40 text-indigo-300" : "bg-indigo-100 text-indigo-600")
                      : activeConversation.type === "project"
                        ? (isDarkMode ? "bg-amber-900/40 text-amber-300" : "bg-amber-100 text-amber-600")
                        : (isDarkMode ? "bg-slate-800 text-slate-300" : "bg-slate-200 text-slate-600")
                  )}>
                    <Users className="h-5 w-5" />
                  </div>
                )}
                
                <div>
                  <div className="font-medium flex items-center">
                    {getConversationName(activeConversation)}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 ml-1"
                    >
                      {activeConversation.isPinned ? (
                        <Star className="h-3.5 w-3.5 text-amber-400" />
                      ) : (
                        <StarOff className="h-3.5 w-3.5 text-slate-400 hover:text-amber-400" />
                      )}
                    </Button>
                  </div>
                  {activeConversation.type === "individual" && (
                    <div className={cn(
                      "text-xs",
                      isDarkMode ? "text-slate-400" : "text-slate-500"
                    )}>
                      {getParticipantStatus(activeConversation)}
                    </div>
                  )}
                </div>
                
                {activeConversation.type !== "individual" && (
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "ml-2 capitalize",
                      activeConversation.type === "group" 
                        ? (isDarkMode ? "border-indigo-700 text-indigo-300" : "border-indigo-200 text-indigo-600")
                        : (isDarkMode ? "border-amber-700 text-amber-300" : "border-amber-200 text-amber-600")
                    )}
                  >
                    {activeConversation.type}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className={cn(
                          "rounded-full",
                          isDarkMode ? "text-slate-300 hover:text-slate-100 hover:bg-slate-800" : "hover:bg-slate-100"
                        )}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Voice call</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className={cn(
                          "rounded-full",
                          isDarkMode ? "text-slate-300 hover:text-slate-100 hover:bg-slate-800" : "hover:bg-slate-100"
                        )}
                      >
                        <Video className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Video call</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <Sheet>
                  <SheetTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className={isDarkMode ? "text-slate-300 hover:text-slate-100 hover:bg-slate-800" : ""}
                    >
                      <Users className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent className={isDarkMode ? "bg-slate-900 text-slate-100 border-slate-700" : ""}>
                    <SheetHeader>
                      <SheetTitle>Participants</SheetTitle>
                      <SheetDescription className={isDarkMode ? "text-slate-400" : ""}>
                        {activeConversation.participants.length} members in this conversation
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-4">
                      {activeConversation.participants.map(participant => (
                        <div key={participant.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={participant.avatar} />
                              <AvatarFallback className={isDarkMode ? "bg-slate-700 text-slate-200" : ""}>
                                {participant.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {participant.name}
                                {participant.id === currentUser.id && " (You)"}
                              </div>
                              <div className={cn(
                                "text-xs",
                                isDarkMode ? "text-slate-400" : "text-slate-500"
                              )}>
                                {participant.role}
                              </div>
                            </div>
                          </div>
                          <div>
                            {participant.isOnline ? (
                              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                                Online
                              </Badge>
                            ) : (
                              <span className={cn(
                                "text-xs",
                                isDarkMode ? "text-slate-400" : "text-slate-500"
                              )}>
                                Offline
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className={isDarkMode ? "text-slate-300 hover:text-slate-100 hover:bg-slate-800" : ""}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className={isDarkMode ? "bg-slate-900 border-slate-700" : ""}>
                    <DropdownMenuItem>Pin conversation</DropdownMenuItem>
                    <DropdownMenuItem>Mark as unread</DropdownMenuItem>
                    <DropdownMenuItem>Mute notifications</DropdownMenuItem>
                    <DropdownMenuItem>Search in conversation</DropdownMenuItem>
                    {activeConversation.type !== "individual" && (
                      <DropdownMenuItem>Leave conversation</DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Messages */}
            <div className={cn(
              "flex-1 overflow-hidden bg-pattern",
              isDarkMode ? "bg-slate-900/30" : "bg-slate-50/70"
            )}>
              <MessageList
                messages={conversationMessages}
                participants={activeConversation.participants}
                currentUserId={currentUser.id}
                isDarkMode={isDarkMode}
              />
            </div>
            
            {/* Typing Indicator */}
            {typingStatus && (
              <div className={cn(
                "px-4 py-1 text-xs italic border-t",
                isDarkMode ? "text-slate-400 border-slate-700 bg-slate-800/50" : "text-slate-500 border-slate-200 bg-white"
              )}>
                {typingStatus}
              </div>
            )}
            
            {/* Message Input */}
            <div className={cn(
              "border-t",
              isDarkMode ? "border-slate-700 bg-slate-800/80" : "border-slate-200 bg-white"
            )}>
              <MessageInput
                onSendMessage={(content) => {
                  // Handle message sending directly instead of updating state first
                  if (content.trim() && activeConversation) {
                    const message: Message = {
                      id: `msg-${Date.now()}`,
                      conversationId: activeConversation.id,
                      senderId: currentUser.id,
                      content: content.trim(),
                      timestamp: new Date().toISOString(),
                      status: 'delivered'
                    };
                    
                    // Update the local conversation messages
                    setConversationMessages(prev => [...prev, message]);
                    
                    // Call the onMessageSent callback to update the parent component's state
                    if (onMessageSent) {
                      // Use setTimeout to defer this slightly
                      setTimeout(() => {
                        onMessageSent(activeConversation.id, message);
                      }, 0);
                    }
                    
                    // Scroll to bottom after message is sent
                    setTimeout(() => {
                      if (messagesEndRef.current) {
                        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 100);
                  }
                }}
                isDarkMode={isDarkMode}
                className="rounded-b-lg"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Empty State */}
      <AnimatePresence>
        {!activeConversation && !showConversationList && (
          <motion.div 
            className="flex-1 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="text-center p-6"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className={cn(
                "mx-auto mb-4 p-4 rounded-full",
                isDarkMode ? "bg-slate-800 text-blue-400" : "bg-blue-50 text-blue-500"
              )}>
                <Users className="h-8 w-8" />
              </div>
              <h3 className={cn(
                "text-lg font-medium mb-2",
                isDarkMode ? "text-white" : "text-slate-900" 
              )}>
                Select a conversation
              </h3>
              <p className={cn(
                "text-sm max-w-sm",
                isDarkMode ? "text-slate-400" : "text-slate-500" 
              )}>
                Choose a conversation from the list or start a new one to begin messaging.
              </p>
              {isMobileView && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleBackToList}
                >
                  View Conversations
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 