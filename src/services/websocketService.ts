/**
 * WebSocket Service for Real-time Collaboration
 * Handles real-time communication, presence tracking, and event broadcasting
 * Optimized for BuildEase construction site usage with reconnection handling
 */

import { RealtimeChannel, RealtimeClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface CollaborationEvent {
  type: 'comment_added' | 'comment_updated' | 'comment_deleted' | 
        'user_joined' | 'user_left' | 'cursor_moved' | 'typing_started' | 'typing_stopped' |
        'document_updated' | 'project_activity';
  payload: Record<string, unknown>;
  user_id: string;
  user_name?: string;
  timestamp: string;
  room_id: string;
}

export interface UserPresence {
  user_id: string;
  user_name: string;
  user_avatar?: string;
  status: 'online' | 'away' | 'offline';
  last_seen: string;
  current_page?: string;
  cursor_position?: { x: number; y: number };
  is_typing?: boolean;
}

export interface RealtimeRoom {
  id: string;
  type: 'project' | 'document' | 'phase' | 'task';
  entity_id: string;
  users: Map<string, UserPresence>;
  channel?: RealtimeChannel;
}

type EventCallback = (event: CollaborationEvent) => void;
type PresenceCallback = (users: UserPresence[]) => void;
type ConnectionCallback = (connected: boolean) => void;

class WebSocketService {
  private client: RealtimeClient;
  private rooms: Map<string, RealtimeRoom> = new Map();
  private eventCallbacks: Map<string, EventCallback[]> = new Map();
  private presenceCallbacks: Map<string, PresenceCallback[]> = new Map();
  private connectionCallbacks: ConnectionCallback[] = [];
  private callbackRegistry: WeakMap<EventCallback | PresenceCallback | ConnectionCallback, string> = new WeakMap();
  private currentUserId?: string;
  private currentUserName?: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private heartbeatInterval?: NodeJS.Timeout;
  private isConnected = false;
  private isDestroyed = false;

  // Constants for better maintainability
  private static readonly HEARTBEAT_INTERVAL = 30000; // 30 seconds
  private static readonly MAX_RECONNECT_DELAY = 30000; // 30 seconds
  private static readonly PRESENCE_THROTTLE = 1000; // 1 second

  constructor() {
    this.client = supabase.realtime;
    this.setupConnectionHandlers();
    this.startHeartbeat();
  }

  /**
   * Initialize WebSocket service with user information
   */
  async initialize(userId: string, userName: string): Promise<void> {
    this.currentUserId = userId;
    this.currentUserName = userName;
    
    try {
      // Connect to Supabase Realtime
      await this.connect();
      console.log('🔗 WebSocket service initialized for user:', userName);
    } catch (error) {
      console.error('❌ Failed to initialize WebSocket service:', error);
      toast.error('Failed to connect to real-time services');
    }
  }

  /**
   * Connect to WebSocket
   */
  private async connect(): Promise<void> {
    try {
      // Supabase Realtime connects automatically when channels are subscribed
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.notifyConnectionCallbacks(true);
      
      console.log('✅ WebSocket connected');
    } catch (error) {
      console.error('❌ WebSocket connection failed:', error);
      this.handleReconnect();
    }
  }

  /**
   * Setup connection event handlers
   */
  private setupConnectionHandlers(): void {
    // Supabase Realtime has built-in connection handling
    // We'll monitor through channel events
  }

  /**
   * Handle reconnection logic
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      toast.error('Lost connection to real-time services. Please refresh the page.');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts), WebSocketService.MAX_RECONNECT_DELAY);
    
    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Start heartbeat to monitor connection
   */
  private startHeartbeat(): void {
    if (this.isDestroyed) return;
    
    this.heartbeatInterval = setInterval(() => {
      if (this.isDestroyed) return;
      
      if (!this.isConnected) {
        this.handleReconnect();
      }
    }, WebSocketService.HEARTBEAT_INTERVAL);
  }

  /**
   * Join a collaboration room
   */
  async joinRoom(roomId: string, type: RealtimeRoom['type'], entityId: string): Promise<void> {
    if (!this.currentUserId) {
      throw new Error('WebSocket service not initialized');
    }

    try {
      // Create room if it doesn't exist
      if (!this.rooms.has(roomId)) {
        const room: RealtimeRoom = {
          id: roomId,
          type,
          entity_id: entityId,
          users: new Map()
        };
        this.rooms.set(roomId, room);
      }

      const room = this.rooms.get(roomId)!;

      // Create and subscribe to Supabase channel
      const channel = supabase.channel(roomId, {
        config: {
          presence: { key: this.currentUserId }
        }
      });

      // Handle presence events
      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          this.handlePresenceSync(roomId, state);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          this.handlePresenceJoin(roomId, key, newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          this.handlePresenceLeave(roomId, key, leftPresences);
        })
        // Handle broadcast events
        .on('broadcast', { event: 'collaboration-event' }, ({ payload }) => {
          this.handleCollaborationEvent(roomId, payload);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            // Track user presence
            await channel.track({
              user_id: this.currentUserId,
              user_name: this.currentUserName,
              status: 'online',
              last_seen: new Date().toISOString(),
              current_page: window.location.pathname
            });

            console.log(`✅ Joined room: ${roomId}`);
            
            // Broadcast join event
            this.broadcastEvent(roomId, {
              type: 'user_joined',
              payload: {
                user_id: this.currentUserId,
                user_name: this.currentUserName
              },
              user_id: this.currentUserId!,
              user_name: this.currentUserName,
              timestamp: new Date().toISOString(),
              room_id: roomId
            });
          }
        });

      room.channel = channel;

    } catch (error) {
      console.error(`❌ Failed to join room ${roomId}:`, error);
      toast.error('Failed to join collaboration room');
    }
  }

  /**
   * Leave a collaboration room
   */
  async leaveRoom(roomId: string): Promise<void> {
    const room = this.rooms.get(roomId);
    if (!room || !this.currentUserId) return;

    try {
      // Broadcast leave event
      this.broadcastEvent(roomId, {
        type: 'user_left',
        payload: {
          user_id: this.currentUserId,
          user_name: this.currentUserName
        },
        user_id: this.currentUserId,
        user_name: this.currentUserName,
        timestamp: new Date().toISOString(),
        room_id: roomId
      });

      // Unsubscribe from channel
      if (room.channel) {
        await room.channel.unsubscribe();
      }

      // Remove room
      this.rooms.delete(roomId);
      console.log(`👋 Left room: ${roomId}`);

    } catch (error) {
      console.error(`❌ Failed to leave room ${roomId}:`, error);
    }
  }

  /**
   * Broadcast an event to a room
   */
  broadcastEvent(roomId: string, event: CollaborationEvent): void {
    const room = this.rooms.get(roomId);
    if (!room?.channel) {
      console.warn(`⚠️ Cannot broadcast to room ${roomId}: not connected`);
      return;
    }

    room.channel.send({
      type: 'broadcast',
      event: 'collaboration-event',
      payload: event
    });
  }

  /**
   * Update user presence in a room
   */
  updatePresence(roomId: string, updates: Partial<UserPresence>): void {
    const room = this.rooms.get(roomId);
    if (!room?.channel || !this.currentUserId) return;

    const currentPresence = room.users.get(this.currentUserId) || {
      user_id: this.currentUserId,
      user_name: this.currentUserName || 'Unknown',
      status: 'online' as const,
      last_seen: new Date().toISOString()
    };

    const updatedPresence = { ...currentPresence, ...updates };
    room.users.set(this.currentUserId, updatedPresence);

    room.channel.track(updatedPresence);
  }

  /**
   * Handle presence sync event
   */
  private handlePresenceSync(roomId: string, state: Record<string, any>): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    // Update users map
    room.users.clear();
    Object.entries(state).forEach(([userId, presences]) => {
      if (presences && presences.length > 0) {
        room.users.set(userId, presences[0] as UserPresence);
      }
    });

    // Notify presence callbacks
    this.notifyPresenceCallbacks(roomId, Array.from(room.users.values()));
  }

  /**
   * Handle user join presence event
   */
  private handlePresenceJoin(roomId: string, key: string, newPresences: any[]): void {
    const room = this.rooms.get(roomId);
    if (!room || !newPresences.length) return;

    const presence = newPresences[0] as UserPresence;
    room.users.set(key, presence);

    console.log(`👤 User joined room ${roomId}:`, presence.user_name);
    
    // Show notification for other users joining
    if (key !== this.currentUserId) {
      toast.success(`${presence.user_name} joined the collaboration`, {
        duration: 3000
      });
    }

    this.notifyPresenceCallbacks(roomId, Array.from(room.users.values()));
  }

  /**
   * Handle user leave presence event
   */
  private handlePresenceLeave(roomId: string, key: string, leftPresences: any[]): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const presence = room.users.get(key);
    room.users.delete(key);

    if (presence && key !== this.currentUserId) {
      console.log(`👋 User left room ${roomId}:`, presence.user_name);
      toast.info(`${presence.user_name} left the collaboration`, {
        duration: 3000
      });
    }

    this.notifyPresenceCallbacks(roomId, Array.from(room.users.values()));
  }

  /**
   * Handle collaboration events
   */
  private handleCollaborationEvent(roomId: string, event: CollaborationEvent): void {
    // Don't process our own events
    if (event.user_id === this.currentUserId) return;

    console.log(`📨 Collaboration event in ${roomId}:`, event.type);
    this.notifyEventCallbacks(roomId, event);
  }

  /**
   * Subscribe to events in a room
   */
  onEvent(roomId: string, callback: EventCallback): () => void {
    if (this.isDestroyed) {
      console.warn('WebSocket service is destroyed, cannot add event callback');
      return () => {};
    }

    if (!this.eventCallbacks.has(roomId)) {
      this.eventCallbacks.set(roomId, []);
    }
    
    this.eventCallbacks.get(roomId)!.push(callback);
    this.callbackRegistry.set(callback, roomId);

    // Return unsubscribe function
    return () => {
      const callbacks = this.eventCallbacks.get(roomId);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
      this.callbackRegistry.delete(callback);
    };
  }

  /**
   * Subscribe to presence updates in a room
   */
  onPresence(roomId: string, callback: PresenceCallback): () => void {
    if (this.isDestroyed) {
      console.warn('WebSocket service is destroyed, cannot add presence callback');
      return () => {};
    }

    if (!this.presenceCallbacks.has(roomId)) {
      this.presenceCallbacks.set(roomId, []);
    }
    
    this.presenceCallbacks.get(roomId)!.push(callback);
    this.callbackRegistry.set(callback, roomId);

    // Return unsubscribe function
    return () => {
      const callbacks = this.presenceCallbacks.get(roomId);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
      this.callbackRegistry.delete(callback);
    };
  }

  /**
   * Subscribe to connection status changes
   */
  onConnection(callback: ConnectionCallback): () => void {
    if (this.isDestroyed) {
      console.warn('WebSocket service is destroyed, cannot add connection callback');
      return () => {};
    }

    this.connectionCallbacks.push(callback);
    this.callbackRegistry.set(callback, 'connection');

    // Return unsubscribe function
    return () => {
      const index = this.connectionCallbacks.indexOf(callback);
      if (index > -1) {
        this.connectionCallbacks.splice(index, 1);
      }
      this.callbackRegistry.delete(callback);
    };
  }

  /**
   * Notify event callbacks
   */
  private notifyEventCallbacks(roomId: string, event: CollaborationEvent): void {
    if (this.isDestroyed) return;
    
    const callbacks = this.eventCallbacks.get(roomId) || [];
    // Create a copy to avoid issues if callbacks modify the array during iteration
    const callbacksCopy = [...callbacks];
    
    callbacksCopy.forEach(callback => {
      try {
        // Check if callback is still registered to avoid stale references
        if (this.callbackRegistry.has(callback)) {
          callback(event);
        }
      } catch (error) {
        console.error('❌ Error in event callback:', error);
        // Remove failing callback to prevent repeated errors
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
          this.callbackRegistry.delete(callback);
        }
      }
    });
  }

  /**
   * Notify presence callbacks
   */
  private notifyPresenceCallbacks(roomId: string, users: UserPresence[]): void {
    if (this.isDestroyed) return;
    
    const callbacks = this.presenceCallbacks.get(roomId) || [];
    // Create a copy to avoid issues if callbacks modify the array during iteration
    const callbacksCopy = [...callbacks];
    
    callbacksCopy.forEach(callback => {
      try {
        // Check if callback is still registered to avoid stale references
        if (this.callbackRegistry.has(callback)) {
          callback(users);
        }
      } catch (error) {
        console.error('❌ Error in presence callback:', error);
        // Remove failing callback to prevent repeated errors
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
          this.callbackRegistry.delete(callback);
        }
      }
    });
  }

  /**
   * Notify connection callbacks
   */
  private notifyConnectionCallbacks(connected: boolean): void {
    if (this.isDestroyed) return;
    
    this.isConnected = connected;
    // Create a copy to avoid issues if callbacks modify the array during iteration
    const callbacksCopy = [...this.connectionCallbacks];
    
    callbacksCopy.forEach(callback => {
      try {
        // Check if callback is still registered to avoid stale references
        if (this.callbackRegistry.has(callback)) {
          callback(connected);
        }
      } catch (error) {
        console.error('❌ Error in connection callback:', error);
        // Remove failing callback to prevent repeated errors
        const index = this.connectionCallbacks.indexOf(callback);
        if (index > -1) {
          this.connectionCallbacks.splice(index, 1);
          this.callbackRegistry.delete(callback);
        }
      }
    });
  }

  /**
   * Get current users in a room
   */
  getRoomUsers(roomId: string): UserPresence[] {
    const room = this.rooms.get(roomId);
    return room ? Array.from(room.users.values()) : [];
  }

  /**
   * Check if connected
   */
  isConnectedToRoom(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    return !!(room?.channel);
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Cleanup and disconnect
   */
  async disconnect(): Promise<void> {
    try {
      // Mark as destroyed to prevent new operations
      this.isDestroyed = true;
      
      // Leave all rooms
      const roomIds = Array.from(this.rooms.keys());
      await Promise.all(roomIds.map(roomId => this.leaveRoom(roomId)));

      // Clear callbacks and registry
      this.eventCallbacks.clear();
      this.presenceCallbacks.clear();
      this.connectionCallbacks = [];
      // Note: WeakMap will be garbage collected automatically

      // Stop heartbeat
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = undefined;
      }

      this.isConnected = false;
      console.log('🔌 WebSocket service disconnected');

    } catch (error) {
      console.error('❌ Error during disconnect:', error);
    }
  }

  /**
   * Destroy the service and free all resources
   */
  destroy(): void {
    this.disconnect().catch(console.error);
  }

  /**
   * Check if service is destroyed
   */
  isServiceDestroyed(): boolean {
    return this.isDestroyed;
  }
}

// Create singleton instance
export const websocketService = new WebSocketService();

// Export types for use in components
export type { CollaborationEvent, UserPresence, RealtimeRoom };