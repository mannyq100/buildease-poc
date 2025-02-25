import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ContentSection } from '@/components/shared';
import { ChevronRight } from 'lucide-react';

interface DashboardSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
  action?: React.ReactNode;
  fullWidth?: boolean;
  variant?: 'default' | 'highlight' | 'outlined' | 'gradient' | 'glass';
  collapsible?: boolean;
  subtitle?: string;
  icon?: React.ReactNode;
  animate?: boolean;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  title,
  children,
  className,
  titleClassName,
  action,
  fullWidth = false,
  variant = 'default',
  collapsible = false,
  subtitle,
  icon,
  animate = false
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);
  
  // Define the variants for dark and light mode
  const variants = {
    default: {
      card: isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200',
      header: isDarkMode ? 'bg-slate-800/50' : 'bg-gray-50/50',
    },
    highlight: {
      card: isDarkMode 
        ? 'bg-slate-800 border-blue-700 border-2' 
        : 'bg-white border-blue-500 border-2',
      header: isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50/50',
    },
    outlined: {
      card: isDarkMode 
        ? 'bg-transparent border-2 border-slate-700' 
        : 'bg-transparent border-2 border-gray-200',
      header: 'bg-transparent',
    },
    gradient: {
      card: isDarkMode 
        ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700' 
        : 'bg-gradient-to-br from-white to-gray-50 border-gray-200',
      header: isDarkMode 
        ? 'bg-gradient-to-r from-blue-900/20 to-purple-900/20' 
        : 'bg-gradient-to-r from-blue-50 to-indigo-50',
    },
    glass: {
      card: isDarkMode 
        ? 'bg-slate-800/70 backdrop-blur-md border-slate-700/50' 
        : 'bg-white/70 backdrop-blur-md border-gray-200/50',
      header: isDarkMode 
        ? 'bg-slate-700/50' 
        : 'bg-gray-50/50',
    }
  };

  const sectionStyle = variants[variant];
  
  const handleMouseEnter = () => {
    if (animate) setIsHovered(true);
  };
  
  const handleMouseLeave = () => {
    if (animate) setIsHovered(false);
  };

  return (
    <div 
      className={cn(
        "mb-6 transition-all duration-300", 
        fullWidth ? "w-full" : "w-full md:w-auto",
        animate && isHovered ? "transform scale-[1.01] shadow-lg" : "",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {title && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            {icon && (
              <div className={cn(
                "mr-3 p-2 rounded-lg",
                isDarkMode ? "bg-slate-700" : "bg-gray-100"
              )}>
                {icon}
              </div>
            )}
            <div>
              <h2 className={cn(
                "text-xl font-semibold", 
                isDarkMode ? "text-white" : "text-gray-900",
                titleClassName
              )}>
                {title}
              </h2>
              {subtitle && (
                <p className={cn(
                  "text-sm mt-0.5",
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {action}
            {collapsible && (
              <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={cn(
                  "p-1 rounded-md transition-colors",
                  isDarkMode 
                    ? "hover:bg-slate-700 text-gray-400" 
                    : "hover:bg-gray-100 text-gray-500"
                )}
              >
                <ChevronRight className={cn(
                  "w-5 h-5 transition-transform",
                  isCollapsed ? "transform rotate-90" : ""
                )} />
              </button>
            )}
          </div>
        </div>
      )}
      <div className={cn(
        "transition-all duration-300 overflow-hidden",
        isCollapsed ? "max-h-0 opacity-0" : "max-h-[5000px] opacity-100"
      )}>
        <ContentSection 
          variant={variant} 
          className={sectionStyle.card}
          headerClassName={sectionStyle.header}
        >
          {children}
        </ContentSection>
      </div>
    </div>
  );
}; 