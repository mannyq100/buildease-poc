import * as React from "react";
import { cn } from "@/utils/core/ui";
import type { Phase, Task } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PlusCircle, Clock, Calendar, CheckCircle2 } from "lucide-react";

export interface CurrentPhaseCardProps {
  phase: Phase;
  tasks: Task[];
  onQuickAction: (action: string) => void;
  showTimeline?: boolean;
  className?: string;
}

/**
 * CurrentPhaseCard - Shows what's happening now in the project
 * Features current phase details, urgent tasks, and quick actions
 */
const CurrentPhaseCard = React.forwardRef<
  HTMLDivElement,
  CurrentPhaseCardProps
>(({ className, phase, tasks, onQuickAction, showTimeline = true, ...props }, ref) => {
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
  const urgentTasks = tasks.slice(0, 3);

  return (
    <Card ref={ref} className={cn("w-full border border-buildease-blue-200/50 dark:border-buildease-blue-800/50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg", className)} {...props}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-buildease-blue-900 via-buildease-blue-800 to-buildease-blue-900 dark:from-buildease-blue-100 dark:via-white dark:to-buildease-blue-100 bg-clip-text text-transparent">What's Happening Now</CardTitle>
            <StatusBadge status="in-progress" size="sm" />
          </div>
          {showTimeline && (
            <div className="flex items-center text-sm text-buildease-orange-600 dark:text-buildease-orange-400">
              <Calendar className="h-4 w-4 mr-1" />
              {phase.endDate ? new Date(phase.endDate).toLocaleDateString() : 'No deadline'}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Phase Info */}
        <div className="bg-buildease-blue-50/30 dark:bg-buildease-blue-950/20 rounded-lg p-4 border border-buildease-blue-200/30 dark:border-buildease-blue-700/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold bg-gradient-to-r from-buildease-blue-800 to-buildease-blue-900 dark:from-buildease-blue-200 dark:to-buildease-blue-100 bg-clip-text text-transparent">
              {phase.name}
            </h3>
            <div className="flex items-center gap-2">
              <ProgressBar 
                value={progress} 
                color={progress >= 75 ? "success" : "primary"}
                className="w-16"
              />
              <span className="text-sm font-medium text-buildease-blue-700 dark:text-buildease-blue-300">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
          {phase.description && (
            <p className="text-sm text-buildease-blue-600 dark:text-buildease-blue-400">
              {phase.description}
            </p>
          )}
        </div>

        {/* Urgent Tasks */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium flex items-center text-buildease-blue-900 dark:text-buildease-blue-100">
              <Clock className="h-4 w-4 mr-2 text-buildease-orange-600 dark:text-buildease-orange-400" />
              Next 3 Tasks
            </h4>
            <span className="text-sm text-buildease-blue-600 dark:text-buildease-blue-400">
              {completedTasks}/{tasks.length} completed
            </span>
          </div>
          
          {urgentTasks.length > 0 ? (
            <div className="space-y-2">
              {urgentTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-800 hover:bg-buildease-blue-50 dark:hover:bg-buildease-blue-950/50 transition-all duration-300 border border-buildease-blue-200/30 dark:border-buildease-blue-700/30 hover:shadow-md hover:scale-[1.01] group"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 
                      className={cn("h-4 w-4", 
                        task.status === "completed" 
                          ? "text-status-completed" 
                          : "text-buildease-blue-400 dark:text-buildease-blue-500"
                      )} 
                    />
                    <span className={cn(
                      "text-sm",
                      task.status === "completed" 
                        ? "line-through text-buildease-blue-500 dark:text-buildease-blue-600" 
                        : "text-buildease-blue-900 dark:text-buildease-blue-100"
                    )}>
                      {task.name}
                    </span>
                  </div>
                  <StatusBadge 
                    status={task.status as any} 
                    size="sm" 
                    variant="dot"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No tasks in this phase yet</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={() => onQuickAction("add_task")}
            className="flex-1"
            variant="default"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Task
          </Button>
          <Button 
            onClick={() => onQuickAction("update_status")}
            variant="outline"
            className="flex-1"
          >
            Update Status
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

CurrentPhaseCard.displayName = "CurrentPhaseCard";

export { CurrentPhaseCard };
