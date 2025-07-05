/**
 * Simplified Notification Service
 * Essential notification operations with Supabase
 */

import { supabase } from '@/lib/supabase';
import { Notification, TABLE_NAMES } from '@/types/database';

export interface NotificationResponse {
  notifications: Notification[];
}

export class NotificationService {
  private static realtimeSubscription: any = null;

  /**
   * Fetch recent notifications for a user
   */
  static async fetchNotifications(userId: string, limit: number = 20): Promise<NotificationResponse> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.NOTIFICATIONS)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching notifications:', error);
        
        // If table doesn't exist, return empty array instead of throwing
        if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
          console.warn('Notifications table does not exist yet. Run migration 022_notifications_table.sql');
          return { notifications: [] };
        }
        
        throw new Error('Failed to fetch notifications');
      }

      return { notifications: data || [] };

    } catch (error) {
      console.error('NotificationService.fetchNotifications error:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(TABLE_NAMES.NOTIFICATIONS)
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        throw new Error('Failed to mark notification as read');
      }

    } catch (error) {
      console.error('NotificationService.markAsRead error:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(TABLE_NAMES.NOTIFICATIONS)
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        throw new Error('Failed to mark all notifications as read');
      }

    } catch (error) {
      console.error('NotificationService.markAllAsRead error:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(TABLE_NAMES.NOTIFICATIONS)
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error deleting notification:', error);
        throw new Error('Failed to delete notification');
      }

    } catch (error) {
      console.error('NotificationService.deleteNotification error:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time notification updates
   */
  static subscribeToRealTimeUpdates(
    userId: string,
    onUpdate: (notification: Notification) => void,
    onDelete: (notificationId: string) => void
  ): () => void {
    try {
      this.realtimeSubscription = supabase
        .channel('notification-updates')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: TABLE_NAMES.NOTIFICATIONS,
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            onUpdate(payload.new as Notification);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: TABLE_NAMES.NOTIFICATIONS,
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            onUpdate(payload.new as Notification);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: TABLE_NAMES.NOTIFICATIONS,
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            onDelete(payload.old.id);
          }
        )
        .subscribe();

      // Return unsubscribe function
      return () => {
        if (this.realtimeSubscription) {
          supabase.removeChannel(this.realtimeSubscription);
          this.realtimeSubscription = null;
        }
      };

    } catch (error) {
      console.error('Error subscribing to real-time updates:', error);
      return () => {}; // Return empty cleanup function
    }
  }
}

export default NotificationService;