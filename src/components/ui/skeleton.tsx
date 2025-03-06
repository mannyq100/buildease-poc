import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circle" | "rect" | "card" | "button" | "avatar" | "input" | "table-row" | "chart";
  width?: string | number;
  height?: string | number;
  animated?: boolean;
  repeat?: number;
  className?: string;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "rect", width, height, animated = true, repeat = 1, ...props }, ref) => {
    const baseStyles = cn(
      "bg-slate-200 dark:bg-slate-700",
      animated && "animate-pulse",
      className
    );

    // Handle variant-specific styling
    const getVariantStyles = () => {
      switch (variant) {
        case "text":
          return "h-4 rounded-md";
        case "circle":
          return "rounded-full";
        case "card":
          return "rounded-lg h-[160px]";
        case "button":
          return "rounded-md h-10";
        case "avatar":
          return "rounded-full h-10 w-10";
        case "input":
          return "rounded-md h-10";
        case "table-row":
          return "h-12 rounded-md";
        case "chart":
          return "h-[200px] rounded-md";
        default:
          return "rounded-md";
      }
    };

    // Explicitly handle width and height from props
    const styles = {
      width: width ? (typeof width === "number" ? `${width}px` : width) : "auto",
      height: height ? (typeof height === "number" ? `${height}px` : height) : "auto",
    };

    const variantStyles = getVariantStyles();

    // Render multiple skeletons if repeat > 1
    if (repeat > 1) {
      return (
        <div className="flex flex-col gap-2">
          {Array.from({ length: repeat }).map((_, i) => (
            <div
              key={i}
              ref={i === 0 ? ref : null}
              className={cn(baseStyles, variantStyles)}
              style={styles}
              {...props}
            />
          ))}
        </div>
      );
    }

    return (
      <div 
        ref={ref}
        className={cn(baseStyles, variantStyles)}
        style={styles}
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";

// Composite skeleton components for common patterns
const CardSkeleton = ({ className }: { className?: string }) => (
  <div className={cn("space-y-3", className)}>
    <Skeleton variant="card" className="w-full" />
    <div className="space-y-2">
      <Skeleton variant="text" className="w-1/3" />
      <Skeleton variant="text" repeat={2} className="w-full" />
    </div>
  </div>
);

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton variant="text" className="w-1/4 h-8" />
      <Skeleton variant="text" className="w-2/4 h-4" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} variant="card" className="h-[100px]" />
      ))}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Skeleton variant="chart" />
      <Skeleton variant="chart" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} variant="card" className="h-[120px]" />
      ))}
    </div>
  </div>
);

const TableSkeleton = ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => (
  <div className="space-y-3">
    <div className="flex gap-4 w-full">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} variant="text" className="h-6 flex-1" />
      ))}
    </div>
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="table-row" className="w-full" />
      ))}
    </div>
  </div>
);

// Export all components
export { Skeleton, CardSkeleton, DashboardSkeleton, TableSkeleton };
