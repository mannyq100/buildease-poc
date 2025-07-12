/**
 * Simplified Notification Store - Essential notification management
 * 
 * Core features:
 * - Real-time notification updates
 * - Basic CRUD operations
 * - Unread count tracking
 * - Simple state management
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Notification } from '@/types/database';
import NotificationService from '@/services/notificationService';

// Simple notification store state
export interface NotificationStoreState {
  // Core data
  notifications: Notification[];
  unreadCount: number;
  
  // UI state
  loading: boolean;
  error: string | null;
  
  // User context
  userId: string | null;
  
  // Real-time connection
  realtimeUnsubscribe: (() => void) | null;
  
  // Actions
  setUserId: (userId: string) => void;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  connectRealTime: () => void;
  disconnectRealTime: () => void;
  clearError: () => void;
  reset: () => void;
}

// Helper function to calculate unread count
const calculateUnreadCount = (notifications: Notification[]): number => {
  return notifications.filter(n => !n.read).length;
};

// Create the simplified Zustand store
export const useNotificationStore = create<NotificationStoreState>()(
  devtools(
    (set, get) => ({
      // Initial state
      notifications: [],
      unreadCount: 0,
      loading: false,
      error: null,
      userId: null,
      realtimeUnsubscribe: null,

      // User management
      setUserId: (userId: string) => {
        set({ userId }, false, 'setUserId');
      },

      // Fetch notifications (recent 20 only)
      fetchNotifications: async () => {
        const { userId } = get();
        
        if (!userId) {
          set({ error: 'User not authenticated' }, false, 'fetchNotifications-no-user');
          return;
        }

        set({ loading: true, error: null }, false, 'fetchNotifications-start');
        
        try {
          const result = await NotificationService.fetchNotifications(userId, 20);
          
          set({
            notifications: result.notifications,
            unreadCount: calculateUnreadCount(result.notifications),
            loading: false
          }, false, 'fetchNotifications-success');
          
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch notifications'
          }, false, 'fetchNotifications-error');
        }
      },

      // Mark notification as read
      markAsRead: async (id: string) => {
        try {
          await NotificationService.markAsRead(id);
          
          set((state) => {
            const updatedNotifications = state.notifications.map(n =>
              n.id === id ? { ...n, read: true } : n
            );
            
            return {
              notifications: updatedNotifications,
              unreadCount: calculateUnreadCount(updatedNotifications)
            };
          }, false, 'markAsRead');
          
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to mark as read'
          }, false, 'markAsRead-error');
        }
      },

      // Mark all notifications as read
      markAllAsRead: async () => {
        const { userId } = get();
        
        if (!userId) return;
        
        try {
          await NotificationService.markAllAsRead(userId);
          
          set((state) => ({
            notifications: state.notifications.map(n => ({ ...n, read: true })),
            unreadCount: 0
          }), false, 'markAllAsRead');
          
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to mark all as read'
          }, false, 'markAllAsRead-error');
        }
      },

      // Delete notification
      deleteNotification: async (id: string) => {
        try {
          await NotificationService.deleteNotification(id);
          
          set((state) => {
            const updatedNotifications = state.notifications.filter(n => n.id !== id);
            
            return {
              notifications: updatedNotifications,
              unreadCount: calculateUnreadCount(updatedNotifications)
            };
          }, false, 'deleteNotification');
          
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete notification'
          }, false, 'deleteNotification-error');
        }
      },

      // Real-time connection
      connectRealTime: () => {
        const { userId, realtimeUnsubscribe } = get();
        
        if (!userId) return;
        
        // Disconnect existing connection
        if (realtimeUnsubscribe) {
          realtimeUnsubscribe();
        }
        
        try {
          const unsubscribe = NotificationService.subscribeToRealTimeUpdates(
            userId,
            (notification: Notification) => {
              set((state) => {
                const updatedNotifications = [notification, ...state.notifications.slice(0, 19)];
                
                return {
                  notifications: updatedNotifications,
                  unreadCount: calculateUnreadCount(updatedNotifications)
                };
              }, false, 'realtime-update');
            },
            (notificationId: string) => {
              set((state) => {
                const updatedNotifications = state.notifications.filter(n => n.id !== notificationId);
                
                return {
                  notifications: updatedNotifications,
                  unreadCount: calculateUnreadCount(updatedNotifications)
                };
              }, false, 'realtime-delete');
            }
          );
          
          set({ realtimeUnsubscribe: unsubscribe }, false, 'connectRealTime');
          
        } catch (error) {
          console.error('Failed to connect to real-time updates:', error);
        }
      },

      // Disconnect real-time
      disconnectRealTime: () => {
        const { realtimeUnsubscribe } = get();
        
        if (realtimeUnsubscribe) {
          realtimeUnsubscribe();
          set({ realtimeUnsubscribe: null }, false, 'disconnectRealTime');
        }
      },

      // Clear error
      clearError: () => {
        set({ error: null }, false, 'clearError');
      },

      // Reset store
      reset: () => {
        const { disconnectRealTime } = get();
        disconnectRealTime();
        
        set({
          notifications: [],
          unreadCount: 0,
          loading: false,
          error: null,
          userId: null,
          realtimeUnsubscribe: null
        }, false, 'reset');
      }
    }),
    {
      name: 'notification-store',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
);

// Simplified convenience hooks
export const useNotifications = () => {
  const notifications = useNotificationStore(state => state.notifications);
  const unreadCount = useNotificationStore(state => state.unreadCount);
  const loading = useNotificationStore(state => state.loading);
  const error = useNotificationStore(state => state.error);
  
  return { notifications, unreadCount, loading, error };
};

export const useNotificationActions = () => {
  const fetchNotifications = useNotificationStore(state => state.fetchNotifications);
  const markAsRead = useNotificationStore(state => state.markAsRead);
  const markAllAsRead = useNotificationStore(state => state.markAllAsRead);
  const deleteNotification = useNotificationStore(state => state.deleteNotification);
  
  return { fetchNotifications, markAsRead, markAllAsRead, deleteNotification };
};

// Export the main store as default
export default useNotificationStore;