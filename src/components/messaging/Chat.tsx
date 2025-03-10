import React, { useState, useEffect, useCallback, useRef } from "react";
import { ConversationList } from "./ConversationList";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { 
  Conversation, 
  Message, 
  ChatParticipant,
  ConversationType
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
  Search,
  ChevronLeft,
  Archive,
  Trash,
  Bell,
  BellOff,
  UserPlus
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
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { m, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatProps {
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  messages: Record<string, Message[]>;
  currentUser: ChatParticipant;
  className?: string;
  isDarkMode?: boolean;
  targetUserId?: string;
  onMessageSent?: (conversationId: string, message: Message) => void;
  onCreateConversation?: (type: ConversationType, participants: ChatParticipant[]) => void;
}

export const Chat: React.FC<ChatProps> = ({ 
  conversations,
  setConversations,
  messages,
  currentUser,
  className,
  isDarkMode = false,
  targetUserId,
  onMessageSent,
  onCreateConversation
}) => {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  const [showConversationList, setShowConversationList] = useState<boolean>(true);
  const [typingStatus, setTypingStatus] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState<string>('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    content: string;
    senderName: string;
  } | null>(null);
  
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
      console.log("Chat component received targetUserId:", targetUserId);
      
      // Find the conversation with the target user
      const targetConversation = conversations.find(conv => 
        conv.type === "individual" && 
        conv.participants.some(p => p.id === targetUserId)
      );
      
      if (targetConversation) {
        console.log("Found conversation with target user:", targetConversation.id);
        setActiveConversationId(targetConversation.id);
      } else {
        console.log("No existing conversation found with targetUserId:", targetUserId);
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
  
  // Handle typing indicator
  const handleTypingStart = () => {
    if (!activeConversation) return;
    
    // Clear any existing timeout
    if (typingTimeoutRef.current[currentUser.id]) {
      clearTimeout(typingTimeoutRef.current[currentUser.id]);
    }
    
    // Set typing state for current user
    setTypingStatus('typing...');
    
    // Set timeout to clear typing state after 3 seconds
    typingTimeoutRef.current[currentUser.id] = setTimeout(() => {
      setTypingStatus(null);
    }, 3000);
  };

  // Handle end of typing
  const handleTypingEnd = () => {
    if (!activeConversation) return;
    
    // Clear typing state for current user
    setTypingStatus(null);
    
    // Clear any existing timeout
    if (typingTimeoutRef.current[currentUser.id]) {
      clearTimeout(typingTimeoutRef.current[currentUser.id]);
    }
  };

  // Handle message reactions
  const handleAddReaction = (messageId: string, reaction: string) => {
    // This would be handled by updating the message in state and sending to server
    console.log(`Added reaction ${reaction} to message ${messageId}`);
  };

  // Handle replying to a message
  const handleReplyToMessage = (messageId: string) => {
    if (!activeConversation) return;
    
    const messagesList = messages[activeConversation.id] || [];
    const message = messagesList.find(m => m.id === messageId);
    
    if (message) {
      const sender = activeConversation.participants.find(p => p.id === message.senderId);
      const senderName = sender 
        ? `${sender.firstName} ${sender.lastName}`
        : 'Unknown User';
      
      setReplyingTo({
        id: messageId,
        content: message.content,
        senderName
      });
    }
  };

  // Handle searching in conversation
  const handleSearchToggle = () => {
    setIsSearching(!isSearching);
    if (!isSearching) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery('');
    }
  };

  // Handle marking a conversation as important
  const handleMarkImportant = (important: boolean) => {
    if (!activeConversation) return;
    
    setConversations(prevConversations => 
      prevConversations.map(conv => {
        if (conv.id === activeConversation.id) {
          return {
            ...conv,
            isImportant: important
          };
        }
        return conv;
      })
    );
  };

  // Handle archiving a conversation
  const handleArchiveConversation = () => {
    if (!activeConversation) return;
    
    setConversations(prevConversations => 
      prevConversations.map(conv => {
        if (conv.id === activeConversation.id) {
          return {
            ...conv,
            isArchived: true
          };
        }
        return conv;
      })
    );
    
    if (isMobileView) {
      setShowConversationList(false);
    }
    setActiveConversation(null);
  };

  // Handle deleting a conversation
  const handleDeleteConversation = () => {
    if (!activeConversation) return;
    
    setConversations(prevConversations => 
      prevConversations.filter(conv => conv.id !== activeConversation.id)
    );
    
    if (isMobileView) {
      setShowConversationList(false);
    }
    setActiveConversation(null);
  };

  // Handle muting notifications
  const handleMuteNotifications = (muted: boolean) => {
    if (!activeConversation) return;
    
    setConversations(prevConversations => 
      prevConversations.map(conv => {
        if (conv.id === activeConversation.id) {
          return {
            ...conv,
            isMuted: muted
          };
        }
        return conv;
      })
    );
  };

  // Handle adding participants
  const handleAddParticipant = () => {
    // This would open a dialog to add participants
    console.log('Open add participant dialog');
  };

  // Render empty state when no conversation is selected
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-24 h-24 mb-6 rounded-full bg-slate-100 flex items-center justify-center">
        <m.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </m.div>
      </div>
      <h3 className="text-xl font-medium mb-2">No conversation selected</h3>
      <p className="text-slate-500 mb-6 max-w-md">
        Select a conversation from the list or start a new conversation.
      </p>
    </div>
  );

  return (
    <div className={cn("flex h-full", className)}>
      {/* Conversation List - Always visible on desktop, conditionally on mobile */}
      <AnimatePresence mode="wait">
        {(showConversationList || !isMobileView) && (
          <m.div 
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
              onCreateConversation={onCreateConversation}
              currentUser={currentUser}
            />
          </m.div>
        )}
      </AnimatePresence>
      
      {/* Active Conversation */}
      <AnimatePresence mode="wait">
        {activeConversation && (!showConversationList || !isMobileView) && (
          <m.div 
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
                    <ChevronLeft className="h-4 w-4" />
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
                {isSearching ? (
                  <div className="relative flex items-center mr-1">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search in conversation..."
                      className="h-8 px-3 pl-8 text-sm border rounded-md w-[200px] dark:bg-slate-800 dark:border-slate-700"
                    />
                    <Search size={14} className="absolute left-2.5 text-slate-500" />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleSearchToggle}
                      className="ml-1 h-8 w-8 p-0"
                    >
                      <span className="sr-only">Close search</span>
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                      </svg>
                    </Button>
                  </div>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={handleSearchToggle}
                          className="h-8 w-8"
                        >
                          <Search size={16} />
                          <span className="sr-only">Search</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Search in conversation</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Phone size={16} />
                        <span className="sr-only">Call</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Start voice call</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Video size={16} />
                        <span className="sr-only">Video Call</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Start video call</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical size={16} />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => handleMarkImportant(!activeConversation.isImportant)}>
                      <Star size={16} className="mr-2" />
                      {activeConversation.isImportant ? 'Remove from important' : 'Mark as important'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleMuteNotifications(!activeConversation.isMuted)}>
                      {activeConversation.isMuted ? (
                        <>
                          <Bell size={16} className="mr-2" />
                          Unmute notifications
                        </>
                      ) : (
                        <>
                          <BellOff size={16} className="mr-2" />
                          Mute notifications
                        </>
                      )}
                    </DropdownMenuItem>
                    {(activeConversation.type === 'group' || activeConversation.type === 'project') && (
                      <DropdownMenuItem onClick={handleAddParticipant}>
                        <UserPlus size={16} className="mr-2" />
                        Add participants
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleArchiveConversation}>
                      <Archive size={16} className="mr-2" />
                      Archive conversation
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDeleteConversation} className="text-red-500">
                      <Trash size={16} className="mr-2" />
                      Delete conversation
                    </DropdownMenuItem>
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
                onReplyToMessage={handleReplyToMessage}
                onAddReaction={handleAddReaction}
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
                replyingTo={replyingTo}
                onCancelReply={() => setReplyingTo(null)}
              />
            </div>
          </m.div>
        )}
      </AnimatePresence>
      
      {/* Empty State */}
      <AnimatePresence>
        {!activeConversation && !showConversationList && (
          <m.div 
            className="flex-1 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <m.div 
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
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 