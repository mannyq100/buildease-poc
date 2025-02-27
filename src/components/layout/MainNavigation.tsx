import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  HardHat,
  LayoutDashboard,
  Briefcase,
  Calendar,
  Package,
  DollarSign,
  FileText,
  Settings,
  User,
  Bell,
  LogOut,
  Menu,
  X,
  Users
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface NavItemType {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: {
    text: string;
    color: string;
  };
  notificationCount?: number;
}

interface MainNavigationProps {
  className?: string;
}

export const MainNavigation: React.FC<MainNavigationProps> = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // Navigation items
  const navItems: NavItemType[] = [
    { 
      label: 'Dashboard', 
      path: '/dashboard', 
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    { 
      label: 'Projects', 
      path: '/projects', 
      icon: <Briefcase className="w-5 h-5" />,
      badge: {
        text: '4',
        color: 'blue'
      }
    },
    { 
      label: 'Schedule', 
      path: '/schedule', 
      icon: <Calendar className="w-5 h-5" /> 
    },
    { 
      label: 'Materials', 
      path: '/materials', 
      icon: <Package className="w-5 h-5" /> 
    },
    { 
      label: 'Expenses', 
      path: '/expenses', 
      icon: <DollarSign className="w-5 h-5" /> 
    },
    { 
      label: 'Team', 
      path: '/team', 
      icon: <Users className="w-5 h-5" /> 
    },
    { 
      label: 'Documents', 
      path: '/documents', 
      icon: <FileText className="w-5 h-5" />,
      notificationCount: 3
    }
  ];

  // Check if a path is active
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm transition-all duration-300",
      className
    )}>
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo and mobile menu button */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => navigate('/dashboard')}
          >
            <HardHat className="h-6 w-6 text-[#1E3A8A]" />
            <span className="font-bold text-lg text-[#1E3A8A] hidden sm:inline-block transition-colors">BuildEase</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              className={cn(
                "flex items-center gap-2 relative",
                isActive(item.path) && "bg-[#1E3A8A]/10 text-[#1E3A8A] dark:bg-[#1E3A8A]/20 dark:text-blue-400"
              )}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge && (
                <Badge className="ml-1 bg-[#1E3A8A] text-white">{item.badge.text}</Badge>
              )}
              {item.notificationCount && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {item.notificationCount}
                </span>
              )}
            </Button>
          ))}
        </nav>

        {/* User Menu & Actions */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400 relative">
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
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
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

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 dark:border-slate-800"
          >
            <div className="flex flex-col space-y-1 p-2">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "justify-start relative",
                    isActive(item.path) && "bg-[#1E3A8A]/10 text-[#1E3A8A] dark:bg-[#1E3A8A]/20 dark:text-blue-400"
                  )}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                  {item.badge && (
                    <Badge className="ml-auto bg-[#1E3A8A] text-white">{item.badge.text}</Badge>
                  )}
                  {item.notificationCount && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                      {item.notificationCount}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default MainNavigation; 