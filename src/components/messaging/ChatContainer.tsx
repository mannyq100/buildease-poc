/**
 * ChatContainer Component
 * 
 * Main chat interface using smaller, focused components
 * Refactored from original Chat.tsx to improve maintainability and reduce component size
 */
import React, { useState, useEffect, useRef } from "react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { ChatHeader } from "./ChatHeader";
import { ChatEmptyState } from "./ChatEmptyState";
import { ConversationListSidebar } from "./ConversationListSidebar";
import { 
  Conversation, 
  Message, 
  ChatParticipant,
  ConversationType
} from "@/types/messaging";
import { cn } from '@/utils/core/ui';

interface ChatContainerProps {
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

export function ChatContainer({ 
  conversations,
  setConversations,
  messages,
  currentUser,
  className,
  isDarkMode = false,
  targetUserId,
  onMessageSent,
  onCreateConversation
}: ChatContainerProps) {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  const [showConversationList, setShowConversationList] = useState<boolean>(true);
  const [newMessage, setNewMessage] = useState<string>('');
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    content: string;
    senderName: string;
  } | null>(null);
  
  const processedUserRef = useRef<string | null>(null);

  // Check if mobile view - use a smaller threshold to show sidebar on tablets
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileView(window.innerWidth < 640); // Changed from 768 to 640
    };
    
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Handle targeted user conversation
  useEffect(() => {
    if (!targetUserId || conversations.length === 0 || processedUserRef.current === targetUserId) {
      return;
    }
    
    const targetConversation = conversations.find(conv => 
      conv.type === "individual" && 
      conv.participants.some(p => p.id === targetUserId)
    );
    
    if (targetConversation) {
      setActiveConversationId(targetConversation.id);
      processedUserRef.current = targetUserId;
    }
  }, [targetUserId, conversations]);

  // Auto-select first conversation if none is selected and conversations exist
  useEffect(() => {
    if (!activeConversationId && conversations.length > 0 && !targetUserId) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId, targetUserId]);

  // Get active conversation
  const activeConversation = conversations.find(conv => conv.id === activeConversationId);
  const conversationMessages = activeConversationId ? messages[activeConversationId] || [] : [];

  // Mobile view: hide conversation list when chat is active
  useEffect(() => {
    if (isMobileView) {
      setShowConversationList(!activeConversationId);
    } else {
      // For desktop/tablet, always show conversation list
      setShowConversationList(true);
    }
  }, [activeConversationId, isMobileView]);

  // Force show conversation list on desktop as fallback
  const shouldShowSidebar = !isMobileView || showConversationList;

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversationId(conversationId);
  };

  const handleBackToList = () => {
    setActiveConversationId(null);
  };

  const handleSendMessage = (content: string, type: Message['type'] = 'text') => {
    if (!activeConversationId || !content?.trim()) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      type,
      senderId: currentUser.id,
      timestamp: new Date(),
      isRead: false,
      reactions: [],
      replyTo: replyingTo?.id
    };

    onMessageSent?.(activeConversationId, newMessage);
    setNewMessage('');
    setReplyingTo(null);
  };

  const handleStarToggle = (conversationId: string, isStarred: boolean) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? { ...conv, isStarred } : conv
    ));
  };

  const handleMuteToggle = (conversationId: string, isMuted: boolean) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? { ...conv, isMuted } : conv
    ));
  };

  const handleArchive = (conversationId: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? { ...conv, isArchived: true } : conv
    ));
    if (activeConversationId === conversationId) {
      setActiveConversationId(null);
    }
  };

  const handleDelete = (conversationId: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    if (activeConversationId === conversationId) {
      setActiveConversationId(null);
    }
  };

  return (
    <div className={cn("flex h-full bg-white dark:bg-slate-900 overflow-hidden", className)}>
      {/* Conversation List Sidebar - Fixed width, full height, scrollable content */}
      <ConversationListSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        currentUser={currentUser}
        onConversationSelect={handleConversationSelect}
        onCreateConversation={onCreateConversation}
        isMobileView={isMobileView}
        isVisible={shouldShowSidebar}
      />

      {/* Main Chat Area - Flex 1, full height, constrained */}
      <div className="flex-1 flex flex-col min-h-0">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <ChatHeader
              conversation={activeConversation}
              currentUser={currentUser}
              isMobileView={isMobileView}
              onBackClick={handleBackToList}
              onStarToggle={handleStarToggle}
              onMuteToggle={handleMuteToggle}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />

            {/* Messages Container - Scrollable area with fixed header and input */}
            <div className="flex-1 flex flex-col min-h-0">
              {/* Messages Area - Scrollable, takes remaining space */}
              <div className="flex-1 min-h-0">
                <MessageList 
                  messages={conversationMessages}
                  participants={activeConversation.participants}
                  currentUser={currentUser}
                  onReplyToMessage={(messageId) => {
                    const message = conversationMessages.find(m => m.id === messageId);
                    if (message) {
                      setReplyingTo({
                        id: message.id,
                        content: message.content,
                        senderName: message.senderId === currentUser.id 
                          ? 'You' 
                          : activeConversation.participants.find(p => p.id === message.senderId)?.name || 'Unknown'
                      });
                    }
                  }}
                  className="h-full"
                />
              </div>

              {/* Message Input - Fixed at bottom */}
              <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <MessageInput 
                  value={newMessage}
                  onChange={setNewMessage}
                  onSend={handleSendMessage}
                  placeholder="Type a message..."
                  isDarkMode={isDarkMode}
                  replyingTo={replyingTo}
                  onCancelReply={() => setReplyingTo(null)}
                />
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <ChatEmptyState
            conversations={conversations}
            currentUser={currentUser}
            onCreateConversation={onCreateConversation}
          />
        )}
      </div>
    </div>
  );
}