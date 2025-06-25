/**
 * Lazy loaded messaging components for better performance
 * These components are only loaded when messaging features are accessed
 */
import { lazy } from 'react';

// Lazy load large messaging components (refactored for better performance)
export const Chat = lazy(() => import('./Chat').then(module => ({ default: module.Chat })));
export const ChatContainer = lazy(() => import('./ChatContainer').then(module => ({ default: module.ChatContainer })));
export const ChatHeader = lazy(() => import('./ChatHeader').then(module => ({ default: module.ChatHeader })));
export const ConversationListSidebar = lazy(() => import('./ConversationListSidebar').then(module => ({ default: module.ConversationListSidebar })));
export const ChatEmptyState = lazy(() => import('./ChatEmptyState').then(module => ({ default: module.ChatEmptyState })));
export const MessageInput = lazy(() => import('./MessageInput').then(module => ({ default: module.MessageInput })));
export const MessageList = lazy(() => import('./MessageList').then(module => ({ default: module.MessageList })));
export const ConversationList = lazy(() => import('./ConversationList').then(module => ({ default: module.ConversationList })));

// Export main Chat component as default for backward compatibility
export { Chat as default };