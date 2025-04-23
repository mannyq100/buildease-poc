import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import MainNavigation from './MainNavigation';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Bell, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

  // Sidebar width for expanded/collapsed states
  const SIDEBAR_WIDTH = 256; // 64 (w-64) in px
  const SIDEBAR_COLLAPSED_WIDTH = 80; // 20 (w-20) in px

  // Determine sidebar width for layout
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Listen to sidebar collapsed state from MainNavigation (using event or context in a real app)
  // For now, we use a window event for demo (replace with context for production)
  useEffect(() => {
    function handleSidebarToggle(e: CustomEvent) {
      setSidebarCollapsed(!!e.detail?.collapsed);
    }
    window.addEventListener('sidebar-toggle', handleSidebarToggle as EventListener);
    return () => window.removeEventListener('sidebar-toggle', handleSidebarToggle as EventListener);
  }, []);

  // Content left margin based on sidebar state
  const mainMarginLeft = sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  // Determine padding based on screen size
  const getContentPadding = () => {
    if (isMobile) return 'px-3 py-4'; // Less padding on mobile
    if (isSmallTablet) return 'px-4 py-5'; // Medium padding on small tablets
    return 'px-6 py-6'; // More padding on larger screens
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex">
      {/* Fixed navigation */}
      <MainNavigation className="fixed top-0 left-0 z-30" onCollapseChange={(collapsed: boolean) => {
        setSidebarCollapsed(collapsed);
        window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { collapsed } }));
      }} />
      {/* Main content */}
      <main
        className={cn(
          'flex-1 flex flex-col transition-all duration-300 pb-6',
          className
        )}
        style={{ marginLeft: `${mainMarginLeft}px` }}
      >
        {/* Top Bar with Breadcrumbs and Actions */}
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm mb-6">
          <div className="flex items-center justify-between py-3 px-6">
            {/* Breadcrumbs */}
            {showBreadcrumbs && (
              <div className="flex-1">
                <Breadcrumb 
                  autoGenerate 
                  className="text-sm text-gray-500 dark:text-gray-400" 
                />
              </div>
            )}
            
            {/* Actions - Search, Notifications, Theme Toggle */}
            <div className="flex items-center space-x-2">
              {/* Search Button */}
              <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full p-2">
                <Search className="h-5 w-5" />
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full p-2 relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs min-w-[18px] h-[18px] flex items-center justify-center p-0 rounded-full">3</Badge>
              </Button>

              {/* Theme Toggle */}
              <ThemeToggle variant="ghost" iconSize={18} className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full p-2" />
            </div>
          </div>
        </div>

        {/* Main Content Area with padding */}
        <div className={cn('flex-1 px-6')}>      
          <Outlet />
        </div>

        {/* Simple responsive footer */}
        <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-4 px-6 mt-8">
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
      </main>
    </div>
  );
}