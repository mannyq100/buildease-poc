import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import MainNavigation from './MainNavigation';
import Breadcrumb from '@/components/navigation/Breadcrumb';

interface AppLayoutProps {
  showBreadcrumbs?: boolean;
  className?: string;
}

/**
 * Main application layout component that provides consistent structure across the app
 * Includes responsive header, navigation, breadcrumbs and content area
 */
export function AppLayout({ showBreadcrumbs = true, className }: AppLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallTablet, setIsSmallTablet] = useState(false);
  
  // Detect mobile/tablet screen sizes
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
      setIsSmallTablet(window.innerWidth >= 640 && window.innerWidth < 768); // between sm and md
    };
    
    // Initial check
    checkScreenSize();
    
    // Listen for window resize
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // Determine padding based on screen size
  const getContentPadding = () => {
    if (isMobile) return 'px-3 py-4'; // Less padding on mobile
    if (isSmallTablet) return 'px-4 py-5'; // Medium padding on small tablets
    return 'px-6 py-6'; // More padding on larger screens
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col">
      {/* Fixed navigation */}
      <MainNavigation className="sticky top-0 z-10" />
      
      {/* Main content */}
      <main className={cn(
        'flex-1 flex flex-col',
        getContentPadding(),
        className
      )}>
        {/* Breadcrumbs - responsive padding and visibility based on screen size */}
        {showBreadcrumbs && (
          <div className="mb-4 md:mb-6">
            <Breadcrumb 
              autoGenerate 
              className="text-sm text-gray-500 dark:text-gray-400" 
            />
          </div>
        )}
        
        {/* Page content - Outlet renders the current route */}
        <div className="flex-1">
          <Outlet />
        </div>
      </main>
      
      {/* Simple responsive footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-4 px-4 md:px-6">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-3 md:mb-0">
            &copy; {new Date().getFullYear()} BuildEase. All rights reserved.
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Privacy</a>
            <a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Terms</a>
            <a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}