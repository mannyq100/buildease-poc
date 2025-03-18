import React from 'react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { DollarSign, Calendar as CalendarIcon, FileBarChart } from 'lucide-react';
import { InsightItem } from '@/components/shared';
import { ContentSection } from '@/components/shared/ContentSection';
import { cn } from '@/lib/utils';
import { fadeInUpVariants } from '@/lib/animations';

interface InsightItemProps {
  title: string;
  description: string;
  type: 'success' | 'warning' | 'error' | 'default';
  icon: React.ReactNode;
}

interface ProjectInsightsSectionProps {
  insights: InsightItemProps[];
  isDarkMode: boolean;
  className?: string;
}

/**
 * ProjectInsightsSection - Displays project insights and analytics
 */
export function ProjectInsightsSection({
  insights,
  isDarkMode,
  className
}: ProjectInsightsSectionProps) {
  return (
    <ContentSection
      title="Project Insights"
      variant="gradient"
      elevation="sm"
      borderRadius="lg"
      className={cn(
        "shadow-md border",
        isDarkMode 
          ? "bg-gradient-to-br from-blue-950/30 to-indigo-950/20 border-blue-900/30" 
          : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100",
        className
      )}
    >
      <LazyMotion features={domAnimation}>
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <m.div
              key={i}
              variants={fadeInUpVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.3, delay: i * 0.1 }}
            >
              <InsightItem
                title={insight.title}
                description={insight.description}
                type={insight.type}
                icon={insight.icon}
              />
            </m.div>
          ))}
        </div>
      </LazyMotion>
    </ContentSection>
  );
} 