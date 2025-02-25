import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';

export interface NavItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
  badge?: {
    text: string;
    color: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo';
  };
}

interface HorizontalNavProps {
  items: NavItem[];
  variant?: 'default' | 'tabs' | 'pills' | 'minimal' | 'underlined' | 'glass' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  itemClassName?: string;
  showIcons?: boolean;
  showTooltips?: boolean;
  animated?: boolean;
}

export const HorizontalNav: React.FC<HorizontalNavProps> = ({
  items,
  variant = 'default',
  size = 'md',
  className,
  itemClassName,
  showIcons = true,
  showTooltips = false,
  animated = true
}) => {
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Use useEffect for dark mode detection
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

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const sizeClasses = {
    sm: 'text-xs py-1.5 px-2',
    md: 'text-sm py-2 px-3',
    lg: 'text-base py-2.5 px-4',
  };

  const variants = {
    default: {
      nav: "bg-transparent",
      item: (active: boolean) => cn(
        sizeClasses[size],
        "font-medium rounded-md transition-all duration-200 flex items-center gap-2",
        active 
          ? isDarkMode 
            ? "bg-slate-800 text-white" 
            : "bg-gray-100 text-gray-900"
          : isDarkMode 
            ? "text-gray-400 hover:text-white hover:bg-slate-800" 
            : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
      ),
      indicator: "bg-blue-500"
    },
    tabs: {
      nav: isDarkMode ? "bg-slate-800/70 p-1.5 rounded-lg shadow-md backdrop-blur-sm" : "bg-gray-100/80 p-1.5 rounded-lg shadow-sm backdrop-blur-sm",
      item: (active: boolean) => cn(
        sizeClasses[size],
        "font-medium rounded-md transition-all duration-300 flex items-center gap-2",
        active 
          ? isDarkMode 
            ? "bg-blue-600/20 text-white shadow-sm border border-blue-500/30" 
            : "bg-white text-blue-600 shadow-sm border border-blue-100"
          : isDarkMode 
            ? "text-gray-300 hover:text-white hover:bg-slate-700/50" 
            : "text-gray-600 hover:text-blue-600 hover:bg-white/60"
      ),
      indicator: "bg-blue-500"
    },
    pills: {
      nav: "bg-transparent",
      item: (active: boolean) => cn(
        sizeClasses[size],
        "font-medium rounded-full transition-all duration-300 flex items-center gap-2",
        active 
          ? isDarkMode 
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md" 
            : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
          : isDarkMode 
            ? "text-gray-300 hover:text-white hover:bg-slate-800/60" 
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
      ),
      indicator: "bg-transparent"
    },
    minimal: {
      nav: "bg-transparent",
      item: (active: boolean) => cn(
        sizeClasses[size],
        "font-medium transition-all duration-300 flex items-center gap-2",
        active 
          ? isDarkMode 
            ? "text-blue-400" 
            : "text-blue-600"
          : isDarkMode 
            ? "text-gray-400 hover:text-white" 
            : "text-gray-500 hover:text-gray-900"
      ),
      indicator: "bg-blue-500"
    },
    underlined: {
      nav: "bg-transparent",
      item: (active: boolean) => cn(
        sizeClasses[size],
        "font-medium border-b-2 transition-all duration-300 flex items-center gap-2 rounded-none",
        active 
          ? isDarkMode 
            ? "border-blue-500 text-white" 
            : "border-blue-600 text-gray-900"
          : isDarkMode 
            ? "border-transparent text-gray-400 hover:text-white hover:border-gray-600" 
            : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
      ),
      indicator: "bg-transparent"
    },
    glass: {
      nav: isDarkMode ? "bg-slate-800/30 backdrop-blur-md p-1.5 rounded-lg shadow-lg border border-slate-700/50" : "bg-white/30 backdrop-blur-md p-1.5 rounded-lg shadow-lg border border-gray-200/50",
      item: (active: boolean) => cn(
        sizeClasses[size],
        "font-medium rounded-md transition-all duration-300 flex items-center gap-2",
        active 
          ? isDarkMode 
            ? "bg-white/10 text-white shadow-sm border border-white/10" 
            : "bg-white/70 text-gray-900 shadow-sm border border-white/50"
          : isDarkMode 
            ? "text-gray-300 hover:text-white hover:bg-white/5" 
            : "text-gray-600 hover:text-gray-900 hover:bg-white/40"
      ),
      indicator: "bg-blue-500"
    },
    gradient: {
      nav: isDarkMode ? "bg-gradient-to-r from-slate-800/70 to-slate-900/70 backdrop-blur-sm p-1.5 rounded-lg shadow-md" : "bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm p-1.5 rounded-lg shadow-sm",
      item: (active: boolean) => cn(
        sizeClasses[size],
        "font-medium rounded-md transition-all duration-300 flex items-center gap-2",
        active 
          ? isDarkMode 
            ? "bg-gradient-to-r from-blue-600/30 to-indigo-600/30 text-white shadow-sm" 
            : "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm"
          : isDarkMode 
            ? "text-gray-300 hover:text-white hover:bg-white/5" 
            : "text-gray-600 hover:text-blue-700 hover:bg-white/60"
      ),
      indicator: "bg-gradient-to-r from-blue-500 to-indigo-500"
    }
  };

  return (
    <TooltipProvider>
      <motion.nav 
        className={cn(
          "flex items-center overflow-x-auto scrollbar-none relative",
          variants[variant].nav,
          className
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {items.map((item, index) => {
          const active = isActive(item.path);
          
          return (
            <Tooltip key={item.path} delayDuration={300}>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link
                    to={item.path}
                    className={cn(
                      variants[variant].item(active),
                      itemClassName,
                      "relative group"
                    )}
                  >
                    {showIcons && item.icon && (
                      <motion.span 
                        className={cn(
                          "flex items-center justify-center",
                          "transition-all duration-300 group-hover:scale-110",
                          active 
                            ? isDarkMode ? "text-blue-400" : "text-blue-600"
                            : isDarkMode ? "text-gray-400" : "text-gray-500"
                        )}
                        whileHover={{ rotate: [0, -10, 10, -5, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        {item.icon}
                      </motion.span>
                    )}
                    
                    <span>{item.label}</span>
                    
                    {item.badge && (
                      <Badge 
                        className={cn(
                          "ml-1 text-xs",
                          `bg-${item.badge.color}-500 hover:bg-${item.badge.color}-600`
                        )}
                      >
                        {item.badge.text}
                      </Badge>
                    )}
                    
                    {variant === 'underlined' && active && animated && (
                      <motion.div
                        className="absolute bottom-0 left-0 h-0.5 bg-blue-600 dark:bg-blue-500"
                        layoutId="activeTab"
                        style={{ width: '100%' }}
                      />
                    )}
                  </Link>
                </motion.div>
              </TooltipTrigger>
              {showTooltips && (
                <TooltipContent 
                  side="bottom" 
                  className={isDarkMode ? "bg-slate-800 text-white border-slate-700" : ""}
                >
                  {item.label}
                </TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </motion.nav>
    </TooltipProvider>
  );
}; 