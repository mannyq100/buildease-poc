import React from 'react';
import { Clock, DollarSign, Users, Activity } from 'lucide-react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { StatCard } from '@/components/shared';
import { staggerContainerVariants, fadeInUpVariants } from '@/lib/animations';

interface ProjectStatGridProps {
  timelineValue: string;
  timelineSubtitle: string;
  budgetValue: string;
  budgetSubtitle: string;
  teamSizeValue: string;
  teamSizeSubtitle: string;
  progressValue: string;
  progressSubtitle: string;
  className?: string;
}

/**
 * ProjectStatGrid - Displays a grid of key project statistics
 */
export function ProjectStatGrid({
  timelineValue,
  timelineSubtitle,
  budgetValue,
  budgetSubtitle,
  teamSizeValue,
  teamSizeSubtitle,
  progressValue,
  progressSubtitle,
  className,
}: ProjectStatGridProps) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${className || ''}`}
        variants={staggerContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <m.div variants={fadeInUpVariants}>
          <StatCard
            title="Timeline"
            value={timelineValue}
            icon={<Clock className="h-6 w-6" />}
            colorScheme="blue"
            subtitle={timelineSubtitle}
          />
        </m.div>
        
        <m.div variants={fadeInUpVariants}>
          <StatCard
            title="Budget"
            value={budgetValue}
            icon={<DollarSign className="h-6 w-6" />}
            colorScheme="emerald"
            subtitle={budgetSubtitle}
          />
        </m.div>
        
        <m.div variants={fadeInUpVariants}>
          <StatCard
            title="Team Size"
            value={teamSizeValue}
            icon={<Users className="h-6 w-6" />}
            colorScheme="purple"
            subtitle={teamSizeSubtitle}
          />
        </m.div>
        
        <m.div variants={fadeInUpVariants}>
          <StatCard
            title="Progress"
            value={progressValue}
            icon={<Activity className="h-6 w-6" />}
            colorScheme="amber"
            subtitle={progressSubtitle}
          />
        </m.div>
      </m.div>
    </LazyMotion>
  );
} 