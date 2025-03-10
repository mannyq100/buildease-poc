import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Search,
  MessagesSquare,
  Users,
  User,
  Inbox,
  ChevronDown,
  Pin,
  Clock
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Conversation, ConversationType } from "@/types/messaging";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  className?: string;
  isDarkMode?: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  className,
  isDarkMode = false
}) => {
  const [filter, setFilter] = useState<string>("");
  const [conversationType, setConversationType] = useState<ConversationType | "all">("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const filteredConversations = conversations
    .filter(conversation => {
      // Filter by conversation type
      if (conversationType !== "all" && conversation.type !== conversationType) {
        return false;
      }
      
      // Filter by search term
      if (filter) {
        const searchTerm = filter.toLowerCase();
        // Check conversation name
        if (conversation.name?.toLowerCase().includes(searchTerm)) {
          return true;
        }
        // Check participant names
        return conversation.participants.some(
          participant => participant.name.toLowerCase().includes(searchTerm)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by pinned conversations first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      // Then sort by last message date
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return dateB - dateA;
    });

  const getConversationName = (conversation: Conversation) => {
    if (conversation.name) return conversation.name;
    
    // For individual chats, show the other person's name
    if (conversation.type === "individual") {
      const otherParticipant = conversation.participants.find(p => p.id !== "current-user");
      return otherParticipant?.name || "Unknown";
    }
    
    return "Unnamed Conversation";
  };
  
  const getConversationIcon = (conversation: Conversation) => {
    if (conversation.type === "individual") {
      const otherParticipant = conversation.participants.find(p => p.id !== "current-user");
      
      return (
        <Avatar className="h-9 w-9">
          <AvatarImage src={otherParticipant?.avatar} />
          <AvatarFallback className={isDarkMode ? "bg-slate-700 text-slate-200" : ""}>
            {otherParticipant?.name?.charAt(0) || "?"}
          </AvatarFallback>
        </Avatar>
      );
    }
    
    return (
      <div className={cn(
        "flex items-center justify-center h-9 w-9 rounded-full",
        conversation.type === "group" 
          ? (isDarkMode ? "bg-indigo-900/40 text-indigo-300" : "bg-indigo-100 text-indigo-600")
          : conversation.type === "project"
            ? (isDarkMode ? "bg-amber-900/40 text-amber-300" : "bg-amber-100 text-amber-600")
            : (isDarkMode ? "bg-slate-800 text-slate-300" : "bg-slate-200 text-slate-600")
      )}>
        {conversation.type === "group" && <Users className="h-4 w-4" />}
        {conversation.type === "project" && <Inbox className="h-4 w-4" />}
      </div>
    );
  };
  
  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="p-4 flex flex-col gap-3">
        <div className="flex gap-2">
          <Input
            placeholder="Search conversations..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={isDarkMode ? "bg-slate-900 border-slate-700 text-white placeholder:text-slate-400" : ""}
          />
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="icon" variant="outline" className={isDarkMode ? "border-slate-700 bg-slate-800 hover:bg-slate-700" : ""}>
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className={cn("sm:max-w-[425px]", isDarkMode ? "bg-slate-900 text-slate-100 border-slate-700" : "")}>
              <DialogHeader>
                <DialogTitle>New Conversation</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Tabs defaultValue="individual">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="individual">Individual</TabsTrigger>
                    <TabsTrigger value="group">Group</TabsTrigger>
                    <TabsTrigger value="project">Project</TabsTrigger>
                  </TabsList>
                  <TabsContent value="individual" className="mt-4">
                    <p className={cn("text-sm mb-4", isDarkMode ? "text-slate-400" : "text-slate-600")}>
                      Create a private conversation with another team member.
                    </p>
                    {/* Implement user selection UI here */}
                  </TabsContent>
                  <TabsContent value="group" className="mt-4">
                    <p className={cn("text-sm mb-4", isDarkMode ? "text-slate-400" : "text-slate-600")}>
                      Create a group chat with multiple team members.
                    </p>
                    {/* Implement group creation UI here */}
                  </TabsContent>
                  <TabsContent value="project" className="mt-4">
                    <p className={cn("text-sm mb-4", isDarkMode ? "text-slate-400" : "text-slate-600")}>
                      Create a project-based chat for specific project discussions.
                    </p>
                    {/* Implement project chat creation UI here */}
                  </TabsContent>
                </Tabs>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="flex gap-2 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={cn("justify-between px-4", isDarkMode ? "border-slate-700 bg-slate-800 hover:bg-slate-700" : "")}>
                <span className="flex items-center gap-2">
                  {conversationType === "all" && <MessagesSquare className="h-4 w-4" />}
                  {conversationType === "individual" && <User className="h-4 w-4" />}
                  {conversationType === "group" && <Users className="h-4 w-4" />}
                  {conversationType === "project" && <Inbox className="h-4 w-4" />}
                  {conversationType === "all" ? "All Chats" :
                    conversationType === "individual" ? "Individual" :
                    conversationType === "group" ? "Groups" : "Projects"}
                </span>
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className={isDarkMode ? "bg-slate-900 border-slate-700" : ""}>
              <DropdownMenuItem onClick={() => setConversationType("all")}>
                <MessagesSquare className="h-4 w-4 mr-2" />
                All Chats
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setConversationType("individual")}>
                <User className="h-4 w-4 mr-2" />
                Individual
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setConversationType("group")}>
                <Users className="h-4 w-4 mr-2" />
                Groups
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setConversationType("project")}>
                <Inbox className="h-4 w-4 mr-2" />
                Projects
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="py-2">
          {filteredConversations.length === 0 ? (
            <div className={cn("text-center py-8", isDarkMode ? "text-slate-400" : "text-slate-500")}>
              <MessagesSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No conversations found</p>
              <p className="text-sm mt-1 opacity-75">
                {filter ? "Try a different search term" : "Start a new conversation"}
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation, index) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors relative mb-1.5",
                  conversation.id === activeConversationId
                    ? (isDarkMode ? "bg-blue-900/30 text-white" : "bg-blue-50 text-blue-800")
                    : (isDarkMode ? "hover:bg-slate-800/50" : "hover:bg-slate-50"),
                )}
                onClick={() => onSelectConversation(conversation.id)}
              >
                {conversation.isPinned && (
                  <div className="absolute top-1 right-1">
                    <Pin className="h-3 w-3 text-blue-500" />
                  </div>
                )}
                
                <div className="relative">
                  {getConversationIcon(conversation)}
                  
                  {conversation.type === "individual" && 
                   conversation.participants.find(p => p.id !== "current-user")?.isOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full bg-green-500 ring-1 ring-white dark:ring-slate-800" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className={cn(
                      "font-medium truncate", 
                      conversation.id === activeConversationId
                        ? (isDarkMode ? "text-blue-100" : "text-blue-800")
                        : (isDarkMode ? "text-white" : "text-slate-900")
                    )}>
                      {getConversationName(conversation)}
                    </h3>
                    <span className={cn(
                      "text-xs whitespace-nowrap flex items-center",
                      conversation.id === activeConversationId
                        ? (isDarkMode ? "text-blue-200/70" : "text-blue-600/80")
                        : (isDarkMode ? "text-slate-400" : "text-slate-500")
                    )}>
                      <Clock className="h-3 w-3 mr-1 opacity-70" />
                      {formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: false })}
                    </span>
                  </div>
                  
                  {conversation.lastMessage && (
                    <div className="flex justify-between items-center mt-1">
                      <p className={cn(
                        "text-xs truncate max-w-[14rem]",
                        conversation.id === activeConversationId
                          ? (isDarkMode ? "text-blue-200/70" : "text-blue-600/80")
                          : (isDarkMode ? "text-slate-400" : "text-slate-600")
                      )}>
                        {conversation.lastMessage.content}
                      </p>
                      
                      {conversation.unreadCount && conversation.unreadCount > 0 && (
                        <span className={cn(
                          "ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-blue-500 text-white font-medium",
                          "flex items-center justify-center min-w-[1.25rem]"
                        )}>
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <Button className="w-full" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Conversation
        </Button>
      </div>
    </div>
  );
}; 