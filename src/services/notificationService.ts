/**
 * Notification Service
 * Handles all notification-related API operations and real-time updates
 */

import { supabase } from '@/lib/supabase';
import { 
  Notification, 
  NotificationInsert, 
  NotificationType, 
  TABLE_NAMES 
} from '@/types/database';
import { AIPlanService } from './aiPlanService';

export interface NotificationFilters {
  status?: 'all' | 'unread' | 'read';
  type?: NotificationType | 'all';
  dateRange?: 'all' | 'today' | 'week' | 'month';
  project?: string | 'all';
  userId: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface NotificationResponse {
  notifications: Notification[];
  total: number;
  hasMore: boolean;
}

export class NotificationService {
  private static realtimeSubscription: any = null;

  /**
   * Fetch notifications with filtering and pagination
   */
  static async fetchNotifications(
    filters: NotificationFilters,
    pagination: PaginationOptions
  ): Promise<NotificationResponse> {
    try {
      let query = supabase
        .from(TABLE_NAMES.NOTIFICATIONS)
        .select('*', { count: 'exact' })
        .eq('user_id', filters.userId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status === 'read') {
        query = query.eq('read', true);
      } else if (filters.status === 'unread') {
        query = query.eq('read', false);
      }

      if (filters.type && filters.type !== 'all') {
        query = query.eq('notification_type', filters.type);
      }

      // Date range filter
      if (filters.dateRange && filters.dateRange !== 'all') {
        const now = new Date();
        let fromDate: Date;

        switch (filters.dateRange) {
          case 'today':
            fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          default:
            fromDate = new Date(0);
        }

        query = query.gte('created_at', fromDate.toISOString());
      }

      // Project filter (if metadata contains projectId)
      if (filters.project && filters.project !== 'all') {
        query = query.contains('metadata', { projectId: filters.project });
      }

      // Apply pagination
      const from = (pagination.page - 1) * pagination.limit;
      const to = from + pagination.limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching notifications:', error);
        throw new Error('Failed to fetch notifications');
      }

      const total = count || 0;
      const hasMore = (from + pagination.limit) < total;

      return {
        notifications: data || [],
        total,
        hasMore
      };

    } catch (error) {
      console.error('NotificationService.fetchNotifications error:', error);
      throw error;
    }
  }

  /**
   * Create a new notification
   */
  static async createNotification(notification: NotificationInsert): Promise<Notification> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.NOTIFICATIONS)
        .insert([notification])
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        throw new Error('Failed to create notification');
      }

      return data;

    } catch (error) {
      console.error('NotificationService.createNotification error:', error);
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
   * Mark notification as unread
   */
  static async markAsUnread(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(TABLE_NAMES.NOTIFICATIONS)
        .update({ read: false, updated_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as unread:', error);
        throw new Error('Failed to mark notification as unread');
      }

    } catch (error) {
      console.error('NotificationService.markAsUnread error:', error);
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
   * Get unread notification count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from(TABLE_NAMES.NOTIFICATIONS)
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.error('Error getting unread count:', error);
        return 0;
      }

      return count || 0;

    } catch (error) {
      console.error('NotificationService.getUnreadCount error:', error);
      return 0;
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

  /**
   * Unsubscribe from real-time updates
   */
  static unsubscribeFromRealTimeUpdates(): void {
    if (this.realtimeSubscription) {
      supabase.removeChannel(this.realtimeSubscription);
      this.realtimeSubscription = null;
    }
  }

  /**
   * Create AI plan generation notification
   */
  static async createAIPlanNotification(
    userId: string,
    projectId: string,
    projectName: string,
    type: 'started' | 'completed' | 'failed',
    metadata: Record<string, any> = {}
  ): Promise<Notification> {
    const notifications = {
      started: {
        title: 'AI Plan Generation Started',
        message: `AI plan generation has started for your project "${projectName}". You'll be notified when it's complete.`,
        notification_type: 'plan_generation' as NotificationType,
        action_url: `/projects/${projectId}`
      },
      completed: {
        title: 'AI Plan Generation Completed',
        message: `Your construction plan for "${projectName}" has been generated and is ready for review.`,
        notification_type: 'plan_completed' as NotificationType,
        action_url: `/projects/${projectId}/plan`
      },
      failed: {
        title: 'AI Plan Generation Failed',
        message: `Plan generation for "${projectName}" encountered an error. Please try regenerating the plan.`,
        notification_type: 'plan_failed' as NotificationType,
        action_url: `/projects/${projectId}`
      }
    };

    const config = notifications[type];
    
    const notification: NotificationInsert = {
      user_id: userId,
      title: config.title,
      message: config.message,
      notification_type: config.notification_type,
      metadata: {
        projectId,
        projectName,
        ...metadata
      },
      action_url: config.action_url,
      read: false,
      expires_at: null // Never expires
    };

    return this.createNotification(notification);
  }

  /**
   * Handle AI plan completion event
   */
  static async handleAIPlanCompletion(projectId: string, userId: string): Promise<void> {
    try {
      // This would typically be called by a webhook or background job
      // when AI plan generation is completed
      
      // Get project details (in a real app, this would fetch from database)
      const projectName = `Project ${projectId.slice(-8)}`; // Simplified for demo
      
      // Create completion notification
      await this.createAIPlanNotification(
        userId,
        projectId,
        projectName,
        'completed',
        {
          completedAt: new Date().toISOString(),
          planId: `plan_${projectId}`
        }
      );

      // Update project plan generation status
      await AIPlanService.updateProjectPlanStatus(projectId, 'completed');

    } catch (error) {
      console.error('Error handling AI plan completion:', error);
    }
  }

  /**
   * Handle AI plan failure event
   */
  static async handleAIPlanFailure(
    projectId: string, 
    userId: string, 
    errorMessage: string
  ): Promise<void> {
    try {
      const projectName = `Project ${projectId.slice(-8)}`; // Simplified for demo
      
      // Create failure notification
      await this.createAIPlanNotification(
        userId,
        projectId,
        projectName,
        'failed',
        {
          error: errorMessage,
          failedAt: new Date().toISOString()
        }
      );

      // Update project plan generation status
      await AIPlanService.updateProjectPlanStatus(projectId, 'failed');

    } catch (error) {
      console.error('Error handling AI plan failure:', error);
    }
  }

  /**
   * Get all unique projects from notifications for filtering
   */
  static async getProjectsFromNotifications(userId: string): Promise<Array<{ id: string; name: string }>> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.NOTIFICATIONS)
        .select('metadata')
        .eq('user_id', userId)
        .not('metadata->>projectId', 'is', null);

      if (error) {
        console.error('Error fetching projects from notifications:', error);
        return [];
      }

      const projects = new Map<string, string>();
      
      data?.forEach((notification) => {
        const projectId = notification.metadata?.projectId;
        const projectName = notification.metadata?.projectName;
        
        if (projectId && projectName) {
          projects.set(projectId, projectName);
        }
      });

      return Array.from(projects.entries()).map(([id, name]) => ({ id, name }));

    } catch (error) {
      console.error('NotificationService.getProjectsFromNotifications error:', error);
      return [];
    }
  }
}

export default NotificationService;