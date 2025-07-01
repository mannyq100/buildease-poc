import React, { useEffect, useState } from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Filter, 
  Search, 
  MoreVertical, 
  Check, 
  Trash2, 
  RefreshCw,
  X,
  ChevronDown,
  Settings,
  Archive
} from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

import { NotificationCard } from '@/components/shared/NotificationCard';
import { cn } from '@/utils/core/ui';
import { 
  useNotifications, 
  useNotificationActions, 
  useNotificationFilters,
  useNotificationStore,
  NotificationFilters
} from '@/stores/notificationStore';
import { NotificationType } from '@/types/database';

export interface NotificationCenterProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  maxHeight?: string;
}

/**
 * NotificationCenter component for managing and displaying notifications
 * Features:
 * - Real-time notification updates
 * - Advanced filtering (status, type, date, project)
 * - Pagination with infinite scroll
 * - Bulk actions (mark all read, delete)
 * - Mobile-responsive design
 * - BuildEase theming
 */
export function NotificationCenter({ 
  className, 
  isOpen = true, 
  onClose,
  maxHeight = "500px" 
}: NotificationCenterProps) {
  const { notifications, unreadCount, loading, error } = useNotifications();
  const { fetchNotifications, markAsRead, markAllAsRead, deleteNotification } = useNotificationActions();
  const { filters, setFilters, resetFilters } = useNotificationFilters();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  
  const pagination = useNotificationStore(state => state.pagination);
  const loadMoreNotifications = useNotificationStore(state => state.loadMoreNotifications);

  // Initialize notifications on mount
  useEffect(() => {
    if (isOpen && notifications.length === 0) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Filter notifications based on search term
  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (notification.project && notification.project.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle notification click
  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Navigate to action URL if available
    if (notification.action_url) {
      // In a real app, you would use react-router navigation
      console.log('Navigate to:', notification.action_url);
    }
  };

  // Handle bulk actions
  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleBulkMarkAsRead = async () => {
    const unreadSelected = selectedNotifications.filter(id => {
      const notification = notifications.find(n => n.id === id);
      return notification && !notification.read;
    });
    
    await Promise.all(unreadSelected.map(id => markAsRead(id)));
    setSelectedNotifications([]);
  };

  const handleBulkDelete = async () => {
    await Promise.all(selectedNotifications.map(id => deleteNotification(id)));
    setSelectedNotifications([]);
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof NotificationFilters, value: any) => {
    setFilters({ [key]: value });
  };

  // Load more notifications when scrolling
  const handleLoadMore = () => {
    if (pagination.hasMore && !loading) {
      loadMoreNotifications();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={cn(
      "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg",
      "flex flex-col overflow-hidden",
      className
    )} style={{ maxHeight }}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {unreadCount}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            {/* Refresh button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchNotifications()}
              disabled={loading}
              className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full p-2"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
            
            {/* Filter toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full p-2",
                showFilters && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              )}
            >
              <Filter className="h-4 w-4" />
            </Button>
            
            {/* More actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full p-2"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => markAllAsRead()}>
                  <Check className="h-4 w-4 mr-2" />
                  Mark all as read
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => resetFilters()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset filters
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Notification settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Close button */}
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-600"
          />
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <m.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.type}
                  onValueChange={(value) => handleFilterChange('type', value as NotificationType | 'all')}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="plan_completed">Plan Completed</SelectItem>
                    <SelectItem value="plan_generation">Plan Generation</SelectItem>
                    <SelectItem value="plan_failed">Plan Failed</SelectItem>
                    <SelectItem value="project_update">Project Update</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.dateRange}
                  onValueChange={(value) => handleFilterChange('dateRange', value)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => resetFilters()}
                  className="h-8 text-xs"
                >
                  Clear
                </Button>
              </div>
            </m.div>
          )}
        </AnimatePresence>

        {/* Bulk actions */}
        {selectedNotifications.length > 0 && (
          <div className="mt-3 flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <span className="text-sm text-blue-700 dark:text-blue-400">
              {selectedNotifications.length} selected
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBulkMarkAsRead}
                className="text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/40 h-7 px-2 text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark read
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBulkDelete}
                className="text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800/40 h-7 px-2 text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <ScrollArea className="h-full">
          <div className="p-2">
            {loading && notifications.length === 0 ? (
              // Loading skeleton
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              // Empty state
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-12 w-12 text-gray-400 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {searchTerm ? 'No matching notifications' : 'No notifications yet'}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                  {searchTerm 
                    ? 'Try adjusting your search terms or filters'
                    : 'You\'ll see notifications here when there are updates to your projects'
                  }
                </p>
                {searchTerm && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchTerm('')}
                    className="mt-4"
                  >
                    Clear search
                  </Button>
                )}
              </div>
            ) : (
              // Notifications list
              <div className="space-y-2">
                <AnimatePresence>
                  {filteredNotifications.map((notification) => (
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
                        className={cn(
                          "cursor-pointer transition-all duration-200 hover:shadow-md",
                          selectedNotifications.includes(notification.id) && "ring-2 ring-blue-500 ring-opacity-50"
                        )}
                      />
                    </m.div>
                  ))}
                </AnimatePresence>

                {/* Load more button */}
                {pagination.hasMore && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="text-xs"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3 mr-2" />
                          Load more
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              Showing {filteredNotifications.length} of {pagination.total} notifications
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-6 px-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <Archive className="h-3 w-3 mr-1" />
              Archive all
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;