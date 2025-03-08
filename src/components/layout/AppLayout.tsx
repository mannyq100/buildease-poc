import React, { useState, useEffect, useCallback, memo } from 'react';
import { Outlet } from 'react-router-dom';
import MainNavigation from '@/components/layout/MainNavigation';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import { Footer } from '@/components/layout/Footer';
import { cn, debounce } from '@/lib/utils';
import { LazyMotion, domAnimation, m } from 'framer-motion';

interface AppLayoutProps {
  showBreadcrumbs?: boolean;
  className?: string;
}

function AppLayout({ showBreadcrumbs = true, className }: AppLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  
  // Create stable, memoized handler for resize
  const checkMobile = useCallback(() => {
    const isMobileView = window.innerWidth < 768;
    setIsMobile(isMobileView);
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col">
      {/* Top Navigation - Fixed at the top with integrated nav links */}
      <MainNavigation className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800" />
      
      {/* Main Content Area */}
      <div className="flex flex-col flex-grow">        
        {/* Content Container with Centered Alignment */}
        <div className="flex justify-center flex-grow">
          {/* Content - Using LazyMotion for performance */}
          <LazyMotion features={domAnimation} strict>
            <m.main 
              className="py-4 w-full transition-all duration-300 mt-2"
              style={{
                // More padding on larger screens, less on mobile
                paddingLeft: 'max(1rem, env(safe-area-inset-left))',
                paddingRight: 'max(1rem, env(safe-area-inset-right))'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {/* Page Content - Rendered by React Router */}
              <div className={cn(
                "bg-white dark:bg-slate-800 rounded-lg shadow-card max-w-6xl mx-auto",
                // Add responsive padding - less on mobile, more on desktop
                "p-3 sm:p-4 md:p-6",
                className
              )}>
                {/* Breadcrumbs - Moved inside content container */}
                {showBreadcrumbs && (
                  <div className="mb-4 hidden md:block">
                    <Breadcrumb 
                      autoGenerate 
                      className="text-sm text-gray-500 dark:text-gray-400"
                    />
                  </div>
                )}
                
                {/* Main outlet content */}
                <Outlet />
              </div>
            </m.main>
          </LazyMotion>
        </div>
        
        {/* Footer */}
        <Footer 
          variant="minimal-modern" 
          showSocial={true}
          showLegal={true}
          showContact={false}
          showCopyright={true}
          companyName="BuildEase"
          logoSrc="/buildease-logo-1.svg"
        />
      </div>
    </div>
  );
};

// Memoize the entire component to reduce re-renders
export default memo(AppLayout);