import React from 'react';
import { DollarSign, Calendar as CalendarIcon, FileBarChart, ArrowUpRight } from 'lucide-react';
import { InsightItem } from '@/components/shared';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

interface InsightItemProps {
  title: string;
  description: string;
  type: 'success' | 'warning' | 'default' | 'alert' | 'performance';
  icon: React.ReactNode;
}

interface ProjectInsightsSectionProps {
  insights: InsightItemProps[];
  className?: string;
}

/**
 * ProjectInsightsSection - Displays project insights and analytics
 */
export function ProjectInsightsSection({
  insights,
  className
}: ProjectInsightsSectionProps) {
  const { isDarkMode } = useTheme();
  
  return (
    <Card className={cn(
      "border shadow-sm overflow-hidden transition-all duration-300",
      "hover:shadow-md",
      isDarkMode 
        ? "bg-slate-800/90 border-slate-700/80 dark:shadow-slate-900/20" 
        : "bg-white border-slate-200",
      className
    )}>
      <CardHeader className={cn(
        "p-4 border-b flex flex-row justify-between items-center",
        isDarkMode ? "border-slate-700/80" : "border-slate-200/80"
      )}>
        <h2 className="text-lg font-semibold">Project Insights</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "text-sm font-medium px-2 py-1 h-auto transition-colors duration-200",
            isDarkMode 
              ? "text-blue-400 hover:text-blue-300 hover:bg-blue-900/20" 
              : "text-[#2B6CB0] hover:text-[#2B6CB0]/80 hover:bg-blue-50/50"
          )}
        >
          View All <ArrowUpRight className="ml-1 h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <div
              key={i}
              className="transition-all duration-200 hover:translate-y-[-2px] hover:shadow-sm rounded-md"
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