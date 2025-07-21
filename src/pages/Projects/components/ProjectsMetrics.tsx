/**
 * Enhanced Projects Metrics with touch-optimized mobile design
 * Displays project statistics with construction worker-friendly UI
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  CheckCircle, 
  DollarSign, 
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/utils/core/ui';
import type { ProjectsMetricsProps } from '@/types/enhanced-projects';

export function ProjectsMetrics({ 
  metrics, 
  loading = false, 
  error = null,
  className 
}: ProjectsMetricsProps) {
  if (loading) {
    return <ProjectsMetricsSkeleton className={className} />;
  }
  
  if (error) {
    return (
      <div className={cn("p-4 border border-red-200 bg-red-50 rounded-lg", className)}>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <p className="text-sm text-red-700">
            Unable to load project metrics. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }
  
  if (!metrics) {
    return null;
  }
  
  const metricCards = [
    {
      title: 'Total Projects',
      value: metrics.totalProjects.toString(),
      subtitle: `${metrics.activeProjects} active`,
      icon: Briefcase,
      color: 'blue',
      trend: metrics.projectsThisMonth > 0 ? `+${metrics.projectsThisMonth} this month` : undefined,
    },
    {
      title: 'Completed',
      value: metrics.completedProjects.toString(),
      subtitle: `${Math.round((metrics.completedProjects / Math.max(metrics.totalProjects, 1)) * 100)}% completion rate`,
      icon: CheckCircle,
      color: 'green',
      trend: metrics.completedThisMonth > 0 ? `+${metrics.completedThisMonth} this month` : undefined,
    },
    {
      title: 'Total Budget',
      value: formatCurrency(metrics.totalBudget),
      subtitle: `${formatCurrency(metrics.totalSpent)} spent`,
      icon: DollarSign,
      color: 'purple',
      trend: `${Math.round(metrics.spentPercentage)}% utilized`,
    },
    {
      title: 'Avg Progress',
      value: `${Math.round(metrics.averageProgress)}%`,
      subtitle: 'Across all projects',
      icon: TrendingUp,
      color: 'orange',
      trend: metrics.activeProjects > 0 ? `${metrics.activeProjects} in progress` : undefined,
    },
  ];
  
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6", className)}>
      {metricCards.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
}

/**
 * Individual metric card with touch-optimized design
 */
interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'purple' | 'orange';
  trend?: string;
}

function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color, 
  trend 
}: MetricCardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-500',
      text: 'text-blue-600',
      light: 'bg-blue-50',
    },
    green: {
      bg: 'bg-green-500',
      text: 'text-green-600',
      light: 'bg-green-50',
    },
    purple: {
      bg: 'bg-purple-500',
      text: 'text-purple-600',
      light: 'bg-purple-50',
    },
    orange: {
      bg: 'bg-orange-500',
      text: 'text-orange-600',
      light: 'bg-orange-50',
    },
  };
  
  const colors = colorClasses[color];
  
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500">{subtitle}</p>
            
            {trend && (
              <Badge 
                variant="outline" 
                className={`${colors.light} ${colors.text} border-current text-xs`}
              >
                {trend}
              </Badge>
            )}
          </div>
          
          <div className={`${colors.bg} p-3 rounded-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton for metrics loading state
 */
function ProjectsMetricsSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6", className)}>
      {Array.from({ length: 4 }, (_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-200 rounded w-24 animate-pulse" />
                <div className="h-8 bg-slate-200 rounded w-16 animate-pulse" />
                <div className="h-3 bg-slate-200 rounded w-32 animate-pulse" />
                <div className="h-5 bg-slate-200 rounded w-20 animate-pulse" />
              </div>
              <div className="h-12 w-12 bg-slate-200 rounded-lg animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Format currency values for display
 */
function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toLocaleString()}`;
}