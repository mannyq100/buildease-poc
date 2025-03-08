import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  Menu,
  X,
  Home,
  LayoutDashboard,
  Clock,
  Users,
  Package,
  Settings,
  FileText,
  LogOut,
  User,
  Sun,
  Moon,
  Search,
  ChevronRight,
  MessageSquare,
  PlusCircle,
  Calendar,
  HelpCircle,
  Layers
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarCompact, setSidebarCompact] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle window resize to manage sidebar state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Check if dark mode is active on initial load
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const mainNavItems = [
    { label: 'Dashboard', icon: <Home className="w-5 h-5" />, path: '/' },
    { label: 'Projects', icon: <LayoutDashboard className="w-5 h-5" />, path: '/projects' },
    { label: 'Schedule', icon: <Calendar className="w-5 h-5" />, path: '/schedule' },
    { label: 'Team', icon: <Users className="w-5 h-5" />, path: '/team' },
    { label: 'Materials', icon: <Package className="w-5 h-5" />, path: '/materials', badge: { text: 'New', color: 'green' } },
    { label: 'Documents', icon: <FileText className="w-5 h-5" />, path: '/documents' },
  ];

  const bottomNavItems = [
    { label: 'Messages', icon: <MessageSquare className="w-5 h-5" />, path: '/messages', badge: { text: '5', color: 'blue' } },
    { label: 'UI Components', icon: <Layers className="w-5 h-5" />, path: '/ui-components', badge: { text: 'New', color: 'purple' } },
    { label: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/settings' },
    { label: 'Help', icon: <HelpCircle className="w-5 h-5" />, path: '/help' },
  ];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleSidebarCompact = () => setSidebarCompact(!sidebarCompact);

  const closeSidebar = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Sample notifications
  const notifications = [
    { id: 1, title: 'New team member', message: 'Sarah Jones joined the project', time: '2 min ago', read: false },
    { id: 2, title: 'Project update', message: 'Riverside project deadline extended', time: '1 hour ago', read: false },
    { id: 3, title: 'Task completed', message: 'Foundation inspection passed', time: '3 hours ago', read: true },
  ];

  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'dark bg-slate-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={cn(
        "sticky top-0 z-30 transition-all duration-300 border-b",
        scrolled 
          ? `${isDarkMode ? 'bg-slate-900/90 border-slate-700/50' : 'bg-white/90 border-gray-200'} backdrop-blur-md shadow-sm` 
          : `${isDarkMode ? 'bg-transparent border-slate-800' : 'bg-transparent border-transparent'}`
      )}>
        <div className="h-16 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              className={cn(
                "lg:hidden p-2 rounded-full hover:bg-opacity-90 transition-colors",
                isDarkMode ? 'text-white hover:bg-slate-800' : 'text-gray-700 hover:bg-gray-100'
              )}
              onClick={toggleSidebar}
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/" className="flex items-center transition-transform hover:scale-102">
              <img 
                src="/buildease-logo-1.svg" 
                alt="BuildEase" 
                className="h-10 w-auto" 
              />
            </Link>
          </div>

          <div className={cn(
            "hidden md:flex items-center relative max-w-md w-full mx-4 transition-all duration-300",
            searchFocused ? "max-w-xl" : "max-w-md"
          )}>
            <div className={cn(
              "absolute inset-y-0 left-0 flex items-center pl-3",
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            )}>
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search projects, tasks, documents..."
              className={cn(
                "pl-10 pr-4 py-2 w-full rounded-full border focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all",
                isDarkMode 
                  ? 'bg-slate-800/70 border-slate-700 text-white placeholder:text-gray-400 focus:ring-blue-500/30 focus:border-blue-600/50' 
                  : 'bg-gray-100/80 border-gray-200 focus:ring-blue-500/40 focus:border-blue-300'
              )}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "rounded-full relative hidden sm:flex", 
                isDarkMode ? 'text-gray-300 hover:bg-slate-800' : 'text-gray-700 hover:bg-gray-100'
              )}
              onClick={toggleDarkMode}
            >
              {isDarkMode 
                ? <Sun className="w-5 h-5 transition-transform duration-300 hover:rotate-45" /> 
                : <Moon className="w-5 h-5 transition-transform duration-300 hover:-rotate-45" />
              }
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "rounded-full relative",
                isDarkMode ? 'text-gray-300 hover:bg-slate-800' : 'text-gray-700 hover:bg-gray-100'
              )}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
            </Button>

            {/* Notifications panel */}
            <AnimatePresence>
              {showNotifications && (
                <>
                  <m.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "absolute right-2 top-16 w-80 z-50 p-4 rounded-lg shadow-lg border",
                      isDarkMode 
                        ? "bg-slate-800 border-slate-700" 
                        : "bg-white border-gray-200"
                    )}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className={cn(
                        "font-medium",
                        isDarkMode ? "text-white" : "text-gray-900"
                      )}>
                        Notifications
                      </h3>
                      <button className={cn(
                        "text-xs",
                        isDarkMode ? "text-blue-400" : "text-blue-600"
                      )}>
                        Mark all as read
                      </button>
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={cn(
                            "p-3 rounded-lg transition-colors relative",
                            notification.read 
                              ? isDarkMode ? "bg-slate-800" : "bg-white" 
                              : isDarkMode ? "bg-slate-700" : "bg-blue-50",
                            isDarkMode ? "hover:bg-slate-700" : "hover:bg-gray-50"
                          )}
                        >
                          {!notification.read && (
                            <span className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                          <h4 className={cn(
                            "font-medium text-sm mb-1",
                            isDarkMode ? "text-white" : "text-gray-900"
                          )}>
                            {notification.title}
                          </h4>
                          <p className={cn(
                            "text-xs mb-1",
                            isDarkMode ? "text-gray-300" : "text-gray-600"
                          )}>
                            {notification.message}
                          </p>
                          <span className={cn(
                            "text-xs",
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          )}>
                            {notification.time}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 pt-2 border-t text-center">
                      <button className={cn(
                        "text-sm",
                        isDarkMode ? "text-blue-400 border-slate-700" : "text-blue-600 border-gray-200"
                      )}>
                        View all notifications
                      </button>
                    </div>
                  </m.div>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  />
                </>
              )}
            </AnimatePresence>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn(
                  "flex items-center space-x-2 p-1.5 rounded-full transition-colors",
                  isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'
                )}>
                  <Avatar className="h-8 w-8 border border-gray-200">
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" />
                    <AvatarFallback className="bg-primary/10 text-primary">JD</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={cn(
                "w-56",
                isDarkMode && "bg-slate-800 border-slate-700 text-gray-100"
              )}>
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>John Doe</span>
                    <span className={isDarkMode ? "text-xs text-gray-400" : "text-xs text-gray-500"}>Project Manager</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className={isDarkMode && "bg-slate-700"} />
                <DropdownMenuItem className={isDarkMode && "hover:bg-slate-700"}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className={isDarkMode && "hover:bg-slate-700"}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className={isDarkMode && "bg-slate-700"} />
                <DropdownMenuItem className={cn(
                  "text-red-600",
                  isDarkMode && "text-red-400 hover:bg-slate-700"
                )}>
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
        <TooltipProvider>
          <aside className={cn(
            "h-full fixed lg:relative lg:translate-x-0 transition-all duration-300 z-40 border-r",
            isDarkMode 
              ? "bg-slate-900 border-slate-800" 
              : "bg-white border-gray-200",
            sidebarOpen ? "translate-x-0 shadow-lg" : "-translate-x-full lg:translate-x-0",
            sidebarCompact ? "lg:w-20" : "lg:w-64 xl:w-72"
          )}>
            {/* Mobile sidebar header */}
            <div className={cn(
              "flex justify-between items-center lg:hidden p-4 border-b",
              isDarkMode && "border-slate-800"
            )}>
              <h2 className={cn("font-medium", isDarkMode && "text-white")}>Navigation</h2>
              <button 
                className={cn(
                  "p-2 rounded-full transition-colors",
                  isDarkMode 
                    ? "text-gray-300 hover:bg-slate-800" 
                    : "text-gray-700 hover:bg-gray-100"
                )}
                onClick={toggleSidebar}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sidebar content */}
            <div className="py-4 flex flex-col h-[calc(100%-64px)] lg:h-full justify-between">
              <div className="space-y-1 px-2">
                {/* Sidebar collapse button (desktop only) */}
                <div className="hidden lg:flex justify-end px-3 mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 w-8 p-0 rounded-full",
                      isDarkMode ? "text-gray-400 hover:bg-slate-800" : "text-gray-500 hover:bg-gray-100"
                    )}
                    onClick={toggleSidebarCompact}
                  >
                    <ChevronRight className={cn(
                      "h-5 w-5 transition-transform duration-200",
                      sidebarCompact ? "rotate-180" : ""
                    )} />
                  </Button>
                </div>
                
                <p className={cn(
                  "text-xs font-semibold uppercase tracking-wider mb-4 pl-3",
                  isDarkMode ? "text-gray-400" : "text-gray-500",
                  sidebarCompact && "lg:text-center lg:pl-0"
                )}>
                  {!sidebarCompact ? "Main" : ""}
                </p>
                
                <nav className="space-y-6">
                  <div className="space-y-1.5">
                    {mainNavItems.map((item, index) => (
                      <m.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Tooltip key={item.label} delayDuration={300}>
                          <TooltipTrigger asChild>
                            <button
                              className={cn(
                                "w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all group",
                                isActive(item.path) 
                                  ? isDarkMode
                                    ? "bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-md"
                                    : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                                  : isDarkMode
                                    ? "text-gray-300 hover:bg-slate-800"
                                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                                sidebarCompact && "lg:justify-center lg:px-0"
                              )}
                              onClick={() => {
                                navigate(item.path);
                                closeSidebar();
                              }}
                            >
                              <span className={cn(
                                "flex items-center justify-center transition-transform group-hover:scale-110",
                                isActive(item.path) 
                                  ? "text-white" 
                                  : isDarkMode ? "text-gray-400" : "text-gray-500"
                              )}>
                                {item.icon}
                              </span>
                              {(!sidebarCompact || window.innerWidth < 1024) && (
                                <span>{item.label}</span>
                              )}
                              
                              {/* Badge for some navigation items */}
                              {item.badge && !sidebarCompact && (
                                <Badge 
                                  className={cn(
                                    "ml-auto text-xs",
                                    `bg-${item.badge.color}-500 hover:bg-${item.badge.color}-600`
                                  )}
                                >
                                  {item.badge.text}
                                </Badge>
                              )}
                            </button>
                          </TooltipTrigger>
                          {sidebarCompact && (
                            <TooltipContent side="right" className={isDarkMode ? "bg-slate-800 text-white border-slate-700" : ""}>
                              <div className="flex items-center">
                                {item.label}
                                {item.badge && (
                                  <Badge 
                                    className={cn(
                                      "ml-2 text-xs",
                                      `bg-${item.badge.color}-500`
                                    )}
                                  >
                                    {item.badge.text}
                                  </Badge>
                                )}
                              </div>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </m.div>
                    ))}
                  </div>
                </nav>
              </div>

              <div className="space-y-4 px-2 mt-4">
                {/* Team quick access section */}
                {!sidebarCompact && (
                  <div className={cn(
                    "space-y-3 p-4 rounded-lg mx-2", 
                    isDarkMode ? "bg-slate-800" : "bg-gray-50"
                  )}>
                    <div className="flex justify-between items-center">
                      <p className={cn(
                        "text-xs font-semibold", 
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      )}>
                        TEAM MEMBERS
                      </p>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 rounded-full"
                      >
                        <PlusCircle className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="flex -space-x-2 overflow-hidden">
                      <Avatar className="border-2 inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900">
                        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" />
                      </Avatar>
                      <Avatar className="border-2 inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900">
                        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" />
                      </Avatar>
                      <Avatar className="border-2 inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900">
                        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Emily" />
                      </Avatar>
                      <Avatar className="border-2 inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900">
                        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=David" />
                      </Avatar>
                      <div className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-medium ring-2 ring-white dark:ring-slate-900",
                        isDarkMode ? "bg-slate-700 text-white border-slate-600" : "bg-gray-200 text-gray-800 border-white"
                      )}>
                        +3
                      </div>
                    </div>
                  </div>
                )}

                {/* Settings section */}
                <div>
                  <p className={cn(
                    "text-xs font-semibold uppercase tracking-wider mb-4 px-3",
                    isDarkMode ? "text-gray-400" : "text-gray-500",
                    sidebarCompact && "lg:text-center lg:pl-0"
                  )}>
                    {!sidebarCompact ? "Settings" : ""}
                  </p>
                  <nav className="space-y-6">
                    <div className="space-y-1.5">
                      {bottomNavItems.map((item, index) => (
                        <m.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <Tooltip key={item.label} delayDuration={300}>
                            <TooltipTrigger asChild>
                              <button
                                className={cn(
                                  "w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all group",
                                  isActive(item.path) 
                                    ? isDarkMode
                                      ? "bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-md"
                                      : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                                    : isDarkMode
                                      ? "text-gray-300 hover:bg-slate-800"
                                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                                  sidebarCompact && "lg:justify-center lg:px-0"
                                )}
                                onClick={() => {
                                  navigate(item.path);
                                  closeSidebar();
                                }}
                              >
                                <span className={cn(
                                  "flex items-center justify-center transition-transform group-hover:scale-110",
                                  isActive(item.path) 
                                    ? "text-white" 
                                    : isDarkMode ? "text-gray-400" : "text-gray-500"
                                )}>
                                  {item.icon}
                                </span>
                                {(!sidebarCompact || window.innerWidth < 1024) && (
                                  <span>{item.label}</span>
                                )}
                                
                                {/* Badge for some navigation items */}
                                {item.badge && !sidebarCompact && (
                                  <Badge 
                                    className={cn(
                                      "ml-auto text-xs",
                                      `bg-${item.badge.color}-500 hover:bg-${item.badge.color}-600`
                                    )}
                                  >
                                    {item.badge.text}
                                  </Badge>
                                )}
                              </button>
                            </TooltipTrigger>
                            {sidebarCompact && (
                              <TooltipContent side="right" className={isDarkMode ? "bg-slate-800 text-white border-slate-700" : ""}>
                                <div className="flex items-center">
                                  {item.label}
                                  {item.badge && (
                                    <Badge 
                                      className={cn(
                                        "ml-2 text-xs",
                                        `bg-${item.badge.color}-500`
                                      )}
                                    >
                                      {item.badge.text}
                                    </Badge>
                                  )}
                                </div>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </m.div>
                      ))}
                    </div>

                    <m.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <button
                            className={cn(
                              "w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all hover:bg-red-50 text-red-500 group",
                              isDarkMode && "text-red-400 hover:bg-slate-800",
                              sidebarCompact && "lg:justify-center lg:px-0"
                            )}
                          >
                            <span className="flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-12">
                              <LogOut className="w-5 h-5" />
                            </span>
                            {(!sidebarCompact || window.innerWidth < 1024) && (
                              <span>Log out</span>
                            )}
                          </button>
                        </TooltipTrigger>
                        {sidebarCompact && (
                          <TooltipContent side="right" className={isDarkMode ? "bg-slate-800 text-white border-slate-700" : ""}>
                            Log out
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </m.div>
                  </nav>
                </div>
              </div>
            </div>
          </aside>
        </TooltipProvider>

        {/* Main content */}
        <main className={cn(
          "flex-1 overflow-auto transition-colors relative flex flex-col",
          isDarkMode && "bg-slate-900 text-white"
        )}>
          <m.div 
            className="flex-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Outlet />
          </m.div>
          <Footer variant="minimal" />
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <m.div
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