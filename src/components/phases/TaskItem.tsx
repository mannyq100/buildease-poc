import React from 'react';
import { Badge } from '@/components/ui/badge';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { Calendar, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  title: string;
  status: 'completed' | 'in-progress' | 'pending';
  progress: number;
  assignees: number | string;
  deadline: string;
}

/**
 * TaskItem component for displaying individual tasks in phase details
 */
export function TaskItem({ 
  title, 
  status, 
  progress, 
  assignees, 
  deadline 
}: TaskItemProps) {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  const statusClasses = {
    completed: isDarkMode ? "bg-green-900/30 text-green-400 border-green-700/50" : "bg-green-100 text-green-600 border-green-200",
    'in-progress': isDarkMode ? "bg-blue-900/30 text-blue-400 border-blue-700/50" : "bg-blue-100 text-blue-600 border-blue-200",
    pending: isDarkMode ? "bg-slate-800 text-slate-300 border-slate-700" : "bg-gray-100 text-gray-600 border-gray-200"
  };
  
  const progressColor = () => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-blue-500";
    if (progress >= 20) return "bg-amber-500";
    return "bg-red-500";
  };
  
  return (
    <LazyMotion features={domAnimation}>
      <m.div 
        whileHover={{ scale: 1.01, y: -2 }}
        className={cn(
          "p-4 rounded-lg border transition-all shadow-sm hover:shadow-md",
          isDarkMode ? "bg-slate-800/80 border-slate-700" : "bg-white border-gray-200"
        )}
      >
        <div className="flex justify-between items-start">
          <div>
            <h4 className={cn(
              "font-medium",
              isDarkMode ? "text-white" : "text-slate-800"
            )}>{title}</h4>
            <div className={cn(
              "flex items-center space-x-4 mt-1.5 text-sm",
              isDarkMode ? "text-slate-400" : "text-gray-600"
            )}>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{assignees} members</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{deadline}</span>
              </div>
            </div>
          </div>
          <Badge className={statusClasses[status]}>
            {status}
          </Badge>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-sm mb-1.5">
            <span className={isDarkMode ? "text-slate-400" : "text-gray-500"}>Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={cn("h-full rounded-full", progressColor())}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </m.div>
    </LazyMotion>
  );
} 