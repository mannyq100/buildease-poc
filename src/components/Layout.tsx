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
        "border-b sticky top-0 z-30 shadow-sm transition-colors",
        isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
      )}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              className="md:hidden mr-2"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/" className="flex items-center transition-all duration-300 hover:scale-105 relative">
              <img 
                src={isDarkMode ? "/buildease-logo-1.svg" : "/buildease-logo-1.svg"} 
                alt="BuildEase" 
                className="h-14 w-auto" 
              />
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            </Link>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="mr-2">
              {isDarkMode ? 
                <Sun className="h-5 w-5" /> : 
                <Moon className="h-5 w-5" />
              }
            </Button>

            <Button variant="ghost" size="icon" className="relative hover:bg-gray-100">
              <Bell className="w-5 h-5 text-gray-700" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 hover:bg-gray-100 p-1.5 rounded-full transition-colors">
                  <Avatar className="h-8 w-8 border border-gray-200">
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" />
                    <AvatarFallback className="bg-primary/10 text-primary">JD</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>John Doe</span>
                    <span className="text-xs text-gray-500">Project Manager</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
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
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto md:h-[calc(100vh-4rem)] overflow-y-auto",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
            isDarkMode ? "bg-slate-800 border-r border-slate-700" : "bg-white border-r border-gray-200"
          )}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-8 md:hidden">
              <Link to="/" className="flex items-center">
                <img 
                  src={isDarkMode ? "/buildease-logo-1.svg" : "/buildease-logo-1.svg"} 
                  alt="BuildEase" 
                  className="h-12 w-auto" 
                />
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "p-2 rounded-md",
                  isDarkMode ? "hover:bg-slate-700" : "hover:bg-gray-100"
                )}
              >
                <X className={cn("w-5 h-5", isDarkMode ? "text-slate-400" : "text-gray-500")} />
              </button>
            </div>

            <nav className="space-y-6">
              <div className="space-y-1">
                {mainNavItems.map((item, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start font-normal",
                      isActive(item.path) 
                        ? (isDarkMode ? "bg-slate-700 text-white" : "bg-gray-100 text-black") 
                        : (isDarkMode ? "text-slate-300 hover:bg-slate-700 hover:text-white" : "text-gray-600 hover:bg-gray-100 hover:text-black")
                    )}
                    onClick={() => navigate(item.path)}
                  >
                    {item.icon && <span className="mr-3">{item.icon}</span>}
                    {item.label}
                  </Button>
                ))}
              </div>

              <div className="pt-4 border-t space-y-1">
                <p className={cn("px-3 text-xs font-semibold uppercase mb-2", isDarkMode ? "text-slate-400" : "text-gray-500")}>
                  Project
                </p>
                {bottomNavItems.map((item, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start font-normal",
                      isActive(item.path)
                        ? (isDarkMode ? "bg-slate-700 text-white" : "bg-gray-100 text-black")
                        : (isDarkMode ? "text-slate-300 hover:bg-slate-700 hover:text-white" : "text-gray-600 hover:bg-gray-100 hover:text-black")
                    )}
                    onClick={() => navigate(item.path)}
                  >
                    {item.icon && <span className="mr-3">{item.icon}</span>}
                    {item.label}
                  </Button>
                ))}
              </div>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className={cn(
          "flex-1 overflow-auto transition-colors relative flex flex-col",
          isDarkMode && "bg-slate-900 text-white"
        )}>
          <div className="flex-1">
            <Outlet />
          </div>
          <Footer variant="minimal" />
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout; 