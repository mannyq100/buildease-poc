import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronRight, 
  ChevronLeft,
  LayoutDashboard,
  Briefcase,
  Calendar,
  Package,
  DollarSign,
  Users,
  FileText,
  Settings,
  Building,
  ListTodo,
  HardHat
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface NavItemProps {
  label: string;
  path: string;
  icon: React.ReactNode;
  isActive: boolean;
  notificationCount?: number;
  badge?: {
    text: string;
    color: string;
  };
  isCollapsed: boolean;
  onClick: () => void;
  children?: NavItemProps[];
  isNested?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  label,
  path,
  icon,
  isActive,
  badge,
  notificationCount,
  isCollapsed,
  onClick,
  children,
  isNested = false,
  isOpen = false,
  onToggle
}) => {
  const hasChildren = children && children.length > 0;
  
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div className={cn("relative", isNested && "ml-4")}>
            <m.div
              className={cn(
                "flex items-center px-3 py-2 rounded-md cursor-pointer my-1 transition-colors",
                isActive ? "bg-[#1E3A8A]/10 text-[#1E3A8A] dark:bg-[#1E3A8A]/20 dark:text-blue-400" : 
                "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800/60",
              )}
              whileTap={{ scale: 0.97 }}
              onClick={hasChildren ? onToggle : onClick}
            >
              <span className="flex-shrink-0">
                {icon}
              </span>
              
              {!isCollapsed && (
                <>
                  <span className="ml-3 text-sm font-medium transition-opacity duration-200 whitespace-nowrap">
                    {label}
                  </span>
                  
                  {badge && (
                    <Badge className={cn(
                      "ml-auto text-xs",
                      `bg-${badge.color}-600 text-white`
                    )}>
                      {badge.text}
                    </Badge>
                  )}
                  
                  {notificationCount && (
                    <Badge className="ml-auto bg-red-500 text-white text-xs">
                      {notificationCount}
                    </Badge>
                  )}
                  
                  {hasChildren && (
                    <ChevronRight 
                      className={cn(
                        "ml-auto h-4 w-4 transition-transform",
                        isOpen && "transform rotate-90"
                      )} 
                    />
                  )}
                </>
              )}
              
              {isCollapsed && (notificationCount || badge) && (
                <span className="absolute top-0 right-0 flex h-2 w-2 rounded-full bg-red-500"></span>
              )}
            </m.div>
          </div>
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side="right" className="flex items-center gap-1">
            {label}
            {badge && (
              <Badge className={cn(
                "text-xs",
                `bg-${badge.color}-600 text-white`
              )}>
                {badge.text}
              </Badge>
            )}
            {notificationCount && (
              <Badge className="bg-red-500 text-white text-xs">
                {notificationCount}
              </Badge>
            )}
          </TooltipContent>
        )}
      </Tooltip>
      
      {hasChildren && !isCollapsed && (
        <AnimatePresence>
          {isOpen && (
            <m.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="ml-4 pl-2 border-l border-gray-200 dark:border-slate-700"
            >
              {children.map((child, index) => (
                <NavItem
                  key={index}
                  {...child}
                  isCollapsed={isCollapsed}
                  isNested={true}
                />
              ))}
            </m.div>
          )}
        </AnimatePresence>
      )}
    </TooltipProvider>
  );
};

interface SidebarProps {
  className?: string;
  defaultCollapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  className,
  defaultCollapsed = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'projects': true
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    // Check if we're on mobile and close the sidebar when navigation happens
    const isMobile = window.innerWidth < 768;
    if (isMobile && isMobileOpen) {
      setIsMobileOpen(false);
    }
    
    // Check dark mode
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
  }, [location.pathname, isMobileOpen]);
  
  // Check screen size on initial render and window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Check on initial render
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };
  
  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };
  
  // Navigation structure with grouping
  const navigationGroups = [
    {
      title: 'Main',
      items: [
        { 
          label: 'Dashboard', 
          path: '/dashboard', 
          icon: <LayoutDashboard className="w-5 h-5" />,
          isActive: isActive('/dashboard'),
          onClick: () => navigate('/dashboard')
        }
      ]
    },
    {
      title: 'Project Management',
      items: [
        { 
          label: 'Projects', 
          path: '/projects', 
          icon: <Briefcase className="w-5 h-5" />,
          badge: {
            text: '4',
            color: 'blue'
          },
          isActive: isActive('/projects') || isActive('/project/'),
          onClick: () => navigate('/projects'),
          isOpen: expandedGroups['projects'],
          onToggle: () => toggleGroup('projects'),
          children: [
            {
              label: 'All Projects',
              path: '/projects',
              icon: <Building className="w-4 h-4" />,
              isActive: location.pathname === '/projects',
              onClick: () => navigate('/projects')
            },
            {
              label: 'Create Project',
              path: '/create-project',
              icon: <ListTodo className="w-4 h-4" />,
              isActive: location.pathname === '/create-project',
              onClick: () => navigate('/create-project')
            }
          ]
        },
        { 
          label: 'Schedule', 
          path: '/schedule', 
          icon: <Calendar className="w-5 h-5" />,
          isActive: isActive('/schedule'),
          onClick: () => navigate('/schedule')
        }
      ]
    },
    {
      title: 'Resources',
      items: [
        { 
          label: 'Materials', 
          path: '/materials', 
          icon: <Package className="w-5 h-5" />,
          isActive: isActive('/materials'),
          onClick: () => navigate('/materials')
        },
        { 
          label: 'Expenses', 
          path: '/expenses', 
          icon: <DollarSign className="w-5 h-5" />,
          isActive: isActive('/expenses'),
          onClick: () => navigate('/expenses')
        }
      ]
    },
    {
      title: 'Team & Documentation',
      items: [
        { 
          label: 'Team', 
          path: '/team', 
          icon: <Users className="w-5 h-5" />,
          isActive: isActive('/team'),
          onClick: () => navigate('/team')
        },
        { 
          label: 'Documents', 
          path: '/documents', 
          icon: <FileText className="w-5 h-5" />,
          notificationCount: 3,
          isActive: isActive('/documents'),
          onClick: () => navigate('/documents')
        }
      ]
    },
    {
      title: 'System',
      items: [
        { 
          label: 'Settings', 
          path: '/settings', 
          icon: <Settings className="w-5 h-5" />,
          isActive: isActive('/settings'),
          onClick: () => navigate('/settings')
        }
      ]
    }
  ];
  
  const sidebarWidth = isCollapsed ? 'w-16' : 'w-64';
  
  // Sidebar for desktop
  const DesktopSidebar = (
    <m.aside
      className={cn(
        "fixed top-0 left-0 z-40 h-screen transition-all duration-300",
        isCollapsed ? "w-[70px]" : "w-[240px]",
        className
      )}
      initial={{ x: -240 }}
      animate={{ x: 0 }}
      exit={{ x: -240 }}
      transition={{ duration: 0.2 }}
    >
      <div className={cn(
        "h-full bg-white dark:bg-slate-800 shadow-md flex flex-col",
        "border-r border-gray-200 dark:border-gray-700"
      )}>
        
        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between h-16 border-b border-gray-200 dark:border-gray-700">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <HardHat className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <span className="font-bold text-lg text-gray-900 dark:text-white">Buildese</span>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto p-0 h-8 w-8 rounded-full"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>
        
        {/* Sidebar Content */}
        <ScrollArea className="flex-1 overflow-auto">
          <div className="px-3 py-4">
            {navigationGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="mb-4">
                {!isCollapsed && (
                  <div className="px-3 mb-1">
                    <h3 className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">
                      {group.title}
                    </h3>
                    <Separator className="my-1 bg-gray-200 dark:bg-slate-700" />
                  </div>
                )}
                
                {isCollapsed && groupIndex > 0 && (
                  <Separator className="my-2 bg-gray-200 dark:bg-slate-700" />
                )}
                
                {group.items.map((item, itemIndex) => (
                  <NavItem
                    key={itemIndex}
                    {...item}
                    isCollapsed={isCollapsed}
                    onClick={item.onClick}
                  />
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </m.aside>
  );
  
  // Mobile sidebar (overlay)
  const MobileSidebar = (
    <AnimatePresence>
      {isMobileOpen && (
        <m.div
          className="fixed inset-0 bg-black/50 z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </AnimatePresence>
  );
  
  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {/* Desktop Sidebar */}
        <m.aside
          className={cn(
            "fixed top-0 left-0 z-40 h-screen transition-all duration-300",
            isCollapsed ? "w-[70px]" : "w-[240px]",
            className
          )}
          initial={{ x: -240 }}
          animate={{ x: 0 }}
          exit={{ x: -240 }}
          transition={{ duration: 0.2 }}
        >
          <div className={cn(
            "h-full bg-white dark:bg-slate-800 shadow-md flex flex-col",
            "border-r border-gray-200 dark:border-gray-700"
          )}>
            
            {/* Sidebar Header */}
            <div className="p-4 flex items-center justify-between h-16 border-b border-gray-200 dark:border-gray-700">
              {!isCollapsed && (
                <div className="flex items-center space-x-2">
                  <HardHat className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <span className="font-bold text-lg text-gray-900 dark:text-white">Buildese</span>
                </div>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto p-0 h-8 w-8 rounded-full"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )}
              </Button>
            </div>
            
            {/* Sidebar Content */}
            <ScrollArea className="flex-1 overflow-auto">
              <div className="px-3 py-4">
                {navigationGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="mb-4">
                    {!isCollapsed && (
                      <div className="px-3 mb-1">
                        <h3 className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">
                          {group.title}
                        </h3>
                        <Separator className="my-1 bg-gray-200 dark:bg-slate-700" />
                      </div>
                    )}
                    
                    {isCollapsed && groupIndex > 0 && (
                      <Separator className="my-2 bg-gray-200 dark:bg-slate-700" />
                    )}
                    
                    {group.items.map((item, itemIndex) => (
                      <NavItem
                        key={itemIndex}
                        {...item}
                        isCollapsed={isCollapsed}
                        onClick={item.onClick}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </m.aside>
        
        {/* Mobile Overlay */}
        {isMobileOpen && (
          <m.div
            className="fixed inset-0 bg-black/50 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>
    </LazyMotion>
  );
};

export default Sidebar; 