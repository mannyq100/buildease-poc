/**
 * RecentUpdatesCard - Shows recent project activity and updates
 * Displays timeline of project events, document uploads, and status changes
 * Mobile-first responsive design optimized for construction workflows
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRecentProjectActivities } from '@/hooks/queries/useProjectActivities';
import { 
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  ImageIcon,
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  Info,
  Upload,
  Edit,
  DollarSign,
  Users,
  Hammer,
  Trash2,
  Plus
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  updated_at: string;
  created_at: string;
}

import type { ProjectActivity, ActivityType } from '@/types/database';

interface UpdateItem {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  timestamp: string;
  user?: string;
  icon: React.ReactNode;
  status: 'success' | 'info' | 'warning' | 'error';
  metadata?: Record<string, any>;
}

interface RecentUpdatesCardProps {
  project: Project;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}

export function RecentUpdatesCard({ 
  project, 
  isExpanded = false, 
  onToggleExpanded 
}: RecentUpdatesCardProps) {
  const [showAll, setShowAll] = useState(false);
  
  // Fetch real project activities with real-time updates
  const { data: activities = [], isLoading } = useRecentProjectActivities(project.id, 20, true);

  // Convert ActivityType to appropriate icon
  const getActivityIcon = (activityType: ActivityType): React.ReactNode => {
    switch (activityType) {
      case 'document_upload':
        return <FileText className="h-4 w-4" />;
      case 'document_delete':
        return <Trash2 className="h-4 w-4" />;
      case 'expense_create':
      case 'expense_update':
      case 'budget_update':
        return <DollarSign className="h-4 w-4" />;
      case 'expense_delete':
        return <Trash2 className="h-4 w-4" />;
      case 'phase_create':
      case 'phase_update':
        return <Hammer className="h-4 w-4" />;
      case 'phase_delete':
        return <Trash2 className="h-4 w-4" />;
      case 'task_create':
      case 'task_update':
        return <Plus className="h-4 w-4" />;
      case 'task_complete':
        return <CheckCircle className="h-4 w-4" />;
      case 'team_member_add':
        return <Users className="h-4 w-4" />;
      case 'team_member_remove':
        return <Trash2 className="h-4 w-4" />;
      case 'status_change':
        return <AlertCircle className="h-4 w-4" />;
      case 'project_update':
        return <Edit className="h-4 w-4" />;
      case 'image_upload':
        return <ImageIcon className="h-4 w-4" />;
      case 'inspection':
        return <CheckCircle className="h-4 w-4" />;
      case 'delivery':
        return <Upload className="h-4 w-4" />;
      case 'weather_delay':
        return <AlertCircle className="h-4 w-4" />;
      case 'material_add':
      case 'material_update':
        return <Hammer className="h-4 w-4" />;
      case 'system':
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  // Convert ProjectActivity to UpdateItem
  const convertActivityToUpdateItem = (activity: ProjectActivity): UpdateItem => {
    return {
      id: activity.id,
      type: activity.activity_type,
      title: activity.title,
      description: activity.description || undefined,
      timestamp: activity.created_at,
      user: activity.user_name || undefined,
      icon: getActivityIcon(activity.activity_type),
      status: activity.status,
      metadata: activity.metadata
    };
  };

  // Convert activities to update items
  const recentUpdates = useMemo((): UpdateItem[] => {
    return activities.map(convertActivityToUpdateItem);
  }, [activities]);

  const displayedUpdates = showAll ? recentUpdates : recentUpdates.slice(0, 3);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else {
      return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    }
  };

  const getStatusColor = (status: UpdateItem['status']) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-amber-600 bg-amber-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'info':
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getStatusDotColor = (status: UpdateItem['status']) => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-amber-500';
      case 'error': return 'bg-red-500';
      case 'info':
      default: return 'bg-blue-500';
    }
  };

  return (
    <Card className="border-slate-200/40 shadow-xl bg-gradient-to-br from-white via-slate-50/30 to-emerald-50/20 backdrop-blur-md rounded-2xl overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onToggleExpanded}
            className="flex items-center gap-3 text-left group hover:bg-slate-50/50 -m-2 p-2 rounded-lg transition-colors"
          >
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl group-hover:scale-105 transition-transform">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">Recent Updates</CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                {!isExpanded 
                  ? `${recentUpdates.length} recent activities` 
                  : 'Latest project activity and changes'
                }
              </p>
            </div>
            <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : 'rotate-0'}`} />
          </button>
          
          {isExpanded && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Last 7 days
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-slate-500">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50 animate-spin" />
              <p className="font-medium mb-1">Loading recent updates...</p>
              <p className="text-sm">Fetching latest project activity</p>
            </div>
          ) : recentUpdates.length > 0 ? (
            <>
              {/* Updates Timeline */}
              <div className="space-y-4">
                {displayedUpdates.map((update, index) => (
                  <div key={update.id} className="flex items-start gap-4 p-4 bg-white/60 rounded-xl border border-slate-100/50 hover:bg-white/80 transition-colors">
                    {/* Timeline dot and line */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(update.status)}`}>
                        {update.icon}
                      </div>
                      {index < displayedUpdates.length - 1 && (
                        <div className="w-px h-6 bg-slate-200 mt-2" />
                      )}
                    </div>
                    
                    {/* Update content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-slate-900 truncate">
                            {update.title}
                          </h4>
                          {update.description && (
                            <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                              {update.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                            <Calendar className="h-3 w-3" />
                            <span>{formatTimeAgo(update.timestamp)}</span>
                            {update.user && (
                              <>
                                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                                <User className="h-3 w-3" />
                                <span>{update.user}</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${getStatusDotColor(update.status)}`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Show more/less button */}
              {recentUpdates.length > 3 && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAll(!showAll)}
                    className="text-slate-600 hover:text-slate-900"
                  >
                    {showAll ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Show All ({recentUpdates.length - 3} more)
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium mb-1">No recent updates</p>
              <p className="text-sm">Project activity will appear here</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}