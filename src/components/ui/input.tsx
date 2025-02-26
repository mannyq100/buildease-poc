import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
  variant?: "default" | "modern" | "ghost" | "minimal" | "outlined" | "blueprint" | "construction"
  error?: boolean
  helperText?: string
  label?: string
  required?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", icon, iconPosition = "left", error, helperText, label, required, ...props }, ref) => {
    const inputVariants = {
      default: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      modern: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm dark:focus-visible:ring-primary/50 transition-all duration-200 hover:border-primary/50 construction-modern-input",
      ghost: "flex h-10 w-full rounded-md bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-none",
      minimal: "flex h-10 w-full rounded-md border-b border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-b-2 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
      outlined: "flex h-10 w-full rounded-md border-2 border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 construction-outlined-input",
      blueprint: "flex h-10 w-full rounded-none border-2 border-input bg-background px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:border-primary focus-visible:bg-white disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 construction-blueprint-input",
      construction: "flex h-10 w-full rounded-md border-b-2 border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-b-3 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm transition-all duration-200 construction-border-input",
    }
    
    const inputStyles = cn(
      inputVariants[variant],
      error && "border-destructive focus-visible:ring-destructive/50 dark:focus-visible:ring-destructive/50",
      icon && iconPosition === "left" && "pl-10",
      icon && iconPosition === "right" && "pr-10",
      className
    )
    
    // Add construction theme styles
    React.useEffect(() => {
      if (typeof document !== 'undefined') {
        const style = document.createElement('style');
        style.textContent = `
          .dark .construction-modern-input {
            background-color: hsl(var(--deepblue-dark));
            border-color: hsla(var(--deepblue-light), 0.5);
          }
          
          .dark .construction-outlined-input {
            border-color: hsla(var(--deepblue-light), 0.5);
          }
          
          .construction-blueprint-input {
            border-color: hsl(var(--deepblue));
            background-color: hsl(var(--lightgray));
          }
          
          .construction-blueprint-input::placeholder {
            color: hsla(var(--deepblue), 0.5);
          }
          
          .construction-blueprint-input:focus-visible {
            border-color: hsl(var(--deepblue));
          }
          
          .construction-border-input {
            border-color: hsl(var(--burntorange));
          }
          
          .construction-border-input:focus-visible {
            border-color: hsl(var(--burntorange));
          }
          
          .dark .construction-border-input {
            background-color: hsl(var(--deepblue-dark));
            border-color: hsl(var(--burntorange));
          }
        `;
        document.head.appendChild(style);
      }
    }, []);
    
    return (
      <div className="relative w-full">
        {label && (
          <label 
            className={cn(
              "block text-sm font-medium mb-1.5", 
              required && "after:content-['*'] after:ml-0.5 after:text-destructive",
              error ? "text-destructive" : "text-foreground dark:text-foreground"
            )}
          >
            {label}
          </label>
        )}
        {icon && iconPosition === "left" && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={inputStyles}
          ref={ref}
          required={required}
          {...props}
        />
        {icon && iconPosition === "right" && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        {helperText && (
          <p className={`mt-1 text-xs ${error ? "text-destructive" : "text-muted-foreground"}`}>
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
