import React from 'react';
import { ChevronRight } from 'lucide-react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ActivityItem } from '@/components/shared';
import { ContentSection } from '@/components/shared/ContentSection';
import { fadeInLeftVariants } from '@/lib/animations';

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
      className={`shadow-md border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 ${className || ''}`}
      action={
        onViewAll && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-[#1E3A8A] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
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
            >
              <ActivityItem
                date={activity.date}
                title={activity.title}
                description={activity.description}
                icon={activity.icon}
                user={activity.user}
              />
            </m.div>
          ))}
        </div>
      </LazyMotion>
    </ContentSection>
  );
} 