import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Settings,
  LogOut,
  X,
  LayoutDashboard,
  Briefcase,
  Calendar,
  Package,
  DollarSign,
  Users,
  FileText,
  Menu,
  MessagesSquare,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { Separator } from '@/components/ui/separator';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { getUserDisplayName } from '@/services/userService';
import { cn } from '@/utils/core/ui';

interface MainNavigationProps {
  className?: string;
  onCollapseChange?: (collapsed: boolean) => void;
}

const MainNavigation: React.FC<MainNavigationProps> = ({ className, onCollapseChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { isAuthenticated, isLoading, user, signOut } = useSupabaseAuth();
  
  // Use our custom hook to fetch user profile data from the BuildEase API
  const { 
    profile,
    role,
    isLoading: isProfileLoading
  } = useUserProfile();

  // Determine if we're on mobile
  const [isMobile, setIsMobile] = useState(false);
  
  // Check screen size on mount and when window resizes
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint - mobile-first approach
    };
    
    // Initial check
    checkScreenSize();
    
    // Listen for window resize
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close mobile menu when location changes
  useEffect(() => {
    setShowMobileMenu(false);
  }, [location.pathname]);

  // Notify parent (AppLayout) when collapsed state changes
  useEffect(() => {
    if (onCollapseChange) onCollapseChange(collapsed);
  }, [collapsed, onCollapseChange]);

  // Check if a path is active
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Main navigation items
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects', path: '/projects', icon: Briefcase },
    { label: 'Team', path: '/team', icon: Users },
    { label: 'Messages', path: '/messaging', icon: MessagesSquare },
    { label: 'Schedule', path: '/schedule', icon: Calendar },
    { label: 'Materials', path: '/materials', icon: Package },
    { label: 'Expenses', path: '/expenses', icon: DollarSign },
    { label: 'Documents', path: '/documents', icon: FileText },
  ];

  // Mobile menu toggle button - shown when menu is closed
  const MobileMenuToggle = () => (
    <button
      onClick={() => setShowMobileMenu(true)}
      className="fixed top-3 left-3 z-30 bg-white dark:bg-slate-800 rounded-full shadow-md p-2 min-w-[44px] min-h-[44px] flex items-center justify-center transform transition-transform duration-200 hover:scale-105"
      aria-label="Open navigation menu"
    >
      <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
    </button>
  );

  // Handle logout
  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
  
      {/* Mobile menu toggle button - fixed position when menu is closed */}
      {isMobile && !showMobileMenu && <MobileMenuToggle />}
      
      <aside
        className={cn(
          'bg-white dark:bg-slate-800 border-r dark:border-slate-700 shadow-md z-40',
          // Mobile: full width overlay when menu is open, otherwise hidden
          isMobile 
            ? showMobileMenu 
              ? 'fixed inset-0 w-full h-full transform translate-x-0 transition-transform duration-300 ease-in-out' 
              : 'fixed inset-0 w-full h-full transform -translate-x-full transition-transform duration-300 ease-in-out' 
            : 'flex flex-col flex-shrink-0 sticky top-0 h-screen transition-all duration-300',
          // Desktop: collapsed or expanded state
          !isMobile && (collapsed ? 'w-20' : 'w-64'),
          className
        )}
      >
        {/* Mobile header with close button */}
        {isMobile && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center ml-2">
              <img 
                src="/buildease-logo-1.svg" 
                alt="BuildEase Logo" 
                className="h-8 w-auto"
              />
            </div>
            <button
              onClick={() => setShowMobileMenu(false)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 min-w-[44px] min-h-[44px] flex items-center justify-center transform transition-transform duration-200 hover:scale-105"
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        )}

        {/* Desktop header with logo and collapse button */}
        {!isMobile && (
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-white dark:from-slate-800 dark:to-slate-800 dark:bg-none">
            <img
              src="/buildease-logo-1.svg"
              alt="BuildEase"
              className={cn('h-10 w-auto cursor-pointer transition-all', collapsed && 'scale-75')}
              style={{ maxWidth: collapsed ? '3rem' : '180px' }}
              onClick={() => navigate('/')}
            />
            <button
              className="flex items-center justify-center rounded-full p-2 text-gray-500 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transform transition-transform duration-200 hover:scale-105 min-w-[32px] min-h-[32px]"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              onClick={() => setCollapsed((c) => !c)}
            >
              {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
          </div>
        )}

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {!collapsed && !isMobile && (
            <div className="mb-3 px-2">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-5 bg-blue-600 dark:bg-blue-500 rounded-sm"></div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Main Menu</p>
              </div>
            </div>
          )}
          
          <ul className="space-y-1.5">
            {navItems.map((item, index) => {
              const isItemActive = isActive(item.path);
              const Icon = item.icon;

              return (
                <li key={index}>
                  <Button
                    variant="ghost"
                    className={cn(
                      'w-full flex items-center justify-start rounded-lg transform transition-transform duration-200 hover:scale-105 min-h-[44px]',
                      isItemActive 
                        ? 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 dark:from-blue-900/40 dark:to-blue-900/20 dark:text-blue-400' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/30',
                      collapsed && !isMobile ? 'justify-center px-2' : 'px-3 py-2'
                    )}
                    onClick={() => {
                      navigate(item.path);
                      if (isMobile) {
                        setShowMobileMenu(false); // Close mobile menu after navigation
                      }
                    }}
                  >
                    <div className={cn(
                      "absolute left-0 w-1 h-8 rounded-r-md transition-all",
                      isItemActive 
                        ? "bg-blue-600 dark:bg-blue-500" 
                        : "bg-transparent group-hover:bg-blue-200 dark:group-hover:bg-blue-800/30"
                    )} />
                    <Icon className={cn(
                      "h-5 w-5 flex-shrink-0 min-w-5 transition-colors",
                      isItemActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                    )} />
                    {(!collapsed || isMobile) && (
                      <span className="ml-3 text-sm truncate" style={{fontFamily: 'Inter, sans-serif'}}>
                        {item.label}
                      </span>
                    )}
                  </Button>
                </li>
              );
            })}
          </ul>
          
          <Separator className="my-4 bg-gray-200 dark:bg-slate-700" />
          
          {/* User Profile Section */}
          <div className={cn(
            'mt-auto px-3 py-2',
            collapsed && !isMobile ? 'text-center' : ''
          )}>
            {!collapsed || isMobile ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 border border-gray-200 dark:border-slate-700">
                    <AvatarImage src={profile?.settings?.picture_url || user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      {getUserDisplayName(profile)?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[150px]">
                      {getUserDisplayName(profile) || user?.user_metadata?.full_name || user?.email}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                      {profile?.role || 'User'}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" className="rounded-full">
                      <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex justify-center">
                <Avatar className="h-8 w-8 border border-gray-200 dark:border-slate-700">
                  <AvatarImage src={profile?.settings?.picture_url || user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    {getUserDisplayName(profile)?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        </nav>
      </aside>
      
      {/* Backdrop for mobile menu */}
      {isMobile && showMobileMenu && (
        <div 
          className="fixed inset-0 bg-black/30"
          onClick={() => setShowMobileMenu(false)}
        />
      )}
    </>
  );
};

export default MainNavigation;