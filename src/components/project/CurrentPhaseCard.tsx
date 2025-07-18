import * as React from "react";
import { cn } from "@/utils/core/ui";
import type { Phase, Task } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Calendar, CheckCircle2, Plus, RefreshCw } from "lucide-react";

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
export const CurrentPhaseCard = React.forwardRef<HTMLDivElement, CurrentPhaseCardProps>(
  ({ phase, tasks, onQuickAction, showTimeline = true, className, ...props }, ref) => {
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
    const urgentTasks = tasks.slice(0, 3);

    return (
      <Card
        ref={ref}
        className={cn(
          "w-full border border-slate-200/40 dark:border-slate-700/40 shadow-xl hover:shadow-2xl transition-all duration-700 bg-gradient-to-br from-white via-slate-50/30 to-buildease-blue-50/20 dark:from-gray-900 dark:via-slate-800/30 dark:to-buildease-blue-950/20 backdrop-blur-md rounded-2xl overflow-hidden group",
          className
        )}
        {...props}
      >
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="flex-1">
              <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Current Phase
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                What's happening right now
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status="in-progress" size="sm" variant="outline" />
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 px-6 pb-6">
          {/* Enhanced Phase details */}
          <div className="bg-gradient-to-r from-slate-50/50 to-buildease-blue-50/30 dark:from-slate-800/50 dark:to-buildease-blue-950/30 rounded-2xl p-5 border border-slate-200/30 dark:border-slate-700/30">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">{phase.name}</h3>
                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-3">
                  <Calendar className="h-4 w-4 mr-2 text-buildease-orange-500" />
                  <span className="font-medium">
                    Due {phase.endDate ? new Date(phase.endDate).toLocaleDateString() : 'TBD'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{Math.round(progress)}%</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Complete</div>
              </div>
            </div>
            
            {/* Enhanced Progress bar */}
            <div className="relative mb-4">
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 shadow-inner">
                <div 
                  className="h-3 bg-gradient-to-r from-buildease-blue-500 via-buildease-blue-400 to-emerald-500 rounded-full transition-all duration-700 ease-out shadow-sm relative overflow-hidden"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                </div>
              </div>
              {/* Progress indicators */}
              <div className="flex justify-between mt-2">
                {[25, 50, 75, 100].map((milestone) => (
                  <div key={milestone} className="flex flex-col items-center">
                    <div className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      progress >= milestone 
                        ? "bg-emerald-500 shadow-lg" 
                        : "bg-slate-300 dark:bg-slate-600"
                    )} />
                    <span className="text-xs text-slate-400 dark:text-slate-500 mt-1">{milestone}%</span>
                  </div>
                ))}
              </div>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {phase.description}
            </p>
          </div>

          {/* Enhanced Tasks section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-3 text-buildease-blue-500" /> 
                Upcoming Tasks
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full border border-emerald-200/50 dark:border-emerald-700/50">
                  {completedTasks}/{tasks.length} complete
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              {urgentTasks.map((task, index) => (
                <div 
                  key={task.id} 
                  className="group flex items-center gap-4 p-4 rounded-xl border border-slate-200/40 dark:border-slate-700/40 hover:border-buildease-blue-300/50 dark:hover:border-buildease-blue-600/50 hover:bg-gradient-to-r hover:from-white hover:to-buildease-blue-50/30 dark:hover:from-slate-800 dark:hover:to-buildease-blue-950/30 transition-all duration-300 hover:shadow-md"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex-shrink-0">
                    <CheckCircle2 
                      className={cn(
                        "h-5 w-5 transition-all duration-300 group-hover:scale-110",
                        task.status === "completed" 
                          ? "text-emerald-600 dark:text-emerald-400" 
                          : "text-slate-400 dark:text-slate-500 group-hover:text-buildease-blue-500"
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span 
                      className={cn(
                        "block text-sm font-medium transition-all duration-200 truncate",
                        task.status === "completed" 
                          ? "line-through text-slate-500 dark:text-slate-400" 
                          : "text-slate-900 dark:text-white group-hover:text-buildease-blue-700 dark:group-hover:text-buildease-blue-300"
                      )}
                    >
                      {task.name}
                    </span>
                  </div>
                  <div className="flex-shrink-0">
                    <StatusBadge status={task.status as any} size="sm" variant="outline" />
                  </div>
                </div>
              ))}
            </div>
            
            {urgentTasks.length === 0 && (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-medium">No urgent tasks at the moment</p>
                <p className="text-xs">You're all caught up!</p>
              </div>
            )}
          </div>

          {/* Enhanced Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200/30 dark:border-slate-700/30">
            <Button 
              onClick={() => onQuickAction("add_task")} 
              size="default" 
              className="flex-1 bg-gradient-to-r from-buildease-blue-600 to-buildease-blue-700 hover:from-buildease-blue-700 hover:to-buildease-blue-800 text-white transition-all duration-300 hover:shadow-lg hover:scale-[1.02] rounded-xl font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
            <Button 
              onClick={() => onQuickAction("update_status")} 
              variant="outline" 
              size="default" 
              className="flex-1 text-buildease-orange-700 hover:bg-buildease-orange-50 dark:text-buildease-orange-400 dark:hover:bg-buildease-orange-900/20 border-buildease-orange-200 dark:border-buildease-orange-700 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] rounded-xl font-semibold hover:border-buildease-orange-300 dark:hover:border-buildease-orange-600"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Update Status
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
);

CurrentPhaseCard.displayName = "CurrentPhaseCard";
