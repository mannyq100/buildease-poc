/**
 * Notification Store - Zustand Store for Notification Management
 * 
 * Manages the complete state for the notification system including:
 * - Real-time notification updates
 * - Notification CRUD operations
 * - Filtering and sorting
 * - Unread count tracking
 * - WebSocket/SSE integration for real-time updates
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Notification, NotificationType, NotificationInsert } from '@/types/database';
import { NotificationDetails } from '@/components/shared/NotificationCard';
import NotificationService from '@/services/notificationService';

// Extended notification interface for UI
export interface UINotification extends Omit<Notification, 'created_at' | 'updated_at'> {
  timestamp: string; // formatted timestamp
  type: 'info' | 'success' | 'warning' | 'error'; // UI-friendly type mapping
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
  project?: string;
}

// Notification filters
export interface NotificationFilters {
  status: 'all' | 'unread' | 'read';
  type: NotificationType | 'all';
  dateRange: 'all' | 'today' | 'week' | 'month';
  project: string | 'all';
}

// Pagination state
export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// Real-time connection state
export interface ConnectionState {
  isConnected: boolean;
  lastUpdated: Date | null;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
}

// Main notification store state
export interface NotificationStoreState {
  // Core data
  notifications: UINotification[];
  unreadCount: number;
  
  // UI state
  loading: boolean;
  error: string | null;
  
  // User context
  userId: string | null;
  
  // Filters and pagination
  filters: NotificationFilters;
  pagination: PaginationState;
  
  // Real-time connection
  connection: ConnectionState;
  realtimeUnsubscribe: (() => void) | null;
  
  // UI preferences
  isNotificationCenterOpen: boolean;
  
  // Actions - User management
  setUserId: (userId: string) => void;
  
  // Actions - Data management
  fetchNotifications: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  addNotification: (notification: NotificationInsert) => Promise<void>;
  updateNotification: (id: string, updates: Partial<Notification>) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  
  // Actions - Status management
  markAsRead: (id: string) => Promise<void>;
  markAsUnread: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  
  // Actions - Filtering and pagination
  setFilters: (filters: Partial<NotificationFilters>) => void;
  resetFilters: () => void;
  loadMoreNotifications: () => Promise<void>;
  
  // Actions - Real-time updates
  connectRealTime: () => void;
  disconnectRealTime: () => void;
  handleRealTimeUpdate: (notification: Notification) => void;
  
  // Actions - UI management
  openNotificationCenter: () => void;
  closeNotificationCenter: () => void;
  toggleNotificationCenter: () => void;
  
  // Utility actions
  getFilteredNotifications: () => UINotification[];
  clearError: () => void;
  reset: () => void;
}

// Default values
const defaultFilters: NotificationFilters = {
  status: 'all',
  type: 'all',
  dateRange: 'all',
  project: 'all'
};

const defaultPagination: PaginationState = {
  page: 1,
  limit: 20,
  total: 0,
  hasMore: false
};

const defaultConnection: ConnectionState = {
  isConnected: false,
  lastUpdated: null,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5
};

// Helper function to convert database notification to UI notification
function convertToUINotification(notification: Notification): UINotification {
  return {
    ...notification,
    timestamp: notification.created_at,
    type: mapNotificationTypeToUI(notification.notification_type)
  };
}

// Helper function to map notification type to UI type
function mapNotificationTypeToUI(type: NotificationType): 'info' | 'success' | 'warning' | 'error' {
  switch (type) {
    case 'plan_completed':
      return 'success';
    case 'plan_failed':
      return 'error';
    case 'plan_generation':
      return 'info';
    case 'system':
      return 'warning';
    case 'general':
      return 'info';
    case 'project_update':
      return 'info';
    default:
      return 'info';
  }
}

// Mock notification service (fallback for development)
class MockNotificationService {
  private static mockNotifications: UINotification[] = [
    {
      id: '1',
      user_id: 'user-1',
      title: 'AI Plan Generation Completed',
      message: 'Your construction plan for "Modern Family Home" has been generated and is ready for review.',
      notification_type: 'plan_completed',
      metadata: {
        projectId: 'project-1',
        projectName: 'Modern Family Home',
        planId: 'plan-1'
      },
      action_url: '/projects/project-1/plan',
      read: false,
      expires_at: null,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      type: 'success',
      project: 'Modern Family Home'
    },
    {
      id: '2',
      user_id: 'user-1',
      title: 'Plan Generation Started',
      message: 'AI plan generation has started for your project "Downtown Office". Expected completion in 15-20 minutes.',
      notification_type: 'plan_generation',
      metadata: {
        projectId: 'project-2',
        projectName: 'Downtown Office',
        estimatedCompletion: new Date(Date.now() + 15 * 60 * 1000).toISOString()
      },
      action_url: '/projects/project-2',
      read: false,
      expires_at: null,
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
      type: 'info',
      project: 'Downtown Office'
    },
    {
      id: '3',
      user_id: 'user-1',
      title: 'Project Update',
      message: 'Material delivery has been scheduled for your project "Residential Complex" on March 15th.',
      notification_type: 'project_update',
      metadata: {
        projectId: 'project-3',
        projectName: 'Residential Complex',
        updateType: 'material_delivery'
      },
      action_url: '/projects/project-3/materials',
      read: true,
      expires_at: null,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      type: 'info',
      project: 'Residential Complex',
      sender: {
        id: 'contractor-1',
        name: 'John Smith',
        avatar: '/avatars/contractor-1.jpg'
      }
    }
  ];

  static async fetchNotifications(filters: NotificationFilters, pagination: PaginationState): Promise<{
    notifications: UINotification[];
    total: number;
    hasMore: boolean;
  }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filtered = [...this.mockNotifications];
    
    // Apply filters
    if (filters.status !== 'all') {
      filtered = filtered.filter(n => 
        filters.status === 'read' ? n.read : !n.read
      );
    }
    
    if (filters.type !== 'all') {
      filtered = filtered.filter(n => n.notification_type === filters.type);
    }
    
    if (filters.project !== 'all') {
      filtered = filtered.filter(n => n.project === filters.project);
    }
    
    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          filterDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(n => new Date(n.timestamp) >= filterDate);
    }
    
    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Apply pagination
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    const paginatedNotifications = filtered.slice(start, end);
    
    return {
      notifications: paginatedNotifications,
      total: filtered.length,
      hasMore: end < filtered.length
    };
  }

  static async markAsRead(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const notification = this.mockNotifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
    }
  }

  static async markAsUnread(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const notification = this.mockNotifications.find(n => n.id === id);
    if (notification) {
      notification.read = false;
    }
  }

  static async deleteNotification(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const index = this.mockNotifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.mockNotifications.splice(index, 1);
    }
  }

  static async addNotification(notification: NotificationInsert): Promise<UINotification> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const newNotification: UINotification = {
      id: `notification_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: this.mapNotificationTypeToUI(notification.notification_type),
      ...notification
    };
    
    this.mockNotifications.unshift(newNotification);
    return newNotification;
  }

  private static mapNotificationTypeToUI(type: NotificationType): 'info' | 'success' | 'warning' | 'error' {
    switch (type) {
      case 'plan_completed':
        return 'success';
      case 'plan_failed':
        return 'error';
      case 'plan_generation':
        return 'info';
      case 'system':
        return 'warning';
      default:
        return 'info';
    }
  }

  static getUnreadCount(): number {
    return this.mockNotifications.filter(n => !n.read).length;
  }
}

// Real-time connection simulation
class RealTimeConnection {
  private static eventListeners: Array<(notification: Notification) => void> = [];
  private static connectionInterval: NodeJS.Timeout | null = null;

  static connect(onUpdate: (notification: Notification) => void) {
    this.eventListeners.push(onUpdate);
    
    // Simulate periodic updates
    if (!this.connectionInterval) {
      this.connectionInterval = setInterval(() => {
        // Randomly send new notifications for demo
        if (Math.random() < 0.1) { // 10% chance every 30 seconds
          this.simulateNewNotification();
        }
      }, 30000);
    }
  }

  static disconnect(onUpdate: (notification: Notification) => void) {
    const index = this.eventListeners.indexOf(onUpdate);
    if (index !== -1) {
      this.eventListeners.splice(index, 1);
    }
    
    if (this.eventListeners.length === 0 && this.connectionInterval) {
      clearInterval(this.connectionInterval);
      this.connectionInterval = null;
    }
  }

  private static simulateNewNotification() {
    const mockNotification: Notification = {
      id: `realtime_${Date.now()}`,
      user_id: 'user-1',
      title: 'Real-time Update',
      message: 'This is a simulated real-time notification.',
      notification_type: 'system',
      metadata: {},
      read: false,
      action_url: null,
      expires_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.eventListeners.forEach(listener => listener(mockNotification));
  }
}

// Create the Zustand store
export const useNotificationStore = create<NotificationStoreState>()(
  devtools(
    (set, get) => ({
      // Initial state
      notifications: [],
      unreadCount: 0,
      loading: false,
      error: null,
      userId: null,
      filters: defaultFilters,
      pagination: defaultPagination,
      connection: defaultConnection,
      realtimeUnsubscribe: null,
      isNotificationCenterOpen: false,

      // User management actions
      setUserId: (userId: string) => {
        set({ userId }, false, 'setUserId');
      },

      // Data management actions
      fetchNotifications: async () => {
        const { userId, filters, pagination } = get();
        
        if (!userId) {
          set({ error: 'User not authenticated' }, false, 'fetchNotifications-no-user');
          return;
        }

        set({ loading: true, error: null }, false, 'fetchNotifications-start');
        
        try {
          const serviceFilters = { ...filters, userId };
          const result = await NotificationService.fetchNotifications(serviceFilters, pagination);
          
          // Convert to UI notifications
          const uiNotifications = result.notifications.map(convertToUINotification);
          
          // Get updated unread count
          const unreadCount = await NotificationService.getUnreadCount(userId);
          
          set({
            notifications: uiNotifications,
            pagination: {
              ...pagination,
              total: result.total,
              hasMore: result.hasMore
            },
            unreadCount,
            loading: false
          }, false, 'fetchNotifications-success');
          
        } catch (error) {
          // Fallback to mock service in development
          if (process.env.NODE_ENV === 'development') {
            console.warn('Using mock notification service as fallback');
            const { filters, pagination } = get();
            const result = await MockNotificationService.fetchNotifications(filters, pagination);
            
            set({
              notifications: result.notifications,
              pagination: {
                ...pagination,
                total: result.total,
                hasMore: result.hasMore
              },
              unreadCount: MockNotificationService.getUnreadCount(),
              loading: false
            }, false, 'fetchNotifications-mock-success');
          } else {
            set({
              loading: false,
              error: error instanceof Error ? error.message : 'Failed to fetch notifications'
            }, false, 'fetchNotifications-error');
          }
        }
      },

      refreshNotifications: async () => {
        const { fetchNotifications } = get();
        await fetchNotifications();
      },

      addNotification: async (notification: NotificationInsert) => {
        try {
          const newNotification = await NotificationService.addNotification(notification);
          
          set((state) => ({
            notifications: [newNotification, ...state.notifications],
            unreadCount: state.unreadCount + (newNotification.read ? 0 : 1)
          }), false, 'addNotification');
          
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to add notification'
          }, false, 'addNotification-error');
        }
      },

      updateNotification: async (id: string, updates: Partial<Notification>) => {
        try {
          set((state) => ({
            notifications: state.notifications.map(n =>
              n.id === id ? { ...n, ...updates } : n
            )
          }), false, 'updateNotification');
          
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update notification'
          }, false, 'updateNotification-error');
        }
      },

      deleteNotification: async (id: string) => {
        try {
          await NotificationService.deleteNotification(id);
          
          set((state) => {
            const notificationToDelete = state.notifications.find(n => n.id === id);
            const wasUnread = notificationToDelete && !notificationToDelete.read;
            
            return {
              notifications: state.notifications.filter(n => n.id !== id),
              unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount
            };
          }, false, 'deleteNotification');
          
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete notification'
          }, false, 'deleteNotification-error');
        }
      },

      // Status management actions
      markAsRead: async (id: string) => {
        try {
          await NotificationService.markAsRead(id);
          
          set((state) => {
            const notification = state.notifications.find(n => n.id === id);
            const wasUnread = notification && !notification.read;
            
            return {
              notifications: state.notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
              ),
              unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount
            };
          }, false, 'markAsRead');
          
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to mark as read'
          }, false, 'markAsRead-error');
        }
      },

      markAsUnread: async (id: string) => {
        try {
          await NotificationService.markAsUnread(id);
          
          set((state) => {
            const notification = state.notifications.find(n => n.id === id);
            const wasRead = notification && notification.read;
            
            return {
              notifications: state.notifications.map(n =>
                n.id === id ? { ...n, read: false } : n
              ),
              unreadCount: wasRead ? state.unreadCount + 1 : state.unreadCount
            };
          }, false, 'markAsUnread');
          
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to mark as unread'
          }, false, 'markAsUnread-error');
        }
      },

      markAllAsRead: async () => {
        try {
          const { notifications } = get();
          const unreadNotifications = notifications.filter(n => !n.read);
          
          // Mark all as read in parallel
          await Promise.all(
            unreadNotifications.map(n => NotificationService.markAsRead(n.id))
          );
          
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

      // Filtering and pagination actions
      setFilters: (newFilters: Partial<NotificationFilters>) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
          pagination: { ...defaultPagination } // Reset pagination when filters change
        }), false, 'setFilters');
        
        // Automatically fetch with new filters
        setTimeout(() => {
          get().fetchNotifications();
        }, 0);
      },

      resetFilters: () => {
        set({
          filters: defaultFilters,
          pagination: defaultPagination
        }, false, 'resetFilters');
        
        // Automatically fetch with reset filters
        setTimeout(() => {
          get().fetchNotifications();
        }, 0);
      },

      loadMoreNotifications: async () => {
        const { pagination, filters } = get();
        
        if (!pagination.hasMore) return;
        
        set({ loading: true }, false, 'loadMoreNotifications-start');
        
        try {
          const nextPagination = { ...pagination, page: pagination.page + 1 };
          const result = await NotificationService.fetchNotifications(filters, nextPagination);
          
          set((state) => ({
            notifications: [...state.notifications, ...result.notifications],
            pagination: {
              ...nextPagination,
              total: result.total,
              hasMore: result.hasMore
            },
            loading: false
          }), false, 'loadMoreNotifications-success');
          
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to load more notifications'
          }, false, 'loadMoreNotifications-error');
        }
      },

      // Real-time actions
      connectRealTime: () => {
        const { userId, realtimeUnsubscribe } = get();
        
        if (!userId) {
          console.warn('Cannot connect to real-time updates: no user ID');
          return;
        }
        
        // Disconnect existing connection if any
        if (realtimeUnsubscribe) {
          realtimeUnsubscribe();
        }
        
        try {
          const unsubscribe = NotificationService.subscribeToRealTimeUpdates(
            userId,
            (notification: Notification) => {
              const { handleRealTimeUpdate } = get();
              handleRealTimeUpdate(notification);
            },
            (notificationId: string) => {
              // Handle notification deletion
              set((state) => ({
                notifications: state.notifications.filter(n => n.id !== notificationId)
              }), false, 'realtime-delete');
            }
          );
          
          set((state) => ({
            connection: {
              ...state.connection,
              isConnected: true,
              lastUpdated: new Date(),
              reconnectAttempts: 0
            },
            realtimeUnsubscribe: unsubscribe
          }), false, 'connectRealTime');
          
        } catch (error) {
          console.error('Failed to connect to real-time updates:', error);
          // Fallback to mock connection in development
          if (process.env.NODE_ENV === 'development') {
            const { handleRealTimeUpdate } = get();
            RealTimeConnection.connect(handleRealTimeUpdate);
            
            set((state) => ({
              connection: {
                ...state.connection,
                isConnected: true,
                lastUpdated: new Date(),
                reconnectAttempts: 0
              }
            }), false, 'connectRealTime-mock');
          }
        }
      },

      disconnectRealTime: () => {
        const { realtimeUnsubscribe } = get();
        
        if (realtimeUnsubscribe) {
          realtimeUnsubscribe();
        }
        
        // Also disconnect mock connection
        const { handleRealTimeUpdate } = get();
        RealTimeConnection.disconnect(handleRealTimeUpdate);
        
        set((state) => ({
          connection: {
            ...state.connection,
            isConnected: false
          },
          realtimeUnsubscribe: null
        }), false, 'disconnectRealTime');
      },

      handleRealTimeUpdate: (notification: Notification) => {
        // Convert to UI notification
        const uiNotification: UINotification = {
          ...notification,
          timestamp: notification.created_at,
          type: mapNotificationTypeToUI(notification.notification_type)
        };

        set((state) => ({
          notifications: [uiNotification, ...state.notifications],
          unreadCount: state.unreadCount + (uiNotification.read ? 0 : 1),
          connection: {
            ...state.connection,
            lastUpdated: new Date()
          }
        }), false, 'handleRealTimeUpdate');
      },

      // UI management actions
      openNotificationCenter: () => {
        set({ isNotificationCenterOpen: true }, false, 'openNotificationCenter');
      },

      closeNotificationCenter: () => {
        set({ isNotificationCenterOpen: false }, false, 'closeNotificationCenter');
      },

      toggleNotificationCenter: () => {
        set((state) => ({
          isNotificationCenterOpen: !state.isNotificationCenterOpen
        }), false, 'toggleNotificationCenter');
      },

      // Utility actions
      getFilteredNotifications: () => {
        const { notifications, filters } = get();
        return notifications; // Already filtered by the service
      },

      clearError: () => {
        set({ error: null }, false, 'clearError');
      },

      reset: () => {
        const { disconnectRealTime } = get();
        disconnectRealTime();
        
        set({
          notifications: [],
          unreadCount: 0,
          loading: false,
          error: null,
          filters: defaultFilters,
          pagination: defaultPagination,
          connection: defaultConnection,
          isNotificationCenterOpen: false
        }, false, 'reset');
      }
    }),
    {
      name: 'notification-store',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
);

// Convenience hooks for common operations
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

export const useNotificationFilters = () => {
  const filters = useNotificationStore(state => state.filters);
  const setFilters = useNotificationStore(state => state.setFilters);
  const resetFilters = useNotificationStore(state => state.resetFilters);
  
  return { filters, setFilters, resetFilters };
};

export const useNotificationCenter = () => {
  const isOpen = useNotificationStore(state => state.isNotificationCenterOpen);
  const openNotificationCenter = useNotificationStore(state => state.openNotificationCenter);
  const closeNotificationCenter = useNotificationStore(state => state.closeNotificationCenter);
  const toggleNotificationCenter = useNotificationStore(state => state.toggleNotificationCenter);
  
  return { isOpen, openNotificationCenter, closeNotificationCenter, toggleNotificationCenter };
};

export const useRealTimeNotifications = () => {
  const connection = useNotificationStore(state => state.connection);
  const connectRealTime = useNotificationStore(state => state.connectRealTime);
  const disconnectRealTime = useNotificationStore(state => state.disconnectRealTime);
  
  return { connection, connectRealTime, disconnectRealTime };
};

// Export the main store as default
export default useNotificationStore;