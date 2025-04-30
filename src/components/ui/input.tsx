import * as React from "react"
import { CheckCircle, AlertCircle, HelpCircle } from "lucide-react"
import { cn } from '@/utils/core/ui';
import { useState } from 'react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
  variant?: "default" | "modern" | "ghost" | "minimal" | "outlined" | "blueprint" | "construction"
  error?: boolean
  errorMessage?: string
  helperText?: string
  label?: string
  required?: boolean
  validState?: "error" | "success" | "warning" | "none"
  showValidationIcon?: boolean
  loading?: boolean
  fullWidth?: boolean
  mobileFullWidth?: boolean
}

// Prevent style injection on every render by using a flag
let inputStylesInitialized = false;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    variant = "default", 
    icon, 
    iconPosition = "left", 
    error, 
    errorMessage, 
    helperText, 
    label, 
    required, 
    validState = "none", 
    showValidationIcon = true, 
    loading = false, 
    fullWidth = true,
    mobileFullWidth = true,
    id, 
    ...props 
  }, ref) => {
    // Generate a unique ID for accessibility if none provided
    const uniqueId = React.useId();
    const inputId = id || `input-${uniqueId}`;
    const helperId = `helper-${inputId}`;
    const errorId = `error-${inputId}`;
    
    // For backwards compatibility
    if (error && validState === "none") {
      validState = "error";
    }
    
    // Track if the input is focused for better mobile experience
    const [isFocused, setIsFocused] = useState(false);
    
    const inputVariants = {
      default: "flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      modern: "flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm dark:focus-visible:ring-primary/50 transition-all duration-200 hover:border-primary/50 construction-modern-input",
      ghost: "flex h-11 w-full rounded-md bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-none",
      minimal: "flex h-11 w-full rounded-md border-b border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-b-2 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
      outlined: "flex h-11 w-full rounded-md border-2 border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 construction-outlined-input",
      blueprint: "flex h-11 w-full rounded-none border-2 border-input bg-background px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:border-primary focus-visible:bg-white disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 construction-blueprint-input",
      construction: "flex h-11 w-full rounded-md border-b-2 border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-b-3 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm transition-all duration-200 construction-border-input",
    }
    
    const inputStyles = cn(
      inputVariants[variant],
      validState === "error" && "border-destructive focus-visible:ring-destructive/50 dark:focus-visible:ring-destructive/50",
      validState === "success" && "border-green-500 focus-visible:ring-green-500/50 dark:focus-visible:ring-green-500/50",
      validState === "warning" && "border-yellow-500 focus-visible:ring-yellow-500/50 dark:focus-visible:ring-yellow-500/50",
      icon && iconPosition === "left" && "pl-10",
      (icon && iconPosition === "right" || showValidationIcon && validState !== "none") && "pr-10",
      loading && "opacity-70",
      !fullWidth && !mobileFullWidth && "w-auto",
      !fullWidth && mobileFullWidth && "w-full sm:w-auto",
      isFocused && "z-10", // Ensure focused inputs are above others for better mobile experience
      className
    )
    
    // Get validation icon based on state
    function getValidationIcon() {
      switch(validState) {
        case "success":
          return <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />;
        case "error":
          return <AlertCircle className="h-4 w-4 text-destructive" />;
        case "warning":
          return <AlertCircle className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />;
        default:
          return null;
      }
    }
    
    // Initialize styles only once
    React.useEffect(() => {
      if (typeof document !== 'undefined' && !inputStylesInitialized) {
        const style = document.createElement('style');
        style.textContent = `
          .dark .construction-modern-input {
            background-color: hsl(var(--deepblue-dark));
            border-color: hsla(var(--deepblue-light), 0.5);
          }
          
          .construction-modern-input:focus-visible {
            border-color: hsl(var(--deepblue));
          }
          
          .dark .construction-modern-input:focus-visible {
            border-color: hsl(var(--deepblue-light));
          }
          
          .construction-outlined-input {
            border-color: hsl(var(--burntorange));
          }
          
          .construction-outlined-input:focus-visible {
            border-color: hsl(var(--deepblue));
          }
          
          .dark .construction-outlined-input {
            background-color: hsl(var(--deepblue-dark));
            border-color: hsl(var(--burntorange));
          }
          
          .dark .construction-outlined-input:focus-visible {
            border-color: hsl(var(--deepblue-light));
          }
          
          .construction-blueprint-input {
            border-color: hsl(var(--deepblue));
          }
          
          .construction-blueprint-input:focus-visible {
            border-color: hsl(var(--burntorange));
          }
          
          .dark .construction-blueprint-input {
            background-color: hsl(var(--deepblue-dark));
            border-color: hsl(var(--deepblue));
          }
          
          .dark .construction-blueprint-input:focus-visible {
            border-color: hsl(var(--burntorange));
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

          .input-loading-indicator {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            width: 16px;
            height: 16px;
            border: 2px solid rgba(0, 0, 0, 0.1);
            border-top-color: currentColor;
            border-radius: 50%;
            animation: input-spinner 0.6s linear infinite;
          }

          @keyframes input-spinner {
            to {transform: translateY(-50%) rotate(360deg)}
          }
          
          /* Mobile optimizations */
          @media (max-width: 640px) {
            .input-touch-target {
              min-height: 44px;
            }
            
            .input-icon-touch {
              min-width: 44px;
              min-height: 44px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            .input-label-touch {
              padding: 4px 0;
              display: block;
            }
          }
        `;
        document.head.appendChild(style);
        inputStylesInitialized = true;
      }
    }, []);
    
    return (
      <div className={cn(
        "relative", 
        fullWidth ? "w-full" : mobileFullWidth ? "w-full sm:w-auto" : "w-auto",
        "mb-4 sm:mb-5"
      )}>
        {label && (
          <label 
            htmlFor={inputId}
            className={cn(
              "block text-sm font-medium mb-1.5 input-label-touch", 
              required && "after:content-['*'] after:ml-0.5 after:text-destructive",
              validState === "error" ? "text-destructive" : "text-foreground dark:text-foreground"
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === "left" && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground input-icon-touch">
              <div className="ml-3">
                {icon}
              </div>
            </div>
          )}
          <input
            id={inputId}
            type={type}
            className={cn(inputStyles, "input-touch-target")}
            ref={ref}
            required={required}
            disabled={loading || props.disabled}
            aria-invalid={validState === "error" ? "true" : "false"}
            aria-describedby={
              (validState === "error" && errorMessage ? errorId : "") + 
              (helperText ? (validState === "error" && errorMessage ? " " : "") + helperId : "")
            }
            onFocus={(e) => {
              setIsFocused(true);
              if (props.onFocus) props.onFocus(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              if (props.onBlur) props.onBlur(e);
            }}
            {...props}
          />
          {loading && (
            <div className="input-loading-indicator" />
          )}
          {!loading && icon && iconPosition === "right" && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground input-icon-touch">
              <div className="mr-3">
                {icon}
              </div>
            </div>
          )}
          {!loading && showValidationIcon && validState !== "none" && iconPosition !== "right" && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 input-icon-touch">
              <div className="mr-3">
                {getValidationIcon()}
              </div>
            </div>
          )}
        </div>
        
        {/* Helper text or error message */}
        {(helperText || (validState === "error" && errorMessage)) && (
          <div className="mt-1.5 flex items-start gap-1.5">
            {validState !== "none" && (
              <div className="mt-0.5">
                {getValidationIcon() || <HelpCircle className="h-3 w-3 text-muted-foreground" />}
              </div>
            )}
            <div>
              {validState === "error" && errorMessage && (
                <p id={errorId} className="text-xs text-destructive">
                  {errorMessage}
                </p>
              )}
              {helperText && (
                <p id={helperId} className={`text-xs ${
                  validState === "error" ? "text-destructive" : 
                  validState === "success" ? "text-green-600 dark:text-green-400" : 
                  validState === "warning" ? "text-yellow-600 dark:text-yellow-400" : 
                  "text-muted-foreground"
                }`}>
                  {helperText}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
