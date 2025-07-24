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
      bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      bgHover: 'hover:from-blue-600 hover:to-blue-700',
      text: 'text-blue-600',
      light: 'bg-blue-50',
      shadow: 'shadow-blue-500/20',
      hoverShadow: 'hover:shadow-blue-500/30',
    },
    green: {
      bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      bgHover: 'hover:from-emerald-600 hover:to-emerald-700',
      text: 'text-emerald-600',
      light: 'bg-emerald-50',
      shadow: 'shadow-emerald-500/20',
      hoverShadow: 'hover:shadow-emerald-500/30',
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-500 to-purple-600',
      bgHover: 'hover:from-purple-600 hover:to-purple-700',
      text: 'text-purple-600',
      light: 'bg-purple-50',
      shadow: 'shadow-purple-500/20',
      hoverShadow: 'hover:shadow-purple-500/30',
    },
    orange: {
      bg: 'bg-gradient-to-br from-orange-500 to-orange-600',
      bgHover: 'hover:from-orange-600 hover:to-orange-700',
      text: 'text-orange-600',
      light: 'bg-orange-50',
      shadow: 'shadow-orange-500/20',
      hoverShadow: 'hover:shadow-orange-500/30',
    },
  };
  
  const colors = colorClasses[color];
  
  return (
    <Card className={cn(
      "group cursor-pointer transition-all duration-300 transform-gpu",
      "hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]",
      "bg-gradient-to-br from-white via-slate-50/50 to-white",
      "border border-slate-200/60 hover:border-slate-300/60",
      colors.hoverShadow
    )}>
      <CardContent className="p-6 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-50/30 to-slate-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative flex items-center justify-between">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-700 uppercase tracking-wide">{title}</p>
              <div className="w-1 h-1 bg-slate-400 rounded-full" />
            </div>
            
            <p className={cn(
              "text-3xl font-bold transition-colors duration-200",
              "text-slate-900 group-hover:text-slate-800"
            )}>
              {value}
            </p>
            
            <p className="text-sm text-slate-600 font-medium leading-tight">
              {subtitle}
            </p>
            
            {trend && (
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs font-medium transition-all duration-200",
                  colors.light, 
                  colors.text, 
                  "border-current group-hover:scale-105"
                )}
              >
                {trend}
              </Badge>
            )}
          </div>
          
          <div className={cn(
            "relative p-4 rounded-xl shadow-lg transition-all duration-300",
            "group-hover:scale-110 group-hover:rotate-3 transform-gpu",
            colors.bg,
            colors.bgHover,
            colors.shadow
          )}>
            <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Icon className="h-7 w-7 text-white relative z-10" />
          </div>
        </div>
        
        {/* Animated border glow */}
        <div className={cn(
          "absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-500",
          "bg-gradient-to-r from-transparent via-current to-transparent",
          colors.text
        )} />
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