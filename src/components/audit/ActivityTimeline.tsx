/**
 * ActivityTimeline Component
 * Visual timeline of project activities with interactive timeline navigation
 * Optimized for construction project progress tracking
 */

import { useState, useEffect, useMemo } from 'react';
import { auditService, type AuditLogEntry, type AuditFilters } from '@/services/auditService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Clock,
  Users,
  FileText,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { format, startOfDay, subDays, differenceInDays } from 'date-fns';
import { toast } from 'sonner';
import { SEVERITY_INDICATOR_COLORS, ACTION_ICONS } from '@/constants/auditConstants';
import { getUserInitials } from '@/utils/auditUtils';

interface ActivityTimelineProps {
  projectId: string;
  className?: string;
  maxHeight?: string;
  showFilters?: boolean;
  enableZoom?: boolean;
}

interface TimelineGroup {
  date: string;
  displayDate: string;
  entries: AuditLogEntry[];
  stats: {
    totalActions: number;
    users: string[];
    severityCounts: Record<string, number>;
    categories: string[];
  };
}

interface ZoomLevel {
  key: string;
  label: string;
  days: number;
  groupBy: 'hour' | 'day' | 'week';
}

const ZOOM_LEVELS: ZoomLevel[] = [
  { key: '1d', label: 'Last 24 Hours', days: 1, groupBy: 'hour' },
  { key: '7d', label: 'Last 7 Days', days: 7, groupBy: 'day' },
  { key: '30d', label: 'Last 30 Days', days: 30, groupBy: 'day' },
  { key: '90d', label: 'Last 3 Months', days: 90, groupBy: 'week' }
];

// Using ACTION_ICONS and SEVERITY_INDICATOR_COLORS from constants

export function ActivityTimeline({
  projectId,
  className = '',
  maxHeight = '600px',
  showFilters = true,
  enableZoom = true
}: ActivityTimelineProps) {
  const [activities, setActivities] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(ZOOM_LEVELS[1]); // Default to 7 days
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');

  // Load activities based on zoom level
  const loadActivities = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const endDate = new Date();
      const startDate = subDays(endDate, zoomLevel.days);

      const filters: AuditFilters = {
        projectId,
        dateFrom: startDate.toISOString(),
        dateTo: endDate.toISOString(),
        actionCategory: selectedCategory !== 'all' ? selectedCategory as any : undefined,
        userId: selectedUser !== 'all' ? selectedUser : undefined,
        limit: 1000
      };

      const result = await auditService.getAuditLogs(filters);
      setActivities(result.data);
    } catch (err) {
      console.error('Failed to load activities:', err);
      setError(err instanceof Error ? err.message : 'Failed to load activities');
      toast.error('Failed to load timeline data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when dependencies change
  useEffect(() => {
    loadActivities();
  }, [projectId, zoomLevel, selectedCategory, selectedUser]);

  // Group activities by time period
  const timelineGroups = useMemo((): TimelineGroup[] => {
    const groups: Record<string, AuditLogEntry[]> = {};

    activities.forEach(activity => {
      let groupKey: string;
      const activityDate = new Date(activity.created_at);

      switch (zoomLevel.groupBy) {
        case 'hour':
          groupKey = format(activityDate, 'yyyy-MM-dd-HH');
          break;
        case 'day':
          groupKey = format(activityDate, 'yyyy-MM-dd');
          break;
        case 'week':
          const weekStart = startOfDay(activityDate);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          groupKey = format(weekStart, 'yyyy-MM-dd');
          break;
        default:
          groupKey = format(activityDate, 'yyyy-MM-dd');
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(activity);
    });

    // Convert to timeline groups with stats
    const timelineGroups: TimelineGroup[] = Object.entries(groups)
      .map(([dateKey, entries]) => {
        const date = new Date(dateKey + (zoomLevel.groupBy === 'hour' ? ':00:00' : ''));
        const users = [...new Set(entries.map(e => e.user_name))];
        
        const severityCounts = entries.reduce((acc, entry) => {
          acc[entry.severity] = (acc[entry.severity] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const categories = [...new Set(entries.map(e => e.action_category))];

        let displayDate: string;
        switch (zoomLevel.groupBy) {
          case 'hour':
            displayDate = format(date, 'MMM dd, HH:mm');
            break;
          case 'week':
            const weekEnd = new Date(date);
            weekEnd.setDate(weekEnd.getDate() + 6);
            displayDate = `${format(date, 'MMM dd')} - ${format(weekEnd, 'MMM dd')}`;
            break;
          default:
            displayDate = format(date, 'MMM dd, yyyy');
        }

        return {
          date: dateKey,
          displayDate,
          entries: entries.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          ),
          stats: {
            totalActions: entries.length,
            users,
            severityCounts,
            categories
          }
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));

    return timelineGroups;
  }, [activities, zoomLevel]);

  // Get unique users for filter
  const uniqueUsers = useMemo(() => {
    const users = [...new Set(activities.map(a => a.user_name))];
    return users.sort();
  }, [activities]);

  // Get unique categories for filter
  const uniqueCategories = useMemo(() => {
    const categories = [...new Set(activities.map(a => a.action_category))];
    return categories.sort();
  }, [activities]);

  // Using getUserInitials from utils

  // Get action icon
  const getActionIcon = (action: string) => {
    return ACTION_ICONS[action as keyof typeof ACTION_ICONS] || '📄';
  };

  // Get relative time description
  const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = differenceInDays(now, date);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-destructive" />
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={loadActivities} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Project Activity Timeline</h3>
          <p className="text-sm text-muted-foreground">
            Visual timeline of all project activities and changes
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadActivities}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Zoom Level */}
              {enableZoom && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Time Range:</span>
                  <Select
                    value={zoomLevel.key}
                    onValueChange={(value) => {
                      const newZoom = ZOOM_LEVELS.find(z => z.key === value);
                      if (newZoom) setZoomLevel(newZoom);
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ZOOM_LEVELS.map((zoom) => (
                        <SelectItem key={zoom.key} value={zoom.key}>
                          {zoom.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Category:</span>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {uniqueCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* User Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">User:</span>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {uniqueUsers.map((user) => (
                      <SelectItem key={user} value={user}>
                        {user}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Activity Stats */}
              <div className="flex items-center gap-4 ml-auto text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {activities.length} activities
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {uniqueUsers.length} users
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Loading timeline...</span>
            </div>
          ) : timelineGroups.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No activities found for the selected time range</p>
            </div>
          ) : (
            <ScrollArea style={{ height: maxHeight }}>
              <div className="p-6">
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
                  
                  {/* Timeline groups */}
                  <div className="space-y-8">
                    {timelineGroups.map((group, groupIndex) => (
                      <div key={group.date} className="relative">
                        {/* Timeline marker */}
                        <div className="absolute left-5 w-3 h-3 bg-primary rounded-full border-2 border-background z-10" />
                        
                        {/* Group header */}
                        <div className="ml-12 mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium">{group.displayDate}</h4>
                              <p className="text-sm text-muted-foreground">
                                {getRelativeTime(group.date)}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">
                                {group.stats.totalActions} activities
                              </Badge>
                              <Badge variant="outline">
                                {group.stats.users.length} user{group.stats.users.length !== 1 ? 's' : ''}
                              </Badge>
                            </div>
                          </div>
                          
                          {/* Severity indicators */}
                          <div className="flex items-center gap-1">
                            {Object.entries(group.stats.severityCounts).map(([severity, count]) => (
                              <TooltipProvider key={severity}>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <div 
                                      className={`w-2 h-2 rounded-full ${SEVERITY_INDICATOR_COLORS[severity as keyof typeof SEVERITY_INDICATOR_COLORS]}`}
                                      style={{ width: Math.max(8, Math.min(16, count * 2)) }}
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {count} {severity} severity events
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ))}
                          </div>
                        </div>
                        
                        {/* Activity entries */}
                        <div className="ml-12 space-y-3">
                          {group.entries.slice(0, 10).map((entry, entryIndex) => (
                            <div
                              key={entry.id}
                              className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                            >
                              <div className="text-lg">{getActionIcon(entry.action)}</div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs">
                                      {getUserInitials(entry.user_name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium text-sm">{entry.user_name}</span>
                                  <Badge
                                    variant="secondary"
                                    className={`text-xs ${
                                      entry.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                      entry.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                                      entry.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-blue-100 text-blue-800'
                                    }`}
                                  >
                                    {entry.severity}
                                  </Badge>
                                  {entry.compliance_relevant && (
                                    <Badge variant="outline" className="text-xs">
                                      Compliance
                                    </Badge>
                                  )}
                                </div>
                                
                                <p className="text-sm text-muted-foreground mb-1">
                                  {entry.description}
                                </p>
                                
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span>{format(new Date(entry.created_at), 'HH:mm:ss')}</span>
                                  <span>•</span>
                                  <span className="capitalize">{entry.action_category}</span>
                                  {entry.entity_type && (
                                    <>
                                      <span>•</span>
                                      <span>{entry.entity_type}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {/* Show more indicator */}
                          {group.entries.length > 10 && (
                            <div className="text-center py-2">
                              <Badge variant="outline" className="text-xs">
                                +{group.entries.length - 10} more activities
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}