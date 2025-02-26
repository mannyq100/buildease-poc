import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Create variant configurations for Card
const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground transition-all duration-300",
  {
    variants: {
      variant: {
        default: "shadow-sm hover:shadow-md dark:shadow-none dark:hover:shadow-md dark:hover:shadow-black/20 border-card-border",
        flat: "border-none shadow-none bg-muted/30",
        elevated: "shadow-md hover:shadow-lg dark:shadow-lg dark:shadow-black/20 dark:hover:shadow-xl dark:hover:shadow-black/30 border-card-border",
        glass: "bg-white/70 backdrop-blur-md border-white/20 dark:bg-slate-800/70 dark:border-slate-700/50 shadow-sm hover:shadow-md",
        gradient: "bg-gradient-to-b from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 border-card-border",
        outline: "bg-transparent border-2",
        glow: "border-primary/20 dark:border-primary/30 shadow-sm hover:shadow-primary/20 dark:hover:shadow-primary/30",
      },
      hover: {
        default: "",
        lift: "hover:-translate-y-1",
        scale: "hover:scale-[1.02]",
        border: "hover:border-primary dark:hover:border-primary",
        glow: "hover:glow-primary",
      },
      animation: {
        none: "",
        fadeIn: "animate-fade-in",
        slideUp: "animate-slide-up",
        pulse: "animate-pulse-subtle",
        float: "animate-float",
      },
      padding: {
        default: "",
        sm: "[&>*:not(:first-child)]:p-3 [&>*:first-child]:p-3",
        md: "[&>*:not(:first-child)]:p-4 [&>*:first-child]:p-4",
        lg: "[&>*:not(:first-child)]:p-6 [&>*:first-child]:p-6",
        xl: "[&>*:not(:first-child)]:p-8 [&>*:first-child]:p-8",
        none: "[&>*]:p-0",
      }
    },
    defaultVariants: {
      variant: "default",
      hover: "default",
      animation: "none",
      padding: "default",
    },
  }
)

export interface CardProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, hover, animation, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, hover, animation, padding, className }))}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 transition-all duration-200", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight transition-colors",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground transition-colors", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0 transition-all duration-200", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0 transition-all duration-200", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
