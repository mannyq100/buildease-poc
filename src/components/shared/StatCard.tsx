import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/core/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const statCardVariants = cva("w-full", {
  variants: {
    variant: {
      default: "",
      minimal: "bg-transparent shadow-none border-none",
    },
    colorScheme: {
      blue: "border-buildease-blue-200/50 dark:border-buildease-blue-800/50",
      green: "border-green-200/50 dark:border-green-800/50",
      amber: "border-amber-200/50 dark:border-amber-800/50",
      red: "border-red-200/50 dark:border-red-800/50",
      purple: "border-purple-200/50 dark:border-purple-800/50",
      primary: "border-buildease-blue-200/50 dark:border-buildease-blue-800/50",
      success: "border-green-200/50 dark:border-green-800/50",
      accent: "border-buildease-orange-200/50 dark:border-buildease-orange-800/50",
      warning: "border-amber-200/50 dark:border-amber-800/50",
    },
  },
  defaultVariants: {
    variant: "default",
    colorScheme: "blue",
  },
});

export interface StatCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>, VariantProps<typeof statCardVariants> {
  // Legacy props for backward compatibility
  label?: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: number | { value: number; isPositive: boolean; label?: string };
  
  // Enhanced props for MetricCard compatibility
  title?: string;
  subtitle?: string;
  description?: string;
  colorScheme?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'primary' | 'success' | 'accent' | 'warning';
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ 
    className, 
    variant, 
    colorScheme,
    // Legacy props
    label, 
    value, 
    icon, 
    trend,
    // Enhanced props
    title,
    subtitle,
    description,
    ...props 
  }, ref) => {
    // Use title or label for the card title
    const cardTitle = title || label;
    
    // Handle trend formatting
    const getTrendDisplay = () => {
      if (!trend) return null;
      
      if (typeof trend === 'object') {
        const { value: trendValue, isPositive, label: trendLabel } = trend;
        const trendColor = isPositive ? "text-status-success" : "text-status-error";
        const prefix = isPositive ? "+" : "";
        return (
          <p className={`text-xs ${trendColor}`}>
            {prefix}{trendValue}% {trendLabel || 'from last month'}
          </p>
        );
      }
      
      // Legacy number trend
      const trendColor = trend > 0 ? "text-status-success" : trend < 0 ? "text-status-error" : "text-muted-foreground";
      return (
        <p className={`text-xs ${trendColor}`}>
          {trend > 0 ? `+${trend}%` : `${trend}%`} from last month
        </p>
      );
    };

    return (
      <Card ref={ref} className={cn(statCardVariants({ variant, colorScheme, className }))} {...props}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{cardTitle}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
          {getTrendDisplay()}
        </CardContent>
      </Card>
    );
  }
);

StatCard.displayName = "StatCard";

export { StatCard };
