import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from '@/utils/core/ui';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95 hover:scale-[1.02] active:scale-[0.98] min-h-[44px] min-w-[44px] relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md hover:shadow-primary/20 dark:shadow-primary/20 dark:hover:shadow-md dark:hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md hover:shadow-destructive/20 dark:shadow-destructive/20 dark:hover:shadow-md dark:hover:shadow-destructive/40 hover:-translate-y-0.5 active:translate-y-0",
        outline:
          "border border-input bg-background hover:bg-accent/10 hover:text-accent-foreground hover:border-accent/50 hover:shadow-sm dark:hover:bg-accent/20 dark:border-slate-700 dark:hover:border-slate-600 hover:-translate-y-0.5 active:translate-y-0",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md hover:shadow-secondary/20 dark:shadow-secondary/20 dark:hover:shadow-md dark:hover:shadow-secondary/40 hover:-translate-y-0.5 active:translate-y-0",
        ghost: "hover:bg-accent/10 hover:text-accent-foreground dark:hover:bg-accent/20 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0",
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
        default: "h-10 sm:h-10 px-3 sm:px-4 py-2",
        sm: "h-8 sm:h-9 rounded-md px-2 sm:px-3",
        lg: "h-10 sm:h-11 rounded-md px-6 sm:px-8",
        icon: "h-9 w-9 sm:h-10 sm:w-10",
        "icon-sm": "h-8 w-8",
        "mobile": "h-11 w-full rounded-md px-4 py-2",
        "touch": "h-12 rounded-md px-4 py-2 text-base",
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
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
      animation: "none",
      fullWidth: false,
    },
  }
)

// Move style creation outside of render cycle to avoid issues with React 19
let styleInitialized = false;
if (typeof document !== 'undefined' && !styleInitialized) {
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
    
    /* Ripple animation */
    @keyframes ripple {
      0% {
        transform: scale(0);
        opacity: 0.6;
      }
      100% {
        transform: scale(4);
        opacity: 0;
      }
    }
    
    /* Enhanced focus ring for accessibility */
    .focus-enhanced:focus-visible {
      outline: 2px solid hsl(var(--ring));
      outline-offset: 2px;
      box-shadow: 0 0 0 4px hsl(var(--ring) / 0.3);
    }
    
    /* Mobile-first responsive styles */
    @media (max-width: 640px) {
      .sm\\:hidden {
        display: none;
      }
      
      .mobile-full-width {
        width: 100%;
      }
      
      .mobile-touch-target {
        min-height: 44px;
        min-width: 44px;
      }
    }
  `;
  document.head.appendChild(style);
  styleInitialized = true;
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  mobileFullWidth?: boolean
  showRipple?: boolean
  feedbackState?: 'success' | 'error' | null
  onFeedbackComplete?: () => void
}

/**
 * Button component with enhanced visual feedback and micro-interactions
 * Features: ripple effects, success/error feedback, improved hover states
 * Updated for React 19 with direct ref passing and mobile-first responsive design
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((
  {
    className,
    variant,
    size,
    rounded,
    animation,
    asChild = false,
    isLoading,
    leftIcon,
    rightIcon,
    fullWidth,
    mobileFullWidth = false,
    showRipple = true,
    feedbackState,
    onFeedbackComplete,
    children,
    onClick,
    ...props
  }, ref) => {
  const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([]);
  const [showFeedback, setShowFeedback] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  
  // Handle ripple effect on click
  const handleClick = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (showRipple && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      const newRipple = { id: Date.now(), x, y };
      setRipples(prev => [...prev, newRipple]);
      
      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
      }, 600);
    }
    
    onClick?.(e);
  }, [showRipple, onClick]);
  
  // Handle feedback state changes
  React.useEffect(() => {
    if (feedbackState) {
      setShowFeedback(true);
      const timeout = setTimeout(() => {
        setShowFeedback(false);
        onFeedbackComplete?.();
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [feedbackState, onFeedbackComplete]);
  
  // Combine refs
  React.useImperativeHandle(ref, () => buttonRef.current!, []);
  
  const Comp = asChild ? Slot : "button";
  
  // Determine feedback colors and icons
  const getFeedbackContent = () => {
    if (!showFeedback || !feedbackState) return null;
    
    if (feedbackState === 'success') {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-green-500 text-white rounded-md transition-opacity duration-300">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    }
    
    if (feedbackState === 'error') {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500 text-white rounded-md transition-opacity duration-300">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <Comp
      ref={buttonRef}
      className={cn(
        buttonVariants({ 
          variant, 
          size, 
          rounded, 
          animation, 
          fullWidth,
          className 
        }),
        mobileFullWidth && "w-full sm:w-auto mobile-full-width",
        showFeedback && "pointer-events-none"
      )}
      disabled={isLoading || props.disabled || showFeedback}
      onClick={handleClick}
      {...props}
    >
      {/* Ripple effect */}
      {showRipple && (
        <div className="absolute inset-0 overflow-hidden rounded-md">
          {ripples.map((ripple) => (
            <span
              key={ripple.id}
              className="absolute bg-white/30 rounded-full animate-ping"
              style={{
                left: ripple.x,
                top: ripple.y,
                width: '100px',
                height: '100px',
                transform: 'scale(0)',
                animation: 'ripple 0.6s linear',
              }}
            />
          ))}
        </div>
      )}
      
      {/* Feedback overlay */}
      {getFeedbackContent()}
      
      {/* Button content */}
      <div className={cn("flex items-center justify-center gap-2", showFeedback && "opacity-0")}>
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {!isLoading && leftIcon}
        {children}
        {!isLoading && rightIcon}
      </div>
    </Comp>
  )
});

Button.displayName = "Button"

export { Button, buttonVariants }
