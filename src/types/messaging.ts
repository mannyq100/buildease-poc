/**
 * Types for the messaging/chat feature
 */
import { ReactNode } from "react";

/**
 * Message status types
 */
export type MessageStatus = "sent" | "delivered" | "read" | "failed";

/**
 * Conversation types
 */
export type ConversationType = "individual" | "group" | "project";

/**
 * Message interface
 */
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: Date | string;
  status: MessageStatus;
  attachments?: Attachment[];
  reactions?: Reaction[];
  isSystemMessage?: boolean;
}

/**
 * Attachment interface
 */
export interface Attachment {
  id: string;
  type: "image" | "document" | "link";
  url: string;
  name: string;
  size?: number;
  thumbnailUrl?: string;
}

/**
 * Reaction interface
 */
export interface Reaction {
  emoji: string;
  userId: string;
  timestamp: Date | string;
}

/**
 * Conversation participant interface
 */
export interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  isOnline?: boolean;
  lastSeen?: Date | string;
  typing?: boolean;
}

/**
 * Conversation interface
 */
export interface Conversation {
  id: string;
  type: ConversationType;
  name?: string;
  participants: ChatParticipant[];
  lastMessage?: {
    content: string;
    senderId: string;
    timestamp: Date | string;
    status: MessageStatus;
  };
  unreadCount?: number;
  projectId?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  icon?: string;
  isPinned?: boolean;
}

/**
 * Chat notification interface
 */
export interface ChatNotification {
  id: string;
  conversationId: string;
  message: string;
  createdAt: Date | string;
  isRead: boolean;
} 