/**
 * Test component to verify Phase 2 notification system implementation
 * This can be temporarily added to a page to test the notification functionality
 */

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  useNotifications, 
  useNotificationActions, 
  useNotificationStore 
} from '@/stores/notificationStore';
import NotificationService from '@/services/notificationService';
import { NotificationInsert } from '@/types/database';

export function NotificationSystemTest() {
  const { notifications, unreadCount, loading, error } = useNotifications();
  const { fetchNotifications, markAsRead, markAllAsRead } = useNotificationActions();
  const setUserId = useNotificationStore(state => state.setUserId);
  const userId = useNotificationStore(state => state.userId);

  // Initialize with test user ID
  useEffect(() => {
    if (!userId) {
      setUserId('test-user-123');
    }
  }, [userId, setUserId]);

  // Test creating notifications
  const createTestNotification = async () => {
    if (!userId) return;

    const testNotification: NotificationInsert = {
      user_id: userId,
      title: 'Test Notification',
      message: `This is a test notification created at ${new Date().toLocaleTimeString()}`,
      notification_type: 'general',
      metadata: {
        testData: true,
        createdAt: new Date().toISOString()
      },
      action_url: '/test',
      read: false,
      expires_at: null
    };

    try {
      await NotificationService.createNotification(testNotification);
      console.log('✅ Test notification created');
      // Refresh to show the new notification
      await fetchNotifications();
    } catch (error) {
      console.error('❌ Failed to create test notification:', error);
    }
  };

  const createAIPlanNotification = async () => {
    if (!userId) return;

    try {
      await NotificationService.createAIPlanNotification(
        userId,
        'test-project-123',
        'Test Project',
        'completed'
      );
      console.log('✅ AI plan notification created');
      await fetchNotifications();
    } catch (error) {
      console.error('❌ Failed to create AI plan notification:', error);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto my-8">
      <h2 className="text-2xl font-bold mb-4">Notification System Test</h2>
      
      <div className="space-y-4">
        <div>
          <p><strong>User ID:</strong> {userId || 'Not set'}</p>
          <p><strong>Notifications Count:</strong> {notifications.length}</p>
          <p><strong>Unread Count:</strong> {unreadCount}</p>
          <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
          <p><strong>Error:</strong> {error || 'None'}</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button onClick={fetchNotifications} disabled={loading}>
            Fetch Notifications
          </Button>
          <Button onClick={createTestNotification} variant="outline">
            Create Test Notification
          </Button>
          <Button onClick={createAIPlanNotification} variant="outline">
            Create AI Plan Notification
          </Button>
          <Button onClick={markAllAsRead} variant="secondary">
            Mark All Read
          </Button>
        </div>

        <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
          <h3 className="font-semibold mb-2">Notifications:</h3>
          {notifications.length === 0 ? (
            <p className="text-gray-500">No notifications</p>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border rounded ${
                    notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{notification.title}</h4>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark Read
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default NotificationSystemTest;