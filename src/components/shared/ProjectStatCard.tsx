import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ProjectStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  colorScheme: 'blue' | 'emerald' | 'purple' | 'amber';
  progress?: number;
}

export function ProjectStatCard({ 
  icon, 
  label, 
  value, 
  subtitle, 
  colorScheme,
  progress = 75
}: ProjectStatCardProps) {
  const colorConfig = {
    blue: {
      gradient: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10",
      border: "border-blue-200 dark:border-blue-800/30",
      iconBg: "bg-blue-100 dark:bg-blue-900/50",
      iconColor: "text-blue-600 dark:text-blue-400",
      ring: "ring-blue-500/20 dark:ring-blue-400/10",
      shadow: "shadow-blue-500/5",
      hoverBg: "hover:bg-blue-50/70 dark:hover:bg-blue-900/40"
    },
    emerald: {
      gradient: "from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/10",
      border: "border-emerald-200 dark:border-emerald-800/30",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      ring: "ring-emerald-500/20 dark:ring-emerald-400/10",
      shadow: "shadow-emerald-500/5",
      hoverBg: "hover:bg-emerald-50/70 dark:hover:bg-emerald-900/40"
    },
    purple: {
      gradient: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/10",
      border: "border-purple-200 dark:border-purple-800/30",
      iconBg: "bg-purple-100 dark:bg-purple-900/50",
      iconColor: "text-purple-600 dark:text-purple-400",
      ring: "ring-purple-500/20 dark:ring-purple-400/10",
      shadow: "shadow-purple-500/5",
      hoverBg: "hover:bg-purple-50/70 dark:hover:bg-purple-900/40"
    },
    amber: {
      gradient: "from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/10",
      border: "border-amber-200 dark:border-amber-800/30",
      iconBg: "bg-amber-100 dark:bg-amber-900/50",
      iconColor: "text-amber-600 dark:text-amber-400",
      ring: "ring-amber-500/20 dark:ring-amber-400/10",
      shadow: "shadow-amber-500/5",
      hoverBg: "hover:bg-amber-50/70 dark:hover:bg-amber-900/40"
    }
  };
  
  return (
    <Card className={cn(
      "bg-gradient-to-br transition-all duration-300 group",
      "shadow-md hover:shadow-lg overflow-hidden",
      colorConfig[colorScheme].gradient,
      colorConfig[colorScheme].border
    )}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-3 rounded-xl shadow-sm transition-transform group-hover:scale-110",
            "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900",
            colorConfig[colorScheme].iconBg,
            colorConfig[colorScheme].ring,
            colorConfig[colorScheme].shadow
          )}>
            {icon}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
            </div>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-center">
            <div className="w-full bg-gray-100 dark:bg-gray-700 h-1 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full", 
                  colorConfig[colorScheme].iconBg
                )} 
                style={{width: `${progress}%`}}
              ></div>
            </div>
            <span className="ml-3 text-xs font-medium text-gray-500 dark:text-gray-400">{progress}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 