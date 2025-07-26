/**
 * RecentUpdatesCard - Shows recent project activity and updates
 * Displays timeline of project events, document uploads, and status changes
 * Mobile-first responsive design optimized for construction workflows
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProjectDocuments } from '@/hooks/queries/useDocuments';
import { useProjectDetailsData } from '@/hooks/queries/useProjectDetails';
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
  Edit
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  updated_at: string;
  created_at: string;
}

interface UpdateItem {
  id: string;
  type: 'document_upload' | 'project_update' | 'status_change' | 'image_upload' | 'system';
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
  
  // Fetch project documents for recent uploads
  const { data: documents = [] } = useProjectDocuments(project.id);
  
  // Fetch project details for additional updates
  const { phases = [], budgetExpenses = [] } = useProjectDetailsData(project.id);

  // Generate recent updates from various sources
  const recentUpdates = useMemo((): UpdateItem[] => {
    const updates: UpdateItem[] = [];
    
    // Add recent document uploads
    documents.slice(0, 5).forEach((doc) => {
      updates.push({
        id: `doc-${doc.id}`,
        type: 'document_upload',
        title: `Document uploaded: ${doc.name}`,
        description: doc.description || `${doc.document_type} document added to project`,
        timestamp: doc.created_at,
        icon: <FileText className="h-4 w-4" />,
        status: 'success',
        metadata: { documentType: doc.document_type }
      });
    });

    // Add recent project updates (simulated based on updated_at)
    const daysSinceUpdate = Math.floor((Date.now() - new Date(project.updated_at).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceUpdate < 7) {
      updates.push({
        id: `project-update-${project.id}`,
        type: 'project_update',
        title: 'Project details updated',
        description: 'Project information has been modified',
        timestamp: project.updated_at,
        icon: <Edit className="h-4 w-4" />,
        status: 'info'
      });
    }

    // Add some simulated construction updates
    const simulatedUpdates: Omit<UpdateItem, 'id'>[] = [
      {
        type: 'status_change',
        title: 'Foundation inspection completed',
        description: 'All foundation work passed inspection with no issues',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        icon: <CheckCircle className="h-4 w-4" />,
        status: 'success',
        user: 'Inspector Johnson'
      },
      {
        type: 'image_upload',
        title: 'Progress photos added',
        description: '5 new construction progress images uploaded',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        icon: <ImageIcon className="h-4 w-4" />,
        status: 'info',
        user: 'Site Manager'
      },
      {
        type: 'status_change',
        title: 'Materials delivered on schedule',
        description: 'Lumber and steel beams arrived and inventoried',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        icon: <Upload className="h-4 w-4" />,
        status: 'success',
        user: 'Delivery Team'
      },
      {
        type: 'status_change',
        title: 'Weather delay - rescheduled roofing',
        description: 'Heavy rain forecast postponed roofing work to next week',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        icon: <AlertCircle className="h-4 w-4" />,
        status: 'warning',
        user: 'Project Manager'
      },
      {
        type: 'system',
        title: 'Budget updated',
        description: 'Material costs adjusted based on current market prices',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        icon: <Info className="h-4 w-4" />,
        status: 'info',
        user: 'Finance Team'
      }
    ];

    simulatedUpdates.forEach((update, index) => {
      updates.push({
        ...update,
        id: `simulated-${index}`
      });
    });

    // Sort by timestamp (most recent first)
    return updates.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [documents, project.updated_at, project.id]);

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
          {recentUpdates.length > 0 ? (
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