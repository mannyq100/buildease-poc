import React from 'react';
import { ChevronRight } from 'lucide-react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ActivityItem } from '@/components/shared';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { fadeInLeftVariants } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface ActivityItemProps {
  date: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  user?: {
    name: string;
    avatar: string;
  };
}

interface ProjectActivitySectionProps {
  activities: ActivityItemProps[];
  onViewAll?: () => void;
  limit?: number;
  className?: string;
}

/**
 * ProjectActivitySection - Displays recent project activities
 */
export function ProjectActivitySection({
  activities,
  onViewAll,
  limit = 4,
  className
}: ProjectActivitySectionProps) {
  const displayedActivities = activities.slice(0, limit);
  
  return (
    <Card className={cn(
      "shadow-sm border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800",
      className
    )}>
      <CardHeader className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-row justify-between items-center">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
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
            {displayedActivities.map((activity, i) => (
              <m.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <ActivityItem
                  time={activity.date}
                  title={activity.title}
                  description={activity.description}
                  icon={activity.icon}
                  project={activity.user?.name}
                />
              </m.div>
            ))}
          </m.div>
        </LazyMotion>
      </CardContent>
    </Card>
  );
}