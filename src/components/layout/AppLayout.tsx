import React, { useState, useEffect, useCallback, memo } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/navigation/Sidebar';
import MainNavigation from '@/components/layout/MainNavigation';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import { cn, debounce } from '@/lib/utils';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { Search } from 'lucide-react';

interface AppLayoutProps {
  showBreadcrumbs?: boolean;
  className?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  showBreadcrumbs = true,
  className
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Create stable, memoized handler for resize
  const checkMobile = useCallback(() => {
    const isMobileView = window.innerWidth < 768;
    setIsMobile(isMobileView);
    
    // Only update sidebar collapsed state when needed
    if (isMobileView) {
      setIsSidebarCollapsed(true);
    }
  }, []);
  
  // Debounced version of checkMobile to reduce updates during resize
  const debouncedCheckMobile = useCallback(
    debounce(checkMobile, 100),
    [checkMobile]
  );
  
  useEffect(() => {
    // Check on mount
    checkMobile();
    
    // Update on resize with debounce
    window.addEventListener('resize', debouncedCheckMobile);
    
    return () => window.removeEventListener('resize', debouncedCheckMobile);
  }, [checkMobile, debouncedCheckMobile]);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Sidebar */}
      <Sidebar defaultCollapsed={isSidebarCollapsed} />
      
      {/* Main Content Area */}
      <div className={cn(
        "flex flex-col min-h-screen transition-all duration-300",
        isSidebarCollapsed ? "lg:pl-[70px]" : "lg:pl-[240px]"
      )}>
        {/* Top Navigation */}
        <MainNavigation className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800" />
        
        {/* Content - Using LazyMotion for performance */}
        <LazyMotion features={domAnimation} strict>
          <m.main 
            className="flex-1 py-0 px-4 sm:px-6 lg:px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {/* Breadcrumbs */}
            {showBreadcrumbs && (
              <div className="mb-4 mt-4">
                <Breadcrumb 
                  autoGenerate 
                  className="text-sm" 
                />
              </div>
            )}
            
            {/* Page Content - Rendered by React Router */}
            <div className={cn("bg-white dark:bg-slate-800 rounded-lg shadow-card", className)}>
              <Outlet />
            </div>
          </m.main>
        </LazyMotion>
      </div>
    </div>
  );
};

// Memoize the entire component to reduce re-renders
export default memo(AppLayout);