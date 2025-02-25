import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

interface PhaseCardProps {
  name: string;
  progress: number;
  startDate?: string;
  endDate?: string;
  status: 'completed' | 'in-progress' | 'upcoming' | 'warning';
  budget?: string;
  spent?: string;
  duration?: string;
  onClick?: () => void;
  className?: string;
  simplified?: boolean;
}

export const PhaseCard: React.FC<PhaseCardProps> = ({ 
  name, 
  progress, 
  startDate, 
  endDate, 
  status,
  budget,
  spent,
  duration,
  onClick,
  className,
  simplified = false
}) => {
  const statusConfig = {
    'completed': { bg: 'bg-green-100', text: 'text-green-600', label: 'Completed' },
    'in-progress': { bg: 'bg-blue-100', text: 'text-blue-600', label: 'In Progress' },
    'upcoming': { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Upcoming' },
    'warning': { bg: 'bg-yellow-100', text: 'text-yellow-600', label: 'Needs Attention' }
  };

  if (simplified) {
    return (
      <div className={cn("flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-all", className)}>
        <div className="space-y-2 flex-1">
          <div className="flex justify-between">
            <h3 className="font-medium">{name}</h3>
            <Badge className={cn(statusConfig[status].bg, statusConfig[status].text)}>
              {statusConfig[status].label}
            </Badge>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            {startDate && endDate && <span>{startDate} - {endDate}</span>}
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("border rounded-lg p-4 hover:shadow-md transition-all duration-300", className)}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{name}</h3>
          <div className="flex items-center flex-wrap gap-4 mt-1 text-sm text-gray-600">
            {duration && (
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{duration}</span>
              </div>
            )}
            {(startDate && endDate) && (
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{startDate} - {endDate}</span>
              </div>
            )}
          </div>
        </div>
        <Badge className={cn(statusConfig[status].bg, statusConfig[status].text)}>
          {statusConfig[status].label}
        </Badge>
      </div>
      <div className="mt-4 space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        {(budget && spent) && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Budget: {budget}</span>
            <span className="text-gray-600">Spent: {spent}</span>
          </div>
        )}
      </div>
      {onClick && (
        <div className="mt-4 flex justify-end">
          <Button variant="ghost" className="text-primary" onClick={onClick}>
            View Details
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}; 