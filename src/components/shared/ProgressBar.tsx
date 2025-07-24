import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/core/ui";

const progressVariants = cva("relative w-full overflow-hidden bg-surface-gray-100 dark:bg-surface-gray-800", {
  variants: {
    variant: {
      linear: "rounded-full",
      circular: "rounded-full",
      stepped: "rounded-lg",
    },
    size: {
      sm: "h-2",
      md: "h-4",
      lg: "h-6",
      xl: "h-8",
    },
  },
  defaultVariants: {
    variant: "linear",
    size: "md",
  },
});

const progressIndicatorVariants = cva("h-full transition-all duration-500 ease-out", {
  variants: {
    color: {
      primary: "bg-buildease-blue-600",
      secondary: "bg-slate-500",
      success: "bg-green-500",
      warning: "bg-buildease-orange-500",
      danger: "bg-red-500",
      accent: "bg-buildease-orange-600",
    },
    variant: {
      linear: "rounded-full",
      circular: "rounded-full",
      stepped: "rounded-lg",
    },
  },
  defaultVariants: {
    color: "primary",
    variant: "linear",
  },
});

export interface ProgressBarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants>,
    VariantProps<typeof progressIndicatorVariants> {
  value: number;
  max?: number;
  showLabel?: boolean;
  showPercentage?: boolean;
  label?: string;
  steps?: number; // For stepped progress
  currentStep?: number; // For stepped progress
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ 
    className, 
    variant, 
    size, 
    color, 
    value, 
    max = 100, 
    showLabel = false, 
    showPercentage = false,
    label,
    steps,
    currentStep,
    ...props 
  }, ref) => {
    const progressValue = Math.max(0, Math.min(max, value));
    const percentage = (progressValue / max) * 100;

    // Circular Progress Variant
    if (variant === "circular") {
      const radius = size === "sm" ? 35 : size === "lg" ? 55 : size === "xl" ? 65 : 45;
      const strokeWidth = size === "sm" ? 6 : size === "lg" ? 12 : size === "xl" ? 14 : 8;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (percentage / 100) * circumference;
      const svgSize = (radius + strokeWidth) * 2 + 4;

      return (
        <div ref={ref} className={cn("relative inline-flex items-center justify-center", className)} {...props}>
          <svg 
            width={svgSize} 
            height={svgSize} 
            viewBox={`0 0 ${svgSize} ${svgSize}`}
            className="transform -rotate-90"
          >
            {/* Background circle */}
            <circle
              className="text-surface-gray-100 dark:text-surface-gray-800"
              strokeWidth={strokeWidth}
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx={svgSize / 2}
              cy={svgSize / 2}
            />
            {/* Progress circle */}
            <circle
              className={cn(progressIndicatorVariants({ color }))}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx={svgSize / 2}
              cy={svgSize / 2}
            />
          </svg>
          {(showLabel || showPercentage) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              {showPercentage && (
                <span className={cn(
                  "font-semibold text-slate-900 dark:text-slate-100",
                  size === "sm" ? "text-xs" : size === "lg" ? "text-lg" : size === "xl" ? "text-xl" : "text-sm"
                )}>
                  {Math.round(percentage)}%
                </span>
              )}
              {showLabel && label && (
                <span className={cn(
                  "text-slate-600 dark:text-slate-400",
                  size === "sm" ? "text-xs" : "text-sm"
                )}>
                  {label}
                </span>
              )}
            </div>
          )}
        </div>
      );
    }

    // Stepped Progress Variant
    if (variant === "stepped" && steps && currentStep !== undefined) {
      return (
        <div ref={ref} className={cn("space-y-2", className)} {...props}>
          {showLabel && label && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{label}</span>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {currentStep} of {steps}
              </span>
            </div>
          )}
          <div className="flex gap-2">
            {Array.from({ length: steps }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "flex-1 transition-all duration-300",
                  progressVariants({ size }),
                  index < currentStep 
                    ? progressIndicatorVariants({ color, variant }) 
                    : "bg-surface-gray-200 dark:bg-surface-gray-700"
                )}
              />
            ))}
          </div>
        </div>
      );
    }

    // Linear Progress Variant (default)
    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {(showLabel || showPercentage) && (
          <div className="flex justify-between items-center">
            {showLabel && label && (
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{label}</span>
            )}
            {showPercentage && (
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}
        <div className={cn(progressVariants({ variant, size }))}>
          <div
            className={cn(progressIndicatorVariants({ color, variant }))}
            style={{ width: `${percentage}%` }}
          />
          {/* Gradient overlay for enhanced visual appeal */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-30 pointer-events-none"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = "ProgressBar";

// Specialized progress components for BuildEase use cases
interface BudgetProgressProps extends Omit<ProgressBarProps, 'value' | 'max'> {
  spent: number;
  total: number;
  currency?: string;
}

export const BudgetProgress = React.forwardRef<HTMLDivElement, BudgetProgressProps>(
  ({ spent, total, currency = "$", ...props }, ref) => {
    const percentage = total > 0 ? (spent / total) * 100 : 0;
    const isOverBudget = spent > total;
    
    return (
      <ProgressBar
        ref={ref}
        value={spent}
        max={total}
        color={isOverBudget ? "danger" : percentage > 80 ? "warning" : "primary"}
        showLabel
        showPercentage
        label={`Budget: ${currency}${spent.toLocaleString()} / ${currency}${total.toLocaleString()}`}
        {...props}
      />
    );
  }
);

BudgetProgress.displayName = "BudgetProgress";

interface PhaseProgressProps extends Omit<ProgressBarProps, 'value' | 'max'> {
  completedTasks: number;
  totalTasks: number;
  phaseName?: string;
}

export const PhaseProgress = React.forwardRef<HTMLDivElement, PhaseProgressProps>(
  ({ completedTasks, totalTasks, phaseName, ...props }, ref) => {
    const percentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    return (
      <ProgressBar
        ref={ref}
        value={completedTasks}
        max={totalTasks}
        color="primary"
        showLabel
        showPercentage
        label={phaseName ? `${phaseName}: ${completedTasks}/${totalTasks} tasks` : `${completedTasks}/${totalTasks} tasks`}
        {...props}
      />
    );
  }
);

PhaseProgress.displayName = "PhaseProgress";

export { ProgressBar, progressVariants, progressIndicatorVariants };