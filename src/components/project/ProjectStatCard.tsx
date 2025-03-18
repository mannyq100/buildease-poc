import React from 'react';
import { LucideIcon } from 'lucide-react';
import { ColorConfig } from '@/types/ui';

interface ProjectStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  colorScheme: 'blue' | 'emerald' | 'purple' | 'amber';
}

/**
 * Project statistics card component
 * Displays a statistic with customizable color schemes
 */
export function ProjectStatCard({ icon, label, value, subtitle, colorScheme }: ProjectStatCardProps) {
  const colorConfig: Record<string, ColorConfig> = {
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

  const colors = colorConfig[colorScheme];

  return (
    <div 
      className={`
        relative overflow-hidden rounded-xl border p-3.5
        bg-gradient-to-b ${colors.gradient} ${colors.border}
        transition-all hover:shadow-md ${colors.shadow} ${colors.hoverBg}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</h3>
          <div className="text-2xl font-bold">{value}</div>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
        <div className={`
          rounded-full p-2
          ${colors.iconBg} ${colors.iconColor}
          ring-2 ${colors.ring}
        `}>
          {icon}
        </div>
      </div>
    </div>
  );
} 