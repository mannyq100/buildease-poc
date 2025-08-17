import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/core/ui";
import type { ProjectStatus } from '@/types/project';
import type { Material } from '@/types/materials';

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
        // Planning phase - Blue (BuildEase primary)
        planning: "bg-buildease-blue-100 text-buildease-blue-800 dark:bg-buildease-blue-900/30 dark:text-buildease-blue-400",
        // Active work - Orange (BuildEase accent)
        "in-progress": "bg-buildease-orange-100 text-buildease-orange-800 dark:bg-buildease-orange-900/30 dark:text-buildease-orange-400",
        active: "bg-buildease-orange-100 text-buildease-orange-800 dark:bg-buildease-orange-900/30 dark:text-buildease-orange-400",
        // Completed - Green
        completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        // On hold - Yellow/Amber
        "on-hold": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        // Cancelled/Delayed - Red
        cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        delayed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        // Pending - Gray
        pending: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
        // Upcoming - Light blue
        upcoming: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300",
        // Additional statuses for materials and tasks
        ordered: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        delivered: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300",
        "in-use": "bg-buildease-orange-50 text-buildease-orange-700 dark:bg-buildease-orange-900/20 dark:text-buildease-orange-300",
        // Status variants
        success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      },
      size: {
        sm: "text-xs px-2 py-1",
        md: "text-sm px-2.5 py-1.5",
        lg: "text-base px-3 py-2",
      },
    },
    defaultVariants: {
      variant: "default",
      status: "planning",
      size: "md",
    },
  }
);

// Allowed status variant keys for the badge (must mirror cva "status" keys above)
const STATUS_KEYS = [
  "planning",
  "in-progress",
  "active",
  "completed",
  "on-hold",
  "cancelled",
  "delayed",
  "pending",
  "upcoming",
  "ordered",
  "delivered",
  "in-use",
  "success",
  "warning",
  "error",
  "info",
] as const;
type StatusKey = typeof STATUS_KEYS[number];

export interface StatusBadgeProps
  extends Omit<VariantProps<typeof statusBadgeVariants>, 'status'>,
    React.HTMLAttributes<HTMLDivElement> {
  // Accept broad inputs; component normalizes to our StatusKey
  status: ProjectStatus | Material['status'] | string;
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
        case 'delayed': return 'Delayed';
        case 'pending': return 'Pending';
        case 'active': return 'Active';
        case 'upcoming': return 'Upcoming';
        case 'ordered': return 'Ordered';
        case 'delivered': return 'Delivered';
        case 'in-use': 
        case 'in_use': return 'In Use';
        case 'success': return 'Success';
        case 'warning': return 'Warning';
        case 'error': return 'Error';
        case 'info': return 'Info';
        default: return status.charAt(0).toUpperCase() + status.slice(1);
      }
    };

    const getDotColor = (status: string) => {
      switch (status.toLowerCase()) {
        case 'planning': return 'bg-buildease-blue-500';
        case 'in-progress':
        case 'in_progress':
        case 'active': return 'bg-buildease-orange-500';
        case 'completed': return 'bg-green-500';
        case 'on-hold':
        case 'on_hold': return 'bg-yellow-500';
        case 'cancelled':
        case 'delayed': return 'bg-red-500';
        case 'pending': return 'bg-gray-500';
        case 'upcoming': return 'bg-blue-400';
        case 'ordered': return 'bg-blue-500';
        case 'delivered': return 'bg-green-400';
        case 'in-use':
        case 'in_use': return 'bg-buildease-orange-400';
        case 'success': return 'bg-green-500';
        case 'warning': return 'bg-yellow-500';
        case 'error': return 'bg-red-500';
        case 'info': return 'bg-blue-500';
        default: return 'bg-gray-500';
      }
    };

    // Normalize status for variants (handle undefined and different naming styles)
    const statusStr = String(status ?? 'planning');
    const normalized = statusStr.toLowerCase().replace(/_/g, '-') as StatusKey;
    const isValidVariantKey = (STATUS_KEYS as readonly string[]).includes(normalized);
    const effectiveStatus = (isValidVariantKey ? normalized : 'planning') as StatusKey;

    if (variant === "dot") {
      return (
        <div
          ref={ref}
          className={cn("flex items-center gap-2", className)}
          {...props}
        >
          <div className={cn("w-2 h-2 rounded-full", getDotColor(statusStr))} />
          <span className={cn("font-medium", size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm")}>
            {getStatusLabel(statusStr)}
          </span>
        </div>
      );
    }

    if (variant === "outline") {
      return (
        <div
          ref={ref}
          className={cn(
            statusBadgeVariants({ variant: "default", status: effectiveStatus, size }),
            "bg-transparent border border-current",
            className
          )}
          {...props}
        >
          {getStatusLabel(statusStr)}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(statusBadgeVariants({ variant, status: effectiveStatus, size }), className)}
        {...props}
      >
        {getStatusLabel(statusStr)}
      </div>
    );
  }
);

StatusBadge.displayName = "StatusBadge";

export { StatusBadge, statusBadgeVariants }; 