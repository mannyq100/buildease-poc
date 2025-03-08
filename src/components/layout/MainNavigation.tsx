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
  Menu
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

interface MainNavigationProps {
  className?: string;
}

const MainNavigation: React.FC<MainNavigationProps> = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Check dark mode
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
            style={{ maxWidth: '150px' }}
          />
        </div>
        
        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-1 mr-4">
          {navigationItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              className={cn(
                "flex items-center gap-2",
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
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div className="md:hidden absolute inset-x-0 top-0 bg-white dark:bg-slate-900 h-16 px-4 flex items-center z-50">
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
      
      {/* Mobile Navigation Menu */}
      {showMobileMenu && (
        <div className="md:hidden absolute inset-x-0 top-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 shadow-lg z-40 max-h-[70vh] overflow-y-auto">
          <div className="px-4 py-3 space-y-1">
            {navigationItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className={cn(
                  "w-full justify-start items-center gap-2 text-left h-auto py-2",
                  isActive(item.path) 
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                )}
                onClick={() => {
                  navigate(item.path);
                  setShowMobileMenu(false);
                }}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <Badge variant="outline" className="ml-auto text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/30">
                    {item.badge.text}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default MainNavigation; 