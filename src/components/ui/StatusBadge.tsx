import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/core/ui";
import type { ProjectStatus } from '@/types/database';

const statusBadgeVariants = cva(
  "inline-flex items-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "rounded-full border-0",
        dot: "bg-transparent border-0",
        pill: "rounded-full border-0", 
        outline: "rounded-full border",
      },
      status: {
        // Planning phase - Blue
        planning: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        // Active work - Orange (BuildEase accent)
        "in-progress": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
        // Completed - Green
        completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        // On hold - Yellow/Amber
        "on-hold": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        // Cancelled - Red
        cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        // Pending - Gray
        pending: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
        // Upcoming - Light blue
        upcoming: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300",
      },
      size: {
        sm: "text-xs px-2 py-1",
        md: "text-sm px-2.5 py-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      status: "planning",
      size: "md",
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  status: ProjectStatus | "pending" | "in-progress" | "completed" | "on-hold" | "cancelled" | "upcoming" | "planning";
  label?: string; // Optional custom label
}

const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ className, variant, status, size, label, children, ...props }, ref) => {
    const getStatusLabel = (status: string) => {
      if (label) return label;
      if (children) return children;
      
      switch (status.toLowerCase()) {
        case 'planning': return 'Planning';
        case 'in-progress': 
        case 'in_progress': return 'In Progress';
        case 'completed': return 'Completed';
        case 'on-hold':
        case 'on_hold': return 'On Hold';
        case 'cancelled': return 'Cancelled';
        case 'pending': return 'Pending';
        default: return status.charAt(0).toUpperCase() + status.slice(1);
      }
    };

    const getDotColor = (status: string) => {
      switch (status.toLowerCase()) {
        case 'planning': return 'bg-blue-500';
        case 'in-progress':
        case 'in_progress': return 'bg-orange-500';
        case 'completed': return 'bg-green-500';
        case 'on-hold':
        case 'on_hold': return 'bg-yellow-500';
        case 'cancelled': return 'bg-red-500';
        case 'pending': return 'bg-gray-500';
        default: return 'bg-gray-500';
      }
    };

    // Normalize status for variants
    const normalizedStatus = status.toLowerCase().replace('_', '-') as keyof typeof statusBadgeVariants.variants.status;

    if (variant === "dot") {
      return (
        <div
          ref={ref}
          className={cn("flex items-center gap-2", className)}
          {...props}
        >
          <div className={cn("w-2 h-2 rounded-full", getDotColor(status))} />
          <span className={cn("font-medium", size === "sm" ? "text-xs" : "text-sm")}>
            {getStatusLabel(status)}
          </span>
        </div>
      );
    }

    if (variant === "outline") {
      return (
        <div
          ref={ref}
          className={cn(
            statusBadgeVariants({ variant: "default", status: normalizedStatus, size }),
            "bg-transparent border border-current",
            className
          )}
          {...props}
        >
          {getStatusLabel(status)}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(statusBadgeVariants({ variant, status: normalizedStatus, size }), className)}
        {...props}
      >
        {getStatusLabel(status)}
      </div>
    );
  }
);

StatusBadge.displayName = "StatusBadge";

export { StatusBadge, statusBadgeVariants };
