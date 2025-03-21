import React from 'react';
import { ChevronRight, MessageSquare, Settings, CheckSquare, FileText, Calendar, Package, AlertTriangle } from 'lucide-react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ActivityItem } from '@/components/shared';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { fadeInLeftVariants } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface ActivityItemProps {
  id?: string;
  date: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  type?: 'project_update' | 'material_order' | 'phase_completed' | 'document_upload' | 'meeting' | 'issue';
  user?: {
    name: string;
    avatar: string | null;
  };
}

interface ProjectActivitySectionProps {
  activities: ActivityItemProps[];
  onViewAll?: () => void;
  limit?: number;
  className?: string;
}

/**
 * ProjectActivitySection - Displays recent project activities and updates
 */
export function ProjectActivitySection({
  activities,
  onViewAll,
  limit = 5,
  className
}: ProjectActivitySectionProps) {
  const displayedActivities = activities.slice(0, limit);
  
  // Helper function to get appropriate icon based on activity type
  const getActivityIcon = (activity: ActivityItemProps) => {
    if (activity.icon) return activity.icon;
    
    // Default icons based on activity type
    const iconMap = {
      project_update: <Settings className="h-5 w-5 text-[#2B6CB0]" />,
      material_order: <Package className="h-5 w-5 text-blue-500" />,
      phase_completed: <CheckSquare className="h-5 w-5 text-green-500" />,
      document_upload: <FileText className="h-5 w-5 text-purple-500" />,
      meeting: <Calendar className="h-5 w-5 text-amber-500" />,
      issue: <AlertTriangle className="h-5 w-5 text-red-500" />,
    };
    
    return activity.type && iconMap[activity.type] ? 
      iconMap[activity.type] : 
      <MessageSquare className="h-5 w-5 text-gray-500" />;
  };
  
  return (
    <Card className={cn(
      "shadow-sm border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800",
      className
    )}>
      <CardHeader className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-row justify-between items-center">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-[#2B6CB0]" />
          Recent Activity
        </h2>
        {onViewAll && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-[#2B6CB0] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium"
            onClick={onViewAll}
          >
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-4">
        <LazyMotion features={domAnimation}>
          <m.div 
            className="space-y-4"
            variants={fadeInLeftVariants}
            initial="hidden"
            animate="visible"
          >
            {displayedActivities.length > 0 ? (
              displayedActivities.map((activity, i) => (
                <m.div 
                  key={activity.id || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <ActivityItem
                    time={activity.date}
                    title={activity.title}
                    description={activity.description}
                    icon={getActivityIcon(activity)}
                    project={activity.user?.name}
                  />
                </m.div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <MessageSquare className="h-10 w-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p>No recent activity to display</p>
              </div>
            )}
          </m.div>
        </LazyMotion>
      </CardContent>
    </Card>
  );
}