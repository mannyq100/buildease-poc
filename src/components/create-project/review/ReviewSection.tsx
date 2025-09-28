/**
 * ReviewSection Component
 * Reusable section component for the review form
 */
import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/utils/core/ui';

interface ReviewSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ReviewSection({ title, icon, children, className = '' }: ReviewSectionProps) {
  return (
    <Card className={cn("border border-slate-200 dark:border-slate-700 shadow-md bg-white dark:bg-slate-800 rounded-lg", className)}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#2B6CB0]/10 dark:bg-[#2B6CB0]/20 rounded-lg flex items-center justify-center border border-[#2B6CB0]/20">
            <div className="text-[#2B6CB0]">
              {icon}
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white font-inter">
            {title}
          </h3>
        </div>
        {children}
      </div>
    </Card>
  );
}