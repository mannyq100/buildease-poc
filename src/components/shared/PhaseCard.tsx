import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Calendar, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
    'completed': { 
      bg: 'bg-green-100', 
      text: 'text-green-600', 
      label: 'Completed',
      border: 'border-green-200',
      darkBg: 'dark:bg-green-900/30',
      darkText: 'dark:text-green-400',
      darkBorder: 'dark:border-green-800/50',
      icon: '✓'
    },
    'in-progress': { 
      bg: 'bg-blue-100', 
      text: 'text-blue-600', 
      label: 'In Progress',
      border: 'border-blue-200',
      darkBg: 'dark:bg-blue-900/30',
      darkText: 'dark:text-blue-400',
      darkBorder: 'dark:border-blue-800/50',
      icon: '→'
    },
    'upcoming': { 
      bg: 'bg-gray-100', 
      text: 'text-gray-600', 
      label: 'Upcoming',
      border: 'border-gray-200',
      darkBg: 'dark:bg-gray-900/30',
      darkText: 'dark:text-gray-400',
      darkBorder: 'dark:border-gray-800/50',
      icon: '○'
    },
    'warning': { 
      bg: 'bg-yellow-100', 
      text: 'text-yellow-600', 
      label: 'Needs Attention',
      border: 'border-yellow-200',
      darkBg: 'dark:bg-yellow-900/30',
      darkText: 'dark:text-yellow-400',
      darkBorder: 'dark:border-yellow-800/50',
      icon: '⚠'
    }
  };

  const getProgressColor = () => {
    if (progress >= 100) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (progress >= 75) return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    if (progress >= 50) return 'bg-gradient-to-r from-indigo-500 to-blue-500';
    if (progress >= 25) return 'bg-gradient-to-r from-purple-500 to-indigo-500';
    return 'bg-gradient-to-r from-slate-500 to-gray-500';
  };

  if (simplified) {
    return (
      <div className={cn(
        "flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all", 
        className,
        statusConfig[status].border,
        statusConfig[status].darkBorder
      )}>
        <div className="space-y-2 flex-1">
          <div className="flex justify-between">
            <h3 className="font-medium flex items-center">
              <span className="mr-1.5">
                {statusConfig[status].icon}
              </span>
              {name}
            </h3>
            <Badge className={cn(
              statusConfig[status].bg, 
              statusConfig[status].text,
              statusConfig[status].darkBg,
              statusConfig[status].darkText
            )}>
              {statusConfig[status].label}
            </Badge>
          </div>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            {startDate && endDate && <span>{startDate} - {endDate}</span>}
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={cn("h-full rounded-full", getProgressColor())} 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className={cn(
        "border rounded-lg p-4 hover:shadow-md transition-all duration-300", 
        className,
        statusConfig[status].border,
        statusConfig[status].darkBorder
      )}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium flex items-center">
            <span className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center mr-2 text-xs font-bold",
              statusConfig[status].bg,
              statusConfig[status].text,
              statusConfig[status].darkBg,
              statusConfig[status].darkText
            )}>
              {statusConfig[status].icon}
            </span>
            {name}
          </h3>
          <div className="flex items-center flex-wrap gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
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
        <Badge className={cn(
          statusConfig[status].bg, 
          statusConfig[status].text,
          statusConfig[status].darkBg,
          statusConfig[status].darkText
        )}>
          {statusConfig[status].label}
        </Badge>
      </div>
      <div className="mt-4 space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full", getProgressColor())} 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{progress}% Complete</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {(budget && spent) && (
          <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-md">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-1 text-green-600 dark:text-green-400" />
                <span className="text-gray-700 dark:text-gray-300">Budget</span>
              </div>
              <span className="font-medium">{budget}</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-1">
              <span className="text-gray-600 dark:text-gray-400 ml-5">Spent</span>
              <span className="text-gray-600 dark:text-gray-400">{spent}</span>
            </div>
          </div>
        )}
      </div>
      {onClick && (
        <div className="mt-4 flex justify-end">
          <Button 
            variant="ghost" 
            className="text-primary hover:bg-primary/10 transition-colors" 
            onClick={onClick}
          >
            View Details
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </motion.div>
  );
}; 