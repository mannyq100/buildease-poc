

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