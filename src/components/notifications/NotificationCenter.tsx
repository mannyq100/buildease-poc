import React, { useEffect } from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { Bell, Check, RefreshCw, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

import { NotificationCard } from '@/components/shared/NotificationCard';
import { cn } from '@/utils/core/ui';
import { useNotifications, useNotificationActions } from '@/stores/notificationStore';

export interface NotificationCenterProps {
  className?: string;
  onClose?: () => void;
  maxHeight?: string;
}

/**
 * Simplified NotificationCenter component
 * Features:
 * - Real-time notification updates
 * - Basic mark read/delete actions
 * - Clean BuildEase design
 */
export function NotificationCenter({ 
  className, 
  onClose,
  maxHeight = "400px" 
}: NotificationCenterProps) {
  const { notifications, unreadCount, loading, error } = useNotifications();
  const { fetchNotifications, markAsRead, markAllAsRead, deleteNotification } = useNotificationActions();

  // Initialize notifications on mount
  useEffect(() => {
    if (notifications.length === 0) {
      fetchNotifications();
    }
  }, [fetchNotifications]);

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Navigate to action URL if available
    if (notification.action_url) {
      // In a real app, you would use react-router navigation
      console.log('Navigate to:', notification.action_url);
    }
  };

  return (
    <div className={cn(
      "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg",
      "flex flex-col overflow-hidden",
      className
    )} style={{ maxHeight }}>
      {/* Header with BuildEase styling */}
      <div className="bg-gradient-to-r from-[#2B6CB0] to-[#2B6CB0]/90 px-4 py-3 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Badge className="bg-orange-500 text-white text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchNotifications()}
              disabled={loading}
              className="text-white/70 hover:text-white hover:bg-white/10 rounded-full p-1.5"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
              className="text-white/70 hover:text-white hover:bg-white/10 rounded-full p-1.5"
            >
              <Check className="h-4 w-4" />
            </Button>
            
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-full p-1.5"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 bg-gray-50 dark:bg-gray-900/30">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <ScrollArea className="h-full">
          <div className="p-3">
            {loading && notifications.length === 0 ? (
              // Loading skeleton
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              // Empty state
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="h-10 w-10 text-gray-400 mb-3" />
                <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No notifications yet
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  You'll see notifications here when there are updates to your projects
                </p>
              </div>
            ) : (
              // Notifications list
              <div className="space-y-2">
                <AnimatePresence>
                  {notifications.map((notification) => (
                    <m.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <NotificationCard
                        notification={notification}
                        onClick={() => handleNotificationClick(notification)}
                        onMarkAsRead={markAsRead}
                        onDismiss={deleteNotification}
                        className="cursor-pointer transition-all duration-200 hover:shadow-md"
                      />
                    </m.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

export default NotificationCenter;