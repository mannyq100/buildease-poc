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
  UserPlus,
  Filter,
  X,
  Plus,
  Inbox,
  MessagesSquare
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
  DropdownMenuSeparator,
  DropdownMenuLabel
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
  
  // Track if we've already processed this targetUserId
  const processedUserRef = useRef<string | null>(null);
  
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
  
  // Handle targeted user conversation if targetUserId is provided - optimized to reduce reruns
  useEffect(() => {
    // Skip if no targetUserId, no conversations, or we've already processed this targetUserId
    if (!targetUserId || conversations.length === 0 || processedUserRef.current === targetUserId) {
      return;
    }
    
    // Find the conversation with the target user
    const targetConversation = conversations.find(conv => 
      conv.type === "individual" && 
      conv.participants.some(p => p.id === targetUserId)
    );
    
    if (targetConversation) {
      setActiveConversationId(targetConversation.id);
      // Store the processed targetUserId to prevent repeated processing
      processedUserRef.current = targetUserId;
    }
  }, [targetUserId, conversations]);
  
  // Use memoization to find target user conversation - this only recomputes when needed
  const targetUserConversation = React.useMemo(() => {
    if (!targetUserId || conversations.length === 0) return null;
    
    return conversations.find(conv => 
      conv.type === "individual" && 
      conv.participants.some(p => p.id === targetUserId)
    );
  }, [targetUserId, conversations]);
  
  // Set the active conversation based on memoized result - this separates calculation from effect
  useEffect(() => {
    if (targetUserConversation && processedUserRef.current !== targetUserId) {
      setActiveConversationId(targetUserConversation.id);
      processedUserRef.current = targetUserId;
    }
  }, [targetUserConversation, targetUserId]);
  
  // Handle conversation selection - optimized with memoization
  const selectedConversation = React.useMemo(() => {
    return activeConversationId ? conversations.find(c => c.id === activeConversationId) : null;
  }, [activeConversationId, conversations]);

  useEffect(() => {
    if (selectedConversation) {
      setActiveConversation(selectedConversation);
      // Make sure we're getting messages from the correct source
      const conversationMessages = messages[activeConversationId] || [];
      setConversationMessages(conversationMessages);
      
      // On mobile, hide the conversation list when a conversation is selected
      if (isMobileView) {
        setShowConversationList(false);
      }
    } else if (conversations.length > 0 && !activeConversationId) {
      // Auto-select the first conversation if none is selected
      setActiveConversationId(conversations[0].id);
    }
  }, [selectedConversation, activeConversationId, messages, isMobileView, conversations]);
  
  // Optimized sendMessage function with better performance
  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim() || !activeConversation) return;
    
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
    
    // Update the local conversation messages
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
    
    // Auto clear reply if it exists
    if (replyingTo) {
      setReplyingTo(null);
    }
  }, [newMessage, activeConversation, currentUser.id, onMessageSent, replyingTo]);
  
  // Enhanced typing indicator with debounce
  const handleTypingStart = useCallback(() => {
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
  }, [activeConversation, currentUser.id]);

  // Enhanced typing end with better cleanup
  const handleTypingEnd = useCallback(() => {
    if (!activeConversation) return;
    
    // Clear typing state for current user
    setTypingStatus(null);
    
    // Clear any existing timeout
    if (typingTimeoutRef.current[currentUser.id]) {
      clearTimeout(typingTimeoutRef.current[currentUser.id]);
      delete typingTimeoutRef.current[currentUser.id];
    }
  }, [activeConversation, currentUser.id]);
  
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
  
  // Handle message reactions
  const handleAddReaction = (messageId: string, reaction: string) => {
    // This would be handled by updating the message in state and sending to server
    console.log(`Added reaction ${reaction} to message ${messageId}`);
  };

  // Handle replying to a message
  const handleReplyToMessage = (messageId: string) => {
    const message = conversationMessages.find(m => m.id === messageId);
    if (message && activeConversation) {
      const sender = activeConversation.participants.find(p => p.id === message.senderId);
      const senderName = sender 
        ? sender.name
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
            isPinned: important
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
    console.log(`${muted ? 'Muting' : 'Unmuting'} notifications for conversation`);
    
    // Update conversation with mute status
    setConversations(prevConversations => {
      return prevConversations.map(conv => {
        if (conv.id === activeConversationId) {
          return {
            ...conv,
            // Store mute status in a custom property
            muted: muted
          };
        }
        return conv;
      });
    });
    
    // Show notification
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = muted 
        ? 'Notifications muted for this conversation'
        : 'Notifications enabled for this conversation';
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3000);
    }
  };

  // Handle adding participants
  const handleAddParticipant = () => {
    // This would open a dialog to add participants
    console.log('Open add participant dialog');
  };

  return (
    <div className={cn("flex h-full", className)}>
      {/* Conversation List - Show only when showConversationList is true */}
      {showConversationList && (
        <m.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="w-[320px] border-r border-slate-200 dark:border-slate-700 flex flex-col h-full overflow-hidden bg-white dark:bg-slate-900 shadow-sm"
        >
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                <MessagesSquare className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
                Conversations
              </h2>
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                        onClick={() => setIsSearching(!isSearching)}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Search conversations</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Filter</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>All messages</DropdownMenuItem>
                    <DropdownMenuItem>Unread</DropdownMenuItem>
                    <DropdownMenuItem>Important</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <AnimatePresence>
              {isSearching && (
                <m.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                      ref={searchInputRef}
                      placeholder="Search messages..." 
                      className="pl-9 border-slate-200 dark:border-slate-700 h-9 rounded-md focus-visible:ring-blue-400"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </div>
          
          <ScrollArea className="flex-1 overflow-auto">
            <div className="p-2">
              {conversations.length === 0 ? (
                <m.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-center py-10"
                >
                  <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <MessagesSquare className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">No conversations yet</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-[200px] mx-auto">
                    Start a new conversation with team members or clients
                  </p>
                </m.div>
              ) : (
                <div className="space-y-1.5">
                  {conversations.map(conversation => {
                    // Get other participant for individual chats
                    const otherParticipant = 
                      conversation.type === "individual" 
                        ? conversation.participants.find(p => p.id !== currentUser.id) 
                        : null;
                    
                    return (
                      <m.div
                        whileHover={{ scale: 1.01, x: 2 }}
                        whileTap={{ scale: 0.99 }}
                        key={conversation.id}
                        className={cn(
                          "relative cursor-pointer px-3 py-2.5 rounded-lg transition-all",
                          activeConversationId === conversation.id
                            ? "bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-900 shadow-sm"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800/60",
                          conversation.unreadCount && conversation.unreadCount > 0
                            ? "bg-blue-50/50 dark:bg-blue-900/20"
                            : ""
                        )}
                        onClick={() => setActiveConversationId(conversation.id)}
                      >
                        <div className="flex items-start space-x-3">
                          {conversation.type === "individual" ? (
                            <div className="relative">
                              <Avatar className="h-11 w-11 border-2 border-white dark:border-slate-800 shadow-sm">
                                <AvatarImage src={otherParticipant?.avatar} />
                                <AvatarFallback className="bg-blue-100 text-blue-700 font-medium dark:bg-blue-900 dark:text-blue-300">
                                  {otherParticipant?.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              {otherParticipant?.isOnline && (
                                <span className="absolute bottom-0 right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-slate-800 ring-2 ring-white/10 dark:ring-slate-800/20"></span>
                              )}
                            </div>
                          ) : (
                            <div className="relative">
                              <div className="h-11 w-11 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-sky-100 dark:from-blue-900 dark:to-sky-900 shadow-sm border-2 border-white dark:border-slate-800">
                                {conversation.type === "group" ? (
                                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                                ) : (
                                  <Inbox className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                                )}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <div className="font-medium truncate text-slate-800 dark:text-slate-200">
                                {conversation.type === "individual" 
                                  ? otherParticipant?.name 
                                  : conversation.name || "Unnamed Group"}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap ml-2">
                                {conversation.lastMessage?.timestamp 
                                  ? new Date(conversation.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                  : ""}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="text-sm truncate text-slate-500 dark:text-slate-400 max-w-[180px]">
                                {conversation.lastMessage?.senderId === currentUser.id && (
                                  <span className="font-medium text-slate-600 dark:text-slate-300">You: </span>
                                )}
                                {conversation.lastMessage?.content || "No messages yet"}
                              </div>
                              
                              <div className="flex items-center space-x-1 ml-2">
                                {conversation.isPinned && (
                                  <div className="h-3 w-3 text-amber-500 dark:text-amber-400">
                                    <Star className="h-3 w-3 fill-current" />
                                  </div>
                                )}
                                
                                {conversation.unreadCount && conversation.unreadCount > 0 && (
                                  <m.div 
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    className="bg-blue-500 text-white h-5 min-w-5 rounded-full flex items-center justify-center text-xs font-medium px-1.5"
                                  >
                                    {conversation.unreadCount}
                                  </m.div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </m.div>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollArea>
        </m.div>
      )}
      
      {/* Conversation Details */}
      <div className={cn(
        "flex-1 flex flex-col h-full",
        !showConversationList && "w-full"
      )}>
        {activeConversation ? (
          <>
            {/* Conversation Header */}
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-10">
              <div className="flex items-center">
                {isMobileView && !showConversationList && (
                  <m.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleBackToList}
                      className="mr-2 h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <ChevronLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </Button>
                  </m.div>
                )}
                
                <div className="flex items-center">
                  {activeConversation.type === "individual" ? (
                    <div className="relative">
                      <Avatar className="h-9 w-9 border-2 border-white dark:border-slate-800 shadow-sm">
                        <AvatarImage src={getOtherParticipant(activeConversation)?.avatar} />
                        <AvatarFallback className="bg-blue-100 text-blue-700 font-medium dark:bg-blue-900 dark:text-blue-300">
                          {getOtherParticipant(activeConversation)?.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {getOtherParticipant(activeConversation)?.isOnline && (
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white dark:border-slate-800"></span>
                      )}
                    </div>
                  ) : (
                    <div className="h-9 w-9 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-sky-100 dark:from-blue-900 dark:to-sky-900 shadow-sm border-2 border-white dark:border-slate-800">
                      {activeConversation.type === "group" ? (
                        <Users className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                      ) : (
                        <Inbox className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                      )}
                    </div>
                  )}
                  
                  <div className="ml-3">
                    <div className="font-medium text-slate-800 dark:text-slate-200">
                      {getConversationName(activeConversation)}
                    </div>
                    
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {activeConversation.type === "individual" 
                        ? getParticipantStatus(activeConversation) 
                        : `${activeConversation.participants.length} participants`}
                      
                      {typingStatus && (
                        <m.span 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-green-600 dark:text-green-400 ml-1 font-medium inline-flex items-center"
                        >
                          <span className="mr-1">•</span>
                          <span className="relative flex h-2 w-2 mr-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                          typing...
                        </m.span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Call</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                      >
                        <Video className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Video call</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                        onClick={handleSearchToggle}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Search in conversation</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Conversation options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={() => handleMarkImportant(!activeConversation.isPinned)}
                      className="cursor-pointer"
                    >
                      {activeConversation.isPinned ? (
                        <>
                          <StarOff className="h-4 w-4 mr-2" />
                          <span>Unpin conversation</span>
                        </>
                      ) : (
                        <>
                          <Star className="h-4 w-4 mr-2" />
                          <span>Pin conversation</span>
                        </>
                      )}
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      onClick={() => handleMuteNotifications(!(activeConversation.muted ?? false))}
                      className="cursor-pointer"
                    >
                      {activeConversation.muted ? (
                        <>
                          <Bell className="h-4 w-4 mr-2" />
                          <span>Unmute notifications</span>
                        </>
                      ) : (
                        <>
                          <BellOff className="h-4 w-4 mr-2" />
                          <span>Mute notifications</span>
                        </>
                      )}
                    </DropdownMenuItem>
                    
                    {activeConversation.type !== "individual" && (
                      <DropdownMenuItem onClick={handleAddParticipant} className="cursor-pointer">
                        <UserPlus className="h-4 w-4 mr-2" />
                        <span>Add participant</span>
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={handleArchiveConversation} className="cursor-pointer">
                      <Archive className="h-4 w-4 mr-2" />
                      <span>Archive conversation</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      onClick={handleDeleteConversation} 
                      className="text-red-600 hover:text-red-700 focus:text-red-700 cursor-pointer"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      <span>Delete conversation</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Message List - Enhanced with a gradient background */}
            <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 bg-[url('/patterns/message-bg.svg')] dark:bg-[url('/patterns/message-bg-dark.svg')] bg-opacity-5 dark:bg-opacity-5">
              <MessageList 
                messages={conversationMessages} 
                currentUser={currentUser} 
                participants={activeConversation.participants}
                isDarkMode={isDarkMode}
                onReplyToMessage={handleReplyToMessage}
                onAddReaction={(messageId, reaction) => handleAddReaction(messageId, reaction)}
              />
              <div ref={messagesEndRef} />
            </div>
            
            {/* Message Input - Enhanced with animations and styling */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <AnimatePresence>
                {replyingTo && (
                  <m.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mb-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg flex justify-between items-start overflow-hidden"
                  >
                    <div className="flex-1">
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Replying to {replyingTo.senderName}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-300 truncate">
                        {replyingTo.content}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                      onClick={() => setReplyingTo(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </m.div>
                )}
              </AnimatePresence>
              
              <MessageInput 
                value={newMessage}
                onChange={setNewMessage}
                onSend={handleSendMessage}
                onTypingStart={handleTypingStart}
                onTypingEnd={handleTypingEnd}
                placeholder="Type a message..."
                isDarkMode={isDarkMode}
                replyingTo={replyingTo}
                onCancelReply={() => setReplyingTo(null)}
              />
            </div>
          </>
        ) : (
          // Empty state when no conversation is selected - Enhanced with animations
          <m.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex items-center justify-center bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800"
          >
            <m.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center max-w-md mx-auto p-5"
            >
              <m.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  delay: 0.3 
                }}
                className="mb-6 mx-auto w-24 h-24 rounded-full bg-gradient-to-r from-blue-100 to-sky-100 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center shadow-md"
              >
                <MessagesSquare className="h-12 w-12 text-blue-500 dark:text-blue-400" />
              </m.div>
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-3">
                Select a conversation
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Choose an existing conversation or start a new one to begin messaging
              </p>
              <m.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={() => {
                    // Trigger the "New Conversation" flow
                    if (onCreateConversation) {
                      // This is a simplified version - in real usage, we'd open a dialog to select participants
                      const firstTeamMember = conversations.length > 0 
                        ? conversations[0].participants.find(p => p.id !== currentUser.id)
                        : null;
                      
                      if (firstTeamMember) {
                        onCreateConversation("individual", [firstTeamMember]);
                      }
                    }
                  }}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 px-4 rounded-lg shadow-md transition-all"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Conversation
                </Button>
              </m.div>
            </m.div>
          </m.div>
        )}
      </div>
    </div>
  );
}; 