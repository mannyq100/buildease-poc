import * as React from "react";
import { cn } from "@/utils/core/ui";
import type { Phase, Task } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    <Card ref={ref} className={cn("w-full border border-slate-200/60 dark:border-slate-800/60 shadow-lg hover:shadow-xl transition-all duration-500 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl overflow-hidden", className)} {...props}>
      
      <CardHeader className="pb-4 pt-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
              Current Phase <span className="text-sm text-slate-600 dark:text-slate-400">(What's happening right now)</span>
            </CardTitle>
          </div>
          <StatusBadge status="in-progress" size="sm" variant="outline" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-5 px-5 pb-5">
        {/* Phase Overview */}
        <div className="space-y-4">
          <div className="rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {phase.name}
              </h3>
              {showTimeline && phase.endDate && (
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                  <Calendar className="h-3 w-3 mr-1" />
                  Due {new Date(phase.endDate).toLocaleDateString()}
                </div>
              )}
            </div>
          
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Progress</span>
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className="h-2 bg-gradient-to-r from-buildease-blue-500 to-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
            
            {phase.description && (
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
                {phase.description}
              </p>
            )}
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-2 text-slate-600 dark:text-slate-400" />
              Upcoming Tasks
            </h4>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">
              {completedTasks}/{tasks.length} complete
            </span>
          </div>
          
          {urgentTasks.length > 0 ? (
            <div className="space-y-2">
              {urgentTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 hover:border-slate-300/80 dark:hover:border-slate-600/80 transition-all duration-300 group"
                >
                  <CheckCircle2 
                    className={cn("h-4 w-4 flex-shrink-0 transition-all duration-300 group-hover:scale-110", 
                      task.status === "completed" 
                        ? "text-emerald-600 dark:text-emerald-400" 
                        : "text-slate-400 dark:text-slate-500 group-hover:text-buildease-blue-500 dark:group-hover:text-buildease-blue-400"
                    )} 
                  />
                  <span className={cn(
                    "text-sm flex-1 min-w-0 font-medium",
                    task.status === "completed" 
                      ? "line-through text-slate-500 dark:text-slate-500" 
                      : "text-slate-900 dark:text-white"
                  )}>
                    {task.name}
                  </span>
                  <StatusBadge 
                    status={task.status as any} 
                    size="sm" 
                    variant="outline"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 dark:text-slate-400">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                <Clock className="h-6 w-6 opacity-50" />
              </div>
              <p className="text-sm font-medium">No tasks scheduled yet</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button 
            onClick={() => onQuickAction("add_task")}
            size="sm"
            className="flex-1 h-10 text-sm font-semibold bg-buildease-blue-600 hover:bg-buildease-blue-700 text-white dark:bg-buildease-blue-500 dark:hover:bg-buildease-blue-600 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
          >
            <PlusCircle className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:rotate-90" />
            Add Task
          </Button>
          <Button 
            onClick={() => onQuickAction("update_status")}
            variant="outline"
            size="sm"
            className="flex-1 h-10 text-sm font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-md border-buildease-orange-300 text-buildease-orange-700 hover:bg-buildease-orange-50 dark:border-buildease-orange-600 dark:text-buildease-orange-400 dark:hover:bg-buildease-orange-900/20"
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
