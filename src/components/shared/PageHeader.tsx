import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { BreadcrumbWithItems, type BreadcrumbItemType } from '@/components/ui/breadcrumb';
import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItemType[];
  action?: React.ReactNode;
  className?: string;
  showProgress?: boolean;
  progressValue?: number;
  progressLabels?: string[];
  backgroundVariant?: 'default' | 'gradient' | 'solid' | 'transparent' | 'minimal';
  alignment?: 'left' | 'center';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  action,
  className,
  showProgress = false,
  progressValue = 0,
  progressLabels = [],
  backgroundVariant = 'default',
  alignment = 'left',
  size = 'md',
  animated = true,
  maxWidth = '6xl'
}) => {
  // Use state for dark mode instead of direct DOM access during render
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Check dark mode on component mount and whenever it might change
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    // Check on mount
    checkDarkMode();
    
    // Set up a mutation observer to watch for dark mode changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    // Clean up observer on unmount
    return () => observer.disconnect();
  }, []);
  
  // Define background variants
  const backgroundVariants = {
    default: isDarkMode 
      ? "bg-slate-800/50 shadow-sm border-b border-slate-700" 
      : "bg-white/90 shadow-sm border-b border-gray-200",
    gradient: isDarkMode 
      ? "bg-gradient-to-r from-slate-800 to-slate-900 shadow-md" 
      : "bg-gradient-to-r from-gray-50 to-white shadow-md",
    solid: isDarkMode 
      ? "bg-slate-800 shadow-md" 
      : "bg-gray-50 shadow-sm",
    transparent: isDarkMode 
      ? "bg-transparent" 
      : "bg-transparent",
    minimal: isDarkMode 
      ? "bg-transparent border-b border-slate-800" 
      : "bg-transparent border-b border-gray-200",
  };
  
  // Define title sizes
  const titleSizes = {
    sm: 'text-lg sm:text-xl',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
  };
  
  // Define subtitle sizes
  const subtitleSizes = {
    sm: 'text-xs sm:text-sm',
    md: 'text-sm',
    lg: 'text-sm sm:text-base',
  };
  
  // Define max widths
  const maxWidths = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    'full': 'max-w-full',
  };
  
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center items-center',
  };
  
  const contentAnimation = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };
  
  const MotionComponent = animated ? motion.div : React.Fragment;
  const motionProps = animated 
    ? { 
        initial: "hidden", 
        animate: "visible", 
        variants: contentAnimation 
      } 
    : {};

  return (
    <header 
      className={cn(
        "backdrop-blur-sm transition-all duration-300",
        backgroundVariants[backgroundVariant],
        isDarkMode ? 'text-white' : 'text-gray-900',
        className
      )}
    >
      <div className={cn(
        "mx-auto p-4 md:p-6",
        maxWidths[maxWidth]
      )}>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <BreadcrumbWithItems 
            items={breadcrumbs} 
            className={cn(
              "mb-3",
              alignment === 'center' && "justify-center"
            )}
          />
        )}
        
        <div className={cn(
          "flex justify-between gap-4",
          alignment === 'center' ? "flex-col items-center" : "items-start",
          alignment === 'center' && action ? "sm:flex-row sm:justify-between sm:w-full" : "",
        )}>
          <MotionComponent {...motionProps} className="flex-1">
            <h1 className={cn(
              "font-bold leading-tight tracking-tight",
              titleSizes[size],
              isDarkMode ? 'text-white' : 'text-gray-900',
            )}>
              {title}
            </h1>
            
            {subtitle && (
              <p className={cn(
                "mt-1.5",
                subtitleSizes[size],
                isDarkMode ? 'text-slate-300' : 'text-gray-600',
              )}>
                {subtitle}
              </p>
            )}
          </MotionComponent>
          
          {action && (
            <div className={cn(
              "flex-shrink-0",
              alignment === 'center' && "mt-3 sm:mt-0"
            )}>
              {action}
            </div>
          )}
        </div>

        {showProgress && (
          <div className="mt-5">
            <Progress 
              value={progressValue} 
              className={cn(
                "h-2",
                isDarkMode 
                  ? "bg-slate-700 [&>div]:bg-blue-500" 
                  : "bg-gray-200 [&>div]:bg-blue-600"
              )} 
            />
            {progressLabels.length > 0 && (
              <div className={cn(
                "flex justify-between mt-2",
                subtitleSizes[size],
                isDarkMode ? 'text-slate-400' : 'text-gray-600',
              )}>
                {progressLabels.map((label, index) => (
                  <span 
                    key={index} 
                    className={index === 0 ? "font-medium" : ""}
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}; 