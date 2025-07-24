import * as React from "react";
import { cn } from "@/utils/core/ui";

interface BaseLoadingProps {
  className?: string;
  animated?: boolean;
}

interface SkeletonProps extends BaseLoadingProps {
  variant?: "text" | "circle" | "rect" | "card" | "button" | "avatar" | "input" | "table-row" | "chart";
  width?: string | number;
  height?: string | number;
  repeat?: number;
}

// Basic Skeleton Component
const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "rect", width, height, animated = true, repeat = 1, ...props }, ref) => {
    const baseStyles = cn(
      "bg-slate-200 dark:bg-slate-700",
      animated && "animate-pulse",
      className
    );

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

    const styles = {
      width: width ? (typeof width === "number" ? `${width}px` : width) : "auto",
      height: height ? (typeof height === "number" ? `${height}px` : height) : "auto",
    };

    const variantStyles = getVariantStyles();

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

// Loading Spinner
interface SpinnerProps extends BaseLoadingProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "secondary" | "accent";
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "md", color = "primary", ...props }, ref) => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-6 h-6", 
      lg: "w-8 h-8",
      xl: "w-12 h-12"
    };

    const colorClasses = {
      primary: "text-buildease-blue-600",
      secondary: "text-slate-600",
      accent: "text-buildease-orange-600"
    };

    return (
      <div
        ref={ref}
        className={cn(
          "animate-spin rounded-full border-2 border-current border-t-transparent",
          sizeClasses[size],
          colorClasses[color],
          className
        )}
        role="status"
        aria-label="Loading"
        {...props}
      >
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
);

LoadingSpinner.displayName = "LoadingSpinner";

// Composite Loading Components for specific BuildEase use cases
const ProjectCardSkeleton = ({ className }: BaseLoadingProps) => (
  <div className={cn("space-y-3 p-4 border rounded-lg", className)}>
    <Skeleton variant="rect" className="w-full h-48 rounded-lg" />
    <div className="space-y-2">
      <Skeleton variant="text" className="w-3/4 h-5" />
      <Skeleton variant="text" className="w-1/2 h-4" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton variant="text" className="w-1/4 h-4" />
        <Skeleton variant="text" className="w-1/4 h-4" />
      </div>
    </div>
  </div>
);

const DashboardSkeleton = ({ className }: BaseLoadingProps) => (
  <div className={cn("space-y-6", className)}>
    {/* Header */}
    <div className="space-y-2">
      <Skeleton variant="text" className="w-1/4 h-8" />
      <Skeleton variant="text" className="w-2/4 h-4" />
    </div>

    {/* Metrics Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} variant="card" className="h-[120px]" />
      ))}
    </div>

    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton variant="chart" className="h-[300px]" />
      <Skeleton variant="chart" className="h-[300px]" />
    </div>

    {/* Project Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

const TableSkeleton = ({ 
  rows = 5, 
  columns = 4, 
  className 
}: BaseLoadingProps & { rows?: number; columns?: number }) => (
  <div className={cn("space-y-3", className)}>
    {/* Header */}
    <div className="flex gap-4 w-full">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} variant="text" className="h-6 flex-1" />
      ))}
    </div>
    {/* Rows */}
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="table-row" className="w-full" />
      ))}
    </div>
  </div>
);

const PhaseCardSkeleton = ({ className }: BaseLoadingProps) => (
  <div className={cn("border rounded-lg p-4 space-y-4", className)}>
    <div className="flex items-center justify-between">
      <Skeleton variant="text" className="w-1/3 h-6" />
      <Skeleton variant="button" className="w-20 h-8" />
    </div>
    <Skeleton variant="text" className="w-full h-4" />
    <Skeleton variant="text" className="w-2/3 h-4" />
    <div className="space-y-2">
      <Skeleton variant="text" className="w-1/4 h-3" />
      <Skeleton variant="rect" className="w-full h-2 rounded-full" />
    </div>
  </div>
);

const TaskListSkeleton = ({ count = 5, className }: BaseLoadingProps & { count?: number }) => (
  <div className={cn("space-y-3", className)}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
        <Skeleton variant="circle" width={24} height={24} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-3/4 h-4" />
          <Skeleton variant="text" className="w-1/2 h-3" />
        </div>
        <Skeleton variant="button" className="w-16 h-6" />
      </div>
    ))}
  </div>
);

const TeamMembersSkeleton = ({ count = 4, className }: BaseLoadingProps & { count?: number }) => (
  <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4", className)}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="border rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton variant="avatar" />
          <div className="space-y-1 flex-1">
            <Skeleton variant="text" className="w-2/3 h-4" />
            <Skeleton variant="text" className="w-1/2 h-3" />
          </div>
        </div>
        <Skeleton variant="text" className="w-full h-3" />
        <Skeleton variant="button" className="w-full h-8" />
      </div>
    ))}
  </div>
);

// Centered Loading State with Spinner
const CenteredLoading = ({ 
  size = "md", 
  message = "Loading...", 
  className 
}: SpinnerProps & { message?: string }) => (
  <div className={cn("flex flex-col items-center justify-center py-12 space-y-4", className)}>
    <LoadingSpinner size={size} />
    <p className="text-sm text-slate-600 dark:text-slate-400">{message}</p>
  </div>
);

// Page Loading Overlay
const LoadingOverlay = ({ message = "Loading...", className }: BaseLoadingProps & { message?: string }) => (
  <div className={cn("fixed inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center", className)}>
    <div className="text-center space-y-4">
      <LoadingSpinner size="xl" />
      <p className="text-lg font-medium text-slate-900 dark:text-slate-100">{message}</p>
    </div>
  </div>
);

// Export all components
export {
  Skeleton,
  LoadingSpinner,
  ProjectCardSkeleton,
  DashboardSkeleton,
  TableSkeleton,
  PhaseCardSkeleton,
  TaskListSkeleton,
  TeamMembersSkeleton,
  CenteredLoading,
  LoadingOverlay,
};

export type {
  BaseLoadingProps,
  SkeletonProps,
  SpinnerProps,
};