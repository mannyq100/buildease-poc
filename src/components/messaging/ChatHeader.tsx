/**
 * ChatHeader Component
 * 
 * Displays conversation header with participant info and action buttons
 * Extracted from Chat.tsx to improve maintainability
 */
import React from 'react';
import { 
  Phone, 
  Video, 
  MoreVertical, 
  Users,
  Star,
  StarOff,
  ChevronLeft,
  Archive,
  Trash,
  Bell,
  BellOff,
  UserPlus
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Conversation, ChatParticipant } from "@/types/messaging";
import { cn } from '@/utils/core/ui';

interface ChatHeaderProps {
  conversation: Conversation;
  currentUser: ChatParticipant;
  isMobileView: boolean;
  onBackClick: () => void;
  onStarToggle: (conversationId: string, isStarred: boolean) => void;
  onMuteToggle: (conversationId: string, isMuted: boolean) => void;
  onArchive: (conversationId: string) => void;
  onDelete: (conversationId: string) => void;
  onAddParticipant?: (conversationId: string) => void;
  className?: string;
}

export function ChatHeader({
  conversation,
  currentUser,
  isMobileView,
  onBackClick,
  onStarToggle,
  onMuteToggle,
  onArchive,
  onDelete,
  onAddParticipant,
  className
}: ChatHeaderProps) {
  const otherParticipants = conversation.participants.filter(p => p.id !== currentUser.id);
  const isGroupChat = conversation.type === 'group';
  
  const getConversationTitle = () => {
    if (isGroupChat) {
      return conversation.name || `Group with ${otherParticipants.map(p => p.name).join(', ')}`;
    }
    return otherParticipants.length > 0 ? otherParticipants[0].name : 'Unknown User';
  };

  const getParticipantStatus = () => {
    if (isGroupChat) {
      return `${conversation.participants.length} members`;
    }
    return otherParticipants.length > 0 ? otherParticipants[0].status : 'offline';
  };

  const getAvatarSrc = () => {
    if (isGroupChat) {
      return conversation.avatar || '';
    }
    return otherParticipants.length > 0 ? otherParticipants[0].avatar : '';
  };

  const getAvatarFallback = () => {
    if (isGroupChat) {
      return conversation.name ? conversation.name.substring(0, 2).toUpperCase() : 'GR';
    }
    const participant = otherParticipants[0];
    return participant ? participant.name.substring(0, 2).toUpperCase() : 'U';
  };

  return (
    <div className={cn(
      "flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800",
      className
    )}>
      {/* Left side - Back button (mobile) and conversation info */}
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        {isMobileView && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBackClick}
            className="shrink-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={getAvatarSrc()} alt={getConversationTitle()} />
          <AvatarFallback className="bg-blue-500 text-white">
            {getAvatarFallback()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 dark:text-white truncate">
            {getConversationTitle()}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
            {getParticipantStatus()}
          </p>
        </div>
      </div>

      {/* Right side - Action buttons */}
      <div className="flex items-center space-x-1">
        <TooltipProvider>
          {/* Phone call button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Phone className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Voice call</TooltipContent>
          </Tooltip>

          {/* Video call button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Video className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Video call</TooltipContent>
          </Tooltip>

          {/* Star toggle button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="shrink-0"
                onClick={() => onStarToggle(conversation.id, !conversation.isStarred)}
              >
                {conversation.isStarred ? (
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ) : (
                  <StarOff className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {conversation.isStarred ? 'Remove from favorites' : 'Add to favorites'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* More actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Conversation Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {isGroupChat && (
              <>
                <DropdownMenuItem onClick={() => onAddParticipant?.(conversation.id)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add participant
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Users className="h-4 w-4 mr-2" />
                  View members
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            
            <DropdownMenuItem onClick={() => onMuteToggle(conversation.id, !conversation.isMuted)}>
              {conversation.isMuted ? (
                <Bell className="h-4 w-4 mr-2" />
              ) : (
                <BellOff className="h-4 w-4 mr-2" />
              )}
              {conversation.isMuted ? 'Unmute' : 'Mute'} conversation
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => onArchive(conversation.id)}>
              <Archive className="h-4 w-4 mr-2" />
              Archive conversation
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(conversation.id)}
              className="text-red-600 dark:text-red-400"
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}