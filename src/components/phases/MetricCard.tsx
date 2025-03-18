import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
  trend?: 'positive' | 'negative' | 'warning' | 'normal';
}

/**
 * Enhanced metric card component with animations for phase metrics
 */
export function MetricCard({ 
  icon, 
  label, 
  value, 
  subtext, 
  trend = 'normal' 
}: MetricCardProps) {
  // Check for dark mode
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  // Define trend-specific styles
  const trendColors = {
    positive: isDarkMode ? "text-green-400" : "text-green-600",
    negative: isDarkMode ? "text-red-400" : "text-red-600",
    warning: isDarkMode ? "text-amber-400" : "text-amber-600",
    normal: isDarkMode ? "text-blue-400" : "text-blue-600"
  };
  
  const trendIcons = {
    positive: <TrendingUp className="w-3.5 h-3.5" />,
    negative: <TrendingUp className="w-3.5 h-3.5 transform rotate-180" />,
    warning: <AlertCircle className="w-3.5 h-3.5" />,
    normal: null
  };
  
  return (
    <LazyMotion features={domAnimation}>
      <m.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
        <Card className={cn(
          "relative overflow-hidden border transition-all duration-300 shadow-sm hover:shadow-md",
          isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
        )}>
          <div className="absolute inset-0 bg-gradient-to-br opacity-5">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-30"></div>
          </div>
          <CardContent className="p-4 relative z-10">
            <div className="flex items-center space-x-2">
              {icon}
              <span className={cn(
                "font-medium",
                isDarkMode ? "text-white" : "text-slate-800"
              )}>{label}</span>
            </div>
            <div className="mt-2">
              <div className={cn(
                "text-2xl font-bold",
                isDarkMode ? "text-white" : "text-slate-800"
              )}>{value}</div>
              <div className={cn(
                "text-sm flex items-center mt-1",
                isDarkMode ? "text-slate-400" : "text-gray-600"
              )}>
                {subtext}
                {trend !== 'normal' && (
                  <span className={cn("flex items-center ml-2", trendColors[trend])}>
                    {trendIcons[trend]}
                    <span className="ml-1">
                      {trend === 'positive' ? 'Ahead of schedule' : 
                       trend === 'negative' ? 'Behind schedule' : 
                       trend === 'warning' ? 'Needs attention' : ''}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </m.div>
    </LazyMotion>
  );
} 