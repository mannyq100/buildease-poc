import React from 'react';
import { ChevronRight } from 'lucide-react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ActivityItem } from '@/components/shared';
import { ContentSection } from '@/components/shared/ContentSection';
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
    <ContentSection
      title="Recent Activity"
      variant="default"
      elevation="sm"
      borderRadius="lg"
      className={cn(
        "shadow-sm border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800",
        className
      )}
      action={
        onViewAll && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-[#2B6CB0] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium"
            onClick={onViewAll}
          >
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )
      }
    >
      <LazyMotion features={domAnimation}>
        <div className="space-y-4">
          {displayedActivities.map((activity, i) => (
            <m.div
              key={i}
              variants={fadeInLeftVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="hover:translate-x-1 transition-transform duration-200"
            >
              <ActivityItem
                date={activity.date}
                title={activity.title}
                description={activity.description}
                icon={activity.icon}
                user={activity.user}
                className="border border-transparent hover:border-gray-100 dark:hover:border-slate-700 rounded-lg p-0.5"
              />
            </m.div>
          ))}
        </div>
      </LazyMotion>
    </ContentSection>
  );
}