import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/core/ui";

const progressVariants = cva("relative w-full overflow-hidden rounded-full bg-surface-gray-100 dark:bg-surface-gray-800", {
  variants: {
    variant: {
      linear: "h-4",
      circular: "h-20 w-20 rounded-full",
    },
    size: {
      sm: "h-2",
      md: "h-4",
      lg: "h-6",
    },
  },
  defaultVariants: {
    variant: "linear",
    size: "md",
  },
});

const progressIndicatorVariants = cva("h-full rounded-full transition-all duration-500 ease-out", {
  variants: {
    color: {
      primary: "bg-buildease-blue-600",
      success: "bg-green-500",
      warning: "bg-buildease-orange-500",
      danger: "bg-red-500",
    },
  },
  defaultVariants: {
    color: "primary",
  },
});

export interface ProgressBarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants>,
    VariantProps<typeof progressIndicatorVariants> {
  value: number;
  showLabel?: boolean;
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, variant, size, color, value, showLabel, ...props }, ref) => {
    const progressValue = Math.max(0, Math.min(100, value));

    if (variant === "circular") {
      const radius = 45;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (progressValue / 100) * circumference;

      return (
        <div ref={ref} className={cn(progressVariants({ variant, size, className }))} {...props}>
          <svg className="h-full w-full" viewBox="0 0 100 100">
            <circle
              className="text-surface-gray-100 dark:text-surface-gray-800"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="50"
              cy="50"
            />
            <circle
              className={cn(progressIndicatorVariants({ color }))}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="50"
              cy="50"
              style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
            />
          </svg>
          {showLabel && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-semibold">{`${progressValue}%`}</span>
            </div>
          )}
        </div>
      );
    }

    return (
      <div ref={ref} className={cn(progressVariants({ variant, size, className }))} {...props}>
        <div
          className={cn(progressIndicatorVariants({ color }))}
          style={{ width: `${progressValue}%` }}
        />
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold text-white">{`${progressValue}%`}</span>
          </div>
        )}
      </div>
    );
  }
);

ProgressBar.displayName = "ProgressBar";

export { ProgressBar };
