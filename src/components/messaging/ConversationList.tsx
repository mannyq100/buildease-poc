import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Search,
  MessagesSquare,
  Users,
  User,
  Inbox,
  ChevronDown
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
        <div className="px-2 py-1">
          {filteredConversations.length === 0 ? (
            <div className={cn("text-center py-8", isDarkMode ? "text-slate-400" : "text-slate-500")}>
              <MessagesSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No conversations found</p>
              <p className="text-sm mt-1 opacity-75">
                {filter ? "Try a different search term" : "Start a new conversation"}
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-md cursor-pointer transition-colors",
                  conversation.id === activeConversationId
                    ? (isDarkMode ? "bg-slate-800/80" : "bg-slate-100")
                    : (isDarkMode ? "hover:bg-slate-800/50" : "hover:bg-slate-50"),
                  conversation.isPinned && (isDarkMode ? "border-l-2 border-blue-500" : "border-l-2 border-blue-500")
                )}
                onClick={() => onSelectConversation(conversation.id)}
              >
                {getConversationIcon(conversation)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className={cn(
                      "font-medium truncate", 
                      isDarkMode ? "text-white" : "text-slate-900"
                    )}>
                      {getConversationName(conversation)}
                    </h3>
                    <span className={cn(
                      "text-xs whitespace-nowrap ml-2", 
                      isDarkMode ? "text-slate-400" : "text-slate-500"
                    )}>
                      {formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <p className={cn(
                      "text-sm truncate max-w-[200px]", 
                      isDarkMode ? "text-slate-300" : "text-slate-600"
                    )}>
                      {conversation.lastMessage?.content}
                    </p>
                    
                    {conversation.unreadCount && conversation.unreadCount > 0 ? (
                      <Badge 
                        variant="default" 
                        className="ml-2 px-1.5 text-xs h-5 min-w-[20px] flex items-center justify-center"
                      >
                        {conversation.unreadCount}
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}; 