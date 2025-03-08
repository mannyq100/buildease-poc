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
        glass: "bg-white/70 backdrop-blur-md border-white/20 shadow-sm hover:shadow-md",
        gradient: "bg-gradient-to-b from-white to-gray-50 border-card-border",
        outline: "bg-transparent border-2",
        glow: "border-primary/20 dark:border-primary/30 shadow-sm hover:shadow-primary/20 dark:hover:shadow-primary/30",
        // Construction theme specific card styles
        blueprint: "border-2 border-deepblue bg-white bg-opacity-95 pattern-blueprint shadow-md hover:shadow-lg",
        project: "border-l-4 border-deepblue shadow-md hover:shadow-lg bg-white",
        material: "border border-burntorange/30 shadow-md hover:shadow-lg bg-white",
        task: "border-t-4 border-secondary shadow-md hover:shadow-lg bg-white",
        report: "border border-gray-200 shadow-md hover:shadow-lg bg-white",
      },
      hover: {
        default: "",
        lift: "hover:-translate-y-1",
        scale: "hover:scale-[1.02]",
        border: "hover:border-primary dark:hover:border-primary",
        glow: "hover:glow-primary",
        highlight: "hover:border-burntorange dark:hover:border-burntorange",
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
      },
      rounded: {
        default: "rounded-lg",
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-xl",
      }
    },
    defaultVariants: {
      variant: "default",
      hover: "default",
      animation: "none",
      padding: "default",
      rounded: "default",
    },
  }
)

export interface CardProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border border-gray-200 bg-white text-gray-950 shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50",
      // Add responsive padding - smaller on mobile
      "overflow-hidden",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

// Add dark mode styling with JavaScript
if (typeof document !== 'undefined') {
  const updateCardDarkMode = () => {
    const isDark = document.documentElement.classList.contains('dark');
    const cards = document.querySelectorAll('[data-variant]');
    
    cards.forEach((card) => {
      const variant = card.getAttribute('data-variant');
      
      if (isDark) {
        if (variant === 'glass') {
          card.classList.add('dark-glass');
        } else if (['project', 'material', 'task', 'report'].includes(variant || '')) {
          card.classList.add('dark-card-bg');
        }
      } else {
        card.classList.remove('dark-glass', 'dark-card-bg');
      }
    });
  };
  
  // Add the needed styles
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
      .dark-glass {
        background-color: hsla(var(--deepblue), 0.7) !important;
        border-color: hsla(var(--deepblue-light), 0.5) !important;
      }
      .dark-card-bg {
        background-color: hsl(var(--deepblue-dark)) !important;
      }
      .dark .dark-card-bg.material {
        border-color: hsla(var(--burntorange), 0.5) !important;
      }
    `;
    document.head.appendChild(style);
    
    // Set up listeners for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          updateCardDarkMode();
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    // Initial update
    updateCardDarkMode();
  }
}

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-4 sm:p-6", className)}
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
      "text-base sm:text-lg md:text-xl font-semibold leading-tight tracking-tight",
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
    className={cn("text-xs sm:text-sm text-gray-500 dark:text-gray-400", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 sm:p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-4 sm:p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
