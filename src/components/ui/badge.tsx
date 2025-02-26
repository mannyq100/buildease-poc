import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: 
          "border-transparent bg-success text-success-foreground hover:bg-success/80",
        warning:
          "border-transparent bg-warning text-warning-foreground hover:bg-warning/80",
        info:
          "border-transparent bg-info text-info-foreground hover:bg-info/80",
        gradient: 
          "border-transparent bg-gradient-to-r from-primary to-secondary text-primary-foreground",
        "gradient-success": 
          "border-transparent bg-gradient-to-r from-success to-success-lighter text-success-foreground",
        "gradient-destructive": 
          "border-transparent bg-gradient-to-r from-destructive to-destructive-lighter text-destructive-foreground",
        "gradient-warning": 
          "border-transparent bg-gradient-to-r from-warning to-warning-lighter text-warning-foreground",
        glass:
          "border-transparent bg-white/20 backdrop-blur-md text-foreground construction-glass-badge",
        dot:
          "pl-1.5 bg-transparent dark:text-white flex items-center before:content-[''] before:h-1.5 before:w-1.5 before:rounded-full before:bg-current before:mr-1",
        // Construction theme specific badge styles
        blueprint: 
          "border-2 border-input bg-white text-foreground construction-blueprint-badge",
        steel: 
          "border-transparent text-white construction-steel-badge",
        concrete: 
          "border-transparent bg-gray-400 text-white font-bold",
        wood: 
          "border-transparent text-white construction-wood-badge",
        status: 
          "border text-foreground construction-status-badge",
        priority:
          "border-2 text-foreground construction-priority-badge",
        phase:
          "text-white construction-phase-badge",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-[10px]",
        lg: "px-3 py-1 text-sm",
        xl: "px-4 py-1.5 text-base rounded-full",
      },
      animation: {
        none: "",
        pulse: "animate-pulse",
        bounce: "animate-bounce",
        glow: "animate-glow",
      },
      rounded: {
        default: "rounded-full",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-xl",
      },
      interactive: {
        false: "",
        true: "cursor-pointer hover:opacity-80 active:scale-95 transition-transform",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none",
      rounded: "default",
      interactive: false,
    },
  }
)

// Add construction theme badge styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .dark .construction-glass-badge {
      background-color: hsla(var(--deepblue), 0.3);
      color: white;
    }
    
    .construction-blueprint-badge {
      border-color: hsl(var(--deepblue));
      color: hsl(var(--deepblue));
      font-weight: bold;
    }
    
    .construction-steel-badge {
      background-color: hsl(var(--deepblue-light));
      font-weight: bold;
    }
    
    .construction-wood-badge {
      background-color: hsl(var(--burntorange-dark));
      font-weight: bold;
    }
    
    .construction-status-badge {
      border-color: hsl(var(--deepblue));
      color: hsl(var(--deepblue));
      font-weight: medium;
    }
    
    .dark .construction-status-badge {
      color: white;
      border-color: white;
    }
    
    .construction-priority-badge {
      border-color: hsl(var(--burntorange));
      color: hsl(var(--burntorange));
      font-weight: bold;
    }
    
    .construction-phase-badge {
      background: linear-gradient(to right, hsl(var(--deepblue)), hsl(var(--deepblue-light)));
      font-weight: bold;
    }
  `;
  document.head.appendChild(style);
}

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  withDot?: boolean
  dotColor?: string
  withBorder?: boolean
  borderColor?: string
}

function Badge({
  className,
  variant,
  size,
  animation,
  rounded,
  interactive,
  withDot,
  dotColor,
  withBorder,
  borderColor,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        badgeVariants({ variant, size, animation, rounded, interactive }),
        withBorder && "border-2",
        withBorder && borderColor ? borderColor : "",
        className
      )}
      {...props}
    >
      {withDot && (
        <span 
          className={`inline-block w-2 h-2 rounded-full mr-1.5 ${dotColor || "bg-current"}`}
        />
      )}
      {props.children}
    </div>
  )
}

export { Badge, badgeVariants }
