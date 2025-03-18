import React from 'react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { cn } from '@/lib/utils';

interface InsightItemProps {
  title: string;
  description: string;
}

/**
 * InsightItem component for displaying insights about the phase
 */
export function InsightItem({ 
  title, 
  description 
}: InsightItemProps) {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  return (
    <LazyMotion features={domAnimation}>
      <m.div 
        whileHover={{ scale: 1.01, y: -2 }}
        className={cn(
          "p-3 rounded-lg border transition-all shadow-sm hover:shadow-md",
          isDarkMode ? 
            "bg-blue-900/10 border-blue-800/20" : 
            "bg-blue-50 border-blue-100"
        )}
      >
        <h4 className={cn(
          "font-medium text-sm",
          isDarkMode ? "text-blue-400" : "text-blue-600"
        )}>
          {title}
        </h4>
        <p className={cn(
          "text-xs mt-1",
          isDarkMode ? "text-slate-300" : "text-slate-600"
        )}>
          {description}
        </p>
      </m.div>
    </LazyMotion>
  );
} 