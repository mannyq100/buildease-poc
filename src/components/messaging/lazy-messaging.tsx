/**
 * Lazy loaded messaging components for better performance
 * These components are only loaded when messaging features are accessed
 */
import { lazy } from 'react';

// Lazy load large messaging components (refactored for better performance)
export const Chat = lazy(() => import('./Chat-new'));
export const ChatContainer = lazy(() => import('./ChatContainer'));
export const ChatHeader = lazy(() => import('./ChatHeader'));
export const ConversationListSidebar = lazy(() => import('./ConversationListSidebar'));
export const ChatEmptyState = lazy(() => import('./ChatEmptyState'));
export const MessageInput = lazy(() => import('./MessageInput'));
export const MessageList = lazy(() => import('./MessageList'));
export const ConversationList = lazy(() => import('./ConversationList'));

// Export main Chat component as default for backward compatibility
export { Chat as default };