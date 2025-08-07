/**
 * Collaboration Utility Functions
 * Shared utility functions for real-time collaboration features
 */

import type { Comment } from '@/types/database';
import type { UserPresence } from '@/services/websocketService';
import { COLLABORATION_QUERY } from '@/constants/collaborationConstants';

/**
 * Get user display name for collaboration
 */
export function getCollaborationUserDisplayName(user: any): string {
  if (!user) return 'Unknown User';
  
  const { first_name, last_name, email } = user;
  
  if (first_name && last_name) {
    return `${first_name} ${last_name}`;
  }
  
  if (first_name) {
    return first_name;
  }
  
  return email || 'Unknown User';
}

/**
 * Get user initials for avatars
 */
export function getUserInitials(name: string): string {
  if (!name) return '??';
  
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Get user avatar URL
 */
export function getUserAvatarUrl(user: any): string | null {
  return user?.settings?.picture_url || null;
}

/**
 * Format comment content for display
 */
export function formatCommentContent(content: string): string {
  return content
    .trim()
    .replace(/\\n\\n+/g, '\\n\\n') // Normalize multiple line breaks
    .replace(/^\\s+|\\s+$/g, ''); // Trim whitespace
}

/**
 * Truncate comment content for previews
 */
export function truncateCommentContent(
  content: string, 
  maxLength: number = COLLABORATION_QUERY.PREVIEW_LENGTH
): string {
  if (content.length <= maxLength) {
    return content;
  }
  
  return content.substring(0, maxLength).trim() + '...';
}

/**
 * Generate room ID for collaboration
 */
export function generateRoomId(
  entityType: 'project' | 'phase' | 'task',
  entityId: string,
  feature?: string
): string {
  const base = `${entityType}-${entityId}`;
  return feature ? `${base}-${feature}` : base;
}

/**
 * Check if user is currently typing
 */
export function isUserTyping(userId: string, typingUsers: UserPresence[]): boolean {
  return typingUsers.some(user => user.user_id === userId);
}

/**
 * Format typing indicator text
 */
export function formatTypingIndicatorText(typingUsers: UserPresence[]): string {
  if (typingUsers.length === 0) return '';
  
  if (typingUsers.length === 1) {
    return `${typingUsers[0].user_name} is typing...`;
  }
  
  return `${typingUsers.length} people are typing...`;
}

/**
 * Check if error is network-related
 */
export function isNetworkError(error: Error): boolean {
  return error.message.includes('network') || 
         error.message.includes('fetch') ||
         error.message.includes('connection') ||
         error.message.includes('offline');
}

/**
 * Check if error is WebSocket-related
 */
export function isWebSocketError(error: Error): boolean {
  return error.message.includes('websocket') ||
         error.message.includes('realtime') ||
         error.message.includes('collaboration');
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  let lastTime = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastTime >= wait) {
      lastTime = now;
      func(...args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        lastTime = Date.now();
        timeout = null;
        func(...args);
      }, wait - (now - lastTime));
    }
  };
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Generate a unique key for React components
 */
export function generateReactKey(prefix: string, ...parts: (string | number)[]): string {
  return [prefix, ...parts].join('-');
}

/**
 * Safe scroll to element
 */
export function safeScrollToElement(
  element: HTMLElement | null,
  options?: ScrollIntoViewOptions
): void {
  if (!element) return;
  
  try {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      ...options
    });
  } catch (error) {
    console.warn('Failed to scroll to element:', error);
  }
}

/**
 * Safe scroll to bottom of container
 */
export function safeScrollToBottom(container: HTMLElement | null): void {
  if (!container) return;
  
  try {
    // Try to find scroll area viewport
    const scrollViewport = container.querySelector('[data-radix-scroll-area-viewport]');
    const targetElement = scrollViewport || container;
    
    if ('scrollTop' in targetElement && 'scrollHeight' in targetElement) {
      targetElement.scrollTop = targetElement.scrollHeight;
    }
  } catch (error) {
    console.warn('Failed to scroll to bottom:', error);
  }
}

/**
 * Get relative time string
 */
export function getRelativeTimeString(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) {
    return 'just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return target.toLocaleDateString();
  }
}

/**
 * Clean up HTML content for safe display
 */
export function sanitizeContent(content: string): string {
  return content
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Validate entity type
 */
export function isValidEntityType(type: string): type is 'project' | 'phase' | 'task' {
  return ['project', 'phase', 'task'].includes(type);
}

/**
 * Create optimistic comment for UI updates
 */
export function createOptimisticComment(
  entityType: 'project' | 'phase' | 'task',
  entityId: string,
  content: string,
  user: any,
  parentCommentId?: string
): Partial<Comment> {
  return {
    id: `optimistic-${Date.now()}`,
    entity_type: entityType,
    entity_id: entityId,
    user_id: user.id,
    content: content.trim(),
    parent_comment_id: parentCommentId || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user: {
      id: user.id,
      first_name: user.user_metadata?.first_name || '',
      last_name: user.user_metadata?.last_name || '',
      email: user.email || '',
      settings: user.user_metadata?.settings || null
    }
  };
}