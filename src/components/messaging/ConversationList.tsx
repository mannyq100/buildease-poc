import React, { useState, useEffect, useRef } from "react";
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
  Clock,
  X,
  Check,
  UserPlus,
  MoreVertical,
  Filter,
  Bell,
  BellOff,
  Star,
  StarOff,
  ArchiveIcon,
  Trash2
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
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Conversation, ConversationType, ChatParticipant } from "@/types/messaging";
import { formatDistanceToNow, isToday, format } from "date-fns";
import { cn } from "@/lib/utils";
import { m } from "framer-motion";
import { teamMembers } from "@/data/mock/messaging";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  onCreateConversation?: (type: ConversationType, participants: ChatParticipant[]) => void;
  onPinConversation?: (conversationId: string, isPinned: boolean) => void;
  onArchiveConversation?: (conversationId: string) => void;
  onDeleteConversation?: (conversationId: string) => void;
  onMarkAsRead?: (conversationId: string) => void;
  className?: string;
  isDarkMode?: boolean;
  currentUser: ChatParticipant;
  isLoading?: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onCreateConversation,
  onPinConversation,
  onArchiveConversation,
  onDeleteConversation,
  onMarkAsRead,
  className,
  isDarkMode = false,
  currentUser,
  isLoading = false
}) => {
  // State for filter and sort
  const [filterQuery, setFilterQuery] = useState("");
  
  // State for confirm delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

  // Filter and sort conversations
  const filteredConversations = conversations
    .filter(conversation => {
      // Filter by search term
      if (filterQuery) {
        const searchTerm = filterQuery.toLowerCase();
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
      // Sort based on the selected option
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return dateB - dateA;
    });
  
  // Get the name of the other participant for individual chats
  const getParticipantName = (conversation: Conversation): string | undefined => {
    if (conversation.type !== "individual") return undefined;
    
    const otherParticipant = conversation.participants.find(
      (p) => p.id !== currentUser.id
    );
    return otherParticipant?.name;
  };

  // Handle delete dialog open
  const handleDeleteDialogOpenChange = (open: boolean) => {
    setIsDeleteDialogOpen(open);
    if (!open) {
      setConversationToDelete(null);
    }
  };

  // Handle pin conversation
  const handlePinConversation = (conversationId: string, isPinned: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPinConversation) {
      onPinConversation(conversationId, !isPinned);
    }
  };
  
  // Handle archive conversation
  const handleArchiveConversation = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onArchiveConversation) {
      onArchiveConversation(conversationId);
    }
  };
  
  // Handle mark as read
  const handleMarkAsRead = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMarkAsRead) {
      onMarkAsRead(conversationId);
    }
  };

  // Handle delete conversation
  const handleDeleteConversation = (conversationId: string) => {
    if (onDeleteConversation) {
      onDeleteConversation(conversationId);
      handleDeleteDialogOpenChange(false);
    }
  };
  
  // Get display name for conversation
  const getConversationName = (conversation: Conversation) => {
    if (conversation.name) return conversation.name;
    
    // For individual chats, show the other person's name
    if (conversation.type === "individual") {
      const otherParticipant = conversation.participants.find(p => p.id !== currentUser.id);
      return otherParticipant?.name || "Unknown";
    }
    
    // For group/project chats without a name, generate one from participants
    const participantNames = conversation.participants
      .filter(p => p.id !== currentUser.id)
      .map(p => p.name.split(' ')[0])
      .slice(0, 3);
      
    return `${conversation.type === "group" ? "Group" : "Project"}: ${participantNames.join(', ')}${conversation.participants.length > 4 ? '...' : ''}`;
  };
  
  // Get avatar for conversation
  const getConversationIcon = (conversation: Conversation) => {
    if (conversation.type === "individual") {
      const otherParticipant = conversation.participants.find(p => p.id !== currentUser.id);
      
      return (
        <div className="relative">
          <Avatar className={cn(
            "h-12 w-12 ring-2 ring-offset-1",
            conversation.id === activeConversationId 
              ? (isDarkMode ? "ring-blue-600 ring-offset-slate-900" : "ring-blue-500 ring-offset-white") 
              : (isDarkMode ? "ring-slate-700 ring-offset-slate-900" : "ring-slate-200 ring-offset-white")
          )}>
            <AvatarImage src={otherParticipant?.avatar} />
            <AvatarFallback className={isDarkMode ? "bg-slate-700 text-slate-200" : ""}>
              {otherParticipant?.name?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
          {otherParticipant?.isOnline && (
            <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white dark:ring-slate-900" />
          )}
        </div>
      );
    }
    
    return (
      <div className={cn(
        "flex items-center justify-center h-12 w-12 rounded-full",
        conversation.id === activeConversationId 
          ? (isDarkMode ? "bg-blue-900/40 text-blue-300" : "bg-blue-100 text-blue-600") 
          : conversation.type === "group" 
            ? (isDarkMode ? "bg-indigo-900/40 text-indigo-300" : "bg-indigo-100 text-indigo-600")
            : conversation.type === "project"
              ? (isDarkMode ? "bg-amber-900/40 text-amber-300" : "bg-amber-100 text-amber-600")
              : (isDarkMode ? "bg-slate-800 text-slate-300" : "bg-slate-200 text-slate-600")
      )}>
        {conversation.type === "group" && <Users className="h-6 w-6" />}
        {conversation.type === "project" && <Inbox className="h-6 w-6" />}
      </div>
    );
  };
  
  // Format conversation time
  const formatConversationTime = (timestamp: string | Date): string => {
    const date = new Date(timestamp);
    
    if (isToday(date)) {
      return format(date, "h:mm a");
    } else {
      return format(date, "MM/dd/yy");
    }
  };
  
  // Render a loading skeleton if isLoading is true
  if (isLoading) {
    return (
      <div className={cn("flex flex-col h-full", className)}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <Skeleton className="h-9 w-full" />
        </div>
        
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
        
        <div className="flex-1 p-4 space-y-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-10" />
                </div>
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search conversations..." 
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className={cn(
              "pl-9 bg-slate-100 dark:bg-slate-800 border-none",
              "focus-visible:ring-blue-500/50 focus-visible:ring-offset-0"
            )}
          />
        </div>
      </div>
      
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs px-2 font-normal flex items-center gap-1"
            >
              {filterQuery === "all" && "All Messages"}
              {filterQuery === "individual" && "Direct Messages"}
              {filterQuery === "group" && "Group Chats"}
              {filterQuery === "project" && "Project Chats"}
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Filter By Type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setFilterQuery("all")}>
              <MessagesSquare className="h-4 w-4 mr-2" />
              All Messages
              {filterQuery === "all" && <Check className="h-4 w-4 ml-2" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterQuery("individual")}>
              <User className="h-4 w-4 mr-2" />
              Direct Messages
              {filterQuery === "individual" && <Check className="h-4 w-4 ml-2" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterQuery("group")}>
              <Users className="h-4 w-4 mr-2" />
              Group Chats
              {filterQuery === "group" && <Check className="h-4 w-4 ml-2" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterQuery("project")}>
              <Inbox className="h-4 w-4 mr-2" />
              Project Chats
              {filterQuery === "project" && <Check className="h-4 w-4 ml-2" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Sort By</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className={cn(filterQuery === "recent" && "bg-accent")}
            >
              <Clock className="h-4 w-4 mr-2" />
              Most Recent
              {filterQuery === "recent" && <Check className="h-4 w-4 ml-2" />}
            </DropdownMenuItem>
            <DropdownMenuItem 
              className={cn(filterQuery === "unread" && "bg-accent")}
            >
              <Bell className="h-4 w-4 mr-2" />
              Unread First
              {filterQuery === "unread" && <Check className="h-4 w-4 ml-2" />}
            </DropdownMenuItem>
            <DropdownMenuItem 
              className={cn(filterQuery === "alphabetical" && "bg-accent")}
            >
              <Filter className="h-4 w-4 mr-2" />
              Alphabetical
              {filterQuery === "alphabetical" && <Check className="h-4 w-4 ml-2" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <ScrollArea className="flex-1 px-2">
        <div className="py-2">
          {filteredConversations.length === 0 ? (
            <div className={cn("text-center py-8", isDarkMode ? "text-slate-400" : "text-slate-500")}>
              <MessagesSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No conversations found</p>
              <p className="text-sm mt-1 opacity-75">
                {filterQuery ? "Try a different search term" : "Start a new conversation"}
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation, index) => (
              <m.div
                key={conversation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg cursor-pointer relative mb-1.5",
                  conversation.id === activeConversationId
                    ? (isDarkMode ? "bg-blue-900/30 text-white" : "bg-blue-50 text-blue-800")
                    : (isDarkMode ? "hover:bg-slate-800/50" : "hover:bg-slate-50"),
                )}
                onClick={() => onSelectConversation(conversation.id)}
              >
                {conversation.isPinned && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="absolute top-1 right-1 text-blue-500">
                          <Pin className="h-3 w-3" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Pinned conversation</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                
                {getConversationIcon(conversation)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className={cn(
                      "font-medium truncate", 
                      conversation.id === activeConversationId
                        ? (isDarkMode ? "text-blue-100" : "text-blue-800")
                        : (isDarkMode ? "text-white" : "text-slate-900"),
                      conversation.unreadCount && conversation.unreadCount > 0 && "font-semibold"
                    )}>
                      {getConversationName(conversation)}
                    </h3>
                    <div className="flex items-center gap-1">
                      <span className={cn(
                        "text-xs whitespace-nowrap",
                        conversation.id === activeConversationId
                          ? (isDarkMode ? "text-blue-200" : "text-blue-600/80")
                          : (isDarkMode ? "text-slate-400" : "text-slate-500")
                      )}>
                        {formatConversationTime(conversation.updatedAt)}
                      </span>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={(e) => handlePinConversation(conversation.id, !!conversation.isPinned, e)}>
                            {conversation.isPinned ? (
                              <>
                                <StarOff className="h-4 w-4 mr-2" />
                                Unpin Conversation
                              </>
                            ) : (
                              <>
                                <Star className="h-4 w-4 mr-2" />
                                Pin Conversation
                              </>
                            )}
                          </DropdownMenuItem>
                          
                          {conversation.unreadCount && conversation.unreadCount > 0 && (
                            <DropdownMenuItem onClick={(e) => handleMarkAsRead(conversation.id, e)}>
                              <Check className="h-4 w-4 mr-2" />
                              Mark as Read
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem onClick={(e) => handleArchiveConversation(conversation.id, e)}>
                            <ArchiveIcon className="h-4 w-4 mr-2" />
                            Archive Conversation
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem
                            className="text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConversationToDelete(conversation.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Conversation
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  {conversation.lastMessage && (
                    <div className="flex justify-between items-center mt-1">
                      <p className={cn(
                        "text-xs truncate max-w-[14rem]",
                        conversation.id === activeConversationId
                          ? (isDarkMode ? "text-blue-200/70" : "text-blue-600/80")
                          : (isDarkMode ? "text-slate-400" : "text-slate-600"),
                        conversation.unreadCount && conversation.unreadCount > 0 && "font-medium"
                      )}>
                        {conversation.lastMessage.content}
                      </p>
                      
                      {conversation.unreadCount && conversation.unreadCount > 0 && (
                        <Badge className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-blue-500 text-white font-medium flex items-center justify-center min-w-[1.25rem]">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </m.div>
            ))
          )}
        </div>
      </ScrollArea>
      
      {/* Confirm delete dialog */}
      <Dialog open={!!conversationToDelete} onOpenChange={(open) => !open && handleDeleteDialogOpenChange(open)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Conversation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleDeleteDialogOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => conversationToDelete && handleDeleteConversation(conversationToDelete)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 