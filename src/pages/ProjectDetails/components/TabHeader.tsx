/**
 * Shared Tab Header Component for consistent ProjectDetails styling
 */

import React from 'react';
import { cn } from '@/utils/core/ui';

interface TabHeaderProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  children?: React.ReactNode;
  className?: string;
}

export function TabHeader({ 
  icon, 
  title, 
  description, 
  gradient,
  children,
  className 
}: TabHeaderProps) {
  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl border shadow-lg backdrop-blur-sm',
      gradient,
      className
    )}>
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent dark:from-slate-400/5 dark:to-transparent" />
      <div className="relative p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 dark:bg-slate-800/30 rounded-xl backdrop-blur-sm">
                {icon}
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {title}
                </h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                  {description}
                </p>
              </div>
            </div>
          </div>
          
          {children && (
            <div className="flex items-center gap-4">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}