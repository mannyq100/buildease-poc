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
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof statCardVariants> {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: number;
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, variant, label, value, icon, trend, ...props }, ref) => {
    const trendColor = trend && trend > 0 ? "text-status-success" : trend && trend < 0 ? "text-status-error" : "text-muted-foreground";

    return (
      <Card ref={ref} className={cn(statCardVariants({ variant, className }))} {...props}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{label}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {trend !== undefined && (
            <p className={`text-xs ${trendColor}`}>
              {trend > 0 ? `+${trend}%` : `${trend}%`} from last month
            </p>
          )}
        </CardContent>
      </Card>
    );
  }
);

StatCard.displayName = "StatCard";

export { StatCard };
