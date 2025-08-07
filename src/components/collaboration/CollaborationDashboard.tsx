/**
 * CollaborationDashboard Component
 * Central dashboard for managing all real-time collaboration features
 * Shows project-wide collaboration activity and team presence
 */

import { useState } from 'react';
import { useRealTimeCollaboration } from '@/hooks/useRealTimeCollaboration';
import { PresenceIndicator } from './PresenceIndicator';
import { RealTimeNotifications } from './RealTimeNotifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Users, 
  Activity, 
  MessageCircle, 
  Eye,
  Clock,
  MapPin,
  Zap,
  TrendingUp,
  Calendar,
  Globe
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { UserPresence, CollaborationEvent } from '@/services/websocketService';

interface CollaborationDashboardProps {
  projectId: string;
  className?: string;
}

interface ActivityItem {
  id: string;
  type: 'join' | 'leave' | 'comment' | 'edit' | 'view';
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export function CollaborationDashboard({
  projectId,
  className = ''
}: CollaborationDashboardProps) {
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('6h');

  // Real-time collaboration for the entire project
  const {
    isConnected,
    isJoined,
    users,
    currentUser,
    otherUsers,
    onlineCount,
    broadcastEvent
  } = useRealTimeCollaboration({
    roomId: `project-${projectId}`,
    roomType: 'project',
    entityId: projectId,
    enabled: true,
    onEvent: handleCollaborationEvent,
    onUserJoin: handleUserJoin,
    onUserLeave: handleUserLeave
  });

  // Handle collaboration events
  function handleCollaborationEvent(event: CollaborationEvent) {
    const activity: ActivityItem = {
      id: `event-${Date.now()}-${Math.random()}`,
      type: getActivityType(event.type),
      user: {
        id: event.user_id,
        name: event.user_name || 'Unknown User'
      },
      description: getActivityDescription(event),
      timestamp: event.timestamp,
      metadata: event.payload
    };

    addActivity(activity);
  }

  // Handle user join
  function handleUserJoin(user: UserPresence) {
    const activity: ActivityItem = {
      id: `join-${user.user_id}-${Date.now()}`,
      type: 'join',
      user: {
        id: user.user_id,
        name: user.user_name,
        avatar: user.user_avatar
      },
      description: `${user.user_name} joined the project`,
      timestamp: new Date().toISOString()
    };

    addActivity(activity);
  }

  // Handle user leave
  function handleUserLeave(user: UserPresence) {
    const activity: ActivityItem = {
      id: `leave-${user.user_id}-${Date.now()}`,
      type: 'leave',
      user: {
        id: user.user_id,
        name: user.user_name,
        avatar: user.user_avatar
      },
      description: `${user.user_name} left the project`,
      timestamp: new Date().toISOString()
    };

    addActivity(activity);
  }

  // Add activity to feed
  const addActivity = (activity: ActivityItem) => {
    setActivityFeed(prev => [activity, ...prev.slice(0, 49)]); // Keep last 50 activities
  };

  // Get activity type from collaboration event
  const getActivityType = (eventType: CollaborationEvent['type']): ActivityItem['type'] => {
    if (eventType.includes('comment')) return 'comment';
    if (eventType.includes('user_joined')) return 'join';
    if (eventType.includes('user_left')) return 'leave';
    if (eventType.includes('cursor') || eventType.includes('typing')) return 'view';
    return 'edit';
  };

  // Get activity description
  const getActivityDescription = (event: CollaborationEvent): string => {
    const userName = event.user_name || 'Someone';
    
    switch (event.type) {
      case 'comment_added':
        return `${userName} added a comment`;
      case 'comment_updated':
        return `${userName} updated a comment`;
      case 'comment_deleted':
        return `${userName} deleted a comment`;
      case 'document_updated':
        return `${userName} updated a document`;
      case 'cursor_moved':
        return `${userName} is viewing the project`;
      case 'typing_started':
        return `${userName} started typing`;
      case 'project_activity':
        return `${userName} made changes to the project`;
      default:
        return `${userName} performed an action`;
    }
  };

  // Get activity icon
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'join': return <Users className="h-3 w-3 text-green-600" />;
      case 'leave': return <Users className="h-3 w-3 text-gray-600" />;
      case 'comment': return <MessageCircle className="h-3 w-3 text-blue-600" />;
      case 'edit': return <Activity className="h-3 w-3 text-purple-600" />;
      case 'view': return <Eye className="h-3 w-3 text-yellow-600" />;
      default: return <Zap className="h-3 w-3 text-gray-600" />;
    }
  };

  // Get user initials
  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Filter activities by time range
  const filteredActivities = activityFeed.filter(activity => {
    const activityTime = new Date(activity.timestamp);
    const now = new Date();
    const hoursAgo = {
      '1h': 1,
      '6h': 6,
      '24h': 24,
      '7d': 24 * 7
    }[selectedTimeRange];
    
    return now.getTime() - activityTime.getTime() < hoursAgo * 60 * 60 * 1000;
  });

  // Get active users by location/page
  const usersByLocation = users.reduce((acc, user) => {
    const location = user.current_page || 'Unknown';
    if (!acc[location]) acc[location] = [];
    acc[location].push(user);
    return acc;
  }, {} as Record<string, UserPresence[]>);

  // Calculate collaboration stats
  const stats = {
    totalUsers: users.length,
    onlineUsers: users.filter(u => u.status === 'online').length,
    activeToday: activityFeed.filter(a => {
      const activityTime = new Date(a.timestamp);
      const today = new Date();
      return activityTime.toDateString() === today.toDateString();
    }).length,
    totalActivity: activityFeed.length
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Collaboration Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time project collaboration and team activity
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <RealTimeNotifications projectId={projectId} />
          <PresenceIndicator
            roomId={`project-${projectId}`}
            roomType="project"
            entityId={projectId}
          />
        </div>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Connecting to collaboration services...</p>
                <p className="text-sm text-yellow-600">Some features may be limited until connected.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Online Now</p>
                <p className="text-2xl font-bold">{stats.onlineUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Today</p>
                <p className="text-2xl font-bold">{stats.activeToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Activity</p>
                <p className="text-2xl font-bold">{stats.totalActivity}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Team Members</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Activity Feed</TabsTrigger>
          <TabsTrigger value="presence">Team Presence</TabsTrigger>
          <TabsTrigger value="locations">Active Locations</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          {/* Time Range Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show activity from:</span>
            {(['1h', '6h', '24h', '7d'] as const).map((range) => (
              <Button
                key={range}
                variant={selectedTimeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeRange(range)}
                className="text-xs"
              >
                {range === '1h' ? 'Last Hour' :
                 range === '6h' ? 'Last 6 Hours' :
                 range === '24h' ? 'Last 24 Hours' :
                 'Last 7 Days'}
              </Button>
            ))}
          </div>

          {/* Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {filteredActivities.length > 0 ? (
                  <div className="space-y-4">
                    {filteredActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={activity.user.avatar} />
                          <AvatarFallback className="text-xs">
                            {getUserInitials(activity.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {getActivityIcon(activity.type)}
                            <p className="text-sm">
                              <span className="font-medium">{activity.user.name}</span>
                              <span className="text-muted-foreground ml-1">
                                {activity.description.split(activity.user.name)[1]}
                              </span>
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No activity in selected time range</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="presence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Team Presence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.user_id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.user_avatar} />
                        <AvatarFallback>
                          {getUserInitials(user.user_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div 
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${
                          user.status === 'online' ? 'bg-green-500' :
                          user.status === 'away' ? 'bg-yellow-500' :
                          'bg-gray-400'
                        }`}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{user.user_name}</p>
                        <Badge 
                          variant={user.status === 'online' ? 'default' : 'secondary'}
                          className="text-xs capitalize"
                        >
                          {user.status}
                        </Badge>
                        {user.is_typing && (
                          <Badge variant="outline" className="text-xs">
                            typing...
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        {user.current_page && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{user.current_page}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatDistanceToNow(new Date(user.last_seen), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {users.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No team members online</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(usersByLocation).map(([location, locationUsers]) => (
                  <div key={location} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{location}</span>
                      </div>
                      <Badge variant="secondary">{locationUsers.length} user{locationUsers.length !== 1 ? 's' : ''}</Badge>
                    </div>
                    
                    <div className="flex -space-x-2">
                      {locationUsers.slice(0, 5).map((user) => (
                        <TooltipProvider key={user.user_id}>
                          <Tooltip>
                            <TooltipTrigger>
                              <Avatar className="h-6 w-6 border-2 border-background">
                                <AvatarImage src={user.user_avatar} />
                                <AvatarFallback className="text-xs">
                                  {getUserInitials(user.user_name)}
                                </AvatarFallback>
                              </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>
                              {user.user_name} ({user.status})
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                      {locationUsers.length > 5 && (
                        <div className="flex items-center justify-center h-6 w-6 bg-muted border-2 border-background rounded-full text-xs">
                          +{locationUsers.length - 5}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {Object.keys(usersByLocation).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No active locations</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}