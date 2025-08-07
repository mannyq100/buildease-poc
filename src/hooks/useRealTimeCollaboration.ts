/**
 * useRealTimeCollaboration Hook
 * React hook for managing real-time collaboration features
 * Handles room management, presence tracking, and event handling
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { websocketService, CollaborationEvent, UserPresence } from '@/services/websocketService';
import { getUserDisplayName } from '@/utils/projectUtils';

interface UseRealTimeCollaborationOptions {
  roomId: string;
  roomType: 'project' | 'document' | 'phase' | 'task';
  entityId: string;
  enabled?: boolean;
  onEvent?: (event: CollaborationEvent) => void;
  onUserJoin?: (user: UserPresence) => void;
  onUserLeave?: (user: UserPresence) => void;
}

interface UseRealTimeCollaborationReturn {
  // Connection state
  isConnected: boolean;
  isJoined: boolean;
  connectionError: string | null;
  
  // Users and presence
  users: UserPresence[];
  currentUser: UserPresence | null;
  otherUsers: UserPresence[];
  onlineCount: number;
  
  // Actions
  joinRoom: () => Promise<void>;
  leaveRoom: () => Promise<void>;
  updatePresence: (updates: Partial<UserPresence>) => void;
  broadcastEvent: (event: Omit<CollaborationEvent, 'user_id' | 'user_name' | 'timestamp' | 'room_id'>) => void;
  
  // Typing indicators
  startTyping: () => void;
  stopTyping: () => void;
  isTyping: (userId: string) => boolean;
  typingUsers: UserPresence[];
  
  // Cursor tracking
  updateCursor: (position: { x: number; y: number }) => void;
  cursors: Map<string, { x: number; y: number; user: UserPresence }>;
}

export function useRealTimeCollaboration({
  roomId,
  roomType,
  entityId,
  enabled = true,
  onEvent,
  onUserJoin,
  onUserLeave
}: UseRealTimeCollaborationOptions): UseRealTimeCollaborationReturn {
  const { user } = useSupabaseAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserPresence[]>([]);
  const [typingUsers, setTypingUsers] = useState<UserPresence[]>([]);
  const [cursors, setCursors] = useState<Map<string, { x: number; y: number; user: UserPresence }>>(new Map());
  
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const lastPresenceUpdateRef = useRef<number>(0);
  const unsubscribeCallbacksRef = useRef<(() => void)[]>([]);

  // Get current user info
  const currentUser = users.find(u => u.user_id === user?.id) || null;
  const otherUsers = users.filter(u => u.user_id !== user?.id);
  const onlineCount = users.filter(u => u.status === 'online').length;

  // Initialize WebSocket service
  useEffect(() => {
    if (!user || !enabled) return;

    const initializeService = async () => {
      try {
        const userName = getUserDisplayName({ user } as any);
        await websocketService.initialize(user.id, userName);
        setIsConnected(true);
        setConnectionError(null);
      } catch (error) {
        console.error('Failed to initialize collaboration service:', error);
        setConnectionError(error instanceof Error ? error.message : 'Connection failed');
        setIsConnected(false);
      }
    };

    initializeService();
  }, [user, enabled]);

  // Setup connection monitoring
  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = websocketService.onConnection((connected) => {
      setIsConnected(connected);
      if (!connected) {
        setConnectionError('Connection lost');
        setIsJoined(false);
      } else {
        setConnectionError(null);
      }
    });

    return unsubscribe;
  }, [enabled]);

  // Join room when conditions are met
  const joinRoom = useCallback(async () => {
    if (!user || !isConnected || isJoined || !enabled) return;

    try {
      await websocketService.joinRoom(roomId, roomType, entityId);
      setIsJoined(true);
      setConnectionError(null);
    } catch (error) {
      console.error('Failed to join room:', error);
      setConnectionError(error instanceof Error ? error.message : 'Failed to join room');
      throw error;
    }
  }, [user, isConnected, isJoined, enabled, roomId, roomType, entityId]);

  // Leave room
  const leaveRoom = useCallback(async () => {
    if (!isJoined) return;

    try {
      await websocketService.leaveRoom(roomId);
      setIsJoined(false);
      setUsers([]);
      setTypingUsers([]);
      setCursors(new Map());
    } catch (error) {
      console.error('Failed to leave room:', error);
    }
  }, [isJoined, roomId]);

  // Auto join/leave room
  useEffect(() => {
    if (isConnected && enabled && !isJoined) {
      joinRoom().catch(console.error);
    }

    return () => {
      if (isJoined) {
        leaveRoom().catch(console.error);
      }
    };
  }, [isConnected, enabled, isJoined, joinRoom, leaveRoom]);

  // Memoize event handlers to prevent stale closures
  const handleCollaborationEvent = useCallback((event: CollaborationEvent) => {
    // Handle typing indicators
    if (event.type === 'typing_started') {
      setTypingUsers(prev => {
        const existing = prev.find(u => u.user_id === event.user_id);
        if (existing) return prev;
        
        // Use the current users state through a callback to avoid stale closure
        setUsers(currentUsers => {
          const user = currentUsers.find(u => u.user_id === event.user_id);
          if (user) {
            setTypingUsers(prevTyping => {
              const alreadyTyping = prevTyping.find(u => u.user_id === event.user_id);
              return alreadyTyping ? prevTyping : [...prevTyping, user];
            });
          }
          return currentUsers; // Don't modify users state
        });
        return prev;
      });
    } else if (event.type === 'typing_stopped') {
      setTypingUsers(prev => prev.filter(u => u.user_id !== event.user_id));
    }
    
    // Handle cursor movements
    else if (event.type === 'cursor_moved') {
      const { x, y } = event.payload as { x: number; y: number };
      setUsers(currentUsers => {
        const user = currentUsers.find(u => u.user_id === event.user_id);
        if (user) {
          setCursors(prev => {
            const newCursors = new Map(prev);
            newCursors.set(event.user_id, { x, y, user });
            return newCursors;
          });
        }
        return currentUsers; // Don't modify users state
      });
    }

    // Call custom event handler
    onEvent?.(event);
  }, [onEvent]);

  const handlePresenceUpdate = useCallback((updatedUsers: UserPresence[]) => {
    setUsers(prevUsers => {
      // Detect user join/leave events using previous state
      const prevUserIds = new Set(prevUsers.map(u => u.user_id));
      const currentUserIds = new Set(updatedUsers.map(u => u.user_id));

      // Check for new users (avoid stale closure by using current user state)
      updatedUsers.forEach(newUser => {
        if (!prevUserIds.has(newUser.user_id) && newUser.user_id !== user?.id) {
          onUserJoin?.(newUser);
        }
      });

      // Check for users who left
      prevUsers.forEach(prevUser => {
        if (!currentUserIds.has(prevUser.user_id) && prevUser.user_id !== user?.id) {
          onUserLeave?.(prevUser);
        }
      });

      // Clean up cursors for users who left
      setCursors(prev => {
        const newCursors = new Map();
        prev.forEach((cursor, userId) => {
          if (currentUserIds.has(userId)) {
            newCursors.set(userId, cursor);
          }
        });
        return newCursors;
      });

      // Clean up typing indicators for users who left
      setTypingUsers(prev => prev.filter(u => currentUserIds.has(u.user_id)));
      
      return updatedUsers;
    });
  }, [onUserJoin, onUserLeave, user?.id]);

  // Setup event listeners
  useEffect(() => {
    if (!isJoined) return;

    // Handle collaboration events
    const unsubscribeEvents = websocketService.onEvent(roomId, handleCollaborationEvent);

    // Handle presence updates
    const unsubscribePresence = websocketService.onPresence(roomId, handlePresenceUpdate);

    unsubscribeCallbacksRef.current = [unsubscribeEvents, unsubscribePresence];

    return () => {
      unsubscribeCallbacksRef.current.forEach(unsubscribe => unsubscribe());
      unsubscribeCallbacksRef.current = [];
    };
  }, [isJoined, roomId, handleCollaborationEvent, handlePresenceUpdate]);

  // Update presence with proper throttling
  const updatePresence = useCallback((updates: Partial<UserPresence>) => {
    if (!isJoined || !user) return;

    // Throttle presence updates to avoid spam
    const now = Date.now();
    const PRESENCE_THROTTLE_MS = 1000;
    
    if (now - lastPresenceUpdateRef.current < PRESENCE_THROTTLE_MS) return;
    lastPresenceUpdateRef.current = now;

    websocketService.updatePresence(roomId, {
      ...updates,
      last_seen: new Date().toISOString()
    });
  }, [isJoined, roomId, user]);

  // Broadcast event
  const broadcastEvent = useCallback((
    event: Omit<CollaborationEvent, 'user_id' | 'user_name' | 'timestamp' | 'room_id'>
  ) => {
    if (!isJoined || !user) return;

    const userName = getUserDisplayName({ user } as any);
    websocketService.broadcastEvent(roomId, {
      ...event,
      user_id: user.id,
      user_name: userName,
      timestamp: new Date().toISOString(),
      room_id: roomId
    });
  }, [isJoined, user, roomId]);

  // Typing indicators with constants
  const TYPING_TIMEOUT_MS = 3000;
  
  const startTyping = useCallback(() => {
    if (!isJoined || !user) return;

    broadcastEvent({
      type: 'typing_started',
      payload: {}
    });

    // Auto-stop typing after timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, TYPING_TIMEOUT_MS);
  }, [isJoined, user, broadcastEvent]);

  const stopTyping = useCallback(() => {
    if (!isJoined || !user) return;

    broadcastEvent({
      type: 'typing_stopped',
      payload: {}
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = undefined;
    }
  }, [isJoined, user, broadcastEvent]);

  const isTyping = useCallback((userId: string) => {
    return typingUsers.some(u => u.user_id === userId);
  }, [typingUsers]);

  // Cursor tracking
  const updateCursor = useCallback((position: { x: number; y: number }) => {
    if (!isJoined) return;

    broadcastEvent({
      type: 'cursor_moved',
      payload: position
    });
  }, [isJoined, broadcastEvent]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = undefined;
      }
      
      // Unsubscribe from all callbacks
      unsubscribeCallbacksRef.current.forEach(unsubscribe => {
        try {
          unsubscribe();
        } catch (error) {
          console.warn('Error during callback cleanup:', error);
        }
      });
      unsubscribeCallbacksRef.current = [];
      
      // Leave room if joined
      if (isJoined) {
        leaveRoom().catch(error => {
          console.warn('Error leaving room during cleanup:', error);
        });
      }
    };
  }, [isJoined, leaveRoom]);

  return {
    // Connection state
    isConnected,
    isJoined,
    connectionError,
    
    // Users and presence
    users,
    currentUser,
    otherUsers,
    onlineCount,
    
    // Actions
    joinRoom,
    leaveRoom,
    updatePresence,
    broadcastEvent,
    
    // Typing indicators
    startTyping,
    stopTyping,
    isTyping,
    typingUsers,
    
    // Cursor tracking
    updateCursor,
    cursors
  };
}