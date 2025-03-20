import React from 'react';
import { DollarSign, Calendar as CalendarIcon, FileBarChart, ArrowUpRight } from 'lucide-react';
import { InsightItem } from '@/components/shared';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
    <Card className={cn(
      "border border-slate-200 shadow-sm overflow-hidden",
      isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white",
      className
    )}>
      <CardHeader className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-row justify-between items-center">
        <h2 className="text-lg font-semibold">Project Insights</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-sm font-medium text-[#2B6CB0] hover:text-[#2B6CB0]/80 dark:text-blue-400 dark:hover:text-blue-300 px-2 py-1 h-auto"
        >
          View All <ArrowUpRight className="ml-1 h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <div
              key={i}
              className="transition-all duration-200 hover:translate-y-[-2px]"
            >
              <InsightItem
                title={insight.title}
                description={insight.description}
                type={insight.type}
                icon={insight.icon}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}