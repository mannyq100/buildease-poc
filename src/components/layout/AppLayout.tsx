import { useState, useEffect, useMemo } from 'react';
import { Outlet, useParams, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion as m } from 'framer-motion';

import MainNavigation from './MainNavigation';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Bell, Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { cn } from '@/utils/core/ui';
import { NotificationCenter } from '@/components/notifications';
import { 
  useNotifications, 
  useNotificationStore
} from '@/stores/notificationStore';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/supabase';
import { Building2, FolderOpen, Home } from 'lucide-react';

interface BreadcrumbItem {
  name: string;
  path?: string;
  icon?: React.ReactNode;
  active?: boolean;
}

interface AppLayoutProps {
  showBreadcrumbs?: boolean;
  className?: string;
  customBreadcrumbs?: BreadcrumbItem[];
}

/**
 * Main application layout component that provides consistent structure across the app
 * Includes responsive header, navigation, breadcrumbs and content area
 * Implements mobile-first responsive design principles
 */
export function AppLayout({ showBreadcrumbs = true, className, customBreadcrumbs }: AppLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallTablet, setIsSmallTablet] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  
  // Auth context
  const { user, isAuthenticated } = useSupabaseAuth();
  
  // Route detection for dynamic breadcrumbs
  const location = useLocation();
  const params = useParams<{ slug?: string }>();
  
  // Detect if we're on a project details page
  const isProjectDetailsPage = location.pathname.startsWith('/project/') && !!params.slug;

  // Resolve slug -> project name for breadcrumbs
  const { data: projectName, isLoading: projectLoading } = useQuery({
    queryKey: ['projects', 'breadcrumb-name-by-slug', params.slug],
    queryFn: async () => {
      // Always use slug lookup (no UUID fallback)
      const { data, error } = await supabase
        .from('be_project')
        .select('name')
        .eq('slug', params.slug as string)
        .single();
      if (error || !data) throw error ?? new Error('Project not found');
      return (data.name as string) || 'Project Details';
    },
    enabled: isProjectDetailsPage,
    staleTime: 5 * 60 * 1000,
  });
  
  
  // Create dynamic breadcrumbs for project pages
  const dynamicBreadcrumbs = useMemo(() => {
    if (!isProjectDetailsPage) return undefined;
    
    return [
      {
        name: 'Home',
        path: '/dashboard',
        icon: <Home className="h-4 w-4" />,
        active: false
      },
      {
        name: 'Projects',
        path: '/projects',
        icon: <Building2 className="h-4 w-4" />,
        active: false
      },
      {
        name: projectLoading 
          ? 'Loading...' 
          : ((projectName || '').trim() || 'Project Details'),
        icon: <FolderOpen className="h-4 w-4" />,
        active: true
      }
    ];
  }, [isProjectDetailsPage, projectLoading, projectName]);
  
  // Use custom breadcrumbs, then dynamic, then auto-generate
  const breadcrumbsToUse = customBreadcrumbs || dynamicBreadcrumbs;
  
  // Notification hooks
  const { unreadCount } = useNotifications();  
  const { 
    fetchNotifications, 
    setUserId, 
    connectRealTime, 
    disconnectRealTime 
  } = useNotificationStore();
  
  // Detect mobile/tablet screen sizes - mobile-first approach
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
  
  // Listen to sidebar collapsed state from MainNavigation
  useEffect(() => {
    function handleSidebarToggle(e: CustomEvent) {
      setSidebarCollapsed(!!e.detail?.collapsed);
    }
    window.addEventListener('sidebar-toggle', handleSidebarToggle as EventListener);
    return () => window.removeEventListener('sidebar-toggle', handleSidebarToggle as EventListener);
  }, []);

  // Initialize notifications when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      setUserId(user.id);
      
      // Fetch initial notifications
      setTimeout(() => {
        fetchNotifications();
        
        // Connect to real-time updates
        connectRealTime();
      }, 100); // Small delay to ensure userId is set
    } else {
      // Disconnect when user is not authenticated
      disconnectRealTime();
    }
    
    // Cleanup on unmount
    return () => {
      disconnectRealTime();
    };
  }, [isAuthenticated, user?.id, setUserId, fetchNotifications, connectRealTime, disconnectRealTime]);

  // Content left margin based on sidebar state and screen size
  const contentMargin = useMemo(() => {
    if (isMobile) return 0; // No margin on mobile (sidebar is overlay)
    return sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;
  }, [isMobile, sidebarCollapsed]);

  // Determine padding based on screen size - mobile-first approach
  const contentPadding = useMemo(() => {
    if (isMobile) return 'px-3 py-2'; // Less padding on mobile
    if (isSmallTablet) return 'px-4 py-3'; // Medium padding on small tablets
    return 'px-6 py-4'; // More padding on larger screens
  }, [isMobile, isSmallTablet]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex">
      {/* Fixed navigation */}
      <MainNavigation 
        className="fixed top-0 left-0 z-30" 
        onCollapseChange={(collapsed: boolean) => {
          setSidebarCollapsed(collapsed);
          window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { collapsed } }));
        }} 
      />
      
      {/* Main content */}
      <main
        className={cn(
          'flex-1 flex flex-col transition-all duration-300 pb-3 sm:pb-4 md:pb-6',
          className
        )}
        style={{ marginLeft: `${contentMargin}px` }}
      >
        {/* Top Bar with Breadcrumbs and Actions */}
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm mb-2 sm:mb-4 md:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 px-3 sm:py-2 sm:px-4 md:py-3 md:px-6">
            {/* Mobile Header with Logo */}
            {isMobile && (
              <div className="flex items-center justify-between w-full mb-2">
                <div className="flex items-center">
                  <img 
                    src="/buildease-logo-1.svg" 
                    alt="BuildEase" 
                    className="h-7 w-auto ml-10" 
                  />
                </div>
                <div className="flex items-center space-x-1">
                  {/* Mobile Search Toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMobileSearch(!showMobileSearch)}
                    className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full p-1.5 min-w-[40px] min-h-[40px]"
                    aria-label={showMobileSearch ? "Close search" : "Open search"}
                  >
                    {showMobileSearch ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
                  </Button>
                  
                  {/* Theme Toggle */}
                  <ThemeToggle 
                    variant="ghost" 
                    iconSize={16} 
                    className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full p-1.5 min-w-[40px] min-h-[40px]" 
                  />
                  
                  {/* Notifications */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full p-1.5 min-w-[40px] min-h-[40px] relative transition-all duration-200"
                      >
                        <Bell className={cn("h-4 w-4 transition-transform duration-200", unreadCount > 0 && "animate-pulse")} />
                        {unreadCount > 0 && (
                          <m.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="absolute -top-1 -right-1"
                          >
                            <Badge className="bg-orange-500 text-white text-xs min-w-[16px] h-[16px] flex items-center justify-center p-0 rounded-full shadow-lg border-2 border-white dark:border-slate-800">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </Badge>
                          </m.div>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      className="w-80 sm:w-96 p-0 bg-transparent border-none shadow-none"
                      sideOffset={8}
                    >
                      <NotificationCenter 
                        maxHeight="400px"
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}
            
            {/* Mobile Search Bar - Expandable */}
            {isMobile && showMobileSearch && (
              <div className="w-full pb-2 animate-slideDown">
                <div className="relative flex items-center">
                  <Search className="absolute left-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full h-9 pl-9 pr-3 rounded-full bg-gray-100 dark:bg-slate-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMobileSearch(false)}
                    className="absolute right-2 text-gray-500 p-1 rounded-full min-w-[28px] min-h-[28px]"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            {/* Breadcrumbs - Collapsible on mobile */}
            {showBreadcrumbs && !showMobileSearch && (
              <div className={cn("flex-1", !isMobile && "min-w-0")}>
                <Breadcrumb 
                  items={breadcrumbsToUse}
                  autoGenerate={!breadcrumbsToUse} 
                  className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate"
                />
              </div>
            )}
            
            {/* Desktop Actions - Search, Notifications, Theme Toggle */}
            {!isMobile && (
              <div className="flex items-center space-x-1 sm:space-x-2 ml-auto">
                {/* Search Button */}
                <div className="relative group">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full p-1.5 sm:p-2 min-w-[40px] min-h-[40px] transform transition-transform duration-200 hover:scale-105"
                  >
                    <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                  <div className="absolute right-0 top-full mt-1 w-64 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-gray-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search..."
                          className="w-full h-9 pl-8 pr-3 rounded-md bg-gray-100 dark:bg-slate-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full p-1.5 sm:p-2 min-w-[40px] min-h-[40px] relative transform transition-all duration-200 hover:scale-105"
                    >
                      <Bell className={cn("h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200", unreadCount > 0 && "animate-pulse")} />
                      {unreadCount > 0 && (
                        <m.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className="absolute -top-1 -right-1"
                        >
                          <Badge className="bg-orange-500 text-white text-xs min-w-[18px] h-[18px] flex items-center justify-center p-0 rounded-full shadow-lg border-2 border-white dark:border-slate-800">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </Badge>
                        </m.div>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-80 sm:w-96 p-0 bg-transparent border-none shadow-none"
                    sideOffset={8}
                  >
                    <NotificationCenter 
                      maxHeight="500px"
                    />
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Theme Toggle */}
                <ThemeToggle variant="ghost" iconSize={isMobile ? 16 : 18} className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full p-1.5 sm:p-2 min-w-[40px] min-h-[40px] transform transition-transform duration-200 hover:scale-105" />
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area with padding */}
        <div className={cn('flex-1', contentPadding)}>      
          <Outlet />
        </div>

        {/* Simple responsive footer */}
        <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-2 px-3 sm:py-3 sm:px-4 md:py-4 md:px-6 mt-3 sm:mt-4 md:mt-6">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row justify-between items-center">
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2 sm:mb-0">
              &copy; {new Date().getFullYear()} BuildEase. All rights reserved.
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 min-h-[44px] flex items-center">Privacy</a>
              <a href="#" className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 min-h-[44px] flex items-center">Terms</a>
              <a href="#" className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 min-h-[44px] flex items-center">Support</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}