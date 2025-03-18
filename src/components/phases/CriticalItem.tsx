import React from 'react';
import { Calendar } from 'lucide-react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CriticalItemProps {
  title: string;
  deadline: string;
  status: 'completed' | 'pending' | 'not-started' | 'overdue';
}

/**
 * CriticalItem component for displaying critical path items in project phases
 */
export function CriticalItem({ 
  title, 
  deadline, 
  status 
}: CriticalItemProps) {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  const statusClasses = {
    completed: isDarkMode ? "text-green-400" : "text-green-600",
    pending: isDarkMode ? "text-amber-400" : "text-amber-600",
    'not-started': isDarkMode ? "text-slate-400" : "text-slate-600",
    overdue: isDarkMode ? "text-red-400" : "text-red-600"
  };
  
  return (
    <LazyMotion features={domAnimation}>
      <m.div 
        whileHover={{ x: 2 }}
        className={cn(
          "flex justify-between items-center p-3 rounded-md",
          isDarkMode ? "hover:bg-slate-700/50" : "hover:bg-gray-50"
        )}
      >
        <div className="flex items-center">
          <div className={cn(
            "w-2 h-2 rounded-full mr-3",
            status === 'completed' ? "bg-green-500" :
            status === 'pending' ? "bg-amber-500" :
            status === 'overdue' ? "bg-red-500" :
            "bg-gray-500"
          )} />
          <span className={isDarkMode ? "text-white" : "text-slate-800"}>{title}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Calendar className={cn("w-3.5 h-3.5", statusClasses[status])} />
          <span className={cn("text-sm", statusClasses[status])}>{deadline}</span>
        </div>
      </m.div>
    </LazyMotion>
  );
} 