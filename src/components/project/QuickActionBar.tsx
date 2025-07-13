import * as React from "react";
import { cn } from "@/utils/core/ui";
import { Button, ButtonProps } from "@/components/ui/button";

export interface Action extends ButtonProps {
  id: string;
  label: string;
  icon?: React.ReactNode;
  priority?: "high" | "medium" | "low";
}

export interface QuickActionBarProps {
  actions: Action[];
  layout?: "horizontal" | "vertical";
  priority?: "high" | "medium" | "low";
  className?: string;
}

const QuickActionBar = React.forwardRef<
  HTMLDivElement,
  QuickActionBarProps
>(({ className, actions, layout = "horizontal", priority, ...props }, ref) => {
  const getPriorityVariant = (actionPriority?: "high" | "medium" | "low") => {
    const effectivePriority = actionPriority || priority || "medium";
    switch (effectivePriority) {
      case "high":
        return "default";
      case "medium":
        return "outline";
      case "low":
        return "ghost";
      default:
        return "outline";
    }
  };

  const getResponsiveLayout = () => {
    if (layout === "vertical") return "flex-col";
    return "flex-row flex-wrap sm:flex-nowrap";
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-center p-4 bg-white/95 dark:bg-gray-900/95 border border-slate-200/60 dark:border-slate-800/60 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 backdrop-blur-sm">
        <div
          ref={ref}
          className={cn(
            "flex gap-3",
            getResponsiveLayout(),
            layout === "horizontal" && "overflow-x-auto scrollbar-hide",
          )}
          {...props}
        >
          {actions.map(({ id, label, icon, priority: actionPriority, ...rest }) => {
            const isHighPriority = actionPriority === "high";
            const isMediumPriority = actionPriority === "medium";
            
            return (
              <Button 
                key={id} 
                variant={getPriorityVariant(actionPriority)}
                size="sm"
                className={cn(
                  "flex-shrink-0 min-w-fit gap-2 h-10 px-4 transition-all duration-300 hover:scale-[1.05] hover:shadow-md group",
                  layout === "horizontal" && "whitespace-nowrap",
                  isHighPriority && "bg-buildease-blue-600 hover:bg-buildease-blue-700 text-white dark:bg-buildease-blue-500 dark:hover:bg-buildease-blue-600 border-buildease-blue-600",
                  isMediumPriority && "border-buildease-orange-300 text-buildease-orange-700 hover:bg-buildease-orange-50 dark:border-buildease-orange-600 dark:text-buildease-orange-400 dark:hover:bg-buildease-orange-900/20",
                )}
                {...rest}
              >
                <span className="transition-transform duration-300 group-hover:scale-110">{icon}</span>
                <span className="font-semibold">{label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
});

QuickActionBar.displayName = "QuickActionBar";

export { QuickActionBar };
