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
import { MessagesSquare, Users, Bell, UserPlus, Plus } from "lucide-react";
import { useToast } from "@/components/ui/toast-context";
import { Conversation, ChatParticipant, Message, ConversationType } from "@/types/messaging";
import { PageLayout } from '@/components/ui/layout';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const Messaging: React.FC = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>(
    // Sort conversations by updatedAt in descending order
    [...mockConversations].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  );
  const [messages, setMessages] = useState(mockMessages);
  const [targetUserId, setTargetUserId] = useState<string | undefined>(undefined);
  const processedStartChatRef = useRef<boolean>(false);
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState<boolean>(false);
  
  // Function to sort conversations by activity (most recent first)
  const sortConversationsByActivity = useCallback((convs: Conversation[]) => {
    return [...convs].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, []);
  
  // Function to handle sending a new message
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
              timestamp: newMessage.timestamp,
              status: newMessage.status
            },
            updatedAt: new Date().toISOString()
          };
        }
        return conv;
      });
      
      // Re-sort conversations by activity
      return sortConversationsByActivity(updatedConversations);
    });
  }, [sortConversationsByActivity]);
  
  // Function to create a new conversation
  const handleCreateConversation = useCallback((type: ConversationType, participants: ChatParticipant[]) => {
    // Generate a unique conversation ID
    const newConversationId = `new-conv-${Date.now()}`;
    
    // Determine conversation name for group/project chats
    let name = undefined;
    if (type !== "individual") {
      // Use first 3 participant names or default name
      const participantNames = participants.map(p => p.name.split(' ')[0]).slice(0, 3);
      name = `${type === "group" ? "Group" : "Project"}: ${participantNames.join(', ')}${participants.length > 3 ? '...' : ''}`;
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
    
    // Notify user
    toast({
      title: `New ${type} conversation created`,
      description: type === "individual" 
        ? `Started a conversation with ${participants[0].name}`
        : `Created a new ${type} with ${participants.length} participants`,
      variant: "success",
      duration: 3000
    });
    
  }, [toast]);
  
  // Function to open the new chat dialog
  const openNewChatDialog = useCallback(() => {
    // We'll use a ref to communicate with the ConversationList component
    setIsNewChatDialogOpen(true);
  }, []);
  
  // Check if we're coming from the Team page with a team member to chat with
  useEffect(() => {
    // Skip if we've already processed this startChatWith
    if (location.state?.startChatWith && !processedStartChatRef.current) {
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
        // Create a new conversation with this team member
        const newParticipant: ChatParticipant = {
          id: teamMember.id,
          name: teamMember.name,
          avatar: teamMember.avatar,
          role: teamMember.role,
          isOnline: true
        };
        
        const newConversation: Conversation = {
          id: `new-conv-${Date.now()}`,
          type: "individual",
          participants: [currentUser, newParticipant],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          icon: "user"
        };
        
        // Add the new conversation to the list and ensure it's at the top
        setConversations(prevConversations => {
          const newConversations = [newConversation, ...prevConversations];
          // Already sorted by updatedAt since the new conversation has the most recent timestamp
          return newConversations;
        });
        
        // Initialize empty message array for the new conversation
        setMessages(prevMessages => ({
          ...prevMessages,
          [newConversation.id]: []
        }));
      }
      
      // Clear the state to avoid creating the conversation again on refresh
      // Use setTimeout to ensure this happens after state updates are processed
      setTimeout(() => {
        window.history.replaceState({}, document.title);
      }, 0);
    }
  }, [location.state, conversations, sortConversationsByActivity]);
  
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
  
  useEffect(() => {
    // Show welcome toast on first load, but not when coming from team page
    if (!location.state?.startChatWith) {
      toast({
        title: "Welcome to Messages",
        description: "Communicate with team members in real-time.",
        variant: "info",
        duration: 5000,
      });
    }
  }, [toast, location.state]);
  
  return (
    <PageLayout>
      <Helmet>
        <title>Messages | Buildease</title>
      </Helmet>
      
      <div className="flex flex-col h-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <PageHeader
            title={
              <div className="flex items-center gap-2">
                Messages
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 ml-2">
                  <Bell className="h-3 w-3 mr-1" />
                  <span className="text-xs font-normal">Real-time</span>
                </Badge>
              </div>
            }
            description="Communicate with your project team in real-time"
            icon={<MessagesSquare className="h-6 w-6 text-blue-500" />}
            actions={
              <Button size="sm" className="gap-1.5" onClick={openNewChatDialog}>
                <UserPlus className="h-4 w-4" />
                New Chat
              </Button>
            }
          />
        </motion.div>
        
        <motion.div 
          className="mt-4 rounded-lg shadow-lg flex-grow overflow-hidden border border-slate-200 dark:border-slate-700 h-[calc(100vh-200px)]"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 h-full">
            <Chat 
              conversations={conversations} 
              setConversations={setConversations}
              messages={messages}
              currentUser={currentUser}
              isDarkMode={isDarkMode}
              targetUserId={targetUserId}
              onMessageSent={handleMessageSent}
              onCreateConversation={handleCreateConversation}
              isNewChatDialogOpen={isNewChatDialogOpen}
              onNewChatDialogClose={() => setIsNewChatDialogOpen(false)}
            />
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default Messaging; 