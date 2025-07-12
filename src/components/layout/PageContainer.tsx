import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/core/ui";

const pageContainerVariants = cva(
  "mx-auto w-full",
  {
    variants: {
      maxWidth: {
        sm: "max-w-sm",
        md: "max-w-md", 
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
        "7xl": "max-w-7xl",
        full: "max-w-full"
      },
      padding: {
        none: "",
        sm: "px-4 py-4 sm:px-6 sm:py-6",
        md: "px-4 py-6 sm:px-6 lg:px-8",
        lg: "px-6 py-8 sm:px-8 lg:px-12"
      }
    },
    defaultVariants: {
      maxWidth: "7xl",
      padding: "md"
    }
  }
);

export interface PageContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pageContainerVariants> {}

/**
 * PageContainer - Consistent layout container for pages
 * Provides responsive max-width and consistent spacing according to BuildEase design system
 */
const PageContainer = React.forwardRef<HTMLDivElement, PageContainerProps>(
  ({ className, maxWidth, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(pageContainerVariants({ maxWidth, padding }), className)}
        {...props}
      />
    );
  }
);

PageContainer.displayName = "PageContainer";

export { PageContainer, pageContainerVariants };
