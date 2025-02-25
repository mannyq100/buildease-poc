import React from 'react';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from './StatusBadge';
import { Users, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  title: string;
  status: 'completed' | 'in-progress' | 'pending' | 'delayed';
  progress: number;
  assignees: number;
  deadline: string;
  className?: string;
}

export const TaskItem: React.FC<TaskItemProps> = ({ 
  title, 
  status, 
  progress, 
  assignees, 
  deadline,
  className
}) => (
  <div className={cn("p-4 border rounded-lg hover:shadow-md transition-all duration-300", className)}>
    <div className="flex justify-between items-start">
      <div>
        <h4 className="font-medium">{title}</h4>
        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
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
      <StatusBadge status={status} />
    </div>
    <div className="mt-3">
      <div className="flex justify-between text-sm mb-1">
        <span>Progress</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  </div>
); 