import * as React from "react";
import { cn } from "@/utils/core/ui";

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  "2xl"?: number;
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols = 1, sm, md, lg, xl, "2xl": xxl, ...props }, ref) => {
    const gridCols = `grid-cols-${cols}`;
    const smCols = sm ? `sm:grid-cols-${sm}` : "";
    const mdCols = md ? `md:grid-cols-${md}` : "";
    const lgCols = lg ? `lg:grid-cols-${lg}` : "";
    const xlCols = xl ? `xl:grid-cols-${xl}` : "";
    const xxlCols = xxl ? `2xl:grid-cols-${xxl}` : "";

    return (
      <div
        ref={ref}
        className={cn(
          "grid",
          gridCols,
          smCols,
          mdCols,
          lgCols,
          xlCols,
          xxlCols,
          className
        )}
        {...props}
      />
    );
  }
);

Grid.displayName = "Grid";

export { Grid };
