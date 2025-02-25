import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  noPadding?: boolean;
  withGradient?: boolean;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  className,
  fullWidth = false,
  noPadding = false,
  withGradient = false
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
  
  return (
    <div className={cn(
      "transition-all duration-200 ease-in-out",
      !noPadding && "p-4 md:p-6 lg:p-8",
      !fullWidth && "max-w-7xl mx-auto",
      withGradient && isDarkMode && "bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl",
      withGradient && !isDarkMode && "bg-gradient-to-br from-gray-50 to-slate-100 rounded-xl",
      isDarkMode ? "text-white" : "text-gray-900",
      className
    )}>
      {children}
    </div>
  );
}; 