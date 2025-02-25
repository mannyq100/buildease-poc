import React from 'react';
import { cn } from '@/lib/utils';

interface ActivityItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
  project?: string;
  className?: string;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ 
  icon, 
  title, 
  description, 
  time, 
  project,
  className
}) => (
  <div className={cn("flex items-start space-x-3 group", className)}>
    <div className="p-2 bg-gray-100 rounded-lg text-gray-700 group-hover:text-primary group-hover:bg-primary/5 transition-colors">
      {icon}
    </div>
    <div className="flex-1">
      <div className="flex justify-between">
        <h4 className="font-medium">{title}</h4>
        <span className="text-sm text-gray-600">{time}</span>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
      {project && <p className="text-sm text-primary mt-1">{project}</p>}
    </div>
  </div>
); 