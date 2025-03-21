/**
 * PhaseCard.tsx
 * Card component for displaying phase information in a project
 */
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, ChevronDown, ChevronUp, Plus, DollarSign, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Phase } from '@/types/phase';

export interface PhaseCardProps {
  phase: Phase;
  isExpanded?: boolean;
  onExpandToggle?: (phaseId: number) => void;
  onViewDetails?: (phaseId: number) => void;
  onAddTask?: (e: React.MouseEvent) => void;
  className?: string;
}

export function PhaseCard({
  phase,
  isExpanded = false,
  onExpandToggle,
  onViewDetails,
  onAddTask,
  className
}: PhaseCardProps) {
  // Helper to determine status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'in-progress':
      case 'in progress':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
      case 'planning':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-50 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400';
    }
  };

  const handleExpandToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onExpandToggle) {
      onExpandToggle(phase.id);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(phase.id);
    }
  };

  const handleAddTask = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddTask) {
      onAddTask(e);
    }
  };

  // Format budget to display with commas
  const formatBudget = (budget: string) => {
    return parseFloat(budget).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  // Calculate budget percentage
  const calculateBudgetPercentage = () => {
    if (!phase.spent || !phase.budget) return 0;
    const spent = parseFloat(phase.spent.replace(/[^0-9.-]+/g, ''));
    const budget = parseFloat(phase.budget.replace(/[^0-9.-]+/g, ''));
    return Math.round((spent / budget) * 100);
  };

  const budgetPercentage = calculateBudgetPercentage();

  // Calculate days remaining or overdue
  const getDaysRemaining = () => {
    const endDate = new Date(phase.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return `${diffDays} days remaining`;
    } else if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else {
      return 'Due today';
    }
  };

  return (
    <Card 
      className={cn(
        "transition-all duration-200 hover:shadow-sm cursor-pointer border border-gray-200 dark:border-gray-700",
        "bg-white dark:bg-slate-800/60",
        className
      )}
      onClick={handleViewDetails}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">{phase.name}</h3>
            {phase.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{phase.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Badge className={cn("text-xs px-1.5 py-0.5", getStatusColor(phase.status))}>
              {phase.status.replace('-', ' ')}
            </Badge>
            <Button 
              variant="ghost" 
              size="sm"
              className="p-0 h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={handleExpandToggle}
            >
              {isExpanded ? 
                <ChevronUp className="h-3.5 w-3.5" /> : 
                <ChevronDown className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500 dark:text-gray-400">Progress</span>
              <span className="font-medium">{phase.progress}%</span>
            </div>
            <div className="relative h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <Progress 
                value={phase.progress} 
                className={cn(
                  "h-full transition-all",
                  phase.progress < 30 ? "bg-red-400" :
                  phase.progress < 70 ? "bg-amber-400" : "bg-green-400"
                )} 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1 text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">{phase.startDate} - {phase.endDate}</span>
            </div>
            
            <div className="flex flex-col items-end">
              <div className="flex items-center">
                <DollarSign className="h-3 w-3 mr-1 text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">{formatBudget(phase.budget)}</span>
              </div>
              {phase.spent && (
                <div className="flex items-center mt-0.5">
                  <span className={cn(
                    "text-[10px]",
                    budgetPercentage > 90 ? "text-red-500" : 
                    budgetPercentage > 70 ? "text-amber-500" : 
                    "text-green-500"
                  )}>
                    {formatBudget(phase.spent)} ({budgetPercentage}%)
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-1 text-xs">
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <Clock className="h-3 w-3 mr-1" />
              <span>{getDaysRemaining()}</span>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/30 h-6 px-2 rounded"
              onClick={handleAddTask}
            >
              <Plus className="h-3 w-3 mr-1" /> Add Task
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PhaseCard;
