/**
 * ConversationListSidebar Component
 * 
 * Displays conversation list with search functionality
 * Extracted from Chat.tsx to improve maintainability
 */
import React, { useState, useRef } from 'react';
import { 
  Search,
  X,
  Plus,
  Inbox,
  Star,
  Archive
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { m, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Conversation, ChatParticipant, ConversationType } from "@/types/messaging";
import { cn } from '@/utils/core/ui';

interface ConversationListSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  currentUser: ChatParticipant;
  onConversationSelect: (conversationId: string) => void;
  onCreateConversation?: (type: ConversationType, participants: ChatParticipant[]) => void;
  className?: string;
  isMobileView?: boolean;
  isVisible?: boolean;
}

export function ConversationListSidebar({
  conversations,
  activeConversationId,
  currentUser,
  onConversationSelect,
  onCreateConversation,
  className,
  _isMobileView = false,
  isVisible = true
}: ConversationListSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'starred' | 'archived'>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter conversations based on search query and selected filter
  const filteredConversations = conversations.filter(conversation => {
    // Apply filter first
    if (selectedFilter === 'starred' && !conversation.isStarred) return false;
    if (selectedFilter === 'archived' && !conversation.isArchived) return false;
    if (selectedFilter === 'all' && conversation.isArchived) return false;

    // Then apply search query
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const conversationName = getConversationName(conversation).toLowerCase();
    const participantNames = conversation.participants
      .map(p => p.name.toLowerCase())
      .join(' ');
    
    return conversationName.includes(query) || participantNames.includes(query);
  });

  const getConversationName = (conversation: Conversation) => {
    if (conversation.type === 'group') {
      return conversation.name || `Group with ${conversation.participants.length} members`;
    }
    const otherParticipant = conversation.participants.find(p => p.id !== currentUser.id);
    return otherParticipant?.name || 'Unknown User';
  };

  const getLastMessagePreview = (conversation: Conversation) => {
    if (!conversation.lastMessage) return 'No messages yet';
    
    const message = conversation.lastMessage;
    const prefix = message.senderId === currentUser.id ? 'You: ' : '';
    
    if (message.type === 'text') {
      return `${prefix}${message.content}`;
    } else if (message.type === 'image') {
      return `${prefix}📷 Image`;
    } else if (message.type === 'file') {
      return `${prefix}📎 File`;
    }
    
    return `${prefix}Message`;
  };

  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.type === 'group') {
      return conversation.avatar || '';
    }
    const otherParticipant = conversation.participants.find(p => p.id !== currentUser.id);
    return otherParticipant?.avatar || '';
  };

  const getConversationAvatarFallback = (conversation: Conversation) => {
    if (conversation.type === 'group') {
      return conversation.name ? conversation.name.substring(0, 2).toUpperCase() : 'GR';
    }
    const otherParticipant = conversation.participants.find(p => p.id !== currentUser.id);
    return otherParticipant ? otherParticipant.name.substring(0, 2).toUpperCase() : 'U';
  };

  const handleSearchToggle = () => {
    setIsSearching(!isSearching);
    if (!isSearching) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery('');
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    
    if (now.toDateString() === messageDate.toDateString()) {
      return format(messageDate, 'HH:mm');
    } else {
      return format(messageDate, 'MMM dd');
    }
  };

  if (!isVisible) return null;

  return (
    <div className={cn(
      "w-80 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col h-full flex-shrink-0",
      className
    )}>
      {/* Header - Fixed at top */}
      <div className="flex-shrink-0 p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Messages
          </h2>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSearchToggle}
              className={cn(
                "transition-colors",
                isSearching && "bg-slate-100 dark:bg-slate-800"
              )}
            >
              {isSearching ? (
                <X className="h-4 w-4" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
            {onCreateConversation && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onCreateConversation('individual', [])}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Search input */}
        <AnimatePresence>
          {isSearching && (
            <m.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-3"
              />
            </m.div>
          )}
        </AnimatePresence>

        {/* Filter tabs */}
        <div className="flex space-x-1">
          {[
            { key: 'all', label: 'All', icon: Inbox },
            { key: 'starred', label: 'Starred', icon: Star },
            { key: 'archived', label: 'Archived', icon: Archive }
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={selectedFilter === key ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedFilter(key as 'all' | 'starred' | 'archived')}
              className="flex-1 text-xs"
            >
              <Icon className="h-3 w-3 mr-1" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Conversation list - Scrollable area */}
      <ScrollArea className="flex-1 overflow-hidden scroll-smooth">
        <div className="p-2 pb-4">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <m.div
                key={conversation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                className={cn(
                  "flex items-center p-3 rounded-lg cursor-pointer transition-colors mb-1",
                  activeConversationId === conversation.id
                    ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
                onClick={() => onConversationSelect(conversation.id)}
              >
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage 
                      src={getConversationAvatar(conversation)} 
                      alt={getConversationName(conversation)} 
                    />
                    <AvatarFallback className="bg-blue-500 text-white">
                      {getConversationAvatarFallback(conversation)}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                    </div>
                  )}
                </div>

                {/* Conversation info */}
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-slate-900 dark:text-white truncate">
                      {getConversationName(conversation)}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {conversation.isStarred && (
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      )}
                      {conversation.lastMessage && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {formatTime(conversation.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-1">
                    {getLastMessagePreview(conversation)}
                  </p>
                </div>
              </m.div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500 dark:text-slate-400">
                {searchQuery ? 'No conversations found' : 'No conversations yet'}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}