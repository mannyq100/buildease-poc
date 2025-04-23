import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  User,
  Settings,
  LogOut,
  Search,
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
  Home,
  ChevronRight,
  ChevronLeft,
  Moon,
  Sun
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth0 } from '@auth0/auth0-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import type { PermissionScope } from '@/types/user';
import { getUserDisplayName } from '@/services/userService';

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
  const { isAuthenticated, loginWithRedirect, logout: auth0Logout, isLoading, user: auth0User } = useAuth0();
  
  // Use our custom hook to fetch user profile data from the BuildEase API
  const { 
    profile,
    role,
    permissions,
    isLoading: isProfileLoading
  } = useUserProfile();

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

  // Get required project permission for nav item
  const getPermissionForNavItem = (path: string): PermissionScope | undefined => {
    const map: Record<string, PermissionScope> = {
      '/dashboard': 'projects:read',
      '/projects': 'projects:read',
      '/team': 'team:read',
      '/messaging': 'messages:read',
      '/schedule': 'schedule:read',
      '/materials': 'materials:read',
      '/expenses': 'expenses:read',
      '/documents': 'documents:read'
    };
    return map[path];
  };

  // Check if user has RBAC scope to access nav item
  const hasAccessToNavItem = (path: string): boolean => {
    // show all items until profile and permissions load
    if (isProfileLoading || !profile) return true;
    // if flat RBAC scopes not returned, show all by default
    if (permissions.length === 0) return true;
    const scope = getPermissionForNavItem(path);
    return !scope || permissions.includes(scope);
  };

  // Main navigation items - will be filtered by permissions
  const allNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects', path: '/projects', icon: Briefcase },
    { label: 'Team', path: '/team', icon: Users },
    { label: 'Messages', path: '/messaging', icon: MessagesSquare },
    { label: 'Schedule', path: '/schedule', icon: Calendar },
    { label: 'Materials', path: '/materials', icon: Package },
    { label: 'Expenses', path: '/expenses', icon: DollarSign },
    { label: 'Documents', path: '/documents', icon: FileText }
  ];
  
  // Main navigation items - temporarily show all
  const sideNavItems = allNavItems;

  return (
    <aside
      className={cn(
        'flex flex-col flex-shrink-0 h-screen bg-white dark:bg-slate-800 border-r dark:border-slate-700 shadow-md transition-all',
        collapsed ? 'w-20' : 'w-64',
        className
      )}
    >
      {/* Logo and collapse button */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-white dark:from-slate-800 dark:to-slate-800 dark:bg-none">
        <img
          src="/buildease-logo-1.svg"
          alt="BuildEase"
          className={cn('h-12 w-auto cursor-pointer transition-all', collapsed && 'scale-75')}
          style={{ maxWidth: collapsed ? '3rem' : '180px' }}
          onClick={() => navigate('/')}
        />
        <button
          className="flex items-center justify-center rounded-full p-2 text-gray-500 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-all"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 overflow-y-auto py-5 px-3">
        <div className="mb-3 px-2">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-5 bg-blue-600 dark:bg-blue-500 rounded-sm"></div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Main Menu</p>
          </div>
        </div>
        <ul className="space-y-1.5 px-1">
          {sideNavItems.map((item) => {
            const Icon = item.icon;
            const isItemActive = isActive(item.path);
            return (
              <li key={item.path}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full flex items-center justify-start rounded-lg py-2.5 transition-all font-medium h-10 group',
                    isItemActive 
                      ? 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 dark:from-blue-900/40 dark:to-blue-900/20 dark:text-blue-400' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/30',
                    collapsed ? 'justify-center px-2' : 'px-3'
                  )}
                  onClick={() => navigate(item.path)}
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
                  {!collapsed && (
                    <span className="ml-3 text-sm truncate" style={{fontFamily: 'Inter, sans-serif'}}>
                      {item.label}
                    </span>
                  )}
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User profile and actions */}
      <div className="border-t border-gray-100 dark:border-slate-800 mt-auto bg-gray-50 dark:bg-slate-800/80 rounded-bl-lg">
        {/* User profile button */}
        <div className="px-4 pt-4 pb-3 relative">
          <div className="absolute top-0 right-8 w-8 h-1 bg-orange-500 dark:bg-orange-600 rounded-b-full"></div>
          <Button
            variant="ghost"
            className={cn(
              'w-full flex items-center justify-start rounded-lg py-2.5 transition-all hover:bg-white dark:hover:bg-slate-700 h-11 shadow-sm',
              collapsed ? 'justify-center px-2' : 'px-3'
            )}
            onClick={() => navigate('/settings')}
          >
            <div className="flex items-center">
              <Avatar className="h-9 w-9 flex-shrink-0 border-2 border-white dark:border-slate-700 shadow-md ring-2 ring-blue-100 dark:ring-blue-900/30">
                <AvatarImage src={profile?.settings?.pictureUrl || auth0User?.picture} alt={profile?.name || auth0User?.name || 'User'} />
                <AvatarFallback>{profile?.name?.[0] || auth0User?.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-white" style={{fontFamily: 'Inter, sans-serif'}}>
                    {profile?.name || auth0User?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Account & Settings
                  </p>
                </div>
              )}
            </div>
          </Button>
        </div>

        {/* Sign out button */}
        <div className="px-4 pb-5">
          <Button
            variant="ghost"
            className={cn(
              'w-full bg-orange-50 border border-orange-200 text-orange-600 hover:bg-orange-100 hover:text-orange-700 dark:bg-orange-900/20 dark:border-orange-800/30 dark:text-orange-400 dark:hover:bg-orange-900/30 dark:hover:text-orange-300 rounded-lg py-2.5 transition-all font-medium h-10 flex items-center justify-start shadow-sm',
              collapsed ? 'justify-center px-2' : 'px-3'
            )}
            onClick={() => auth0Logout({ logoutParams: { returnTo: window.location.origin } })}
          >
            <LogOut className="h-5 w-5 flex-shrink-0 min-w-5 text-orange-500 dark:text-orange-400" />
            {!collapsed && <span className="ml-3">Sign Out</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default MainNavigation;