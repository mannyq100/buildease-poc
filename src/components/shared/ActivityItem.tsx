import React from 'react';
import { cn } from '@/lib/utils';
import { LazyMotion, domAnimation, m } from 'framer-motion';

interface ActivityItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
  project?: string;
  className?: string;
  iconColor?: string;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ 
  icon, 
  title, 
  description, 
  time, 
  project,
  className,
  iconColor
}) => (
  <LazyMotion features={domAnimation}>
    <m.div 
      whileHover={{ x: 4 }}
      className={cn("flex items-start space-x-3 group p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300", className)}
    >
      <div className={cn(
        "p-2 rounded-full text-gray-700 transition-all duration-300 flex items-center justify-center",
        iconColor ? `text-${iconColor}-500 dark:text-${iconColor}-400 bg-${iconColor}-100 dark:bg-${iconColor}-900/30` : "bg-gray-100 dark:bg-gray-800 group-hover:text-primary group-hover:bg-primary/10 dark:text-gray-400"
      )}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">{title}</h4>
          <span className="text-xs text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full ml-2">{time}</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{description}</p>
        {project && (
          <div className="flex items-center mt-2">
            <div className="h-1 w-1 rounded-full bg-primary mr-2"></div>
            <p className="text-sm font-medium text-primary dark:text-primary-400">{project}</p>
          </div>
        )}
      </div>
    </m.div>
  </LazyMotion>
); 