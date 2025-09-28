/**
 * InfoItem Component
 * Displays a label-value pair in a consistent format
 */
import React from 'react';
import { cn } from '@/utils/core/ui';

interface InfoItemProps {
  label: string;
  value: string | number;
  className?: string;
}

export function InfoItem({ label, value, className = '' }: InfoItemProps) {
  return (
    <div className={cn("p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 space-y-2", className)}>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 font-opensans">
        {label}
      </p>
      <p className="text-base font-semibold text-slate-900 dark:text-white font-inter">
        {value || <span className="text-slate-400 dark:text-slate-500 font-normal">Not specified</span>}
      </p>
    </div>
  );
}