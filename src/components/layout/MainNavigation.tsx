import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  User,
  Settings,
  LogOut,
  Search,
  X
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

interface MainNavigationProps {
  className?: string;
}

const MainNavigation: React.FC<MainNavigationProps> = ({ className }) => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  
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

  return (
    <header className={cn(
      "w-full bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm transition-all duration-300",
      className
    )}>
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Search Bar - Desktop */}
        <div className="hidden md:flex items-center flex-1 max-w-md relative">
          <Search className="absolute left-3 text-gray-400 dark:text-gray-500 h-4 w-4" />
          <Input 
            placeholder="Search..." 
            className="pl-9 bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
          />
        </div>
        
        {/* Mobile Section */}
        <div className="flex md:hidden items-center flex-1">
          {showMobileSearch ? (
            <div className="w-full flex items-center">
              <Input 
                placeholder="Search..." 
                className="w-full bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                autoFocus
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-2"
                onClick={() => setShowMobileSearch(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowMobileSearch(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
          )}
        </div>

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
    </header>
  );
};

export default MainNavigation; 