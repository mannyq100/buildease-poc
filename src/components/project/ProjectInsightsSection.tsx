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
  type: 'success' | 'warning' | 'default' | 'alert' | 'performance';
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
      variant="default"
      elevation="sm"
      borderRadius="lg"
      className={cn(
        "shadow-sm border",
        isDarkMode 
          ? "bg-slate-800 border-slate-700" 
          : "bg-white border-gray-100",
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
              className="hover:translate-y-[-2px] transition-transform duration-200"
            >
              <InsightItem
                title={insight.title}
                description={insight.description}
                type={insight.type}
                icon={insight.icon}
                className="rounded-lg overflow-hidden"
              />
            </m.div>
          ))}
        </div>
      </LazyMotion>
    </ContentSection>
  );
}