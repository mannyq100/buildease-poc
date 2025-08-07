/**
 * Collaboration Constants
 * Centralized constants for real-time collaboration features
 */

// Timing constants
export const COLLABORATION_TIMING = {
  // WebSocket service
  HEARTBEAT_INTERVAL: 30000, // 30 seconds
  MAX_RECONNECT_DELAY: 30000, // 30 seconds
  PRESENCE_THROTTLE: 1000, // 1 second
  CONNECTION_RETRY_DELAY: 2000, // 2 seconds
  
  // Real-time collaboration
  TYPING_TIMEOUT: 3000, // 3 seconds
  PRESENCE_UPDATE_THROTTLE: 1000, // 1 second
  
  // Comments
  NEW_COMMENT_HIGHLIGHT_DURATION: 5000, // 5 seconds
  SCROLL_DELAY: 100, // 100ms
  REFETCH_THROTTLE: 500, // 500ms
  
  // Error boundaries
  ERROR_RETRY_DELAY: 2000, // 2 seconds
  NETWORK_CHECK_INTERVAL: 1000 // 1 second
} as const;

// UI constants
export const COLLABORATION_UI = {
  // Heights
  MAX_HEIGHT_DEFAULT: '400px',
  INLINE_MAX_HEIGHT: '300px',
  TEXTAREA_MIN_HEIGHT: '80px',
  
  // Sizes
  ICON_SIZE_SM: 'h-3 w-3',
  ICON_SIZE_MD: 'h-4 w-4',
  ICON_SIZE_LG: 'h-5 w-5',
  BUTTON_SIZE_SM: 'h-8 w-8',
  
  // Colors and styles
  NEW_COMMENT_HIGHLIGHT: 'bg-primary/5 border-l-4 border-primary pl-3 -ml-3',
  TYPING_INDICATOR_BG: 'bg-muted/50',
  ERROR_BORDER: 'border-destructive/50',
  ERROR_BG: 'bg-destructive/5'
} as const;

// Query and mutation constants
export const COLLABORATION_QUERY = {
  // Stale times
  COMMENTS_STALE_TIME: 30 * 1000, // 30 seconds
  PRESENCE_STALE_TIME: 10 * 1000, // 10 seconds
  
  // Cache times
  COMMENTS_GC_TIME: 5 * 60 * 1000, // 5 minutes
  PRESENCE_GC_TIME: 1 * 60 * 1000, // 1 minute
  
  // Retry settings
  MAX_RETRY_ATTEMPTS: 2,
  RETRY_BASE_DELAY: 1500,
  
  // Limits
  COMMENTS_DEFAULT_LIMIT: 50,
  COMMENTS_LARGE_LIMIT: 100,
  PREVIEW_LENGTH: 100,
  
  // Toast duration
  TOAST_DURATION: 4000
} as const;

// WebSocket event types
export const WS_EVENT_TYPES = {
  // Comment events
  COMMENT_ADDED: 'comment_added',
  COMMENT_UPDATED: 'comment_updated',
  COMMENT_DELETED: 'comment_deleted',
  
  // User events
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  
  // Interaction events
  CURSOR_MOVED: 'cursor_moved',
  TYPING_STARTED: 'typing_started',
  TYPING_STOPPED: 'typing_stopped',
  
  // Document events
  DOCUMENT_UPDATED: 'document_updated',
  PROJECT_ACTIVITY: 'project_activity'
} as const;

// Error messages
export const COLLABORATION_ERRORS = {
  // Authentication
  NOT_AUTHENTICATED: 'You must be signed in to perform this action',
  UNAUTHORIZED: 'You can only modify your own content',
  
  // Connection
  CONNECTION_FAILED: 'Failed to connect to real-time services',
  CONNECTION_LOST: 'Lost connection to real-time services',
  WEBSOCKET_ERROR: 'Unable to connect to real-time collaboration features',
  
  // Comments
  CREATE_COMMENT_FAILED: 'Failed to create comment. Please try again.',
  UPDATE_COMMENT_FAILED: 'Failed to update comment. Please try again.',
  DELETE_COMMENT_FAILED: 'Failed to delete comment. Please try again.',
  BULK_DELETE_FAILED: 'Failed to delete comments. Please try again.',
  
  // General
  UNEXPECTED_ERROR: 'An unexpected error occurred. Please try again.',
  MAX_RETRIES_REACHED: 'Max retry attempts reached. Please refresh the page or contact support if the problem persists.',
  SERVICE_DESTROYED: 'Service is no longer available'
} as const;

// Success messages
export const COLLABORATION_SUCCESS = {
  COMMENT_CREATED: 'Comment added successfully!',
  REPLY_CREATED: 'Reply added successfully!',
  COMMENT_UPDATED: 'Comment updated successfully!',
  COMMENT_DELETED: 'Comment deleted successfully!',
  CONNECTION_RESTORED: 'Connection restored',
  USER_JOINED: (name: string) => `${name} joined the collaboration`,
  USER_LEFT: (name: string) => `${name} left the collaboration`,
  NEW_COMMENT: (name: string) => `New comment from ${name}`,
  BULK_DELETED: (count: number) => `${count} comment(s) deleted successfully!`
} as const;

// Circuit breaker keys
export const CIRCUIT_BREAKER_KEYS = {
  COMMENT_CREATION: 'comment-creation',
  COMMENT_UPDATE: 'comment-update',
  COMMENT_DELETE: 'comment-delete',
  WEBSOCKET_CONNECTION: 'websocket-connection',
  PRESENCE_UPDATE: 'presence-update'
} as const;

// Room types
export const ROOM_TYPES = {
  PROJECT: 'project',
  DOCUMENT: 'document',
  PHASE: 'phase',
  TASK: 'task'
} as const;

// User status
export const USER_STATUS = {
  ONLINE: 'online',
  AWAY: 'away',
  OFFLINE: 'offline'
} as const;

// Entity types
export const ENTITY_TYPES = {
  PROJECT: 'project',
  PHASE: 'phase',
  TASK: 'task'
} as const;

// Animation delays for typing indicators
export const TYPING_ANIMATION_DELAYS = {
  DOT_1: '0s',
  DOT_2: '0.1s',
  DOT_3: '0.2s'
} as const;