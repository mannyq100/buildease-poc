import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md dark:shadow-primary/20 dark:hover:shadow-md dark:hover:shadow-primary/40",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md dark:shadow-destructive/20 dark:hover:shadow-md dark:hover:shadow-destructive/40",
        outline:
          "border border-input bg-background hover:bg-accent/10 hover:text-accent-foreground dark:hover:bg-accent/20 dark:border-slate-700",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md dark:shadow-secondary/20 dark:hover:shadow-md dark:hover:shadow-secondary/40",
        ghost: "hover:bg-accent/10 hover:text-accent-foreground dark:hover:bg-accent/20",
        link: "text-primary underline-offset-4 hover:underline",
        gradient: "bg-gradient-to-r from-primary to-primary-lighter dark:from-primary-darker dark:to-primary text-primary-foreground shadow-sm hover:shadow-md dark:shadow-primary/20 dark:hover:shadow-md dark:hover:shadow-primary/40 hover:translate-y-[-2px]",
        glow: "bg-primary text-primary-foreground hover:bg-primary/90 hover:glow-primary transition-shadow dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90",
        success: "bg-success text-success-foreground hover:bg-success/90 shadow-sm hover:shadow-md dark:shadow-success/20 dark:hover:shadow-md dark:hover:shadow-success/40",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 shadow-sm hover:shadow-md dark:shadow-warning/20 dark:hover:shadow-md dark:hover:shadow-warning/40",
        info: "bg-info text-info-foreground hover:bg-info/90 shadow-sm hover:shadow-md dark:shadow-info/20 dark:hover:shadow-md dark:hover:shadow-info/40",
        glass: "bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-800/80 text-gray-900 dark:text-white shadow-sm hover:shadow-md",
        primary: "text-white shadow-md hover:shadow-lg border-b-4 hover:-translate-y-[1px] active:border-b-2 active:translate-y-[2px] construction-primary-btn",
        accent: "text-white shadow-md hover:shadow-lg border-b-4 hover:-translate-y-[1px] active:border-b-2 active:translate-y-[2px] construction-accent-btn",
        construction: "text-white shadow-md hover:shadow-lg hover:-translate-y-[1px] font-bold relative overflow-hidden after:absolute after:inset-0 after:w-full after:h-full after:bg-white after:opacity-0 hover:after:opacity-10 after:transition-opacity construction-gradient-btn",
        blueprint: "text-white font-bold construction-blueprint-btn",
        tool: "text-white shadow-md hover:shadow-lg hover:-translate-y-[1px] font-bold construction-tool-btn",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "mobile": "h-11 rounded-md px-4 py-2",
      },
      rounded: {
        default: "rounded-md",
        full: "rounded-full",
        lg: "rounded-lg",
        xl: "rounded-xl",
        none: "rounded-none",
      },
      animation: {
        none: "",
        pulse: "animate-pulse",
        bounce: "animate-bounce",
        spin: "[&_svg]:animate-spin",
        float: "animate-float",
        glow: "animate-glow",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
      animation: "none",
    },
  }
)

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .construction-primary-btn {
      background-color: hsl(var(--deepblue));
      border-color: hsl(var(--deepblue-dark));
    }
    .construction-primary-btn:hover {
      background-color: hsl(var(--deepblue-light));
    }
    
    .construction-accent-btn {
      background-color: hsl(var(--burntorange));
      border-color: hsl(var(--burntorange-dark));
    }
    .construction-accent-btn:hover {
      background-color: hsl(var(--burntorange-light));
    }
    
    .construction-gradient-btn {
      background: linear-gradient(to right, hsl(var(--deepblue)), hsl(var(--deepblue-light)));
    }
    
    .construction-blueprint-btn {
      background-color: white;
      color: hsl(var(--deepblue));
      border: 2px solid hsl(var(--deepblue));
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .construction-blueprint-btn:hover {
      background-color: hsl(var(--lightgray));
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }
    
    .construction-tool-btn {
      background: linear-gradient(to right, hsl(var(--warning)), hsl(var(--warning-lighter)));
    }
  `;
  document.head.appendChild(style);
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, rounded, animation, asChild = false, isLoading, leftIcon, rightIcon, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, rounded, animation, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {!isLoading && leftIcon}
        {children}
        {!isLoading && rightIcon}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
