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
import { useAuth } from '@/auth/contexts/AuthContext';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useTheme } from '@/contexts/ThemeContext';

interface MainNavigationProps {
  className?: string;
}

const MainNavigation: React.FC<MainNavigationProps> = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { logout } = useAuth();
  const { isDarkMode } = useTheme();
  
  // Close mobile menu when location changes
  useEffect(() => {
    setShowMobileMenu(false);
  }, [location.pathname]);

  // Check if a path is active
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  // Main navigation items
  const navigationItems = [
    { 
      label: 'Dashboard', 
      path: '/dashboard', 
      icon: <LayoutDashboard className="h-4 w-4" /> 
    },
    { 
      label: 'Projects', 
      path: '/projects', 
      icon: <Briefcase className="h-4 w-4" />,
      badge: {
        text: '4',
        color: 'blue'
      }
    },
    { 
      label: 'Team', 
      path: '/team', 
      icon: <Users className="h-4 w-4" /> 
    },
    { 
      label: 'Messages', 
      path: '/messaging', 
      icon: <MessagesSquare className="h-4 w-4" /> 
    },
    { 
      label: 'Schedule', 
      path: '/schedule', 
      icon: <Calendar className="h-4 w-4" /> 
    },
    { 
      label: 'Materials', 
      path: '/materials', 
      icon: <Package className="h-4 w-4" /> 
    },
    { 
      label: 'Expenses', 
      path: '/expenses', 
      icon: <DollarSign className="h-4 w-4" /> 
    },
    { 
      label: 'Documents', 
      path: '/documents', 
      icon: <FileText className="h-4 w-4" /> 
    }
  ];

  // Handle logout click
  const handleLogout = () => {
    try {
      console.log('MainNavigation: Handling logout...');
      
      // Check if logout function exists
      if (typeof logout !== 'function') {
        console.error('Logout function is not available:', logout);
        navigate('/login');
        return;
      }
      
      // Perform logout
      console.log('Calling logout function...');
      logout();
      console.log('Logout function called successfully');
      
      // Navigate to login page
      console.log('Navigating to login page...');
      setTimeout(() => {
        navigate('/login');
        console.log('Navigation completed');
      }, 100);
    } catch (error) {
      console.error('Error during logout:', error);
      // Still attempt to navigate even if there was an error
      navigate('/login');
    }
  };

  return (
    <header className={cn(
      "w-full bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm transition-all duration-300",
      className
    )}>
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo - smaller on mobile */}
        <div className="flex items-center mr-4">
          <img 
            src="/buildease-logo-1.svg" 
            alt="BuildEase" 
            className="h-6 md:h-8 w-auto"
            style={{ maxWidth: '130px' }}
            onClick={() => navigate('/')}
          />
        </div>
        
        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-1 mr-4 overflow-x-auto scrollbar-hide">
          {navigationItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              className={cn(
                "flex items-center gap-2 whitespace-nowrap",
                isActive(item.path) 
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
              )}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
              {item.badge && (
                <Badge variant="outline" className={`ml-1 text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/30`}>
                  {item.badge.text}
                </Badge>
              )}
            </Button>
          ))}
        </div>
        
        {/* Search Bar - Desktop */}
        <div className="hidden md:flex items-center flex-1 max-w-md relative ml-auto">
          <Search className="absolute left-3 text-gray-400 dark:text-gray-500 h-4 w-4" />
          <Input 
            placeholder="Search..." 
            className="pl-9 bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
          />
        </div>
        
        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            className="mr-2"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowMobileSearch(true)}
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>

        {/* User Menu & Actions */}
        <div className="flex items-center gap-3 ml-4">
          {/* Theme Toggle - Desktop */}
          <div className="hidden md:block">
            <ThemeToggle variant="ghost" />
          </div>
          
          <Button variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400 relative hidden md:flex">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              2
            </span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatar.png" alt="User" />
                  <AvatarFallback className="bg-[#1E3A8A] text-white">JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatar.png" alt="User" />
                  <AvatarFallback className="bg-[#1E3A8A] text-white">JD</AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Project Manager</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
                <Badge className="ml-auto bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400">New</Badge>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('MainNavigation: Dropdown logout button clicked');
                  handleLogout();
                }}
                className="text-red-600 dark:text-red-400"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div className="md:hidden fixed inset-x-0 top-0 bg-white dark:bg-slate-900 h-16 px-4 flex items-center z-50 shadow-md">
          <Input 
            placeholder="Search..." 
            className="w-full bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
            autoFocus
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-2 flex-shrink-0"
            onClick={() => setShowMobileSearch(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}
      
      {/* Mobile Navigation Menu - Improved */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 z-40 bg-gray-900/50 dark:bg-black/50">
          <div 
            className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white dark:bg-slate-900 shadow-xl overflow-y-auto pb-safe"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center">
                <img 
                  src="/buildease-logo-1.svg" 
                  alt="BuildEase" 
                  className="h-6 w-auto"
                />
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowMobileMenu(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-2">
              {/* User info */}
              <div className="p-4 mb-2 flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src="/avatar.png" alt="User" />
                  <AvatarFallback className="bg-[#1E3A8A] text-white">JD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">John Doe</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Project Manager</p>
                </div>
              </div>
              
              <Separator className="my-2" />
              
              {/* Navigation */}
              <div className="px-2 py-1 space-y-1">
                {navigationItems.map((item) => (
                  <Button
                    key={item.path}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start items-center gap-3 text-left h-12 px-3 rounded-lg",
                      isActive(item.path) 
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                    )}
                    onClick={() => {
                      navigate(item.path);
                      setShowMobileMenu(false);
                    }}
                  >
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full",
                      isActive(item.path)
                        ? "bg-blue-100 dark:bg-blue-800/30"
                        : "bg-gray-100 dark:bg-slate-800"
                    )}>
                      {item.icon}
                    </div>
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <Badge variant="outline" className="ml-auto text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/30">
                        {item.badge.text}
                      </Badge>
                    )}
                    <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                ))}
              </div>
              
              <Separator className="my-2" />
              
              {/* Quick actions */}
              <div className="mt-4 px-4 space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left" 
                  onClick={() => {
                    navigate('/profile');
                    setShowMobileMenu(false);
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left" 
                  onClick={() => {
                    navigate('/settings');
                    setShowMobileMenu(false);
                  }}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Button>
                
                {/* Theme Toggle - Mobile */}
                <div className="flex items-center justify-between px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="mr-2 h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800">
                      {isDarkMode ? (
                        <Moon className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Sun className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <span>Theme</span>
                  </div>
                  <ThemeToggle variant="ghost" iconSize={16} />
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left text-red-600 dark:text-red-400" 
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </Button>
              </div>
            </div>
          </div>
          {/* Backdrop click to close */}
          <div 
            className="fixed inset-0 z-[-1]" 
            onClick={() => setShowMobileMenu(false)}
          />
        </div>
      )}
    </header>
  );
};

export default MainNavigation;