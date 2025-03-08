import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, User, Menu, X, Home, LayoutDashboard, Clock, Users, Package, Settings, FileText, LogOut, Moon, Sun, DollarSign } from 'lucide-react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Footer } from '@/components/layout/Footer';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check if a path is active
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  // Check initial dark mode state on component mount
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Navigation items
  const mainNavItems: NavItem[] = [
    {
      label: "Dashboard",
      path: "/",
      icon: <Home className="w-5 h-5" />
    },
    {
      label: "Projects",
      path: "/projects",
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      label: "Schedule",
      path: "/schedule",
      icon: <Clock className="w-5 h-5" />
    },
    {
      label: "Team",
      path: "/team",
      icon: <Users className="w-5 h-5" />
    },
    {
      label: "Materials",
      path: "/materials",
      icon: <Package className="w-5 h-5" />
    },
    {
      label: "Expenses",
      path: "/expenses",
      icon: <DollarSign className="w-5 h-5" />
    },
    {
      label: "Documents",
      path: "/documents",
      icon: <FileText className="w-5 h-5" />
    }
  ];

  const bottomNavItems: NavItem[] = [
    {
      label: "Settings",
      path: "/settings",
      icon: <Settings className="w-5 h-5" />
    }
  ];

  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'dark' : ''} ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={cn(
        "border-b sticky top-0 z-30 shadow-md transition-colors",
        isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
      )}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              className="md:hidden mr-2 hover:bg-gray-100 dark:hover:bg-slate-700 p-2 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link to="/" className="flex items-center transition-all duration-300 hover:scale-105 group relative">
              <img 
                src="/buildease-logo-1.svg" 
                alt="BuildEase" 
                className="h-14 w-auto" 
              />
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-20 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            </Link>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleDarkMode} 
              className="mr-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full"
            >
              {isDarkMode ? 
                <Sun className="h-5 w-5 text-amber-300" /> : 
                <Moon className="h-5 w-5" />
              }
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full"
            >
              <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-slate-700 p-1.5 rounded-full transition-colors"
                >
                  <Avatar className="h-8 w-8 border border-gray-200 dark:border-slate-700 shadow-sm">
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white">JD</AvatarFallback>
                  </Avatar>
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 shadow-lg border-gray-200 dark:border-slate-700">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">John Doe</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Project Manager</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          {(sidebarOpen || window.innerWidth >= 768) && (
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ ease: "easeOut", duration: 0.25 }}
              className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 md:translate-x-0 md:static md:inset-auto md:h-[calc(100vh-4rem)] overflow-y-auto",
                isDarkMode 
                  ? "bg-slate-800 border-r border-slate-700 shadow-xl md:shadow-none" 
                  : "bg-white border-r border-gray-200 shadow-xl md:shadow-none"
              )}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-8 md:hidden">
                  <Link to="/" className="flex items-center">
                    <img 
                      src="/buildease-logo-1.svg" 
                      alt="BuildEase" 
                      className="h-12 w-auto" 
                    />
                  </Link>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "p-2 rounded-lg",
                      isDarkMode ? "hover:bg-slate-700" : "hover:bg-gray-100"
                    )}
                  >
                    <X className={cn("w-5 h-5", isDarkMode ? "text-slate-400" : "text-gray-500")} />
                  </button>
                </div>

                <nav className="space-y-6">
                  <div className="space-y-1.5">
                    {mainNavItems.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start font-normal transition-all duration-200",
                            isActive(item.path) 
                              ? (isDarkMode 
                                ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-white border-l-2 border-blue-500 pl-3.5" 
                                : "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border-l-2 border-blue-500 pl-3.5") 
                              : (isDarkMode 
                                ? "text-slate-300 hover:bg-slate-700 hover:text-white" 
                                : "text-gray-600 hover:bg-gray-100 hover:text-black")
                          )}
                          onClick={() => navigate(item.path)}
                        >
                          {item.icon && (
                            <span className={cn(
                              "mr-3",
                              isActive(item.path) && "text-blue-500"
                            )}>
                              {item.icon}
                            </span>
                          )}
                          {item.label}
                        </Button>
                      </motion.div>
                    ))}
                  </div>

                  <div className="pt-4 border-t space-y-1.5">
                    <p className={cn("px-3 text-xs font-semibold uppercase mb-2", isDarkMode ? "text-slate-400" : "text-gray-500")}>
                      Project
                    </p>
                    {bottomNavItems.map((item, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start font-normal transition-all duration-200",
                          isActive(item.path) 
                            ? (isDarkMode 
                              ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-white border-l-2 border-blue-500 pl-3.5" 
                              : "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border-l-2 border-blue-500 pl-3.5") 
                            : (isDarkMode 
                              ? "text-slate-300 hover:bg-slate-700 hover:text-white" 
                              : "text-gray-600 hover:bg-gray-100 hover:text-black")
                        )}
                        onClick={() => navigate(item.path)}
                      >
                        {item.icon && (
                          <span className={cn(
                            "mr-3",
                            isActive(item.path) && "text-blue-500"
                          )}>
                            {item.icon}
                          </span>
                        )}
                        {item.label}
                      </Button>
                    ))}
                  </div>
                </nav>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className={cn(
          "flex-1 overflow-auto transition-colors relative flex flex-col",
          isDarkMode && "bg-slate-900 text-white"
        )}>
          <motion.div 
            className="flex-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Outlet />
          </motion.div>
          <Footer variant="minimal" />
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout; 