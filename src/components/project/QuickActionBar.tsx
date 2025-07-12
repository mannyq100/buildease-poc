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
    <div
      ref={ref}
      className={cn(
        "flex gap-2",
        getResponsiveLayout(),
        layout === "horizontal" && "overflow-x-auto scrollbar-hide",
        className
      )}
      {...props}
    >
      {actions.map(({ id, label, icon, priority: actionPriority, ...rest }) => (
        <Button 
          key={id} 
          variant={getPriorityVariant(actionPriority)}
          className={cn(
            "flex-shrink-0 min-w-0",
            layout === "horizontal" && "whitespace-nowrap",
            actionPriority === "high" && "bg-gradient-to-r from-buildease-orange-600 to-buildease-orange-700 hover:from-buildease-orange-700 hover:to-buildease-orange-800 text-white border-0 shadow-lg hover:shadow-xl"
          )}
          {...rest}
        >
          {icon && <span className="mr-2">{icon}</span>}
          {label}
        </Button>
      ))}
    </div>
  );
});

QuickActionBar.displayName = "QuickActionBar";

export { QuickActionBar };
