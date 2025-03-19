import React, { useEffect, useState, useCallback, useRef, ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { Chat } from "@/components/messaging/Chat";
import { currentUser, mockConversations, mockMessages, teamMembers } from "@/data/mock/messaging";
import { PageHeader } from "@/components/shared/PageHeader";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  MessagesSquare, 
  Users, 
  Bell, 
  UserPlus, 
  Plus,
  Search,
  AlertCircle,
  Settings,
  Filter
} from "lucide-react";
import { useToast } from "@/components/ui/toast-context";
import { Conversation, ChatParticipant, Message, ConversationType } from "@/types/messaging";
import { PageLayout } from '@/components/ui/layout';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { m, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { User, Inbox, X, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

const Messaging: React.FC = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [targetUserId, setTargetUserId] = useState<string | undefined>(undefined);
  const processedStartChatRef = useRef<boolean>(false);
  const [isNewConversationDialogOpen, setIsNewConversationDialogOpen] = useState(false);
  const [newConversationSearchTerm, setNewConversationSearchTerm] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<ChatParticipant[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [activeTab, setActiveTab] = useState<ConversationType | "individual">("individual");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "unread" | "important">("all");
  
  // Load conversations with a simulated delay for loading state demonstration
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API loading
    const timer = setTimeout(() => {
      setConversations(
        [...mockConversations].sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
      );
      setMessages(mockMessages);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Filtered team members for selection
  const filteredTeamMembers = teamMembers
    .filter(member => member.id !== currentUser.id) // Exclude current user
    .filter(member => {
      if (!newConversationSearchTerm) return true;
      return member.name.toLowerCase().includes(newConversationSearchTerm.toLowerCase()) || 
             member.role?.toLowerCase().includes(newConversationSearchTerm.toLowerCase());
    });
    
  // Toggle participant selection
  const handleParticipantToggle = (participant: ChatParticipant) => {
    console.log("Toggling participant:", participant.name);
    if (selectedParticipants.some(p => p.id === participant.id)) {
      setSelectedParticipants(prev => prev.filter(p => p.id !== participant.id));
    } else {
      setSelectedParticipants(prev => [...prev, participant]);
    }
  };
  
  // Function to handle dialog close and reset state
  const handleDialogClose = () => {
    setIsNewConversationDialogOpen(false);
    setSelectedParticipants([]);
    setNewGroupName("");
    setNewConversationSearchTerm("");
  };
  
  // Function to create a new conversation directly from the dialog
  const handleCreateConversationFromDialog = () => {
    console.log("Creating conversation with participants:", selectedParticipants);
    
    if (activeTab === "individual" && selectedParticipants.length === 1) {
      handleCreateConversation("individual", selectedParticipants);
    } else if ((activeTab === "group" || activeTab === "project") && selectedParticipants.length > 0 && newGroupName.trim()) {
      // For group chats, create a modified participant list with the group name
      const participantsWithGroupName = [...selectedParticipants];
      // Include the group name in the chat creation
      handleCreateConversation(activeTab, participantsWithGroupName, newGroupName);
    } else {
      console.warn("Cannot create conversation - invalid state", {
        activeTab,
        participantCount: selectedParticipants.length,
        groupName: newGroupName
      });
      return;
    }
    
    handleDialogClose();
  };
  
  // Function to sort conversations by activity (most recent first)
  const sortConversationsByActivity = useCallback((convs: Conversation[]) => {
    return [...convs].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, []);
  
  // Function to filter conversations based on search and filters
  const filterConversations = useCallback((convs: Conversation[]) => {
    return convs.filter(conv => {
      // Apply search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        // Check conversation name
        const name = conv.name || "";
        if (name.toLowerCase().includes(searchLower)) return true;
        
        // Check participant names
        const hasMatchingParticipant = conv.participants.some(p => 
          p.name.toLowerCase().includes(searchLower)
        );
        if (hasMatchingParticipant) return true;
        
        // Check last message content
        if (conv.lastMessage?.content.toLowerCase().includes(searchLower)) return true;
        
        // No match found
        return false;
      }
      
      // Apply status filters
      if (selectedFilter === "unread" && (!conv.unreadCount || conv.unreadCount <= 0)) {
        return false;
      }
      
      if (selectedFilter === "important" && !conv.isPinned) {
        return false;
      }
      
      return true; // Include by default
    });
  }, [searchQuery, selectedFilter]);
  
  // Function to handle message sending
  const handleMessageSent = useCallback((conversationId: string, newMessage: Message) => {
    console.log("Message sent:", conversationId, newMessage);
    
    // Update the messages state
    setMessages(prevMessages => {
      const updatedMessages = {
        ...prevMessages,
        [conversationId]: [...(prevMessages[conversationId] || []), newMessage]
      };
      console.log("Updated messages:", updatedMessages);
      return updatedMessages;
    });
    
    // Update the conversation's lastMessage and updatedAt
    setConversations(prevConversations => {
      const updatedConversations = prevConversations.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            lastMessage: {
              content: newMessage.content,
              senderId: newMessage.senderId,
              timestamp: new Date().toISOString(),
              status: newMessage.status
            },
            updatedAt: new Date().toISOString(),
            unreadCount: 0 // Reset unread count when sending a message
          };
        }
        return conv;
      });
      
      // Re-sort conversations by activity
      return sortConversationsByActivity(updatedConversations);
    });
  }, [sortConversationsByActivity]);
  
  // Function to create a new conversation
  const handleCreateConversation = useCallback((type: ConversationType, participants: ChatParticipant[], groupName?: string) => {
    console.log("Creating new conversation", { type, participants, groupName });
    // Generate a unique conversation ID
    const newConversationId = `new-conv-${Date.now()}`;
    
    // Determine conversation name
    let name = undefined;
    if (type !== "individual") {
      if (groupName) {
        // Use provided group name
        name = groupName;
      } else {
        // Fall back to participant names if no group name provided
        const participantNames = participants.map(p => p.name.split(' ')[0]).slice(0, 3);
        name = `${type === "group" ? "Group" : "Project"}: ${participantNames.join(', ')}${participants.length > 3 ? '...' : ''}`;
      }
    }
    
    // Create the new conversation
    const newConversation: Conversation = {
      id: newConversationId,
      type,
      name,
      participants: [currentUser, ...participants],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      icon: type === "individual" ? "user" : type === "group" ? "users" : "inbox",
      unreadCount: 0
    };
    
    console.log("New conversation object:", newConversation);
    
    // Add the new conversation to the list
    setConversations(prevConversations => {
      const newConversations = [newConversation, ...prevConversations];
      return newConversations;
    });
    
    // Initialize an empty messages array for the new conversation
    setMessages(prevMessages => ({
      ...prevMessages,
      [newConversationId]: []
    }));
    
    // Set the new conversation as active
    setTargetUserId(participants[0].id);
    
    // Show success notification
    toast({
      title: "New conversation created",
      description: type === "individual" 
        ? `Chat with ${participants[0].name} started`
        : `New ${type.toLowerCase()} chat created with ${participants.length} members`,
      variant: "success"
    });
  }, [toast, currentUser]);
  
  // Reset the processedStartChatRef when conversations are loaded 
  // This ensures we can process startChatWith parameter when the component mounts
  useEffect(() => {
    if (!isLoading && conversations.length > 0) {
      processedStartChatRef.current = false;
    }
  }, [isLoading, conversations.length]);

  // Check if we're coming from the Team page with a team member to chat with
  useEffect(() => {
    // Skip if we've already processed this startChatWith or if conversations aren't loaded yet
    if (location.state?.startChatWith && !processedStartChatRef.current && !isLoading && conversations.length > 0) {
      console.log("Received startChatWith:", location.state.startChatWith);
      
      // Set the flag to true to prevent reprocessing
      processedStartChatRef.current = true;
      
      const teamMember = location.state.startChatWith;
      
      // Set the target user ID for the Chat component
      setTargetUserId(teamMember.id);
      
      // Check if a conversation with this team member already exists
      const existingConversation = conversations.find(conv => 
        conv.type === "individual" && 
        conv.participants.some(p => p.id === teamMember.id)
      );
      
      if (existingConversation) {
        console.log("Found existing conversation:", existingConversation.id);
        // If it exists, update its updatedAt timestamp to bring it to the top
        setConversations(prevConversations => {
          const updatedConversations = prevConversations.map(conv => {
            if (conv.id === existingConversation.id) {
              return {
                ...conv,
                updatedAt: new Date().toISOString()
              };
            }
            return conv;
          });
          
          // Re-sort conversations by activity
          return sortConversationsByActivity(updatedConversations);
        });
      } else {
        console.log("Creating new conversation with team member:", teamMember.name);
        // Create a new conversation with this team member
        const newParticipant: ChatParticipant = {
          id: teamMember.id,
          name: teamMember.name,
          avatar: teamMember.avatar || "",
          role: teamMember.role || "",
          isOnline: true
        };
        
        handleCreateConversation("individual", [newParticipant]);
      }
      
      // Clear the state to avoid creating the conversation again on refresh
      // Use setTimeout to ensure this happens after state updates are processed
      setTimeout(() => {
        window.history.replaceState({}, document.title);
      }, 100); // Increased timeout to ensure state updates are processed
    }
  }, [location.state, conversations, sortConversationsByActivity, handleCreateConversation, isLoading]);
  
  useEffect(() => {
    // Check for dark mode
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    
    checkDarkMode();
    
    // Listen for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <PageLayout>
      <Helmet>
        <title>Messaging | Buildease</title>
      </Helmet>

      <div className="flex flex-col h-full max-w-screen-2xl mx-auto">
        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-5"
        >
          <PageHeader
            title="Messages"
            description="Communicate with your team and clients in real-time"
            icon={<MessagesSquare className="h-7 w-7 text-white" />}
            className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 border-none shadow-lg"
            actions={
              <m.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => setIsNewConversationDialogOpen(true)}
                  className="text-sm font-medium shadow-sm hover:shadow transition-all bg-white text-blue-600 hover:bg-blue-50 dark:bg-slate-800 dark:text-blue-300 dark:hover:bg-slate-700 px-4"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  New Conversation
                </Button>
              </m.div>
            }
          />
        </m.div>

        <Dialog open={isNewConversationDialogOpen} onOpenChange={setIsNewConversationDialogOpen}>
          <DialogContent className="sm:max-w-[500px] rounded-xl p-0 overflow-hidden border-none shadow-xl">
            <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-slate-800 dark:to-slate-700">
              <m.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <DialogTitle className="text-xl font-semibold">New Conversation</DialogTitle>
                <DialogDescription className="text-slate-600 dark:text-slate-300">
                  Create a new chat with team members or project groups
                </DialogDescription>
              </m.div>
            </DialogHeader>
            
            <div className="px-6 py-5">
              <Tabs defaultValue="individual" value={activeTab} onValueChange={(v) => setActiveTab(v as ConversationType)} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <TabsTrigger value="individual" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm transition-all">
                    <User className="h-4 w-4 mr-2" />
                    Individual
                  </TabsTrigger>
                  <TabsTrigger value="group" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm transition-all">
                    <Users className="h-4 w-4 mr-2" />
                    Group
                  </TabsTrigger>
                  <TabsTrigger value="project" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm transition-all">
                    <Inbox className="h-4 w-4 mr-2" />
                    Project
                  </TabsTrigger>
                </TabsList>
                
                <div className="mb-5">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      placeholder={`Search ${activeTab === "individual" ? "team members" : "participants"}...`} 
                      value={newConversationSearchTerm}
                      onChange={(e) => setNewConversationSearchTerm(e.target.value)}
                      className="pl-9 h-10 rounded-lg border-slate-200 focus-visible:ring-blue-400"
                    />
                  </div>
                </div>
                
                {(activeTab === "group" || activeTab === "project") && (
                  <m.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-5 overflow-hidden"
                  >
                    <Input 
                      placeholder={`${activeTab === "group" ? "Group" : "Project"} name`} 
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="h-10 rounded-lg border-slate-200 focus-visible:ring-blue-400"
                    />
                  </m.div>
                )}
                
                {/* Selected participants */}
                {selectedParticipants.length > 0 && (
                  <m.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4"
                  >
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                      Selected ({selectedParticipants.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedParticipants.map(participant => (
                        <m.div 
                          key={participant.id}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          <Badge 
                            variant="secondary" 
                            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 dark:bg-slate-700 dark:text-blue-300 dark:border-slate-600"
                          >
                            <span className="text-xs font-medium">{participant.name}</span>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-4 w-4 p-0 ml-1 rounded-full hover:bg-blue-100 dark:hover:bg-slate-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleParticipantToggle(participant);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        </m.div>
                      ))}
                    </div>
                  </m.div>
                )}
                
                <ScrollArea className="h-[220px] border rounded-lg p-3 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  {filteredTeamMembers.length === 0 ? (
                    <m.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-10 text-slate-500"
                    >
                      <AlertCircle className="h-6 w-6 mx-auto mb-2 opacity-60" />
                      <p className="font-medium">No members found</p>
                      <p className="text-xs mt-1 opacity-75">
                        Try a different search term
                      </p>
                    </m.div>
                  ) : (
                    <div className="space-y-2">
                      {filteredTeamMembers.map(member => (
                        <m.div
                          key={member.id}
                          whileHover={{ scale: 1.01, backgroundColor: isDarkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(241, 245, 249, 0.8)' }}
                          whileTap={{ scale: 0.99 }}
                          className={cn(
                            "flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all",
                            selectedParticipants.some(p => p.id === member.id)
                              ? "bg-blue-50 dark:bg-slate-700 border border-blue-100 dark:border-blue-800"
                              : "hover:bg-slate-50 dark:hover:bg-slate-700 border border-transparent"
                          )}
                          onClick={() => handleParticipantToggle(member)}
                        >
                          <div className="flex items-center">
                            <Avatar className="h-9 w-9 mr-3 border-2 border-white shadow-sm dark:border-slate-800">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold dark:bg-blue-900 dark:text-blue-300">
                                {member.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-xs text-slate-500">{member.role}</div>
                            </div>
                          </div>
                          <div>
                            {selectedParticipants.some(p => p.id === member.id) ? (
                              <m.div 
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center"
                              >
                                <Check className="h-4 w-4 text-white" />
                              </m.div>
                            ) : (
                              <div className="h-6 w-6 rounded-full border-2 border-slate-200 dark:border-slate-600 flex items-center justify-center">
                                <UserPlus className="h-3.5 w-3.5 text-slate-400" />
                              </div>
                            )}
                          </div>
                        </m.div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </Tabs>
            </div>
            
            <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={handleDialogClose}
                className="h-10 px-4 rounded-lg border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300"
              >
                Cancel
              </Button>
              
              <m.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={handleCreateConversationFromDialog}
                  disabled={
                    (activeTab === "individual" && selectedParticipants.length !== 1) ||
                    ((activeTab === "group" || activeTab === "project") && 
                    (selectedParticipants.length === 0 || !newGroupName.trim()))
                  }
                  className="h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
                >
                  Create Conversation
                </Button>
              </m.div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AnimatePresence>
          <m.div 
            className="rounded-xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700 h-[calc(100vh-200px)] bg-white dark:bg-slate-900"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {isLoading ? (
              <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 h-full p-4 flex">
                {/* Loading skeleton for conversation list */}
                <div className="w-80 border-r border-slate-200 dark:border-slate-700 pr-2">
                  <div className="p-4">
                    <Skeleton className="h-10 w-full mb-5 rounded-lg" />
                    <div className="space-y-4">
                      {Array(6).fill(0).map((_, i) => (
                        <div key={i} className="flex items-start gap-3 p-1">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2 flex-1 pt-1">
                            <Skeleton className="h-4 w-3/4 rounded-md" />
                            <Skeleton className="h-3 w-full rounded-md" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Loading skeleton for chat area */}
                <div className="flex-1 flex flex-col">
                  <Skeleton className="h-16 w-full" />
                  <div className="flex-1 p-6 flex flex-col justify-end">
                    <div className="space-y-4">
                      {Array(4).fill(0).map((_, i) => (
                        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-[70%] ${i % 2 === 0 ? 'items-start' : 'items-end'}`}>
                            <Skeleton className={`h-12 w-48 ${i % 2 === 0 ? 'rounded-br-xl rounded-tr-xl rounded-tl-xl' : 'rounded-bl-xl rounded-tl-xl rounded-tr-xl'}`} />
                            <Skeleton className="h-3 w-24 mt-2 rounded-md" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <Skeleton className="h-14 w-full mt-6 rounded-lg" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full">
                <Chat 
                  conversations={filterConversations(conversations)} 
                  setConversations={setConversations}
                  messages={messages}
                  currentUser={currentUser}
                  isDarkMode={isDarkMode}
                  targetUserId={targetUserId}
                  onMessageSent={handleMessageSent}
                  onCreateConversation={handleCreateConversation}
                  className="h-full"
                />
              </div>
            )}
          </m.div>
        </AnimatePresence>
      </div>
    </PageLayout>
  );
};

export default Messaging; 