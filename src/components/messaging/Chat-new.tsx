/**
 * Chat Component (Refactored)
 * 
 * This is a wrapper component that maintains backward compatibility
 * while using the new modular chat components.
 * 
 * The original 926-line Chat.tsx has been broken down into:
 * - ChatContainer: Main orchestrator (~170 lines)
 * - ChatHeader: Conversation header with actions (~180 lines)
 * - ConversationListSidebar: Conversation list and search (~290 lines)
 * - ChatEmptyState: Empty state display (~80 lines)
 * - MessageList: Already existed as separate component
 * - MessageInput: Already existed as separate component
 */

import React from 'react';
import { ChatContainer } from './ChatContainer';
import { 
  Conversation, 
  Message, 
  ChatParticipant,
  ConversationType
} from "@/types/messaging";

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

/**
 * Main Chat Component
 * 
 * Now a lightweight wrapper around ChatContainer for backward compatibility.
 * The component has been refactored from 926 lines to ~40 lines while maintaining
 * the same functionality through composition.
 */
export const Chat: React.FC<ChatProps> = (props) => {
  return <ChatContainer {...props} />;
};

export default Chat;